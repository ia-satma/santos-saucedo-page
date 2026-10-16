import type { Request } from "express";
import { editorialDb } from "../db";
import { adminAccessEvents } from "@shared/schema";
export async function auditLog(
  action: string,
  resource: string,
  resourceId: string,
  actorId: string,
  details: unknown,
  _req?: Request,
) {
  await editorialDb
    .insert(adminAccessEvents)
    .values({
      actorId,
      action: `${resource}.${action}`,
      details: { resourceId, change: details },
    });
}
