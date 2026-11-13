import type { Express, Request, Response } from "express";
import { z } from "zod/v3";
import { authMiddleware, requirePermission } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { siteConfig } from "@shared/schema";
import { eq } from "drizzle-orm";
import { auditLog } from "./routeUtils";
import {
  normalizeRadarItem,
  radarSourceInputSchema,
  radarItemToNewsInsert,
  RadarInputError,
} from "../services/laborRadar";
import { RADAR_ENTITIES, runRadarSources } from "../services/radarSources";

const radarDraftSchema = radarSourceInputSchema.strict();
const radarSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  timezone: z.string().trim().min(1).max(80).default("America/Monterrey"),
  hour: z.number().int().min(0).max(23).default(7),
  minute: z.number().int().min(0).max(59).default(0),
  days: z.array(z.number().int().min(0).max(6)).min(1).max(7).default([0, 1, 2, 3, 4, 5, 6]),
  scope: z.literal("all_mexico").default("all_mexico"),
  priorityEntity: z.literal("Nuevo León").default("Nuevo León"),
  sources: z.object({ dof: z.boolean().default(true), sjf: z.boolean().default(true) }).default({ dof: true, sjf: true }),
  lastRunAt: z.string().datetime({ offset: true }).nullable().default(null),
  lastRunStatus: z.enum(["idle", "running", "success", "partial", "failed"]).default("idle"),
  lastRunMessage: z.string().max(1000).default(""),
});
type RadarSettings = z.infer<typeof radarSettingsSchema>;
const RADAR_SETTINGS_KEY = "radar.settings";
const defaultRadarSettings: RadarSettings = radarSettingsSchema.parse({});
let schedulerHandle: ReturnType<typeof setInterval> | undefined;
let schedulerBusy = false;

async function getRadarSettings(): Promise<RadarSettings> {
  const [row] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, RADAR_SETTINGS_KEY)).limit(1);
  if (!row?.value) return defaultRadarSettings;
  try { return radarSettingsSchema.parse({ ...defaultRadarSettings, ...JSON.parse(row.value), sources: { ...defaultRadarSettings.sources, ...JSON.parse(row.value).sources } }); }
  catch { return defaultRadarSettings; }
}

async function saveRadarSettings(settings: RadarSettings): Promise<RadarSettings> {
  const value = JSON.stringify(settings);
  await db.insert(siteConfig).values({ key: RADAR_SETTINGS_KEY, value, type: "json", category: "radar", description: "Configuración del Radar Jurídico" }).onConflictDoUpdate({ target: siteConfig.key, set: { value, type: "json", category: "radar", updatedAt: new Date() } });
  return settings;
}

async function runConfiguredRadar(req: Request | null, date?: string) {
  const settings = await getRadarSettings();
  const sources = (Object.entries(settings.sources).filter(([, enabled]) => enabled).map(([source]) => source) as Array<"dof" | "sjf">);
  if (!sources.length) return { settings, created: 0, duplicates: 0, errors: ["Activa al menos una fuente oficial."], items: 0 };
  await saveRadarSettings({ ...settings, lastRunAt: new Date().toISOString(), lastRunStatus: "running", lastRunMessage: "Extracción en curso." });
  const run = await runRadarSources({ date, sources, limit: 25 });
  let created = 0;
  let duplicates = 0;
  for (const item of run.items) {
    const insert = radarItemToNewsInsert(item);
    const existing = (await storage.getNews()).find((news) => news.slug === insert.slug || (news.sourceUrl === insert.sourceUrl && news.titleEs === insert.titleEs));
    if (existing) { duplicates += 1; continue; }
    const news = await storage.createNews(insert);
    created += 1;
    if (req?.adminUser) await auditLog("create_from_radar", "news", news.id, req.adminUser.id, { sourceType: item.sourceType, sourceId: item.sourceId, sourceUrl: item.officialUrl, fingerprint: item.fingerprint, published: false }, req);
  }
  const status = run.errors.length && !run.items.length ? "failed" : run.errors.length ? "partial" : "success";
  const updated = await saveRadarSettings({ ...settings, lastRunAt: new Date().toISOString(), lastRunStatus: status, lastRunMessage: `${created} borradores nuevos, ${duplicates} duplicados${run.errors.length ? `. ${run.errors.length} incidencias.` : "."}` });
  return { settings: updated, date: run.date, created, duplicates, errors: run.errors, items: run.items.length };
}

function localScheduleKey(settings: RadarSettings, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: settings.timezone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return `${get("year")}-${get("month")}-${get("day")} ${weekday} ${get("hour")}:${get("minute")}`;
}

