import "dotenv/config";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "../server/db";
import { mediaItems, news } from "../shared/schema";
import bundled from "../shared/cms-media-manifest.json";
import { HOME_MONITOR_IMAGES } from "../shared/monitorEditorial";
import { uploadAppStorageObject, downloadAppStorageObject, verifyAppStorage } from "../server/replitStorage";

// Explicit development content setup only, never run automatically at startup.
async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Este comando solo prepara imágenes y contenido en desarrollo.");
  }
  await verifyAppStorage();
  const prepared: { slug: string; path: string }[] = [];
  // Verify all files in persistent storage before updating any article references.
  for (const [slug, source] of Object.entries(HOME_MONITOR_IMAGES)) {
    const asset = bundled.find(entry => entry.url === source);
    if (!asset) throw new Error(`Falta la imagen editorial: ${source}`);
    const bytes = await fs.readFile(asset.source);
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) {
      throw new Error(`La imagen no coincide con el manifiesto: ${source}`);
    }
    await uploadAppStorageObject(asset.key, bytes);
    const stored = await downloadAppStorageObject(asset.key);
    if (!stored?.equals(bytes)) throw new Error(`No se pudo verificar: ${source}`);
    const path = `/media/${asset.key}`;
    prepared.push({ slug, path });
    const [registered] = await db.select({ id: mediaItems.id }).from(mediaItems).where(eq(mediaItems.path, path));
    if (!registered) await db.insert(mediaItems).values({
      filename: asset.key.split("/").pop()!,
      originalName: asset.source.split("/").pop()!,
      path, mimeType: "image/webp", size: asset.bytes,
      width: 1024, height: 1024,
      alt: `Editorial illustration — ${slug}`,
      altEs: `Imagen editorial ilustrativa — ${slug}`,
    });
    console.log(`Imagen persistente verificada: ${slug}`);
  }
  for (const item of prepared) {
    const changed = await db.update(news).set({ imageUrl: item.path }).where(
      and(eq(news.slug, item.slug), or(isNull(news.imageUrl), eq(news.imageUrl, ""))),
    ).returning({ slug: news.slug });
    console.log(`${item.slug}: ${changed.length ? "imagen asociada" : "se conserva la selección existente"}`);
  }
}

main().then(() => process.exit(0)).catch(error => {
  console.error("[MonitorMedia]", error.message);
  process.exit(1);
});
