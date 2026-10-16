import express, { type Express, type Request, type Response } from "express";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import { authMiddleware, requireRole } from "../auth";
import { storage } from "../storage";
import {
  uploadAppStorageFile,
  deleteAppStorageObject,
  storageBucketId,
} from "../replitStorage";
import { normalizePublicMediaMime } from "../media/publicMediaMime";
import {
  createChunkedMediaUpload,
  storeChunkedMediaPart,
  assembleChunkedMediaUpload,
  removeChunkedMediaUpload,
  ChunkedMediaUploadError,
  MEDIA_CHUNK_BYTES,
} from "../media/chunkedUpload";
import {
  ensurePrivateUploadDirectories,
  publicMediaQuarantineDir,
  securePhysicalFilename,
  validatePublicMediaSignature,
  inspectVideoContainer,
  scanFileForMalware,
  checkClamAvHealth,
  removeUploadQuietly,
} from "../security/uploads";
import { resolveVideoRuntime } from "../media/videoRuntime";
const mimeExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
};
const receive = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensurePrivateUploadDirectories().then(
        () => cb(null, publicMediaQuarantineDir),
        (e) => cb(e, ""),
      );
    },
    filename: (_req, _file, cb) => cb(null, securePhysicalFilename(".bin")),
  }),
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 3 },
  fileFilter: (_req, file, cb) => {
    const mime = normalizePublicMediaMime(file.originalname, file.mimetype);
    if (!mime) return cb(new Error("Formato no admitido."));
    file.mimetype = mime;
    cb(null, true);
  },
}).single("file");
const altFields = z.object({
  alt: z.string().max(500).optional().default(""),
  altEs: z.string().max(500).optional().default(""),
});
function fail(res: Response, error: unknown) {
  if (error instanceof ChunkedMediaUploadError)
    return res
      .status(error.status)
      .json({ error: error.message, code: error.code });
  const message = error instanceof Error ? error.message : "";
  if (message === "Malware detected")
    return res
      .status(400)
      .json({ error: "El archivo no superó el análisis de seguridad." });
  if (message === "Malware scanner unavailable")
    return res.status(503).json({
      error:
        "El escáner de archivos no está disponible. El archivo anterior permanece sin cambios.",
    });
  console.error(
    "[Media] Upload failed:",
    error instanceof Error ? error.name : "unknown",
  );
  return res.status(503).json({
    error:
      "No se pudo guardar el archivo. Su referencia anterior permanece sin cambios.",
  });
}
async function complete(
  file: { path: string; originalName: string; mimeType: string },
  userId: string,
  fields: { alt: string; altEs: string },
) {
  let objectName: string | undefined;
  try {
    const mime = file.mimeType,
      ext = mimeExt[mime];
    if (!ext || !(await validatePublicMediaSignature(file.path, mime)))
      throw new ChunkedMediaUploadError(
        "El contenido no coincide con el formato del archivo.",
        "INVALID_SIGNATURE",
      );
    let dimensions: { width?: number; height?: number } = {};
    if (mime.startsWith("image/")) {
      try {
        const image = sharp(file.path, {
          animated: ext === ".gif",
          limitInputPixels: 40000000,
        }).rotate();
        const bytes = await (
          ext === ".jpg"
            ? image.jpeg({ quality: 92 })
            : ext === ".webp"
              ? image.webp({ quality: 92 })
              : ext === ".gif"
                ? image.gif()
                : image.png()
        ).toBuffer();
        const meta = await sharp(bytes, {
          animated: ext === ".gif",
        }).metadata();
        dimensions = {
          width: meta.width,
          height: meta.pageHeight ?? meta.height,
        };
        await fs.writeFile(file.path, bytes);
      } catch {
        throw new ChunkedMediaUploadError(
          "La imagen no se puede leer. Exporte un JPG, PNG, WebP o GIF válido.",
          "INVALID_IMAGE",
        );
      }
    } else if (mime === "application/pdf") {
      try {
        const pdf = await PDFDocument.load(await fs.readFile(file.path));
        if (!pdf.getPageCount()) throw new Error();
      } catch {
        throw new ChunkedMediaUploadError(
          "El PDF está dañado, vacío o protegido. Exporte un PDF válido sin contraseña.",
          "INVALID_PDF",
        );
      }
    } else {
      const result = await inspectVideoContainer(file.path, { mimeType: mime });
      if (!result.valid)
        throw new ChunkedMediaUploadError(
          result.reason === "validator_unavailable"
            ? "El verificador de video no está disponible. Reintente sin cambiar el archivo anterior."
            : "El video no se puede reproducir. Exporte un MP4 H.264 o un WebM válido.",
          "INVALID_VIDEO",
          result.reason === "validator_unavailable" ||
          result.reason === "validation_timeout"
            ? 503
            : 400,
        );
    }
    await scanFileForMalware(file.path);
    const filename = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${ext}`;
    objectName = `public/media/${filename}`;
    await uploadAppStorageFile(objectName, file.path);
    const stat = await fs.stat(file.path);
    return await storage.createMediaItem({
      filename,
      originalName: path
        .basename(file.originalName)
        .replace(/[\u0000-\u001f]/g, "")
        .slice(0, 180),
      path: `/media/${objectName}`,
      mimeType: mime,
      size: stat.size,
      ...dimensions,
      uploadedBy: userId,
      alt: fields.alt || null,
      altEs: fields.altEs || null,
    });
  } catch (e) {
    if (objectName)
      await deleteAppStorageObject(objectName).catch(() =>
        console.error("[Media] Object cleanup pending."),
      );
    throw e;
  }
}
const active = new Set<string>();
export function registerMediaUploads(app: Express) {
  app.get(
    "/api/admin/media/capabilities",
    authMiddleware,
    async (_req, res) => {
      const [video, av] = await Promise.all([
        resolveVideoRuntime(),
        checkClamAvHealth(),
      ]);
      res.set("Cache-Control", "private, no-store").json({
        maxBytes: 200 * 1024 * 1024,
        directMaxBytes: 50 * 1024 * 1024,
        chunkBytes: MEDIA_CHUNK_BYTES,
        storageConfigured: Boolean(storageBucketId()),
        videoAvailable: Boolean(video.ffmpeg.path && video.ffprobe.path),
        antivirus: av,
      });
    },
  );
  app.post(
    "/api/admin/media/upload",
    authMiddleware,
    requireRole("editor", "admin"),
    (req, res) =>
      receive(req, res, async (error: any) => {
        try {
          if (error)
            return res
              .status(error.code === "LIMIT_FILE_SIZE" ? 413 : 415)
              .json({
                error:
                  error.code === "LIMIT_FILE_SIZE"
                    ? "Para archivos mayores de 50 MB use la carga fragmentada del panel (hasta 200 MB)."
                    : "Formato o carga no admitidos.",
              });
          if (!req.file)
            return res.status(400).json({ error: "Seleccione un archivo." });
          const fields = altFields.safeParse(req.body);
          if (!fields.success)
            return res
              .status(400)
              .json({ error: "Revise las descripciones del archivo." });
          res.status(201).json(
            await complete(
              {
                path: req.file.path,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
              },
              req.adminUser!.id,
              fields.data,
            ),
          );
        } catch (e) {
          fail(res, e);
        } finally {
          await removeUploadQuietly(req.file?.path);
        }
      }),
  );
  app.post(
    "/api/admin/media/upload/start",
    authMiddleware,
    requireRole("editor", "admin"),
    (req, res) => {
      const parsed = z
        .object({
          originalName: z.string().min(1).max(180),
          mimeType: z.string().max(100),
          size: z
            .number()
            .int()
            .positive()
            .max(200 * 1024 * 1024),
        })
        .strict()
        .safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          error: "Revise el nombre, formato y tamaño (máximo 200 MB).",
        });
      try {
        res.json(
          createChunkedMediaUpload({
            ...parsed.data,
            userId: req.adminUser!.id,
          }),
        );
      } catch (e) {
        fail(res, e);
      }
    },
  );
  app.post(
    "/api/admin/media/upload/chunk",
    authMiddleware,
    requireRole("editor", "admin"),
    express.raw({ type: "application/octet-stream", limit: MEDIA_CHUNK_BYTES }),
    async (req, res) => {
      try {
        const token = String(req.headers["x-upload-token"] || "");
        const index = z.coerce
          .number()
          .int()
          .min(0)
          .safeParse(req.headers["x-chunk-index"]);
        if (!index.success)
          throw new ChunkedMediaUploadError(
            "Índice de fragmento inválido.",
            "INVALID_CHUNK",
          );
        res.json(
          await storeChunkedMediaPart(
            token,
            req.adminUser!.id,
            index.data,
            req.body,
            String(req.headers["x-chunk-sha256"] || ""),
          ),
        );
      } catch (e) {
        fail(res, e);
      }
    },
  );
  app.post(
    "/api/admin/media/upload/abort",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const parsed = z
        .object({ token: z.string().max(2000) })
        .strict()
        .safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: "Sesión inválida." });
      if (active.has(parsed.data.token))
        return res.status(409).json({ error: "La carga se está verificando." });
      try {
        const ok = await removeChunkedMediaUpload(
          parsed.data.token,
          req.adminUser!.id,
        );
        res.status(ok ? 200 : 503).json({ success: ok });
      } catch (e) {
        fail(res, e);
      }
    },
  );
  app.post(
    "/api/admin/media/upload/complete",
    authMiddleware,
    requireRole("editor", "admin"),
    async (req, res) => {
      const parsed = altFields
        .extend({ token: z.string().min(40).max(2000) })
        .strict()
        .safeParse(req.body);
      if (!parsed.success)
        return res
          .status(400)
          .json({ error: "Sesión o descripciones inválidas." });
      const { token, ...fields } = parsed.data;
      if (active.has(token))
        return res
          .status(409)
          .json({ error: "La carga ya se está verificando." });
      active.add(token);
      let destination = "";
      let status = 500;
      try {
        await ensurePrivateUploadDirectories();
        destination = path.join(
          publicMediaQuarantineDir,
          securePhysicalFilename(".bin"),
        );
        const file = await assembleChunkedMediaUpload(
          token,
          req.adminUser!.id,
          destination,
        );
        const item = await complete(
          { ...file, path: destination },
          req.adminUser!.id,
          fields,
        );
        status = 201;
        await removeChunkedMediaUpload(token, req.adminUser!.id);
        res.status(201).json(item);
      } catch (e) {
        status = e instanceof ChunkedMediaUploadError ? e.status : 503;
        fail(res, e);
      } finally {
        active.delete(token);
        await removeUploadQuietly(destination);
        if (status !== 503)
          await removeChunkedMediaUpload(token, req.adminUser!.id).catch(
            () => {},
          );
      }
    },
  );
}
