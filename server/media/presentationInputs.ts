import { Client } from "@replit/object-storage";
import fs from "node:fs/promises";
import path from "node:path";
import { persistentMediaIsRequired } from "./persistentMedia";
const root = path.join(process.cwd(), "private_uploads", "presentation-inputs");
const valid = /^[a-f0-9]{32}\.[a-z0-9]{1,5}$/;
const objectRoot = "santos-saucedo/private/presentation-inputs";
function client() {
  const bucketId =
    process.env.REPLIT_APP_STORAGE_BUCKET_ID ||
    process.env.APP_STORAGE_BUCKET_ID;
  if (!bucketId)
    throw new Error(
      "Configure App Storage para conservar documentos privados.",
    );
  return new Client({ bucketId });
}
function configured() {
  return (
    persistentMediaIsRequired() ||
    !!(
      process.env.REPLIT_APP_STORAGE_BUCKET_ID ||
      process.env.APP_STORAGE_BUCKET_ID
    )
  );
}
/** Inputs stay private and durable across Replit replicas and deployments. */
export async function persistPresentationInput(absolutePath: string) {
  const name = path.basename(absolutePath);
  if (!valid.test(name) || path.resolve(absolutePath) !== path.join(root, name))
    throw new Error("Documento no admitido.");
  if (!configured()) return;
  const saved = await client().uploadFromFilename(
    `${objectRoot}/${name}`,
    absolutePath,
    { compress: false },
  );
  if (!saved.ok)
    throw new Error("No se pudo conservar el documento en App Storage.");
}
export async function hydratePresentationInput(
  reference: string,
): Promise<string> {
  const name = reference.replace(/^private:presentations\//, "");
  if (!valid.test(name) || reference !== `private:presentations/${name}`)
    throw new Error("Documento no admitido.");
  const absolute = path.join(root, name);
  if (configured()) {
    await fs.mkdir(root, { recursive: true, mode: 0o700 });
    const result = await client().downloadToFilename(
      `${objectRoot}/${name}`,
      absolute,
      { decompress: false },
    );
    if (!result.ok)
      throw new Error("No se pudo recuperar el documento privado.");
    await fs.chmod(absolute, 0o600);
  } else await fs.access(absolute);
  return absolute;
}
