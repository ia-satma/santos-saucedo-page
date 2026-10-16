import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import express from "express";
import { createServer } from "node:http";
import { eq, or } from "drizzle-orm";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { db } from "../server/db";
import * as s from "../shared/schema";
import { registerRoutes } from "../server/routes";
import { hashPassword } from "../server/auth";
import {
  deleteAppStorageObject,
  appStorageObjectKeyFromPath,
} from "../server/replitStorage";
import { resolvePrivateCvStoragePath } from "../server/security/uploads";
import { createNewsletterUnsubscribeToken } from "../server/security/newsletterUnsubscribe";
import { injectSiteMetadata } from "../server/seo/htmlMetadata";
import { cmsDefaults, mergeCms, type CmsSection } from "../shared/cms";
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  ),
  "Local DB required",
);
assert(
  !process.env.REPLIT_APP_STORAGE_BUCKET_ID &&
    !process.env.APP_STORAGE_BUCKET_ID,
  "Local test storage required",
);
process.env.ENABLE_APP_AGENTS = "false";
process.env.SESSION_SECRET = "local-fixture-signing-key-32-characters-only";
const app = express();
app.use(express.json({ limit: "1mb" }));
const server = createServer(app);
const suffix = randomUUID();
let base = "",
  count = 0,
  ip = 1;
