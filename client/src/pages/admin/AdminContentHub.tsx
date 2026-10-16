import { useState } from "react";
import { Link } from "wouter";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cmsSections } from "@shared/cms";
const groups = [
  {
    label: "Páginas principales",
    keys: [
      "home",
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
