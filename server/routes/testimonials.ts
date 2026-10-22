import type { Express, Request, RequestHandler, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, editorialDb } from "../db";
import {
  testimonials,
  testimonialInvites,
  TESTIMONIAL_QUOTE_MAX,
  SUPPORTED_LANGUAGES,
  type Testimonial,
  type TestimonialInvite,
} from "@shared/schema";
import { authMiddleware } from "../auth";
import { isReadOnlyAdmin } from "@shared/adminAccess";
import { recordAccessEvent } from "../cms/accessAudit";
import { getCmsIntegrations } from "../cms/siteConfig";

// Testimonios de clientes (junta 16-10-2026, Mario y Gabriel): el cliente escribe su comentario
// desde un enlace de un solo uso que genera el despacho; nada se publica sin aprobación.
// Solo el administrador principal (super_admin) aprueba, vuelve a mostrar o borra.

const INVITE_DAYS = 30;
export const TESTIMONIAL_WRITE_PATH = "/testimonios/escribir";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token, "utf8").digest("hex");

// Texto plano: sin etiquetas ni caracteres de control; una línea para nombre, puesto y empresa
const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "");
const oneLine = (max: number) =>
  z
    .string()
    .transform((v) => stripTags(v).replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));
const paragraph = z
  .string()
  .transform((v) =>
    stripTags(v)
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  )
  .pipe(z.string().min(20).max(TESTIMONIAL_QUOTE_MAX));

const languageCodes = SUPPORTED_LANGUAGES.map((l) => l.code) as [string, ...string[]];

const publicSubmitSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{40,64}$/),
  fullName: oneLine(160).pipe(z.string().min(3)),
  title: oneLine(160).pipe(z.string().min(2)),
  company: oneLine(160).pipe(z.string().min(2)),
  quote: paragraph,
  showCompany: z.boolean().default(false),
  consent: z.literal(true),
  language: z.enum(languageCodes).optional().catch(undefined),
});

const panelFields = {
  authorName: oneLine(160).pipe(z.string().min(3)),
  authorTitle: oneLine(160),
  authorCompany: oneLine(160),
  quote: paragraph,
  showCompany: z.boolean(),
};
// Captura en el panel (comentario recibido por correo o en persona): el despacho confirma que
// tiene la autorización por escrito; entra como pendiente, igual que los del enlace
const panelCreateSchema = z.object({
  ...panelFields,
  authorTitle: panelFields.authorTitle.optional(),
  authorCompany: panelFields.authorCompany.optional(),
  showCompany: panelFields.showCompany.default(false),
  consentConfirmed: z.literal(true),
});
const panelEditSchema = z
  .object({ ...panelFields, order: z.number().int().min(0).max(10000) })
  .partial()
  .strict();
const inviteCreateSchema = z
  .object({
    clientName: oneLine(160).optional(),
    clientEmail: z
      .string()
      .trim()
      .max(254)
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Correo inválido.")
      .optional(),
  })
  .strict();

const isAdmin = (req: Request) => req.adminUser?.role === "super_admin";
const actorName = (req: Request) => req.adminUser?.username || req.adminUser?.email || "";

// Lo público: sin datos internos; la empresa solo si el cliente autorizó mostrarla
export function toPublicTestimonial(t: Testimonial) {
  return {
    id: t.id,
    quote: t.quote,
    authorName: t.authorName,
    authorTitle: t.authorTitle || "",
    company: t.showCompany && t.authorCompany ? t.authorCompany : "",
  };
}

function inviteState(invite: TestimonialInvite, now = new Date()) {
  if (invite.usedAt) return "used";
  if (invite.revokedAt) return "revoked";
  if (invite.expiresAt <= now) return "expired";
  return "active";
}

