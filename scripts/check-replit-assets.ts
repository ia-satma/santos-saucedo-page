import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import PptxGenJS from "pptxgenjs";
import { uploadAppStorageObject, downloadAppStorageObject, deleteAppStorageObject, storageBucketId } from "../server/replitStorage";
import { persistPrivateCvFile, openPersistentPrivateCvStream, deletePersistentPrivateCv } from "../server/media/privateDocuments";
import { privatePresentationLocalPath, privatePresentationStoragePath, persistPrivatePresentationFiles, openPrivatePresentationStream, deletePrivatePresentationObjects } from "../server/media/privatePresentations";
import { scanFileForMalware, checkClamAvHealth } from "../server/security/uploads";

// Exact, randomly named, disposable files only. This check never imports the
// database, creates accounts/history or scans client uploads.
assert(process.env.REPL_ID && !process.env.REPLIT_DEPLOYMENT, "Use the Replit development workspace.");
assert(storageBucketId(), "App Storage must already be configured.");
process.env.CLAMAV_REQUIRED = "true";
const id = randomUUID(), cvName = randomBytes(16).toString("hex") + ".pdf";
const cvRef = `private:cvs/${cvName}`, cvFile = path.resolve("private_uploads/cvs", cvName);
const publicKey = `public/media/qa-storage-${id}.png`;
const root = path.resolve("private/generated-presentations", id);
let objects: string[] = [];
async function readStream(stream: NodeJS.ReadableStream | null) {
  assert(stream, "Stored object must be readable");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
try {
  const scanner = await checkClamAvHealth(); assert(scanner.available, "Scanner must be installed");
  const pdf = await PDFDocument.create(); pdf.addPage().drawText("Santos local infrastructure test");
  const pdfBytes = Buffer.from(await pdf.save());
  const png = await sharp({ create: { width: 320, height: 180, channels: 3, background: "#245caa" } }).png().toBuffer();
  await fs.mkdir(path.dirname(cvFile), { recursive: true }); await fs.writeFile(cvFile, pdfBytes);
  await scanFileForMalware(cvFile);
  await uploadAppStorageObject(publicKey, png);
  assert((await downloadAppStorageObject(publicKey))?.equals(png));
  assert((await persistPrivateCvFile(cvFile, cvRef)).persisted);
  assert((await readStream(await openPersistentPrivateCvStream(cvRef))).equals(pdfBytes));
  const deck = new PptxGenJS(); deck.addSlide().addText("Santos infrastructure test", { x: 1, y: 1, w: 7, h: 1 });
  const pptx = Buffer.from(await deck.write({ outputType: "nodebuffer" }) as Buffer);
  const entries = [];
  for (const [format, bytes] of [["pdf", pdfBytes], ["png", png], ["pptx", pptx]] as const) {
    const storagePath = privatePresentationStoragePath(id, format, format === "png" ? 1 : undefined)!;
    const absolutePath = privatePresentationLocalPath(storagePath)!;
    await fs.mkdir(path.dirname(absolutePath), { recursive: true }); await fs.writeFile(absolutePath, bytes);
    await scanFileForMalware(absolutePath); entries.push({ absolutePath, storagePath });
  }
  const persisted = await persistPrivatePresentationFiles(entries); objects = persisted.objectNames;
  assert(persisted.persisted && objects.length === 3);
  // Remove the local copies first: the following read must come from App Storage.
  for (const file of entries) await fs.unlink(file.absolutePath);
  for (let index = 0; index < entries.length; index++) {
    const expected = [pdfBytes, png, pptx][index];
    assert((await readStream(await openPrivatePresentationStream(entries[index].storagePath))).equals(expected));
  }
  console.log("REPLIT ASSETS PASSED: real scanner, public PNG round trip, private CV PDF, private PPTX/PDF/PNG read from App Storage after local deletion. No database or AI call.");
} finally {
  await deleteAppStorageObject(publicKey);
  await deletePersistentPrivateCv(cvRef);
  await deletePrivatePresentationObjects(objects);
  await fs.unlink(cvFile).catch(() => {});
  await fs.rm(root, { recursive: true, force: true });
}
