import { randomUUID } from "node:crypto";
import type { Express, RequestHandler, Response } from "express";
import { desc, eq, or, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { generatedDocuments, type GeneratedDocument } from "@shared/schema";
import { documentRichTextSchema, plainTextToRichText, richTextToPlainText } from "@shared/documentRichText";
import { DEFAULT_LETTERHEAD_TEMPLATE, LETTERHEAD_TEMPLATE_IDS } from "@shared/letterheadTemplates";
import { authMiddleware, requirePermission } from "../auth";
import { db, editorialDb } from "../db";
import { AiGovernanceBlockedError } from "../ai/dataGovernance";
import { hydratePresentationInput } from "../media/presentationInputs";
import { hasOpenAITextClient } from "../openai";
import { deletePrivateStudioObject, downloadPrivateStudioObject, uploadPrivateStudioObject } from "../replitStorage";
import { createBrandedDocx, createBrandedPdf } from "../services/documentGenerator";
import { organizeDocument } from "../services/documentEditorial";

const invalidCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/;
const sourceTextSchema = z.string().max(200_000).refine((value) => !invalidCharacters.test(value));
const documentInput = z.object({
  title: z.string().trim().max(180).refine((value) => !invalidCharacters.test(value) && !/[\r\n]/.test(value)).optional(),
  sourceText: sourceTextSchema.optional(),
  richContent: documentRichTextSchema.optional(),
  instructions: z.string().trim().max(4_000).default(""),
  mode: z.enum(["preserve", "organize"]).optional(),
  template: z.enum(LETTERHEAD_TEMPLATE_IDS).nullable().optional(),
  documents: z.array(z.object({
    url: z.string().regex(/^private:presentations\/[a-f0-9]{32}\.[a-z0-9]{1,5}$/),
    name: z.string().min(1).max(240),
  })).max(20).default([]),
}).strict();
const uuid = z.string().uuid();
const fileFormat = z.enum(["docx", "pdf"]);
type Format = z.infer<typeof fileFormat>;
const route = "/api/admin/documents";
const permission = requirePermission("agents");

class DocumentError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

function secured(handler: RequestHandler): RequestHandler[] {
  return [authMiddleware, permission, async (req, res, next) => {
    res.setHeader("Cache-Control", "private, no-store");
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof DocumentError) return res.status(error.status).json({ error: error.message });
      if (error instanceof AiGovernanceBlockedError) {
        return res.status(422).json({ error: "Las reglas de uso de IA impiden organizar este contenido. Puedes usar el modo Preservar texto para procesarlo localmente." });
      }
      console.error("[documents] Falló una operación del editor");
      res.status(503).json({ error: "No fue posible completar la operación. Intenta de nuevo." });
    }
  }];
}

function storageKey(id: string, format: Format) {
  return `private/studio/document-${id}.${format}`;
}

function storedDocumentKey(row: GeneratedDocument, format: Format) {
  const stored = format === "docx" ? row.docxUrl : row.pdfUrl;
  if (stored === storageKey(row.id, format) || stored === `public/media/document-${row.id}.${format}`) return stored;
  return null;
}

function summary(row: GeneratedDocument) {
  const { id, title, parentId, version, status, createdAt, template } = row;
  return {
    id, title, parentId, version, status, createdAt, template,
    docxUrl: storedDocumentKey(row, "docx") ? `${route}/${id}/file/docx` : null,
    pdfUrl: storedDocumentKey(row, "pdf") ? `${route}/${id}/file/pdf` : null,
  };
}

