import { z } from "zod";

type LinkAttributes = {
  href: string;
  target?: string | null;
  rel?: string | null;
  class?: string | null;
  title?: string | null;
};
export type DocumentMark = { type: "bold" | "italic" | "underline" } | { type: "link"; attrs: LinkAttributes };
export type DocumentInline = { type: "text"; text: string; marks?: DocumentMark[] } | { type: "hardBreak" };
export type DocumentParagraph = { type: "paragraph"; content?: DocumentInline[] };
export type DocumentHeading = { type: "heading"; attrs: { level: 2 | 3 }; content?: DocumentInline[] };
export type DocumentList = {
  type: "bulletList" | "orderedList";
  attrs?: { start?: number; type?: null };
  content: { type: "listItem"; content: [DocumentParagraph, ...DocumentBlock[]] }[];
};
export type DocumentQuote = { type: "blockquote"; content: DocumentBlock[] };
export type DocumentBlock = DocumentParagraph | DocumentHeading | DocumentList | DocumentQuote;
export type DocumentRichText = { type: "doc"; content: DocumentBlock[] };

export function isSafeDocumentLink(value: string): boolean {
  if (value.length > 2048 || !/^(https?:\/\/|mailto:)/i.test(value) || /[\x00-\x20\x7f]/.test(value)) return false;
  try {
    const link = new URL(value);
    return !link.username && !link.password && (link.protocol === "mailto:" ? Boolean(link.pathname) : Boolean(link.hostname));
  } catch {
    return false;
  }
}

const nullableLabel = z.string().max(512).nullish();
const mark = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }).strict(),
  z.object({ type: z.literal("italic") }).strict(),
  z.object({ type: z.literal("underline") }).strict(),
  z.object({ type: z.literal("link"), attrs: z.object({
    href: z.string().max(2048).refine(isSafeDocumentLink),
    target: nullableLabel, rel: nullableLabel, class: nullableLabel, title: nullableLabel,
  }).strict() }).strict(),
]);
const inline = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(200_000).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/.test(value)),
    marks: z.array(mark).max(4).refine(marks => new Set(marks.map(item => item.type)).size === marks.length).optional(),
  }).strict(),
  z.object({ type: z.literal("hardBreak") }).strict(),
]);
const paragraph = z.object({ type: z.literal("paragraph"), content: z.array(inline).optional() }).strict();
const heading = z.object({
  type: z.literal("heading"),
  attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }).strict(),
  content: z.array(inline).optional(),
}).strict();
const nestedBlock: z.ZodType<DocumentBlock> = z.lazy(() => block);
const list = z.object({
  type: z.enum(["bulletList", "orderedList"]),
  attrs: z.object({ start: z.number().int().min(1).max(9999).optional(), type: z.null().optional() }).strict().optional(),
  content: z.array(z.object({
    type: z.literal("listItem"),
    content: z.tuple([paragraph]).rest(nestedBlock),
  }).strict()).min(1),
}).strict();
const quote = z.object({ type: z.literal("blockquote"), content: z.array(nestedBlock).min(1) }).strict();
const block: z.ZodType<DocumentBlock> = z.discriminatedUnion("type", [paragraph, heading, list, quote]);
const tree = z.object({ type: z.literal("doc"), content: z.array(block).min(1) }).strict();

function boundedTree(value: unknown) {
  const pending = [{ value, depth: 0 }];
  let nodes = 0;
  let chars = 0;
  while (pending.length) {
    const next = pending.pop()!;
    if (!next.value || typeof next.value !== "object" || next.depth > 14 || ++nodes > 12_000) return false;
    const node = next.value as { text?: unknown; content?: unknown };
    if (typeof node.text === "string") {
      chars += node.text.length;
      if (chars > 200_000) return false;
    }
    if (Array.isArray(node.content)) {
      if (node.content.length + nodes + pending.length > 12_000) return false;
      for (const child of node.content) pending.push({ value: child, depth: next.depth + 1 });
    }
  }
  return true;
}

export const documentRichTextSchema = z.custom<DocumentRichText>(
  value => boundedTree(value) && tree.safeParse(value).success,
  "El contenido tiene formato no compatible o supera el límite del documento.",
);

export function plainTextToRichText(text: string): DocumentRichText {
  return {
    type: "doc",
    content: text.replace(/\r\n?/g, "\n").split("\n").map(line => ({
      type: "paragraph",
      ...(line ? { content: [{ type: "text", text: line }] } : {}),
    })),
  };
}

export function richTextToPlainText(document: DocumentRichText): string {
  const lines: string[] = [];
  function visit(block: DocumentBlock, indent = "", marker = "", quotePrefix = "") {
    if (block.type === "paragraph" || block.type === "heading") {
      lines.push(quotePrefix + indent + marker + (block.content ?? []).map(node => node.type === "text" ? node.text : "\n").join(""));
      return;
    }
    if (block.type === "blockquote") {
      for (const child of block.content) visit(child, indent, "", quotePrefix + "> ");
      return;
    }
    block.content.forEach((item, index) => {
      const label = block.type === "bulletList" ? "• " : ((block.attrs?.start ?? 1) + index) + ". ";
      item.content.forEach((child, childIndex) => visit(child, childIndex === 0 ? indent : indent + "  ", childIndex === 0 ? label : "", quotePrefix));
    });
  }
  for (const block of document.content) visit(block);
  return lines.join("\n");
}
