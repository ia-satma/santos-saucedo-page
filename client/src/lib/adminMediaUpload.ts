import { getAuthHeaders } from "./adminAuth";
import type { MediaItem } from "@shared/schema";
export async function uploadAdminMedia(file: File): Promise<MediaItem> {
  if (file.size > 50 * 1024 * 1024)
    throw new Error("El archivo supera el límite actual de 50 MB.");
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: getAuthHeaders(),
    body,
  });
  const saved = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      saved?.error ||
        (response.status === 413
          ? "El archivo supera el límite de carga."
          : "No se pudo cargar el archivo."),
    );
  return saved;
}
