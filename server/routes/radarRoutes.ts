import type { Express, Request, Response } from "express";
import { z } from "zod/v3";
import { authMiddleware, requirePermission } from "../auth";
import { storage } from "../storage";
import { auditLog } from "./routeUtils";
import {
  normalizeRadarItem,
  radarSourceInputSchema,
  radarItemToNewsInsert,
  RadarInputError,
} from "../services/laborRadar";

const radarDraftSchema = radarSourceInputSchema.strict();

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
}
