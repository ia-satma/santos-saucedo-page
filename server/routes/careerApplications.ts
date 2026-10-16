import type { Express, RequestHandler } from "express";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { careerApplications } from "@shared/schema";
import { authMiddleware, requireRole } from "../auth";
import { getCmsFormControls } from "../cms/siteConfig";
import {
  ensurePrivateUploadDirectories,
  cvQuarantineDir,
  securePhysicalFilename,
  validateCvFile,
  scanFileForMalware,
  acceptQuarantinedCv,
  resolvePrivateCvStoragePath,
  removeUploadQuietly,
} from "../security/uploads";
import {
  persistPrivateCvFile,
  deletePersistentPrivateCv,
  openPersistentPrivateCvStream,
} from "../media/privateDocuments";
import { persistentMediaIsRequired } from "../media/persistentMedia";
import { recordAccessEvent } from "../cms/accessAudit";
const formSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(60).optional(),
  interest: z.string().trim().max(180).optional(),
  message: z.string().trim().max(12000).optional(),
  preferredLanguage: z
    .enum(["es", "en", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"])
    .default("es"),
  consent: z.literal("true"),
});
const receive = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensurePrivateUploadDirectories().then(
        () => cb(null, cvQuarantineDir),
        (e) => cb(e, ""),
      );
    },
    filename: (_req, _file, cb) => cb(null, securePhysicalFilename(".pdf")),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 9, fieldSize: 14000 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype === "application/pdf" ||
      ((!file.mimetype || file.mimetype === "application/octet-stream") &&
        /\.pdf$/i.test(file.originalname));
    if (!allowed) return cb(new Error("Use un PDF."));
    cb(null, true);
  },
}).single("cv");
export function registerCareerApplications(
  app: Express,
  guard: RequestHandler,
) {
  app.post("/api/careers/apply", (req, res) =>
    receive(req, res, async (error: any) => {
      let accepted: { absolutePath: string; storagePath: string } | undefined;
      let saved = false;
      try {
        if (error)
          return res
            .status(error.code === "LIMIT_FILE_SIZE" ? 413 : 415)
            .json({ error: "Use un CV en PDF de hasta 10 MB." });
        let allowed = false;
        await guard(req, res, () => {
          allowed = true;
        });
        if (!allowed) return;
        if (!(await getCmsFormControls()).careers.enabled)
          return res.status(503).json({ error: "FORM_DISABLED" });
        const parsed = formSchema.safeParse(req.body);
        if (!parsed.success || !req.file)
          return res.status(400).json({
            error: "Revise sus datos, el consentimiento y su CV en PDF.",
          });
        if (!(await validateCvFile(req.file.path, "application/pdf")))
          return res
            .status(400)
            .json({ error: "El archivo no es un PDF válido." });
        try {
          const pdf = await PDFDocument.load(await fs.readFile(req.file.path));
          if (!pdf.getPageCount()) throw new Error();
        } catch {
          return res
            .status(400)
            .json({ error: "El PDF está dañado o protegido." });
        }
        await scanFileForMalware(req.file.path);
        accepted = await acceptQuarantinedCv(req.file.path, "application/pdf");
        await persistPrivateCvFile(accepted.absolutePath, accepted.storagePath);
        const { consent, ...data } = parsed.data;
        await db.insert(careerApplications).values({
          ...data,
          email: data.email.toLowerCase(),
          cvPath: accepted.storagePath,
          cvOriginalName: path
            .basename(req.file.originalname)
            .replace(/[\r\n"\\]/g, "_")
            .slice(0, 180),
        });
        saved = true;
        if (persistentMediaIsRequired())
          await removeUploadQuietly(accepted.absolutePath);
        res.status(201).json({ success: true });
      } catch {
        res.status(503).json({
          error:
            "No se pudo guardar la candidatura. Reintente más tarde; puede usar el correo de reclutamiento.",
        });
      } finally {
        await removeUploadQuietly(req.file?.path);
        if (accepted && !saved) {
          await deletePersistentPrivateCv(accepted.storagePath).catch(() => {});
          await removeUploadQuietly(accepted.absolutePath);
        }
      }
    }),
  );
  app.get(
    "/api/admin/career-applications",
    authMiddleware,
    async (_req, res) => {
      try {
        const rows = await db
          .select()
          .from(careerApplications)
          .orderBy(desc(careerApplications.submittedAt));
        res
          .set("Cache-Control", "private, no-store")
          .json(rows.map(({ cvPath, ...r }) => ({ ...r, hasCv: true })));
      } catch {
        res
          .status(503)
          .json({ error: "No se pudieron cargar las candidaturas." });
      }
    },
  );
  app.patch(
    "/api/admin/career-applications/:id",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const id = z.string().uuid().safeParse(req.params.id),
        body = z
          .object({
            read: z.boolean().optional(),
            status: z
              .enum(["received", "reviewed", "contacted", "closed"])
              .optional(),
            archived: z.boolean().optional(),
          })
          .strict()
          .refine((v) => Object.keys(v).length > 0)
          .safeParse(req.body);
      if (!id.success || !body.success)
        return res.status(400).json({ error: "Estado inválido." });
      try {
        const { archived, ...data } = body.data;
        const [row] = await db
          .update(careerApplications)
          .set({
            ...data,
            ...(archived === undefined
              ? {}
              : { archivedAt: archived ? new Date() : null }),
          })
          .where(eq(careerApplications.id, id.data))
          .returning({
            id: careerApplications.id,
            status: careerApplications.status,
            read: careerApplications.read,
            archivedAt: careerApplications.archivedAt,
          });
        if (!row)
          return res.status(404).json({ error: "Candidatura no encontrada." });
        await recordAccessEvent(
          "career_application_updated",
          req.adminUser!.id,
        );
        res.json(row);
      } catch {
        res
          .status(503)
          .json({ error: "No se pudo actualizar la candidatura." });
      }
    },
  );
  app.get(
    "/api/admin/career-applications/:id/cv",
    authMiddleware,
    async (req, res) => {
      if (!z.string().uuid().safeParse(req.params.id).success)
        return res.status(404).end();
      try {
        const [row] = await db
          .select()
          .from(careerApplications)
          .where(eq(careerApplications.id, req.params.id));
        if (!row) return res.status(404).end();
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="curriculum.pdf"; filename*=UTF-8''${encodeURIComponent(row.cvOriginalName)}`,
          "Cache-Control": "private, no-store",
          "Content-Security-Policy": "sandbox",
          "X-Content-Type-Options": "nosniff",
        });
        await recordAccessEvent("career_cv_downloaded", req.adminUser!.id);
        if (!persistentMediaIsRequired()) {
          const local = resolvePrivateCvStoragePath(row.cvPath);
          if (
            local &&
            (await fs.stat(local).then(
              () => true,
              () => false,
            ))
          )
            return res.sendFile(local);
        }
        const stream = await openPersistentPrivateCvStream(row.cvPath);
        if (!stream) return res.status(503).end();
        stream.once("error", () => {
          if (!res.headersSent) res.status(503).end();
          else res.destroy();
        });
        stream.pipe(res);
      } catch {
        if (!res.headersSent) res.status(503).end();
      }
    },
  );
}
