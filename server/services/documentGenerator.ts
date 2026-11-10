import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import sharp from "sharp";

export type DocumentMode = "preserve" | "organize";
type DocumentInput = { title: string; sourceText: string; mode: DocumentMode };
const wordNs = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const relNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const pkgRelNs = "http://schemas.openxmlformats.org/package/2006/relationships";
const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const logoPath = path.join(process.cwd(), "attached_assets", "logo-ss-color.png");
const slogan = "DERECHO LABORAL PARA EMPRESAS";
const website = "www.santossaucedo.com";

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

export async function createBrandedDocx(input: DocumentInput): Promise<Buffer> {
  const logo = await fs.readFile(logoPath);
  const { width, height } = await sharp(logo).metadata();
  const logoWidth = 2_100_000;
  const logoHeight = Math.round(logoWidth * height / width);
  const zip = new JSZip();
  const heading = `<w:p><w:pPr><w:keepNext/><w:spacing w:after="260"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Lora" w:hAnsi="Lora"/><w:b/><w:color w:val="0B2850"/><w:sz w:val="40"/></w:rPr>${wordText(input.title)}</w:r></w:p>`;
  const body = documentLines(input).map((line) =>
    `<w:p><w:pPr><w:spacing w:after="0" w:line="300" w:lineRule="auto"/></w:pPr><w:r>${wordText(line)}</w:r></w:p>`,
  ).join("");
  const override = (name: string, type: string) =>
    `<Override PartName="/word/${name}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`;
  zip.file("[Content_Types].xml", `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${override("document", "document.main")}${override("styles", "styles")}${override("header1", "header")}${override("footer1", "footer")}</Types>`);
  zip.file("_rels/.rels", relationships([["rId1", "officeDocument", "word/document.xml"]]));
  zip.file("word/_rels/document.xml.rels", relationships([
    ["rId1", "styles", "styles.xml"], ["rId2", "header", "header1.xml"], ["rId3", "footer", "footer1.xml"],
  ]));
  zip.file("word/_rels/header1.xml.rels", relationships([["rId1", "image", "media/logo.png"]]));
  zip.file("word/media/logo.png", logo);
  zip.file("word/styles.xml", `${xml}<w:styles xmlns:w="${wordNs}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="DM Sans" w:hAnsi="DM Sans"/><w:color w:val="23232B"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`);
  zip.file("word/header1.xml", `${xml}<w:hdr xmlns:w="${wordNs}" xmlns:r="${relNs}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:p><w:r><w:drawing><wp:inline><wp:extent cx="${logoWidth}" cy="${logoHeight}"/><wp:docPr id="1" name="Santos &amp; Saucedo"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${logoWidth}" cy="${logoHeight}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="5" w:color="8CC63F"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="0B2850"/><w:sz w:val="17"/></w:rPr><w:t>${slogan}</w:t></w:r></w:p></w:hdr>`);
  zip.file("word/footer1.xml", `${xml}<w:ftr xmlns:w="${wordNs}"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="8CC63F"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="0B2850"/><w:sz w:val="18"/></w:rPr><w:t>${website} · San Pedro Garza García · Desde 2010</w:t></w:r></w:p></w:ftr>`);
  zip.file("word/document.xml", `${xml}<w:document xmlns:w="${wordNs}" xmlns:r="${relNs}"><w:body>${heading}${body}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="2000" w:right="1080" w:bottom="1180" w:left="1080" w:header="600" w:footer="560" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

const margin = 54;
const lineWidth = 612 - margin * 2;

function wrap(text: string, font: PDFFont, size: number) {
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
  const logo = await pdf.embedPng(await fs.readFile(logoPath));
  const logoSize = logo.scaleToFit(166, 34);
  const navy = rgb(11 / 255, 40 / 255, 80 / 255);
  const green = rgb(140 / 255, 198 / 255, 63 / 255);
  const ink = rgb(35 / 255, 35 / 255, 43 / 255);
  let y = 0;
  const addPage = () => {
    const page = pdf.addPage([612, 792]);
    page.drawImage(logo, { x: margin, y: 749 - logoSize.height, ...logoSize });
    page.drawText(slogan, { x: margin, y: 697, size: 9, font: regular, color: navy });
    page.drawRectangle({ x: margin, y: 686, width: lineWidth, height: 2, color: green });
    page.drawRectangle({ x: margin, y: 49, width: lineWidth, height: 1, color: green });
    page.drawText(`${website} · San Pedro Garza García · Desde 2010`, { x: margin, y: 32, size: 9, font: regular, color: navy });
    page.drawText(String(pdf.getPageCount()), { x: 538, y: 32, size: 9, font: regular, color: navy });
    y = 658;
    return page;
  };
  let page = addPage();
  const renderLine = async (value: string, font: PDFFont, size: number, isTitle = false) => {
    const { lines, supported } = wrap(value, font, size);
    for (const line of lines) {
      if (y < 68) page = addPage();
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
