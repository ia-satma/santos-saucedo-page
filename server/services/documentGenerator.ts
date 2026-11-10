import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type DocumentMode = "preserve" | "organize";

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[char]!);
}

function normalizeParagraphs(sourceText: string, mode: DocumentMode): string[] {
  const paragraphs = sourceText.replace(/\r\n?/g, "\n").split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
  if (mode === "preserve") return paragraphs.length ? paragraphs : [sourceText.trim()];
  return (paragraphs.length ? paragraphs : [sourceText.trim()]).map((paragraph) => paragraph.replace(/[ \t]+/g, " ").trim());
}

export async function createBrandedDocx(input: { title: string; sourceText: string; instructions?: string | null; mode: DocumentMode }): Promise<Buffer> {
  const paragraphs = normalizeParagraphs(input.sourceText, input.mode);
  const zip = new JSZip();
  const body = [
    `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="0B2850"/><w:sz w:val="30"/></w:rPr><w:t xml:space="preserve">${escapeXml(input.title)}</w:t></w:r></w:p>`,
    `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="14" w:space="1" w:color="BBF741"/></w:pBdr><w:spacing w:after="260"/></w:pPr><w:r><w:t xml:space="preserve">SANTOS &amp; SAUCEDO  ·  DERECHO LABORAL PARA EMPRESAS</w:t></w:r></w:p>`,
    ...(input.instructions ? [`<w:p><w:r><w:rPr><w:i/><w:color w:val="55566A"/></w:rPr><w:t xml:space="preserve">${escapeXml(input.instructions)}</w:t></w:r></w:p>`] : []),
    ...paragraphs.map((paragraph) => `<w:p><w:pPr><w:spacing w:after="180" w:line="300" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:color w:val="23232B"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`),
    `<w:p><w:pPr><w:spacing w:before="600"/></w:pPr><w:r><w:rPr><w:color w:val="5E8F17"/></w:rPr><w:t>www.santossaucedo.com</w:t></w:r></w:p>`,
  ].join("");
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`);
  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createBrandedPdf(input: { title: string; sourceText: string; instructions?: string | null; mode: DocumentMode }): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]);
  const navy = rgb(11 / 255, 40 / 255, 80 / 255);
  const lime = rgb(187 / 255, 247 / 255, 65 / 255);
  page.drawRectangle({ x: 0, y: 744, width: 612, height: 48, color: navy });
  const logoPath = path.join(process.cwd(), "attached_assets", "logo-ss-color.png");
  try {
    const logo = await pdf.embedPng(await fs.readFile(logoPath));
    const scale = Math.min(180 / logo.width, 32 / logo.height);
    page.drawImage(logo, { x: 36, y: 752, width: logo.width * scale, height: logo.height * scale });
  } catch {
    page.drawText("SANTOS & SAUCEDO", { x: 36, y: 763, size: 16, font: bold, color: rgb(1, 1, 1) });
  }
  page.drawRectangle({ x: 36, y: 720, width: 540, height: 3, color: lime });
  page.drawText(input.title.slice(0, 90), { x: 36, y: 680, size: 20, font: bold, color: navy, maxWidth: 540 });
  let y = 650;
  if (input.instructions) {
    for (const line of wrapLine(input.instructions, 92)) { page.drawText(line, { x: 36, y, size: 10, font: regular, color: rgb(85 / 255, 86 / 255, 106 / 255) }); y -= 16; }
    y -= 10;
  }
  for (const paragraph of normalizeParagraphs(input.sourceText, input.mode)) {
    for (const line of wrapLine(paragraph, 92)) {
      if (y < 58) break;
      page.drawText(line, { x: 36, y, size: 11, font: regular, color: rgb(35 / 255, 35 / 255, 43 / 255) });
      y -= 17;
    }
    y -= 10;
  }
  page.drawText("www.santossaucedo.com", { x: 36, y: 30, size: 9, font: regular, color: rgb(94 / 255, 143 / 255, 23 / 255) });
  return Buffer.from(await pdf.save());
}
