import type { LanguageCode } from "@shared/schema";

interface JsonLdSchemaProps {
  language: LanguageCode;
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

const descriptions = {
  slogan: {
    en: "Strategic labor law for companies",
    es: "Derecho laboral estrategico para empresas",
    de: "Strategic labor law for companies",
    zh: "Strategic labor law for companies",
    ko: "Strategic labor law for companies",
    ja: "Strategic labor law for companies",
    ar: "Strategic labor law for companies",
    ru: "Strategic labor law for companies",
    fr: "Strategic labor law for companies",
    it: "Strategic labor law for companies",
  },
  homeBreadcrumb: {
    en: "Home",
    es: "Inicio",
    de: "Home",
    zh: "Home",
    ko: "Home",
    ja: "Home",
    ar: "Home",
    ru: "Home",
    fr: "Home",
    it: "Home",
  },
};

export default function JsonLdSchema({ language }: JsonLdSchemaProps) {
  const isSpanish = language === "es";
  const safeDescription = isSpanish
    ? "Santos & Saucedo Abogados es una firma especializada en derecho laboral en San Pedro Garza Garcia, Nuevo Leon, con mas de 35 anos de experiencia asesorando empresas nacionales e internacionales."
    : "Santos & Saucedo Abogados is a labor-law firm in San Pedro Garza Garcia, Nuevo Leon, with more than 35 years of experience advising national and international companies.";
  const laborServices = isSpanish
    ? [
        "Conflictos individuales y colectivos",
        "Revision de administracion laboral",
        "Diagnostico de relaciones laborales",
        "Planes de mejora",
        "Auditoria juridico-laboral",
        "Planeacion estrategica, cursos y talleres",
      ]
    : [
        "Individual and collective labor conflicts",
        "Labor administration review",
        "Workplace relations diagnosis",
        "Improvement plans",
        "Labor legal audit",
        "Strategic planning, courses, and workshops",
      ];
  const langDescriptions = {
    legalService: safeDescription,
    organization: safeDescription,
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.santossaucedo.com/#organization",
    "name": "Santos & Saucedo Abogados",
    "alternateName": "S&S",
    "legalName": "Santos & Saucedo Abogados",
    "url": "https://www.santossaucedo.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://santossaucedo.com/images/santossaucedo_2025.png",
      "width": "300",
      "height": "60"
    },
    "image": "https://santossaucedo.com/images/santossaucedo_2025.png",
    "description": langDescriptions.organization,
    "slogan": descriptions.slogan[language],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Tamazunchale 205 Norte",
      "addressLocality": "San Pedro Garza García",
      "addressRegion": "Nuevo León",
      "addressCountry": "MX"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+52 81 8335 2086",
        "contactType": "customer service",
        "email": "info@santossaucedo.com",
        "availableLanguage": ["Spanish"]
      }
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Mexico"
    },
    "knowsAbout": [
      "Derecho Laboral",
      "Conflictos Individuales y Colectivos de Trabajo",
      "Administración Laboral",
      "Relaciones Laborales",
      "Auditoría Jurídico-Laboral",
      "Planeación Estratégica Laboral"
    ]
  };

  const legalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": "https://www.santossaucedo.com/#legalservice",
    "name": "Santos & Saucedo Abogados",
    "url": "https://www.santossaucedo.com",
    "logo": "https://santossaucedo.com/images/santossaucedo_2025.png",
    "image": "https://santossaucedo.com/images/santossaucedo_2025.png",
    "description": langDescriptions.legalService,
    "priceRange": "$$$",
    "currenciesAccepted": "MXN, USD",
    "paymentAccepted": "Bank Transfer, Wire Transfer",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Tamazunchale 205 Norte",
      "addressLocality": "San Pedro Garza García",
      "addressRegion": "Nuevo León",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.6510",
      "longitude": "-100.3673"
    },
    "telephone": "+52 81 8335 2086",
    "email": "info@santossaucedo.com",
    "areaServed": [
      {
        "@type": "Country",
        "name": "Mexico"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Latin America"
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": isSpanish ? "Servicios laborales" : "Labor services",
      "itemListElement": laborServices.map((name) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": name
        }
      }))
    },
    "knowsAbout": [
      "Derecho Laboral",
      "Conflictos Individuales y Colectivos de Trabajo",
      "Administración Laboral",
      "Relaciones Laborales",
      "Auditoría Jurídico-Laboral",
      "Planeación Estratégica Laboral"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.santossaucedo.com/#localbusiness",
    "name": "Santos & Saucedo Abogados",
    "description": safeDescription,
    "image": "https://santossaucedo.com/images/office.jpg",
    "url": "https://www.santossaucedo.com",
    "telephone": "+52 81 8335 2086",
    "email": "info@santossaucedo.com",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Tamazunchale 205 Norte",
      "addressLocality": "San Pedro Garza García",
      "addressRegion": "Nuevo León",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.6510",
      "longitude": "-100.3673"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "hasMap": "https://www.google.com/maps/search/?api=1&query=R%C3%ADo+Tamazunchale+205+Norte%2C+San+Pedro+Garza+Garc%C3%ADa%2C+N.L."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.santossaucedo.com/#website",
    "name": "Santos & Saucedo",
    "url": "https://www.santossaucedo.com",
    "inLanguage": LANGUAGE_CODES[language],
    "description": safeDescription,
    "publisher": {
      "@id": "https://www.santossaucedo.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.santossaucedo.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": descriptions.homeBreadcrumb[language],
        "item": "https://www.santossaucedo.com"
      }
    ]
  };

  const schemas = [
    organizationSchema,
    legalServiceSchema,
    localBusinessSchema,
    websiteSchema,
    breadcrumbSchema
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  imageUrl,
  url,
  language = "en"
}: {
  headline: string;
  description: string;
  datePublished: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string;
  authorUrl?: string;
  imageUrl?: string | null;
  url: string;
  language?: LanguageCode;
}) {
  const formatDate = (date: string | Date | null) => {
    if (!date) return new Date().toISOString();
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString();
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "image": imageUrl || "https://santossaucedo.com/images/santossaucedo_2025.png",
    "datePublished": formatDate(datePublished),
    "dateModified": formatDate(dateModified || datePublished),
    "author": authorName ? {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl
    } : {
      "@type": "Organization",
      "name": "Santos & Saucedo Abogados",
      "url": "https://www.santossaucedo.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Santos & Saucedo Abogados",
      "url": "https://www.santossaucedo.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://santossaucedo.com/images/santossaucedo_2025.png",
        "width": "300",
        "height": "60"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "inLanguage": LANGUAGE_CODES[language],
    "isPartOf": {
      "@id": "https://www.santossaucedo.com/#website"
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
  language?: LanguageCode;
}) {
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
    "image": imageUrl || undefined,
    "email": email || undefined,
    "telephone": telephone || undefined,
    "worksFor": {
      "@type": "LegalService",
      "@id": "https://www.santossaucedo.com/#legalservice",
      "name": "Santos & Saucedo Abogados",
      "url": "https://www.santossaucedo.com"
    },
    "alumniOf": alumniOf.length > 0 ? alumniOf : undefined,
    "knowsLanguage": languages || undefined,
    "knowsAbout": knowsAbout || undefined,
    "sameAs": sameAs.length > 0 ? sameAs : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Tamazunchale 205 Norte",
      "addressLocality": "San Pedro Garza García",
      "addressRegion": "Nuevo León",
      "addressCountry": "MX"
    },
    "memberOf": {
      "@type": "Organization",
      "@id": "https://www.santossaucedo.com/#organization",
      "name": "Santos & Saucedo Abogados"
    }
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
