import path from "node:path";

export const PRESENTATION_IMAGE_DIR = path.join(process.cwd(), "private", "presentation-images");

export function privatePresentationImagePath(url?: string | null) {
  const filename = /^\/private-presentation-images\/([0-9a-f-]{36}\.png)$/.exec(url ?? "")?.[1];
  return filename ? path.join(PRESENTATION_IMAGE_DIR, filename) : null;
}
