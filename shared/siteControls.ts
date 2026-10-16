import { z } from "zod";

export const siteLink = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value || /[\s\\<>"'\u0000-\u001f\u007f]/.test(value)) return false;
    try {
      if (value.startsWith("/") && !value.startsWith("//")) {
        const decoded = decodeURIComponent(value);
        return !/[\\\u0000-\u001f]/.test(decoded) && !decoded.startsWith("//");
      }
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use una ruta del sitio o una URL HTTPS válida.");
const labels = z
  .record(z.string().max(120))
  .refine(
    (v) => Object.values(v).some((s) => s.trim()),
    "Escriba al menos una etiqueta.",
  );
const entry = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    href: siteLink,
    labels,
    visible: z.boolean(),
    order: z.number().int().min(0).max(1000),
  })
  .strict();
export const navigationSchema = z
  .object({
    header: z
      .object({
        enabled: z.boolean(),
        searchEnabled: z.boolean(),
        phoneEnabled: z.boolean(),
        languageEnabled: z.boolean(),
      })
      .strict(),
    footer: z
      .object({
        enabled: z.boolean(),
        officeEnabled: z.boolean(),
        linksEnabled: z.boolean(),
        legalEnabled: z.boolean(),
        languagesEnabled: z.boolean(),
        adminEnabled: z.boolean(),
      })
      .strict(),
    items: z.array(entry.extend({ children: z.array(entry).max(20) })).max(20),
    footerItems: z.array(entry).max(30),
    legalItems: z.array(entry).max(15),
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const [key, items] of Object.entries({
      items: value.items,
      footerItems: value.footerItems,
      legalItems: value.legalItems,
    })) {
      const ids = items.map((i) => i.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Hay identificadores repetidos.",
        });
    }
    value.items.forEach((item, i) => {
      if (new Set(item.children.map((c) => c.id)).size !== item.children.length)
        ctx.addIssue({
          code: "custom",
          path: ["items", i, "children"],
          message: "Hay submenús repetidos.",
        });
    });
  });
export type SiteNavigation = z.infer<typeof navigationSchema>;
export type NavigationEntry = z.infer<typeof entry>;
export const formControlsSchema = z
  .object({
    contact: z
      .object({
        enabled: z.boolean(),
        disabledMessage: z.record(z.string().max(1000)),
      })
      .strict(),
    newsletter: z
      .object({
        enabled: z.boolean(),
        disabledMessage: z.record(z.string().max(1000)),
      })
      .strict(),
    careers: z
      .object({
        enabled: z.boolean(),
        disabledMessage: z.record(z.string().max(1000)),
        labels: z.record(
          z
            .object({
              title: z.string().max(200),
              name: z.string().max(120),
              email: z.string().max(120),
              phone: z.string().max(120),
              interest: z.string().max(120),
              message: z.string().max(120),
              cv: z.string().max(300),
              consent: z.string().max(1000),
              submit: z.string().max(120),
              sending: z.string().max(120),
              success: z.string().max(1000),
              error: z.string().max(1000),
            })
            .strict(),
        ),
      })
      .strict(),
    unsubscribe: z.record(
      z
        .object({
          title: z.string().max(200),
          body: z.string().max(1000),
          submit: z.string().max(120),
          success: z.string().max(1000),
          error: z.string().max(1000),
        })
        .strict(),
    ),
  })
  .strict();
