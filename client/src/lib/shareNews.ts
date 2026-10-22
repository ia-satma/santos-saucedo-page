// Compartir una nota del Monitor Laboral con el enlace de la página de la firma (no el del
// medio citado). Lo usan la nota pública (/news/:slug) y el panel (/admin/news).

/** Enlace público y estable de la nota, sin consultas ni rutas de vista previa. */
export function newsShareUrl(slug: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${window.location.origin}${base}/news/${slug}`;
}

/** WhatsApp (wa.me): el titular y, en la línea siguiente, el enlace; la vista previa la da el servidor. */
export function whatsappShareHref(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}

/** Correo: asunto con el titular; el cuerpo con el extracto (si hay) y el enlace. */
export function emailShareHref(title: string, url: string, excerpt?: string | null): string {
  const body = [excerpt?.trim(), url].filter(Boolean).join("\n\n");
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

/** Copia al portapapeles; si el navegador no lo permite, usa un campo temporal. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Nombre del medio citado: el que escribió el editor o, si falta, el dominio del enlace. */
export function sourceLabel(sourceName: string | null | undefined, sourceUrl: string | null | undefined): string {
  if (sourceName?.trim()) return sourceName.trim();
  try {
    return new URL(String(sourceUrl)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
