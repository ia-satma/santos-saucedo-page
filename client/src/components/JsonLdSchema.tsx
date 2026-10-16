import type { LanguageCode } from "@shared/schema";
import { CONFIRMED_PARTNER_SLUGS } from "@shared/teamVisibility";

// Datos estructurados sin datos no confirmados: fuera rango de precios, monedas y medios de
// pago, coordenadas, horario, "Latin America", la foto de oficina sin archivo y la búsqueda
// (/search no existe).
//
// La firma (LegalService, @id #organization) y el sitio (WebSite, @id #website) se definen
// una sola vez, en client/index.html (E18): así están en todas las páginas, también sin
// JavaScript, y no hay dos versiones con valores distintos. Aquí solo se enlazan por @id.

const SITE_URL = "https://www.santossaucedo.com";
const ORGANIZATION = { "@id": `${SITE_URL}/#organization` };
// Logotipo de client/public, que el build copia a la raíz del sitio
const DEFAULT_IMAGE = `${SITE_URL}/logo-color.png`;

/** URL absoluta en el dominio del sitio; quita la base de GitHub Pages (/santos-saucedo-page/) */
function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.BASE_URL || "/";
  const path = base !== "/" && url.startsWith(base) ? url.slice(base.length - 1) : url;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const LANGUAGE_CODES: Record<LanguageCode, string> = {
  en: "en",
  es: "es-MX",
  de: "de",
  zh: "zh-CN",
  ko: "ko",
  ja: "ja",
  ar: "ar",
  ru: "ru",
  fr: "fr",
  it: "it",
};

interface JsonLdSchemaProps {
  language: LanguageCode;
}

/**
 * Portada: la firma y el sitio ya están en index.html (E18) y la miga de pan de un solo
 * nivel ("Inicio") no aporta nada; el componente se conserva para no tocar Home.tsx.
 */
export default function JsonLdSchema(_props: JsonLdSchemaProps) {
  return null;
}

// Las fechas de las notas son las de la carga inicial, no las de publicación: datePublished y
// dateModified se aceptan pero no se declaran hasta que la firma las confirme (E9)
export function ArticleJsonLd({
  headline,
  description,
  authorName,
  authorUrl,
  imageUrl,
  url,
  language = "en"
}: {
  headline: string;
  description: string;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string;
  authorUrl?: string;
  imageUrl?: string | null;
  url: string;
  language?: LanguageCode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "image": imageUrl ? absoluteUrl(imageUrl) : DEFAULT_IMAGE,
    "author": authorName ? {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl
    } : ORGANIZATION,
    "publisher": ORGANIZATION,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "inLanguage": LANGUAGE_CODES[language],
    "isPartOf": {
      "@id": `${SITE_URL}/#website`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd({
  name,
  jobTitle,
  email,
  telephone,
  imageUrl,
  url,
  linkedinUrl,
  education,
  languages,
  knowsAbout,
  named,
  language = "en"
}: {
  name: string;
  jobTitle: string;
  email?: string | null;
  telephone?: string | null;
  imageUrl?: string | null;
  url: string;
  linkedinUrl?: string | null;
  education?: Array<{ school: string; degree: string; year?: string }>;
  languages?: string[];
  knowsAbout?: string[];
  /**
   * Si la persona se nombra en el sitio (isNamedOnTeamPage de shared/teamVisibility.ts).
   * Sin el dato, solo los socios confirmados (por el slug de `url`) y los Of Counsel.
   */
  named?: boolean;
  language?: LanguageCode;
}) {
  // D17: sin datos estructurados de quien /team no nombra (socios sin confirmar, asociados)
  const slug = url.replace(/\/+$/, "").split("/").pop() ?? "";
  const isNamed = named ?? (CONFIRMED_PARTNER_SLUGS.has(slug) || jobTitle.trim().toLowerCase() === "of counsel");
  if (!isNamed) return null;

  const sameAs = [];
  if (linkedinUrl) sameAs.push(linkedinUrl);

  const alumniOf = education?.map(edu => ({
    "@type": "EducationalOrganization",
    "name": edu.school,
    "description": edu.degree
  })) || [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": jobTitle,
    "url": url,
    "image": imageUrl ? absoluteUrl(imageUrl) : undefined,
    "email": email || undefined,
    "telephone": telephone || undefined,
    "worksFor": ORGANIZATION,
    "alumniOf": alumniOf.length > 0 ? alumniOf : undefined,
    "knowsLanguage": languages || undefined,
    "knowsAbout": knowsAbout || undefined,
    "sameAs": sameAs.length > 0 ? sameAs : undefined,
    // La de la oficina, igual que la de #organization en index.html
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Tamazunchale 205 Norte, Col. del Valle",
      "addressLocality": "San Pedro Garza García",
      "addressRegion": "Nuevo León",
      "postalCode": "66220",
      "addressCountry": "MX"
    },
    "memberOf": ORGANIZATION
  };

  const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => 
    value === undefined ? undefined : value
  ));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
  language = "en"
}: {
  items: Array<{ name: string; url: string }>;
  language?: LanguageCode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