async function siteOrigin(req: Request) {
  // En desarrollo, el enlace apunta al servidor local para poder probarlo
  if (process.env.NODE_ENV !== "production") {
    const host = req.get("host");
    if (host) return `${req.protocol}://${host}`;
  }
  const configured = (process.env.PUBLIC_SITE_URL || "").trim();
  if (/^https:\/\//.test(configured)) return configured.replace(/\/+$/, "");
  try {
    return (await getCmsIntegrations()).siteUrl.replace(/\/+$/, "");
  } catch {
    return "https://santos-saucedo.replit.app";
  }
}

export function registerTestimonials(
  app: Express,
  submitGuard: RequestHandler,
  allowInviteCheck: (req: Request) => boolean,
) {
  // ---------- Público ----------
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const rows = await db
        .select()
        .from(testimonials)
        .where(and(eq(testimonials.status, "approved"), eq(testimonials.published, true)))
        .orderBy(asc(testimonials.order), desc(testimonials.approvedAt));
      res.setHeader("Cache-Control", "no-store");
      res.json(rows.map(toPublicTestimonial));
    } catch (error) {
      console.error("[Testimonials] Read failed", (error as Error).message);
      res.status(503).json({ error: "No se pudieron cargar los testimonios." });
    }
  });

  // ¿El enlace sigue vigente? Solo responde sí o no; no revela a quién se envió
  app.get("/api/testimonials/invite", async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!allowInviteCheck(req))
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    const token = typeof req.query.t === "string" ? req.query.t : "";
    if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return res.json({ valid: false });
    try {
      const [invite] = await db
        .select({ id: testimonialInvites.id })
        .from(testimonialInvites)
        .where(
          and(
            eq(testimonialInvites.tokenHash, hashToken(token)),
            isNull(testimonialInvites.usedAt),
            isNull(testimonialInvites.revokedAt),
            gt(testimonialInvites.expiresAt, new Date()),
          ),
        );
      res.json({ valid: !!invite });
    } catch {
      res.status(503).json({ error: "No disponible." });
    }
  });

  app.post("/api/testimonials/submit", submitGuard, async (req, res) => {
    const parsed = publicSubmitSchema.safeParse(req.body ?? {});
    if (!parsed.success)
      return res.status(400).json({
        error: "Validation failed",
        fields: Array.from(new Set(parsed.error.issues.map((i) => String(i.path[0])))),
      });
    const data = parsed.data;
    try {
      // Consumo atómico: el UPDATE solo toma una invitación vigente y sin usar; dos envíos
      // simultáneos con el mismo enlace no pueden pasar los dos
      const created = await editorialDb.transaction(async (tx) => {
        const [invite] = await tx
          .update(testimonialInvites)
          .set({ usedAt: new Date() })
          .where(
            and(
              eq(testimonialInvites.tokenHash, hashToken(data.token)),
              isNull(testimonialInvites.usedAt),
              isNull(testimonialInvites.revokedAt),
              gt(testimonialInvites.expiresAt, new Date()),
            ),
          )
          .returning({ id: testimonialInvites.id });
        if (!invite) return null;
        const [row] = await tx
          .insert(testimonials)
          .values({
            quote: data.quote,
            authorName: data.fullName,
            authorTitle: data.title,
            authorCompany: data.company,
            showCompany: data.showCompany,
            language: data.language ?? null,
            origin: "invite",
            inviteId: invite.id,
            status: "pending",
            published: false,
            consentAt: new Date(),
          })
          .returning({ id: testimonials.id });
        await tx
          .update(testimonialInvites)
          .set({ testimonialId: row.id })
          .where(eq(testimonialInvites.id, invite.id));
        return row;
      });
      if (!created) return res.status(410).json({ error: "INVITE_INVALID" });
      console.log(`[Testimonials] New submission ${created.id} (pending)`);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("[Testimonials] Submit failed", (error as Error).message);
      res.status(503).json({ error: "No se pudo guardar el comentario." });
    }
  });

  // ---------- Panel ----------
  // authMiddleware aplica el permiso "content" (adminPermissionForPath); las cuentas de solo
  // consulta no ven estos datos personales
  const panel = [
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.adminUser || isReadOnlyAdmin(req.adminUser))
        return res.status(403).json({ error: "Su cuenta no tiene permiso para esta acción." });
      next();
    },
  ];
  const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!isAdmin(req))
      return res
        .status(403)
        .json({ error: "Solo el administrador principal puede aprobar, volver a publicar o borrar testimonios." });
    next();
  };

  app.get("/api/admin/testimonials", ...panel, async (_req, res) => {
    try {
      const rows = await db
        .select()
        .from(testimonials)
        .orderBy(asc(testimonials.order), desc(testimonials.createdAt));
      res.json(rows);
    } catch {
      res.status(503).json({ error: "No se pudieron cargar los testimonios." });
    }
  });

  app.get("/api/admin/testimonials/invites", ...panel, async (_req, res) => {
    try {
      const rows = await db
        .select()
        .from(testimonialInvites)
        .orderBy(desc(testimonialInvites.createdAt))
        .limit(200);
      const now = new Date();
      res.json(
        rows.map(({ tokenHash: _hash, ...invite }) => ({ ...invite, state: inviteState(invite as TestimonialInvite, now) })),
      );
    } catch {
      res.status(503).json({ error: "No se pudieron cargar las invitaciones." });
    }
  });

  app.post("/api/admin/testimonials/invites", ...panel, async (req, res) => {
    const parsed = inviteCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: "Revise el nombre y el correo." });
    try {
      // 32 bytes aleatorios; en la base solo queda su hash
      const token = crypto.randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
      const [invite] = await db
        .insert(testimonialInvites)
        .values({
          tokenHash: hashToken(token),
          clientName: parsed.data.clientName || null,
          clientEmail: parsed.data.clientEmail?.toLowerCase() || null,
          createdBy: req.adminUser!.id,
          createdByName: actorName(req),
          expiresAt,
        })
        .returning();
      const url = `${await siteOrigin(req)}${TESTIMONIAL_WRITE_PATH}?t=${token}`;
      const { tokenHash: _hash, ...safe } = invite;
      res.status(201).json({ invite: { ...safe, state: "active" }, url });
    } catch {
      res.status(503).json({ error: "No se pudo crear la invitación." });
    }
  });

  app.post("/api/admin/testimonials/invites/:id/revoke", ...panel, async (req, res) => {
    try {
      const [row] = await db
        .update(testimonialInvites)
        .set({ revokedAt: new Date() })
        .where(and(eq(testimonialInvites.id, req.params.id), isNull(testimonialInvites.usedAt), isNull(testimonialInvites.revokedAt)))
        .returning({ id: testimonialInvites.id });
      if (!row) return res.status(409).json({ error: "La invitación ya se usó o ya estaba anulada." });
      res.json({ success: true });
    } catch {
      res.status(503).json({ error: "No se pudo anular la invitación." });
    }
  });

  app.post("/api/admin/testimonials", ...panel, async (req, res) => {
    const parsed = panelCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success)
      return res.status(400).json({ error: "Revise nombre, comentario (20 a 1200 caracteres) y la confirmación de la autorización." });
    const { consentConfirmed: _c, ...data } = parsed.data;
    try {
      const [row] = await db
        .insert(testimonials)
        .values({
          ...data,
          authorTitle: data.authorTitle || null,
          authorCompany: data.authorCompany || null,
          origin: "panel",
          status: "pending",
          published: false,
          consentAt: new Date(),
          updatedAt: new Date(),
          reviewedByName: actorName(req),
        })
        .returning();
      res.status(201).json(row);
    } catch {
      res.status(503).json({ error: "No se pudo guardar el testimonio." });
    }
  });

  // Ordena los aprobados: el orden de la lista recibida
  app.post("/api/admin/testimonials/reorder", ...panel, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.string().max(64)).min(1).max(500) }).safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: "Orden inválido." });
    try {
      await editorialDb.transaction(async (tx) => {
        const ids = parsed.data.ids;
        for (let index = 0; index < ids.length; index++)
          await tx.update(testimonials).set({ order: index }).where(eq(testimonials.id, ids[index]));
      });
      res.json({ success: true });
    } catch {
      res.status(503).json({ error: "No se pudo guardar el orden." });
    }
  });

  // Corrección de erratas. Un testimonio ya aprobado solo lo edita el administrador principal:
  // así nadie cambia un texto publicado sin su visto bueno
  app.put("/api/admin/testimonials/:id", ...panel, async (req, res) => {
    const parsed = panelEditSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: "Revise los campos (comentario de 20 a 1200 caracteres)." });
    try {
      const [current] = await db.select().from(testimonials).where(eq(testimonials.id, req.params.id));
      if (!current) return res.status(404).json({ error: "Testimonio no encontrado." });
      const changesText = Object.keys(parsed.data).some((k) => k !== "order");
      if (current.status === "approved" && changesText && !isAdmin(req))
        return res.status(403).json({ error: "Solo el administrador principal puede editar un testimonio aprobado." });
      const [row] = await db
        .update(testimonials)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(testimonials.id, req.params.id))
        .returning();
      res.json(row);
    } catch {
      res.status(503).json({ error: "No se pudo guardar el testimonio." });
    }
  });

  // Aprobar, rechazar o regresar a pendiente: solo el administrador principal. Se registra quién
  // aprobó y cuándo
  app.post("/api/admin/testimonials/:id/status", ...panel, adminOnly, async (req, res) => {
    const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: "Estado inválido." });
    const status = parsed.data.status;
    const now = new Date();
    try {
      const [row] = await db
        .update(testimonials)
        .set({
          status,
          published: status === "approved",
          reviewedByName: actorName(req),
          reviewedAt: now,
          updatedAt: now,
          ...(status === "approved"
            ? {
                approvedBy: req.adminUser!.id,
                approvedByName: actorName(req),
                approvedAt: now,
                // Nuevo aprobado: al final de la lista pública
                order: sql`(SELECT COALESCE(MAX("order"), 0) + 1 FROM testimonials WHERE status = 'approved')`,
              }
            : { approvedBy: null, approvedByName: null, approvedAt: null }),
        })
        .where(eq(testimonials.id, req.params.id))
        .returning();
      if (!row) return res.status(404).json({ error: "Testimonio no encontrado." });
      await recordAccessEvent(`testimonial_${status}`, req.adminUser!.id);
      res.json(row);
    } catch (error) {
      console.error("[Testimonials] Status failed", (error as Error).message);
      res.status(503).json({ error: "No se pudo cambiar el estado." });
    }
  });

  // Ocultar lo puede hacer cualquier editor (reduce lo publicado); volver a mostrar, solo el
  // administrador principal
  app.post("/api/admin/testimonials/:id/visibility", ...panel, async (req, res) => {
    const parsed = z.object({ published: z.boolean() }).safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: "Valor inválido." });
    if (parsed.data.published && !isAdmin(req))
      return res.status(403).json({ error: "Solo el administrador principal puede volver a publicar un testimonio." });
    try {
      const [row] = await db
        .update(testimonials)
        .set({ published: parsed.data.published, updatedAt: new Date(), reviewedByName: actorName(req), reviewedAt: new Date() })
        .where(and(eq(testimonials.id, req.params.id), eq(testimonials.status, "approved")))
        .returning();
      if (!row) return res.status(409).json({ error: "Solo se puede ocultar o mostrar un testimonio aprobado." });
      res.json(row);
    } catch {
      res.status(503).json({ error: "No se pudo cambiar la visibilidad." });
    }
  });

  // Borrado definitivo (p. ej., si el cliente retira su autorización)
  app.delete("/api/admin/testimonials/:id", ...panel, adminOnly, async (req, res) => {
    try {
      const [row] = await db.delete(testimonials).where(eq(testimonials.id, req.params.id)).returning({ id: testimonials.id });
      if (!row) return res.status(404).json({ error: "Testimonio no encontrado." });
      await recordAccessEvent("testimonial_deleted", req.adminUser!.id);
      res.json({ success: true });
    } catch {
      res.status(503).json({ error: "No se pudo borrar el testimonio." });
    }
  });
}
