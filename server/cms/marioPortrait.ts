import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db, editorialDb } from "../db";
import { mediaItems, siteConfig, teamMembers } from "@shared/schema";
import bundled from "@shared/cms-media-manifest.json";
import { MARIO_PORTRAIT_FILE, MARIO_PORTRAIT_SLUG, MARIO_PORTRAIT_URL } from "@shared/marioPortrait";
import { uploadAppStorageObject, downloadAppStorageObject, storageBucketId } from "../replitStorage";

const migrationKey = "infrastructure.mario-color-portrait";

// One-time content migration: verify persistent bytes first, then change only
// Mario's image/home flag. Future editor choices and all other people are preserved.
export async function syncMarioPortrait() {
  const [done] = await db.select().from(siteConfig).where(eq(siteConfig.key, migrationKey));
  if (done) return;
  const [person] = await db.select().from(teamMembers).where(eq(teamMembers.slug, MARIO_PORTRAIT_SLUG));
  if (!person) return;
  const assets = bundled.filter(asset => asset.url.startsWith(`/team_photos/${MARIO_PORTRAIT_FILE}`));
  if (assets.length !== 4) throw new Error("Faltan variantes del retrato a color de Mario.");
  const persistent = Boolean(storageBucketId());
  if (!persistent && (process.env.REPL_ID || process.env.NODE_ENV === "production")) {
    throw new Error("El retrato requiere almacenamiento persistente.");
  }
  for (const asset of assets) {
    const bytes = await fs.readFile(asset.source);
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) {
      throw new Error(`El retrato no coincide con el manifiesto: ${asset.url}`);
    }
    if (persistent) {
      await uploadAppStorageObject(asset.key, bytes);
      if (!(await downloadAppStorageObject(asset.key))?.equals(bytes)) {
        throw new Error(`No se pudo verificar el retrato persistente: ${asset.url}`);
      }
    }
  }
  const original = assets.find(asset => asset.url === MARIO_PORTRAIT_URL)!;
  await editorialDb.transaction(async tx => {
    const claimed = await tx.insert(siteConfig).values({
      key: migrationKey, type: "json", category: "infrastructure", value: '{"complete":true}',
    }).onConflictDoNothing().returning();
    if (!claimed.length) return;
    const unchanged = (field: "imageUrl" | "showOnHome") => person[field] == null
      ? isNull(teamMembers[field]) : eq(teamMembers[field], person[field] as never);
    const changed = await tx.update(teamMembers).set({
      imageUrl: persistent ? `/media/${original.key}` : original.url,
      showOnHome: true,
    }).where(and(eq(teamMembers.id, person.id), unchanged("imageUrl"), unchanged("showOnHome"))).returning();
    if (!changed.length) throw new Error("La ficha de Mario cambió durante la actualización; vuelva a intentarlo.");
    if (persistent) {
      for (const asset of assets) {
        const mediaPath = `/media/${asset.key}`;
        const [existing] = await tx.select().from(mediaItems).where(eq(mediaItems.path, mediaPath));
        if (!existing) await tx.insert(mediaItems).values({
          filename: asset.key.split("/").pop()!, originalName: asset.source.split("/").pop()!,
          path: mediaPath, mimeType: asset.url.endsWith(".png") ? "image/png" : "image/webp",
          size: asset.bytes, alt: person.name, altEs: person.name,
        });
      }
    }
  });
}
