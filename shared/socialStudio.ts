import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./constants";
import { MAX_EDITORIAL_NOTES_CHARACTERS } from "./editorialSources";

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
export const socialPalettes = ["navy-lime", "navy-white", "ivory", "graphite"] as const;
export const socialPaletteRequests = ["auto", "mixed", ...socialPalettes] as const;
export const socialDesignDirections = ["varied", "editorial", "typographic", "photographic", "educational"] as const;
export const socialBackgrounds = ["auto", "solid", "tonal", "glow"] as const;
export const socialPaletteSchema = z.enum(socialPalettes);
export const socialPaletteRequestSchema = z.enum(socialPaletteRequests);
export const socialDesignDirectionSchema = z.enum(socialDesignDirections);
export const socialBackgroundSchema = z.enum(socialBackgrounds);
export type SocialPalette = z.infer<typeof socialPaletteSchema>;
export type SocialPaletteRequest = z.infer<typeof socialPaletteRequestSchema>;
export type SocialDesignDirection = z.infer<typeof socialDesignDirectionSchema>;
export type SocialBackground = z.infer<typeof socialBackgroundSchema>;

export const SOCIAL_NETWORKS = ["instagram", "facebook", "linkedin", "x", "threads", "tiktok"] as const;
export type SocialNetwork = typeof SOCIAL_NETWORKS[number];
export const socialCopyLimits: Record<SocialNetwork, number> = {
  instagram: 2200, facebook: 2200, linkedin: 3000, x: 280, threads: 500, tiktok: 2200,
};
export const socialCopiesSchema = z.object({
  instagram: z.string().trim().min(1).max(socialCopyLimits.instagram),
  facebook: z.string().trim().min(1).max(socialCopyLimits.facebook),
  linkedin: z.string().trim().min(1).max(socialCopyLimits.linkedin),
  x: z.string().trim().min(1).max(socialCopyLimits.x),
  threads: z.string().trim().min(1).max(socialCopyLimits.threads),
  tiktok: z.string().trim().min(1).max(socialCopyLimits.tiktok),
}).strict();
export type SocialCopies = z.infer<typeof socialCopiesSchema>;

const uuidPart = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
export const socialInputImageUrlSchema = z.string().regex(new RegExp(`^private:studio/social-input-${uuidPart}\\.webp$`));
export const socialImageRefSchema = z.string().regex(new RegExp(`^private:studio/social-(?:input|ai)-${uuidPart}\\.webp$`));
export const socialSupportImageSchema = z.object({
  url: socialInputImageUrlSchema,
  name: z.string().trim().min(1).max(180),
}).strict();
export type SocialSupportImage = z.infer<typeof socialSupportImageSchema>;
export const socialReferenceDocumentSchema = z.object({
  url: z.string().regex(/^private:presentations\/[a-f0-9]{32}\.[a-z0-9]{1,5}$/),
  name: z.string().trim().min(1).max(180),
}).strict();

export const socialDesignSchema = z.object({
  direction: socialDesignDirectionSchema,
  background: socialBackgroundSchema,
  requestedPalette: socialPaletteRequestSchema,
  illustrate: z.boolean(),
  webSearch: z.boolean(),
}).strict();
export type SocialDesign = z.infer<typeof socialDesignSchema>;

const slideDesignSchema = z.object({
  direction: socialDesignDirectionSchema.optional(),
  palette: socialPaletteSchema.optional(),
  background: socialBackgroundSchema.optional(),
}).strict();

export const socialContentSchema = z.object({
  caption: z.string().trim().min(1).max(2500),
  copies: socialCopiesSchema.optional(),
  slides: z.array(z.object({
    title: z.string().trim().min(1).max(90),
    body: z.string().trim().min(1).max(220),
    design: slideDesignSchema.optional(),
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
  sourceNotes: z.string().max(MAX_EDITORIAL_NOTES_CHARACTERS).default(""),
  design: socialDesignSchema.optional(),
  supportImages: z.array(socialSupportImageSchema).max(10).optional(),
  documents: z.array(socialReferenceDocumentSchema).max(20).optional(),
  imageRefs: z.array(socialImageRefSchema.nullable()).max(12).optional(),
  sources: z.array(z.string().url().max(2048).regex(/^https?:\/\//i)).max(12).optional(),
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
