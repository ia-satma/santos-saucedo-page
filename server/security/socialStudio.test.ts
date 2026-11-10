import assert from "node:assert/strict";
import { readdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, test } from "node:test";
import express from "express";
import JSZip from "jszip";
import sharp from "sharp";
import type { SocialAsset } from "@shared/schema";
import { socialFormats, type SocialFormat } from "@shared/socialStudio";

process.env.DATABASE_URL = "postgresql://isolated:isolated@127.0.0.1:1/isolated";
process.env.NODE_ENV = "test";
delete process.env.REPL_ID;
delete process.env.REPLIT_DEPLOYMENT;
delete process.env.REPLIT_DEV_DOMAIN;
delete process.env.REPLIT_APP_STORAGE_BUCKET_ID;
delete process.env.APP_STORAGE_BUCKET_ID;
delete process.env.AI_GOVERNANCE_AUDIT_ENABLED;

const slides = [
  { title: "Una revisión antes de contratar", body: "Define las funciones del puesto y documenta las condiciones acordadas." },
  { title: "Documentar los cambios", body: "Conserva un registro de las modificaciones autorizadas por ambas partes." },
  { title: "Preparar el expediente", body: "Verifica que los documentos del ingreso estén completos y actualizados." },
];
const caption = "Tres pasos para organizar la documentación de personal.";
const requests: Array<{ model: string; service_tier: string; messages: Array<{ content: string }> }> = [];
const provider = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  requests.push(body);
  assert.equal(req.headers.authorization, "Bearer isolated-social-token");
  assert.equal(req.url, "/v1/chat/completions");
  const review = body.messages[0].content.startsWith("Revisa el texto");
  const content = review ? { summary: "La secuencia es clara.", suggestions: ["Añade la referencia en el texto de la publicación."] } : { caption, slides: body.messages[0].content.includes("exactamente 1 piezas") ? slides.slice(0, 1) : slides };
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }], usage: {} }));
});
await new Promise<void>(resolve => provider.listen(0, "127.0.0.1", resolve));
process.env.AI_INTEGRATIONS_OPENAI_API_KEY = "isolated-social-token";
process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = `http://127.0.0.1:${(provider.address() as AddressInfo).port}/v1`;

const { db } = await import("../db");
const { storage } = await import("../storage");
const { registerSocialAssetRoutes } = await import("../routes/socialAssetRoutes");
const { renderSocialSlide } = await import("../services/socialStudio");
const rows = new Map<string, SocialAsset>();
const app = express();
app.use(express.json());
registerSocialAssetRoutes(app);
const listener = app.listen(0, "127.0.0.1");
await new Promise<void>(resolve => listener.once("listening", resolve));
const endpoint = `http://127.0.0.1:${(listener.address() as AddressInfo).port}/api/admin/social-assets`;

