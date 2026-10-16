import type { Express } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth";
import { db } from "../db";
import { contactSubmissions, newsletterSubscribers } from "@shared/schema";
import {
  buildNewsletterUnsubscribeUrl,
  verifyNewsletterUnsubscribeToken,
} from "../security/newsletterUnsubscribe";
import { recordAccessEvent } from "../cms/accessAudit";
const uuid = z.string().uuid();
export function csvCell(value: unknown) {
  let text = String(value ?? "").replace(
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,
    "",
  );
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function registerSubmissionManagement(app: Express) {
  app.patch(
    "/api/admin/contact-submissions/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const id = uuid.safeParse(req.params.id),
        body = z.object({ read: z.boolean() }).strict().safeParse(req.body);
      if (!id.success || !body.success)
        return res
          .status(400)
          .json({ error: "Revise el mensaje y su estado." });
      try {
        const [row] = await db
          .update(contactSubmissions)
          .set(body.data)
          .where(eq(contactSubmissions.id, id.data))
          .returning({
            id: contactSubmissions.id,
            read: contactSubmissions.read,
          });
        if (!row)
          return res.status(404).json({ error: "Mensaje no encontrado." });
        res.json(row);
      } catch {
        res.status(503).json({ error: "No se pudo actualizar el mensaje." });
      }
    },
  );
  app.patch(
    "/api/admin/newsletter-subscribers/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const id = uuid.safeParse(req.params.id),
        body = z.object({ isActive: z.boolean() }).strict().safeParse(req.body);
      if (!id.success || !body.success)
        return res
          .status(400)
          .json({ error: "Revise el suscriptor y su estado." });
      try {
        const [row] = await db
          .update(newsletterSubscribers)
          .set({
            isActive: body.data.isActive,
            unsubscribedAt: body.data.isActive ? null : new Date(),
          })
          .where(eq(newsletterSubscribers.id, id.data))
          .returning();
        if (!row)
          return res.status(404).json({ error: "Suscripción no encontrada." });
        await recordAccessEvent("newsletter_state_changed", req.adminUser!.id);
        res.json(row);
      } catch {
        res
          .status(503)
          .json({ error: "No se pudo actualizar la suscripción." });
      }
    },
  );
  app.get(
    "/api/admin/newsletter-subscribers/export",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      try {
        const rows = await db.select().from(newsletterSubscribers);
        const origin =
          process.env.PUBLIC_SITE_URL || "https://santos-saucedo.replit.app";
        const table = [
          [
            "Correo",
            "Nombre",
            "Empresa",
            "Idioma",
            "Activa",
            "Fecha de alta",
            "Enlace de baja",
          ],
          ...rows.map((r) => [
            r.email,
            r.name,
            r.company,
            r.preferredLanguage,
            r.isActive ? "Sí" : "No",
            r.subscribedAt?.toISOString(),
            buildNewsletterUnsubscribeUrl(origin, r.id) || "",
          ]),
        ];
        res
          .set({
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="suscripciones-santos.csv"',
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          })
          .send(
            "\uFEFF" +
              table.map((row) => row.map(csvCell).join(",")).join("\r\n"),
          );
      } catch {
        res.status(503).json({ error: "No se pudo exportar la lista." });
      }
    },
  );
  // A GET from a mail scanner must never unsubscribe someone. The public page confirms via POST.
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    const id = verifyNewsletterUnsubscribeToken(req.body?.token);
    if (!id)
      return res.status(400).json({ error: "El enlace de baja no es válido." });
    try {
      await db
        .update(newsletterSubscribers)
        .set({ isActive: false, unsubscribedAt: new Date() })
        .where(eq(newsletterSubscribers.id, id));
      res.set("Cache-Control", "no-store").json({ success: true });
    } catch {
      res
        .status(503)
        .json({ error: "No se pudo completar la baja. Vuelva a intentarlo." });
    }
  });
}
