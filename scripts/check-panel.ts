import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import express from "express";
import { eq, or } from "drizzle-orm";
import { db } from "../server/db";
import * as schema from "../shared/schema";
import { registerRoutes } from "../server/routes";
import { hashPassword } from "../server/auth";
import { ALL_AGENT_IDS } from "../shared/agentConstants";
import { initializeAgents, orchestrator } from "../server/agents";
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  ),
  "Panel tests require a local database",
);
assert(
  !process.env.REPLIT_APP_STORAGE_BUCKET_ID &&
    !process.env.APP_STORAGE_BUCKET_ID,
  "Panel tests require local storage",
);
assert(
  !process.env.OPENAI_API_KEY && !process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  "Panel tests must not consume a real AI account",
);
process.env.ENABLE_APP_AGENTS = "true";
process.env.AGENT_AUTO_PROCESSING = "false";
const app = express();
app.use(express.json({ limit: "1mb" }));
const server = createServer(app);
const suffix = randomUUID(),
  ids: string[] = [],
  cleanup: (() => Promise<unknown>)[] = [];
let base = "",
  token = "",
  code = 0,
  count = 0;
async function call(method: string, url: string, data?: unknown, auth = true) {
  const res = await fetch(base + url, {
    method,
    headers: {
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}
function ok(
  result: { status: number; body: any },
  status: number | number[] = 200,
  label = "request",
) {
  assert(
    (Array.isArray(status) ? status : [status]).includes(result.status),
    `${label}: ${result.status} ${JSON.stringify(result.body).slice(0, 500)}`,
  );
  count++;
  return result.body;
}
try {
  await registerRoutes(server, app);
  await initializeAgents();
  const user = await db
    .insert(schema.adminUsers)
    .values({
      username: `qa-panel-${suffix}`,
      email: `qa-${suffix}@localhost.test`,
      passwordHash: await hashPassword(randomUUID()),
      role: "super_admin",
      isActive: true,
    })
    .returning();
  ids.push(user[0].id);
  token = randomUUID();
  await db
    .insert(schema.adminSessions)
    .values({
      userId: ids[0],
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as any).port}`;
  const reads = [
    "overview",
    "me",
    "users",
    "access-events",
    "site-config",
    "storage/status",
    "team",
    "team/stats",
    "team/options",
    "practice-groups",
    "industry-groups",
    "news",
    "news/stats",
    "news/all",
    "news/translation-counts",
    "posts",
    "categories",
    "tags",
    "events",
    "rankings",
    "awards",
    "clients",
    "testimonials",
    "jobs",
    "offices",
    "alliances",
    "desks",
    "knowledge",
    "media",
    "media-archive",
    "contact-submissions",
    "newsletter-subscribers",
    "generated-images",
    "generated-audio",
    "generated-presentations",
    "copies-ai",
    "usage/summary",
    "cms-stats",
    "agent-metrics",
    "translation-overview",
  ];
  for (const url of reads) {
    ok(await call("GET", `/api/admin/${url}`), 200, url);
    ok(
      await call("GET", `/api/admin/${url}`, undefined, false),
      401,
      `private ${url}`,
    );
  }
  for (const section of (await import("../shared/cms")).cmsSections)
    ok(
      await call("GET", `/api/admin/site-config/${section.key}`),
      200,
      section.key,
    );
  const status = ok(await call("GET", "/api/agents/status"));
  assert.equal(status.orchestrator.registeredAgents.length, 14);
  for (const agent of ALL_AGENT_IDS) {
    ok(await call("GET", `/api/agents/stats/${agent}`), 200, agent);
    ok(
      await call("POST", `/api/agents/run/${agent}`, { unknownField: "bad" }),
      400,
      `invalid ${agent}`,
    );
  }
  for (const endpoint of [
    "/api/agents/jobs/failed",
    "/api/agents/evolution/proposals",
    "/api/agents/failed-summary",
    "/api/health-check/run",
    "/api/audits",
    "/api/audits/latest",
    "/api/audits/findings/open",
    "/api/system/chronicler",
  ]) {
    const r = await call("GET", endpoint);
    if (endpoint === "/api/health-check/report" && r.status === 404) continue;
    ok(r, 200, endpoint);
  }
  const cases: [string, Record<string, unknown>, string, unknown, any][] = [
    [
      "posts",
      {
        title: "QA Post",
        titleEs: "Artículo QA",
        slug: `qa-${suffix}`,
        status: "draft",
        publishedAt: "2026-10-16T12:00:00.000Z",
      },
      "titleEs",
      "Artículo actualizado",
      schema.blogPosts,
    ],
    [
      "events",
      {
        title: "QA Event",
        titleEs: "Evento QA",
        slug: `qa-${suffix}`,
        type: "seminar",
        description: "Test",
        descriptionEs: "Prueba",
        date: "2026-10-16T12:00:00.000Z",
        published: false,
      },
      "titleEs",
      "Evento actualizado",
      schema.events,
    ],
    [
      "categories",
      { name: `QA ${suffix}`, nameEs: "Categoría QA", slug: `qa-${suffix}` },
      "nameEs",
      "Actualizada",
      schema.blogCategories,
    ],
    [
      "industry-groups",
      {
        name: "QA Industry",
        nameEs: "Industria QA",
        slug: `qa-${suffix}`,
        description: "Test",
        descriptionEs: "Prueba",
      },
      "nameEs",
      "Industria actualizada",
      schema.industryGroups,
    ],
    [
      "rankings",
      {
        publication: "QA",
        name: "QA Ranking",
        nameEs: "Ranking QA",
        organization: "QA",
        year: 2026,
      },
      "nameEs",
      "Ranking actualizado",
      schema.rankings,
    ],
    [
      "awards",
      { name: "QA Award", nameEs: "Premio QA", organization: "QA", year: 2026 },
      "nameEs",
      "Premio actualizado",
      schema.awards,
    ],
    [
      "clients",
      { name: "QA client" },
      "descriptionEs",
      "Cliente actualizado",
      schema.representativeClients,
    ],
    [
      "testimonials",
      { quote: "QA quote", quoteEs: "Cita QA", authorName: "QA" },
      "quoteEs",
      "Cita actualizada",
      schema.testimonials,
    ],
    [
      "jobs",
      {
        title: "QA Job",
        titleEs: "Vacante QA",
        description: "Test",
        descriptionEs: "Prueba",
        published: false,
      },
      "titleEs",
      "Vacante actualizada",
      schema.jobOpenings,
    ],
    [
      "offices",
      { name: "QA", nameEs: "QA", city: "QA", country: "MX", address: "QA" },
      "nameEs",
      "Oficina actualizada",
      schema.offices,
    ],
    [
      "alliances",
      { name: "QA" },
      "nameEs",
      "Alianza actualizada",
      schema.alliances,
    ],
    [
      "desks",
      {
        name: "QA",
        nameEs: "QA",
        slug: `qa-${suffix}`,
        description: "Test",
        descriptionEs: "Prueba",
      },
      "nameEs",
      "Desk actualizado",
      schema.specializedDesks,
    ],
  ];
  for (const [route, data, field, value, table] of cases) {
    const created = ok(
      await call("POST", `/api/admin/${route}`, data),
      [200, 201],
      `create ${route}`,
    );
    assert(created.id);
    cleanup.push(() => db.delete(table).where(eq(table.id, created.id)));
    const updated = ok(
      await call("PUT", `/api/admin/${route}/${created.id}`, {
        [field]: value,
      }),
      200,
      `update ${route}`,
    );
    assert.equal(updated[field], value);
    ok(
      await call("DELETE", `/api/admin/${route}/${created.id}`),
      200,
      `delete ${route}`,
    );
  }
  const doc = {
    category: "editorial_voice",
    title: "Prueba pública de redacción",
    content: "Prueba de redacción pública del CMS.",
    agentType: "formatter",
    dataClassification: "public",
    aiUseConfirmed: true,
  };
  ok(
    await call("POST", "/api/admin/knowledge", {
      ...doc,
      aiUseConfirmed: false,
    }),
    400,
    "knowledge consent",
  );
  const knowledge = ok(
    await call("POST", "/api/admin/knowledge", doc),
    [200, 201],
    "knowledge create",
  );
  cleanup.push(() =>
    db
      .delete(schema.agentKnowledge)
      .where(eq(schema.agentKnowledge.id, knowledge.id)),
  );
  assert.equal(knowledge.approvedForAiBy, ids[0]);
  ok(
    await call("PUT", `/api/admin/knowledge/${knowledge.id}`, {
      ...doc,
      title: "QA revised",
    }),
    200,
    "knowledge edit",
  );
  ok(
    await call("DELETE", `/api/admin/knowledge/${knowledge.id}`),
    200,
    "knowledge delete",
  );
  const [copy] = await db
    .insert(schema.agentCopyHistory)
    .values({
      agentType: "formatter",
      copyType: "formatted_article",
      title: "Prueba pública de redacción",
      content: { content: "Texto QA" },
      searchText: `QA ${suffix}`,
      actorId: ids[0],
    })
    .returning();
  cleanup.push(() =>
    db
      .delete(schema.agentCopyHistory)
      .where(eq(schema.agentCopyHistory.id, copy.id)),
  );
  assert(
    ok(await call("GET", `/api/admin/copies-ai/${copy.id}`)).plainText.includes(
      "Texto QA",
    ),
  );
  for (const archived of [true, false]) {
    const result = ok(
      await call("POST", `/api/admin/copies-ai/${copy.id}/archive`, {
        archived,
      }),
    );
    assert.equal(result.archived, archived);
  }
  ok(
    await call("GET", "/api/admin/copies-ai?page=-1"),
    400,
    "invalid history page",
  );
  const form = new FormData();
  form.append(
    "file",
    new Blob(["Material público QA para una presentación."], {
      type: "text/plain",
    }),
    "qa.txt",
  );
  const up = await fetch(base + "/api/admin/presentations/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploaded = await up.json();
  ok({ status: up.status, body: uploaded }, 200, "private document upload");
  assert(uploaded.url.startsWith("private:presentations/"));
  cleanup.push(() =>
    fs
      .unlink(
        path.join(
          "private_uploads",
          "presentation-inputs",
          path.basename(uploaded.url),
        ),
      )
      .catch(() => {}),
  );
  const generated = ok(
    await call("POST", "/api/admin/presentations/generate", {
      topic: "Prueba pública QA: organización editorial",
      docs: [uploaded],
      slideCount: 3,
      lang: "es",
      template: "santossaucedo",
      branding: "santossaucedo",
      formats: ["pptx", "pdf", "png"],
      visuals: false,
      illustrate: false,
      supportImages: [],
      webSearch: false,
      dataClassification: "public",
      aiUseConfirmed: true,
    }),
    200,
    "presentation generate",
  );
  const presentation = generated.presentation;
  assert(presentation?.id);
  cleanup.push(() =>
    db
      .delete(schema.generatedPresentations)
      .where(eq(schema.generatedPresentations.id, presentation.id)),
  );
  cleanup.push(() =>
    fs.rm(path.join("private", "generated-presentations", presentation.id), {
      recursive: true,
      force: true,
    }),
  );
  for (const format of ["pptx", "pdf"]) {
    const r = await fetch(base + presentation[format + "Url"], {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(r.status, 200);
    assert((await r.arrayBuffer()).byteLength > 1000);
    count++;
    assert.equal(
      (await fetch(base + presentation[format + "Url"])).status,
      401,
    );
    count++;
  }
  assert(presentation.pngUrls.length >= 3);
  const slide = await fetch(base + presentation.pngUrls[0], {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(slide.status, 200);
  count++;
  ok(
    await call(
      "DELETE",
      `/api/admin/generated-presentations/${presentation.id}`,
    ),
    405,
    "history immutable",
  );
  console.log(
    `PANEL ACCEPTANCE PASSED: ${count} HTTP checks, ${reads.length} private read endpoints, ${(await import("../shared/cms")).cmsSections.length} config sections, 14 agent contracts, 12 catalog CRUD flows, knowledge approval, copy archive/restore, private document upload and PPTX/PDF/PNG generation/download. No external AI call.`,
  );
} catch (error) {
  console.error(error);
  code = 1;
} finally {
  orchestrator.stopProcessing();
  for (const fn of cleanup.reverse())
    await fn().catch((error) => console.error("Fixture cleanup failed", error));
  for (const id of ids) {
    await db
      .delete(schema.adminAccessEvents)
      .where(
        or(
          eq(schema.adminAccessEvents.userId, id),
          eq(schema.adminAccessEvents.actorId, id),
        ),
      );
    await db
      .delete(schema.adminSessions)
      .where(eq(schema.adminSessions.userId, id));
    await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));
  }
  server.close();
  process.exit(code);
}
