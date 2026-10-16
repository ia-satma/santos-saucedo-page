import { db } from "../db";
import { adminAccessEvents } from "@shared/schema";

/** Authentication remains available if the audit store is temporarily unavailable. */
export async function recordAccessEvent(action: string, userId: string | null) {
  try {
    await db
      .insert(adminAccessEvents)
      .values({ action, userId, actorId: userId });
  } catch {
    console.error("[AccessAudit] No se pudo registrar el evento de acceso.");
  }
}
