import { persistPresentationInput, hydratePresentationInput } from "../media/presentationInputs";
import type { Express, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod/v3";
import JSZip from "jszip";
import type { ExecutionContext } from "../agents/core/types";
import { AiGovernanceBlockedError } from "../ai/dataGovernance";
import {
  TEXTUAL_AGENT_TYPES,
  copyPlainText,
  getAgentCopy,
  listAgentCopies,
  setAgentCopyArchived,
} from "../agents/storage/CopyHistory";
import { authMiddleware, requirePermission } from "../auth";
import { listPersistentPublicMediaPaths, persistentPublicMediaExists } from "../media/persistentMedia";
import {
  openPrivatePresentationStream,
  privatePresentationExists,
  privatePresentationMimeType,
  privatePresentationPathBelongsTo,
} from "../media/privatePresentations";
import {
  privatePresentationDir,
  removeUploadQuietly,
  scanFileForMalware,
  validatePresentationInput,
} from "../security/uploads";
import { storage } from "../storage";
import { auditLog } from "./routeUtils";
import { presentationMediaPathSchema, receivePresentationDocument } from "./uploadMiddleware";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import { MAX_EDITORIAL_NOTES_CHARACTERS, MAX_EDITORIAL_SOURCE_CHARACTERS } from "@shared/editorialSources";
import { PRESENTATION_REFERENCE_TEMPLATE } from "../services/presentation/referenceTemplate";
import { smartImageGenerator } from "../services/SmartImageGenerator";
import { randomUUID } from "node:crypto";

const languageCodes = SUPPORTED_LANGUAGES.map(({ code }) => code) as [string, ...string[]];

const generatedImagesDir = path.join(process.cwd(), "public", "generated-images");
const generatedAudioDir = path.join(process.cwd(), "public", "generated-audio");
const privatePresentationApiView = async (presentation: Awaited<ReturnType<typeof storage.getGeneratedPresentationById>>) => {
  if (!presentation) return null;
  const active = presentation.status === "active";
  const pngRefs = Array.isArray(presentation.pngUrls) ? presentation.pngUrls : [];
  const validPptx = active && privatePresentationPathBelongsTo(presentation.pptxUrl, presentation.id);
  const validPdf = active && privatePresentationPathBelongsTo(presentation.pdfUrl, presentation.id);
  const validPng = pngRefs.map((ref) => active && privatePresentationPathBelongsTo(ref, presentation.id));
  const [pptxAvailable, pdfAvailable, pngAvailable] = await Promise.all([
    validPptx ? privatePresentationExists(presentation.pptxUrl!) : false,
    validPdf ? privatePresentationExists(presentation.pdfUrl!) : false,
    Promise.all(pngRefs.map((ref, index) => validPng[index] ? privatePresentationExists(ref) : false)),
  ]);
  return {
    ...presentation,
    pptxUrl: pptxAvailable ? `/api/admin/generated-presentations/${presentation.id}/files/pptx` : null,
    pdfUrl: pdfAvailable ? `/api/admin/generated-presentations/${presentation.id}/files/pdf` : null,
    // Conservar posiciones: availability[index] debe corresponder siempre a la
    // misma diapositiva, incluso si un objeto intermedio falta.
    pngUrls: validPng.map((valid, index) => valid
      ? `/api/admin/generated-presentations/${presentation.id}/slides/${index}`
      : ""),
    availability: {
      pptx: pptxAvailable,
      pdf: pdfAvailable,
      png: pngAvailable,
    },
  };
};

function streamPrivatePresentation(
  res: Response,
  storagePath: string,
  stream: NodeJS.ReadableStream,
  downloadName: string,
  disposition: "attachment" | "inline" = "attachment",
): void {
  res.setHeader("Content-Type", privatePresentationMimeType(storagePath));
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", "sandbox");
  res.setHeader("Content-Disposition", `${disposition}; filename="${downloadName}"`);
  stream.once("error", () => {
    if (!res.headersSent) res.status(404).end();
    else res.destroy();
  });
  stream.pipe(res);
}

export function registerAgentAssetHistoryRoutes(app: Express): void {
  app.get("/api/admin/presentations/reference-template/:format", authMiddleware, requirePermission("agents"), (req: Request, res: Response) => {
    const format = z.enum(["pptx", "html"]).safeParse(req.params.format);
    if (!format.success) return res.status(404).end();
    const file = format.data === "pptx" ? PRESENTATION_REFERENCE_TEMPLATE.pptx : PRESENTATION_REFERENCE_TEMPLATE.html;
    if (!fs.existsSync(file)) return res.status(404).end();
    res.download(file, format.data === "pptx" ? "Presentacion-Santos-Saucedo.pptx" : "Presentacion-Santos-Saucedo.html");
  });
  const generatedAssetAvailable = async (
    publicPath: string,
    localRoot: string,
    persistentPaths: Set<string> | null,
  ): Promise<boolean> => {
    const localPath = path.join(localRoot, path.basename(publicPath));
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) return true;
    if (persistentPaths) return persistentPaths.has(publicPath);
    return persistentPublicMediaExists(publicPath);
  };

  // Historial permanente de imágenes generadas por IA.
  app.get("/api/admin/generated-images", authMiddleware, requirePermission("agents"), async (_req: Request, res: Response) => {
    try {
      const images = await storage.getGeneratedImages();
      const persistentPaths = await listPersistentPublicMediaPaths();
      res.json(await Promise.all(images.map(async (image) => ({
        ...image,
        available: await generatedAssetAvailable(image.imageUrl, generatedImagesDir, persistentPaths),
      }))));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated images" });
    }
  });

  app.post("/api/admin/generated-images/generate", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    const parsed = z.object({
      prompt: z.string().trim().min(8).max(4_000),
      style: z.enum(["santos-editorial", "libre"]).default("santos-editorial"),
      aspect: z.enum(["1:1", "16:9", "9:16", "4:5"]).default("1:1"),
    }).strict().safeParse(req.body ?? {});
    if (!parsed.success) return res.status(422).json({ error: "Escribe una descripción de al menos 8 caracteres y revisa las opciones." });
    try {
      const styleInstruction = parsed.data.style === "santos-editorial"
        ? "Identidad editorial de Santos & Saucedo: fotografía documental sobria, luz natural, composición limpia, azul profundo y lima solo cuando sean parte natural de la escena, sin logos ni texto."
        : "Estilo libre solicitado por el editor, manteniendo una imagen profesional, legible y sin texto, logos ni marcas de agua.";
      const result = await smartImageGenerator.generateImage(
        `${parsed.data.prompt}. ${styleInstruction}`,
        `manual-${randomUUID()}`,
        parsed.data.aspect,
        "internal",
        "editorial",
      );
      if (!result.success || !result.imageUrl || result.engine === "placeholder") {
        return res.status(502).json({ error: result.errorMessage || "El proveedor no pudo generar la imagen." });
      }
      const persistentPaths = await listPersistentPublicMediaPaths();
      return res.status(201).json({
        imageUrl: result.imageUrl,
        engine: result.engine,
        prompt: result.originalPrompt,
        available: await generatedAssetAvailable(result.imageUrl, generatedImagesDir, persistentPaths),
      });
    } catch (error) {
      console.error("Manual generated image error:", error);
      return res.status(502).json({ error: "No se pudo generar la imagen. Revisa el proveedor y vuelve a intentarlo." });
    }
  });

  app.delete("/api/admin/generated-images/:id", authMiddleware, requirePermission("agents"), (_req: Request, res: Response) => {
    res.status(405).json({ error: "Generated history is permanent", code: "HISTORY_IMMUTABLE" });
  });

  // Historial editorial privado: no hay endpoint público, creación manual ni borrado. Cada fila
  // proviene de una ejecución de agente y conserva la instantánea aunque se elimine el artículo.
  const copyHistoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(160).optional(),
    agentType: z.enum(TEXTUAL_AGENT_TYPES).optional(),
    copyType: z.string().trim().max(80).optional(),
    language: z.string().trim().max(12).optional(),
    articleId: z.string().uuid().optional(),
    status: z.enum(["proposal", "applied", "draft", "recovered"]).optional(),
    archived: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sourceJobId: z.string().uuid().optional(),
  }).strict();

  app.get("/api/admin/copies-ai", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    const parsed = copyHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid copy history filters" });
    try {
      res.json(await listAgentCopies(parsed.data));
    } catch (error) {
      console.error("Copy history list error:", error);
      res.status(500).json({ error: "Failed to load copy history" });
    }
  });

  app.get("/api/admin/copies-ai/:id", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid copy history id" });
    try {
      const copy = await getAgentCopy(req.params.id);
      if (!copy) return res.status(404).json({ error: "Copy history record not found" });
      res.json({ ...copy, plainText: copyPlainText(copy.content) });
    } catch (error) {
      console.error("Copy history detail error:", error);
      res.status(500).json({ error: "Failed to load copy history record" });
    }
  });

  app.get("/api/admin/copies-ai/:id/export/:format", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(404).end();
    const format = z.enum(["txt", "html", "json"]).safeParse(req.params.format);
    if (!format.success) return res.status(404).end();
    try {
      const copy = await getAgentCopy(req.params.id);
      if (!copy) return res.status(404).end();
      const plainText = copyPlainText(copy.content);
      res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" });
      res.attachment(`copy-${copy.id}.${format.data}`);
      if (format.data === "json") return res.type("application/json").send(JSON.stringify({ title: copy.title, language: copy.language, agent: copy.agentType, content: copy.content, plainText }, null, 2));
      if (format.data === "txt") return res.type("text/plain; charset=utf-8").send(`${copy.title}\n\n${plainText}\n`);
      // A portable reading document, never executable model HTML.
      const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
      return res.type("text/html; charset=utf-8").send(`<!doctype html><html lang="${copy.language === "en" ? "en" : "es"}"><meta charset="utf-8"><title>${escape(copy.title)}</title><body><h1>${escape(copy.title)}</h1><pre style="white-space:pre-wrap;font:16px/1.6 sans-serif">${escape(plainText)}</pre></body></html>`);
    } catch { res.status(500).json({ error: "No se pudo exportar el copy." }); }
  });

  app.post("/api/admin/copies-ai/:id/archive", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid copy history id" });
    const parsed = z.object({ archived: z.boolean() }).strict().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid archive request" });
    try {
      const copy = await setAgentCopyArchived(req.params.id, parsed.data.archived, req.adminUser!.id);
      if (!copy) return res.status(404).json({ error: "Copy history record not found" });
      await auditLog("update", "agent_copy_history", copy.id, req.adminUser!.id, { archived: copy.archived }, req);
      res.json({ id: copy.id, archived: copy.archived, archivedAt: copy.archivedAt });
    } catch (error) {
      console.error("Copy history archive error:", error);
      res.status(500).json({ error: "Failed to update copy history record" });
    }
  });

  // Historial permanente de audio generado por IA.
  app.get("/api/admin/generated-audio", authMiddleware, requirePermission("agents"), async (_req: Request, res: Response) => {
    try {
      const audio = await storage.getGeneratedAudio();
      const persistentPaths = await listPersistentPublicMediaPaths();
      res.json(await Promise.all(audio.map(async (item) => ({
        ...item,
        available: await generatedAssetAvailable(item.audioUrl, generatedAudioDir, persistentPaths),
      }))));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated audio" });
    }
  });

  app.delete("/api/admin/generated-audio/:id", authMiddleware, requirePermission("agents"), (_req: Request, res: Response) => {
    res.status(405).json({ error: "Generated history is permanent", code: "HISTORY_IMMUTABLE" });
  });

  // --- Generador de Presentaciones (14° agente) ---------------------------------------------
  // Los documentos de insumo no se exponen bajo /uploads; el identificador private:
  // solamente vuelve al servidor cuando el administrador solicita generar la presentación.
  app.post("/api/admin/presentations/upload", authMiddleware, requirePermission("agents"), receivePresentationDocument, async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });
    try {
      if (!await validatePresentationInput(req.file.path, req.file.originalname)) {
        await removeUploadQuietly(req.file.path);
        return res.status(400).json({ error: "El contenido del documento no coincide con un formato permitido." });
      }
      await scanFileForMalware(req.file.path);
      await persistPresentationInput(req.file.path);
      res.json({
        url: `private:presentations/${req.file.filename}`,
        name: path.basename(req.file.originalname).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180),
      });
    } catch {
      await removeUploadQuietly(req.file.path);
      res.status(500).json({ error: "No fue posible validar el documento." });
    }
  });

  // Genera la presentación: extrae el texto de los documentos subidos, estructura con IA (o cae a
  // un esquema determinista si no hay créditos), y renderiza PPTX/PDF/PNG con branding.
  app.post("/api/admin/presentations/generate", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    try {
      const parsed = z.object({
        topic: z.string().trim().max(10_000).default(""),
        sourceNotes: z.string().trim().max(MAX_EDITORIAL_NOTES_CHARACTERS).default(""),
        docs: z.array(z.object({
          url: z.string().regex(/^private:presentations\/[a-f0-9]{32}\.[a-z0-9]{1,5}$/),
          name: z.string().trim().min(1).max(180),
        }).strict()).max(20).default([]),
        slideCount: z.coerce.number().int().min(3).max(20).default(8),
        lang: z.enum(languageCodes).default("es"),
        template: z.enum(["santossaucedo", "minimal", "dark"]).default("santossaucedo"),
        branding: z.enum(["santossaucedo", "custom"]).default("santossaucedo"),
        customLogoUrl: presentationMediaPathSchema.nullable().optional(),
        customPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
        formats: z.array(z.enum(["pptx", "pdf", "png"])).min(1).max(3).default(["pptx", "pdf", "png"]),
        visuals: z.boolean().default(true),
        illustrate: z.boolean().default(false),
        supportImages: z.array(presentationMediaPathSchema).max(30).default([]),
        webSearch: z.boolean().default(false),
        dataClassification: z.enum(["public", "internal", "personal", "confidential", "privileged"]).optional().default("internal"),
        aiUseConfirmed: z.boolean().optional().default(false),
        includeIntroSlide: z.boolean().optional().default(true),
        bookendTone: z.enum(["blue", "white"]).optional().default("blue"),
      }).strict().safeParse(req.body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const field = issue?.path?.join(".") || "configuración";
        return res.status(400).json({
          error: `Configuración de presentación inválida en “${field}”. Revisa ese campo e inténtalo de nuevo.`,
          code: "INVALID_PRESENTATION_CONFIG",
        });
      }
      const {
        topic,
        sourceNotes,
        docs,
        slideCount,
        lang,
        template,
        branding,
        customLogoUrl,
        customPrimaryColor,
        formats,
        visuals,
        illustrate,
        supportImages,
        webSearch,
        dataClassification,
        includeIntroSlide,
        bookendTone,
      } = parsed.data;

      let documentsText = "";
      let usedDocs: string[] = [];
      let docNotes: string[] = [];
      if (docs.length > 0) {
        // Los parsers PDF/Office son grandes y sólo hacen falta cuando este
        // endpoint recibe documentos. Mantenerlos fuera del cold start evita
        // cargar pdf-parse, mammoth y jszip durante el registro de rutas.
        const { extractManyTexts } = await import("../services/documentText");
        const files: { path: string; originalName: string }[] = [];
        let bytes = 0;
        for (const document of docs) {
          try {
            const file = await hydratePresentationInput(document.url);
            bytes += (await fs.promises.stat(file)).size;
            if (bytes > 200 * 1024 * 1024) return res.status(422).json({ error: "Los documentos adjuntos exceden 200 MB en total." });
            files.push({ path: file, originalName: document.name });
          } catch {
            return res.status(422).json({ error: "No se pudo recuperar un documento adjunto. Vuelve a subirlo." });
          }
        }
        const extracted = await extractManyTexts(files, MAX_EDITORIAL_SOURCE_CHARACTERS);
        if (extracted.incomplete) return res.status(422).json({
          error: extracted.notes[0] || "No se pudo leer todo el material adjunto.",
          docNotes: extracted.notes,
        });
        documentsText = extracted.combinedText;
        usedDocs = extracted.usedDocs;
        docNotes = extracted.notes;
      }

      if (!topic && !sourceNotes && !documentsText.trim()) {
        return res.status(400).json({ error: "Escribe un tema o sube al menos un documento con contenido de texto.", docNotes });
      }

      const context: ExecutionContext = {
        jobId: `manual-${Date.now()}`,
        agentType: "presentation_generator",
        startTime: new Date(),
        metadata: { source: "admin" },
      };

      // El agente de presentaciones arrastra renderizadores, sharp y clientes
      // de IA. Se inicializa únicamente al solicitar una generación; listar el
      // historial y arrancar la aplicación no deben pagar ese coste.
      const { presentationGeneratorAgent } = await import("../agents/specialized/PresentationGeneratorAgent");
      const result = await presentationGeneratorAgent.execute(context, {
        topic,
        sourceNotes,
        documentsText,
        slideCount,
        lang,
        template,
        branding,
        customLogoUrl,
        customPrimaryColor,
        formats,
        sourceDocs: usedDocs,
        visuals,
        illustrate,
        supportImages,
        webSearch,
        dataClassification,
        includeIntroSlide,
        bookendTone,
      });

      if (!result.success) {
        const { code, visualNotes } = (result.data as { code?: string; visualNotes?: string[] } | undefined) ?? {};
        const status = code === "AI_DATA_GOVERNANCE_BLOCKED" || code === "PRESENTATION_SOURCE_ERROR" ? 422
          : code === "PRESENTATION_AI_UNAVAILABLE" ? 503 : code === "PRESENTATION_OUTLINE_INVALID" ? 502 : 400;
        return res.status(status).json({
          error: result.error || "No se pudo generar la presentación.",
          code,
          docNotes,
          visualNotes: visualNotes ?? [],
        });
      }

      const payload: Record<string, unknown> = { ...(result.data as Record<string, unknown>), docNotes };
      const generated = (payload.presentation || null) as Awaited<ReturnType<typeof storage.getGeneratedPresentationById>>;
      if (generated?.id) payload.presentation = await privatePresentationApiView(generated);
      res.setHeader("Cache-Control", "private, no-store");
      res.json(payload);
    } catch (error) {
      if (error instanceof AiGovernanceBlockedError) {
        return res.status(422).json({ code: error.code, error: error.message, reasons: error.reasonCodes });
      }
      console.error("[presentations/generate]", error);
      res.status(500).json({ error: "Falló la generación de la presentación." });
    }
  });

  app.get("/api/admin/generated-presentations", authMiddleware, requirePermission("agents"), async (_req: Request, res: Response) => {
    try {
      const presentations = await storage.getGeneratedPresentations();
      res.setHeader("Cache-Control", "private, no-store");
      res.json((await Promise.all(presentations.map(privatePresentationApiView))).filter(Boolean));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated presentations" });
    }
  });

  app.get("/api/admin/generated-presentations/:id/files/:format", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(404).end();
    const format = z.enum(["pptx", "pdf"]).safeParse(req.params.format);
    if (!format.success) return res.status(404).end();
    try {
      const presentation = await storage.getGeneratedPresentationById(req.params.id);
      if (!presentation || presentation.status !== "active") return res.status(404).end();
      const storagePath = format.data === "pptx" ? presentation.pptxUrl : presentation.pdfUrl;
      if (!privatePresentationPathBelongsTo(storagePath, presentation.id)) return res.status(404).end();
      const stream = await openPrivatePresentationStream(storagePath!);
      if (!stream) return res.status(404).end();
      streamPrivatePresentation(res, storagePath!, stream, `presentacion-${presentation.id}.${format.data}`);
    } catch {
      res.status(404).end();
    }
  });

  app.get("/api/admin/generated-presentations/:id/slides/:index", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(404).end();
    const index = z.coerce.number().int().min(0).max(998).safeParse(req.params.index);
    if (!index.success) return res.status(404).end();
    try {
      const presentation = await storage.getGeneratedPresentationById(req.params.id);
      if (!presentation || presentation.status !== "active") return res.status(404).end();
      const pngRefs = Array.isArray(presentation.pngUrls) ? presentation.pngUrls : [];
      const storagePath = pngRefs[index.data] || null;
      if (!privatePresentationPathBelongsTo(storagePath, presentation.id)) return res.status(404).end();
      const stream = await openPrivatePresentationStream(storagePath!);
      if (!stream) return res.status(404).end();
      if (req.query.thumb === "1" && req.query.download === undefined) {
        const parts: Buffer[] = [];
        let size = 0;
        for await (const chunk of stream) {
          const bytes = Buffer.from(chunk);
          size += bytes.length;
          if (size > 20 * 1024 * 1024) {
            stream.destroy();
            return res.status(413).end();
          }
          parts.push(bytes);
        }
        const { default: sharp } = await import("sharp");
        const image = await sharp(Buffer.concat(parts), { limitInputPixels: 20_000_000 })
          .resize({ width: 384, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        return res.set({
          "Cache-Control": "private, no-store",
          "Cross-Origin-Resource-Policy": "same-origin",
          "X-Content-Type-Options": "nosniff",
        }).type("image/webp").send(image);
      }
      streamPrivatePresentation(res, storagePath!, stream, `presentacion-${presentation.id}-diapositiva-${index.data + 1}.png`, req.query.download !== undefined ? "attachment" : "inline");
    } catch {
      res.status(404).end();
    }
  });

  app.get("/api/admin/generated-presentations/:id/slides.zip", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(404).end();
    try {
      const presentation = await storage.getGeneratedPresentationById(req.params.id);
      if (!presentation || presentation.status !== "active") return res.status(404).end();
      const refs = Array.isArray(presentation.pngUrls) ? presentation.pngUrls : [];
      const zip = new JSZip();
      let totalBytes = 0, files = 0;
      for (let index = 0; index < refs.length; index++) {
        if (!privatePresentationPathBelongsTo(refs[index], presentation.id)) continue;
        const stream = await openPrivatePresentationStream(refs[index]);
        if (!stream) continue;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          const bytes = Buffer.from(chunk); totalBytes += bytes.length;
          if (totalBytes > 128 * 1024 * 1024) { stream.destroy(); return res.status(413).json({ error: "Descargue las diapositivas individualmente: el conjunto supera 128 MB." }); }
          chunks.push(bytes);
        }
        zip.file(`diapositiva-${String(index + 1).padStart(2, "0")}.png`, Buffer.concat(chunks)); files++;
      }
      if (!files) return res.status(404).end();
      const bytes = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
      res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
      res.attachment(`diapositivas-${presentation.id}.zip`).type("application/zip").send(bytes);
    } catch { if (!res.headersSent) res.status(500).json({ error: "No se pudo preparar la descarga de diapositivas." }); }
  });

  app.delete("/api/admin/generated-presentations/:id", authMiddleware, requirePermission("agents"), (_req: Request, res: Response) => {
    res.status(405).json({ error: "Generated history is permanent", code: "HISTORY_IMMUTABLE" });
  });
}
