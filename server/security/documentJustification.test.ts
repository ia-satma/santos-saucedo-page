import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import JSZip from "jszip";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber } from "pdf-lib";
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createBrandedDocx, createBrandedPdf } from "../services/documentGenerator";
import type { DocumentRichText } from "../../shared/documentRichText";

const require = createRequire(import.meta.url);
const standardFontDataUrl = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + path.sep;
const customDirectory = process.env.DOCUMENT_QA_OUTPUT_DIR;
const directory = customDirectory ?? await mkdtemp(path.join(tmpdir(), "santos-document-justify-"));
await mkdir(directory, { recursive: true });
after(async () => { if (!customDirectory) await rm(directory, { recursive: true, force: true }); });

const sentence = "La revisión de los documentos permite organizar la información laboral y verificar las condiciones acordadas con el personal. ";
const longText = sentence.repeat(7) + "Cierre final del párrafo.";
const manualLine = "Salto manual con espacios.";
const manualLast = "Continuación breve.";
const externalUrl = "https://santossaucedo.com/";
const richContent: DocumentRichText = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Revisión de documentos" }] },
    { type: "paragraph", content: [
      { type: "text", text: sentence.repeat(2) },
      { type: "text", text: sentence, marks: [{ type: "bold" }] },
      { type: "text", text: sentence, marks: [{ type: "italic" }] },
      { type: "text", text: sentence, marks: [{ type: "underline" }] },
      { type: "text", text: sentence, marks: [{ type: "link", attrs: { href: externalUrl } }] },
      { type: "text", text: "Cierre final del párrafo." },
    ] },
    { type: "paragraph", content: [
      { type: "text", text: manualLine },
      { type: "hardBreak" },
      { type: "text", text: manualLast },
    ] },
  ],
};

type TextFragment = { str: string; x: number; y: number; width: number; fontName: string; size: number };
type TextLine = { fragments: TextFragment[]; text: string; x: number; end: number; y: number };
async function readLines(pdf: PDFDocumentProxy) {
  const pages: TextLine[][] = [];
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const groups = new Map<string, TextFragment[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const fragment = {
        str: item.str, x: item.transform[4], y: item.transform[5], width: item.width,
        fontName: item.fontName, size: Math.abs(item.transform[0]),
      };
      const key = fragment.y.toFixed(2);
      const group = groups.get(key) ?? [];
      group.push(fragment);
      groups.set(key, group);
    }
    pages.push(Array.from(groups.values(), fragments => {
      fragments.sort((a, b) => a.x - b.x);
      return {
        fragments,
        text: fragments.map(item => item.str).join(""),
        x: Math.min(...fragments.map(item => item.x)),
        end: Math.max(...fragments.map(item => item.x + item.width)),
        y: fragments[0].y,
      };
    }).sort((a, b) => b.y - a.y));
  }
  return pages;
}

async function generateSample(name: string, content?: DocumentRichText) {
  const input = {
    title: "", mode: "preserve" as const, template: "clasica" as const,
    sourceText: longText + "\n" + manualLine + "\n" + manualLast,
    richContent: content,
  };
  const [docx, pdf] = await Promise.all([createBrandedDocx(input), createBrandedPdf(input)]);
  await Promise.all([
    writeFile(path.join(directory, name + ".docx"), docx),
    writeFile(path.join(directory, name + ".pdf"), pdf),
  ]);
  const parsed = await getDocument({ data: new Uint8Array(pdf), standardFontDataUrl, useSystemFonts: true, verbosity: 0 }).promise;
  try {
    return { docx, pdf, pages: await readLines(parsed) };
  } finally {
    await parsed.destroy();
  }
}

