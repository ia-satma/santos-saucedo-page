import type { Express } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { eq, inArray, sql } from "drizzle-orm";
import { editorialDb } from "../db";
import { news, newsTeamMembers, teamMembers } from "@shared/schema";
import { authMiddleware, requireRole } from "../auth";
const mediaUrl = z
  .string()
  .max(2048)
  .refine(
    (v) => !v || /^https:\/\//.test(v) || /^\/(?!\/)/.test(v),
    "Use una URL HTTPS o un archivo de la biblioteca.",
  );
export const newsEditorSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    titleEs: z.string().trim().min(1).max(300),
    slug: z
      .string()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().max(5000),
    excerptEs: z.string().max(5000),
    content: z.string().max(200000).nullable().optional(),
    contentEs: z.string().max(200000).nullable().optional(),
    imageUrl: mediaUrl.nullable().optional(),
    documentUrl: mediaUrl.nullable().optional(),
    documentUrlEs: mediaUrl.nullable().optional(),
    sourceUrl: z
      .string()
      .url()
      .startsWith("https://")
      .max(2048)
      .or(z.literal(""))
      .nullable()
      .optional(),
    category: z.enum(["press", "insights", "rankings", "events", "alerts"]),
    categoryEs: z.string().max(100),
    published: z.boolean(),
    featuredHome: z.boolean().optional(),
    date: z.coerce.date().nullable().optional(),
    publishAt: z.coerce.date().nullable().optional(),
    tags: z.array(z.string().trim().min(2).max(60)).max(12).optional(),
    memberIds: z.array(z.string().uuid()).max(100).optional(),
    revision: z.string().length(64).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.published && (!value.excerpt.trim() || !value.excerptEs.trim()))
      ctx.addIssue({
        code: "custom",
        path: ["excerpt"],
        message: "Complete el extracto en español e inglés antes de publicar.",
      });
    if (
      value.memberIds &&
      new Set(value.memberIds).size !== value.memberIds.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["memberIds"],
        message: "No repita profesionales.",
      });
  });
const fingerprint = (item: unknown, ids: string[]) =>
  createHash("sha256")
    .update(JSON.stringify({ item, ids: [...ids].sort() }))
    .digest("hex");
export function registerNewsEditor(app: Express) {
  app.get(
    "/api/admin/editor/news/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      try {
        const [item] = await editorialDb
          .select()
          .from(news)
          .where(eq(news.id, req.params.id));
        if (!item)
          return res.status(404).json({ error: "Publicación no encontrada." });
        const relations = await editorialDb
          .select()
          .from(newsTeamMembers)
          .where(eq(newsTeamMembers.newsId, item.id));
        const memberIds = relations.map((r) => r.teamMemberId);
        res.set("Cache-Control", "private, no-store");
        res.json({ item, memberIds, revision: fingerprint(item, memberIds) });
      } catch {
        res.status(503).json({ error: "No se pudo abrir la publicación." });
      }
    },
  );
  const save = (create: boolean) => async (req: any, res: any) => {
    const parsed = newsEditorSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error: "Revise los campos de la publicación.",
          details: parsed.error.errors,
        });
    try {
      const result = await editorialDb.transaction(async (tx) => {
        const { memberIds, revision, ...data } = parsed.data;
        const [before] = create
          ? []
          : await tx
              .select()
              .from(news)
              .where(eq(news.id, req.params.id))
              .for("update");
        if (!create && !before)
          return { status: 404, error: "Publicación no encontrada." };
        if (before && revision) {
          const oldIds = (
            await tx
              .select()
              .from(newsTeamMembers)
              .where(eq(newsTeamMembers.newsId, before.id))
          ).map((r) => r.teamMemberId);
          if (revision !== fingerprint(before, oldIds))
            return {
              status: 409,
              error:
                "La publicación cambió en otra sesión. Recargue antes de guardar.",
            };
        }
        if (memberIds?.length) {
          const people = await tx
            .select({ id: teamMembers.id })
            .from(teamMembers)
            .where(inArray(teamMembers.id, memberIds));
          if (people.length !== memberIds.length)
            return {
              status: 400,
              error: "Hay un profesional que ya no existe.",
            };
        }
        const [item] = create
          ? await tx
              .insert(news)
              .values({ ...data, processingStatus: "ready" })
              .returning()
          : await tx
              .update(news)
              .set(data)
              .where(eq(news.id, req.params.id))
              .returning();
        if (memberIds !== undefined) {
          await tx
            .delete(newsTeamMembers)
            .where(eq(newsTeamMembers.newsId, item.id));
          if (memberIds.length)
            await tx
              .insert(newsTeamMembers)
              .values(
                memberIds.map((teamMemberId) => ({
                  newsId: item.id,
                  teamMemberId,
                })),
              );
        }
        const ids = (
          await tx
            .select()
            .from(newsTeamMembers)
            .where(eq(newsTeamMembers.newsId, item.id))
        ).map((r) => r.teamMemberId);
        return { item, memberIds: ids, revision: fingerprint(item, ids) };
      });
      if ("error" in result)
        return res.status(result.status).json({ error: result.error });
      console.log(
        "[AUDIT]",
        JSON.stringify({
          action: create ? "create" : "update",
          resource: "news",
          resourceId: result.item.id,
          userId: req.adminUser.id,
        }),
      );
      res.status(create ? 201 : 200).json(result);
    } catch (error: any) {
      if (error.code === "23505" || error.cause?.code === "23505")
        return res
          .status(409)
          .json({
            error:
              "Ya existe una publicación con esa dirección. Cambie el identificador para conservar ambas.",
          });
      res
        .status(503)
        .json({
          error:
            "No se pudo guardar la publicación. No se aplicó un cambio parcial.",
        });
    }
  };
  app.post(
    "/api/admin/editor/news",
    authMiddleware,
    requireRole("editor", "admin"),
    save(true),
  );
  app.put(
    "/api/admin/editor/news/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    save(false),
  );
}
