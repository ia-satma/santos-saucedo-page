import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import express from "express";
import JSZip from "jszip";
import mammoth from "mammoth";
import { decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";
import sharp from "sharp";
import { PDFParse } from "pdf-parse";
import { adminSessions, adminUsers, generatedDocuments } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { deletePrivateStudioObject } from "../server/replitStorage";
import { registerRoutes } from "../server/routes";

assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL!).hostname), "Use a local database.");
assert(!process.env.REPLIT_APP_STORAGE_BUCKET_ID && !process.env.APP_STORAGE_BUCKET_ID, "Use local storage.");
const app = express();
app.use(express.json({ limit: "1mb" }));
const server = createServer(app);
let completionRequest: { model?: string; service_tier?: string } | null = null;
const provider = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  completionRequest = JSON.parse(body);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    id: "local-test", object: "chat.completion", created: 1, model: "gpt-6.1-sol",
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "Texto organizado de prueba." } }],
  }));
});
const createdIds: string[] = [];
const userIds: string[] = [];
let uploadedInput: string | undefined;
const prefix = "/api/admin/documents";

async function login(role: "super_admin" | "viewer") {
  const identity = `qa-document-${randomUUID()}`;
  const [user] = await db.insert(adminUsers).values({
    username: identity,
    email: `${identity}@localhost.test`,
    passwordHash: await hashPassword(randomUUID()),
    role,
    isActive: true,
  }).returning();
  userIds.push(user.id);
  const token = randomUUID();
  await db.insert(adminSessions).values({ userId: user.id, token, expiresAt: new Date(Date.now() + 3_600_000) });
  return token;
}

