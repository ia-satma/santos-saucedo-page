import type { Express } from "express";
import { authMiddleware, requireRole } from "../auth";
import { storage } from "../storage";
import { toPublicNews } from "@shared/publicNews";
import { toPublicTeamProfile } from "@shared/teamVisibility";
import fs from "node:fs/promises";
import path from "node:path";
import { teamPracticeIds } from "./teamEditor";
export function registerContentPreview(app: Express) {
  app.get(
    "/api/admin/preview/team/:id/image",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      try {
        const member = await storage.getTeamMemberById(req.params.id);
        const filename = member?.imageUrl?.match(
          /^\/team_photos\/([a-zA-Z0-9._-]+\.(?:png|jpe?g|webp))$/,
        )?.[1];
        if (!filename)
          return res.status(404).json({ error: "Imagen no encontrada." });
        const bytes = await fs.readFile(
          path.join(process.cwd(), "attached_assets/team_photos", filename),
        );
        res
          .set({
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow",
            "X-Content-Type-Options": "nosniff",
          })
          .type(path.extname(filename))
          .send(bytes);
      } catch {
        res.status(404).json({ error: "Imagen no encontrada." });
      }
    },
  );
  app.get(
    "/api/admin/preview/:kind/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const { kind, id } = req.params;
      try {
        let item: any;
        if (kind === "team") {
          const member = await storage.getTeamMemberById(id);
          if (member)
            item = {
              ...toPublicTeamProfile(member),
              practiceGroupIds: await teamPracticeIds(member, true),
            };
        } else if (kind === "news") {
          const note = await storage.getNewsById(id);
          if (note) item = toPublicNews(note);
        } else if (kind === "practices")
          item = await storage.getPracticeGroupById(id);
        else if (kind === "industries")
          item = await storage.getIndustryGroupById(id);
        if (!item)
          return res.status(404).json({
            error: "Guarde el registro antes de abrir su vista previa.",
          });
        res.set({
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        });
        res.json(item);
      } catch {
        res.status(503).json({ error: "No se pudo abrir la vista previa." });
      }
    },
  );
  app.use("/admin/preview", (_req, res, next) => {
    res.set({
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    });
    next();
  });
}
