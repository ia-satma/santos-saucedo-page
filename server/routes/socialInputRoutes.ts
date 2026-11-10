import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Express, RequestHandler } from "express";
import multer from "multer";
import sharp from "sharp";
import { authMiddleware, requirePermission } from "../auth";
import { uploadPrivateStudioObject } from "../replitStorage";
import {
  privateUploadsDir,
  removeUploadQuietly,
  scanFileForMalware,
  validatePublicMediaSignature,
} from "../security/uploads";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const quarantine = path.join(privateUploadsDir, "social-images-quarantine");
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      try {
        mkdirSync(quarantine, { recursive: true, mode: 0o700 });
        callback(null, quarantine);
      } catch (error) {
        callback(error as Error, quarantine);
      }
    },
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
  fileFilter: (_req, file, callback) => callback(null, IMAGE_TYPES.has(file.mimetype)),
}).single("file");

const receiveImage: RequestHandler = (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  upload(req, res, (error: unknown) => {
    if (!error) return next();
    void removeUploadQuietly(req.file?.path);
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "La imagen supera el máximo de 12 MB." });
    }
    return res.status(400).json({ error: "No fue posible recibir la imagen." });
  });
};

export function registerSocialInputRoutes(app: Express) {
  app.post("/api/admin/social-assets/upload-image", authMiddleware, requirePermission("agents"), receiveImage, async (req, res) => {
    const input = req.file;
    if (!input) return res.status(415).json({ error: "Selecciona una imagen JPG, PNG o WebP." });
    try {
      if (!await validatePublicMediaSignature(input.path, input.mimetype)) {
        return res.status(415).json({ error: "El archivo no coincide con un formato de imagen admitido." });
      }
      await scanFileForMalware(input.path);
      let data: Buffer;
      try {
        const image = sharp(input.path, { limitInputPixels: 36_000_000, failOn: "warning" });
        const metadata = await image.metadata();
        if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) {
          return res.status(415).json({ error: "Sube una imagen estática JPG, PNG o WebP." });
        }
        data = await image.rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
      } catch {
        return res.status(415).json({ error: "No se pudo leer la imagen. Revisa el archivo o reduce sus dimensiones." });
      }
      const filename = `social-input-${randomUUID()}.webp`;
      await uploadPrivateStudioObject(`private/studio/${filename}`, data);
      const name = path.basename(input.originalname).replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 180);
      return res.status(201).json({ url: `private:studio/${filename}`, name: name || "Imagen de apoyo" });
    } catch {
      return res.status(503).json({ error: "No se pudo validar o guardar la imagen de apoyo." });
    } finally {
      await removeUploadQuietly(input.path);
    }
  });
}
