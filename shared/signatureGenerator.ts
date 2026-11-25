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
// Las 11 variantes aprobadas siguen usando las plantillas originales para conservar sus diseños.
export const activeSignatureIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"] as const;
export const activeSignatureDescriptions = {
  "01": signatureDescriptions[0],
  "02": signatureDescriptions[1],
  "03": signatureDescriptions[2],
  "04": signatureDescriptions[3],
  "05": signatureDescriptions[4],
  "06": signatureDescriptions[5],
  "07": signatureDescriptions[6],
  "08": signatureDescriptions[7],
  "09": signatureDescriptions[8],
  "10": signatureDescriptions[9],
  "11": signatureDescriptions[10],
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
  const gmailBody = (id: string) => {
    const source = build(id);
    if (!source) return "";
    const d = data;
    const base = String(assets || "/signatures/assets/").replace(/\/$/, "") + "/";
    const imageByAlt = (alt: string) => source.match(new RegExp(`<img src="([^"]+)"[^>]*alt="${reEsc(alt)}"`, "i"))?.[1] || "";
    const logo = imageByAlt("Santos Saucedo") || `${base}1i1keubirs.png`;
    const photo = source.match(/<img src="([^"]+)"[^>]*data-signature-photo="true"/i)?.[1]
      || (["02", "05", "06", "07", "08", "10"].includes(id) ? imageByAlt(d.name) : "");
    const linkedinIcon = imageByAlt("LinkedIn");
    const facebookIcon = imageByAlt("Facebook");
    const dark = ["07", "08", "09", "10", "11"].includes(id);
    const navy = "#0b2850";
    const text = dark ? "#ffffff" : navy;
    const muted = dark ? "#cecfc1" : "#5b6675";
    const visual = photo
      ? `<img src="${esc(photo)}" alt="${esc(d.name)}" width="116" height="145" style="display:block;width:116px;height:145px;border:0;object-fit:cover;">`
      : `<img src="${esc(logo)}" alt="Santos Saucedo" width="160" height="45" style="display:block;width:160px;height:45px;border:0;">`;
    const social = [
      linkedinIcon ? (d.linkedin ? `<a href="${esc(full(d.linkedin))}" target="_blank" style="display:inline-block;margin-right:8px"><img src="${esc(linkedinIcon)}" alt="LinkedIn" width="18" height="16" style="display:block;border:0;width:18px;height:16px;"></a>` : `<img src="${esc(linkedinIcon)}" alt="LinkedIn" width="18" height="16" style="display:inline-block;margin-right:8px;border:0;width:18px;height:16px;">`) : "",
      facebookIcon ? (d.facebook ? `<a href="${esc(full(d.facebook))}" target="_blank" style="display:inline-block"><img src="${esc(facebookIcon)}" alt="Facebook" width="16" height="16" style="display:block;border:0;width:16px;height:16px;"></a>` : `<img src="${esc(facebookIcon)}" alt="Facebook" width="16" height="16" style="display:inline-block;border:0;width:16px;height:16px;">`) : "",
    ].join("");
    const phone = (d.phone || "").replace(/[^\d+]/g, "");
    if (id === "11") {
      const mark = source.match(/<img src="([^"]+)"[^>]*width="94" height="152"/i)?.[1] || `${base}1fmix7k1b1c.png`;
      const shadow = source.match(/<img src="([^"]+)"[^>]*width="134" height="198"/i)?.[1] || `${base}1xhtwt3k3t.png`;
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${navy};font-family:Arial,sans-serif;color:#ffffff;"><tr><td colspan="3" style="height:5px;line-height:5px;font-size:0;background-color:#bbf741;">&nbsp;</td></tr><tr><td width="145" valign="top" style="width:145px;padding:35px 12px 18px 25px;background-color:${navy};"><img src="${esc(mark)}" alt="" width="94" height="152" style="display:block;width:94px;height:152px;border:0;"></td><td width="350" valign="top" style="width:350px;padding:20px 8px 10px 0;background-color:${navy};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td></td><td align="right"><img src="${esc(logo)}" alt="Santos Saucedo" width="161" height="45" style="display:block;width:161px;height:45px;border:0;"></td></tr></table><div style="font-family:Georgia,serif;font-size:20px;line-height:24px;color:#ffffff;">${esc(d.name)}</div><div style="font-size:12px;line-height:18px;color:#cecfc1;">${esc(d.role)}</div><div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div><div style="font-size:11px;line-height:18px;color:#cecfc1;">Teléfono</div><a href="tel:${esc(phone)}" style="font-size:12px;line-height:18px;color:#ffffff;text-decoration:none;">${esc(d.phone)}</a><div style="font-size:11px;line-height:18px;color:#cecfc1;">E-mail</div><a href="mailto:${esc(d.email)}" style="font-size:12px;line-height:18px;color:#ffffff;text-decoration:none;">${esc(d.email)}</a><div style="font-size:11px;line-height:18px;color:#cecfc1;">Dirección</div><div style="font-size:12px;line-height:17px;color:#ffffff;">${esc(d.addr1)}<br>${esc(d.addr2)}</div></td><td width="105" valign="bottom" style="width:105px;padding:40px 10px 18px 0;background-color:${navy};"><img src="${esc(shadow)}" alt="" width="100" height="148" style="display:block;width:100px;height:148px;border:0;opacity:.24;"></td></tr><tr><td colspan="3" style="padding:7px 20px;background-color:#bbf741;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${navy};letter-spacing:.5px;">${esc(d.tagline)}</td><td align="right" style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${navy};letter-spacing:0;white-space:nowrap;">${esc(d.since)} ${social}</td></tr></table></td></tr></table>`;
    }
    const layouts: Record<string, { left?: string; side?: string; right?: string; logo?: string; footer: string; background: string; text: string; muted: string; photo?: boolean }> = {
      "01": { left: "wvaa8o17xb.png", right: "165gm6ro2d.png", logo: "f59p27ov9.png", footer: navy, background: "#ffffff", text: navy, muted: "#5b6675" },
      "02": { right: "165gm6ro2d.png", logo: "f59p27ov9.png", footer: navy, background: "#ffffff", text: navy, muted: "#5b6675", photo: true },
      "03": { left: "a3puj214b2.png", side: "1beo4k6hns.png", logo: "f59p27ov9.png", footer: "#ffffff", background: "#ffffff", text: navy, muted: "#5b6675" },
      "04": { left: "a3puj214b2.png", side: "1beo4k6hns.png", right: "bw70hu4tiw.png", logo: "f59p27ov9.png", footer: "#bbf741", background: "#ffffff", text: navy, muted: "#5b6675" },
      "05": { side: "1beo4k6hns.png", right: "1vbk97fq4o.png", logo: "f59p27ov9.png", footer: "#ffffff", background: "#ffffff", text: navy, muted: "#5b6675", photo: true },
      "06": { side: "1beo4k6hns.png", right: "1miru1bo72.png", logo: "f59p27ov9.png", footer: "#bbf741", background: "#ffffff", text: navy, muted: "#5b6675", photo: true },
      "07": { logo: "f59p27ov9.png", footer: "#bbf741", background: navy, text: "#ffffff", muted: "#cecfc1", photo: true },
      "08": { logo: "1i1keubirs.png", footer: "#bbf741", background: navy, text: "#ffffff", muted: "#cecfc1", photo: true },
      "09": { logo: "1i1keubirs.png", footer: "#bbf741", background: navy, text: "#ffffff", muted: "#cecfc1", photo: true },
      "10": { right: "1xhtwt3k3t.png", logo: "1i1keubirs.png", footer: "#bbf741", background: navy, text: "#ffffff", muted: "#cecfc1", photo: true },
    };
    const layout = layouts[id];
    if (layout) {
      const asset = (filename?: string) => filename ? source.match(new RegExp(`src="([^"]*${reEsc(filename)})"`, "i"))?.[1] || `${base}${filename}` : "";
      const visual = layout.photo && photo
        ? `<img src="${esc(photo)}" alt="${esc(d.name)}" width="112" height="145" style="display:block;width:112px;height:145px;border:0;object-fit:cover;">`
        : layout.left ? `<img src="${esc(asset(layout.left))}" alt="" width="100" height="145" style="display:block;width:100px;height:145px;border:0;">` : `<img src="${esc(asset(layout.logo))}" alt="Santos Saucedo" width="161" height="45" style="display:block;width:161px;height:45px;border:0;">`;
      const side = layout.side ? `<img src="${esc(asset(layout.side))}" alt="" width="110" height="220" style="display:block;width:110px;height:220px;border:0;">` : "";
      const right = layout.right ? `<img src="${esc(asset(layout.right))}" alt="" width="100" height="145" style="display:block;width:100px;height:145px;border:0;opacity:${layout.background === navy ? ".24" : "1"};">` : "";
      const brand = asset(layout.logo);
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${layout.background};font-family:Arial,sans-serif;color:${layout.text};"><tr><td colspan="3" style="height:5px;line-height:5px;font-size:0;background-color:${layout.footer};">&nbsp;</td></tr><tr><td width="130" valign="top" style="width:130px;padding:28px 12px 18px 20px;background-color:${layout.background};">${side || visual}</td><td width="355" valign="top" style="width:355px;padding:18px 8px 14px 0;background-color:${layout.background};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td></td><td align="right"><img src="${esc(brand)}" alt="Santos Saucedo" width="161" height="45" style="display:block;width:161px;height:45px;border:0;"></td></tr></table>${layout.photo && photo ? visual : ""}<div style="font-family:Georgia,serif;font-size:20px;line-height:24px;color:${layout.text};">${esc(d.name)}</div><div style="font-size:12px;line-height:18px;color:${layout.muted};">${esc(d.role)}</div><div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div><div style="font-size:11px;line-height:18px;color:${layout.muted};">Teléfono</div><a href="tel:${esc(phone)}" style="font-size:12px;line-height:18px;color:${layout.text};text-decoration:none;">${esc(d.phone)}</a><div style="font-size:11px;line-height:18px;color:${layout.muted};">E-mail</div><a href="mailto:${esc(d.email)}" style="font-size:12px;line-height:18px;color:${layout.text};text-decoration:none;">${esc(d.email)}</a><div style="font-size:11px;line-height:18px;color:${layout.muted};">Dirección</div><div style="font-size:12px;line-height:17px;color:${layout.text};">${esc(d.addr1)}<br>${esc(d.addr2)}</div></td><td width="115" valign="bottom" style="width:115px;padding:30px 10px 18px 0;background-color:${layout.background};">${right || social}</td></tr><tr><td colspan="3" style="padding:7px 20px;background-color:${layout.footer};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${layout.background === navy ? navy : "#ffffff"};letter-spacing:.5px;">${esc(d.tagline)}</td><td align="right" style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${layout.background === navy ? navy : "#ffffff"};letter-spacing:0;">${esc(d.since)} ${social}</td></tr></table></td></tr></table>`;
    }
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;background-color:${dark ? navy : "#ffffff"};font-family:Arial,sans-serif;color:${text};"><tr><td colspan="2" style="height:6px;line-height:6px;font-size:0;background-color:#bbf741;">&nbsp;</td></tr><tr><td width="150" valign="top" style="width:150px;padding:24px 16px 18px 24px;background-color:${dark ? navy : "#ffffff"};">${visual}<div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>${social}</td><td valign="top" style="padding:24px 22px 18px 8px;background-color:${dark ? navy : "#ffffff"};"><div style="font-family:Georgia,serif;font-size:21px;line-height:25px;color:${text};">${esc(d.name)}</div><div style="font-size:12px;line-height:18px;color:${muted};">${esc(d.role)}</div><div style="height:15px;line-height:15px;font-size:0;">&nbsp;</div><div style="font-size:11px;line-height:18px;color:${muted};">Teléfono</div><a href="tel:${esc(phone)}" style="font-size:12px;line-height:18px;color:${text};text-decoration:none;">${esc(d.phone)}</a><div style="font-size:11px;line-height:18px;color:${muted};">E-mail</div><a href="mailto:${esc(d.email)}" style="font-size:12px;line-height:18px;color:${text};text-decoration:none;">${esc(d.email)}</a><div style="font-size:11px;line-height:18px;color:${muted};">Dirección</div><div style="font-size:12px;line-height:17px;color:${text};">${esc(d.addr1)}<br>${esc(d.addr2)}</div></td></tr><tr><td colspan="2" style="padding:7px 24px;background-color:#bbf741;font-family:Georgia,serif;font-size:10px;line-height:14px;color:${navy};letter-spacing:.5px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${navy};letter-spacing:.5px;">${esc(d.tagline)}</td><td align="right" style="font-family:Georgia,serif;font-size:10px;line-height:14px;color:${navy};letter-spacing:0;">${esc(d.since)}</td></tr></table></td></tr></table>`;
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
    gmailBody,
    body: (id: string) => build(id).match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1].trim() || "",
  };
}

export function signatureDocument(id: string, data: Partial<SignatureData>, options: { assetsUrl?: string; photo?: string | null } = {}) {
  return createSignatureGenerator({ ...options, data }).build(id);
}
