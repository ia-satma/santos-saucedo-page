import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { registerRoutes } from "../server/routes";
import {
  adminUsers,
  adminSessions,
  teamMembers,
  practiceGroups,
  news,
  newsTeamMembers,
  teamMemberPracticeGroups,
  mediaItems,
} from "../shared/schema";
import { hashPassword } from "../server/auth";
import { appStorageObjectKeyFromPath } from "../server/replitStorage";
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  ),
  "Local database required",
);
assert(
  !process.env.REPLIT_APP_STORAGE_BUCKET_ID &&
    !process.env.APP_STORAGE_BUCKET_ID,
  "Use local media storage for these checks",
);
process.env.ENABLE_APP_AGENTS = "false";
const app = express();
app.use(express.json({ limit: "1mb" }));
const server = createServer(app);
const users: string[] = [],
  people: string[] = [],
  groups: string[] = [],
  notes: string[] = [],
  files: { id: string; path: string }[] = [];
let beforeOrder: { id: string; order: number | null }[] = [];
let base = "",
  code = 0;
const tokens: Record<string, string> = {};
const suffix = randomUUID();
async function call(
  method: string,
  url: string,
  data?: unknown,
  role = "editor",
) {
  const r = await fetch(base + url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return {
    status: r.status,
    body: await r.json().catch(() => null),
    headers: r.headers,
  };
}
try {
  await registerRoutes(server, app);
  app.use((e: any, _req: any, res: any, _next: any) =>
    res.status(400).json({ error: e.message }),
  );
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as any).port}`;
  for (const role of ["editor", "viewer"]) {
    const [user] = await db
      .insert(adminUsers)
      .values({
        email: `editorial-${role}-${suffix}@example.test`,
        username: `editorial-${role}-${suffix}`,
        passwordHash: await hashPassword(randomUUID()),
        role,
        isActive: true,
      })
      .returning();
    users.push(user.id);
    tokens[role] = randomUUID();
    await db.insert(adminSessions).values({
      userId: user.id,
      token: tokens[role],
      expiresAt: new Date(Date.now() + 600000),
    });
  }
  assert.equal((await call("GET", "/api/admin/team/stats")).status, 200);
  assert.equal(
    (await call("GET", "/api/admin/catalog-order/team", undefined, "none"))
      .status,
    401,
  );
  assert.equal(
    (await call("PUT", "/api/admin/catalog-order/team", {}, "viewer")).status,
    403,
  );
  const group = await call("POST", "/api/admin/practice-groups", {
    name: "Editorial QA practice",
    nameEs: "Práctica de prueba local",
    slug: `cms-qa-${suffix}`,
    description: "Local check",
    descriptionEs: "Verificación local",
    published: false,
    teamMemberIds: [],
  });
  assert.equal(group.status, 201);
  groups.push(group.body.id);
  for (let i = 0; i < 2; i++) {
    const person = await call("POST", "/api/admin/team", {
      name: `CMS QA ${i}`,
      slug: `cms-qa-${i}-${suffix}`,
      title: "QA",
      titleEs: "Prueba",
      role: "QA",
      roleEs: "Prueba",
      isPartner: false,
      isPublic: false,
      practiceGroupIds: [group.body.id],
    });
    assert.equal(person.status, 201, JSON.stringify(person.body));
    people.push(person.body.id);
  }
  const person = await call("GET", `/api/admin/team/${people[0]}`);
  assert.deepEqual(person.body.practiceGroupIds, [group.body.id]);
  const roster = await call("GET", "/api/admin/practice-groups");
  assert(
    roster.body
      .find((g: any) => g.id === group.body.id)
      .teamMemberIds.includes(people[0]),
  );
  const hidden = await call("GET", `/api/team/${people[0]}`);
  assert.equal(hidden.status, 404);
  const preview = await call("GET", `/api/admin/preview/team/${people[0]}`);
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get("cache-control"), "private, no-store");
  assert.equal(preview.body.representativeMatters, undefined);
  assert.equal(
    (
      await call(
        "GET",
        `/api/admin/preview/team/${people[0]}`,
        undefined,
        "none",
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await call("POST", "/api/admin/team", {
        ...person.body,
        name: "Must not replace",
        practiceGroupIds: [],
      })
    ).status,
    409,
  );
  assert.equal(
    (await call("GET", `/api/admin/team/${people[0]}`)).body.name,
    "CMS QA 0",
  );
  assert.equal(
    (
      await call("PUT", `/api/admin/team/${people[0]}`, {
        imageUrl: "javascript:alert(1)",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("PUT", `/api/admin/team/${people[0]}`, {
        practiceGroupIds: [randomUUID()],
      })
    ).status,
    400,
  );
  const library = await call("GET", "/api/admin/media");
  assert(
    library.body.some(
      (item: any) => item.originalName === "portada-azul-1920.mp4",
    ),
  );
  assert.equal(
    new Set(library.body.map((item: any) => item.id)).size,
    library.body.length,
  );
  assert.equal(
    (await call("GET", "/api/admin/media?kind=unknown")).status,
    400,
  );
  const virtual = library.body.find((item: any) =>
    item.id.startsWith("bundled-"),
  );
  if (virtual) {
    files.push(virtual);
    assert.equal(
      (
        await call("PATCH", `/api/admin/media/${virtual.id}`, {
          alt: "Local description test",
        })
      ).status,
      200,
    );
  }
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { FormattedText } =
    await import("../client/src/components/editorial/FormattedText");
  const safe = renderToStaticMarkup(
    createElement(FormattedText, {
      text: "**Dato**\n\n<script>alert(1)</script>\n\n[Mal](javascript:alert)",
    }),
  );
  assert(safe.includes("<strong>Dato</strong>"));
  assert(!safe.includes("<script>"));
  assert(!safe.includes('href="javascript:'));
  beforeOrder = await db
    .select({ id: teamMembers.id, order: teamMembers.order })
    .from(teamMembers);
  const order = await call("GET", "/api/admin/catalog-order/team");
  const ids = order.body.items.map((x: any) => x.id);
  const concurrent = await Promise.all([
    call("PUT", "/api/admin/catalog-order/team", {
      ids: [...ids].reverse(),
      revision: order.body.revision,
    }),
    call("PUT", "/api/admin/catalog-order/team", {
      ids: [...ids.slice(1), ids[0]],
      revision: order.body.revision,
    }),
  ]);
  assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 409]);
  const actual = await call("GET", "/api/admin/catalog-order/team");
  const winner = concurrent.find((r) => r.status === 200)!;
  assert.deepEqual(
    actual.body.items.map((x: any) => x.id),
    winner.body.items.map((x: any) => x.id),
  );
  assert.equal(
    (
      await call("PUT", "/api/admin/catalog-order/team", {
        ids: [ids[0], ids[0]],
        revision: actual.body.revision,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("PUT", "/api/admin/catalog-order/team", {
        ids: ids.slice(1),
        revision: actual.body.revision,
      })
    ).status,
    409,
  );
  assert.equal(
    (await call("GET", "/api/admin/catalog-order/team")).body.revision,
    actual.body.revision,
  );
  const draft = {
    title: "CMS local QA",
    titleEs: "Prueba local CMS",
    slug: `cms-note-${suffix}`,
    excerpt: "Summary",
    excerptEs: "Resumen",
    content: "**Verified**\n\n- A\n- B",
    contentEs: "**Verificado**",
    category: "insights",
    categoryEs: "Insights",
    published: false,
    featuredHome: true,
    tags: ["Prueba"],
    documentUrl: "/media/public/media/qa-document.pdf",
    memberIds: [people[0]],
  };
  const created = await call("POST", "/api/admin/editor/news", draft);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const id = created.body.item.id;
  notes.push(id);
  assert.equal((await call("GET", `/api/news/${draft.slug}`)).status, 404);
  assert.equal(
    (await call("GET", `/api/admin/preview/news/${id}`)).status,
    200,
  );
  assert.equal(
    (await call("POST", "/api/admin/editor/news", draft)).status,
    409,
  );
  assert.equal(
    (
      await call("PUT", `/api/admin/editor/news/${id}`, {
        ...draft,
        sourceUrl: "javascript:alert(1)",
        revision: created.body.revision,
      })
    ).status,
    400,
  );
  const scheduled = await call("PUT", `/api/admin/editor/news/${id}`, {
    ...draft,
    published: true,
    publishAt: "2099-01-01T12:00:00Z",
    revision: created.body.revision,
  });
  assert.equal(scheduled.status, 200);
  assert.equal((await call("GET", `/api/news/${draft.slug}`)).status, 404);
  const published = await call("PUT", `/api/admin/editor/news/${id}`, {
    ...draft,
    published: true,
    publishAt: null,
    revision: scheduled.body.revision,
  });
  assert.equal(published.status, 200);
  const live = await call("GET", `/api/news/${draft.slug}`);
  assert.equal(live.status, 200);
  assert.equal(live.body.documentUrl, draft.documentUrl);
  assert.equal(live.body.processingStatus, undefined);
  assert.equal(
    (
      await call("PUT", `/api/admin/editor/news/${id}`, {
        ...draft,
        revision: created.body.revision,
      })
    ).status,
    409,
  );
  const png = await fs.readFile("client/public/favicon.png");
  const body = new FormData();
  body.append(
    "file",
    new Blob([png], { type: "image/png" }),
    "editorial-qa.png",
  );
  const upload = await fetch(base + "/api/admin/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.editor}` },
    body,
  });
  const file = await upload.json();
  assert.equal(upload.status, 201);
  files.push(file);
  assert.equal(
    (
      await call("PATCH", `/api/admin/media/${file.id}`, {
        alt: "QA image",
        altEs: "Imagen de prueba",
      })
    ).status,
    200,
  );
  assert.equal(
    (await call("DELETE", `/api/admin/media/${file.id}`)).status,
    200,
  );
  assert(
    !(await call("GET", "/api/admin/media")).body.some(
      (x: any) => x.id === file.id,
    ),
  );
  assert(
    (await call("GET", "/api/admin/media-archive")).body.some(
      (x: any) => x.id === file.id,
    ),
  );
  assert.equal((await fetch(base + file.path)).status, 200);
  assert.equal(
    (await call("PATCH", `/api/admin/media/${file.id}`, { restore: true }))
      .status,
    200,
  );
  assert(
    (await call("GET", "/api/admin/media")).body.some(
      (x: any) => x.id === file.id,
    ),
  );
  console.log(
    "Editorial checks passed: team stats, RBAC, duplicate safety, bidirectional practice relationships, complete atomic ordering, concurrent 409, private preview, bilingual news/PDF, scheduling, revisions, metadata, archive and restoration.",
  );
} catch (error) {
  console.error(error);
  code = 1;
} finally {
  for (const n of notes) {
    await db.delete(newsTeamMembers).where(eq(newsTeamMembers.newsId, n));
    await db.delete(news).where(eq(news.id, n));
  }
  for (const p of people) {
    await db
      .delete(teamMemberPracticeGroups)
      .where(eq(teamMemberPracticeGroups.teamMemberId, p));
    await db.delete(teamMembers).where(eq(teamMembers.id, p));
  }
  for (const g of groups)
    await db.delete(practiceGroups).where(eq(practiceGroups.id, g));
  for (const original of beforeOrder)
    if (!people.includes(original.id))
      await db
        .update(teamMembers)
        .set({ order: original.order })
        .where(eq(teamMembers.id, original.id));
  for (const file of files) {
    await db.delete(mediaItems).where(eq(mediaItems.id, file.id));
    const key = appStorageObjectKeyFromPath(file.path);
    if (key) await fs.unlink("uploads/" + key).catch(() => {});
  }
  for (const id of users) {
    await db.delete(adminSessions).where(eq(adminSessions.userId, id));
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }
  server.close();
  process.exit(code);
}
