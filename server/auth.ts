import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";
import {
  adminPermissionForPath,
  careersOnlyMayCall,
  hasAdminPermission,
  isCareersOnlyAdmin,
  isReadOnlyAdmin,
} from "@shared/adminAccess";

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;
const SESSION_DURATION_HOURS = 24;
export const ADMIN_SESSION_COOKIE = "ss_admin_session";

export function readCookie(request: Pick<Request, "headers">, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(value.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + SESSION_DURATION_HOURS);
  return expiry;
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Cookie-authenticated mutations must originate from this site or a configured frontend. */
export function isAllowedMutationOrigin(
  request: Pick<Request, "method" | "headers" | "protocol" | "get">,
): boolean {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return true;
  if (request.headers.authorization?.startsWith("Bearer ")) return true;

  const originHeader = request.headers.origin;
  const refererHeader = request.headers.referer;
  let origin = typeof originHeader === "string" && originHeader.trim()
    ? originHeader.trim()
    : null;
  if (!origin && typeof refererHeader === "string" && refererHeader.trim()) {
    try {
      origin = new URL(refererHeader).origin;
    } catch {
      return false;
    }
  }
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");
  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (configuredOrigins.includes(normalizedOrigin)) return true;

  const protocol = String(request.headers["x-forwarded-proto"] || request.protocol)
    .split(",")[0]
    .trim();
  const host = String(request.get("host") || "").split(",")[0].trim();
  return Boolean(protocol && host && normalizedOrigin === `${protocol}://${host}`);
}

// Extend Express Request to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

// Valida un token de sesión del panel: el de la cabecera Bearer (authMiddleware) o el de la
// consulta del WebSocket /ws/pipeline (L7). Devuelve el usuario activo o el motivo del rechazo,
// con los mismos mensajes de siempre; una sesión vencida se borra.
export async function validateSessionToken(
  token: string | null | undefined,
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: "Authentication required" };

  const session = await storage.getAdminSession(token);
  if (!session) return { ok: false, error: "Invalid session" };

  if (new Date() > session.expiresAt) {
    await storage.deleteAdminSession(token);
    return { ok: false, error: "Session expired" };
  }

  const adminUser = await storage.getAdminUser(session.userId);
  if (!adminUser || !adminUser.isActive)
    return { ok: false, error: "User not found or inactive" };

  return { ok: true, user: adminUser };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Prefer the short-lived bearer header for legacy clients, then use the HttpOnly cookie.
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : readCookie(req, ADMIN_SESSION_COOKIE);
    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await validateSessionToken(token);
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }

    if (!isAllowedMutationOrigin(req)) {
      res.status(403).json({ error: "Origen no permitido." });
      return;
    }

    // Attach user to request
    req.adminUser = result.user;
    // Rol de solo Carreras: lista cerrada de llamadas, antes que la política por módulos. Así
    // tampoco recibe las rutas que esa política deja a cualquier sesión (resumen, manual…).
    if (outsideCareersArea(req)) {
      res
        .status(403)
        .json({ error: "Su cuenta no tiene permiso para esta acción." });
      return;
    }
    const permission = adminPermissionForPath(req.originalUrl);
    if (
      permission &&
      (!hasAdminPermission(result.user, permission) ||
        (isReadOnlyAdmin(result.user) &&
          !["GET", "HEAD", "OPTIONS"].includes(req.method)))
    ) {
      res
        .status(403)
        .json({ error: "Su cuenta no tiene permiso para esta acción." });
      return;
    }
    res.setHeader("Cache-Control", "private, no-store");
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

// authMiddleware ya aplica esta lista; requireRole y requirePermission la repiten por si una ruta
// llegara a montarlos con otra verificación de sesión.
function outsideCareersArea(req: Request) {
  return (
    isCareersOnlyAdmin(req.adminUser) &&
    !careersOnlyMayCall(req.method, req.originalUrl)
  );
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (outsideCareersArea(req)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    // super_admin (el rol que crean el seed y /api/admin/init) pasa cualquier control de rol:
    // con requireRole("editor", "admin") solo, el administrador principal recibía 403
    const permission = adminPermissionForPath(req.originalUrl);
    const moduleGrant =
      roles.includes("editor") &&
      permission &&
      permission !== "users" &&
      hasAdminPermission(req.adminUser, permission) &&
      (!isReadOnlyAdmin(req.adminUser) || ["GET", "HEAD"].includes(req.method));
    if (
      req.adminUser.role !== "super_admin" &&
      !roles.includes(req.adminUser.role) &&
      !moduleGrant
    ) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

// Compatibility with the reference CMS; the Santos module policy remains authoritative.
export function requirePermission(permission: string) {
  const aliases: Record<
    string,
    import("@shared/adminAccess").AdminPermission | "users"
  > = {
    content: "content",
    editorial_content: "editorial",
    editorial_publish: "editorial",
    media: "media",
    job_openings: "jobs",
    agents: "agents",
    agent_knowledge_admin: "agents",
    config: "config",
    advanced: "advanced",
    users: "users",
    contact_submissions: "inbox",
    career_applications: "applications",
    newsletter: "inbox",
    exports: "inbox",
    private_downloads: "agents",
  };
  return (req: Request, res: Response, next: NextFunction): void => {
    const mapped = aliases[permission];
    if (!req.adminUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (
      !mapped ||
      outsideCareersArea(req) ||
      !hasAdminPermission(req.adminUser, mapped) ||
      (isReadOnlyAdmin(req.adminUser) &&
        !["GET", "HEAD", "OPTIONS"].includes(req.method))
    ) {
      res
        .status(403)
        .json({ error: "Su cuenta no tiene permiso para esta acción." });
      return;
    }
    next();
  };
}