function assertParagraphJustified(pages: TextLine[][]) {
  const lines = pages.flat().filter(line => line.fragments.every(fragment => Math.abs(fragment.size - 11) < .01));
  const manualIndex = lines.findIndex(line => line.text.includes(manualLine));
  const finalIndex = manualIndex - 1;
  assert(finalIndex >= 3, "The fixture must wrap into several body lines");
  for (const [index, line] of lines.slice(0, finalIndex).entries()) {
    assert(Math.abs(line.x - 62) < .1, "A justified line starts at the artwork content margin");
    assert(Math.abs(line.end - 550) < 1, "Wrapped body line " + (index + 1) + " ends at " + line.end + ", expected right margin 550");
  }
  const final = lines[finalIndex];
  assert(Math.abs(final.x - 62) < .1);
  assert(final.end < 530, "The final paragraph line retains natural spacing: " + JSON.stringify(final));
  const firstManual = lines.find(line => line.text.includes(manualLine));
  const lastManual = lines.find(line => line.text.includes(manualLast));
  assert(firstManual && lastManual);
  assert(Math.abs(firstManual.x - 62) < .1);
  assert(firstManual.end < 300, "A manual short line must not expand to the right margin");
  assert(lastManual.end < 300, "The last manual line stays left aligned");
  for (const line of lines) {
    assert(line.x >= 61.9 && line.end <= 551, "Body content stays within the letterhead content area");
    assert(line.y >= 76 && line.y <= 660, "Body content stays outside the artwork header/footer");
  }
}

async function assertWordJustification(docx: Buffer) {
  const zip = await JSZip.loadAsync(docx);
  const body = await zip.file("word/document.xml")!.async("string");
  const paragraphs = body.match(/<w:p>[\s\S]*?<\/w:p>/g) ?? [];
  const bodyParagraphs = paragraphs.filter(paragraph => paragraph.includes("La revisión") || paragraph.includes(manualLine) || paragraph.includes(manualLast));
  assert(bodyParagraphs.length >= 2);
  for (const paragraph of bodyParagraphs) {
    assert.match(paragraph, /<w:jc w:val="both"\/>/);
  }
  assert(zip.file("word/media/letterhead.png"), "Justification keeps the official page background");
  return { zip, body };
}

test("plain document paragraphs justify wrapped lines and preserve their last lines", async () => {
  const sample = await generateSample("normal-justificado");
  assertParagraphJustified(sample.pages);
  await assertWordJustification(sample.docx);
});

test("rich document justification respects mixed marks, explicit breaks and PDF link rectangles", async () => {
  const sample = await generateSample("formato-justificado", richContent);
  assertParagraphJustified(sample.pages);
  const { zip, body } = await assertWordJustification(sample.docx);
  assert.match(body, /<w:b\/>/);
  assert.match(body, /<w:i\/>/);
  assert.match(body, /<w:u w:val="single"\/>/);
  assert.match(body, /<w:br\/>/);
  assert.match(body, /<w:hyperlink/);
  const settings = await zip.file("word/settings.xml")?.async("string");
  assert(settings?.includes("<w:doNotExpandShiftReturn"), "A manual line break does not force expansion in Word");

  const pdf = await PDFDocument.load(sample.pdf);
  let links = 0;
  for (const page of pdf.getPages()) {
    const annotations = page.node.Annots();
    for (let index = 0; index < (annotations?.size() ?? 0); index++) {
      const annotation = annotations!.lookup(index, PDFDict);
      if (annotation.lookup(PDFName.of("Subtype"), PDFName).decodeText() !== "Link") continue;
      links++;
      const rect = annotation.lookup(PDFName.of("Rect"), PDFArray);
      const [left, bottom, right, top] = Array.from({ length: 4 }, (_, i) => rect.lookup(i, PDFNumber).asNumber());
      assert(left >= 62 && right <= 551 && right > left);
      assert(bottom >= 76 && top <= 660);
    }
  }
  assert(links > 0, "Styled paragraph hyperlinks survive justification");
  const fonts = new Set(sample.pages.flatMap(page => page.flatMap(line => line.fragments.map(fragment => fragment.fontName))));
  assert(fonts.size >= 4, "The PDF retains heading, regular, bold and italic fonts");
});