export function startRadarScheduler(): void {
  if (schedulerHandle || process.env.NODE_ENV === "test") return;
  schedulerHandle = setInterval(async () => {
    if (schedulerBusy) return;
    try {
      const settings = await getRadarSettings();
      const schedule = localScheduleKey(settings);
      const [, weekday, clock] = schedule.match(/\d{4}-\d{2}-\d{2} (\d+) (\d{2}:\d{2})$/) || [];
      const [hour, minute] = (clock || "").split(":").map(Number);
      const today = schedule.slice(0, 10);
      const lastDay = settings.lastRunAt ? new Intl.DateTimeFormat("en-CA", { timeZone: settings.timezone }).format(new Date(settings.lastRunAt)) : "";
      if (!settings.enabled || !settings.days.includes(Number(weekday)) || hour !== settings.hour || minute !== settings.minute || lastDay === today) return;
      schedulerBusy = true;
      await runConfiguredRadar(null);
    } catch (error) { console.error("[Radar] scheduler error", error); }
    finally { schedulerBusy = false; }
  }, 60_000);
  schedulerHandle.unref?.();
}

/**
 * Converts one normalized Radar finding into the existing Monitor Laboral
 * record shape. English starts as a reviewable fallback until an editor or the
 * translation agent supplies a verified translation. Publication is always
 * disabled here.
 */
function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message || "Revisa los datos del hallazgo.";
  if (error instanceof Error) return error.message;
  return "No se pudo convertir el hallazgo en un borrador.";
}

/**
 * Manual, review-first bridge from the Radar normalizer to Monitor Laboral.
 * Source adapters can call this route after fetching an approved official
 * source. It is intentionally not a scheduler and never publishes content.
 */
export function registerRadarRoutes(app: Express): void {
  app.get("/api/admin/radar", authMiddleware, requirePermission("editorial_content"), async (_req, res) => {
    try {
      const [settings, news] = await Promise.all([getRadarSettings(), storage.getNews()]);
      const items = news.filter((item) => item.tags?.includes("radar-juridico") || /Diario Oficial|Semanario Judicial/i.test(item.sourceName || ""));
      // Older radar drafts were created with only an excerpt. Backfill the editable Spanish body
      // when it is empty so opening an existing finding never shows a blank editor.
      await Promise.all(items.filter((item) => !item.contentEs?.trim()).map((item) => storage.updateNews(item.id, {
        content: item.excerptEs || item.titleEs || item.title,
        contentEs: [item.excerptEs || item.titleEs || item.title, item.sourceName ? `Fuente oficial: ${item.sourceName}.` : "", item.sourceUrl ? `Consulta la publicación original: ${item.sourceUrl}` : ""].filter(Boolean).join("\n\n"),
      })));
      res.setHeader("Cache-Control", "no-store");
      res.json({ settings, items, entities: RADAR_ENTITIES, sources: [{ code: "dof", name: "Diario Oficial de la Federación", url: "https://sidof.segob.gob.mx/datos_abiertos", automatic: true }, { code: "sjf", name: "Semanario Judicial de la Federación", url: process.env.SJF_RADAR_FEED_URL || "https://bicentenario.scjn.gob.mx/repositorio-scjn/api/v1/tesis/ids", automatic: Boolean(process.env.SJF_RADAR_FEED_URL) }] });
    } catch (error) {
      console.error("[Radar] read error", error);
      res.status(500).json({ error: "No se pudo cargar el Radar jurídico." });
    }
  });
  app.put("/api/admin/radar/settings", authMiddleware, requirePermission("editorial_content"), async (req, res) => {
    const parsed = radarSettingsSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(422).json({ error: "Revisa la programación y las fuentes del Radar." });
    const settings = await saveRadarSettings(parsed.data);
    res.json({ settings });
  });
  app.post("/api/admin/radar/run", authMiddleware, requirePermission("editorial_content"), async (req, res) => {
    const requestedDate = typeof req.body?.date === "string" ? req.body.date : undefined;
    if (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) return res.status(422).json({ error: "La fecha debe usar el formato AAAA-MM-DD." });
    try { res.status(200).json(await runConfiguredRadar(req, requestedDate)); }
    catch (error) { console.error("[Radar] manual run error", error); res.status(502).json({ error: "No se pudo completar la extracción oficial." }); }
  });
  app.post(
    "/api/admin/radar/news-draft",
    authMiddleware,
    requirePermission("editorial_content"),
    async (req: Request, res: Response) => {
      try {
        const parsed = radarDraftSchema.parse(req.body ?? {});
        const item = normalizeRadarItem(parsed);
        const insert = radarItemToNewsInsert(item);
        const existing = (await storage.getNews()).find((news) =>
          news.slug === insert.slug || (news.sourceUrl === insert.sourceUrl && news.titleEs === insert.titleEs),
        );
        if (existing) {
          return res.status(200).json({ news: existing, created: false, published: Boolean(existing.published) });
        }

        const news = await storage.createNews(insert);
        await auditLog("create_from_radar", "news", news.id, req.adminUser!.id, {
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          sourceUrl: item.officialUrl,
          fingerprint: item.fingerprint,
          published: false,
        }, req);
        return res.status(201).json({ news, created: true, published: false });
      } catch (error) {
        if (error instanceof RadarInputError || error instanceof z.ZodError) {
          return res.status(422).json({ error: errorMessage(error) });
        }
        console.error("Create Radar Monitor draft error:", error);
        return res.status(500).json({ error: "No se pudo guardar el borrador del Monitor Laboral." });
      }
    },
  );
  startRadarScheduler();
}
