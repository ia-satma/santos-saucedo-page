import type { Express, Request, Response } from "express";
import { gte, sql } from "drizzle-orm";
import { db } from "../db";
import { apiUsage } from "@shared/schema";
import { authMiddleware, requirePermission } from "../auth";
export function registerAgentUsageRoutes(app: Express) {
  app.get(
    "/api/admin/usage/summary",
    authMiddleware,
    requirePermission("advanced"),
    async (_req: Request, res: Response) => {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const byKind = await db
          .select({
            kind: apiUsage.kind,
            cost: sql<number>`coalesce(sum(${apiUsage.costUsd}), 0)`,
            calls: sql<number>`count(*)::int`,
          })
          .from(apiUsage)
          .where(gte(apiUsage.createdAt, monthStart))
          .groupBy(apiUsage.kind);
        const [totals] = await db
          .select({
            month: sql<number>`coalesce(sum(case when ${apiUsage.createdAt} >= ${monthStart} then ${apiUsage.costUsd} else 0 end), 0)`,
            total: sql<number>`coalesce(sum(${apiUsage.costUsd}), 0)`,
            monthCalls: sql<number>`coalesce(sum(case when ${apiUsage.createdAt} >= ${monthStart} then 1 else 0 end), 0)::int`,
            calls: sql<number>`count(*)::int`,
            unpricedCalls: sql<number>`count(*) filter (where ${apiUsage.costUsd} is null)::int`,
          })
          .from(apiUsage);
        res.json({
          month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
          monthUsd: Number(totals?.month || 0),
          totalUsd: Number(totals?.total || 0),
          monthCalls: Number(totals?.monthCalls || 0),
          totalCalls: Number(totals?.calls || 0),
          unpricedCalls: Number(totals?.unpricedCalls || 0),
          byKind: byKind.map((r) => ({
            kind: r.kind,
            costUsd: Number(r.cost),
            calls: Number(r.calls),
          })),
        });
      } catch (error) {
        console.error("Usage summary error:", error);
        res.status(500).json({ error: "Error al calcular el gasto" });
      }
    },
  );
}
