import type { Express, Request, Response } from "express";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { desc, eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth";
import { db } from "../db";
import { appStorageObjectKeyFromPath, deleteAppStorageObject, downloadAppStorageObject, uploadAppStorageObject } from "../replitStorage";
import { emailSignatures } from "@shared/schema";
import { createSignatureGenerator, normalizeSignatureData, type SignatureData } from "@shared/signatureGenerator";

const dataSchema = z.object({
  name: z.string().max(500), role: z.string().max(500), phone: z.string().max(100), email: z.string().email().max(320),
  addr1: z.string().max(500), addr2: z.string().max(500), tagline: z.string().max(500), since: z.string().max(500),
  linkedin: z.string().max(500), facebook: z.string().max(500), web: z.string().max(500), instagram: z.string().max(500),
}).strict();
const payloadSchema = z.object({
  label: z.string().trim().min(1).max(120),
  templateId: z.string().regex(/^(0[1-9]|1[0-2])$/),
  data: dataSchema,
  photoUrl: z.string().trim().max(1000).nullable().optional(),
}).strict();

function validUrl(value: string) {
  if (!value) return true;
  return /^https?:\/\//i.test(value)
    || /^\/(?:media|signatures)\/[a-zA-Z0-9._~!$&'()*+,;=:@%/-]+$/.test(value)
    || /^[a-z0-9](?:[a-z0-9-]*\.)+[a-z]{2,}(?:[/?#][^\s<>]*)?$/i.test(value)
    || /^@[a-z0-9._-]+$/i.test(value);
}
function validPhoto(value: string) {
  return /^https?:\/\//i.test(value) || /^\/media\/[a-zA-Z0-9._~!$&'()*+,;=:@%/-]+$/.test(value);
}
function parsePayload(body: unknown) {
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return { error: "Revise el nombre, plantilla, datos y enlaces de la firma." } as const;
  const values = parsed.data;
  const urlFields: Array<keyof SignatureData> = ["linkedin", "facebook", "web", "instagram"];
  if (urlFields.some((key) => !validUrl(values.data[key]))) return { error: "Los enlaces deben usar http(s) o una ruta de medios del CMS." } as const;
  if (values.photoUrl && !validPhoto(values.photoUrl)) return { error: "La fotografía debe provenir de un recurso del CMS." } as const;
  return { values: { ...values, data: normalizeSignatureData(values.data), photoUrl: values.photoUrl || null } } as const;
}
function originFor(req: Request) {
  const configured = process.env.PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol).split(",")[0];
  return `${proto}://${req.get("host")}`;
}
function objectKey(id: string) { return `public/media/signature-${id}.html`; }
function dto(row: typeof emailSignatures.$inferSelect) {
  return { id: row.id, label: row.label, templateId: row.templateId, data: row.data, photoUrl: row.photoUrl, updatedAt: row.updatedAt, createdAt: row.createdAt, downloadUrl: `/api/admin/signatures/${row.id}/download` };
}
function sendError(res: Response, status: number, error: string) { return res.status(status).json({ error }); }

function cropKey(source: string, width: number, height: number) {
  const digest = createHash("sha256").update(`${source}|${width}x${height}`).digest("hex").slice(0, 24);
  return `public/media/signature-photo-${digest}.png`;
}

export function registerSignatureRoutes(app: Express) {
  const guard = [authMiddleware, requireRole("editor", "admin")] as const;
  app.get("/api/signature-photo", async (req, res) => {
    const source = typeof req.query.source === "string" ? req.query.source : "";
    const width = Number(req.query.width);
    const height = Number(req.query.height);
    if (!/^\/media\/public\/media\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(source)
      || !Number.isInteger(width) || !Number.isInteger(height)
      || width < 20 || width > 2000 || height < 20 || height > 2000) {
      return sendError(res, 400, "Parámetros de fotografía no válidos.");
    }
    const sourceKey = appStorageObjectKeyFromPath(source);
    if (!sourceKey) return sendError(res, 400, "La fotografía debe provenir de App Storage.");
    const key = cropKey(source, width, height);
    try {
      const cached = await downloadAppStorageObject(key);
      if (cached) {
        return res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" }).send(cached);
      }
      const original = await downloadAppStorageObject(sourceKey);
      if (!original) return sendError(res, 404, "La fotografía no está disponible.");
      const cropped = await sharp(original, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize(width * 2, height * 2, { fit: "cover", position: "attention" })
        .png()
        .toBuffer();
      await uploadAppStorageObject(key, cropped);
      return res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" }).send(cropped);
    } catch (error) {
      console.error("[Signatures] photo crop failed", error);
      return sendError(res, 503, "No se pudo preparar la fotografía.");
    }
  });
  app.get("/api/admin/signatures", ...guard, async (_req, res) => {
    const rows = await db.select().from(emailSignatures).orderBy(desc(emailSignatures.updatedAt));
    res.set("Cache-Control", "private, no-store").json(rows.map(dto));
  });
  app.get("/api/admin/signatures/:id", ...guard, async (req, res) => {
    const [row] = await db.select().from(emailSignatures).where(eq(emailSignatures.id, req.params.id)).limit(1);
    if (!row) return sendError(res, 404, "Firma no encontrada.");
    const generator = createSignatureGenerator({ assetsUrl: `${originFor(req)}/signatures/assets/`, data: row.data as Partial<SignatureData>, photo: row.photoUrl });
    res.set("Cache-Control", "private, no-store").json({ ...dto(row), document: generator.build(row.templateId), body: generator.body(row.templateId) });
  });
  app.post("/api/admin/signatures", ...guard, async (req, res) => {
    const parsed = parsePayload(req.body);
    if (parsed.error) return sendError(res, 400, parsed.error);
    const id = randomUUID();
    const html = createSignatureGenerator({ assetsUrl: `${originFor(req)}/signatures/assets/`, data: parsed.values.data, photo: parsed.values.photoUrl }).build(parsed.values.templateId);
    const key = objectKey(id);
    try {
      await uploadAppStorageObject(key, Buffer.from(html, "utf8"));
      const [row] = await db.insert(emailSignatures).values({ id, label: parsed.values.label, templateId: parsed.values.templateId, data: parsed.values.data, photoUrl: parsed.values.photoUrl, htmlObjectKey: key, createdBy: req.adminUser!.id, updatedBy: req.adminUser!.id }).returning();
      res.status(201).json(dto(row));
    } catch (error) {
      await deleteAppStorageObject(key).catch(() => undefined);
      console.error("[Signatures] create failed", error);
      return sendError(res, 503, "No se pudo guardar la firma en App Storage.");
    }
  });
  app.put("/api/admin/signatures/:id", ...guard, async (req, res) => {
    const parsed = parsePayload(req.body);
    if (parsed.error) return sendError(res, 400, parsed.error);
    const [existing] = await db.select().from(emailSignatures).where(eq(emailSignatures.id, req.params.id)).limit(1);
    if (!existing) return sendError(res, 404, "Firma no encontrada.");
    const html = createSignatureGenerator({ assetsUrl: `${originFor(req)}/signatures/assets/`, data: parsed.values.data, photo: parsed.values.photoUrl }).build(parsed.values.templateId);
    try {
      await uploadAppStorageObject(existing.htmlObjectKey, Buffer.from(html, "utf8"));
      const [row] = await db.update(emailSignatures).set({ label: parsed.values.label, templateId: parsed.values.templateId, data: parsed.values.data, photoUrl: parsed.values.photoUrl, updatedBy: req.adminUser!.id, updatedAt: new Date() }).where(eq(emailSignatures.id, req.params.id)).returning();
      res.json(dto(row));
    } catch (error) {
      console.error("[Signatures] update failed", error);
      return sendError(res, 503, "No se pudo actualizar la firma en App Storage.");
    }
  });
  app.delete("/api/admin/signatures/:id", ...guard, async (req, res) => {
    const [row] = await db.select().from(emailSignatures).where(eq(emailSignatures.id, req.params.id)).limit(1);
    if (!row) return sendError(res, 404, "Firma no encontrada.");
    try {
      await deleteAppStorageObject(row.htmlObjectKey);
      await db.delete(emailSignatures).where(eq(emailSignatures.id, req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("[Signatures] delete failed", error);
      return sendError(res, 503, "No se pudo eliminar la firma.");
    }
  });
  app.get("/api/admin/signatures/:id/download", ...guard, async (req, res) => {
    const [row] = await db.select().from(emailSignatures).where(eq(emailSignatures.id, req.params.id)).limit(1);
    if (!row) return sendError(res, 404, "Firma no encontrada.");
    const bytes = await downloadAppStorageObject(row.htmlObjectKey);
    if (!bytes) return sendError(res, 404, "El HTML guardado no está disponible.");
    const filename = `firma-${row.templateId}-${row.label.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || row.id}.html`;
    res.set({ "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" }).send(bytes);
  });
}
