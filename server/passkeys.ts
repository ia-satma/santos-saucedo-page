import type { Express, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { db, editorialDb } from "./db";
import {
  adminPasskeyChallenges,
  adminPasskeys,
  adminSessions,
  adminUsers,
} from "@shared/schema";
import { authMiddleware, getSessionExpiry, generateToken, hashSessionToken, isAllowedMutationOrigin, ADMIN_SESSION_COOKIE } from "./auth";
import { consumeRateLimit } from "./security/rateLimit";

const CHALLENGE_COOKIE = "ss_passkey_challenge";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MAX_PASSKEYS = 2;
const PASSKEY_RATE_WINDOW_MS = 5 * 60 * 1000;
const PASSKEY_RATE_MAX = 10;
const PASSKEY_GLOBAL_RATE_MAX = 25;

function requestOrigin(req: Request): string {
  const forwarded = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwarded || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function relyingPartyId(req: Request): string {
  return String(process.env.PASSKEY_RP_ID || req.get("host") || "localhost").split(":")[0];
}

function secureCookie(req: Request): string {
  const forwarded = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  return process.env.NODE_ENV === "production" || req.secure || forwarded === "https" ? "; Secure" : "";
}

function setChallengeCookie(res: Response, id: string, req: Request): void {
  res.setHeader("Set-Cookie", `${CHALLENGE_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300${secureCookie(req)}`);
}

function readChallengeCookie(req: Request): string | null {
  const raw = req.headers.cookie || "";
  const match = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CHALLENGE_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(CHALLENGE_COOKIE.length + 1)) : null;
}

function clearChallengeCookie(res: Response, req: Request): void {
  res.append("Set-Cookie", `${CHALLENGE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookie(req)}`);
}

async function issueSession(userId: string, req: Request, res: Response): Promise<void> {
  const token = generateToken();
  const expiresAt = getSessionExpiry();
  await editorialDb.transaction(async (tx) => {
    const [current] = await tx.select().from(adminUsers).where(eq(adminUsers.id, userId)).for("update");
    if (!current?.isActive) throw new Error("Inactive administrator");
    await tx.insert(adminSessions).values({
      userId,
      token: hashSessionToken(token),
      expiresAt,
      ipAddress: req.ip || req.socket.remoteAddress || null,
      userAgent: String(req.headers["user-agent"] || "") || null,
    });
    await tx.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, userId));
  });
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  res.setHeader("Set-Cookie", `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureCookie(req)}`);
}

