import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import sharp from "sharp";
import type { LetterheadTemplateId } from "@shared/letterheadTemplates";

export type DocumentMode = "preserve" | "organize";
type DocumentInput = {
  title: string;
  sourceText: string;
  mode: DocumentMode;
  template?: LetterheadTemplateId | null;
};
const wordNs = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const relNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const pkgRelNs = "http://schemas.openxmlformats.org/package/2006/relationships";
const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const logoPath = path.join(process.cwd(), "attached_assets", "logo-ss-color.png");
const slogan = "DERECHO LABORAL PARA EMPRESAS";
const website = "www.santossaucedo.com";
const pageWidth = 612;
const pageHeight = 792;
// The four Letter-size artworks share the same gutter and have all contact
// information and accent bands outside this content box.
const artworkMargins = { horizontal: 62, top: 132, bottom: 76 };
const pointsToTwips = 20;
const pointsToEmu = 12_700;

async function readLetterhead(template: LetterheadTemplateId): Promise<Buffer> {
  const roots = process.env.NODE_ENV === "production"
    ? ["dist/public", "client/public"]
    : ["client/public", "dist/public"];
  for (const root of roots) {
    try {
      return await fs.readFile(path.join(process.cwd(), root, "letterheads", `${template}.png`));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  throw new Error(`No se encontró el archivo de membrete ${template}.`);
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? "\uFFFD",
  );
}

function documentLines(input: DocumentInput): string[] {
  const lines = input.sourceText.replace(/\r\n?/g, "\n").split("\n");
  return input.mode === "preserve" ? lines : lines.map((line) => line.replace(/[ \t]+/g, " ").trim());
}

function wordText(value: string) {
  return value.split("\t").map((part) => `<w:t xml:space="preserve">${escapeXml(part)}</w:t>`).join("<w:tab/>");
}

function relationships(entries: [string, string, string][]) {
  return `${xml}<Relationships xmlns="${pkgRelNs}">${entries.map(([id, type, target]) =>
    `<Relationship Id="${id}" Type="${relNs}/${type}" Target="${target}"/>`,
  ).join("")}</Relationships>`;
}

function wordPicture(width: number, height: number, filename: string, fullPage: boolean) {
  const extent = `<wp:extent cx="${width}" cy="${height}"/>`;
  const graphic = `<wp:docPr id="1" name="Santos &amp; Saucedo"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="${filename}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic>`;
  // A page-relative drawing in the default header repeats on every page. The
  // behind-text setting also applies in Word's print and export layouts.
  return fullPage
    ? `<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>${extent}<wp:wrapNone/>${graphic}</wp:anchor>`
    : `<wp:inline>${extent}${graphic}</wp:inline>`;
}

export async function createBrandedDocx(input: DocumentInput): Promise<Buffer> {
  const artwork = input.template ? await readLetterhead(input.template) : await fs.readFile(logoPath);
  const filename = input.template ? "letterhead.png" : "logo.png";
  const logoWidth = input.template ? pageWidth * pointsToEmu : 2_100_000;
  const { width, height } = await sharp(artwork).metadata();
  const logoHeight = input.template ? pageHeight * pointsToEmu : Math.round(logoWidth * height / width);
  const drawing = wordPicture(logoWidth, logoHeight, filename, Boolean(input.template));
  const headerSpacing = input.template ? '<w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr>' : "";
  const pageMargins = input.template
    ? `<w:pgMar w:top="${artworkMargins.top * pointsToTwips}" w:right="${artworkMargins.horizontal * pointsToTwips}" w:bottom="${artworkMargins.bottom * pointsToTwips}" w:left="${artworkMargins.horizontal * pointsToTwips}" w:header="0" w:footer="0" w:gutter="0"/>`
    : '<w:pgMar w:top="2000" w:right="1080" w:bottom="1180" w:left="1080" w:header="600" w:footer="560" w:gutter="0"/>';
  const zip = new JSZip();
  const heading = `<w:p><w:pPr><w:keepNext/><w:spacing w:after="260"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Lora" w:hAnsi="Lora"/><w:b/><w:color w:val="0B2850"/><w:sz w:val="40"/></w:rPr>${wordText(input.title)}</w:r></w:p>`;
  const body = documentLines(input).map((line) =>
    `<w:p><w:pPr><w:spacing w:after="0" w:line="300" w:lineRule="auto"/></w:pPr><w:r>${wordText(line)}</w:r></w:p>`,
  ).join("");
  const override = (name: string, type: string) =>
    `<Override PartName="/word/${name}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`;
  zip.file("[Content_Types].xml", `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${override("document", "document.main")}${override("styles", "styles")}${override("header1", "header")}${input.template ? "" : override("footer1", "footer")}</Types>`);
  zip.file("_rels/.rels", relationships([["rId1", "officeDocument", "word/document.xml"]]));
  const documentRelationships: [string, string, string][] = [
    ["rId1", "styles", "styles.xml"], ["rId2", "header", "header1.xml"],
  ];
  if (!input.template) documentRelationships.push(["rId3", "footer", "footer1.xml"]);
  zip.file("word/_rels/document.xml.rels", relationships(documentRelationships));
  zip.file("word/_rels/header1.xml.rels", relationships([["rId1", "image", `media/${filename}`]]));
  zip.file(`word/media/${filename}`, artwork);
  zip.file("word/styles.xml", `${xml}<w:styles xmlns:w="${wordNs}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="DM Sans" w:hAnsi="DM Sans"/><w:color w:val="23232B"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`);
  const headerLabel = input.template ? "" : `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="5" w:color="8CC63F"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="0B2850"/><w:sz w:val="17"/></w:rPr><w:t>${slogan}</w:t></w:r></w:p>`;
  zip.file("word/header1.xml", `${xml}<w:hdr xmlns:w="${wordNs}" xmlns:r="${relNs}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:p>${headerSpacing}<w:r><w:drawing>${drawing}</w:drawing></w:r></w:p>${headerLabel}</w:hdr>`);
  if (!input.template) zip.file("word/footer1.xml", `${xml}<w:ftr xmlns:w="${wordNs}"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="8CC63F"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="0B2850"/><w:sz w:val="18"/></w:rPr><w:t>${website} · San Pedro Garza García · Desde 2010</w:t></w:r></w:p></w:ftr>`);
  zip.file("word/document.xml", `${xml}<w:document xmlns:w="${wordNs}" xmlns:r="${relNs}"><w:body>${heading}${body}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/>${input.template ? "" : '<w:footerReference w:type="default" r:id="rId3"/>'}<w:pgSz w:w="${pageWidth * pointsToTwips}" w:h="${pageHeight * pointsToTwips}"/>${pageMargins}</w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function wrap(text: string, font: PDFFont, size: number, lineWidth: number) {
  const supported = new Set(font.getCharacterSet());
  const lines: string[] = [];
  let line = "";
  let width = 0;
  let spaceIndex = -1;
  let spaceWidth = 0;
  for (const char of Array.from(text.replace(/\t/g, "    "))) {
    const glyph = char.codePointAt(0)!;
    const charWidth = supported.has(glyph) ? font.widthOfTextAtSize(char, size) : size;
    if (width + charWidth > lineWidth && line) {
      if (spaceIndex >= 0) {
        lines.push(line.slice(0, spaceIndex));
        line = line.slice(spaceIndex + 1);
        width -= spaceWidth;
      } else {
        lines.push(line);
        line = "";
        width = 0;
      }
      spaceIndex = -1;
    }
    if (char === " ") {
      spaceIndex = line.length;
      spaceWidth = width + charWidth;
    }
    line += char;
    width += charWidth;
  }
  lines.push(line);
  return { lines, supported };
}

export async function createBrandedPdf(input: DocumentInput): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(input.title);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const heading = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const artwork = await pdf.embedPng(input.template ? await readLetterhead(input.template) : await fs.readFile(logoPath));
  const margin = input.template ? artworkMargins.horizontal : 54;
  const lineWidth = pageWidth - margin * 2;
  const bottom = input.template ? artworkMargins.bottom + 8 : 68;
  const navy = rgb(11 / 255, 40 / 255, 80 / 255);
  const green = rgb(140 / 255, 198 / 255, 63 / 255);
  const ink = rgb(35 / 255, 35 / 255, 43 / 255);
  let y = 0;
  const addPage = () => {
    const page = pdf.addPage([pageWidth, pageHeight]);
    if (input.template) {
      page.drawImage(artwork, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      y = pageHeight - artworkMargins.top - 17;
    } else {
      const logoSize = artwork.scaleToFit(166, 34);
      page.drawImage(artwork, { x: margin, y: 749 - logoSize.height, ...logoSize });
      page.drawText(slogan, { x: margin, y: 697, size: 9, font: regular, color: navy });
      page.drawRectangle({ x: margin, y: 686, width: lineWidth, height: 2, color: green });
      page.drawRectangle({ x: margin, y: 49, width: lineWidth, height: 1, color: green });
      page.drawText(`${website} · San Pedro Garza García · Desde 2010`, { x: margin, y: 32, size: 9, font: regular, color: navy });
      page.drawText(String(pdf.getPageCount()), { x: 538, y: 32, size: 9, font: regular, color: navy });
      y = 658;
    }
    return page;
  };
  let page = addPage();
  const renderLine = async (value: string, font: PDFFont, size: number, isTitle = false) => {
    const { lines, supported } = wrap(value, font, size, lineWidth);
    for (const line of lines) {
      if (y < bottom) page = addPage();
      if (line.trim()) {
        if (Array.from(line).every((char) => supported.has(char.codePointAt(0)!))) {
          page.drawText(line, { x: margin, y, size, font, color: isTitle ? navy : ink });
        } else {
          // PDF standard fonts only cover WinAnsi. Use the runtime's font fallback for other scripts.
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lineWidth}" height="${size + 8}"><text xml:space="preserve" x="0" y="${size}" font-family="sans-serif" font-size="${size}" fill="${isTitle ? "#0B2850" : "#23232B"}">${escapeXml(line)}</text></svg>`;
          const png = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer();
          const rendered = await pdf.embedPng(png);
          page.drawImage(rendered, { x: margin, y: y - 8, width: lineWidth, height: size + 8 });
        }
      }
      y -= size + 6;
    }
  };
  await renderLine(input.title, heading, 21, true);
  y -= 12;
  for (const line of documentLines(input)) await renderLine(line, regular, 11);
  return Buffer.from(await pdf.save());
}
