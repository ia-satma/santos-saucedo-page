import { getCmsIntegrations } from "../cms/siteConfig";
export async function injectSiteMetadata(html: string) {
  const settings = await getCmsIntegrations();
  // A validated token is emitted in the original HTML so Search Console can verify without JavaScript.
  const token = settings.searchConsole.verification;
  const tag = token
    ? `<meta name="google-site-verification" content="${token}">`
    : "";
  return html
    .split("https://www.santossaucedo.com")
    .join(settings.siteUrl.replace(/\/$/, ""))
    .replace(/<meta\s+name=["']google-site-verification["'][^>]*>/gi, "")
    .replace("</head>", `${tag}</head>`);
}