function readRichContent(value: unknown) {
  const parsed = documentRichTextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function saveDocument(raw: unknown, actorId: string | null, current?: GeneratedDocument) {
  const parsed = documentInput.safeParse(raw);
  if (!parsed.success) throw new DocumentError(400, "Los datos del documento no son válidos.");
  const { instructions, documents } = parsed.data;
  const mode = parsed.data.mode ?? (parsed.data.richContent || (current && parsed.data.sourceText === undefined) ? "preserve" : "organize");
  const title = parsed.data.title ?? current?.title ?? "";
  if (parsed.data.template === null && current?.template !== null) {
    throw new DocumentError(400, "Elige una plantilla de membrete válida.");
  }
  const template = parsed.data.template === undefined
    ? (current ? current.template : DEFAULT_LETTERHEAD_TEMPLATE)
    : parsed.data.template;
  let richContent = parsed.data.richContent ??
    (parsed.data.sourceText === undefined ? readRichContent(current?.richContent) ?? undefined : undefined);
  let sourceText = richContent ? richTextToPlainText(richContent) : parsed.data.sourceText ?? current?.sourceText ?? "";
  if (documents.length) {
    const { extractText } = await import("../services/documentText");
    const parts: string[] = [];
    for (const document of documents) {
      const extracted = await extractText(await hydratePresentationInput(document.url), document.name, { rejectOverLimit: true });
      if (!extracted.ok) {
        throw new DocumentError(422, extracted.note || "No se pudo extraer el texto del archivo.");
      }
      parts.push(extracted.text);
    }
    const appendedText = parts.join("\n\n");
    if (richContent) {
      richContent = {
        type: "doc",
        content: [...richContent.content, { type: "paragraph" }, ...plainTextToRichText(appendedText).content],
      };
      sourceText = richTextToPlainText(richContent);
    } else {
      sourceText = [sourceText, appendedText].filter(Boolean).join("\n\n");
    }
  }
  if (!sourceTextSchema.safeParse(sourceText).success) {
    throw new DocumentError(400, "El texto combinado excede el límite o contiene caracteres no admitidos.");
  }
  if (!sourceText.trim() && (mode === "preserve" || !instructions)) {
    throw new DocumentError(400, "Agrega texto, documentos o indicaciones para generar el contenido.");
  }
  if (mode === "organize" && !hasOpenAITextClient()) {
    throw new DocumentError(503, "La integración de IA no está configurada. Puedes usar el modo Preservar texto.");
  }
  const finalText = mode === "organize"
    ? await organizeDocument({ title, sourceText, instructions, actorId })
    : sourceText;
  if (!sourceTextSchema.safeParse(finalText).success) throw new DocumentError(422, "El texto generado contiene caracteres no admitidos.");
  if (mode === "organize") richContent = plainTextToRichText(finalText);
  if (richContent && !documentRichTextSchema.safeParse(richContent).success) {
    throw new DocumentError(422, "El contenido combinado tiene demasiados bloques o excede el límite del documento.");
  }
  const id = randomUUID();
  const docxUrl = storageKey(id, "docx");
  const pdfUrl = storageKey(id, "pdf");
  const output = { title, sourceText: finalText, richContent, mode: "preserve" as const, template };
  const [docx, pdf] = await Promise.all([createBrandedDocx(output), createBrandedPdf(output)]);
  let transactionStarted = false;
  try {
    await uploadPrivateStudioObject(docxUrl, docx);
    await uploadPrivateStudioObject(pdfUrl, pdf);
    transactionStarted = true;
    return await editorialDb.transaction(async (tx) => {
      const parentId = current ? current.parentId || current.id : null;
      let version = 1;
      if (current && parentId) {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${parentId}, 0))`);
        const [latest] = await tx.select().from(generatedDocuments)
          .where(or(eq(generatedDocuments.id, parentId), eq(generatedDocuments.parentId, parentId)))
          .orderBy(desc(generatedDocuments.version)).limit(1);
        if (latest?.id !== current.id || latest.status !== "active") {
          throw new DocumentError(409, "El documento cambió. Abre la versión más reciente antes de guardar.");
        }
        version = latest.version + 1;
      }
      const [saved] = await tx.insert(generatedDocuments).values({
        id, title, sourceText: finalText, richContent, instructions: instructions || null, mode, template, version,
        parentId, docxUrl, pdfUrl, createdBy: actorId,
      }).returning();
      return saved;
    });
  } catch (error) {
    // If a timeout happens after COMMIT, keep the artifacts unless we can
    // verify that the transaction did not create their document version.
    const uncommitted = !transactionStarted || error instanceof DocumentError || await db
      .select({ id: generatedDocuments.id }).from(generatedDocuments).where(eq(generatedDocuments.id, id)).limit(1)
      .then(rows => rows.length === 0, () => false);
    if (uncommitted) await Promise.allSettled([deletePrivateStudioObject(docxUrl), deletePrivateStudioObject(pdfUrl)]);
    throw error;
  }
}

async function readDocument(id: string): Promise<GeneratedDocument> {
  if (!uuid.safeParse(id).success) throw new DocumentError(400, "Identificador inválido.");
  const [row] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, id)).limit(1);
  if (!row) throw new DocumentError(404, "Documento no encontrado.");
  return row;
}

function streamBuffer(res: Response, body: Buffer, format: Format, row: GeneratedDocument) {
  res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Length", body.byteLength);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", "sandbox");
  res.setHeader("Content-Disposition", `attachment; filename="documento-v${row.version}.${format}"`);
  res.end(body);
}

export function registerAdminDocumentRoutes(app: Express) {
  app.get(route, ...secured(async (req, res) => {
    const rows = await db.select({
      id: generatedDocuments.id, title: generatedDocuments.title, status: generatedDocuments.status,
      version: generatedDocuments.version, parentId: generatedDocuments.parentId, createdAt: generatedDocuments.createdAt,
      template: generatedDocuments.template,
    }).from(generatedDocuments).orderBy(desc(generatedDocuments.createdAt), desc(generatedDocuments.version));
    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const rootId = row.parentId || row.id;
      if ((latest.get(rootId)?.version ?? 0) < row.version) latest.set(rootId, row);
    }
    const status = req.query.trash === "true" ? "archived" : "active";
    res.json(Array.from(latest.values()).filter((row) => row.status === status));
  }));

  app.post(`${route}/generate`, ...secured(async (req, res) => {
    const row = await saveDocument(req.body, req.adminUser?.id || null);
    res.status(201).json(summary(row));
  }));

  app.patch(`${route}/:id`, ...secured(async (req, res) => {
    const current = await readDocument(req.params.id);
    if (current.status !== "active") throw new DocumentError(409, "Restaura el documento antes de editarlo.");
    const saved = await saveDocument(req.body, req.adminUser?.id || null, current);
    res.status(201).json(summary(saved));
  }));

  app.post(`${route}/:id/archive`, ...secured(async (req, res) => {
    const row = await readDocument(req.params.id);
    const { archived } = req.body ?? {};
    if (typeof archived !== "boolean") throw new DocumentError(400, "Indica el estado de la papelera.");
    const rootId = row.parentId || row.id;
    await editorialDb.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${rootId}, 0))`);
      const [latest] = await tx.select({ id: generatedDocuments.id }).from(generatedDocuments)
        .where(or(eq(generatedDocuments.id, rootId), eq(generatedDocuments.parentId, rootId)))
        .orderBy(desc(generatedDocuments.version)).limit(1);
      if (latest?.id !== row.id) throw new DocumentError(409, "Abre la versión más reciente para cambiar su estado.");
      await tx.update(generatedDocuments).set({
        status: archived ? "archived" : "active", archivedAt: archived ? new Date() : null, updatedAt: new Date(),
      }).where(or(eq(generatedDocuments.id, rootId), eq(generatedDocuments.parentId, rootId)));
    });
    res.json({ ok: true });
  }));

  app.get(`${route}/:id/file/:format`, ...secured(async (req, res) => {
    const format = fileFormat.safeParse(req.params.format);
    if (!format.success) throw new DocumentError(400, "Formato inválido.");
    const row = await readDocument(req.params.id);
    const key = storedDocumentKey(row, format.data);
    if (!key) throw new DocumentError(404, "Archivo no disponible.");
    const bytes = await downloadPrivateStudioObject(key);
    if (!bytes) throw new DocumentError(404, "Archivo no encontrado en App Storage.");
    streamBuffer(res, bytes, format.data, row);
  }));

  app.get(`${route}/:id`, ...secured(async (req, res) => {
    const row = await readDocument(req.params.id);
    const rootId = row.parentId || row.id;
    const versions = await db.select().from(generatedDocuments)
      .where(or(eq(generatedDocuments.id, rootId), eq(generatedDocuments.parentId, rootId)))
      .orderBy(desc(generatedDocuments.version));
    res.json({ document: { ...summary(row), sourceText: row.sourceText, richContent: readRichContent(row.richContent), mode: row.mode }, versions: versions.map(summary) });
  }));
}