async function call(method: string, suffix = "", data?: unknown, token = "studio-editor") {
  return fetch(`${endpoint}${suffix}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { "Content-Type": "application/json" } : {}) },
    body: data ? JSON.stringify(data) : undefined,
  });
}

after(async () => {
  await Promise.all([listener, provider].map(server => new Promise<void>(resolve => server.close(() => resolve()))));
  const directory = "private/studio";
  const files = await readdir(directory).catch(() => []);
  await Promise.all(files.filter(file => [...rows.keys()].some(id => file.startsWith(`social-${id}-`))).map(file => rm(`${directory}/${file}`, { force: true })));
});

test("social studio HTTP renders all carousel images, downloads immutable revisions and restores trash", async t => {
  t.mock.method(db, "select", () => ({ from: () => ({ where: async () => [{ total: 0 }] }) }));
  t.mock.method(db, "insert", () => ({ values: async () => {} }));
  t.mock.method(storage, "getAdminSession", async (token: string) => ({ userId: token, expiresAt: new Date(Date.now() + 60_000) }));
  t.mock.method(storage, "getAdminUser", async (id: string) => ({ id, isActive: true, role: id === "studio-editor" ? "super_admin" : "viewer" }));
  t.mock.method(storage, "createSocialAsset", async (input: SocialAsset) => {
    const row = { ...input, versions: [], archivedAt: null, createdAt: new Date(), updatedAt: new Date() };
    rows.set(row.id, row);
    return row;
  });
  t.mock.method(storage, "getSocialAssetById", async (id: string) => rows.get(id));
  t.mock.method(storage, "getSocialAssets", async (archived: boolean) => [...rows.values()].filter(row => (row.status === "archived") === archived));
  t.mock.method(storage, "updateSocialAsset", async (current: SocialAsset, update: Partial<SocialAsset>) => {
    const row = rows.get(current.id);
    if (!row || row.packageUrl !== current.packageUrl || row.status !== current.status) return undefined;
    const updated = { ...row, ...update, updatedAt: new Date() };
    rows.set(row.id, updated);
    return updated;
  });

  assert.equal((await call("GET", "", undefined, "")).status, 401);
  assert.equal((await call("GET", "", undefined, "studio-viewer")).status, 403);
  const response = await call("POST", "/generate", {
    kind: "carousel", title: "Ingreso de personal", topic: "Documentación de personal",
    language: "es", format: "portrait", slideCount: 3, palette: "navy-lime",
  });
  assert.equal(response.status, 201, await response.clone().text());
  const first = await response.json();
  assert.equal(first.version, 1);
  assert.deepEqual(first.content.slides, slides);
  assert.equal(first.slideUrls.length, 3);
  assert(requests.every(request => request.model === "gpt-6.1-sol" && request.service_tier === "fast"));
  assert.match(rows.get(first.id)?.packageUrl ?? "", /^private\/studio\//);
  assert(!JSON.stringify(first).includes("private/studio/"));

  const original = await Promise.all(first.slideUrls.map(async (url: string) => {
    const file = await call("GET", url.replace("/api/admin/social-assets", ""));
    assert.equal(file.status, 200);
    assert.equal(file.headers.get("cache-control"), "private, no-store");
    const png = Buffer.from(await file.arrayBuffer());
    const info = await sharp(png).metadata();
    assert.equal(info.width, 1080);
    assert.equal(info.height, 1350);
    return png;
  }));
  assert.equal(new Set(original.map(png => png.toString("base64"))).size, 3);
  const packageResponse = await call("GET", `/${first.id}/file/package`);
  const packageZip = await JSZip.loadAsync(await packageResponse.arrayBuffer());
  assert.equal(await packageZip.file("publicacion.txt")?.async("string"), `${caption}\n`);
  for (let index = 0; index < original.length; index++) {
    assert.deepEqual(await packageZip.file(`pieza-0${index + 1}.png`)?.async("nodebuffer"), original[index]);
  }
  assert.equal((await call("GET", `/${first.id}/file/4`)).status, 404);
  assert.equal((await call("GET", `/${first.id}/file/package`, undefined, "")).status, 401);

  const editedSlides = [{ ...slides[0], body: "Antes del ingreso, acuerda por escrito las responsabilidades del puesto." }, ...slides.slice(1)];
  const edit = { version: 1, title: "Documentación de ingreso", content: { caption, slides: editedSlides } };
  const editedResponse = await call("PATCH", `/${first.id}`, edit);
  assert.equal(editedResponse.status, 200);
  const edited = await editedResponse.json();
  assert.equal(edited.version, 2);
  assert.equal(edited.versions[0].title, first.title);
  assert.equal((await call("PATCH", `/${first.id}`, edit)).status, 409);
  const historical = await call("GET", `/${first.id}/file/1?version=1`);
  assert.deepEqual(Buffer.from(await historical.arrayBuffer()), original[0]);
  const updated = await call("GET", `/${first.id}/file/1?version=2`);
  assert.notDeepEqual(Buffer.from(await updated.arrayBuffer()), original[0]);

  const redesignResponse = await call("POST", `/${first.id}/redesign`, { version: 2, palette: "navy-white", format: "story" });
  assert.equal(redesignResponse.status, 200, await redesignResponse.clone().text());
  assert.equal((await redesignResponse.json()).version, 3);
  const story = await call("GET", `/${first.id}/file/1`);
  assert.equal((await sharp(Buffer.from(await story.arrayBuffer())).metadata()).height, 1920);
  const reviewResponse = await call("POST", `/${first.id}/review`, {});
  assert.equal(reviewResponse.status, 200);
  assert.equal((await reviewResponse.json()).suggestions.length, 1);
  assert.equal(requests.length, 2);
  assert(requests.every(request => request.model === "gpt-6.1-sol" && request.service_tier === "fast"));
  const regenerate = await call("POST", `/${first.id}/regenerate`, { version: 3 });
  assert.equal(regenerate.status, 200);
  assert.deepEqual((await regenerate.json()).content.slides, slides);
  assert.equal(requests.length, 3);
  assert.deepEqual(JSON.parse(requests[2].messages[1].content).previousCopy, editedSlides);
  const copyResponse = await call("POST", `/${first.id}/copy`, {});
  assert.equal(copyResponse.status, 201);
  const copy = await copyResponse.json();
  assert.notEqual(copy.id, first.id);
  assert.equal(copy.version, 1);

  assert.equal((await call("POST", `/${first.id}/archive`, { archived: true })).status, 200);
  assert.deepEqual((await (await call("GET")).json()).items.map((row: SocialAsset) => row.id), [copy.id]);
  assert.deepEqual((await (await call("GET", "?archived=true")).json()).items.map((row: SocialAsset) => row.id), [first.id]);
  assert.equal((await call("POST", `/${first.id}/copy`, {})).status, 404);
  assert.equal((await call("POST", `/${first.id}/archive`, { archived: false })).status, 200);
  assert.equal((await (await call("GET")).json()).items.length, 2);
  assert.equal((await call("GET", `/${first.id}/file/1`)).status, 200);
  const post = await call("POST", "/generate", { kind: "post", title: "Un post", topic: "Publicación de prueba" });
  assert.equal(post.status, 201);
  assert.equal((await post.json()).slideUrls.length, 1);
});

test("every configured format produces a correctly sized PNG", async () => {
  for (const format of Object.keys(socialFormats) as SocialFormat[]) {
    const expected = socialFormats[format];
    const png = await renderSocialSlide(slides[0], format, "navy-white", 0, 1);
    const [metadata, statistics] = await Promise.all([sharp(png).metadata(), sharp(png).stats()]);
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, expected.width);
    assert.equal(metadata.height, expected.height);
    assert(statistics.entropy > 0.1);
  }
});
