import type { Express, Request, Response } from "express";
import { z } from "zod";
import sharp from "sharp";
import { authMiddleware, requirePermission } from "../auth";
import { storage } from "../storage";
import { downloadAppStorageObject, uploadAppStorageObject } from "../replitStorage";
import { auditLog } from "./routeUtils";
import { socialMediaAgent } from "../agents/specialized/SocialMediaAgent";

const idSchema = z.string().uuid();
const generationSchema = z.object({
  kind: z.enum(["post", "carousel"]).default("post"),
  title: z.string().trim().min(1).max(180),
  topic: z.string().trim().min(1).max(10_000),
  language: z.string().trim().min(2).max(12).default("es"),
  format: z.enum(["square", "portrait", "story", "landscape"]).default("square"),
  slideCount: z.coerce.number().int().min(1).max(12).default(1),
  palette: z.enum(["navy-lime", "navy-white"]).default("navy-lime"),
  includeImages: z.boolean().default(false),
  sourceNotes: z.string().trim().max(20_000).optional().default(""),
}).strict();

const updateSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  topic: z.string().trim().min(1).max(10_000).optional(),
  payload: z.record(z.unknown()).optional(),
  status: z.enum(["draft", "ready"]).optional(),
}).strict();

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

function canvasFor(format: string): { width: number; height: number } {
  if (format === "portrait" || format === "story") return { width: 1080, height: 1350 };
  if (format === "landscape") return { width: 1200, height: 675 };
  return { width: 1080, height: 1080 };
}

