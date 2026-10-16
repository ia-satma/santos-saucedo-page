import type { Express, Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import { editorialDb } from "../db";
import {
  adminUsers,
  adminSessions,
  adminAccessEvents,
  type AdminUser,
} from "@shared/schema";
import { adminPermissions, manageableRoles } from "@shared/adminAccess";
import {
  authMiddleware,
  comparePassword,
  hashPassword,
  requireRole,
} from "../auth";

const uuid = z.string().uuid();
const grants = z
  .array(z.enum(adminPermissions.map((p) => p.key) as [string, ...string[]]))
  .max(8)
  .transform((p) => Array.from(new Set(p)).sort());
const identity = {
  username: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-zA-Z0-9._@+-]+$/, "Use letras, números, puntos o guiones.")
    .transform((v) => v.toLowerCase()),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
};
const createInput = z
  .object({
    ...identity,
    role: z.enum(manageableRoles).default("editor"),
    permissions: grants.default([]),
  })
  .strict();
const updateInput = z
  .object({
    ...identity,
    role: z.enum(manageableRoles),
    permissions: grants,
    isActive: z.boolean(),
    revision: z.string().min(1),
  })
  .strict();
function revision(user: AdminUser) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        user.id,
        user.username,
        user.email,
        user.role,
        user.isActive,
        user.permissions,
        user.updatedAt,
      ]),
    )
    .digest("hex");
}
export function safeAdminUser(user: AdminUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    revision: revision(user),
  };
}
class AccessError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function fail(res: Response, error: any) {
  if (error instanceof AccessError)
    return res.status(error.status).json({ error: error.message });
  if (error?.code === "23505" || error?.cause?.code === "23505")
    return res
      .status(409)
      .json({
        error: "Ya existe una cuenta con ese correo o nombre de usuario.",
      });
  console.error("[AdminUsers] Falló una operación de acceso.");
  return res
    .status(500)
    .json({ error: "No se pudo completar la operación. Intente de nuevo." });
}
function idOf(req: Request) {
  const result = uuid.safeParse(req.params.id);
  if (!result.success)
    throw new AccessError(400, "Identificador de usuario inválido.");
  return result.data;
}
async function lockUsers(tx: any) {
  // All account mutations serialize the last-admin check and session invalidation.
  await tx.execute(sql`LOCK TABLE admin_users IN SHARE ROW EXCLUSIVE MODE`);
}
async function actorStillPrincipal(tx: any, actorId: string) {
  const [actor] = await tx
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, actorId));
  if (!actor?.isActive || actor.role !== "super_admin")
    throw new AccessError(
      403,
      "Solo el administrador principal puede administrar cuentas.",
    );
}
async function audit(
  tx: any,
  actorId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  await tx
    .insert(adminAccessEvents)
    .values({ actorId, userId, action, details });
}
export function registerAdminUsers(app: Express) {
  const principal = [authMiddleware, requireRole("super_admin")];
  app.get("/api/admin/users", ...principal, async (_req, res) => {
    try {
      const users = await editorialDb
        .select()
        .from(adminUsers)
        .orderBy(adminUsers.createdAt, adminUsers.id);
      res.json(users.map(safeAdminUser));
    } catch (e) {
      fail(res, e);
    }
  });
  app.get("/api/admin/access-events", ...principal, async (_req, res) => {
    try {
      const rows = await editorialDb
        .select({
          id: adminAccessEvents.id,
          action: adminAccessEvents.action,
          createdAt: adminAccessEvents.createdAt,
          userId: adminAccessEvents.userId,
          actorId: adminAccessEvents.actorId,
          details: adminAccessEvents.details,
        })
        .from(adminAccessEvents)
        .orderBy(desc(adminAccessEvents.createdAt), desc(adminAccessEvents.id))
        .limit(100);
      res.json(rows);
    } catch (e) {
      fail(res, e);
    }
  });
  app.post("/api/admin/users", ...principal, async (req, res) => {
    const parsed = createInput.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error:
            "Revise el correo, el nombre de usuario, el rol y los permisos.",
        });
    try {
      const generatedPassword = randomBytes(18).toString("base64url");
      const passwordHash = await hashPassword(generatedPassword);
      const user = await editorialDb.transaction(async (tx) => {
        await lockUsers(tx);
        await actorStillPrincipal(tx, req.adminUser!.id);
        const existing = await tx
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(
            or(
              sql`lower(${adminUsers.email}) = ${parsed.data.email}`,
              sql`lower(${adminUsers.username}) = ${parsed.data.username}`,
            ),
          );
        if (existing.length)
          throw new AccessError(
            409,
            "Ya existe una cuenta con ese correo o nombre de usuario.",
          );
        const [user] = await tx
          .insert(adminUsers)
          .values({ ...parsed.data, passwordHash, isActive: true })
          .returning();
        await audit(tx, req.adminUser!.id, user.id, "user.created", {
          role: user.role,
          permissions: user.permissions,
        });
        return user;
      });
      res.status(201).json({ user: safeAdminUser(user), generatedPassword });
    } catch (e) {
      fail(res, e);
    }
  });
  app.put("/api/admin/users/:id", ...principal, async (req, res) => {
    const parsed = updateInput.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error:
            "Revise los datos de la cuenta. Recargue si otra persona la modificó.",
        });
    try {
      const id = idOf(req),
        actorId = req.adminUser!.id;
      const updated = await editorialDb.transaction(async (tx) => {
        await lockUsers(tx);
        await actorStillPrincipal(tx, actorId);
        const [target] = await tx
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, id));
        if (!target) throw new AccessError(404, "Usuario no encontrado.");
        if (revision(target) !== parsed.data.revision)
          throw new AccessError(
            409,
            "La cuenta cambió en otra sesión. Recargue antes de guardar.",
          );
        const { revision: _revision, ...changes } = parsed.data;
        if (
          id === actorId &&
          (!changes.isActive || changes.role !== "super_admin")
        )
          throw new AccessError(
            400,
            "No puede desactivar ni quitar la administración principal de su propia cuenta.",
          );
        if (
          target.role === "super_admin" &&
          target.isActive &&
          (!changes.isActive || changes.role !== "super_admin")
        ) {
          const others = await tx
            .select({ id: adminUsers.id })
            .from(adminUsers)
            .where(
              and(
                eq(adminUsers.role, "super_admin"),
                eq(adminUsers.isActive, true),
              ),
            );
          if (others.filter((u) => u.id !== id).length < 1)
            throw new AccessError(
              400,
              "Debe conservar al menos un administrador principal activo.",
            );
        }
        const duplicate = await tx
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(
            or(
              sql`lower(${adminUsers.email}) = ${changes.email}`,
              sql`lower(${adminUsers.username}) = ${changes.username}`,
            ),
          );
        if (duplicate.some((u) => u.id !== id))
          throw new AccessError(
            409,
            "Ya existe una cuenta con ese correo o nombre de usuario.",
          );
        const [updated] = await tx
          .update(adminUsers)
          .set({ ...changes, updatedAt: new Date() })
          .where(eq(adminUsers.id, id))
          .returning();
        // Revocation is atomic with permission changes. A user's next request always reads live grants.
        if (id !== actorId)
          await tx.delete(adminSessions).where(eq(adminSessions.userId, id));
        await audit(tx, actorId, id, "user.updated", {
          role: updated.role,
          isActive: updated.isActive,
          permissions: updated.permissions,
        });
        return updated;
      });
      res.json(safeAdminUser(updated));
    } catch (e) {
      fail(res, e);
    }
  });
  app.post("/api/admin/users/:id/password", ...principal, async (req, res) => {
    try {
      const id = idOf(req),
        actorId = req.adminUser!.id;
      if (id === actorId)
        throw new AccessError(
          400,
          "Para su cuenta, use Cambiar mi contraseña.",
        );
      const generatedPassword = randomBytes(18).toString("base64url"),
        passwordHash = await hashPassword(generatedPassword);
      await editorialDb.transaction(async (tx) => {
        await lockUsers(tx);
        await actorStillPrincipal(tx, actorId);
        const [target] = await tx
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, id));
        if (!target) throw new AccessError(404, "Usuario no encontrado.");
        await tx
          .update(adminUsers)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(adminUsers.id, id));
        await tx.delete(adminSessions).where(eq(adminSessions.userId, id));
        await audit(tx, actorId, id, "password.reset");
      });
      res.json({ ok: true, generatedPassword });
    } catch (e) {
      fail(res, e);
    }
  });
  app.post(
    "/api/admin/users/:id/sessions/revoke",
    ...principal,
    async (req, res) => {
      try {
        const id = idOf(req),
          actorId = req.adminUser!.id;
        await editorialDb.transaction(async (tx) => {
          await lockUsers(tx);
          await actorStillPrincipal(tx, actorId);
          const [target] = await tx
            .select({ id: adminUsers.id })
            .from(adminUsers)
            .where(eq(adminUsers.id, id));
          if (!target) throw new AccessError(404, "Usuario no encontrado.");
          await tx.delete(adminSessions).where(eq(adminSessions.userId, id));
          await audit(tx, actorId, id, "sessions.revoked");
        });
        res.json({ ok: true });
      } catch (e) {
        fail(res, e);
      }
    },
  );
  app.post("/api/admin/password/change", authMiddleware, async (req, res) => {
    const parsed = z
      .object({
        currentPassword: z.string().min(1).max(128),
        newPassword: z.string().min(15).max(72),
      })
      .strict()
      .safeParse(req.body);
    if (
      !parsed.success ||
      Buffer.byteLength(parsed.data?.newPassword || "", "utf8") > 72
    )
      return res
        .status(400)
        .json({
          error:
            "La contraseña nueva debe tener entre 15 caracteres y 72 bytes.",
        });
    try {
      if (parsed.data.currentPassword === parsed.data.newPassword)
        throw new AccessError(
          400,
          "Elija una contraseña diferente de la actual.",
        );
      const passwordHash = await hashPassword(parsed.data.newPassword);
      await editorialDb.transaction(async (tx) => {
        await lockUsers(tx);
        const [target] = await tx
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, req.adminUser!.id));
        if (
          !target?.isActive ||
          !(await comparePassword(
            parsed.data.currentPassword,
            target.passwordHash,
          ))
        )
          throw new AccessError(400, "La contraseña actual no es correcta.");
        await tx
          .update(adminUsers)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(adminUsers.id, target.id));
        await tx
          .delete(adminSessions)
          .where(eq(adminSessions.userId, target.id));
        await audit(tx, target.id, target.id, "password.changed");
      });
      res.json({ ok: true, requiresLogin: true });
    } catch (e) {
      fail(res, e);
    }
  });
}
