import { useState } from "react";
import { Link } from "wouter";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { cmsSections, type CmsSection } from "@shared/cms";
import { adminApiRequest } from "@/lib/adminAuth";
import { adminHrefForCmsSection, cmsEditorPages } from "@/features/site-config/editorMetadata";
const sitePageOrder = ["home", "about", "practices", "industries", "team", "news", "contact", "careers", "offices", "testimonials", "media"];
const groups = [
  {
    label: "Páginas principales",
    keys: [
      "home",
      "v3",
      "about",
      "offices",
      "officeLabels",
      "team",
      "profile",
      "practices",
      "practice-detail",
      "careers",
      "interns",
      "contact",
      "newsletter",
    ],
  },
  {
    label: "Monitor Laboral",
    keys: ["news-intro", "news-detail", "monitor-ui", "monitor-subscribe"],
  },
  {
    label: "Identidad y estructura",
    keys: [
      "media",
      "layout",
      "chrome",
      "contactData",
      "practice-names",
      "practice-short-names",
    ],
  },
  {
    label: "Textos legales, formularios y buscadores",
    keys: [
      "privacy",
      "terms",
      "cookies",
      "contact-consent",
      "contact-feedback",
      "privacy-contact",
      "terms-contact",
      "seo",
      "industries",
      "industry-detail",
      "not-found",
    ],
  },
];
export default function AdminContentHub() {
  const [search, setSearch] = useState("");
  const normalized = search
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const matches = cmsSections.filter((s) =>
    `${s.label} ${s.help}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(normalized),
  );
  const contentSearch = useQuery<{ query: string; results: { section: string; label: string; path: string; publicPath: string; field: string; value: string; language?: string }[] }>({
    queryKey: ["/api/admin/content/search", normalized],
    enabled: normalized.length >= 2,
    staleTime: 1500,
    queryFn: async () => {
      const response = await adminApiRequest("GET", `/api/admin/content/search?q=${encodeURIComponent(search.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo buscar el contenido.");
      return data;
    },
  });
  return (
    <main className="admin-overview">
      <p className="admin-page-kicker">Contenido del sitio</p>
      <h1>Páginas y textos</h1>
      <p className="admin-page-description">
        Encuentre cada sección por su nombre. Los abogados, las prácticas y las
        publicaciones tienen sus propios catálogos en el menú.
      </p>
      <label htmlFor="content-search" className="sr-only">
        Buscar página o texto
      </label>
      <input
        id="content-search"
        className="admin-hub-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar: portada, oficina, privacidad…"
      />
      <section className="admin-content-group">
        <h2>Páginas y bloques</h2>
        <div className="admin-content-items">
          {sitePageOrder.map((id) => cmsEditorPages.find((page) => page.id === id)).filter(Boolean).map((page) => (
            <Link key={page!.id} href={adminHrefForCmsSection(page!.tabs[0].section)}>
              <div>
                <strong>{page!.label}</strong>
                <p>{page!.description}</p>
              </div>
              <ArrowRightIcon />
            </Link>
          ))}
        </div>
      </section>
      {normalized.length >= 2 && (
        <section className="admin-content-group" aria-live="polite">
          <h2>Coincidencias dentro del contenido</h2>
          {contentSearch.isPending && <p className="admin-empty">Buscando en textos y bloques…</p>}
          {contentSearch.isError && <p className="admin-empty">No se pudo completar la búsqueda.</p>}
          {contentSearch.data?.results.length ? (
            <div className="admin-content-items">
              {contentSearch.data.results.map((result, index) => (
                <Link key={`${result.section}-${result.path}-${index}`} href={`${adminHrefForCmsSection(result.section as CmsSection)}?focus=${encodeURIComponent(result.path)}`}>
                  <div>
                    <strong>{result.label}{result.language ? ` · ${result.language.toUpperCase()}` : ""}</strong>
                    <p>{result.value.length > 180 ? `${result.value.slice(0, 180)}…` : result.value}</p>
                    <small>{result.path || result.field}</small>
                  </div>
                  <ArrowRightIcon />
                </Link>
              ))}
            </div>
          ) : contentSearch.data && <p className="admin-empty">No hay coincidencias dentro de los textos guardados.</p>}
        </section>
      )}
      {groups.map((group) => {
        const items = matches.filter((s) => group.keys.includes(s.key));
        return (
          items.length > 0 && (
            <section className="admin-content-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="admin-content-items">
                {items.map((s) => (
                  <Link key={s.key} href={`/admin/site-config/${s.key}`}>
                    <div>
                      <strong>{s.label}</strong>
                      <p>{s.help}</p>
                    </div>
                    <ArrowRightIcon />
                  </Link>
                ))}
              </div>
            </section>
          )
        );
      })}
      {!matches.length && (
        <p className="admin-empty">
          No hay secciones con esa búsqueda. Pruebe con otra palabra.
        </p>
      )}
    </main>
  );
}
