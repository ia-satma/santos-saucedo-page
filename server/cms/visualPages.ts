import type { Express } from "express";
import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { siteConfig } from "@shared/schema";
import { authMiddleware, requireRole } from "../auth";
import {
  VISUAL_SCHEMA_VERSION,
  emptyVisualPageData,
  isVisualLanguage,
  isVisualPageId,
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
  const publishedData = stored?.content ? normalizeVisualPageData(stored.content) : null;
  const draftData = stored?.draft ? normalizeVisualPageData(stored.draft) : publishedData ?? emptyVisualPageData();
  return {
    pageId,
    language,
    schemaVersion: stored?.schemaVersion ?? VISUAL_SCHEMA_VERSION,
    draftData,
    publishedData,
    previousData: stored?.previous ? normalizeVisualPageData(stored.previous) : null,
    revision: storedRevision(raw),
  };
}
function invalidData(res: { status: (code: number) => { json: (value: unknown) => unknown } }, errors: string[]) {
  return res.status(400).json({ error: "La configuración visual no es válida.", details: errors });
}

export function registerVisualPageRoutes(app: Express) {
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
      const published = current?.content ? normalizeVisualPageData(current.content) : emptyVisualPageData();
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
      console.log("[VisualCMS]", JSON.stringify({ action: "draft", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json(responseFor(route.pageId, route.language, raw));
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
      const previous = current.content ? normalizeVisualPageData(current.content) : current.previous ? normalizeVisualPageData(current.previous) : null;
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
      console.log("[VisualCMS]", JSON.stringify({ action: "publish", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json(responseFor(route.pageId, route.language, raw));
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
      const previous = normalizeVisualPageData(current.previous);
      const raw = JSON.stringify({
        pageId: route.pageId,
        language: route.language,
        schemaVersion: VISUAL_SCHEMA_VERSION,
        content: current.content ? normalizeVisualPageData(current.content) : emptyVisualPageData(),
        draft: previous,
        previous,
        updatedAt: new Date().toISOString(),
        updatedBy: req.adminUser!.id,
      } satisfies StoredVisual);
      const updated = await db.update(siteConfig).set({ value: raw, type: "json", category: "visual", updatedAt: new Date() }).where(and(eq(siteConfig.key, key), eq(siteConfig.value, old.value))).returning({ value: siteConfig.value });
      if (!updated.length) return res.status(409).json({ error: "La composición visual cambió mientras se restauraba." });
      console.log("[VisualCMS]", JSON.stringify({ action: "restore", pageId: route.pageId, language: route.language, userId: req.adminUser!.id }));
      return res.json(responseFor(route.pageId, route.language, raw));
    } catch (error) {
      console.error("[VisualCMS] Restore failed", error instanceof Error ? error.message : "unknown");
      return res.status(500).json({ error: "No se pudo restaurar la composición visual." });
    }
  });
}
