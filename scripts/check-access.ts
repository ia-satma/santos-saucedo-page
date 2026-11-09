import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "../server/db";
import {
  adminUsers,
  adminSessions,
  adminAccessEvents,
  careerApplications,
  jobOpenings,
} from "../shared/schema";
import { comparePassword, hashPassword } from "../server/auth";
import { registerRoutes } from "../server/routes";
import {
  ensurePrivateUploadDirectories,
  privateCvDir,
} from "../server/security/uploads";
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  ),
  "Local test database required",
);
assert(
  !process.env.REPLIT_APP_STORAGE_BUCKET_ID &&
    !process.env.APP_STORAGE_BUCKET_ID,
  "Local test storage required",
);
process.env.ENABLE_APP_AGENTS = "false";
const app = express();
app.use(express.json());
const server = createServer(app);
const ids: string[] = [],
  applicationIds: string[] = [],
  jobIds: string[] = [],
  suffix = randomUUID(),
  cvFile = path.join(privateCvDir, `${randomBytes(16).toString("hex")}.pdf`),
  tokens: Record<string, string> = {};
let base = "",
  exitCode = 0;
async function call(
  method: string,
  path: string,
  data?: unknown,
  actor = "principal",
) {
  const r = await fetch(base + path, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(tokens[actor] ? { Authorization: `Bearer ${tokens[actor]}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return { status: r.status, body: await r.json(), headers: r.headers };
}
async function account(id: string) {
  const r = await call("GET", "/api/admin/users");
  assert.equal(r.status, 200);
  return r.body.find((u: any) => u.id === id);
}
const bodyOf = (u: any, changes = {}) => ({
  username: u.username,
  email: u.email,
  role: u.role,
  permissions: u.permissions,
  isActive: u.isActive,
  revision: u.revision,
  ...changes,
});
try {
  await registerRoutes(server, app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as any).port}`;
  for (const [actor, role] of Object.entries({
    principal: "super_admin",
    second: "super_admin",
    editor: "editor",
    viewer: "viewer",
  })) {
    const [u] = await db
      .insert(adminUsers)
      .values({
        username: `access-${actor}-${suffix}`,
        email: `${actor}-${suffix}@example.test`,
        role,
        passwordHash: await hashPassword(randomUUID()),
        isActive: true,
      })
      .returning();
    ids.push(u.id);
    const [s] = await db
      .insert(adminSessions)
      .values({
        userId: u.id,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 3600000),
      })
      .returning();
    tokens[actor] = s.token;
  }
  assert.equal(
    (await call("GET", "/api/admin/users", undefined, "anonymous")).status,
    401,
  );
  assert.equal(
    (await call("GET", "/api/admin/users", undefined, "editor")).status,
    403,
  );
  assert.equal(
    (await call("GET", "/api/admin/access-events", undefined, "viewer")).status,
    403,
  );
  assert.equal(
    (
      await call("POST", "/api/admin/users", {
        username: "bad",
        email: "bad@example.test",
        role: "root",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("POST", "/api/admin/users", {
        username: "bad",
        email: "bad@example.test",
        permissions: ["users"],
      })
    ).status,
    400,
  );
  const email = `new-${suffix}@example.test`;
  const created = await call("POST", "/api/admin/users", {
    username: `new-${suffix}`,
    email,
    role: "recursos_humanos",
  });
  assert.equal(created.status, 201);
  ids.push(created.body.user.id);
  assert.equal(created.headers.get("cache-control"), "private, no-store");
  assert.equal(created.body.generatedPassword.length, 24);
  assert(!JSON.stringify(created.body.user).includes("passwordHash"));
  const [stored] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, created.body.user.id));
  assert(
    await comparePassword(created.body.generatedPassword, stored.passwordHash),
  );
  assert.notEqual(stored.passwordHash, created.body.generatedPassword);
  assert.equal(
    (
      await call("POST", "/api/admin/users", {
        username: `another-${suffix}`,
        email: email.toUpperCase(),
        role: "editor",
      })
    ).status,
    409,
  );
  const logged = await call("POST", "/api/admin/login", {
    username: email,
    password: created.body.generatedPassword,
  });
  assert.equal(logged.status, 200);
  tokens.created = logged.body.token;
  assert.equal(
    (await call("GET", "/api/admin/jobs", undefined, "created")).status,
    200,
  );
  assert.equal(
    (await call("POST", "/api/admin/jobs", {}, "created")).status,
    400,
  ); // passes grants; rejected by job input validation
  assert.equal(
    (await call("GET", "/api/admin/team", undefined, "created")).status,
    403,
  );
  assert.equal(
    (await call("GET", "/api/admin/contact-submissions", undefined, "created"))
      .status,
    403,
  );
  assert.equal(
    (await call("GET", "/api/agents/status", undefined, "created")).status,
    403,
  );
  assert.equal(
    (await call("GET", "/api/admin/users", undefined, "created")).status,
    403,
  );
  assert.equal(
    (await call("POST", "/api/admin/users", {}, "created")).status,
    403,
  );
  // Express enruta sin distinguir mayúsculas: la política de módulos tampoco debe distinguirlas
  for (const variant of ["/API/admin/team", "/Api/Admin/Contact-Submissions/"])
    assert.equal(
      (await call("GET", variant, undefined, "created")).status,
      403,
      variant,
    );
  assert.equal(
    (await call("GET", "/API/admin/team", undefined, "editor")).status,
    200,
  );
  const fresh = await account(stored.id);
  const updated = await call(
    "PUT",
    `/api/admin/users/${stored.id}`,
    bodyOf(fresh, { permissions: ["config"] }),
  );
  assert.equal(updated.status, 200);
  assert.equal(
    (await call("GET", "/api/admin/me", undefined, "created")).status,
    401,
  );
  assert.equal(
    (await call("PUT", `/api/admin/users/${stored.id}`, bodyOf(fresh))).status,
    409,
  );
  const relog = await call("POST", "/api/admin/login", {
    username: email,
    password: created.body.generatedPassword,
  });
  assert.equal(relog.status, 200);
  tokens.created = relog.body.token;
  assert.equal(
    (await call("GET", "/api/admin/site-config", undefined, "created")).status,
    200,
  );
  assert.equal(
    (await call("POST", `/api/admin/users/${stored.id}/sessions/revoke`, {}))
      .status,
    200,
  );
  assert.equal(
    (await call("GET", "/api/admin/me", undefined, "created")).status,
    401,
  );
  const reset = await call(
    "POST",
    `/api/admin/users/${stored.id}/password`,
    {},
  );
  assert.equal(reset.status, 200);
  assert.equal(
    (
      await call("POST", "/api/admin/login", {
        username: email,
        password: created.body.generatedPassword,
      })
    ).status,
    401,
  );
  const resetLogin = await call("POST", "/api/admin/login", {
    username: email,
    password: reset.body.generatedPassword,
  });
  assert.equal(resetLogin.status, 200);
  tokens.created = resetLogin.body.token;
  assert.equal(
    (
      await call(
        "POST",
        "/api/admin/password/change",
        { currentPassword: "invalid-current", newPassword: randomUUID() },
        "created",
      )
    ).status,
    400,
  );
  const newPassword = randomUUID();
  assert.equal(
    (
      await call(
        "POST",
        "/api/admin/password/change",
        { currentPassword: reset.body.generatedPassword, newPassword },
        "created",
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("GET", "/api/admin/me", undefined, "created")).status,
    401,
  );
  assert.equal(
    (
      await call("POST", "/api/admin/login", {
        username: email,
        password: reset.body.generatedPassword,
      })
    ).status,
    401,
  );
  const changed = await call("POST", "/api/admin/login", {
    username: email,
    password: newPassword,
  });
  assert.equal(changed.status, 200);
  tokens.created = changed.body.token;
  const active = await account(stored.id);
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/users/${stored.id}`,
        bodyOf(active, { isActive: false }),
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("GET", "/api/admin/me", undefined, "created")).status,
    401,
  );
  assert.equal(
    (
      await call("POST", "/api/admin/login", {
        username: email,
        password: newPassword,
      })
    ).status,
    401,
  );
  const inactive = await account(stored.id);
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/users/${stored.id}`,
        bodyOf(inactive, { isActive: true }),
      )
    ).status,
    200,
  );
  const principal = await account(ids[0]);
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/users/${ids[0]}`,
        bodyOf(principal, { isActive: false }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/users/${ids[0]}`,
        bodyOf(principal, { role: "editor" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (await call("POST", `/api/admin/users/${ids[0]}/password`, {})).status,
    400,
  );
  assert.equal(
    (await call("POST", "/api/admin/jobs", {}, "viewer")).status,
    403,
  );
  assert.equal(
    (await call("GET", "/api/admin/team", undefined, "viewer")).status,
    200,
  );
  assert.equal((await call("GET","/api/system/chronicler",undefined,"viewer")).status,403);
  assert.equal((await call("POST","/api/system/chronicler/evolution",{},"viewer")).status,403);
  // Recursos humanos (solo Carreras): candidaturas, CV y vacantes, y nada más del panel
  assert.equal(
    (
      await call("POST", "/api/admin/users", {
        username: `hr-extra-${suffix}`,
        email: `hr-extra-${suffix}@example.test`,
        role: "reclutamiento",
        permissions: ["config"],
      })
    ).status,
    400,
  );
  const hrEmail = `hr-${suffix}@example.test`;
  const hr = await call("POST", "/api/admin/users", {
    username: `hr-${suffix}`,
    email: hrEmail,
    role: "reclutamiento",
  });
  assert.equal(hr.status, 201);
  ids.push(hr.body.user.id);
  const hrLogin = await call("POST", "/api/admin/login", {
    username: hrEmail,
    password: hr.body.generatedPassword,
  });
  assert.equal(hrLogin.status, 200);
  assert.equal(hrLogin.body.user.role, "reclutamiento");
  tokens.hr = hrLogin.body.token;
  assert.equal((await call("GET", "/api/admin/me", undefined, "hr")).status, 200);
  await ensurePrivateUploadDirectories();
  await fs.writeFile(cvFile, "%PDF-1.4\n%%EOF\n", { mode: 0o600 });
  const [application] = await db
    .insert(careerApplications)
    .values({
      fullName: "Candidatura de prueba",
      email: `cv-${suffix}@example.test`,
      interest: "Pasantías S&S",
      cvPath: `private:cvs/${path.basename(cvFile)}`,
      cvOriginalName: "cv.pdf",
    })
    .returning();
  applicationIds.push(application.id);
  const list = await call("GET", "/api/admin/career-applications", undefined, "hr");
  assert.equal(list.status, 200);
  assert(list.body.some((r: any) => r.id === application.id));
  assert(list.body.every((r: any) => !("cvPath" in r)));
  const reviewed = await call(
    "PATCH",
    `/api/admin/career-applications/${application.id}`,
    { status: "reviewed", read: true },
    "hr",
  );
  assert.equal(reviewed.status, 200);
  assert.equal(reviewed.body.status, "reviewed");
  const cv = await fetch(
    `${base}/api/admin/career-applications/${application.id}/cv`,
    { headers: { Authorization: `Bearer ${tokens.hr}` } },
  );
  assert.equal(cv.status, 200);
  assert.match(cv.headers.get("content-type") || "", /^application\/pdf/);
  assert.equal(cv.headers.get("content-security-policy"), "sandbox");
  assert.equal(cv.headers.get("cache-control"), "private, no-store");
  await cv.arrayBuffer();
  const hrEvents = await db
    .select({ action: adminAccessEvents.action })
    .from(adminAccessEvents)
    .where(eq(adminAccessEvents.userId, hr.body.user.id));
  for (const action of ["career_application_updated", "career_cv_downloaded"])
    assert(hrEvents.some((e) => e.action === action), action);
  assert.equal((await call("GET", "/api/admin/jobs", undefined, "hr")).status, 200);
  assert.equal((await call("GET", "/API/Admin/Jobs/", undefined, "hr")).status, 200);
  assert.equal((await call("POST", "/api/admin/jobs", {}, "hr")).status, 400);
  const job = await call(
    "POST",
    "/api/admin/jobs",
    {
      title: `Associate ${suffix}`,
      titleEs: `Asociado ${suffix}`,
      description: "Test opening",
      descriptionEs: "Vacante de prueba",
      published: false,
    },
    "hr",
  );
  assert.equal(job.status, 200);
  jobIds.push(job.body.id);
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/jobs/${job.body.id}`,
        { titleEs: `Asociada ${suffix}` },
        "hr",
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("DELETE", `/api/admin/jobs/${job.body.id}`, undefined, "hr"))
      .status,
    200,
  );
  for (const [method, url, body] of [
    ["GET", "/api/admin/overview"],
    ["GET", "/api/admin/team"],
    ["GET", "/API/ADMIN/TEAM"],
    ["GET", "/api/admin/practice-groups"],
    ["GET", "/api/admin/news"],
    ["GET", "/api/admin/cms-stats"],
    ["GET", "/api/admin/site-config"],
    ["GET", "/api/admin/site-config/careers"],
    ["PUT", "/api/admin/site-config/careers", {}],
    ["GET", "/api/admin/storage/status"],
    ["GET", "/api/admin/contact-submissions"],
    ["GET", "/api/admin/newsletter-subscribers/export"],
    ["GET", "/api/admin/testimonials"],
    ["GET", "/api/admin/media"],
    ["POST", "/api/admin/media/upload/start", {}],
    ["GET", "/api/admin/catalog-order/team"],
    ["GET", `/api/admin/preview/team/${randomUUID()}`],
    ["GET", "/api/admin/users"],
    ["GET", "/api/admin/access-events"],
    ["POST", `/api/admin/users/${hr.body.user.id}/password`, {}],
    ["GET", "/api/admin/knowledge"],
    ["GET", "/api/admin/generated-images"],
    ["GET", "/api/admin/usage/summary"],
    ["GET", "/api/admin/translation-overview"],
    ["GET", "/api/agents/status"],
    ["GET", "/api/audits"],
    ["GET", "/api/system/chronicler"],
    ["POST", "/api/translate", {}],
    ["POST", `/api/news/${randomUUID()}/validate`, {}],
  ] as const)
    assert.equal(
      (await call(method, url, body, "hr")).status,
      403,
      `${method} ${url}`,
    );
  const hrNow = await account(hr.body.user.id);
  assert.equal(
    (
      await call(
        "PUT",
        `/api/admin/users/${hr.body.user.id}`,
        bodyOf(hrNow, { permissions: ["config"] }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "POST",
        "/api/admin/password/change",
        { currentPassword: "invalid-current", newPassword: randomUUID() },
        "hr",
      )
    ).status,
    400,
  );
  assert.equal((await call("POST", "/api/admin/logout", {}, "hr")).status, 200);
  assert.equal((await call("GET", "/api/admin/me", undefined, "hr")).status, 401);
  const log = await call("GET", "/api/admin/access-events");
  assert.equal(log.status, 200);
  assert(
    log.body.some(
      (e: any) => e.action === "password.reset" && e.userId === stored.id,
    ),
  );
  assert(
    log.body.some(
      (e: any) => e.action === "login.succeeded" && e.userId === stored.id,
    ),
  );
  assert(!JSON.stringify(log.body).includes(newPassword));
  assert(!JSON.stringify(log.body).includes("passwordHash"));
  const other = await account(ids[1]);
  const both = await Promise.all([
    call(
      "PUT",
      `/api/admin/users/${ids[1]}`,
      bodyOf(other, { role: "editor" }),
    ),
    call(
      "PUT",
      `/api/admin/users/${ids[0]}`,
      bodyOf(principal, { role: "editor" }),
      "second",
    ),
  ]);
  assert.equal(both.filter((r) => r.status === 200).length, 1);
  assert(both.some((r) => [401, 403].includes(r.status)));
  const remaining = await db
    .select()
    .from(adminUsers)
    .where(
      and(
        inArray(adminUsers.id, ids.slice(0, 2)),
        eq(adminUsers.role, "super_admin"),
        eq(adminUsers.isActive, true),
      ),
    );
  assert.equal(remaining.length, 1);
  console.log(
    "Access checks passed: generated credentials, secret redaction, role/module permissions, case-insensitive paths, careers-only HR accounts, duplicates, stale edits, revocation, reset/change passwords, reactivation, audit history and concurrent admin lockout protection.",
  );
} catch (e) {
  console.error(e);
  exitCode = 1;
} finally {
  await fs.rm(cvFile, { force: true });
  if (applicationIds.length)
    await db
      .delete(careerApplications)
      .where(inArray(careerApplications.id, applicationIds));
  if (jobIds.length)
    await db.delete(jobOpenings).where(inArray(jobOpenings.id, jobIds));
  if (ids.length) {
    await db
      .delete(adminAccessEvents)
      .where(
        or(
          inArray(adminAccessEvents.userId, ids),
          inArray(adminAccessEvents.actorId, ids),
        ),
      );
    await db.delete(adminSessions).where(inArray(adminSessions.userId, ids));
    await db.delete(adminUsers).where(inArray(adminUsers.id, ids));
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
  process.exit(exitCode);
}
