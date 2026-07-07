import { copyFile, mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import {
  eventsData,
  industryGroupsData,
  newsData,
  officeImagesData,
  practiceGroupsData,
  representativeMattersData,
  siteContentData,
  statsData,
  teamMembersData,
} from "../server/seed";

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
const teamMembers = teamMembersData.map((raw) => {
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
const representativeMatters = representativeMattersData.map((raw) => {
  const item = raw as any;
  return {
  id: stableId("matter", item.order),
  ...item,
  };
});
const events = eventsData.map((item: any, index: number) => ({
  id: item.id ?? stableId("event", item.slug ?? item.order ?? index + 1),
  ...item,
}));

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
    team: teamMembers
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
    news: news
      .filter((n) =>
        [n.title, n.titleEs, n.excerpt, n.excerptEs, n.content, n.contentEs].some((value) =>
          String(value ?? "").toLowerCase().includes(normalized),
        ),
      )
      .slice(0, 5),
  };
}

async function generate() {
  await mkdir(apiDir, { recursive: true });

  await writeJson("detect-language.json", { language: "es", country: "MX" });
  await writeJson("site-content.json", siteContentData);
  await writeJson("stats.json", statsData);
  await writeJson("news.json", news);
  await writeJson("news/published.json", news.filter((item) => item.published));
  await writeJson("office-images.json", officeImages);
  await writeJson("practice-groups.json", practiceGroups);
  await writeJson("industry-groups.json", industryGroups);
  await writeJson("team.json", teamMembers);
  await writeJson("team/partners.json", teamMembers.filter((item) => item.isPartner));
  await writeJson("representative-matters.json", representativeMatters);
  await writeJson("events.json", events);
  await writeJson("events/upcoming.json", events.slice(0, 4));
  await writeJson("search-index.json", { team: teamMembers, practiceGroups, industryGroups, news });

  for (const item of news) {
    await writeJson(`news/${item.slug}.json`, item);
    await writeJson(`news/${item.id}.json`, item);
    await writeJson(`news/${item.slug}/authors.json`, []);
  }

  for (const item of practiceGroups) {
    await writeJson(`practice-groups/${item.slug}.json`, item);
    await writeJson(`practice-groups/${item.id}.json`, item);
    await writeJson(
      `practice-groups/${item.slug}/representative-matters.json`,
      representativeMatters.filter((matter) => matter.practiceAreaSlug === item.slug),
    );
  }

  for (const item of industryGroups) {
    await writeJson(`industry-groups/${item.slug}.json`, item);
    await writeJson(`industry-groups/${item.id}.json`, item);
  }

  for (const item of teamMembers) {
    await writeJson(`team/${item.slug}.json`, item);
    await writeJson(`team/${item.id}.json`, item);
    await writeJson(`team/${item.slug}/news.json`, []);
  }

  for (const item of events) {
    await writeJson(`events/${item.id}.json`, item);
  }

  const teamPhotosOutDir = path.join(outDir, "team_photos");
  const teamPhotosSourceDir = path.resolve("attached_assets/team_photos");
  await rm(teamPhotosOutDir, { recursive: true, force: true });
  await mkdir(teamPhotosOutDir, { recursive: true });
  for (const fileName of await readdir(teamPhotosSourceDir)) {
    if (fileName.startsWith("._")) continue;
    await copyFile(path.join(teamPhotosSourceDir, fileName), path.join(teamPhotosOutDir, fileName));
  }
  for (const fileName of await readdir(teamPhotosOutDir)) {
    if (fileName.startsWith("._")) {
      await rm(path.join(teamPhotosOutDir, fileName), { force: true });
    }
  }

  await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
