import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import type { Express, Request, Response } from "express";
import { z } from "zod/v3";
import type { SocialAsset, InsertSocialAsset } from "@shared/schema";
import { MAX_EDITORIAL_NOTES_CHARACTERS, MAX_EDITORIAL_SOURCE_CHARACTERS } from "@shared/editorialSources";
import {
  socialBackgroundSchema,
  socialContentSchema,
  socialCopyLimits,
  socialDesignDirectionSchema,
  socialFormatSchema,
  socialLanguageSchema,
  socialPaletteRequestSchema,
  socialPaletteSchema,
  socialPayloadSchema,
  socialReferenceDocumentSchema,
  socialSupportImageSchema,
  type SocialDesign,
  type SocialPayload,
  type SocialRevision,
} from "@shared/socialStudio";
import { AiGovernanceBlockedError } from "../ai/dataGovernance";
import { authMiddleware, requirePermission } from "../auth";
import { hydratePresentationInput } from "../media/presentationInputs";
import { storage } from "../storage";
import { downloadPrivateStudioObject } from "../replitStorage";
import { EditorialSourceError } from "../services/editorialSourceDigest";
import { SOCIAL_REFERENCE_KIT } from "../services/socialReferenceKit";
import {
  discardGeneratedSocialImages,
  discardSocialFiles,
  generateSocialContent,
  generateSocialCopies,
  persistSocialRevision,
  renderSocialSlide,
  reviewSocialContent,
  socialHtmlKey,
  socialSlideKey,
  SocialGenerationError,
  studioDesign,
} from "../services/socialStudio";
import { auditLog } from "./routeUtils";

const base = "/api/admin/social-assets";
const uuid = z.string().uuid();
const defaultDesign = {
  direction: "varied",
  background: "auto",
  requestedPalette: "auto",
  illustrate: false,
  webSearch: false,
} satisfies SocialDesign;
const generationSchema = z.object({
  kind: z.enum(["post", "carousel"]),
  title: z.string().trim().max(180).default(""),
  topic: z.string().trim().max(10_000).default(""),
  language: socialLanguageSchema.default("es"),
  format: socialFormatSchema.default("square"),
  slideCount: z.number().int().min(1).max(12).default(1),
  palette: socialPaletteRequestSchema.default(defaultDesign.requestedPalette),
  designDirection: socialDesignDirectionSchema.default(defaultDesign.direction),
  background: socialBackgroundSchema.default(defaultDesign.background),
  illustrate: z.boolean().default(defaultDesign.illustrate),
  webSearch: z.boolean().default(defaultDesign.webSearch),
  sourceNotes: z.string().trim().max(MAX_EDITORIAL_NOTES_CHARACTERS).default(""),
  documents: z.array(socialReferenceDocumentSchema).max(20).default([]),
  supportImages: z.array(socialSupportImageSchema).max(10).default([]),
}).strict().superRefine((input, context) => {
  if (input.kind === "post" ? input.slideCount !== 1 : input.slideCount < 2) {
    context.addIssue({ code: "custom", path: ["slideCount"], message: "El número de piezas no coincide con el tipo elegido." });
  }
  if (!input.title && !input.topic && !input.sourceNotes && !input.documents.length) {
    context.addIssue({ code: "custom", path: ["topic"], message: "Escribe un tema, pega material de apoyo o sube un documento." });
  }
});
const editSchema = z.object({
  version: z.number().int().min(1),
  title: z.string().trim().min(1).max(180),
  content: socialContentSchema,
}).strict();
const redesignSchema = z.object({
  version: z.number().int().min(1),
  format: socialFormatSchema.optional(),
  palette: socialPaletteRequestSchema.optional(),
  designDirection: socialDesignDirectionSchema.optional(),
  background: socialBackgroundSchema.optional(),
}).strict();
const previewSchema = redesignSchema.extend({
  index: z.number().int().min(0).max(11),
  slide: socialContentSchema.innerType().shape.slides.element,
});

class SocialInputError extends Error {}

async function readReferenceText(documents: NonNullable<SocialPayload["documents"]>) {
  if (!documents.length) return "";
  const files: { file: string; name: string }[] = [];
  let bytes = 0;
  for (const document of documents) {
    const file = await hydratePresentationInput(document.url).catch(() => {
      throw new SocialInputError("No se pudo recuperar uno de los documentos adjuntos. Vuelve a subirlo.");
    });
    bytes += (await stat(file)).size;
    if (bytes > 200 * 1024 * 1024) throw new SocialInputError("Los documentos adjuntos exceden 200 MB en total.");
    files.push({ file, name: document.name });
  }
  const { extractText } = await import("../services/documentText");
  const sections: string[] = [];
  let chars = 0;
  for (const { file, name } of files) {
    const result = await extractText(file, name, { rejectOverLimit: true, maxChars: MAX_EDITORIAL_SOURCE_CHARACTERS });
    if (!result.ok) throw new SocialInputError(result.note || "No se pudo leer un documento adjunto.");
    const section = ["Documento: " + result.name, result.text].join("\n");
    chars += section.length;
    if (chars > MAX_EDITORIAL_SOURCE_CHARACTERS) throw new SocialInputError("El material adjunto excede dos millones de caracteres en total. Divide los documentos en varios trabajos.");
    sections.push(section);
  }
  return sections.join("\n\n");
}

