import type { Express } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { mediaItems } from "@shared/schema";
import { authMiddleware, requireRole } from "../auth";
import fs from "node:fs/promises";
import path from "node:path";
import bundled from "@shared/cms-media-manifest.json";
import type { MediaItem } from "@shared/schema";
import { getBundledMediaMap } from "./bundledMediaMap";

// Include the approved bundled material in a fresh local database as well as
// uploaded objects. No duplicate upload or invented file is needed to reuse it.
export async function mediaInventory(): Promise<MediaItem[]> {
  const [rows, paths] = await Promise.all([
    db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt)),
    getBundledMediaMap(),
  ]);
  const known = new Set(rows.map((r: MediaItem) => r.path));
  const virtual = await Promise.all(
    bundled.map(async (asset): Promise<MediaItem | null> => {
      const target = paths[asset.url] ?? asset.url;
      if (known.has(target)) return null;
      if (!paths[asset.url]) {
        try {
          if (
            !(await fs.stat(path.resolve(process.cwd(), asset.source))).isFile()
          )
            return null;
        } catch {
          return null;
        }
      }
      const mime: Record<string, string> = {
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".mp4": "video/mp4",
      };
      return {
        id: `bundled-${asset.sha256.slice(0, 24)}`,
        filename: path.basename(asset.source),
        originalName: path.basename(asset.source),
        path: target,
        mimeType:
          mime[path.extname(asset.source)] ?? "application/octet-stream",
        size: asset.bytes,
        width: null,
        height: null,
        alt: null,
        altEs: null,
        uploadedBy: null,
        createdAt: null,
        archivedAt: null,
      } satisfies MediaItem;
    }),
  );
  return [
    ...rows.filter((r: MediaItem) => !r.archivedAt),
    ...virtual.filter((v): v is MediaItem => v !== null),
  ];
}
export async function persistentMediaItem(
  id: string,
): Promise<MediaItem | undefined> {
  const [existing] = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.id, id));
  if (existing) return existing;
  const bundledItem = (await mediaInventory()).find((item) => item.id === id);
  if (!bundledItem) return;
  await db
    .insert(mediaItems)
    .values(bundledItem)
    .onConflictDoNothing({ target: mediaItems.id });
  const [saved] = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.id, id));
  return saved;
}

export function registerMediaLibrary(app: Express) {
  app.patch(
    "/api/admin/media/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const parsed = z
        .object({
          alt: z.string().max(500).nullable().optional(),
          altEs: z.string().max(500).nullable().optional(),
          restore: z.literal(true).optional(),
        })
        .strict()
        .safeParse(req.body);
      if (!parsed.success)
        return res
          .status(400)
          .json({ error: "Revise los textos alternativos." });
      try {
        if (!(await persistentMediaItem(req.params.id)))
          return res.status(404).json({ error: "Archivo no encontrado." });
        const { restore, ...data } = parsed.data;
        const [item] = await db
          .update(mediaItems)
          .set({ ...data, ...(restore ? { archivedAt: null } : {}) })
          .where(eq(mediaItems.id, req.params.id))
          .returning();
        if (!item)
          return res.status(404).json({ error: "Archivo no encontrado." });
        res.json(item);
      } catch {
        res.status(503).json({ error: "No se pudo guardar el archivo." });
      }
    },
  );
  app.get(
    "/api/admin/media-archive",
    authMiddleware,
    requireRole("editor", "admin"),
    async (_req, res) => {
      try {
        res.set("Cache-Control", "private, no-store");
        res.json(
          (
            await db
              .select()
              .from(mediaItems)
              .orderBy(desc(mediaItems.createdAt))
          ).filter((m: any) => m.archivedAt),
        );
      } catch {
        res
          .status(503)
          .json({ error: "No se pudo cargar el archivo de la biblioteca." });
      }
    },
  );
}
