import { randomUUID } from "node:crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { SocialAsset, InsertSocialAsset } from "@shared/schema";
import { socialContentSchema, socialFormatSchema, socialLanguageSchema, socialPaletteSchema, socialPayloadSchema, type SocialPayload, type SocialRevision } from "@shared/socialStudio";
import { AiGovernanceBlockedError } from "../ai/dataGovernance";
import { authMiddleware, requirePermission } from "../auth";
import { storage } from "../storage";
import { downloadPrivateStudioObject } from "../replitStorage";
import { discardSocialFiles, generateSocialContent, persistSocialRevision, reviewSocialContent, socialSlideKey, studioDesign } from "../services/socialStudio";
import { auditLog } from "./routeUtils";

const base = "/api/admin/social-assets";
const uuid = z.string().uuid();
const generationSchema = z.object({
  kind: z.enum(["post", "carousel"]),
  title: z.string().trim().min(1).max(180),
  topic: z.string().trim().min(1).max(10_000),
  language: socialLanguageSchema.default("es"),
  format: socialFormatSchema.default("square"),
  slideCount: z.number().int().min(1).max(12).default(1),
  palette: socialPaletteSchema.default("navy-lime"),
  sourceNotes: z.string().trim().max(20_000).default(""),
}).strict().refine(({ kind, slideCount }) => kind === "post" ? slideCount === 1 : slideCount >= 2);
const editSchema = z.object({
  version: z.number().int().min(1),
  title: z.string().trim().min(1).max(180),
  content: socialContentSchema,
}).strict();
const redesignSchema = z.object({
  version: z.number().int().min(1),
  format: socialFormatSchema,
  palette: socialPaletteSchema,
}).strict();

function currentPayload(asset: Pick<SocialAsset, "payload" | "topic">): SocialPayload {
  const parsed = socialPayloadSchema.safeParse(asset.payload);
  if (parsed.success) return parsed.data;
  const legacy = z.object({
    sourceNotes: z.string().default(""),
    slides: z.array(z.object({ title: z.string(), body: z.string() })).max(12),
  }).safeParse(asset.payload);
  return { caption: asset.topic, sourceNotes: legacy.success ? legacy.data.sourceNotes : "", slides: legacy.success ? legacy.data.slides : [] };
}

function fileUrl(id: string, file: string, version?: number) {
  return `${base}/${id}/file/${file}${version ? `?version=${version}` : ""}`;
}

function fileLinks(id: string, snapshot: Pick<SocialAsset, "previewUrl" | "packageUrl">, count: number, version?: number) {
  const slideUrls = socialSlideKey(id, snapshot.packageUrl, 0)
    ? Array.from({ length: count }, (_, index) => fileUrl(id, String(index + 1), version))
    : snapshot.previewUrl ? [fileUrl(id, "preview", version)] : [];
  return {
    slideUrls,
    previewUrl: slideUrls[0] ?? null,
    packageUrl: snapshot.packageUrl ? fileUrl(id, "package", version) : null,
    packageExtension: snapshot.packageUrl?.endsWith(".json") ? "json" : "zip",
  };
}

function view(asset: SocialAsset, detailed = false) {
  const revisions = asset.versions ?? [];
  const { id, kind, title, topic, language, format, slideCount, status, palette, createdAt } = asset;
  return {
    id, kind, title, topic, language, format, slideCount, status, palette, createdAt, version: revisions.length + 1,
    ...fileLinks(id, asset, slideCount, revisions.length + 1),
    ...(detailed ? {
      content: currentPayload(asset),
      versions: revisions.map(revision => {
        const content = currentPayload({ payload: revision.payload, topic });
        return {
          version: revision.version, title: revision.title, format: revision.format, palette: revision.palette,
          createdAt: revision.createdAt, content,
          ...fileLinks(id, revision, content.slides.length, revision.version),
        };
      }).reverse(),
    } : {}),
  };
}

function isOwnLegacyObject(id: string, key: string | null) {
  return key === `public/media/social-${id}.json` || key === `public/media/social-${id}-preview.png`;
}

class SocialConflictError extends Error {
  constructor() {
    super("La pieza cambió mientras la editabas. Vuelve a abrirla para ver la versión más reciente.");
  }
}

async function discardUncommittedFiles(
  id: string,
  files: Awaited<ReturnType<typeof persistSocialRevision>>,
  slideCount: number,
) {
  // A database timeout can arrive after COMMIT. Preserve the files if the
  // database still references them or if its state cannot be verified.
  try {
    const stored = await storage.getSocialAssetById(id);
    const referenced = stored?.packageUrl === files.packageUrl ||
      stored?.versions?.some(revision => revision.packageUrl === files.packageUrl);
    if (!referenced) await discardSocialFiles(id, files, slideCount);
  } catch {
    console.error("[social-studio] Could not verify uncommitted files", { id });
  }
}

