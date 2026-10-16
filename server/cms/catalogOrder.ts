import type { Express } from "express";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { editorialDb } from "../db";
import { authMiddleware, requireRole } from "../auth";
import { isNamedOnTeamPage } from "@shared/teamVisibility";

const catalogs = {
  team: { table: "team_members", label: "name" },
  practices: { table: "practice_groups", label: "name_es" },
  industries: { table: "industry_groups", label: "name_es" },
  gallery: { table: "office_images", label: "alt_es" },
} as const;
type Catalog = keyof typeof catalogs;
function known(key: string): key is Catalog {
  return Object.hasOwn(catalogs, key);
}
const version = (rows: any[]) =>
  createHash("sha256")
    .update(JSON.stringify(rows.map((r) => [r.id, r.order ?? 0])))
    .digest("hex");
const requestSchema = z
  .object({
    ids: z.array(z.string().uuid()).max(5000),
    revision: z.string().length(64),
  })
  .strict();
async function list(tx: any, key: Catalog) {
  const table = catalogs[key].table;
  const result = await tx.execute(
    sql.raw(
      `SELECT * FROM "${table}" ORDER BY "order" ASC NULLS FIRST, id ASC`,
    ),
  );
  return result.rows as any[];
}
function response(rows: any[], key: Catalog) {
  return {
    revision: version(rows),
    items: rows.map((r) => ({
      id: r.id,
      label: r[catalogs[key].label] || r.name || "Imagen sin descripción",
      imageUrl: r.image_url,
      order: r.order ?? 0,
      visible:
        key === "team"
          ? isNamedOnTeamPage({
              slug: r.slug,
              title: r.title,
              isPartner: r.is_partner,
              isPublic: r.is_public,
            })
          : r.published !== false,
    })),
  };
}
export function registerCatalogOrder(app: Express) {
  app.get(
    "/api/admin/catalog-order/:catalog",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      if (!known(req.params.catalog))
        return res.status(404).json({ error: "Catálogo desconocido." });
      try {
        res.set("Cache-Control", "private, no-store");
        res.json(
          response(
            await list(editorialDb, req.params.catalog),
            req.params.catalog,
          ),
        );
      } catch {
        res.status(503).json({ error: "No se pudo cargar el orden." });
      }
    },
  );
  app.put(
    "/api/admin/catalog-order/:catalog",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const key = req.params.catalog;
      if (!known(key))
        return res.status(404).json({ error: "Catálogo desconocido." });
      const parsed = requestSchema.safeParse(req.body);
      if (
        !parsed.success ||
        new Set(parsed.data?.ids).size !== parsed.data?.ids.length
      )
        return res
          .status(400)
          .json({
            error: "Envíe una lista de identificadores únicos y su revisión.",
          });
      try {
        const result = await editorialDb.transaction(async (tx) => {
          // The complete catalog is locked, including concurrent inserts/deletes and
          // ordinary form saves. The revision is read after obtaining the lock.
          await tx.execute(
            sql.raw(
              `LOCK TABLE "${catalogs[key].table}" IN SHARE ROW EXCLUSIVE MODE`,
            ),
          );
          const before = await list(tx, key);
          const { ids, revision } = parsed.data;
          const currentIds = new Set(before.map((r) => r.id));
          if (
            version(before) !== revision ||
            ids.length !== before.length ||
            ids.some((id) => !currentIds.has(id))
          )
            return null;
          if (ids.length) {
            const values = sql.join(
              ids.map((id, i) => sql`(${id}::varchar, ${i}::integer)`),
              sql`, `,
            );
            await tx.execute(
              sql`UPDATE ${sql.identifier(catalogs[key].table)} AS target SET "order"=v.position FROM (VALUES ${values}) AS v(id,position) WHERE target.id=v.id`,
            );
          }
          return response(await list(tx, key), key);
        });
        if (!result)
          return res
            .status(409)
            .json({
              error:
                "El catálogo cambió en otra sesión. Recargue la lista antes de volver a ordenar.",
            });
        console.log(
          "[AUDIT]",
          JSON.stringify({
            action: "reorder",
            catalog: key,
            count: result.items.length,
            userId: req.adminUser!.id,
          }),
        );
        res.json(result);
      } catch {
        res
          .status(503)
          .json({
            error:
              "No se pudo guardar el orden. No se aplicó un cambio parcial.",
          });
      }
    },
  );
}