function currentPayload(asset: Pick<SocialAsset, "payload" | "topic">): SocialPayload {
  const parsed = socialPayloadSchema.safeParse(asset.payload);
  if (parsed.success) return parsed.data;
  const legacy = z.object({
    sourceNotes: z.string().default(""),
    slides: z.array(z.object({ title: z.string(), body: z.string() })).max(12),
  }).safeParse(asset.payload);
  return { caption: asset.topic, sourceNotes: legacy.success ? legacy.data.sourceNotes : "", slides: legacy.success ? legacy.data.slides : [] };
}

function freshImageRefs(payload: SocialPayload, previous?: SocialPayload): string[] {
  return (payload.imageRefs ?? []).filter((ref): ref is string =>
    Boolean(ref?.startsWith("private:studio/social-ai-") && !previous?.imageRefs?.includes(ref)));
}

function applyDesignOverrides(current: SocialAsset, overrides: Omit<z.infer<typeof redesignSchema>, "version">) {
  const payload = currentPayload(current);
  const storedPalette = socialPaletteSchema.parse(current.palette);
  const previous = payload.design ?? { ...defaultDesign, requestedPalette: storedPalette };
  const design = {
    ...previous,
    direction: overrides.designDirection ?? previous.direction,
    background: overrides.background ?? previous.background,
    requestedPalette: overrides.palette ?? previous.requestedPalette,
  };
  const requestedPalette = socialPaletteSchema.safeParse(overrides.palette);
  const changedDirection = design.direction !== previous.direction;
  const changedPalette = design.requestedPalette !== previous.requestedPalette;
  const changedBackground = design.background !== previous.background;
  const automaticPalette = design.direction === "editorial" || design.direction === "educational" ? "navy-white" : "navy-lime";
  const slides = payload.slides.map(slide => {
    if (!slide.design) return slide;
    return {
      ...slide,
      design: {
        direction: changedDirection ? undefined : slide.design.direction,
        palette: changedPalette ? undefined : slide.design.palette,
        background: changedBackground ? undefined : slide.design.background,
      },
    };
  });
  return {
    format: socialFormatSchema.parse(overrides.format ?? current.format),
    palette: requestedPalette.success ? requestedPalette.data : changedPalette ? automaticPalette : storedPalette,
    payload: { ...payload, design, slides },
  };
}

function fileUrl(id: string, file: string, version?: number) {
  return `${base}/${id}/file/${file}${version ? `?version=${version}` : ""}`;
}

function fileLinks(id: string, snapshot: Pick<SocialAsset, "previewUrl" | "packageUrl">, count: number, version: number, hasHtml: boolean) {
  const slideUrls = socialSlideKey(id, snapshot.packageUrl, 0)
    ? Array.from({ length: count }, (_, index) => fileUrl(id, String(index + 1), version))
    : snapshot.previewUrl ? [fileUrl(id, "preview", version)] : [];
  return {
    slideUrls,
    htmlUrls: hasHtml && socialHtmlKey(id, snapshot.packageUrl, 0)
      ? Array.from({ length: count }, (_, index) => fileUrl(id, "html-" + (index + 1), version)) : [],
    previewUrl: slideUrls[0] ?? null,
    packageUrl: snapshot.packageUrl ? fileUrl(id, "package", version) : null,
    packageExtension: snapshot.packageUrl?.endsWith(".json") ? "json" : "zip",
  };
}