async function saveNew(asset: Omit<InsertSocialAsset, "payload"> & { id: string; format: string; palette: string }, payload: SocialPayload) {
  const { format, palette } = studioDesign(asset.format, asset.palette);
  const files = await persistSocialRevision(asset.id, format, palette, payload);
  try {
    return await storage.createSocialAsset({ ...asset, ...files, payload });
  } catch (error) {
    await discardUncommittedFiles(asset.id, files, payload.slides.length);
    throw error;
  }
}

async function saveRevision(current: SocialAsset, updates: { title: string; format: string; palette: string; payload: SocialPayload }, actorId: string) {
  const { format, palette } = studioDesign(updates.format, updates.palette);
  const files = await persistSocialRevision(current.id, format, palette, updates.payload);
  const revisions = current.versions ?? [];
  const revision: SocialRevision = {
    version: revisions.length + 1,
    title: current.title, format: current.format, palette: current.palette, payload: current.payload,
    previewUrl: current.previewUrl, packageUrl: current.packageUrl,
    createdAt: (current.updatedAt ?? current.createdAt ?? new Date()).toISOString(),
    createdBy: actorId,
  };
  let saved: SocialAsset | undefined;
  try {
    saved = await storage.updateSocialAsset(current, { ...updates, ...files, versions: [...revisions, revision] });
  } catch (error) {
    await discardUncommittedFiles(current.id, files, updates.payload.slides.length);
    throw error;
  }
  if (!saved) {
    await discardSocialFiles(current.id, files, updates.payload.slides.length);
    throw new SocialConflictError();
  }
  return saved;
}

async function audit(action: string, asset: SocialAsset, req: Request) {
  try {
    await auditLog(action, "social_asset", asset.id, req.adminUser!.id, { kind: asset.kind, version: (asset.versions?.length ?? 0) + 1 }, req);
  } catch {
    console.error("[social-studio] Could not record audit event", { action, id: asset.id });
  }
}

function respond(handler: (req: Request, res: Response) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    res.set("Cache-Control", "private, no-store");
    try {
      return await handler(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(422).json({ error: "Revisa los campos y el contenido de las piezas.", details: error.flatten() });
      if (error instanceof SocialConflictError) return res.status(409).json({ error: error.message });
      if (error instanceof AiGovernanceBlockedError) return res.status(422).json({ error: "Revisa el material enviado para uso de IA." });
      console.error("[social-studio]", { name: (error as Error).name, route: req.route?.path });
      return res.status(500).json({ error: "La operación no pudo completarse. Revisa el servicio de IA o acorta el texto e inténtalo de nuevo." });
    }
  };
}

async function loadAsset(req: Request, res: Response, includeArchived = false) {
  const id = uuid.safeParse(req.params.id);
  const asset = id.success ? await storage.getSocialAssetById(id.data) : undefined;
  if (!asset || (!includeArchived && asset.status === "archived")) {
    res.status(404).json({ error: "Pieza no encontrada." });
    return undefined;
  }
  return asset;
}

function requireVersion(asset: SocialAsset, expected: number) {
  if (expected !== (asset.versions?.length ?? 0) + 1) throw new SocialConflictError();
}

