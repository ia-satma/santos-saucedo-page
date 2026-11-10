import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import express from "express";
import JSZip from "jszip";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
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
  const create = await call(`${prefix}/generate`, "POST", input);
  assert.equal(create.status, 201, await create.clone().text());
  const initial = await create.json();
  createdIds.push(initial.id);
  assert.equal(initial.version, 1);
  assert.equal((await fetch(base + initial.pdfUrl)).status, 401);
  assert.equal((await call(initial.docxUrl, "GET", undefined, viewer)).status, 403);
  assert.equal((await fetch(`${base}/media/public/media/document-${initial.id}.pdf`)).status, 404);

  const docxResponse = await call(initial.docxUrl);
  assert.equal(docxResponse.status, 200);
  assert.match(docxResponse.headers.get("cache-control") || "", /private, no-store/);
  const docx = Buffer.from(await docxResponse.arrayBuffer());
  const zip = await JSZip.loadAsync(docx);
  assert(zip.file("word/header1.xml"));
  assert(zip.file("word/footer1.xml"));
  assert(zip.file("word/media/logo.png"));
  const editable = await mammoth.extractRawText({ buffer: docx });
  assert(editable.value.includes(lastLine));
  assert(editable.value.includes("INSUMO de prueba"));

  const pdfResponse = await call(initial.pdfUrl);
  assert.equal(pdfResponse.status, 200);
  const pdf = Buffer.from(await pdfResponse.arrayBuffer());
  assert((await PDFDocument.load(pdf)).getPageCount() > 1);
  const parser = new PDFParse({ data: new Uint8Array(pdf) });
  try {
    const result = await parser.getText();
    assert(result.text.includes(lastLine));
    assert(result.text.includes("INSUMO de prueba"));
  } finally {
    await parser.destroy();
  }

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

  assert.equal((await call(`${prefix}/${revision.id}/archive`, "POST", { archived: true })).status, 200);
  assert(!(await (await call(prefix)).json()).some((row: { id: string }) => row.id === revision.id));
  assert((await (await call(`${prefix}?trash=true`)).json()).some((row: { id: string }) => row.id === revision.id));
  assert.equal((await call(initial.pdfUrl)).status, 200);
  assert.equal((await call(`${prefix}/${revision.id}/archive`, "POST", { archived: false })).status, 200);
  assert((await (await call(prefix)).json()).some((row: { id: string }) => row.id === revision.id));

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
  console.log("Documents API ok: permission checks, input upload, private DOCX/PDF, pagination, version conflict, archive/restore and Sol fast transport.");
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
