import path from "node:path";

/** Tipos admitidos por la biblioteca de medios públicos del panel. */
export const PUBLIC_MEDIA_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  // M4V usa el contenedor ISO-BMFF de MP4. Finder/Safari suelen reportarlo
  // como video/x-m4v o application/octet-stream.
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

export const PUBLIC_MEDIA_MIMES = new Set(Object.values(PUBLIC_MEDIA_MIME_BY_EXTENSION));

/** Decodifica exactamente la capa que Express/el navegador resuelve al servir. */
export function decodePublicMediaReferencePathname(value: unknown): string | null {
  const raw = typeof value === "string" ? value.split(/[?#]/, 1)[0] : "";
  if (!raw || /%(?:2f|5c)/i.test(raw)) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (/[\\\u0000-\u001f\u007f]/.test(decoded)) return null;
    // Rechaza doble codificación: el nombre comprobado debe coincidir con el
    // que la capa HTTP resolverá realmente.
    if (decodeURIComponent(decoded) !== decoded) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function publicMediaMimeForReference(value: unknown): string | null {
  const pathname = decodePublicMediaReferencePathname(value);
  if (!pathname) return null;
  return PUBLIC_MEDIA_MIME_BY_EXTENSION[path.extname(pathname).toLowerCase()] || null;
}

const FALLBACK_BROWSER_MIMES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
  "video/x-m4v",
  "video/m4v",
]);

/**
 * El MIME del selector de archivos no es fiable en todos los navegadores de
 * escritorio. Sólo se infiere cuando el navegador declara no conocerlo (o
 * para alias conocidos de M4V). La firma y el decoder validan los bytes en
 * cuarentena antes de aceptar el medio.
 */
export function normalizePublicMediaMime(originalName: string, reportedMime: string): string | null {
  const mime = reportedMime.trim().toLowerCase();
  if (PUBLIC_MEDIA_MIMES.has(mime)) return mime;
  if (!FALLBACK_BROWSER_MIMES.has(mime)) return null;

  const extension = path.extname(originalName || "").toLowerCase();
  return PUBLIC_MEDIA_MIME_BY_EXTENSION[extension] || null;
}
