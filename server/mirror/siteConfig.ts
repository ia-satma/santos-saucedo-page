import { db } from "../db";
import { siteConfig } from "@shared/schema";
import { getCmsContact } from "../cms/siteConfig";
export type ConfigMap = Record<
  string,
  { value: string; valueEs: string; type: string }
>;
export async function getConfigMap(): Promise<ConfigMap> {
  const [rows, contact] = await Promise.all([
    db.select().from(siteConfig),
    getCmsContact(),
  ]);
  const text = (value: unknown) => ({
    value: String(value || ""),
    valueEs: String(value || ""),
    type: "text",
  });
  const config: ConfigMap = {
    active_languages: text("es,en"),
    footer_firm: text("Santos & Saucedo"),
    site_url: text(
      process.env.PUBLIC_SITE_URL || "https://santos-saucedo.replit.app",
    ),
    footer_phone: text(contact.phone),
    footer_address: text(contact.address),
  };
  for (const row of rows) {
    if (!row.key.startsWith("editorial."))
      config[row.key] = {
        value: row.value || "",
        valueEs: row.valueEs || row.value || "",
        type: row.type || "text",
      };
  }
  return config;
}
export function cfg(
  config: ConfigMap,
  key: string,
  language: "en" | "es" = "es",
) {
  const row = config[key];
  return language === "es"
    ? row?.valueEs || row?.value || ""
    : row?.value || "";
}