function buildSvg(asset: { title: string; topic: string; format: string; palette: string; slideCount: number }): string {
  const { width, height } = canvasFor(asset.format);
  const navy = "#0B2850";
  const lime = "#BBF741";
  const background = asset.palette === "navy-white" ? "#FFFFFF" : navy;
  const foreground = asset.palette === "navy-white" ? navy : "#FFFFFF";
  const accent = asset.palette === "navy-white" ? "#8CC63F" : lime;
  const title = escapeXml(asset.title.slice(0, 90));
  const topic = escapeXml(asset.topic.replace(/\s+/g, " ").slice(0, 220));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${background}"/>
    <text x="${Math.round(width * .08)}" y="${Math.round(height * .12)}" fill="${accent}" font-family="Arial,sans-serif" font-size="${Math.max(22, Math.round(width*.022))}" letter-spacing="4">SANTOS &amp; SAUCEDO</text>
    <text x="${Math.round(width * .08)}" y="${Math.round(height * .32)}" fill="${foreground}" font-family="Georgia,serif" font-size="${Math.max(40, Math.round(width*.065))}" font-weight="700">${title}</text>
    <foreignObject x="${Math.round(width*.08)}" y="${Math.round(height*.4)}" width="${Math.round(width*.82)}" height="${Math.round(height*.3)}"><div xmlns="http://www.w3.org/1999/xhtml" style="font: ${Math.max(24, Math.round(width*.028))}px Arial,sans-serif; color:${foreground}; line-height:1.35">${topic}</div></foreignObject>
    <text x="${Math.round(width * .08)}" y="${Math.round(height * .92)}" fill="${foreground}" opacity=".78" font-family="Arial,sans-serif" font-size="${Math.max(18, Math.round(width*.018))}" letter-spacing="2">DERECHO LABORAL PARA EMPRESAS</text>
    <text x="${Math.round(width * .92)}" y="${Math.round(height * .92)}" text-anchor="end" fill="${accent}" font-family="Arial,sans-serif" font-size="${Math.max(18, Math.round(width*.018))}">§</text>
  </svg>`;
}

function publicView(asset: Awaited<ReturnType<typeof storage.getSocialAssetById>>) {
  if (!asset) return null;
  return {
    ...asset,
    previewUrl: `/api/admin/social-assets/${asset.id}/file/preview`,
    packageUrl: `/api/admin/social-assets/${asset.id}/file/package`,
  };
}

async function renderAsset(asset: { id: string; title: string; topic: string; format: string; palette: string; slideCount: number }) {
  const svg = buildSvg(asset);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const previewKey = `public/media/social-${asset.id}-preview.png`;
  const packageKey = `public/media/social-${asset.id}.json`;
  const packageBody = Buffer.from(JSON.stringify({
    schema: "santos-social-asset/v1",
    id: asset.id,
    title: asset.title,
    topic: asset.topic,
    format: asset.format,
    slideCount: asset.slideCount,
    html: `<div data-santos-social-asset="${asset.id}"><h1>${escapeXml(asset.title)}</h1><p>${escapeXml(asset.topic)}</p></div>`,
  }, null, 2));
  await Promise.all([uploadAppStorageObject(previewKey, png), uploadAppStorageObject(packageKey, packageBody)]);
  return { previewKey, packageKey };
}

export function registerSocialAssetRoutes(app: Express): void {
  const list = async (req: Request, res: Response) => {
    try {
      const kind = typeof req.query.kind === "string" ? req.query.kind : undefined;
      const assets = await storage.getSocialAssets(kind);
      res.json(assets.filter((asset) => asset.status !== "archived").map(publicView));
    } catch (error) {
      console.error("[social-assets/list]", error);
      res.status(500).json({ error: "No fue posible cargar los contenidos sociales." });
    }
  };

  const generate = async (req: Request, res: Response) => {
    const parsed = generationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Configuración social inválida", details: parsed.error.flatten() });
    try {
      const aiResult = await socialMediaAgent.execute({ agentType: "social_media", source: "cms_social_asset" } as any, {
        title: parsed.data.title,
        topic: parsed.data.topic,
        sourceNotes: parsed.data.sourceNotes,
        language: parsed.data.language === "en" ? "en" : "es",
        platforms: ["linkedin", "instagram", "facebook"],
        aspect: parsed.data.format,
      });
      const aiContent = aiResult.success && aiResult.data && typeof aiResult.data === "object"
        ? aiResult.data as Record<string, unknown>
        : null;
      const generatedPosts = aiContent?.posts && typeof aiContent.posts === "object" ? aiContent.posts : {};
      const draft = await storage.createSocialAsset({
        ...parsed.data,
        brand: "santos-saucedo",
        status: "ready",
        renderStatus: "rendering",
        payload: {
          topic: parsed.data.topic,
          sourceNotes: parsed.data.sourceNotes,
          includeImages: parsed.data.includeImages,
          generatedBy: "gpt-6.1-sol",
          serviceTier: "fast",
          posts: generatedPosts,
          slides: Array.from({ length: parsed.data.slideCount }, (_, index) => ({
            index: index + 1,
            title: index === 0 ? parsed.data.title : `${parsed.data.title} · ${index + 1}`,
            body: typeof (generatedPosts as any)?.linkedin?.text === "string"
              ? (generatedPosts as any).linkedin.text
              : parsed.data.topic,
          })),
        },
        versions: [],
      });
      const files = await renderAsset(draft);
      const saved = await storage.updateSocialAsset(draft.id, { renderStatus: "ready", previewUrl: files.previewKey, packageUrl: files.packageKey });
      await auditLog("create", "social_asset", draft.id, req.adminUser!.id, { kind: draft.kind }, req);
      res.status(201).json(publicView(saved));
    } catch (error) {
      console.error("[social-assets/generate]", error);
      res.status(500).json({ error: "No fue posible generar el contenido social." });
    }
  };

  const detail = async (req: Request, res: Response) => {
    if (!idSchema.safeParse(req.params.id).success) return res.status(400).json({ error: "ID inválido" });
    const asset = await storage.getSocialAssetById(req.params.id);
    if (!asset || asset.status === "archived") return res.status(404).json({ error: "Contenido social no encontrado" });
    res.json(publicView(asset));
  };

  const update = async (req: Request, res: Response) => {
    if (!idSchema.safeParse(req.params.id).success) return res.status(400).json({ error: "ID inválido" });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Edición inválida", details: parsed.error.flatten() });
    const current = await storage.getSocialAssetById(req.params.id);
    if (!current || current.status === "archived") return res.status(404).json({ error: "Contenido social no encontrado" });
    const versions = [...(current.versions || []), { version: (current.versions?.length || 0) + 1, payload: current.payload, createdAt: new Date().toISOString(), createdBy: req.adminUser!.id }];
    const saved = await storage.updateSocialAsset(current.id, { ...parsed.data, versions, renderStatus: "ready" });
    await auditLog("update", "social_asset", current.id, req.adminUser!.id, { version: versions.length }, req);
    res.json(publicView(saved));
  };

  const copy = async (req: Request, res: Response) => {
    if (!idSchema.safeParse(req.params.id).success) return res.status(400).json({ error: "ID inválido" });
    const current = await storage.getSocialAssetById(req.params.id);
    if (!current || current.status === "archived") return res.status(404).json({ error: "Contenido social no encontrado" });
    const duplicate = await storage.createSocialAsset({ ...current, id: undefined, title: `${current.title} · copia`, status: "draft", versions: [], previewUrl: null, packageUrl: null, createdAt: undefined, updatedAt: undefined, archivedAt: undefined });
    const files = await renderAsset(duplicate);
    const saved = await storage.updateSocialAsset(duplicate.id, { previewUrl: files.previewKey, packageUrl: files.packageKey, renderStatus: "ready" });
    res.status(201).json(publicView(saved));
  };

  const archive = async (req: Request, res: Response) => {
    if (!idSchema.safeParse(req.params.id).success) return res.status(400).json({ error: "ID inválido" });
    const ok = await storage.archiveSocialAsset(req.params.id);
    if (!ok) return res.status(404).json({ error: "Contenido social no encontrado" });
    res.json({ ok: true });
  };

  const file = async (req: Request, res: Response) => {
    if (!idSchema.safeParse(req.params.id).success) return res.status(400).end();
    const asset = await storage.getSocialAssetById(req.params.id);
    if (!asset || asset.status === "archived") return res.status(404).end();
    const key = req.params.kind === "package" ? asset.packageUrl : asset.previewUrl;
    if (!key) return res.status(404).end();
    const body = await downloadAppStorageObject(key);
    if (!body) return res.status(404).end();
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", `${req.params.kind === "package" ? "attachment; filename=contenido-social.json" : "inline; filename=preview.png"}`);
    res.type(req.params.kind === "package" ? "application/json" : "image/png").send(body);
  };

  for (const base of ["/api/admin/social-assets", "/api/admin/posts-ai", "/api/admin/carruseles"]) {
    app.get(base, authMiddleware, requirePermission("agents"), list);
    app.post(`${base}/generate`, authMiddleware, requirePermission("agents"), generate);
    app.get(`${base}/:id`, authMiddleware, requirePermission("agents"), detail);
    app.patch(`${base}/:id`, authMiddleware, requirePermission("agents"), update);
    app.post(`${base}/:id/copy`, authMiddleware, requirePermission("agents"), copy);
    app.post(`${base}/:id/redesign`, authMiddleware, requirePermission("agents"), update);
    app.post(`${base}/:id/review`, authMiddleware, requirePermission("agents"), update);
    app.post(`${base}/:id/archive`, authMiddleware, requirePermission("agents"), archive);
    app.get(`${base}/:id/file/:kind`, authMiddleware, requirePermission("agents"), file);
  }
}
