import { z } from "zod";
const httpsOrigin = z
  .string()
  .url()
  .refine((v) => {
    try {
      const u = new URL(v);
      return (
        u.protocol === "https:" &&
        !u.username &&
        !u.password &&
        u.pathname === "/" &&
        !u.search &&
        !u.hash
      );
    } catch {
      return false;
    }
  }, "Use el origen HTTPS sin ruta, consulta ni fragmento.");
export const integrationSchema = z
  .object({
    siteUrl: httpsOrigin,
    ga4: z
      .object({
        enabled: z.boolean(),
        measurementId: z
          .string()
          .trim()
          .max(40)
          .regex(
            /^(?:G-[A-Z0-9]+)?$/,
            "Use el ID G- de GA4, no el código de script.",
          ),
      })
      .strict(),
    searchConsole: z
      .object({
        verification: z
          .string()
          .trim()
          .max(500)
          .regex(
            /^[A-Za-z0-9_-]*$/,
            "Pegue únicamente el token de verificación, sin HTML.",
          ),
      })
      .strict(),
    leadinfo: z
      .object({
        enabled: z.boolean(),
        siteId: z
          .string()
          .trim()
          .max(160)
          .regex(/^(?:[A-Za-z0-9_-]{4,160})?$/),
        disclosureReviewed: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.ga4.enabled && !v.ga4.measurementId)
      c.addIssue({
        code: "custom",
        path: ["ga4", "measurementId"],
        message: "Falta el ID de GA4.",
      });
    if (
      v.leadinfo.enabled &&
      (!v.leadinfo.siteId || !v.leadinfo.disclosureReviewed)
    )
      c.addIssue({
        code: "custom",
        path: ["leadinfo"],
        message:
          "Complete el Site ID y confirme la revisión del aviso antes de activar.",
      });
  });
const copy = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(1200),
    acceptAll: z.string().min(1).max(120),
    rejectOptional: z.string().min(1).max(120),
    configure: z.string().min(1).max(120),
    save: z.string().min(1).max(120),
    close: z.string().min(1).max(120),
    essential: z.string().max(120),
    essentialDescription: z.string().max(800),
    analytics: z.string().max(120),
    analyticsDescription: z.string().max(800),
    external: z.string().max(120),
    externalDescription: z.string().max(800),
    leadinfo: z.string().max(120),
    leadinfoDescription: z.string().max(800),
    policy: z.string().max(120),
  })
  .strict();
export const consentSchema = z
  .object({
    enabled: z.boolean(),
    version: z.string().trim().min(1).max(40),
    validityMonths: z.number().int().min(1).max(12),
    labels: z.record(copy),
  })
  .strict();
export type SiteIntegrations = z.infer<typeof integrationSchema>;
export type ConsentSettings = z.infer<typeof consentSchema>;
export function consentPolicyKey(
  settings: ConsentSettings,
  integrations: SiteIntegrations,
) {
  return JSON.stringify([
    settings.version,
    integrations.ga4.enabled ? integrations.ga4.measurementId : "",
    integrations.leadinfo.enabled ? integrations.leadinfo.siteId : "",
  ]);
}