async function saveChallenge(req: Request, res: Response, kind: string, userId: string | null, challenge: string): Promise<void> {
  await db.delete(adminPasskeyChallenges).where(lt(adminPasskeyChallenges.expiresAt, new Date()));
  const id = randomUUID();
  await db.insert(adminPasskeyChallenges).values({
    id,
    kind,
    userId,
    challenge,
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
  setChallengeCookie(res, id, req);
}

async function allowPasskeyRequest(req: Request, scope: string): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ipRate = await consumeRateLimit(`passkey:${scope}:${ip}`, PASSKEY_RATE_MAX, PASSKEY_RATE_WINDOW_MS);
  if (!ipRate.allowed) return ipRate;
  return consumeRateLimit(`passkey:${scope}:global`, PASSKEY_GLOBAL_RATE_MAX, PASSKEY_RATE_WINDOW_MS);
}

export function registerPasskeyRoutes(app: Express): void {
  app.get("/api/admin/passkeys", authMiddleware, async (req, res) => {
    const rows = await db.select({ id: adminPasskeys.id, name: adminPasskeys.name, createdAt: adminPasskeys.createdAt, lastUsedAt: adminPasskeys.lastUsedAt })
      .from(adminPasskeys).where(eq(adminPasskeys.userId, req.adminUser!.id));
    res.setHeader("Cache-Control", "private, no-store");
    res.json(rows);
  });

  app.post("/api/admin/passkeys/register/options", authMiddleware, async (req, res) => {
    const rate = await allowPasskeyRequest(req, "register-options");
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      res.status(429).json({ error: "Demasiados intentos con Passkey. Inténtelo más tarde." });
      return;
    }
    const existing = await db.select({ credentialId: adminPasskeys.credentialId, transports: adminPasskeys.transports })
      .from(adminPasskeys).where(eq(adminPasskeys.userId, req.adminUser!.id));
    if (existing.length >= MAX_PASSKEYS) {
      res.status(409).json({ error: "Este usuario ya tiene dos llaves registradas." });
      return;
    }
    const options = await generateRegistrationOptions({
      rpName: "Santos & Saucedo CMS",
      rpID: relyingPartyId(req),
      userName: req.adminUser!.email,
      userID: Buffer.from(req.adminUser!.id, "utf8"),
      userDisplayName: req.adminUser!.username,
      attestationType: "none",
      excludeCredentials: existing.map((item) => ({ id: item.credentialId, transports: item.transports as any })),
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    await saveChallenge(req, res, "registration", req.adminUser!.id, options.challenge);
    res.json(options);
  });

  app.post("/api/admin/passkeys/register/verify", authMiddleware, async (req, res) => {
    const rate = await allowPasskeyRequest(req, "register-verify");
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      res.status(429).json({ error: "Demasiados intentos con Passkey. Inténtelo más tarde." });
      return;
    }
    const challengeId = readChallengeCookie(req);
    const [challenge] = challengeId ? await db.select().from(adminPasskeyChallenges).where(and(eq(adminPasskeyChallenges.id, challengeId), eq(adminPasskeyChallenges.kind, "registration"), gt(adminPasskeyChallenges.expiresAt, new Date()))) : [];
    if (!challenge || challenge.userId !== req.adminUser!.id) {
      res.status(400).json({ error: "La ceremonia de registro expiró. Inténtelo de nuevo." });
      return;
    }
    try {
      const body = req.body as { response?: RegistrationResponseJSON; name?: string };
      const verified = await verifyRegistrationResponse({
        response: body.response as RegistrationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: requestOrigin(req),
        expectedRPID: relyingPartyId(req),
        requireUserVerification: true,
      });
      if (!verified.verified || !verified.registrationInfo) {
        res.status(400).json({ error: "No se pudo verificar la llave." });
        return;
      }
      const credential = verified.registrationInfo.credential;
      const count = await db.select({ id: adminPasskeys.id }).from(adminPasskeys).where(eq(adminPasskeys.userId, req.adminUser!.id));
      if (count.length >= MAX_PASSKEYS) {
        res.status(409).json({ error: "Este usuario ya tiene dos llaves registradas." });
        return;
      }
      await db.insert(adminPasskeys).values({
        userId: req.adminUser!.id,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        transports: (credential.transports || []) as string[],
        name: typeof body.name === "string" && body.name.trim().slice(0, 80) ? body.name.trim().slice(0, 80) : `Llave ${count.length + 1}`,
      });
      await db.delete(adminPasskeyChallenges).where(eq(adminPasskeyChallenges.id, challenge.id));
      clearChallengeCookie(res, req);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("Passkey registration verification failed");
      res.status(400).json({ error: "No se pudo registrar la llave." });
    }
  });

  app.delete("/api/admin/passkeys/:id", authMiddleware, async (req, res) => {
    const result = await db.delete(adminPasskeys).where(and(eq(adminPasskeys.id, req.params.id), eq(adminPasskeys.userId, req.adminUser!.id))).returning({ id: adminPasskeys.id });
    if (!result.length) {
      res.status(404).json({ error: "Llave no encontrada." });
      return;
    }
    res.json({ ok: true });
  });

  app.post("/api/admin/passkeys/auth/options", async (req, res) => {
    if (!isAllowedMutationOrigin(req)) {
      res.status(403).json({ error: "Origen no permitido." });
      return;
    }
    const rate = await allowPasskeyRequest(req, "auth-options");
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      res.status(429).json({ error: "Demasiados intentos con Passkey. Inténtelo más tarde." });
      return;
    }
    const [registered] = await db.select({ exists: sql<number>`1` }).from(adminPasskeys).limit(1);
    if (!registered) {
      res.status(409).json({ error: "No hay una Passkey registrada. Inicia sesión con correo y contraseña y registra una llave desde tu cuenta de administrador." });
      return;
    }
    const options = await generateAuthenticationOptions({ rpID: relyingPartyId(req), userVerification: "required" });
    await saveChallenge(req, res, "authentication", null, options.challenge);
    res.json(options);
  });

  app.post("/api/admin/passkeys/auth/verify", async (req, res) => {
    if (!isAllowedMutationOrigin(req)) {
      res.status(403).json({ error: "Origen no permitido." });
      return;
    }
    const rate = await allowPasskeyRequest(req, "auth-verify");
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      res.status(429).json({ error: "Demasiados intentos con Passkey. Inténtelo más tarde." });
      return;
    }
    const challengeId = readChallengeCookie(req);
    const [challenge] = challengeId ? await db.select().from(adminPasskeyChallenges).where(and(eq(adminPasskeyChallenges.id, challengeId), eq(adminPasskeyChallenges.kind, "authentication"), gt(adminPasskeyChallenges.expiresAt, new Date()))) : [];
    if (!challenge) {
      res.status(400).json({ error: "La ceremonia de acceso expiró. Inténtelo de nuevo." });
      return;
    }
    try {
      const response = (req.body as { response?: AuthenticationResponseJSON }).response as AuthenticationResponseJSON;
      const [credential] = await db.select().from(adminPasskeys).where(eq(adminPasskeys.credentialId, response.id));
      if (!credential) {
        res.status(401).json({ error: "La llave no está registrada en este CMS." });
        return;
      }
      const verified = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: requestOrigin(req),
        expectedRPID: relyingPartyId(req),
        requireUserVerification: true,
        credential: {
          id: credential.credentialId,
          publicKey: Buffer.from(credential.publicKey, "base64url"),
          counter: credential.counter,
          transports: credential.transports as any,
        },
      });
      if (!verified.verified) {
        res.status(401).json({ error: "No se pudo verificar la llave." });
        return;
      }
      const [user] = await db.select({ id: adminUsers.id, isActive: adminUsers.isActive }).from(adminUsers).where(eq(adminUsers.id, credential.userId));
      if (!user?.isActive) {
        res.status(401).json({ error: "La cuenta está desactivada." });
        return;
      }
      await db.update(adminPasskeys).set({ counter: verified.authenticationInfo.newCounter, lastUsedAt: new Date() }).where(eq(adminPasskeys.id, credential.id));
      await issueSession(user.id, req, res);
      await db.delete(adminPasskeyChallenges).where(eq(adminPasskeyChallenges.id, challenge.id));
      clearChallengeCookie(res, req);
      res.json({ ok: true });
    } catch (error) {
      console.error("Passkey authentication verification failed");
      res.status(401).json({ error: "No se pudo iniciar sesión con esa llave." });
    }
  });
}
