import type { Express } from "express";
import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { siteConfig } from "@shared/schema";
import { cmsDefaults, isCmsSection, mergeCms, type CmsSection, type CmsValue } from "@shared/cms";
import { authMiddleware, requireRole } from "../auth";
import {
  VISUAL_SCHEMA_VERSION,
  emptyVisualPageData,
  isVisualLanguage,
  isVisualPageId,
  migrateVisualPageData,
  normalizeVisualPageData,
  type VisualPageData,
  type VisualPageId,
  type VisualPageStored,
  type VisualPageData as VisualData,
  visualPageKey,
} from "@shared/visualPages";

const storedRevision = (raw: string | null | undefined) => raw ? createHash("sha256").update(raw).digest("hex") : "initial";

type StoredVisual = VisualPageStored & { draft?: VisualPageData };
type VisualResponse = {
  pageId: VisualPageId;
  language: string;
  schemaVersion: number;
  draftData: VisualPageData;
  publishedData: VisualPageData | null;
  previousData: VisualPageData | null;
  revision: string;
};

function decode(raw: string | null | undefined): StoredVisual | undefined {
  if (!raw) return undefined;
  try { return JSON.parse(raw) as StoredVisual; } catch { return undefined; }
}
function parseRoute(req: { params: Record<string, string> }): { pageId: VisualPageId; language: VisualPageStored["language"] } | null {
  const pageId = req.params.pageId || "";
  const language = req.params.language || "";
  if (!isVisualPageId(pageId) || !isVisualLanguage(language)) return null;
  return { pageId, language };
}
function responseFor(pageId: VisualPageId, language: VisualPageStored["language"], raw: string | null | undefined): VisualResponse {
  const stored = decode(raw);
  const schemaVersion = stored?.schemaVersion ?? VISUAL_SCHEMA_VERSION;
  const publishedData = stored?.content ? migrateVisualPageData(stored.content, schemaVersion) : null;
  const draftData = stored?.draft ? migrateVisualPageData(stored.draft, schemaVersion) : publishedData ?? emptyVisualPageData();
  return {
    pageId,
    language,
    schemaVersion,
    draftData,
    publishedData,
    previousData: stored?.previous ? migrateVisualPageData(stored.previous, schemaVersion) : null,
    revision: storedRevision(raw),
  };
}
function invalidData(res: { status: (code: number) => { json: (value: unknown) => unknown } }, errors: string[]) {
  return res.status(400).json({ error: "La configuración visual no es válida.", details: errors });
}

type VisualBinding = { section: CmsSection; path: string[]; value: CmsValue };
type StoredCms = { content?: CmsValue; draft?: CmsValue; previous?: CmsValue };

function decodeCms(raw: string | null | undefined): StoredCms | undefined {
  if (!raw) return undefined;
  try { return JSON.parse(raw) as StoredCms; } catch { return undefined; }
}

function cloneCms<T>(value: T): T {
  return structuredClone(value);
}

function setCmsPath(target: Record<string, CmsValue>, path: string[], value: CmsValue) {
  let cursor: Record<string, CmsValue> = target;
  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,80}$/.test(segment)) return;
    if (index === path.length - 1) {
      const current = cursor[segment];
      cursor[segment] = Array.isArray(current) && typeof value === "string"
        ? value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)
        : value;
      return;
    }
    const next = cursor[segment];
    if (!next || typeof next !== "object" || Array.isArray(next)) cursor[segment] = {};
    cursor = cursor[segment] as Record<string, CmsValue>;
  }
}

