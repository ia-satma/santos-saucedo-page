import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";
import { adminPermissionForPath, hasAdminPermission, isReadOnlyAdmin } from "@shared/adminAccess";

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;
const SESSION_DURATION_HOURS = 24;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + SESSION_DURATION_HOURS);
  return expiry;
}

// Rate limiting for login attempts
// La clave (identifier) es "dirección|usuario en minúsculas" (N3, server/routes.ts): cinco
// intentos fallidos bloquean esa pareja, no a todos los que entran por el mismo proxy.
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry) {
    return { allowed: true };
  }

  // Check if blocked
  if (entry.blockedUntil > now) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) 
    };
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  // Check attempts
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    return { 
      allowed: false, 
      retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000) 
    };
  }

  return { allowed: true };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  const now = Date.now();
  
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  const entry = loginAttempts.get(identifier);

  if (!entry) {
    // Claves inventadas en masa (otra dirección o usuario en cada intento): se quitan las
    // vencidas y, si aún sobran, las que no están bloqueadas; los bloqueos vigentes se conservan
    if (loginAttempts.size > 20000) {
      loginAttempts.forEach((old, key) => {
        if (now - old.lastAttempt > WINDOW_MS && old.blockedUntil < now) loginAttempts.delete(key);
      });
      if (loginAttempts.size > 20000) {
        loginAttempts.forEach((old, key) => {
          if (old.blockedUntil < now) loginAttempts.delete(key);
        });
      }
    }
    loginAttempts.set(identifier, {
      attempts: 1,
      lastAttempt: now,
      blockedUntil: 0,
    });
    return;
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.set(identifier, {
      attempts: 1,
      lastAttempt: now,
      blockedUntil: 0,
    });
    return;
  }

  entry.attempts++;
  entry.lastAttempt = now;
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
  token: string | null | undefined
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: "Authentication required" };

  const session = await storage.getAdminSession(token);
  if (!session) return { ok: false, error: "Invalid session" };

  if (new Date() > session.expiresAt) {
    await storage.deleteAdminSession(token);
    return { ok: false, error: "Session expired" };
  }

  const adminUser = await storage.getAdminUser(session.userId);
  if (!adminUser || !adminUser.isActive) return { ok: false, error: "User not found or inactive" };

  return { ok: true, user: adminUser };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await validateSessionToken(authHeader.substring(7));
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }

    // Attach user to request
    req.adminUser = result.user;
    const permission = adminPermissionForPath(req.originalUrl);
    if (permission && (!hasAdminPermission(result.user, permission) ||
      (isReadOnlyAdmin(result.user) && !["GET", "HEAD", "OPTIONS"].includes(req.method)))) {
      res.status(403).json({ error: "Su cuenta no tiene permiso para esta acción." });
      return;
    }
    res.setHeader("Cache-Control", "private, no-store");
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    // super_admin (el rol que crean el seed y /api/admin/init) pasa cualquier control de rol:
    // con requireRole("editor", "admin") solo, el administrador principal recibía 403
    const permission = adminPermissionForPath(req.originalUrl);
    const moduleGrant = roles.includes("editor") && permission && permission !== "users" &&
      hasAdminPermission(req.adminUser, permission) &&
      (!isReadOnlyAdmin(req.adminUser) || ["GET", "HEAD"].includes(req.method));
    if (req.adminUser.role !== "super_admin" && !roles.includes(req.adminUser.role) && !moduleGrant) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

// Clean up expired entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(loginAttempts.keys());
  keys.forEach(key => {
    const entry = loginAttempts.get(key);
    if (entry && now - entry.lastAttempt > WINDOW_MS && entry.blockedUntil < now) {
      loginAttempts.delete(key);
    }
  });
}, 60 * 60 * 1000);
