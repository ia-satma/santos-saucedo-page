import { cmsDefaults } from "../shared/cms";
import { copyFile, mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import {
  industryGroupsData,
  newsData,
  officeImagesData,
  practiceGroupsData,
  siteContentData,
  statsData,
  teamMembersData,
} from "../server/seed";
import { isNamedOnTeamPage, toPublicTeamMember, toPublicTeamProfile } from "../shared/teamVisibility";
import { isPublicNews, toPublicNews } from "../shared/publicNews";

const outDir = path.resolve("dist/public");
const apiDir = path.join(outDir, "static-api");
const snapshotDate = "2026-07-07T00:00:00.000Z";

type JsonValue = unknown;

function stableId(prefix: string, slugOrOrder: string | number | undefined) {
  return `${prefix}-${slugOrOrder ?? "item"}`;
}

function withDefaults<T extends Record<string, any>>(prefix: string, item: T) {
  return {
    id: stableId(prefix, item.slug ?? item.order),
    imageUrl: item.imageUrl ?? null,
    ...item,
  };
}

const practiceGroups = practiceGroupsData.map((raw) => withDefaults("practice", raw as any));
const industryGroups = industryGroupsData.map((raw) => withDefaults("industry", raw as any));
// Personas (D17, E11, J1): solo quien /team nombra (isNamedOnTeamPage: socios confirmados y Of
// Counsel) sale en el API estático, el índice de búsqueda, el mapa del sitio y team_photos.
// Asociados, staff y socios sin confirmar no salen en ningún JSON (el mosaico de /team usa
// fotos estáticas, sin nombres) y /team/<slug> les da la vista 404. Listas con el DTO de
// tarjeta (toPublicTeamMember); ficha e índice de búsqueda con el de ficha (toPublicTeamProfile).
const allTeamMembers = teamMembersData.map((raw) => {
  const item = raw as any;
  return {
  id: stableId("team", item.slug),
  imageUrl: item.imageUrl ?? null,
  linkedinUrl: item.linkedinUrl ?? null,
  education: item.education ?? null,
  barAdmissions: item.barAdmissions ?? null,
  languages: item.languages ?? null,
  affiliations: item.affiliations ?? null,
  rankings: item.rankings ?? null,
  publications: item.publications ?? null,
  representativeMatters: item.representativeMatters ?? null,
  experience: item.experience ?? null,
  ...item,
  };
});
const namedTeamMembers = allTeamMembers.filter((m) => isNamedOnTeamPage(m));
const news = newsData.map((raw) => {
  const item = raw as any;
  return {
  id: stableId("news", item.slug),
  imageUrl: item.imageUrl ?? null,
  date: item.date ?? snapshotDate,
  published: item.published ?? true,
  category: item.category ?? "press",
  categoryEs: item.categoryEs ?? "Prensa",
  authorId: item.authorId ?? null,
  processingStatus: item.processingStatus ?? "pending",
  lastError: item.lastError ?? null,
  lastProcessedAt: item.lastProcessedAt ?? null,
  failedStep: item.failedStep ?? null,
  publishAt: item.publishAt ?? null,
  councilVerdict: item.councilVerdict ?? null,
  ...item,
  };
});
const officeImages = officeImagesData.map((raw) => withDefaults("office-image", raw as any));
// Retratos que se copian: solo los de quien se nombra, "<slug>.<png|jpg|jpeg>" y sus tamaños
// "<slug>-128.webp", "<slug>-360.webp", "<slug>-652.webp" (el mismo filtro que /team_photos
// en server/routes.ts)
const namedPhotoSlugs = new Set(namedTeamMembers.map((m) => String(m.slug)));
const TEAM_PHOTO_FILE = /^([a-z0-9-]+?)(?:\.(?:png|jpe?g)|-(?:128|360|652)\.webp)$/i;
const isNamedPhoto = (fileName: string) => {
  const match = TEAM_PHOTO_FILE.exec(fileName);
  return !!match && namedPhotoSlugs.has(match[1].toLowerCase());
};

// Notas (J2): solo las publicadas y ya en fecha al compilar (isPublicNews, el criterio del
// servidor) y solo con los campos públicos (toPublicNews, sin los del proceso interno del CMS)
const buildTime = new Date();
const publishedNews = news.filter((item) => isPublicNews(item, buildTime)).map(toPublicNews);

async function writeJson(relativePath: string, value: JsonValue) {
  const target = path.join(apiDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function search(query: string) {
  const normalized = query.toLowerCase().trim();
  if (normalized.length < 2) {
    return { team: [], practiceGroups: [], industryGroups: [], news: [] };
  }

  return {
    team: namedTeamMembers
      .map(toPublicTeamProfile)
      .filter((m) =>
        [
          m.name,
          m.title,
          m.titleEs,
          m.role,
          m.roleEs,
          m.bio,
          m.bioEs,
        ].some((value) => String(value ?? "").toLowerCase().includes(normalized)),
      )
      .slice(0, 10),
    practiceGroups: practiceGroups
      .filter((g) =>
        [g.name, g.nameEs, g.description, g.descriptionEs].some((value) =>
          String(value ?? "").toLowerCase().includes(normalized),
        ),
      )
      .slice(0, 5),
    industryGroups: industryGroups
      .filter((g) =>
        [g.name, g.nameEs, g.description, g.descriptionEs].some((value) =>
          String(value ?? "").toLowerCase().includes(normalized),
        ),
      )
      .slice(0, 5),
    news: publishedNews
      .filter((n) =>
        [n.title, n.titleEs, n.excerpt, n.excerptEs, n.content, n.contentEs].some((value) =>
          String(value ?? "").toLowerCase().includes(normalized),
        ),
      )
      .slice(0, 5),
  };
}

// Mapa del sitio del build estático: las mismas URL que /sitemap.xml del servidor (sin
// /experience, /articles ni /events, que redirigen; con /offices, "La oficina"; fichas solo
// de quien /team nombra; notas publicadas).
// Sustituye a la copia de public/sitemap.xml que deja Vite en dist/public.
const SITE_URL = "https://www.santossaucedo.com";
const SITEMAP_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/team", changefreq: "weekly", priority: "0.9" },
  { loc: "/practice-groups", changefreq: "monthly", priority: "0.8" },
  { loc: "/news", changefreq: "daily", priority: "0.9" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/offices", changefreq: "monthly", priority: "0.6" },
  { loc: "/careers", changefreq: "weekly", priority: "0.7" },
  { loc: "/careers/interns", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

async function writeSitemap() {
  const day = (value: unknown) => {
    const d = value ? new Date(value as string) : new Date(snapshotDate);
    return (Number.isNaN(d.getTime()) ? new Date(snapshotDate) : d).toISOString().split("T")[0];
  };
  const today = day(new Date().toISOString());
  const entries = [
    ...SITEMAP_PAGES.map((page) => ({ ...page, lastmod: today })),
    ...namedTeamMembers.map((m) => ({ loc: `/team/${m.slug}`, changefreq: "monthly", priority: "0.6", lastmod: today })),
    ...practiceGroups.map((g) => ({ loc: `/practice-groups/${g.slug}`, changefreq: "monthly", priority: "0.7", lastmod: today })),
    ...publishedNews.map((n) => ({ loc: `/news/${n.slug}`, changefreq: "monthly", priority: "0.6", lastmod: day(n.date) })),
  ];
  const body = entries
    .map(
      (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join("\n");
  await writeFile(
    path.join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    "utf8",
  );
}

async function generate() {
  await mkdir(apiDir, { recursive: true });

  // Mismo formato que /api/detect-language (solo Accept-Language; en Pages no se consulta)
  await writeJson("detect-language.json", { language: "es", source: "default" });
  await writeJson("site-content.json", { ...siteContentData, ...cmsDefaults.contactData as object });
  await writeJson("site-config.json", {});
  await writeJson("jobs.json", []);
  await writeJson("stats.json", statsData);
  await writeJson("news.json", publishedNews);
  await writeJson("news/published.json", publishedNews);
  await writeJson("office-images.json", officeImages);
  await writeJson("practice-groups.json", practiceGroups);
  await writeJson("industry-groups.json", industryGroups);
  await writeJson("team.json", namedTeamMembers.map(toPublicTeamMember));
  await writeJson("team/partners.json", namedTeamMembers.filter((item) => item.isPartner).map(toPublicTeamMember));
  // /experience redirige a /practice-groups (D4): sus asuntos (sin confirmar) no se publican.
  // /events redirige a /news (E4): sin events.json. Los datos siguen en server/seed.ts.
  await writeJson("search-index.json", {
    team: namedTeamMembers.map(toPublicTeamProfile),
    practiceGroups,
    industryGroups,
    news: publishedNews,
  });

  // JSON por nota solo de las públicas: un borrador o una nota programada no tiene archivo
  for (const item of publishedNews) {
    await writeJson(`news/${item.slug}.json`, item);
    await writeJson(`news/${item.id}.json`, item);
    await writeJson(`news/${item.slug}/authors.json`, []);
  }

  for (const item of practiceGroups) {
    await writeJson(`practice-groups/${item.slug}.json`, item);
    await writeJson(`practice-groups/${item.id}.json`, item);
    // Sin asuntos representativos publicados (los del seed no están confirmados)
    await writeJson(`practice-groups/${item.slug}/representative-matters.json`, []);
  }

  for (const item of industryGroups) {
    await writeJson(`industry-groups/${item.slug}.json`, item);
    await writeJson(`industry-groups/${item.id}.json`, item);
  }

  for (const item of namedTeamMembers) {
    await writeJson(`team/${item.slug}.json`, toPublicTeamProfile(item));
    await writeJson(`team/${item.id}.json`, toPublicTeamProfile(item));
    await writeJson(`team/${item.slug}/news.json`, []);
  }

  const teamPhotosOutDir = path.join(outDir, "team_photos");
  const teamPhotosSourceDir = path.resolve("attached_assets/team_photos");
  await rm(teamPhotosOutDir, { recursive: true, force: true });
  await mkdir(teamPhotosOutDir, { recursive: true });
  for (const fileName of await readdir(teamPhotosSourceDir)) {
    if (fileName.startsWith("._") || !isNamedPhoto(fileName)) continue;
    await copyFile(path.join(teamPhotosSourceDir, fileName), path.join(teamPhotosOutDir, fileName));
  }
  for (const fileName of await readdir(teamPhotosOutDir)) {
    if (fileName.startsWith("._")) {
      await rm(path.join(teamPhotosOutDir, fileName), { force: true });
    }
  }

  await writeSitemap();

  // Respaldo de GitHub Pages para rutas del SPA: se sirve con estado 404, así que ninguna
  // ruta sin archivo propio (tampoco /experience, /articles ni /events, que el cliente
  // redirige) queda como página indexable.
  await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
