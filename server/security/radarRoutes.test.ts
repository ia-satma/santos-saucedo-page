import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, test } from "node:test";
import express from "express";

process.env.DATABASE_URL ??= "postgresql://isolated:isolated@127.0.0.1:1/isolated";
process.env.NODE_ENV = "test";

const { editorialDb } = await import("../db");
const { storage } = await import("../storage");
const { registerRadarRoutes } = await import("../routes/radarRoutes");

const app = express();
app.use(express.json());
registerRadarRoutes(app);
const listener = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => listener.once("listening", resolve));
const endpoint = `http://127.0.0.1:${(listener.address() as AddressInfo).port}/api/admin/radar/news-draft`;

after(async () => {
  await new Promise<void>((resolve) => listener.close(() => resolve()));
});

const finding = {
  sourceType: "dof",
  sourceId: "dof-route-test",
  title: "Aviso oficial de prueba",
  summary: "Resumen de prueba.",
  content: "Contenido oficial de prueba.",
  officialUrl: "https://www.dof.gob.mx/nota_detalle.php?codigo=route-test",
};

async function call(body: unknown, token = "radar-editor") {
  return fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("Radar route requires editorial authentication and creates an unpublished draft", async (t) => {
  t.mock.method(storage, "getAdminSession", async (token: string) => ({ userId: token, expiresAt: new Date(Date.now() + 60_000) }));
  t.mock.method(storage, "getAdminUser", async (id: string) => ({ id, isActive: true, role: "super_admin" }));
  t.mock.method(storage, "getNews", async () => []);
  t.mock.method(storage, "createNews", async (insert: any) => ({ ...insert, id: "radar-news-1", createdAt: new Date(), updatedAt: new Date() }));
  t.mock.method(editorialDb, "insert", () => ({ values: async () => [] }));

  assert.equal((await call(finding, "")).status, 401);
  const response = await call(finding);
  assert.equal(response.status, 201, await response.clone().text());
  const body = await response.json();
  assert.equal(body.created, true);
  assert.equal(body.published, false);
  assert.equal(body.news.sourceUrl, finding.officialUrl);
  assert.equal(body.news.processingStatus, "ready_for_approval");
  assert.equal(body.news.categoryEs, "Monitor Laboral");
});

test("Radar route is idempotent for an existing source and rejects untrusted sources", async (t) => {
  t.mock.method(storage, "getAdminSession", async (token: string) => ({ userId: token, expiresAt: new Date(Date.now() + 60_000) }));
  t.mock.method(storage, "getAdminUser", async (id: string) => ({ id, isActive: true, role: "super_admin" }));
  const existing = { id: "existing", slug: "aviso-oficial", titleEs: finding.title, sourceUrl: finding.officialUrl, published: false };
  t.mock.method(storage, "getNews", async () => [existing]);
  const duplicate = await call(finding);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).created, false);

  const invalid = await call({ ...finding, sourceType: "dof", officialUrl: "https://example.org/not-official" });
  assert.equal(invalid.status, 422);
});
