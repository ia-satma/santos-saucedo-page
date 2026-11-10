import type { Express, Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { generatedDocuments } from "@shared/schema";
import { authMiddleware, requirePermission } from "../auth";
import { deleteAppStorageObject, downloadAppStorageObject, uploadAppStorageObject } from "../replitStorage";
import { createBrandedDocx, createBrandedPdf, type DocumentMode } from "../services/documentGenerator";

const documentInput = z.object({
  title: z.string().trim().min(1).max(180),
  sourceText: z.string().trim().min(1).max(200_000),
  instructions: z.string().trim().max(4_000).optional().nullable(),
  mode: z.enum(["preserve", "organize"]).default("organize"),
  language: z.string().trim().min(2).max(12).default("es"),
}).strict();

function storageKey(id: string, extension: "docx" | "pdf") { return `public/media/document-${id}.${extension}`; }
function downloadName(title: string, extension: "docx" | "pdf") {
  const safe = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "documento";
  return `${safe}.${extension}`;
}

async function serialize(row: typeof generatedDocuments.$inferSelect) {
  return {
    ...row,
    docxUrl: row.docxUrl ? `/api/admin/documents/${row.id}/file/docx` : null,
    pdfUrl: row.pdfUrl ? `/api/admin/documents/${row.id}/file/pdf` : null,
  };
}

async function renderAndStore(id: string, input: z.infer<typeof documentInput>) {
  const [docx, pdf] = await Promise.all([
    createBrandedDocx({ ...input, mode: input.mode as DocumentMode }),
    createBrandedPdf({ ...input, mode: input.mode as DocumentMode }),
  ]);
  const docxPath = storageKey(id, "docx");
  const pdfPath = storageKey(id, "pdf");
  await Promise.all([uploadAppStorageObject(docxPath, docx), uploadAppStorageObject(pdfPath, pdf)]);
  return { docxPath, pdfPath };
}

function streamBuffer(res: Response, body: Buffer, type: string, filename: string) {
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", body.byteLength);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.end(body);
}

export function registerAdminDocumentRoutes(app: Express) {
  app.get("/api/admin/documents", authMiddleware, requirePermission("agents"), async (_req, res) => {
    const rows = await db.select().from(generatedDocuments).where(eq(generatedDocuments.status, "active")).orderBy(desc(generatedDocuments.createdAt));
    res.setHeader("Cache-Control", "private, no-store");
    res.json(await Promise.all(rows.map(serialize)));
  });

  app.get("/api/admin/documents/brand/:asset", authMiddleware, requirePermission("agents"), async (req, res) => {
    if (req.params.asset !== "logo") return res.status(404).json({ error: "Asset de marca no encontrado." });
    res.redirect("/attached_assets/logo-ss-color.png");
  });

  app.post("/api/admin/documents/generate", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    const parsed = documentInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Los datos del documento no son válidos.", details: parsed.error.flatten() });
    try {
      const input = parsed.data;
      const [created] = await db.insert(generatedDocuments).values({
        title: input.title,
        sourceText: input.sourceText,
        instructions: input.instructions || null,
        mode: input.mode,
        language: input.language,
        createdBy: req.adminUser?.id || null,
      }).returning();
      const files = await renderAndStore(created.id, input);
      const [saved] = await db.update(generatedDocuments).set({ docxUrl: files.docxPath, pdfUrl: files.pdfPath, updatedAt: new Date() }).where(eq(generatedDocuments.id, created.id)).returning();
      res.status(201).json(await serialize(saved));
    } catch (error) {
      console.error("[documents/generate]", error);
      res.status(503).json({ error: "No fue posible generar el documento con membrete." });
    }
  });

  app.patch("/api/admin/documents/:id", authMiddleware, requirePermission("agents"), async (req: Request, res: Response) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Identificador inválido." });
    const parsed = documentInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Los datos del documento no son válidos.", details: parsed.error.flatten() });
    const [current] = await db.select().from(generatedDocuments).where(and(eq(generatedDocuments.id, req.params.id), eq(generatedDocuments.status, "active"))).limit(1);
    if (!current) return res.status(404).json({ error: "Documento no encontrado." });
    try {
      const input = parsed.data;
      const [version] = await db.insert(generatedDocuments).values({
        title: input.title,
        sourceText: input.sourceText,
        instructions: input.instructions || null,
        mode: input.mode,
        language: input.language,
        version: current.version + 1,
        parentId: current.id,
        createdBy: req.adminUser?.id || null,
      }).returning();
      const files = await renderAndStore(version.id, input);
      const [saved] = await db.update(generatedDocuments).set({ docxUrl: files.docxPath, pdfUrl: files.pdfPath, updatedAt: new Date() }).where(eq(generatedDocuments.id, version.id)).returning();
      res.status(201).json(await serialize(saved));
    } catch (error) {
      console.error("[documents/update]", error);
      res.status(503).json({ error: "No fue posible guardar la nueva versión." });
    }
  });

  app.post("/api/admin/documents/:id/archive", authMiddleware, requirePermission("agents"), async (req, res) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Identificador inválido." });
    const [updated] = await db.update(generatedDocuments).set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() }).where(and(eq(generatedDocuments.id, req.params.id), eq(generatedDocuments.status, "active"))).returning();
    if (!updated) return res.status(404).json({ error: "Documento no encontrado." });
    res.json({ ok: true, id: updated.id });
  });

  app.get("/api/admin/documents/:id/file/:format", authMiddleware, requirePermission("agents"), async (req, res) => {
    if (!z.string().uuid().safeParse(req.params.id).success || !["docx", "pdf"].includes(req.params.format)) return res.status(400).json({ error: "Archivo inválido." });
    const [row] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, req.params.id)).limit(1);
    if (!row || row.status !== "active") return res.status(404).json({ error: "Documento no encontrado." });
    const format = req.params.format as "docx" | "pdf";
    const storagePath = format === "docx" ? row.docxUrl : row.pdfUrl;
    if (!storagePath) return res.status(404).json({ error: "Archivo no disponible." });
    const bytes = await downloadAppStorageObject(storagePath.replace(/^\//, ""));
    if (!bytes) return res.status(404).json({ error: "Archivo no encontrado en App Storage." });
    streamBuffer(res, bytes, format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf", downloadName(row.title, format));
  });

  app.get("/api/admin/documents/:id", authMiddleware, requirePermission("agents"), async (req, res) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Identificador inválido." });
    const [row] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ error: "Documento no encontrado." });
    const versions = await db.select().from(generatedDocuments).where(eq(generatedDocuments.parentId, row.parentId || row.id)).orderBy(desc(generatedDocuments.version));
    res.json({ document: await serialize(row), versions: await Promise.all(versions.map(serialize)) });
  });

  app.delete("/api/admin/documents/:id", authMiddleware, requirePermission("agents"), async (req, res) => {
    if (!z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: "Identificador inválido." });
    const [row] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ error: "Documento no encontrado." });
    await db.update(generatedDocuments).set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() }).where(eq(generatedDocuments.id, row.id));
    await Promise.all([row.docxUrl && deleteAppStorageObject(row.docxUrl), row.pdfUrl && deleteAppStorageObject(row.pdfUrl)]);
    res.json({ ok: true });
  });
}
