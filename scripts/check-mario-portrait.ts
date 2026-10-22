import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import sharp from "sharp";
import manifest from "../shared/cms-media-manifest.json";
import { MARIO_PORTRAIT_FILE, MARIO_PORTRAIT_URL, teamPhotoOwner } from "../shared/marioPortrait";
import { getTeamPhotoSrcSet, getTeamPhotoThumb } from "../client/src/lib/teamPhotoSources";
import { teamMembersData } from "../server/seed";

const assets = manifest.filter(a => a.url.startsWith(`/team_photos/${MARIO_PORTRAIT_FILE}`));
assert.equal(assets.length, 4);
for (const asset of assets) {
  const bytes = await fs.readFile(asset.source);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
  assert.equal(bytes.length, asset.bytes);
  const size = asset.url.endsWith(".png") ? 652 : Number(asset.url.match(/-(\d+)\.webp$/)![1]);
  const image = sharp(bytes);
  const metadata = await image.metadata();
  assert.equal(metadata.width, size);
  assert.equal(metadata.height, size);
  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let colorPixels = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 20) colorPixels++;
  }
  assert.ok(colorPixels > size * size * 0.2, "El retrato debe conservar el color");
}
assert.match(getTeamPhotoSrcSet(MARIO_PORTRAIT_URL)!, /-color-360\.webp 360w/);
const original = assets.find(a => a.url === MARIO_PORTRAIT_URL)!;
assert.match(getTeamPhotoSrcSet(`/media/${original.key}`)!, /-color-652\.webp 652w/);
assert.match(getTeamPhotoThumb(`/media/${original.key}`)!, /-color-128\.webp$/);
assert.match(getTeamPhotoThumb(MARIO_PORTRAIT_URL)!, /-color-128\.webp$/);
assert.equal(getTeamPhotoSrcSet("/uploads/custom.png"), undefined);
assert.equal(teamPhotoOwner(MARIO_PORTRAIT_FILE), "mario-saucedo-rodriguez");
const person = teamMembersData.find(m => m.slug === "mario-saucedo-rodriguez")!;
assert.equal(person.imageUrl, MARIO_PORTRAIT_URL);
assert.equal(person.showOnHome, true);
assert.match(person.titleEs, /Socio fundador \(in memoriam\)/);
console.log("Retrato a color: fuentes, variantes, integridad, tamaños, miniaturas y semilla correctos.");