function localUrl(server: Server) {
  const address = server.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

type ExportedDocument = { id: string; template: string | null; docxUrl: string; pdfUrl: string };
type FileRequest = (url: string) => Promise<Response>;

async function readExport(call: FileRequest, url: string): Promise<Buffer> {
  const response = await call(url);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control") || "", /private, no-store/);
  return Buffer.from(await response.arrayBuffer());
}

async function verifyExport(
  call: FileRequest,
  document: ExportedDocument,
  expectedText: string[],
  multiPage = false,
) {
  const [docx, pdf] = await Promise.all([readExport(call, document.docxUrl), readExport(call, document.pdfUrl)]);
  const [zip, pdfDocument, editable] = await Promise.all([
    JSZip.loadAsync(docx),
    PDFDocument.load(pdf),
    mammoth.extractRawText({ buffer: docx }),
  ]);
  for (const text of expectedText) assert(editable.value.includes(text), `Missing editable text: ${text}`);
  const pages = pdfDocument.getPages();
  assert(multiPage ? pages.length > 1 : pages.length === 1);
  if (document.template === null) {
    assert(zip.file("word/header1.xml"));
    assert(zip.file("word/footer1.xml"));
    assert(zip.file("word/media/logo.png"));
  } else {
    const artwork = await readFile(path.join("client/public/letterheads", `${document.template}.png`));
    const embeddedDocx = await zip.file("word/media/letterhead.png")?.async("nodebuffer");
    assert(embeddedDocx?.equals(artwork), `DOCX artwork differs for ${document.template}`);
    const header = await zip.file("word/header1.xml")?.async("string") ?? "";
    assert.match(header, /<wp:anchor\b[^>]*\bbehindDoc="1"/);
    assert.match(header, /<wp:positionH relativeFrom="page"><wp:posOffset>0<\/wp:posOffset>/);
    assert.match(header, /<wp:positionV relativeFrom="page"><wp:posOffset>0<\/wp:posOffset>/);
    const relationships = await zip.file("word/_rels/header1.xml.rels")?.async("string") ?? "";
    assert.match(relationships, /Target="media\/letterhead\.png"/);
    assert.equal(zip.file("word/footer1.xml"), null, "The letterhead image already contains the footer");

    const { data: rgb, info } = await sharp(artwork).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    const validated = new Set<PDFRawStream>();
    for (const page of pages) {
      assert.deepEqual(page.getSize(), { width: 612, height: 792 });
      const images = page.node.Resources()?.lookup(PDFName.of("XObject"), PDFDict);
      const imageKeys = images?.keys() ?? [];
      assert.equal(imageKeys.length, 1, "Every page has exactly one letterhead image");
      const image = images!.lookup(imageKeys[0]);
      assert(image instanceof PDFRawStream);
      assert.equal(image.dict.lookup(PDFName.of("Width"), PDFNumber).asNumber(), info.width);
      assert.equal(image.dict.lookup(PDFName.of("Height"), PDFNumber).asNumber(), info.height);
      if (!validated.has(image)) {
        assert(Buffer.from(decodePDFRawStream(image).decode()).equals(rgb), `PDF artwork differs for ${document.template}`);
        validated.add(image);
      }
      const contents = page.node.Contents();
      const streams = contents instanceof PDFArray
        ? Array.from({ length: contents.size() }, (_, index) => contents.lookup(index, PDFRawStream))
        : [contents];
      const operators = streams.map(stream => {
        assert(stream instanceof PDFRawStream);
        return Buffer.from(decodePDFRawStream(stream).decode()).toString("ascii");
      }).join("\n");
      const imageDraw = operators.indexOf(`${imageKeys[0].toString()} Do`);
      assert(imageDraw >= 0 && imageDraw < operators.indexOf("BT"), "Letterhead is drawn below the editable content");
    }
  }

  const parser = new PDFParse({ data: new Uint8Array(pdf) });
  try {
    const { text } = await parser.getText();
    for (const line of expectedText) assert(text.includes(line), `Missing PDF text: ${line}`);
  } finally {
    await parser.destroy();
  }
  return { docx, pdf };
}

try {
  await registerRoutes(server, app);
  const editor = await login("super_admin");
  const viewer = await login("viewer");
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  await new Promise<void>((resolve) => provider.listen(0, "127.0.0.1", resolve));
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = `${localUrl(provider)}/v1`;
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY = "local-only";
  const base = localUrl(server);
  const call = (url: string, method = "GET", payload?: unknown, token = editor) =>
    fetch(base + url, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(payload === undefined ? {} : { "Content-Type": "application/json" }) },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });

  assert.equal((await fetch(base + prefix)).status, 401);
  assert.equal((await call(prefix, "GET", undefined, viewer)).status, 403);
  const form = new FormData();
  form.append("file", new Blob(["INSUMO de prueba para el membrete."], { type: "text/plain" }), "insumo.txt");
  const uploadResponse = await fetch(`${base}/api/admin/presentations/upload`, {
    method: "POST", body: form, headers: { Authorization: `Bearer ${editor}` },
  });
  assert.equal(uploadResponse.status, 200, await uploadResponse.clone().text());
  const upload = await uploadResponse.json();
  uploadedInput = path.basename(upload.url);

  const lastLine = "ÚLTIMA LÍNEA DE PRUEBA";
  const input = {
    title: "Membrete <Prueba> & revisión",
    sourceText: `${Array.from({ length: 170 }, (_, i) => `Renglón ${i + 1} con información que debe conservarse.`).join("\n")}\n${lastLine}`,
    documents: [upload],
    mode: "preserve",
  };
  const invalidTemplate = { title: "No debe guardarse", sourceText: "Texto válido", mode: "preserve" };
  assert.equal((await call(`${prefix}/generate`, "POST", { ...invalidTemplate, template: "desconocida" })).status, 400);
  assert.equal((await call(`${prefix}/generate`, "POST", { ...invalidTemplate, template: null })).status, 400);
  const create = await call(`${prefix}/generate`, "POST", input);
  assert.equal(create.status, 201, await create.clone().text());
  const initial = await create.json();
  createdIds.push(initial.id);
  assert.equal(initial.version, 1);
  assert.equal(initial.template, "clasica");
  assert.equal((await fetch(base + initial.pdfUrl)).status, 401);
  assert.equal((await call(initial.docxUrl, "GET", undefined, viewer)).status, 403);
  assert.equal((await fetch(`${base}/media/public/media/document-${initial.id}.pdf`)).status, 404);
  assert.equal((await call(`${prefix}/${initial.id}`, "PATCH", { ...invalidTemplate, template: "desconocida" })).status, 400);
  assert.equal((await call(`${prefix}/${initial.id}`, "PATCH", { ...invalidTemplate, template: null })).status, 400);
  const firstFiles = await verifyExport(call, initial, [lastLine, "INSUMO de prueba"], true);

  const attempts = await Promise.all([
    call(`${prefix}/${initial.id}`, "PATCH", { title: "Revisión A", sourceText: "Nueva versión A", mode: "preserve" }),
    call(`${prefix}/${initial.id}`, "PATCH", { title: "Revisión B", sourceText: "Nueva versión B", mode: "preserve" }),
  ]);
  assert.deepEqual(attempts.map((response) => response.status).sort(), [201, 409]);
  const revision = await attempts.find((response) => response.status === 201)!.json();
  createdIds.push(revision.id);
  const detail = await (await call(`${prefix}/${revision.id}`)).json();
  assert.deepEqual(detail.versions.map((version: { version: number }) => version.version), [2, 1]);
  assert.equal(detail.document.id, revision.id);
  assert.equal(detail.document.template, "clasica");
  assert.deepEqual(detail.versions.map((version: { template: string }) => version.template), ["clasica", "clasica"]);

  assert.equal((await call(`${prefix}/${revision.id}/archive`, "POST", { archived: true })).status, 200);
  assert(!(await (await call(prefix)).json()).some((row: { id: string }) => row.id === revision.id));
  assert((await (await call(`${prefix}?trash=true`)).json()).some((row: { id: string }) => row.id === revision.id));
  assert.equal((await call(initial.pdfUrl)).status, 200);
  assert.equal((await call(`${prefix}/${revision.id}/archive`, "POST", { archived: false })).status, 200);
  assert((await (await call(prefix)).json()).some((row: { id: string }) => row.id === revision.id));

  const revisedText = "Documento con la plantilla reemplazada.";
  const changed = await call(`${prefix}/${revision.id}`, "PATCH", {
    title: "Nueva plantilla", sourceText: revisedText, mode: "preserve", template: "banda-azul",
  });
  assert.equal(changed.status, 201, await changed.clone().text());
  const changedRow = await changed.json();
  createdIds.push(changedRow.id);
  assert.equal(changedRow.template, "banda-azul");
  assert.equal(changedRow.version, 3);
  const changedDetail = await (await call(`${prefix}/${changedRow.id}`)).json();
  assert.deepEqual(changedDetail.versions.map((version: { template: string }) => version.template), ["banda-azul", "clasica", "clasica"]);
  assert((await (await call(prefix)).json()).some((row: ExportedDocument) => row.id === changedRow.id && row.template === "banda-azul"));
  await verifyExport(call, changedRow, [revisedText]);
  assert((await readExport(call, initial.docxUrl)).equals(firstFiles.docx));
  assert((await readExport(call, initial.pdfUrl)).equals(firstFiles.pdf));

  for (const template of ["banda-azul", "trama", "pie-azul"]) {
    const text = "Texto editable para validar la plantilla oficial.";
    const response = await call(`${prefix}/generate`, "POST", { title: `Prueba ${template}`, sourceText: text, mode: "preserve", template });
    assert.equal(response.status, 201, await response.clone().text());
    const row = await response.json();
    createdIds.push(row.id);
    assert.equal(row.template, template);
    await verifyExport(call, row, [text]);
  }

  const [legacy] = await db.insert(generatedDocuments).values({
    title: "Documento anterior a las plantillas", sourceText: "Contenido anterior.", mode: "preserve",
  }).returning();
  createdIds.push(legacy.id);
  const legacyEdit = await call(`${prefix}/${legacy.id}`, "PATCH", {
    title: "Documento anterior actualizado", sourceText: "Contenido anterior actualizado.", mode: "preserve",
  });
  assert.equal(legacyEdit.status, 201, await legacyEdit.clone().text());
  const legacyRow = await legacyEdit.json();
  createdIds.push(legacyRow.id);
  assert.equal(legacyRow.template, null);
  await verifyExport(call, legacyRow, ["Contenido anterior actualizado."]);
  const explicitLegacy = await call(`${prefix}/${legacyRow.id}`, "PATCH", {
    title: "Documento anterior actualizado de nuevo", sourceText: "Contenido anterior vigente.", mode: "preserve", template: null,
  });
  assert.equal(explicitLegacy.status, 201, await explicitLegacy.clone().text());
  const explicitLegacyRow = await explicitLegacy.json();
  createdIds.push(explicitLegacyRow.id);
  assert.equal(explicitLegacyRow.template, null);

  const organized = await call(`${prefix}/generate`, "POST", {
    title: "Ejemplo editorial", instructions: "Redacta un breve ejemplo.", mode: "organize",
  });
  assert.equal(organized.status, 201, await organized.clone().text());
  const organizedRow = await organized.json();
  createdIds.push(organizedRow.id);
  const organizedDetail = await (await call(`${prefix}/${organizedRow.id}`)).json();
  assert.equal(organizedDetail.document.sourceText, "Texto organizado de prueba.");
  const captured = completionRequest as { model?: string; service_tier?: string } | null;
  assert.equal(captured?.model, "gpt-6.1-sol");
  assert.equal(captured?.service_tier, "fast");
  console.log("Documents API ok: permission checks, input upload, private DOCX/PDF, all four templates, editable text, immutable downloads, legacy inheritance, version conflict, archive/restore and Sol fast transport.");
} finally {
  for (const id of createdIds) {
    await deletePrivateStudioObject(`private/studio/document-${id}.docx`);
    await deletePrivateStudioObject(`private/studio/document-${id}.pdf`);
  }
  if (createdIds.length) await db.delete(generatedDocuments).where(inArray(generatedDocuments.id, createdIds));
  for (const id of userIds) {
    await db.delete(adminSessions).where(eq(adminSessions.userId, id));
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }
  if (uploadedInput) await rm(path.join("private_uploads", "presentation-inputs", uploadedInput), { force: true });
  if (server.listening) await new Promise<void>((resolve) => server.close(() => resolve()));
  if (provider.listening) await new Promise<void>((resolve) => provider.close(() => resolve()));
}