function collectVisualBindings(data: VisualPageData): Map<CmsSection, VisualBinding[]> {
  const bindings = new Map<CmsSection, VisualBinding[]>();
  for (const component of data.content) {
    const props = component.props as Record<string, CmsValue>;
    const sourceMap = props.sourceMap;
    if (!sourceMap || typeof sourceMap !== "object" || Array.isArray(sourceMap)) continue;
    for (const [field, rawPath] of Object.entries(sourceMap)) {
      if (typeof rawPath !== "string") continue;
      const [sectionName, ...path] = rawPath.split(".");
      if (!isCmsSection(sectionName) || path.length === 0) continue;
      const value = props[field];
      if (value === undefined) continue;
      const section = sectionName as CmsSection;
      const list = bindings.get(section) ?? [];
      list.push({ section, path, value });
      bindings.set(section, list);
    }
  }
  return bindings;
}

async function syncVisualBindings(data: VisualPageData, language: string, publish: boolean): Promise<string[]> {
  const grouped = collectVisualBindings(data);
  const synced: string[] = [];
  for (const [section, bindings] of Array.from(grouped.entries())) {
    const key = `editorial.${section}`;
    const [row] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
    const stored = decodeCms(row?.value);
    const published = mergeCms(cmsDefaults[section], stored?.content) as CmsValue;
    const draft = mergeCms(cmsDefaults[section], stored?.draft ?? stored?.content) as CmsValue;
    const base = cloneCms((publish ? published : draft) as CmsValue) as Record<string, CmsValue>;
    const languageRoot = base[language];
    const target = languageRoot && typeof languageRoot === "object" && !Array.isArray(languageRoot)
      ? languageRoot as Record<string, CmsValue>
      : base;
    for (const binding of bindings) setCmsPath(target, binding.path, cloneCms(binding.value));
    const nextContent = publish ? base : published;
    const nextDraft = publish ? undefined : base;
    const raw = JSON.stringify({ content: nextContent, ...(nextDraft === undefined ? {} : { draft: nextDraft }), previous: stored?.previous ?? published });
    const metadata = { value: raw, type: "json", category: "editorial", updatedAt: new Date() };
    if (row) await db.update(siteConfig).set(metadata).where(and(eq(siteConfig.key, key), row.value === null ? isNull(siteConfig.value) : eq(siteConfig.value, row.value)));
    else await db.insert(siteConfig).values({ key, ...metadata }).onConflictDoNothing();
    synced.push(section);
  }
  return synced;
}

async function isPublicVisualEnabled(pageId: VisualPageId): Promise<boolean> {
  const [layoutRow] = await db
    .select({ value: siteConfig.value })
    .from(siteConfig)
    .where(eq(siteConfig.key, "editorial.layout"))
    .limit(1);
  if (!layoutRow?.value) return false;
  try {
    const stored = JSON.parse(layoutRow.value) as { content?: unknown };
    const layout = mergeCms(cmsDefaults.layout, stored?.content) as Record<string, any>;
    const page = layout.pages?.[pageId];
    return page?.enabled === true && page?.blocks?.visual === true;
  } catch {
    return false;
  }
}

