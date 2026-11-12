import { getCmsIntegrations } from "../cms/siteConfig";
import { storage } from "../storage";
import { isPublicNews } from "@shared/publicNews";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";
import { readStaticCmsSection } from "../localization/staticSnapshots";
import cmsStaticSnapshot from "@shared/cms-static-snapshot.json";
import { fromSpanishRoute, publicRoute } from "@shared/publicRoutes";

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
  type?: "website" | "article";
  alternates?: Array<{ hreflang: string; url: string }>;
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
  const localeMatch = /^\/(es|en|de|zh|ko|ja|ar|ru|fr|it)(\/.*)?\/?$/.exec(pathname);
  const language = (localeMatch?.[1] || "es") as LanguageCode;
  const routeWithoutLocale = localeMatch?.[2] || pathname;
  const internalPath = language === "es" ? fromSpanishRoute(routeWithoutLocale) : routeWithoutLocale;
  const match = /^\/?news\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(internalPath.replace(/^\/+/, ""));
  if (match) {
    const item = await storage.getNewsBySlug(match[1]);
    if (!item || !isPublicNews(item)) return;
    const translation = language === "es" ? undefined : await storage.getNewsTranslation(item.id, language);
    const title = plainText(translation?.title || item.titleEs || item.title);
    const description = clip(
      plainText(translation?.excerpt || item.excerptEs || item.excerpt) || plainText(translation?.content || item.contentEs || item.content),
      200,
    );
    const ownImage = item.imageUrl && !/placeholder/i.test(item.imageUrl) ? item.imageUrl : "";
    return {
      title,
      documentTitle: title + " | " + (language === "es" ? "Monitor Laboral" : "Labor Monitor"),
      description: description || "Monitor Laboral de Santos & Saucedo.",
      url: SITE + "/" + language + publicRoute(language, "/news/" + item.slug),
      image: absoluteUrl(ownImage || NEWS_SHARE_IMAGE),
      imageAlt: ownImage ? title : "Santos & Saucedo · Monitor Laboral",
      brandImage: !ownImage,
      type: "article",
      alternates: localizedAlternates(`/news/${item.slug}`),
    };
  }

  const detailMatch = /^\/?(practice-groups|team)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(internalPath.replace(/^\/+/, ""));
  if (detailMatch) {
    const type = detailMatch[1];
    const slug = detailMatch[2];
    const item = type === "practice-groups"
      ? await storage.getPracticeGroupBySlug(slug)
      : await storage.getTeamMemberBySlug(slug);
    if (!item) return;
    const contentType = type === "practice-groups" ? "practice_group" : "team_member";
    const id = String(item.id);
    const readTranslation = async (field: string) => (language === "es" ? undefined : await storage.getTranslation(contentType, id, field, language));
    const translatedName = await readTranslation(type === "practice-groups" ? "name" : "name");
    const translatedDescription = await readTranslation(type === "practice-groups" ? "description" : "bio");
    const source = item as any;
    const title = plainText(translatedName?.translatedText || (language === "es" ? source.nameEs || source.name : source.name));
    const description = clip(plainText(translatedDescription?.translatedText || (language === "es" ? source.descriptionEs || source.bioEs || source.description || source.bio : source.description || source.bio)), 200);
    const route = `/${type}/${slug}`;
    const ownImage = source.imageUrl && !/placeholder/i.test(source.imageUrl) ? source.imageUrl : "";
    return {
      title,
      documentTitle: title + " | Santos & Saucedo",
      description,
      url: SITE + "/" + language + publicRoute(language, route),
      image: absoluteUrl(ownImage || NEWS_SHARE_IMAGE),
      imageAlt: title || "Santos & Saucedo",
      brandImage: !ownImage,
      type: "website",
      alternates: localizedAlternates(route),
    };
  }

  // The client updates these tags after hydration, but crawlers and link
  // unfurlers need the locale-specific canonical and hreflang tags in the
  // first HTML response as well. The CMS SEO snapshot already contains the
  // translated title and description for every public route.
  if (!localeMatch) return;
  const route = internalPath || "/";
  const normalizedRoute = route === "/" ? "/" : route.replace(/\/$/, "");
  const seoKey = {
    "/": "home",
    "/about": "about",
    "/team": "team",
    "/practice-groups": "practiceGroups",
    "/industries": "industries",
    "/news": "news",
    "/contact": "contact",
    "/offices": "offices",
    "/careers": "careers",
    "/careers/interns": "interns",
    "/privacy-policy": "privacyPolicy",
    "/terms": "terms",
    "/testimonios": "testimonials",
    "/newsletter": "newsletter",
  } as Record<string, string>;
  const key = seoKey[normalizedRoute];
  if (!key) return;
  const embeddedSeo = ((cmsStaticSnapshot as { content?: Record<string, any> }).content?.seo ?? {}) as Record<string, any>;
  const embeddedRoute = embeddedSeo[key] as Record<string, any> | undefined;
  const pick = (value: unknown) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    const map = value as Record<string, unknown>;
    return typeof map[language] === "string" ? map[language] as string
      : typeof map.en === "string" ? map.en as string
        : typeof map.es === "string" ? map.es as string : "";
  };
  const fallbackSeo = await readStaticCmsSection("seo", language) as Record<string, any> | undefined;
  const title = plainText(pick(embeddedRoute?.title) || pick(fallbackSeo?.[key]?.title)) || "Santos & Saucedo";
  const description = clip(
    plainText(pick(embeddedRoute?.description) || pick(fallbackSeo?.[key]?.description)) || "Santos & Saucedo",
    200,
  );
  return {
    title,
    documentTitle: title,
    description,
    url: SITE + "/" + language + publicRoute(language, normalizedRoute),
    image: absoluteUrl(NEWS_SHARE_IMAGE),
    imageAlt: "Santos & Saucedo",
    brandImage: true,
    type: "website",
    alternates: localizedAlternates(normalizedRoute),
  };
}

function localizedAlternates(route: string): Array<{ hreflang: string; url: string }> {
  const alternates: Array<{ hreflang: string; url: string }> = SUPPORTED_LANGUAGES
    .map(({ code, locale }) => ({ hreflang: locale, url: SITE + "/" + code + publicRoute(code, route) }))
  return [...alternates, { hreflang: "x-default", url: SITE + "/es" + publicRoute("es", route) }];
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
  out = setMeta(out, "property", "og:type", meta.type ?? "website");
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
  out = out.replace(/<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi, "");
  if (meta.alternates?.length) {
    const tags = meta.alternates
      .map((alternate) => '<link rel="alternate" hreflang="' + escapeAttr(alternate.hreflang) + '" href="' + escapeAttr(alternate.url) + '" />')
      .join("");
    out = out.replace("</head>", tags + "</head>");
  }
  return out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + escapeAttr(meta.url) + '" />');
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
