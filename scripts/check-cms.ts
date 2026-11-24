import "dotenv/config";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { registerRoutes } from "../server/routes";
import {
  adminUsers,
  adminSessions,
  siteConfig,
  mediaItems,
} from "../shared/schema";
import { cmsDefaults, validateCmsValue, mergeCms } from "../shared/cms";
import { hashPassword, hashSessionToken } from "../server/auth";
import { isNamedOnTeamPage } from "../shared/teamVisibility";
import { isPublicMediaKey } from "../server/replitStorage";
import { initializeAgents } from "../server/agents";

// This test touches only the developer's local database and restores every config row.
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  ),
  "CMS integration checks require a local database",
);
assert(
  !process.env.REPLIT_APP_STORAGE_BUCKET_ID &&
    !process.env.APP_STORAGE_BUCKET_ID,
  "CMS checks require local media storage",
);
process.env.ENABLE_APP_AGENTS = "false";
const app = express();
app.use(express.json({ limit: "1mb" }));
const http = createServer(app);
let base = "";
const suffix = randomUUID();
const userIds: string[] = [];
const tokens: Record<string, string> = {};
const uploaded: { id: string; path: string }[] = [];
const backup = new Map<string, any>();
let code = 0;
async function call(
  method: string,
  url: string,
  data?: unknown,
  role?: string,
) {
  const r = await fetch(base + url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(role ? { Authorization: `Bearer ${tokens[role]}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  let body: any;
  try {
    body = await r.json();
  } catch {}
  return { status: r.status, body };
}
try {
  for (const [key, data] of Object.entries(cmsDefaults))
    assert.deepEqual(
      validateCmsValue(key as any, data),
      [],
      `Invalid defaults: ${key}`,
    );
  assert.equal(isPublicMediaKey("public/media/test.png"), true);
  assert.equal(isPublicMediaKey("public/../private/file"), false);
  assert.equal(isPublicMediaKey("public/media/a/../../x"), false);
  assert.equal(
    isNamedOnTeamPage({ slug: "new-partner", isPartner: true, isPublic: true }),
    true,
  );
  assert.equal(
    isNamedOnTeamPage({
      slug: "enrique-santos-arce",
      isPartner: true,
      isPublic: false,
    }),
    false,
  );
  assert.deepEqual(
    mergeCms(
      { text: "approved", render: () => true },
      { text: "edited", __proto__: { polluted: true } },
    ).text,
    "edited",
  );
  await registerRoutes(http, app);
  // The production bootstrap registers agents before CMS writes enqueue audits.
  // Mirror that order here so the integration test exercises the real queue path
  // and does not turn expected registrations into noisy warning output.
  await initializeAgents();
  app.use((e: any, _req: any, res: any, _next: any) =>
    res.status(400).json({ error: e.message }),
  );
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
  const address = http.address() as any;
  base = `http://127.0.0.1:${address.port}`;
  for (const role of ["editor", "viewer"]) {
    const [u] = await db
      .insert(adminUsers)
      .values({
        email: `cms-${role}-${suffix}@example.test`,
        username: `cms-${role}-${suffix}`,
        passwordHash: await hashPassword("local-test-" + suffix),
        role,
        isActive: true,
      })
      .returning();
    userIds.push(u.id);
    tokens[role] = randomUUID();
    await db
      .insert(adminSessions)
      .values({
        userId: u.id,
        token: hashSessionToken(tokens[role]),
        expiresAt: new Date(Date.now() + 600000),
      });
  }
  assert.equal((await call("GET", "/api/admin/site-config/home")).status, 401);
  // The new consultation role may read configuration, but cannot write it.
  assert.equal((await call("PUT", "/api/admin/site-config/home", {}, "viewer")).status, 403);
  assert.equal(
    (await call("GET", "/api/admin/site-config/home", undefined, "viewer"))
      .status,
    200,
  );
  assert.equal(
    (
      await call(
        "GET",
        "/api/admin/site-config/not-allowed",
        undefined,
        "editor",
      )
    ).status,
    404,
  );
  const key = "editorial.home";
  const [old] = await db
    .select()
    .from(siteConfig)
    .where(eq(siteConfig.key, key));
  backup.set(key, old);
  const before = await call(
    "GET",
    "/api/admin/site-config/home",
    undefined,
    "editor",
  );
  assert.equal(before.status, 200);
  const next = structuredClone(before.body.content);
  next.es.hero.tagline = "Prueba de conexión del CMS";
  const saved = await call(
    "PUT",
    "/api/admin/site-config/home",
    { content: next, revision: before.body.revision },
    "editor",
  );
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  const read = await call("GET", "/api/site-config");
  assert.equal(read.body.home.es.hero.tagline, "Prueba de conexión del CMS");
  assert.equal(read.body.home.previous, undefined);
  const conflict = await call(
    "PUT",
    "/api/admin/site-config/home",
    { content: next, revision: before.body.revision },
    "editor",
  );
  assert.equal(conflict.status, 409);
  const bad = { ...next, unknownField: "should fail" };
  assert.equal(
    (
      await call(
        "PUT",
        "/api/admin/site-config/home",
        { content: bad, revision: saved.body.revision },
        "editor",
      )
    ).status,
    400,
  );
  const injected = structuredClone(cmsDefaults.media) as any;
  injected.hero.videoDesktop = "javascript:alert(1)";
  assert(validateCmsValue("media", injected).length > 0);
  assert.equal(
    (await call("GET", "/api/admin/contact-submissions")).status,
    401,
  );
  assert.equal(
    (await call("GET", "/api/admin/newsletter-subscribers")).status,
    401,
  );
  assert.equal((await call("GET", "/api/jobs")).status, 200);
  const visualKey = "visual.home.es";
  const [visualOld] = await db.select().from(siteConfig).where(eq(siteConfig.key, visualKey));
  backup.set(visualKey, visualOld);
  const visualRead = await call("GET", "/api/admin/visual-pages/home/es", undefined, "editor");
  assert.equal(visualRead.status, 200);
  const visualDraft = {
    content: [
      { type: "HeroBlock", props: { id: "hero", eyebrow: "Prueba", title: "Constructor visual", description: "Borrador visual de prueba.", mediaPath: "/editorial/test.webp", tone: "navy", sourceMap: { title: "home.hero.tagline", description: "home.hero.firma" } } },
      { type: "TextBlock", props: { id: "text", title: "Texto", body: "Contenido de prueba.", tone: "paper", sourceMap: { title: "home.firma.title", body: "home.firma.body" } } },
    ],
    root: { props: { pageTitle: "Portada" } },
  };
  const visualSaved = await call("PUT", "/api/admin/visual-pages/home/es", { draftData: visualDraft, revision: visualRead.body.revision }, "editor");
  assert.equal(visualSaved.status, 200, JSON.stringify(visualSaved.body));
  assert.deepEqual(visualSaved.body.syncedSections, ["home"]);
  const syncedHome = await call("GET", "/api/admin/site-config/home", undefined, "editor");
  assert.equal(syncedHome.body.content.es.hero.tagline, "Constructor visual");
  assert.equal(syncedHome.body.content.es.firma.title, "Texto");
  assert.deepEqual(syncedHome.body.content.es.firma.body, ["Contenido de prueba."]);
  assert.equal((await call("GET", "/api/admin/visual-pages/home/es", undefined, "editor")).body.draftData.content[0].type, "HeroBlock");
  assert.equal((await call("PUT", "/api/admin/visual-pages/home/es", { draftData: visualDraft, revision: visualRead.body.revision }, "editor")).status, 409);
  const visualPublished = await call("POST", "/api/admin/visual-pages/home/es/publish", { revision: visualSaved.body.revision }, "editor");
  assert.equal(visualPublished.status, 200, JSON.stringify(visualPublished.body));
  const publicVisual = await call("GET", "/api/visual-pages/home/es");
  assert.equal(publicVisual.status, 200);
  assert.equal(publicVisual.body.data, null, "La composición visual no debe exponerse con el bloque visual apagado");
  const layoutKey = "editorial.layout";
  const [layoutOld] = await db.select().from(siteConfig).where(eq(siteConfig.key, layoutKey));
  backup.set(layoutKey, layoutOld);
  const layoutRead = await call("GET", "/api/admin/site-config/layout", undefined, "editor");
  assert.equal(layoutRead.status, 200);
  const layoutDraft = structuredClone(layoutRead.body.content);
  layoutDraft.pages.home.blocks.visual = true;
  const layoutSaved = await call("PUT", "/api/admin/site-config/layout", { content: layoutDraft, revision: layoutRead.body.revision }, "editor");
  assert.equal(layoutSaved.status, 200, JSON.stringify(layoutSaved.body));
  const publicVisualEnabled = await call("GET", "/api/visual-pages/home/es");
  assert.equal(publicVisualEnabled.status, 200);
  assert.equal(publicVisualEnabled.body.data.content[0].type, "HeroBlock");
  const hiddenLayout = structuredClone(layoutSaved.body.content);
  hiddenLayout.pages.home.enabled = false;
  const hiddenLayoutSaved = await call("PUT", "/api/admin/site-config/layout", { content: hiddenLayout, revision: layoutSaved.body.revision }, "editor");
  assert.equal(hiddenLayoutSaved.status, 200, JSON.stringify(hiddenLayoutSaved.body));
  const publicVisualHiddenPage = await call("GET", "/api/visual-pages/home/es");
  assert.equal(publicVisualHiddenPage.status, 200);
  assert.equal(publicVisualHiddenPage.body.data, null, "Una página pública desactivada no debe exponer su composición visual");
  const visualRestored = await call("POST", "/api/admin/visual-pages/home/es/restore", { revision: visualPublished.body.revision }, "editor");
  assert.equal(visualRestored.status, 200, JSON.stringify(visualRestored.body));
  // A real image traverses multipart upload, local storage, media row and public serving.
  const image = await import("node:fs/promises").then((fs) =>
    fs.readFile("client/public/favicon.png"),
  );
  const form = new FormData();
  form.append("file", new Blob([image], { type: "image/png" }), "test.svg");
  const upload = await fetch(base + "/api/admin/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.editor}` },
    body: form,
  });
  const item = await upload.json();
  assert.equal(upload.status, 201, JSON.stringify(item));
  assert(item.path.endsWith(".png"));
  uploaded.push({ id: item.id, path: item.path });
  const download = await fetch(base + item.path);
  assert.equal(download.status, 200);
  const sanitized = Buffer.from(await download.arrayBuffer());
  assert.equal(
    (await (await import("sharp")).default(sanitized).metadata()).format,
    "png",
  );
  assert.equal(
    (await (await import("sharp")).default(sanitized).metadata()).width,
    (await (await import("sharp")).default(image).metadata()).width,
  );
  const range = await fetch(base + item.path, {
    headers: { Range: "bytes=0-7" },
  });
  assert.equal(range.status, 206);
  assert.equal((await range.arrayBuffer()).byteLength, 8);
  const fake = new FormData();
  fake.append(
    "file",
    new Blob(['<svg onload="alert(1)"></svg>'], { type: "image/png" }),
    "fake.png",
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.editor}` },
        body: fake,
      })
    ).status,
    400,
  );
  const broken = new FormData();
  broken.append(
    "file",
    new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])], {
      type: "image/png",
    }),
    "broken.png",
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.editor}` },
        body: broken,
      })
    ).status,
    400,
  );
  // A fresh read proves persistence and includes the last version for restoration.
  const again = await call(
    "GET",
    "/api/admin/site-config/home",
    undefined,
    "editor",
  );
  assert.notEqual(again.body.revision, saved.body.revision, "La sincronización visual debe crear una revisión CMS nueva");
  assert.equal(typeof again.body.content.es.hero.tagline, "string");
  console.log(
    "CMS integration: defaults, RBAC, persistence, conflicts, validation, multipart media, integrity, video ranges, private inbox and public jobs passed.",
  );
} catch (error) {
  console.error(error);
  code = 1;
} finally {
  for (const file of uploaded) {
    await db.delete(mediaItems).where(eq(mediaItems.id, file.id));
    const key = file.path.startsWith("/media/public/media/")
      ? file.path.slice(7)
      : null;
    if (key)
      await import("node:fs/promises").then((fs) =>
        fs.unlink("uploads/" + key).catch(() => {}),
      );
  }
  for (const [key, old] of backup) {
    if (old)
      await db
        .update(siteConfig)
        .set({
          value: old.value,
          valueEs: old.valueEs,
          type: old.type,
          category: old.category,
          description: old.description,
          updatedAt: old.updatedAt,
        })
        .where(eq(siteConfig.key, key));
    else await db.delete(siteConfig).where(eq(siteConfig.key, key));
  }
  for (const id of userIds) {
    await db.delete(adminSessions).where(eq(adminSessions.userId, id));
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }
  http.close();
  process.exit(code);
}