export function registerVisualPageRoutes(app: Express) {
  app.get("/api/visual-pages/:pageId/:language", async (req, res) => {
    const route = parseRoute(req);
    if (!route) return res.status(400).json({ error: "Página o idioma visual inválido." });
    try {
      if (!(await isPublicVisualEnabled(route.pageId))) {
        res.setHeader("Cache-Control", "no-store");
        return res.json({ pageId: route.pageId, language: route.language, schemaVersion: VISUAL_SCHEMA_VERSION, data: null });
      }
      const [row] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, visualPageKey(route.pageId, route.language))).limit(1);
      const stored = decode(row?.value);
      res.setHeader("Cache-Control", "no-store");
      const schemaVersion = stored?.schemaVersion ?? VISUAL_SCHEMA_VERSION;
      return res.json({ pageId: route.pageId, language: route.language, schemaVersion, data: stored?.content ? migrateVisualPageData(stored.content, schemaVersion) : null });
    } catch (error) {
      console.error("[VisualCMS] Public read failed", error instanceof Error ? error.message : "unknown");
      return res.status(503).json({ error: "No se pudo cargar la composición visual publicada." });
    }
  });

  app.get("/api/admin/visual-pages/:pageId/:language", authMiddleware, requireRole("editor", "admin"), async (req, res) => {
    const route = parseRoute(req);
    if (!route) return res.status(400).json({ error: "Página o idioma visual inválido." });
    try {
      const [row] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, visualPageKey(route.pageId, route.language))).limit(1);
      res.setHeader("Cache-Control", "no-store");
      return res.json(responseFor(route.pageId, route.language, row?.value));
    } catch (error) {
      console.error("[VisualCMS] Read failed", error instanceof Error ? error.message : "unknown");
      return res.status(503).json({ error: "No se pudo cargar la composición visual." });
    }
  });

  app.put("/api/admin/visual-pages/:pageId/:language", authMiddleware, requireRole("editor", "admin"), async (req, res) => {
    const route = parseRoute(req);
    if (!route) return res.status(400).json({ error: "Página o idioma visual inválido." });
    const revision = typeof req.body?.revision === "string" ? req.body.revision : "";
    const rawData = req.body?.draftData ?? req.body?.data;
    if (!revision || rawData === undefined) return res.status(400).json({ error: "Faltan el borrador visual y su revisión." });
    let draftData: VisualData;
    try { draftData = normalizeVisualPageData(rawData); } catch (error) {
      const details = error instanceof Error ? error.message.split(" ").filter(Boolean) : ["Contenido inválido."];
      return invalidData(res, details);
    }
    const key = visualPageKey(route.pageId, route.language);
    try {
      const [old] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
      if (revision !== storedRevision(old?.value)) return res.status(409).json({ error: "La composición visual cambió mientras se guardaba. Recargue antes de continuar." });
      const current = decode(old?.value);
      const published = current?.content ? migrateVisualPageData(current.content, current.schemaVersion ?? VISUAL_SCHEMA_VERSION) : emptyVisualPageData();
      const previous = current?.previous ?? (current?.content ? published : null);
      const raw = JSON.stringify({
        pageId: route.pageId,
        language: route.language,
        schemaVersion: VISUAL_SCHEMA_VERSION,
        content: published,
        draft: draftData,
        previous,
        updatedAt: new Date().toISOString(),
        updatedBy: req.adminUser!.id,
      } satisfies StoredVisual);
      const metadata = { value: raw, type: "json", category: "visual", updatedAt: new Date() };
      const changed = old
        ? await db.update(siteConfig).set(metadata).where(and(eq(siteConfig.key, key), (old.value === null ? isNull(siteConfig.value) : eq(siteConfig.value, old.value)))).returning({ value: siteConfig.value })
        : await db.insert(siteConfig).values({ key, ...metadata }).onConflictDoNothing().returning({ value: siteConfig.value });
      if (!changed.length) return res.status(409).json({ error: "La composición visual cambió mientras se guardaba. Recargue antes de continuar." });
      const syncedSections = await syncVisualBindings(draftData, route.language, false);
      console.log("[VisualCMS]", JSON.stringify({ action: "draft", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json({ ...responseFor(route.pageId, route.language, raw), syncedSections });
    } catch (error) {
      console.error("[VisualCMS] Draft save failed", error instanceof Error ? error.message : "unknown");
      return res.status(500).json({ error: "No se pudo guardar el borrador visual." });
    }
  });

  app.post("/api/admin/visual-pages/:pageId/:language/publish", authMiddleware, requireRole("editor", "admin"), async (req, res) => {
    const route = parseRoute(req);
    if (!route) return res.status(400).json({ error: "Página o idioma visual inválido." });
    const expectedRevision = typeof req.body?.revision === "string" ? req.body.revision : "";
    if (!expectedRevision) return res.status(400).json({ error: "Falta la revisión visual." });
    const key = visualPageKey(route.pageId, route.language);
    try {
      const [old] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
      if (!old?.value || expectedRevision !== storedRevision(old.value)) return res.status(409).json({ error: "La composición visual cambió mientras se publicaba." });
      const current = decode(old.value);
      if (!current?.draft) return res.status(409).json({ error: "No existe un borrador visual para publicar." });
      const draft = normalizeVisualPageData(current.draft);
      const previous = current.content ? migrateVisualPageData(current.content, current.schemaVersion ?? VISUAL_SCHEMA_VERSION) : current.previous ? migrateVisualPageData(current.previous, current.schemaVersion ?? VISUAL_SCHEMA_VERSION) : null;
      const raw = JSON.stringify({
        pageId: route.pageId,
        language: route.language,
        schemaVersion: VISUAL_SCHEMA_VERSION,
        content: draft,
        previous,
        publishedAt: new Date().toISOString(),
        publishedBy: req.adminUser!.id,
      } satisfies StoredVisual);
      const updated = await db.update(siteConfig).set({ value: raw, type: "json", category: "visual", updatedAt: new Date() }).where(and(eq(siteConfig.key, key), eq(siteConfig.value, old.value))).returning({ value: siteConfig.value });
      if (!updated.length) return res.status(409).json({ error: "La composición visual cambió mientras se publicaba." });
      const syncedSections = await syncVisualBindings(draft, route.language, true);
      console.log("[VisualCMS]", JSON.stringify({ action: "publish", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json({ ...responseFor(route.pageId, route.language, raw), syncedSections });
    } catch (error) {
      console.error("[VisualCMS] Publish failed", error instanceof Error ? error.message : "unknown");
      return res.status(500).json({ error: "No se pudo publicar la composición visual." });
    }
  });

  app.post("/api/admin/visual-pages/:pageId/:language/restore", authMiddleware, requireRole("editor", "admin"), async (req, res) => {
    const route = parseRoute(req);
    if (!route) return res.status(400).json({ error: "Página o idioma visual inválido." });
    const expectedRevision = typeof req.body?.revision === "string" ? req.body.revision : "";
    if (!expectedRevision) return res.status(400).json({ error: "Falta la revisión visual." });
    const key = visualPageKey(route.pageId, route.language);
    try {
      const [old] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
      if (!old?.value || expectedRevision !== storedRevision(old.value)) return res.status(409).json({ error: "La composición visual cambió mientras se restauraba." });
      const current = decode(old.value);
      if (!current?.previous) return res.status(404).json({ error: "No existe una versión visual anterior para restaurar." });
      const previous = migrateVisualPageData(current.previous, current.schemaVersion ?? VISUAL_SCHEMA_VERSION);
      const raw = JSON.stringify({
        pageId: route.pageId,
        language: route.language,
        schemaVersion: VISUAL_SCHEMA_VERSION,
        content: current.content ? migrateVisualPageData(current.content, current.schemaVersion ?? VISUAL_SCHEMA_VERSION) : emptyVisualPageData(),
        draft: previous,
        previous,
        updatedAt: new Date().toISOString(),
        updatedBy: req.adminUser!.id,
      } satisfies StoredVisual);
      const updated = await db.update(siteConfig).set({ value: raw, type: "json", category: "visual", updatedAt: new Date() }).where(and(eq(siteConfig.key, key), eq(siteConfig.value, old.value))).returning({ value: siteConfig.value });
      if (!updated.length) return res.status(409).json({ error: "La composición visual cambió mientras se restauraba." });
      const syncedSections = await syncVisualBindings(previous, route.language, false);
      console.log("[VisualCMS]", JSON.stringify({ action: "restore", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json({ ...responseFor(route.pageId, route.language, raw), syncedSections });
    } catch (error) {
      console.error("[VisualCMS] Restore failed", error instanceof Error ? error.message : "unknown");
      return res.status(500).json({ error: "No se pudo restaurar la composición visual." });
    }
  });
}