const users: string[] = [];
const tokens: Record<string, string> = {};
const backups = new Map<string, any>();
const media: { id: string; path: string }[] = [];
const contacts: string[] = [];
const subscribers: string[] = [];
const applications: { id: string; cvPath: string }[] = [];
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "ss-public-test-"));
async function call(
  method: string,
  url: string,
  body?: unknown,
  role?: string,
  headers: Record<string, string> = {},
) {
  const r = await fetch(base + url, {
    method,
    headers: {
      ...(role ? { Authorization: "Bearer " + tokens[role] } : {}),
      ...(body instanceof FormData
        ? {}
        : body
          ? { "Content-Type": "application/json" }
          : {}),
      "X-Forwarded-For": `203.0.113.${ip++}`,
      ...headers,
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = r.headers.get("content-type")?.includes("json")
    ? await r.json()
    : await r.text();
  return { status: r.status, data };
}
function expect(
  result: { status: number; data: any },
  status: number,
  label: string,
) {
  assert.equal(
    result.status,
    status,
    `${label}: ${JSON.stringify(result.data).slice(0, 600)}`,
  );
  count++;
  return result.data;
}
async function saveConfig(section: CmsSection, edit: (value: any) => void) {
  const key = "editorial." + section;
  if (!backups.has(key)) {
    const [row] = await db
      .select()
      .from(s.siteConfig)
      .where(eq(s.siteConfig.key, key));
    backups.set(key, row);
  }
  const current = expect(
    await call(
      "GET",
      "/api/admin/site-config/" + section,
      undefined,
      "super_admin",
    ),
    200,
    "read config",
  );
  edit(current.content);
  return expect(
    await call(
      "PUT",
      "/api/admin/site-config/" + section,
      { content: current.content, revision: current.revision },
      "super_admin",
    ),
    200,
    "save config",
  );
}
async function upload(bytes: Uint8Array, mime: string, name: string) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime }), name);
  const result = await call(
    "POST",
    "/api/admin/media/upload",
    form,
    "super_admin",
  );
  if (result.status === 201) media.push(result.data);
  return result;
}
async function career(bytes: Uint8Array, extra: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({
    fullName: "Candidatura de prueba",
    email: `qa-${suffix}@localhost.test`,
    phone: "",
    interest: "Prueba pública",
    message: "Candidatura desechable de aceptación local.",
    consent: "true",
    preferredLanguage: "es",
    website: "",
    ...extra,
  }).forEach(([k, v]) => form.append(k, v));
  form.append(
    "cv",
    new Blob([bytes], { type: "application/pdf" }),
    "curriculum-local.pdf",
  );
  return call("POST", "/api/careers/apply", form);
}
try {
  await registerRoutes(server, app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as any).port}`;
  for (const role of ["super_admin", "viewer", "recursos_humanos", "editor"]) {
    const [u] = await db
      .insert(s.adminUsers)
      .values({
        username: `qa-flow-${role}-${suffix}`,
        email: `${role}-${suffix}@localhost.test`,
        passwordHash: await hashPassword(randomUUID()),
        role,
        isActive: true,
      })
      .returning();
    users.push(u.id);
    tokens[role] = randomUUID();
    await db.insert(s.adminSessions).values({
      userId: u.id,
      token: tokens[role],
      expiresAt: new Date(Date.now() + 3600000),
    });
  }
  const nav = await saveConfig("navigation", (v) => {
    v.items[0].labels.es = "Firma de prueba";
    v.items[0].children = [
      {
        id: "office-submenu",
        href: "/offices",
        labels: { es: "Oficina de prueba", en: "Office test" },
        visible: true,
        order: 0,
      },
    ];
    v.footerItems[0].visible = false;
  });
  let publicConfig = expect(
    await call("GET", "/api/site-config"),
    200,
    "public config",
  );
  assert.equal(publicConfig.navigation.items[0].children[0].href, "/offices");
  assert.equal(
    (mergeCms(cmsDefaults.navigation, publicConfig.navigation) as any).items[0]
      .children[0].labels.es,
    "Oficina de prueba",
  );
  count += 2;
  const bad = structuredClone(nav.content);
  bad.items[0].children[0].href = "javascript:alert(1)";
  expect(
    await call(
      "PUT",
      "/api/admin/site-config/navigation",
      { content: bad, revision: nav.revision },
      "super_admin",
    ),
    400,
    "unsafe submenu rejected",
  );
  expect(
    await call(
      "PUT",
      "/api/admin/site-config/navigation",
      { content: nav.content, revision: nav.revision },
      "viewer",
    ),
    403,
    "viewer cannot edit navigation",
  );
  await saveConfig("layout", (v) => {
    v.homeOrder.reverse();
    v.home.hero = false;
    v.home.monitor = false;
  });
  await saveConfig("links", (v) => {
    v.contact = "https://example.com/contact";
  });
  const integrations = await saveConfig("integrations", (v) => {
    v.searchConsole.verification = "local_test_verification";
    v.siteUrl = "https://santos.example.test";
    v.ga4.enabled = false;
    v.ga4.measurementId = "";
  });
  const html = await injectSiteMetadata(
    "<head></head><body>https://www.santossaucedo.com/</body>",
  );
  assert(
    html.includes(
      'name="google-site-verification" content="local_test_verification"',
    ),
  );
  assert(html.includes("https://santos.example.test/"));
  count += 2;
  const invalidGa = structuredClone(integrations.content);
  invalidGa.ga4.enabled = true;
  expect(
    await call(
      "PUT",
      "/api/admin/site-config/integrations",
      { content: invalidGa, revision: integrations.revision },
      "super_admin",
    ),
    400,
    "GA4 needs valid ID",
  );
  const contactEmail = `contact-${suffix}@localhost.test`;
  expect(
    await call("POST", "/api/contact", {
      fullName: "Prueba de contacto",
      email: contactEmail,
      message: "Prueba de llegada al CMS.",
      consent: true,
    }),
    200,
    "contact submits",
  );
  const [message] = await db
    .select()
    .from(s.contactSubmissions)
    .where(eq(s.contactSubmissions.email, contactEmail));
  assert(message);
  contacts.push(message.id);
  count++;
  expect(
    await call(
      "PATCH",
      `/api/admin/contact-submissions/${message.id}`,
      { read: true },
      "super_admin",
    ),
    200,
    "contact read",
  );
  expect(
    await call(
      "PATCH",
      `/api/admin/contact-submissions/${message.id}`,
      { read: false },
      "super_admin",
    ),
    200,
    "contact unread",
  );
  expect(
    await call("POST", "/api/contact", {
      fullName: " ",
      email: contactEmail,
      message: " ",
      consent: true,
    }),
    400,
    "empty contact rejected",
  );
  expect(
    await call("POST", "/api/contact", {
      fullName: "Prueba",
      email: contactEmail,
      message: "Prueba",
      consent: false,
    }),
    400,
    "missing consent rejected",
  );
  expect(
    await call(
      "POST",
      "/api/contact",
      {
        fullName: "Prueba",
        email: contactEmail,
        message: "Prueba",
        consent: true,
      },
      undefined,
      { Origin: "https://untrusted.example" },
    ),
    403,
    "foreign origin rejected",
  );
  const email = `subscriber-${suffix}@localhost.test`;
  expect(
    await call("POST", "/api/newsletter", { email, consent: true }),
    200,
    "newsletter submits",
  );
  const [sub] = await db
    .select()
    .from(s.newsletterSubscribers)
    .where(eq(s.newsletterSubscribers.email, email));
  subscribers.push(sub.id);
  expect(
    await call(
      "PATCH",
      `/api/admin/newsletter-subscribers/${sub.id}`,
      { isActive: false },
      "super_admin",
    ),
    200,
    "newsletter deactivate",
  );
  expect(
    await call(
      "PATCH",
      `/api/admin/newsletter-subscribers/${sub.id}`,
      { isActive: true },
      "super_admin",
    ),
    200,
    "newsletter reactivate",
  );
  const token = createNewsletterUnsubscribeToken(sub.id)!;
  expect(
    await call("POST", "/api/newsletter/unsubscribe", { token }),
    200,
    "public unsubscribe",
  );
  expect(
    await call("POST", "/api/newsletter/unsubscribe", { token: token + "bad" }),
    400,
    "invalid unsubscribe rejected",
  );
  await db
    .update(s.newsletterSubscribers)
    .set({ name: "=2+2" })
    .where(eq(s.newsletterSubscribers.id, sub.id));
  const csv = expect(
    await call(
      "GET",
      "/api/admin/newsletter-subscribers/export",
      undefined,
      "super_admin",
    ),
    200,
    "CSV export",
  );
  assert(csv.includes(email));
  assert(csv.includes('"\'=2+2"'));
  count++;
  const pdf = await PDFDocument.create();
  pdf.addPage([200, 200]);
  const pdfBytes = await pdf.save();
  expect(
    await upload(pdfBytes, "application/pdf", "document.pdf"),
    201,
    "real PDF upload",
  );
  expect(
    await upload(
      Buffer.from("%PDF-1.7\nnot a real PDF"),
      "application/pdf",
      "broken.pdf",
    ),
    400,
    "broken PDF rejected",
  );
  const png = await sharp({
    create: { width: 32, height: 32, channels: 3, background: "#202058" },
  })
    .png()
    .toBuffer();
  expect(
    await upload(png, "application/octet-stream", "image.png"),
    201,
    "unknown browser MIME normalized",
  );
  const video = path.join(temporary, "sample.mp4");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=navy:s=64x64:d=0.5",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    video,
  ]);
  const videoBytes = await fs.readFile(video);
  const v = expect(
    await upload(videoBytes, "video/mp4", "video.mp4"),
    201,
    "real video upload",
  );
  const range = await fetch(base + v.path, {
    headers: { Range: "bytes=0-31" },
  });
  assert.equal(range.status, 206);
  assert.equal((await range.arrayBuffer()).byteLength, 32);
  count += 2;
  expect(
    await upload(
      Buffer.from([0, 0, 0, 16, ...Buffer.from("ftypisom"), 0, 0, 0, 0]),
      "video/mp4",
      "broken.mp4",
    ),
    400,
    "fake video rejected",
  );
  const large = await sharp(randomBytes(1200 * 1200 * 3), {
    raw: { width: 1200, height: 1200, channels: 3 },
  })
    .png()
    .toBuffer();
  assert(large.length > 4 * 1024 * 1024);
  const session = expect(
    await call(
      "POST",
      "/api/admin/media/upload/start",
      { originalName: "large.png", mimeType: "image/png", size: large.length },
      "super_admin",
    ),
    200,
    "chunk session",
  );
  const part = large.subarray(0, session.chunkSize);
  const chunkHeaders = {
    "Content-Type": "application/octet-stream",
    "X-Upload-Token": session.token,
    "X-Chunk-Index": "0",
    "X-Chunk-Sha256": createHash("sha256").update(part).digest("hex"),
  };
  const forbidden = await fetch(base + "/api/admin/media/upload/chunk", {
    method: "POST",
    headers: {
      ...chunkHeaders,
      Authorization: "Bearer " + tokens.recursos_humanos,
    },
    body: part,
  });
  assert.equal(forbidden.status, 403);
  count++;
  const corrupt = await fetch(base + "/api/admin/media/upload/chunk", {
    method: "POST",
    headers: {
      ...chunkHeaders,
      Authorization: "Bearer " + tokens.super_admin,
      "X-Chunk-Sha256": "0".repeat(64),
    },
    body: part,
  });
  assert.equal(corrupt.status, 409);
  count++;
  const otherUser = await fetch(base + "/api/admin/media/upload/chunk", {
    method: "POST",
    headers: { ...chunkHeaders, Authorization: "Bearer " + tokens.editor },
    body: part,
  });
  assert.equal(otherUser.status, 401);
  count++;
  for (let index = 0; index < session.totalChunks; index++) {
    const bytes = large.subarray(
      index * session.chunkSize,
      (index + 1) * session.chunkSize,
    );
    const r = await fetch(base + "/api/admin/media/upload/chunk", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + tokens.super_admin,
        "Content-Type": "application/octet-stream",
        "X-Upload-Token": session.token,
        "X-Chunk-Index": String(index),
        "X-Chunk-Sha256": createHash("sha256").update(bytes).digest("hex"),
      },
      body: bytes,
    });
    assert.equal(r.status, 200, await r.text());
    count++;
  }
  const assembled = expect(
    await call(
      "POST",
      "/api/admin/media/upload/complete",
      { token: session.token },
      "super_admin",
    ),
    201,
    "assemble and persist chunked image",
  );
  media.push(assembled);
  assert.equal((await fetch(base + assembled.path)).status, 200);
  count++;
  expect(await career(Buffer.from("not a pdf")), 400, "invalid CV rejected");
  expect(await career(pdfBytes, { consent: "false" }), 400, "CV needs consent");
  expect(await career(pdfBytes), 201, "career application");
  const [application] = await db
    .select()
    .from(s.careerApplications)
    .where(eq(s.careerApplications.email, `qa-${suffix}@localhost.test`));
  assert(application);
  applications.push(application);
  count++;
  const rh = expect(
    await call(
      "GET",
      "/api/admin/career-applications",
      undefined,
      "recursos_humanos",
    ),
    200,
    "HR list",
  );
  assert(rh.some((r: any) => r.id === application.id && !("cvPath" in r)));
  count++;
  expect(
    await call("GET", `/api/admin/career-applications/${application.id}/cv`),
    401,
    "CV unauthenticated",
  );
  expect(
    await call(
      "GET",
      `/api/admin/career-applications/${application.id}/cv`,
      undefined,
      "viewer",
    ),
    403,
    "viewer cannot download CV",
  );
  const cv = await fetch(
    base + `/api/admin/career-applications/${application.id}/cv`,
    { headers: { Authorization: "Bearer " + tokens.recursos_humanos } },
  );
  assert.equal(cv.status, 200);
  assert.equal(cv.headers.get("cache-control"), "private, no-store");
  assert(Buffer.from(await cv.arrayBuffer()).equals(pdfBytes));
  count += 3;
  expect(
    await call(
      "PATCH",
      `/api/admin/career-applications/${application.id}`,
      { read: true, status: "reviewed", archived: true },
      "recursos_humanos",
    ),
    200,
    "HR status/archive",
  );
  expect(
    await call(
      "PATCH",
      `/api/admin/career-applications/${application.id}`,
      { archived: false },
      "recursos_humanos",
    ),
    200,
    "HR restore",
  );
  const filename = path.basename(
    resolvePrivateCvStoragePath(application.cvPath)!,
  );
  expect(
    await call("GET", "/uploads/" + filename),
    404,
    "CV not in public uploads",
  );
  await saveConfig("forms", (v) => {
    v.contact.enabled = false;
    v.newsletter.enabled = false;
    v.careers.enabled = false;
  });
  expect(
    await call("POST", "/api/contact", {
      fullName: "Prueba",
      email: contactEmail,
      message: "Prueba",
      consent: true,
    }),
    503,
    "paused contact",
  );
  expect(
    await call("POST", "/api/newsletter", { email, consent: true }),
    503,
    "paused newsletter",
  );
  expect(await career(pdfBytes), 503, "paused careers");
  console.log(
    `PUBLIC FLOW ACCEPTANCE PASSED: ${count} checks. Menus/submenus, home order, editable links, Search Console HTML, form controls, inbox, newsletter states/CSV/unsubscribe, valid PDF/image/video, chunked upload, private CV and HR permissions. No external provider call.`,
  );
} finally {
  for (const item of applications) {
    await db
      .delete(s.careerApplications)
      .where(eq(s.careerApplications.id, item.id));
    const local = resolvePrivateCvStoragePath(item.cvPath);
    if (local) await fs.rm(local, { force: true });
  }
  for (const id of contacts)
    await db
      .delete(s.contactSubmissions)
      .where(eq(s.contactSubmissions.id, id));
  for (const id of subscribers)
    await db
      .delete(s.newsletterSubscribers)
      .where(eq(s.newsletterSubscribers.id, id));
  for (const item of media) {
    await db.delete(s.mediaItems).where(eq(s.mediaItems.id, item.id));
    const key = appStorageObjectKeyFromPath(item.path);
    if (key) await deleteAppStorageObject(key);
  }
  for (const [key, row] of backups) {
    await db.delete(s.siteConfig).where(eq(s.siteConfig.key, key));
    if (row) await db.insert(s.siteConfig).values(row);
  }
  for (const id of users) {
    await db
      .delete(s.adminAccessEvents)
      .where(
        or(
          eq(s.adminAccessEvents.actorId, id),
          eq(s.adminAccessEvents.userId, id),
        ),
      );
    await db.delete(s.adminSessions).where(eq(s.adminSessions.userId, id));
    await db.delete(s.adminUsers).where(eq(s.adminUsers.id, id));
  }
  await fs.rm(temporary, { recursive: true, force: true });
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

// Registered background timers must not keep an isolated acceptance process alive.
process.exit(0);
