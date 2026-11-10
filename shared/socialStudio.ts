import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./constants";

export const socialFormats = {
  portrait: { label: "Vertical 4:5", width: 1080, height: 1350 },
  square: { label: "Cuadrado 1:1", width: 1080, height: 1080 },
  story: { label: "Historia 9:16", width: 1080, height: 1920 },
  landscape: { label: "Horizontal 1.91:1", width: 1080, height: 566 },
  "linkedin-square": { label: "LinkedIn cuadrado 1:1", width: 1200, height: 1200 },
  linkedin: { label: "LinkedIn horizontal 1.91:1", width: 1200, height: 628 },
  pinterest: { label: "Pinterest 2:3", width: 1000, height: 1500 },
  youtube: { label: "YouTube HD 16:9", width: 1280, height: 720 },
  "youtube-4k": { label: "YouTube 4K 16:9", width: 3840, height: 2160 },
} as const;
export type SocialFormat = keyof typeof socialFormats;
export const socialFormatSchema = z.custom<SocialFormat>((value) => typeof value === "string" && Object.hasOwn(socialFormats, value));
export const socialLanguageSchema = z.enum(SUPPORTED_LANGUAGES.map(({ code }) => code) as [string, ...string[]]);
export const socialPaletteSchema = z.enum(["navy-lime", "navy-white"]);
export const socialContentSchema = z.object({
  caption: z.string().trim().min(1).max(2500),
  slides: z.array(z.object({
    title: z.string().trim().min(1).max(90),
    body: z.string().trim().min(1).max(220),
  }).strict()).min(1).max(12),
}).strict().superRefine(({ slides }, ctx) => {
  const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase().replace(new RegExp("[\\p{P}\\p{Z}]+", "gu"), "");
  for (const field of ["title", "body"] as const) {
    if (new Set(slides.map(slide => normalize(slide[field]))).size !== slides.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["slides"], message: "Cada pieza debe tener su propio título y texto." });
    }
  }
});
export type SocialContent = z.infer<typeof socialContentSchema>;
export const socialPayloadSchema = socialContentSchema.innerType().extend({
  sourceNotes: z.string().max(20_000).default(""),
});
export type SocialPayload = z.infer<typeof socialPayloadSchema>;
export type SocialRevision = {
  version: number;
  title: string;
  format: string;
  palette: string;
  payload: unknown;
  previewUrl: string | null;
  packageUrl: string | null;
  createdAt: string;
  createdBy: string;
};
