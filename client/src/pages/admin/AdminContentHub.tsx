import { useState } from "react";
import { Link } from "wouter";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { cmsSections, type CmsSection } from "@shared/cms";
import { adminApiRequest } from "@/lib/adminAuth";
import { adminHrefForCmsSection, canonicalPageOrder, cmsEditorPages, getCmsEditorPage } from "@/features/site-config/editorMetadata";
import { AdminPageHelp } from "@/components/admin/AdminPageHelp";
const groups = [
  {
    label: "Contenido compartido",
    keys: ["chrome", "contactData", "links", "forms"],
  },
  {
    label: "Biblioteca y medios",
    keys: ["media"],
  },
  {
    label: "Configuración del sitio",
    keys: ["navigation", "consent", "integrations", "theme", "voice"],
  },
];
const sharedSectionKeys = new Set(groups.flatMap((group) => group.keys));
export default function AdminContentHub() {
  const [search, setSearch] = useState("");
  const normalized = search
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const matches = cmsSections.filter((s) => sharedSectionKeys.has(s.key) &&
    `${s.label} ${s.help}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(normalized),
  );
  const pageMatches = canonicalPageOrder
    .map((id) => cmsEditorPages.find((page) => page.id === id))
    .filter((page): page is (typeof cmsEditorPages)[number] => Boolean(page))
    .filter((page) => !normalized || `${page.label} ${page.description} ${page.blocks.join(" ")} ${page.path}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(normalized));
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
        Elige primero la página que ves en el sitio. Dentro encontrarás sus
        bloques, medios, botones, idioma y visibilidad en un mismo recorrido.
      </p>
      <AdminPageHelp pageId="content-hub" manualSectionId="primeros-pasos">
        Si buscas una foto, video o perfil, entra a la página donde aparece. El
        editor te dirá si el contenido vive en un catálogo compartido y te llevará
        al lugar correcto para cambiarlo.
      </AdminPageHelp>
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
        <h2>Elige una página para editar</h2>
        <div className="admin-content-items">
        {pageMatches.map((page) => (
            <Link key={page!.id} href={`/admin/page/${page!.id}`}>
              <div>
                <strong>{page!.label}</strong>
                <p>{page!.description}</p>
              <small>{page!.blocks.length} bloques · {page!.path || "Página de sistema"}</small>
              </div>
              <ArrowRightIcon />
            </Link>
          ))}
        </div>
        {!pageMatches.length && <p className="admin-empty">No hay una página que coincida con esa búsqueda.</p>}
      </section>
      {normalized.length >= 2 && (
        <section className="admin-content-group" aria-live="polite">
          <h2>Coincidencias dentro del contenido</h2>
          {contentSearch.isPending && <p className="admin-empty">Buscando en textos y bloques…</p>}
          {contentSearch.isError && <p className="admin-empty">No se pudo completar la búsqueda.</p>}
          {contentSearch.data?.results.length ? (
            <div className="admin-content-items">
              {contentSearch.data.results.map((result, index) => (
                <Link key={`${result.section}-${result.path}-${index}`} href={`/admin/page/${getCmsEditorPage(result.section as CmsSection).id}?focus=${encodeURIComponent(result.path)}`}>
                  <div>
                    <strong>{result.label}{result.language ? ` · ${result.language.toUpperCase()}` : ""}</strong>
                    <p>{result.value.length > 180 ? `${result.value.slice(0, 180)}…` : result.value}</p>
                    <small>{getCmsEditorPage(result.section as CmsSection).label} · {result.path || result.field}</small>
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
      {!matches.length && !pageMatches.length && normalized.length > 0 && (
        <p className="admin-empty">
          No hay secciones con esa búsqueda. Pruebe con otra palabra.
        </p>
      )}
    </main>
  );
}