export function registerSocialAssetRoutes(app: Express): void {
  const access = [authMiddleware, requirePermission("agents")];
  app.get(base, ...access, respond(async (req, res) => {
    const page = z.coerce.number().int().min(1).max(100_000).default(1).parse(req.query.page);
    const pageSize = 20;
    const assets = await storage.getSocialAssets(req.query.archived === "true", (page - 1) * pageSize, pageSize + 1);
    res.json({ items: assets.slice(0, pageSize).map(asset => view(asset)), hasMore: assets.length > pageSize });
  }));

  app.post(`${base}/generate`, ...access, respond(async (req, res) => {
    const { sourceNotes, ...brief } = generationSchema.parse(req.body);
    const generated = await generateSocialContent({ ...brief, sourceNotes }, req.adminUser!.id);
    const asset = await saveNew({ id: randomUUID(), ...brief, status: "ready" }, { ...generated, sourceNotes });
    await audit("create", asset, req);
    res.status(201).json(view(asset, true));
  }));

  app.get(`${base}/:id`, ...access, respond(async (req, res) => {
    const asset = await loadAsset(req, res, true);
    if (asset) res.json(view(asset, true));
  }));

  app.patch(`${base}/:id`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version, title, content } = editSchema.parse(req.body);
    requireVersion(current, version);
    if (content.slides.length !== current.slideCount) return res.status(422).json({ error: "Conserva el número de piezas del diseño original." });
    const updated = await saveRevision(current, { title, format: current.format, palette: current.palette, payload: { ...content, sourceNotes: currentPayload(current).sourceNotes } }, req.adminUser!.id);
    await audit("edit", updated, req);
    res.json(view(updated, true));
  }));

  app.post(`${base}/:id/redesign`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version, format, palette } = redesignSchema.parse(req.body);
    requireVersion(current, version);
    const updated = await saveRevision(current, { title: current.title, format, palette, payload: currentPayload(current) }, req.adminUser!.id);
    await audit("redesign", updated, req);
    res.json(view(updated, true));
  }));

  app.post(`${base}/:id/regenerate`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version } = z.object({ version: z.number().int().min(1) }).strict().parse(req.body);
    requireVersion(current, version);
    const { title, topic, language, format, palette, slideCount } = current;
    const { sourceNotes, slides: previousCopy } = currentPayload(current);
    const content = await generateSocialContent({
      title, topic, language, format: socialFormatSchema.parse(format), slideCount, sourceNotes, previousCopy,
    }, req.adminUser!.id);
    const updated = await saveRevision(current, { title, format, palette, payload: { ...content, sourceNotes } }, req.adminUser!.id);
    await audit("regenerate", updated, req);
    res.json(view(updated, true));
  }));

  app.post(`${base}/:id/copy`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { kind, title, topic, language, format, palette, slideCount } = current;
    const copy = await saveNew({ id: randomUUID(), kind, title: `${title.slice(0, 172)} · copia`, topic, language, format, palette, slideCount, status: "draft" }, currentPayload(current));
    await audit("copy", copy, req);
    res.status(201).json(view(copy, true));
  }));

  app.post(`${base}/:id/review`, ...access, respond(async (req, res) => {
    const asset = await loadAsset(req, res);
    if (asset) res.json(await reviewSocialContent(currentPayload(asset), asset.language, req.adminUser!.id));
  }));

  app.post(`${base}/:id/archive`, ...access, respond(async (req, res) => {
    const asset = await loadAsset(req, res, true);
    if (!asset) return;
    const { archived } = z.object({ archived: z.boolean() }).strict().parse(req.body);
    const status = archived ? "archived" : asset.packageUrl ? "ready" : "draft";
    const updated = await storage.updateSocialAsset(asset, { status, archivedAt: archived ? new Date() : null });
    if (!updated) throw new SocialConflictError();
    await audit(archived ? "archive" : "restore", updated, req);
    res.json(view(updated));
  }));

  app.get(`${base}/:id/file/:kind`, ...access, respond(async (req, res) => {
    const asset = await loadAsset(req, res, true);
    if (!asset) return;
    const version = req.query.version === undefined ? undefined : z.coerce.number().int().min(1).parse(req.query.version);
    const snapshot = version === undefined || version === (asset.versions?.length ?? 0) + 1 ? asset : asset.versions?.find(revision => revision.version === version);
    if (!snapshot) return res.status(404).end();
    const kind = req.params.kind;
    const slide = /^\d{1,2}$/.test(kind) ? Number(kind) : 0;
    const count = snapshot === asset ? asset.slideCount : currentPayload({ payload: snapshot.payload, topic: asset.topic }).slides.length;
    const packageDownload = kind === "package";
    const firstSlide = socialSlideKey(asset.id, snapshot.packageUrl, 0);
    let key: string | null = null;
    if (packageDownload && firstSlide) key = snapshot.packageUrl;
    else if (firstSlide && slide >= 1 && slide <= count) key = socialSlideKey(asset.id, snapshot.packageUrl, slide - 1);
    else if (kind === "preview" && firstSlide) key = firstSlide;
    else if (packageDownload || kind === "preview") {
      const legacyKey = packageDownload ? snapshot.packageUrl : snapshot.previewUrl;
      if (isOwnLegacyObject(asset.id, legacyKey)) key = legacyKey;
    }
    if (!key) return res.status(404).end();
    const body = await downloadPrivateStudioObject(key);
    if (!body) return res.status(404).end();
    const extension = key.endsWith(".json") ? "json" : packageDownload ? "zip" : "png";
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Security-Policy": "sandbox",
      "Content-Disposition": `${packageDownload || req.query.download === "1" ? "attachment" : "inline"}; filename="santos-saucedo-${slide || "social"}.${extension}"`,
    });
    return res.type(extension).send(body);
  }));
}
