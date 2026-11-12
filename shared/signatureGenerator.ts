import { signatureTemplates } from "./signatureTemplates";

export const signatureDescriptions = [
  "Blanca · § verde · barra navy",
  "Blanca · fotografía · barra navy",
  "Columna navy · § · líneas",
  "Columna navy · § · barra verde",
  "Columna navy · foto · líneas",
  "Columna navy · foto · barra verde",
  "Navy inferior · foto grande",
  "Navy completa · foto",
  "Navy · § · redes a la derecha",
  "Navy · foto · barra verde completa",
  "Navy · § · barra verde completa",
  "Premium · foto a color · iconos",
] as const;
// Catálogo editorial vigente. Las plantillas históricas siguen disponibles para abrir archivos
// guardados, pero el editor solo ofrece las dos variantes aprobadas por el despacho.
export const activeSignatureIds = ["03", "11"] as const;
export const activeSignatureDescriptions = {
  "03": "Blanca · columna navy · iconos",
  "11": "Navy · § · barra verde completa",
} as const;

export const signatureDefaults = {
  name: "Mario Saucedo Montemayor",
  role: "Socio director",
  phone: "+52 81 8335 2086",
  email: "info@santossaucedo.com",
  addr1: "Río Tamazunchale 205 Norte Col. del Valle,",
  addr2: "San Pedro Garza García, Nuevo León C.P. 66220, México.",
  tagline: "DERECHO LABORAL PARA EMPRESAS",
  since: "San Pedro Garza García · Desde 2010",
  linkedin: "https://www.linkedin.com/in/mario-saucedo-074a9361",
  facebook: "",
  web: "www.santossaucedo.com",
  instagram: "@mariosaucedom",
} as const;

export type SignatureData = Record<keyof typeof signatureDefaults, string>;
export const signatureIds = Object.keys(signatureTemplates).sort();
const templates = signatureTemplates as Record<string, string>;

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const bare = (s: string) => String(s || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
const full = (s: string) => { const v = String(s || "").trim(); return !v ? "" : /^https?:\/\//i.test(v) ? v : `https://${v}`; };
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function signaturePhotoSource(photo: string, assets: string, width: string, height: string) {
  const source = new URL(photo, assets);
  if (!/^\/media\/public\/media\//.test(source.pathname)) return source.toString();
  const endpoint = new URL("/api/signature-photo", source.origin);
  endpoint.searchParams.set("source", `${source.pathname}${source.search}`);
  endpoint.searchParams.set("width", width);
  endpoint.searchParams.set("height", height);
  return endpoint.toString();
}

export function normalizeSignatureData(input: Partial<Record<keyof SignatureData, unknown>>): SignatureData {
  const result = { ...signatureDefaults } as Record<keyof SignatureData, string>;
  for (const key of Object.keys(signatureDefaults) as Array<keyof SignatureData>) {
    const value = input[key];
    if (typeof value === "string") result[key] = value.trim().slice(0, 500);
  }
  return result;
}

export function createSignatureGenerator(options: { assetsUrl?: string; data?: Partial<SignatureData>; photo?: string | null } = {}) {
  let data = normalizeSignatureData(options.data || {});
  let photo = options.photo || null;
  let assets = options.assetsUrl || "/signatures/assets/";
  const swap = (html: string, oldText: string, newText: string) => {
    if (oldText === newText) return html;
    const re = new RegExp(`(<div style="[^"]*height:0\\.5px;background:#[0-9a-f]{6}"></div>\\n)?<(a|div) ([^>]*?)style="([^"]*)">${reEsc(esc(oldText))}</\\2>`, "g");
    return html.replace(re, (_m, underline, tag, attrs, style) => {
      const nextStyle = underline ? `${style};text-decoration:underline;text-decoration-thickness:0.5px;text-underline-offset:1.4px` : style;
      return `<${tag} ${attrs}style="${nextStyle}">${esc(newText)}</${tag}>`;
    });
  };
  const build = (id: string) => {
    let html = templates[id] || "";
    if (!html) return "";
    const d = data;
    if (photo) {
      let photoSource = String(photo);
      if (!/^(?:https?:|data:)/i.test(photoSource)) {
        try { photoSource = new URL(photoSource, assets).toString(); } catch { /* keep the validated path */ }
      }
      html = html.replace(/<img src="assets\/[^"]+\.(?:jpg|jpeg|png|webp|gif)" alt="Mario Saucedo Montemayor"([^>]*?)style="([^"]*)">/gi, (_m: string, a: string, st: string) => {
        const width = a.match(/\bwidth="([\d.]+)"/i)?.[1] || st.match(/\bwidth:([\d.]+)px/i)?.[1] || "1";
        const height = a.match(/\bheight="([\d.]+)"/i)?.[1] || st.match(/\bheight:([\d.]+)px/i)?.[1] || "1";
        let source = photoSource;
        try { source = signaturePhotoSource(photoSource, assets, width, height); } catch { /* Keep validated source if it cannot be normalized. */ }
        return `<img src="${esc(source)}" data-signature-photo="true" alt="${esc(d.name)}"${a}style="${st}object-fit:cover;object-position:center;">`;
      });
    }
    if (id === "12") {
      html = swap(html, bare(signatureDefaults.linkedin), bare(d.linkedin)).replace(`href="${signatureDefaults.linkedin}"`, `href="${esc(full(d.linkedin))}"`);
      html = swap(html, signatureDefaults.web, d.web || "").replace('href="https://www.santossaucedo.com"', `href="${esc(full(d.web))}"`);
      html = swap(html, signatureDefaults.instagram, d.instagram || "").replace('href="https://www.instagram.com/mariosaucedom"', `href="https://www.instagram.com/${esc((d.instagram || "").replace(/^@/, ""))}"`);
    }
    for (const key of ["addr2", "since", "name", "role", "phone", "email", "addr1", "tagline"] as const) html = swap(html, signatureDefaults[key], d[key] || "");
    html = html.split('alt="Mario Saucedo Montemayor"').join(`alt="${esc(d.name)}"`).split("· Mario Saucedo Montemayor</title>").join(`· ${esc(d.name)}</title>`);
    html = html.replace('href="tel:+528183352086"', `href="tel:${esc((d.phone || "").replace(/[^\d+]/g, ""))}"`).replace('href="mailto:info@santossaucedo.com"', `href="mailto:${esc(d.email)}"`);
    for (const [label, value] of [["LinkedIn", d.linkedin], ["Facebook", d.facebook]] as const) {
      if (id !== "12" && value && value.trim()) html = html.replace(new RegExp(`(<img src="assets/[^"]+" alt="${label}"[^>]*>)`), `<a href="${esc(full(value))}" target="_blank">$1</a>`);
    }
    const base = String(assets || "/signatures/assets/").replace(/\/$/, "") + "/";
    return html.split('src="assets/').join(`src="${base}`);
  };
  return {
    ids: signatureIds,
    descriptions: signatureDescriptions,
    defaults: signatureDefaults,
    getData: () => ({ ...data }),
    setData: (patch: Partial<SignatureData>) => { data = normalizeSignatureData({ ...data, ...patch }); },
    reset: () => { data = normalizeSignatureData({}); photo = null; },
    setPhoto: (value: string | null) => { photo = value || null; },
    getPhoto: () => photo,
    setAssetsUrl: (value: string) => { assets = value; },
    build,
    body: (id: string) => build(id).match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1].trim() || "",
  };
}

export function signatureDocument(id: string, data: Partial<SignatureData>, options: { assetsUrl?: string; photo?: string | null } = {}) {
  return createSignatureGenerator({ ...options, data }).build(id);
}