function view(asset: SocialAsset, detailed = false) {
  const revisions = asset.versions ?? [];
  const content = currentPayload(asset);
  const { id, kind, title, topic, language, format, slideCount, status, palette, createdAt } = asset;
  return {
    id, kind, title, topic, language, format, slideCount, status, palette, createdAt, version: revisions.length + 1,
    ...fileLinks(id, asset, slideCount, revisions.length + 1, Boolean(content.design)),
    ...(detailed ? {
      content,
      versions: revisions.map(revision => {
        const content = currentPayload({ payload: revision.payload, topic });
        return {
          version: revision.version, title: revision.title, format: revision.format, palette: revision.palette,
          createdAt: revision.createdAt, content,
          ...fileLinks(id, revision, content.slides.length, revision.version, Boolean(content.design)),
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
  freshImages: string[],
) {
  // A database timeout can arrive after COMMIT. Preserve the files if the
  // database still references them or if its state cannot be verified.
  try {
    const stored = await storage.getSocialAssetById(id);
    const referenced = stored?.packageUrl === files.packageUrl ||
      stored?.versions?.some(revision => revision.packageUrl === files.packageUrl);
    if (!referenced) await Promise.all([discardSocialFiles(id, files, slideCount), discardGeneratedSocialImages(freshImages)]);
  } catch {
    console.error("[social-studio] Could not verify uncommitted files", { id });
  }
}

async function saveNew(asset: Omit<InsertSocialAsset, "payload"> & { id: string; format: string; palette: string }, payload: SocialPayload, freshImages: string[] = []) {
  const { format, palette } = studioDesign(asset.format, asset.palette);
  const files = await persistSocialRevision(asset.id, format, palette, payload).catch(async error => {
    await discardGeneratedSocialImages(freshImages);
    throw error;
  });
  try {
    return await storage.createSocialAsset({ ...asset, ...files, payload });
  } catch (error) {
    await discardUncommittedFiles(asset.id, files, payload.slides.length, freshImages);
    throw error;
  }
}

async function saveRevision(current: SocialAsset, updates: { title: string; format: string; palette: string; payload: SocialPayload }, actorId: string, freshImages: string[] = []) {
  const { format, palette } = studioDesign(updates.format, updates.palette);
  const files = await persistSocialRevision(current.id, format, palette, updates.payload).catch(async error => {
    await discardGeneratedSocialImages(freshImages);
    throw error;
  });
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
    await discardUncommittedFiles(current.id, files, updates.payload.slides.length, freshImages);
    throw error;
  }
  if (!saved) {
    await Promise.all([discardSocialFiles(current.id, files, updates.payload.slides.length), discardGeneratedSocialImages(freshImages)]);
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
      if (error instanceof z.ZodError) return res.status(422).json({ error: error.issues[0]?.message || "Revisa los campos y el contenido de las piezas.", details: error.flatten() });
      if (error instanceof SocialInputError || error instanceof EditorialSourceError) return res.status(422).json({ error: error.message });
      if (error instanceof SocialGenerationError) return res.status(502).json({ error: error.message, code: "SOCIAL_OUTPUT_INVALID" });
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
  app.get(`${base}/reference-kit`, ...access, async (_req, res) => {
    try {
      await stat(SOCIAL_REFERENCE_KIT.catalog);
      res.download(SOCIAL_REFERENCE_KIT.catalog, "Catalogo-Redes-Sociales-Santos-Saucedo.html");
    } catch {
      res.status(404).end();
    }
  });
  app.get(base, ...access, respond(async (req, res) => {
    const page = z.coerce.number().int().min(1).max(100_000).default(1).parse(req.query.page);
    const pageSize = 20;
    const assets = await storage.getSocialAssets(req.query.archived === "true", (page - 1) * pageSize, pageSize + 1);
    res.json({ items: assets.slice(0, pageSize).map(asset => view(asset)), hasMore: assets.length > pageSize });
  }));

  app.post(`${base}/generate`, ...access, respond(async (req, res) => {
    const {
      kind, title, topic, language, format, slideCount, sourceNotes, documents, supportImages,
      palette: requestedPalette, designDirection, background, illustrate, webSearch,
    } = generationSchema.parse(req.body);
    const { palette, caption, copies, slides, imageRefs, sources, sourceProcessing } = await generateSocialContent({
      title, topic, language, format, slideCount, sourceNotes, supportImages,
      documentsText: await readReferenceText(documents), palette: requestedPalette, designDirection, background, illustrate, webSearch,
    }, req.adminUser!.id);
    const design = { direction: designDirection, background, requestedPalette, illustrate, webSearch };
    const payload = { caption, copies, slides, design, supportImages, imageRefs, sources, sourceNotes, documents };
    const asset = await saveNew({
      id: randomUUID(), kind, title: title || slides[0].title, topic, language, format, slideCount, palette, status: "ready",
    }, payload, freshImageRefs(payload));
    await audit("create", asset, req);
    res.status(201).json({ ...view(asset, true), sourceProcessing });
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
    const previous = currentPayload(current);
    const copies = content.copies ?? (previous.copies && {
      ...previous.copies,
      instagram: content.caption === previous.caption ? previous.copies.instagram : content.caption.slice(0, socialCopyLimits.instagram),
    });
    const payload = {
      ...previous,
      ...content,
      copies,
      design: previous.design ?? { ...defaultDesign, requestedPalette: socialPaletteSchema.parse(current.palette) },
    };
    const updated = await saveRevision(current, { title, format: current.format, palette: current.palette, payload }, req.adminUser!.id);
    await audit("edit", updated, req);
    res.json(view(updated, true));
  }));

  app.post(`${base}/:id/redesign`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version, ...overrides } = redesignSchema.parse(req.body);
    requireVersion(current, version);
    const { format, palette, payload } = applyDesignOverrides(current, overrides);
    const updated = await saveRevision(current, { title: current.title, format, palette, payload }, req.adminUser!.id);
    await audit("redesign", updated, req);
    res.json(view(updated, true));
  }));

  app.post(`${base}/:id/preview`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version, index, slide, ...overrides } = previewSchema.parse(req.body);
    requireVersion(current, version);
    if (index >= current.slideCount) return res.status(404).end();
    const { format, palette, payload } = applyDesignOverrides(current, overrides);
    const png = await renderSocialSlide(slide, format, palette, index, current.slideCount, {
      design: payload.design,
      imageRef: payload.imageRefs?.[index],
    });
    return res.set("X-Content-Type-Options", "nosniff").type("png").send(png);
  }));

  app.post(`${base}/:id/regenerate`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { version, copiesOnly } = z.object({
      version: z.number().int().min(1),
      copiesOnly: z.boolean().default(false),
    }).strict().parse(req.body);
    requireVersion(current, version);
    const { title, topic, language, format, slideCount } = current;
    const previous = currentPayload(current);
    const { sourceNotes, documents = [], slides: previousCopy, imageRefs, supportImages } = previous;
    const design = previous.design ?? { ...defaultDesign, requestedPalette: socialPaletteSchema.parse(current.palette) };
    if (copiesOnly) {
      const copies = await generateSocialCopies(previous, language, req.adminUser!.id);
      const payload = { ...previous, caption: copies.instagram, copies, design };
      const updated = await saveRevision(current, { title, format, palette: current.palette, payload }, req.adminUser!.id);
      await audit("regenerate_copies", updated, req);
      return res.json(view(updated, true));
    }
    const { palette, caption, copies, slides, imageRefs: updatedImageRefs, sources, sourceProcessing } = await generateSocialContent({
      title, topic, language, format: socialFormatSchema.parse(format), slideCount, sourceNotes, previousCopy, imageRefs, supportImages,
      documentsText: await readReferenceText(documents),
      designDirection: design.direction,
      background: design.background,
      palette: design.requestedPalette,
      illustrate: design.illustrate,
      webSearch: design.webSearch,
    }, req.adminUser!.id);
    const payload = { ...previous, caption, copies, slides, design, imageRefs: updatedImageRefs, sources };
    const updated = await saveRevision(current, { title, format, palette, payload }, req.adminUser!.id, freshImageRefs(payload, previous));
    await audit("regenerate", updated, req);
    res.json({ ...view(updated, true), sourceProcessing });
  }));

  app.post(`${base}/:id/copy`, ...access, respond(async (req, res) => {
    const current = await loadAsset(req, res);
    if (!current) return;
    const { kind, title, topic, language, format, palette, slideCount } = current;
    const { payload } = applyDesignOverrides(current, {});
    const copy = await saveNew({ id: randomUUID(), kind, title: `${title.slice(0, 172)} · copia`, topic, language, format, palette, slideCount, status: "draft" }, payload);
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
    const html = /^html-(\d{1,2})$/.exec(kind);
    const slide = html ? Number(html[1]) : /^\d{1,2}$/.test(kind) ? Number(kind) : 0;
    const count = snapshot === asset ? asset.slideCount : currentPayload({ payload: snapshot.payload, topic: asset.topic }).slides.length;
    const packageDownload = kind === "package";
    const firstSlide = socialSlideKey(asset.id, snapshot.packageUrl, 0);
    let key: string | null = null;
    if (html && slide >= 1 && slide <= count) key = socialHtmlKey(asset.id, snapshot.packageUrl, slide - 1);
    else if (packageDownload && firstSlide) key = snapshot.packageUrl;
    else if (firstSlide && slide >= 1 && slide <= count) key = socialSlideKey(asset.id, snapshot.packageUrl, slide - 1);
    else if (kind === "preview" && firstSlide) key = firstSlide;
    else if (packageDownload || kind === "preview") {
      const legacyKey = packageDownload ? snapshot.packageUrl : snapshot.previewUrl;
      if (isOwnLegacyObject(asset.id, legacyKey)) key = legacyKey;
    }
    if (!key) return res.status(404).end();
    const body = await downloadPrivateStudioObject(key);
    if (!body) return res.status(404).end();
    const extension = html ? "html" : key.endsWith(".json") ? "json" : packageDownload ? "zip" : "png";
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Security-Policy": "sandbox",
      "Content-Disposition": `${html || packageDownload || req.query.download === "1" ? "attachment" : "inline"}; filename="santos-saucedo-${slide || "social"}.${extension}"`,
    });
    return res.type(extension).send(body);
  }));
}
