import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { PDFDocument, PDFHexString, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import sharp from "sharp";
import type { LetterheadTemplateId } from "@shared/letterheadTemplates";
import type { DocumentBlock, DocumentInline, DocumentRichText } from "@shared/documentRichText";

export type DocumentMode = "preserve" | "organize";
type DocumentInput = {
  title: string;
  sourceText: string;
  richContent?: DocumentRichText;
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
  return value.replace(/\r\n?/g, "\n").split(/([\t\n])/).map((part) =>
    part === "\t" ? "<w:tab/>" : part === "\n" ? "<w:br/>" : `<w:t xml:space="preserve">${escapeXml(part)}</w:t>`,
  ).join("");
}

type WordRelationship = [id: string, type: string, target: string, external?: boolean];
function relationships(entries: WordRelationship[]) {
  return `${xml}<Relationships xmlns="${pkgRelNs}">${entries.map(([id, type, target, external]) =>
    `<Relationship Id="${id}" Type="${relNs}/${type}" Target="${escapeXml(target)}"${external ? ' TargetMode="External"' : ""}/>`,
  ).join("")}</Relationships>`;
}

type ListPosition = { id: number; depth: number; start: number; index: number; ordered: boolean; continuation: boolean };
type RenderParagraph = { content: DocumentInline[]; heading?: 2 | 3; list?: ListPosition; quoteDepth: number };

function documentParagraphs(document: DocumentRichText) {
  const paragraphs: RenderParagraph[] = [];
  let listCount = 0;
  function visit(block: DocumentBlock, quoteDepth = 0, list?: ListPosition) {
    if (block.type === "paragraph" || block.type === "heading") {
      paragraphs.push({ content: block.content ?? [], heading: block.type === "heading" ? block.attrs.level : undefined, list, quoteDepth });
      return;
    }
    if (block.type === "blockquote") {
      for (const child of block.content) visit(child, quoteDepth + 1, list);
      return;
    }
    const id = ++listCount;
    const depth = list ? list.depth + 1 : 0;
    const ordered = block.type === "orderedList";
    const start = block.attrs?.start ?? 1;
    block.content.forEach((item, index) => item.content.forEach((child, childIndex) => {
      visit(child, quoteDepth, { id, depth, ordered, start, index, continuation: childIndex > 0 });
    }));
  }
  for (const block of document.content) visit(block);
  return paragraphs;
}

const linkMark = (inline: Extract<DocumentInline, { type: "text" }>) => inline.marks?.find(mark => mark.type === "link");

function renderWordBody(input: DocumentInput, links: WordRelationship[]) {
  if (!input.richContent) return {
    body: documentLines(input).map(line =>
      `<w:p><w:pPr><w:spacing w:after="0" w:line="300" w:lineRule="auto"/></w:pPr><w:r>${wordText(line)}</w:r></w:p>`,
    ).join(""),
    numbering: "",
  };
  const lists = new Map<number, ListPosition>();
  const hyperlinks = new Map<string, string>();
  const body = documentParagraphs(input.richContent).map(({ content, heading, list, quoteDepth }) => {
    if (list && !lists.has(list.id)) lists.set(list.id, list);
    const style = heading ? `<w:pStyle w:val="Heading${heading}"/><w:keepNext/>` : "";
    const number = list && !list.continuation ? `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${list.id}"/></w:numPr>` : "";
    const leftIndent = (list ? 440 + list.depth * 360 : 0) + quoteDepth * 300;
    const indent = leftIndent ? `<w:ind w:left="${leftIndent}"${list && !list.continuation ? ' w:hanging="320"' : ""}/>` : "";
    const quoteRule = quoteDepth ? '<w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="8CC63F"/></w:pBdr>' : "";
    const spacing = `<w:spacing w:after="${heading ? 120 : list ? 40 : 100}" w:line="300" w:lineRule="auto"/>`;
    const runs = content.map(inline => {
      if (inline.type === "hardBreak") return "<w:r><w:br/></w:r>";
      const href = linkMark(inline)?.attrs.href;
      const bold = inline.marks?.some(mark => mark.type === "bold") ? "<w:b/>" : "";
      const italic = inline.marks?.some(mark => mark.type === "italic") ? "<w:i/>" : "";
      const color = href ? '<w:color w:val="174D78"/>' : "";
      const underline = href || inline.marks?.some(mark => mark.type === "underline") ? '<w:u w:val="single"/>' : "";
      const run = `<w:r><w:rPr>${bold}${italic}${color}${underline}</w:rPr>${wordText(inline.text)}</w:r>`;
      if (!href) return run;
      let id = hyperlinks.get(href);
      if (!id) {
        id = `rIdLink${hyperlinks.size + 1}`;
        hyperlinks.set(href, id);
        links.push([id, "hyperlink", href, true]);
      }
      return `<w:hyperlink r:id="${id}">${run}</w:hyperlink>`;
    }).join("");
    return `<w:p><w:pPr>${style}${number}${quoteRule}${spacing}${indent}</w:pPr>${runs}</w:p>`;
  }).join("");
  if (!lists.size) return { body, numbering: "" };
  const abstract = (id: number, format: string, marker: string) =>
    `<w:abstractNum w:abstractNumId="${id}"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="${format}"/><w:lvlText w:val="${marker}"/><w:lvlJc w:val="left"/></w:lvl></w:abstractNum>`;
  const instances = Array.from(lists.values(), list =>
    `<w:num w:numId="${list.id}"><w:abstractNumId w:val="${list.ordered ? 1 : 0}"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="${list.start}"/></w:lvlOverride></w:num>`,
  ).join("");
  return { body, numbering: `${xml}<w:numbering xmlns:w="${wordNs}">${abstract(0, "bullet", "•")}${abstract(1, "decimal", "%1.")}${instances}</w:numbering>` };
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
  const heading = input.title ? `<w:p><w:pPr><w:keepNext/><w:spacing w:after="260"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Lora" w:hAnsi="Lora"/><w:b/><w:color w:val="0B2850"/><w:sz w:val="40"/></w:rPr>${wordText(input.title)}</w:r></w:p>` : "";
  const documentRelationships: WordRelationship[] = [
    ["rId1", "styles", "styles.xml"], ["rId2", "header", "header1.xml"],
  ];
  if (!input.template) documentRelationships.push(["rId3", "footer", "footer1.xml"]);
  const { body, numbering } = renderWordBody(input, documentRelationships);
  if (numbering) {
    documentRelationships.push(["rId4", "numbering", "numbering.xml"]);
    zip.file("word/numbering.xml", numbering);
  }
  const override = (name: string, type: string) =>
    `<Override PartName="/word/${name}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`;
  zip.file("[Content_Types].xml", `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${override("document", "document.main")}${override("styles", "styles")}${override("header1", "header")}${input.template ? "" : override("footer1", "footer")}${numbering ? override("numbering", "numbering") : ""}</Types>`);
  zip.file("_rels/.rels", relationships([["rId1", "officeDocument", "word/document.xml"]]));
  zip.file("word/_rels/document.xml.rels", relationships(documentRelationships));
  zip.file("word/_rels/header1.xml.rels", relationships([["rId1", "image", `media/${filename}`]]));
  zip.file(`word/media/${filename}`, artwork);
  const headingStyles = input.richContent ? [2, 3].map(level =>
    `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:pPr><w:outlineLvl w:val="${level - 1}"/></w:pPr><w:rPr><w:rFonts w:ascii="Lora" w:hAnsi="Lora"/><w:b/><w:color w:val="0B2850"/><w:sz w:val="${level === 2 ? 32 : 26}"/></w:rPr></w:style>`,
  ).join("") : "";
  zip.file("word/styles.xml", `${xml}<w:styles xmlns:w="${wordNs}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="DM Sans" w:hAnsi="DM Sans"/><w:color w:val="23232B"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>${headingStyles}</w:styles>`);
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

type PdfRun = { text: string; font: PDFFont; width: number; href?: string; underline: boolean; supported: boolean };
type PdfStyle = Omit<PdfRun, "text" | "width" | "supported">;

function styledPdfLines(content: DocumentInline[], styleFor: (inline: Extract<DocumentInline, { type: "text" }>) => PdfStyle, size: number, limit: number) {
  const lines: PdfRun[][] = [[]];
  const fontChars = new Map<PDFFont, Set<number>>();
  let lineWidth = 0;
  const newLine = () => { lines.push([]); lineWidth = 0; };
  for (const inline of content) {
    if (inline.type === "hardBreak") { newLine(); continue; }
    const style = styleFor(inline);
    let glyphs = fontChars.get(style.font);
    if (!glyphs) {
      glyphs = new Set(style.font.getCharacterSet());
      fontChars.set(style.font, glyphs);
    }
    const parts = inline.text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").match(/\n|[^\S\n]+|[^\s]+/g) ?? [];
    for (const part of parts) {
      if (part === "\n") { newLine(); continue; }
      const metrics = Array.from(part, char => {
        const supported = glyphs!.has(char.codePointAt(0)!);
        return { char, supported, width: supported ? style.font.widthOfTextAtSize(char, size) : size };
      });
      const tokenWidth = metrics.reduce((sum, glyph) => sum + glyph.width, 0);
      if (lineWidth && lineWidth + tokenWidth > limit) {
        newLine();
        if (!part.trim()) continue;
      }
      for (const { char, width, supported } of metrics) {
        if (lineWidth && lineWidth + width > limit) newLine();
        const runs = lines[lines.length - 1];
        const last = runs[runs.length - 1];
        if (last && last.font === style.font && last.href === style.href && last.underline === style.underline && last.supported === supported) {
          last.text += char;
          last.width += width;
        } else {
          runs.push({ ...style, text: char, width, supported });
        }
        lineWidth += width;
      }
    }
  }
  return lines;
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
  async function drawFallback(value: string, x: number, width: number, size: number, font: PDFFont, fill: string) {
    // The PDF standard fonts cover WinAnsi. For other scripts the runtime
    // selects an available glyph while keeping the intended size and style.
    const family = font.name.startsWith("Times") ? "serif" : "sans-serif";
    const weight = font.name.includes("Bold") ? "bold" : "normal";
    const style = /Italic|Oblique/.test(font.name) ? "italic" : "normal";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${size + 8}"><text xml:space="preserve" x="0" y="${size}" font-family="${family}" font-weight="${weight}" font-style="${style}" font-size="${size}" fill="${fill}">${escapeXml(value)}</text></svg>`;
    const png = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer();
    page.drawImage(await pdf.embedPng(png), { x, y: y - 8, width, height: size + 8 });
  }
  const renderLine = async (value: string, font: PDFFont, size: number, isTitle = false) => {
    const { lines, supported } = wrap(value, font, size, lineWidth);
    for (const line of lines) {
      if (y < bottom) page = addPage();
      if (line.trim()) {
        if (Array.from(line).every((char) => supported.has(char.codePointAt(0)!))) {
          page.drawText(line, { x: margin, y, size, font, color: isTitle ? navy : ink });
        } else {
          await drawFallback(line, margin, lineWidth, size, font, isTitle ? "#0B2850" : "#23232B");
        }
      }
      y -= size + 6;
    }
  };
  if (input.title) {
    await renderLine(input.title, heading, 21, true);
    y -= 12;
  }
  if (!input.richContent) {
    for (const line of documentLines(input)) await renderLine(line, regular, 11);
    return Buffer.from(await pdf.save());
  }
  const [bold, italic, boldItalic, headingItalic] = await Promise.all([
    pdf.embedFont(StandardFonts.HelveticaBold),
    pdf.embedFont(StandardFonts.HelveticaOblique),
    pdf.embedFont(StandardFonts.HelveticaBoldOblique),
    pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
  ]);
  const blue = rgb(23 / 255, 77 / 255, 120 / 255);
  for (const paragraph of documentParagraphs(input.richContent)) {
    const { list, heading: headingLevel, quoteDepth } = paragraph;
    const size = headingLevel === 2 ? 16 : headingLevel === 3 ? 13 : 11;
    const lineHeight = size + 6;
    const marker = list?.ordered ? String(list.start + list.index) + "." : "•";
    const quoteIndent = quoteDepth * 15;
    const markerIndent = quoteIndent + (list ? 8 + list.depth * 18 : 0);
    const textIndent = list ? markerIndent + Math.max(18, regular.widthOfTextAtSize(marker, size) + 6) : quoteIndent;
    const lines = styledPdfLines(paragraph.content, inline => {
      const href = linkMark(inline)?.attrs.href;
      const strong = inline.marks?.some(mark => mark.type === "bold");
      const slanted = inline.marks?.some(mark => mark.type === "italic");
      const font = headingLevel ? (slanted ? headingItalic : heading)
        : strong && slanted ? boldItalic : strong ? bold : slanted ? italic : regular;
      return { font, href, underline: Boolean(href || inline.marks?.some(mark => mark.type === "underline")) };
    }, size, lineWidth - textIndent);
    if (headingLevel && y - lines.length * lineHeight < bottom) page = addPage();
    for (let index = 0; index < lines.length; index++) {
      if (y < bottom) page = addPage();
      if (quoteDepth) {
        const quoteX = margin + quoteIndent - 8;
        page.drawLine({ start: { x: quoteX, y: y + size }, end: { x: quoteX, y: y + size - lineHeight }, color: green, thickness: 1.5 });
      }
      if (index === 0 && list && !list.continuation) {
        page.drawText(marker, { x: margin + markerIndent, y, size, font: regular, color: ink });
      }
      let x = margin + textIndent;
      for (const run of lines[index]) {
        const color = run.href ? blue : headingLevel ? navy : ink;
        if (run.supported) {
          page.drawText(run.text, { x, y, size, font: run.font, color });
        } else {
          const fill = run.href ? "#174D78" : headingLevel ? "#0B2850" : "#23232B";
          await drawFallback(run.text, x, run.width, size, run.font, fill);
        }
        if (run.underline) page.drawLine({ start: { x, y: y - 2 }, end: { x: x + run.width, y: y - 2 }, color, thickness: 0.7 });
        if (run.href) {
          const annotation = pdf.context.obj({
            Type: "Annot", Subtype: "Link", Rect: [x, y - 2, x + run.width, y + size],
            Border: [0, 0, 0], A: { S: "URI", URI: PDFHexString.of(Buffer.from(new URL(run.href).href, "utf8").toString("hex")) },
          });
          page.node.addAnnot(pdf.context.register(annotation));
        }
        x += run.width;
      }
      y -= lineHeight;
    }
    y -= headingLevel ? 5 : list ? 2 : 4;
  }
  return Buffer.from(await pdf.save());
}
