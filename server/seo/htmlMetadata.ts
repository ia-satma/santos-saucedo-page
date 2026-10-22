import { getCmsIntegrations } from "../cms/siteConfig";
import { storage } from "../storage";
import { isPublicNews } from "@shared/publicNews";

// Dominio de las etiquetas del index.html; injectSiteMetadata lo cambia por el siteUrl del CMS.
const SITE = "https://www.santossaucedo.com";
// Tarjeta de marca (1200×630, logotipo oficial sobre Azul Profundo) para notas sin imagen propia.
export const NEWS_SHARE_IMAGE = "/og/monitor-laboral.jpg";

type RouteMetadata = {
  title: string;
  documentTitle: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  brandImage: boolean;
};

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Texto llano para la descripción: sin HTML ni marcas de Markdown, en una sola línea.
function plainText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/(^|\n)\s*(#{1,6}|[-*]|>)\s+/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(value: string, max: number) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trim()}…`;
}

function absoluteUrl(value: string) {
  if (/^https:\/\//i.test(value)) return value;
  return `${SITE}${value.startsWith("/") ? "" : "/"}${value}`;
}

/**
 * Vista previa al pegar el enlace de una nota del Monitor en WhatsApp, correo o LinkedIn: esos
 * lectores no ejecutan JavaScript, así que el título, la descripción y la imagen de la nota
 * tienen que venir ya en el HTML que entrega el servidor. Solo notas públicas (publicadas y en
 * fecha); borradores y programadas conservan las etiquetas generales del sitio.
 */
async function routeMetadata(pathname: string): Promise<RouteMetadata | undefined> {
  const match = /^\/news\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(pathname);
  if (!match) return;
  const item = await storage.getNewsBySlug(match[1]);
  if (!item || !isPublicNews(item)) return;
  const title = plainText(item.titleEs || item.title);
  const description = clip(
    plainText(item.excerptEs || item.excerpt) || plainText(item.contentEs || item.content),
    200,
  );
  const ownImage = item.imageUrl && !/placeholder/i.test(item.imageUrl) ? item.imageUrl : "";
  return {
    title,
    documentTitle: `${title} | Monitor Laboral`,
    description: description || "Monitor Laboral de Santos & Saucedo.",
    url: `${SITE}/news/${item.slug}`,
    image: absoluteUrl(ownImage || NEWS_SHARE_IMAGE),
    imageAlt: ownImage ? title : "Santos & Saucedo · Monitor Laboral",
    brandImage: !ownImage,
  };
}

function setMeta(html: string, attr: "name" | "property", key: string, value: string) {
  const pattern = new RegExp(`<meta\\s+${attr}=["']${key.replace(/[:.]/g, "\\$&")}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}</head>`);
}

function applyRouteMetadata(html: string, meta: RouteMetadata) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(meta.documentTitle)}</title>`);
  out = setMeta(out, "name", "description", meta.description);
  out = setMeta(out, "property", "og:title", meta.title);
  out = setMeta(out, "property", "og:description", meta.description);
  out = setMeta(out, "property", "og:type", "article");
  out = setMeta(out, "property", "og:url", meta.url);
  out = setMeta(out, "property", "og:image", meta.image);
  out = setMeta(out, "property", "og:image:alt", meta.imageAlt);
  if (meta.brandImage) {
    out = setMeta(out, "property", "og:image:width", "1200");
    out = setMeta(out, "property", "og:image:height", "630");
  }
  out = setMeta(out, "name", "twitter:card", "summary_large_image");
  out = setMeta(out, "name", "twitter:title", meta.title);
  out = setMeta(out, "name", "twitter:description", meta.description);
  out = setMeta(out, "name", "twitter:image", meta.image);
  return out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeAttr(meta.url)}" />`);
}

export async function injectSiteMetadata(html: string, requestUrl?: string) {
  const settings = await getCmsIntegrations();
  if (requestUrl) {
    try {
      const pathname = new URL(requestUrl, SITE).pathname;
      const meta = await routeMetadata(pathname);
      if (meta) html = applyRouteMetadata(html, meta);
    } catch (error) {
      // Sin base o con un slug raro, la página sale con las etiquetas generales
      console.error("[seo] route metadata skipped:", (error as Error).message);
    }
  }
  // A validated token is emitted in the original HTML so Search Console can verify without JavaScript.
  const token = settings.searchConsole.verification;
  const tag = token
    ? `<meta name="google-site-verification" content="${token}">`
    : "";
  return html
    .split("https://www.santossaucedo.com")
    .join(settings.siteUrl.replace(/\/$/, ""))
    .replace(/<meta\s+name=["']google-site-verification["'][^>]*>/gi, "")
    .replace("</head>", `${tag}</head>`);
}
