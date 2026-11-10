import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowTopRightIcon, CodeIcon, CopyIcon, DownloadIcon, ImageIcon, PlusIcon, ResetIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import html2canvas from "html2canvas";
import { adminApiRequest, readAdminJson, useAdminAuth } from "@/lib/adminAuth";
import { uploadAdminMedia } from "@/lib/adminMediaUpload";
import { queryClient } from "@/lib/queryClient";
import { createSignatureGenerator, signatureDefaults, signatureDescriptions, signatureIds, type SignatureData } from "@shared/signatureGenerator";

type SavedSignature = { id: string; label: string; templateId: string; data: SignatureData; photoUrl: string | null; updatedAt: string | null; downloadUrl: string };
type FormState = { label: string; templateId: string; data: SignatureData; photoUrl: string | null };
const initialForm = (): FormState => ({ label: "Firma nueva", templateId: "01", data: { ...signatureDefaults }, photoUrl: null });
const fields: Array<[keyof SignatureData, string, string]> = [
  ["name", "Nombre", "Nombre completo"], ["role", "Cargo", "Cargo o puesto"], ["phone", "Teléfono", "+52 81 8335 2086"], ["email", "Correo", "correo@dominio.com"],
  ["addr1", "Dirección · línea 1", "Dirección"], ["addr2", "Dirección · línea 2", "Ciudad y código postal"], ["tagline", "Lema", "DERECHO LABORAL PARA EMPRESAS"], ["since", "Ubicación · año", "San Pedro Garza García · Desde 2010"],
  ["linkedin", "URL de LinkedIn", "https://…"], ["facebook", "URL de Facebook", "https://…"], ["web", "Sitio web", "www.santossaucedo.com"], ["instagram", "Instagram", "@usuario"],
];
const groups = [
  { label: "Persona", keys: ["name", "role"] as Array<keyof SignatureData> },
  { label: "Contacto", keys: ["phone", "email"] as Array<keyof SignatureData> },
  { label: "Dirección", keys: ["addr1", "addr2"] as Array<keyof SignatureData> },
  { label: "Barra inferior", keys: ["tagline", "since"] as Array<keyof SignatureData> },
  { label: "Redes sociales", keys: ["linkedin", "facebook", "web", "instagram"] as Array<keyof SignatureData> },
];
function downloadBlob(html: string, name: string) { const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function copyRich(html: string) { const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || html; if (navigator.clipboard && "ClipboardItem" in window) await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([body], { type: "text/html" }), "text/plain": new Blob([body.replace(/<[^>]+>/g, " ")], { type: "text/plain" }) })]); else await navigator.clipboard.writeText(body); }
function blobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer una imagen."));
    reader.readAsDataURL(blob);
  });
}
async function inlineSignatureImages(bodyHtml: string) {
  const parsed = new DOMParser().parseFromString(`<div id="signature-export-root">${bodyHtml}</div>`, "text/html");
  const images = Array.from(parsed.querySelectorAll("#signature-export-root img"));
  await Promise.all(images.map(async (image) => {
    const source = image.getAttribute("src");
    if (!source || source.startsWith("data:")) return;
    try {
      const response = await fetch(new URL(source, window.location.href));
      if (response.ok) image.setAttribute("src", await blobAsDataUrl(await response.blob()));
    } catch {
      // Keep the source URL when an optional image cannot be fetched.
    }
  }));
  return parsed.querySelector("#signature-export-root")?.innerHTML || bodyHtml;
}
async function cropSignaturePhotos(root: HTMLElement) {
  const photos = Array.from(root.querySelectorAll<HTMLImageElement>('img[data-signature-photo="true"]'));
  await Promise.all(photos.map(async (image) => {
    try {
      if (!image.complete) await image.decode();
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      const targetWidth = image.getBoundingClientRect().width;
      const targetHeight = image.getBoundingClientRect().height;
      if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) return;
      const targetRatio = targetWidth / targetHeight;
      const sourceRatio = sourceWidth / sourceHeight;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      let sourceX = 0;
      let sourceY = 0;
      if (sourceRatio > targetRatio) {
        cropWidth = sourceHeight * targetRatio;
        sourceX = (sourceWidth - cropWidth) / 2;
      } else if (sourceRatio < targetRatio) {
        cropHeight = sourceWidth / targetRatio;
        sourceY = (sourceHeight - cropHeight) / 2;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(cropWidth));
      canvas.height = Math.max(1, Math.round(cropHeight));
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      image.src = canvas.toDataURL("image/png");
      if (!image.complete) await image.decode();
      image.style.objectFit = "fill";
      image.style.objectPosition = "center";
    } catch {
      // Keep the inlined source if the browser cannot decode an optional photo.
    }
  }));
}
async function downloadSignaturePng(html: string, name: string, width: number, height: number) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || html;
  const bodyWithImages = await inlineSignatureImages(body);
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;height:${height}px;overflow:hidden;background:#fff;pointer-events:none;`;
  host.innerHTML = bodyWithImages;
  document.body.appendChild(host);
  try {
    const target = host.firstElementChild as HTMLElement | null;
    if (!target) throw new Error("No se pudo preparar la firma para exportación.");
    await cropSignaturePhotos(target);
    await document.fonts?.ready;
    const canvas = await html2canvas(target, { backgroundColor: "#fff", width, height, scale: 2, useCORS: true, allowTaint: false, imageTimeout: 15000, logging: false });
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("No se pudo generar el PNG.");
    const downloadUrl = URL.createObjectURL(png);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } finally {
    host.remove();
  }
}

export default function AdminSignatures() {
  const auth = useAdminAuth();
  const [form, setForm] = useState<FormState>(() => initialForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number | null>(null);
  const [codeOpen, setCodeOpen] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoProgressTimer = useRef<number | null>(null);
  const query = useQuery<SavedSignature[]>({ queryKey: ["/api/admin/signatures"], queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/signatures"), "No se pudieron cargar las firmas.") });
  const generator = useMemo(() => createSignatureGenerator({ assetsUrl: `${window.location.origin}/signatures/assets/`, data: form.data, photo: form.photoUrl }), [form.data, form.photoUrl]);
  const html = generator.build(form.templateId);
  const fieldMap = useMemo(() => new Map(fields.map((field) => [field[0], field])), []);
  const updateData = (key: keyof SignatureData, value: string) => setForm((old) => ({ ...old, data: { ...old.data, [key]: value } }));
  const reset = () => { setEditingId(null); setForm(initialForm()); setCodeOpen(null); setNotice(""); setError(""); };
  const edit = (item: SavedSignature) => { setEditingId(item.id); setForm({ label: item.label, templateId: item.templateId, data: { ...signatureDefaults, ...item.data }, photoUrl: item.photoUrl }); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const save = async () => {
    setBusy(true); setError(""); setNotice("");
    try { const method = editingId ? "PUT" : "POST"; const url = editingId ? `/api/admin/signatures/${editingId}` : "/api/admin/signatures"; const saved = await readAdminJson<SavedSignature>(await adminApiRequest(method, url, form), "No se pudo guardar la firma."); setEditingId(saved.id); setNotice(`Firma guardada para las 12 plantillas. Descarga actual: Firma ${saved.templateId}.`); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] }); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar esta firma y su HTML guardado?")) return;
    setBusy(true); setError("");
    try { const response = await adminApiRequest("DELETE", `/api/admin/signatures/${id}`); if (!response.ok) throw new Error((await response.json()).error || "No se pudo eliminar."); if (editingId === id) reset(); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] }); setNotice("Firma eliminada."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const uploadPhoto = async (file: File) => {
    if (photoProgressTimer.current !== null) window.clearTimeout(photoProgressTimer.current);
    setBusy(true); setPhotoUploading(true); setPhotoUploadProgress(0); setError(""); setNotice("");
    try {
      const media = await uploadAdminMedia(file, { onProgress: (progress) => setPhotoUploadProgress(progress) });
      setForm((old) => ({ ...old, photoUrl: media.path }));
      setNotice("Fotografía guardada en la biblioteca de medios.");
      setPhotoUploadProgress(100);
      photoProgressTimer.current = window.setTimeout(() => { setPhotoUploadProgress(null); photoProgressTimer.current = null; }, 1200);
    } catch (e) {
      setPhotoUploadProgress(null);
      setError((e as Error).message);
    } finally {
      setBusy(false); setPhotoUploading(false); if (photoInput.current) photoInput.current.value = "";
    }
  };
  const actionFor = (id: string, action: "html" | "rich" | "download" | "image") => {
    const sourceDocument = generator.build(id);
    if (action === "html") void navigator.clipboard.writeText(sourceDocument).then(() => setNotice(`HTML de la firma ${id} copiado.`));
    if (action === "rich") void copyRich(sourceDocument).then(() => setNotice(`Firma ${id} copiada.`));
    if (action === "download") downloadBlob(sourceDocument, `firma-${id}.html`);
    if (action === "image") void downloadSignaturePng(sourceDocument, `firma-${id}.png`, id === "12" ? 640 : 600, id === "12" ? 370 : 250).then(() => setNotice(`Imagen PNG de la firma ${id} descargada.`)).catch((error: Error) => setError(error.message));
  };
  if (!auth.isLoading && !auth.isAuthenticated) return null;

  return (
    <main className="signature-editor-page">
      <aside className="signature-editor-sidebar">
        <div className="signature-sidebar-heading">
          <p className="signature-kicker">Santos Saucedo · Firmas</p>
          <h1>Datos de la firma</h1>
          <p>Los cambios se aplican a las 12 plantillas.</p>
        </div>
        <div className="signature-sidebar-scroll">
          {groups.map((group) => (
            <fieldset className="signature-field-group" key={group.label}>
              <legend>{group.label}</legend>
              {group.keys.map((key) => {
                const field = fieldMap.get(key)!;
                return <label key={key} className="signature-field-label"><span>{field[1]}</span><input value={form.data[key]} placeholder={field[2]} onChange={(event) => updateData(key, event.target.value)} /></label>;
              })}
            </fieldset>
          ))}
          <div className="signature-photo-control">
            <p>Fotografía</p>
            <input ref={photoInput} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); }} />
            <button type="button" disabled={busy} onClick={() => photoInput.current?.click()}><UploadIcon /> {photoUploading ? "Subiendo fotografía…" : form.photoUrl ? "Cambiar fotografía" : "Subir fotografía"}</button>
            {photoUploadProgress !== null && <div className="signature-upload-progress" role="status" aria-live="polite">
              <div className="signature-upload-progress-heading"><span>{photoUploadProgress < 100 ? "Subiendo fotografía…" : "Fotografía lista"}</span><strong>{photoUploadProgress}%</strong></div>
              <div className="signature-upload-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={photoUploadProgress} aria-label="Progreso de carga de fotografía"><span className="signature-upload-progress-fill" style={{ width: `${photoUploadProgress}%` }} /></div>
              <p>Guardando en la biblioteca de medios</p>
            </div>}
            {form.photoUrl && <button type="button" className="signature-remove-photo" onClick={() => setForm({ ...form, photoUrl: null })}>Quitar fotografía</button>}
          </div>
        </div>
        <div className="signature-sidebar-footer"><span>Datos originales</span><button type="button" onClick={reset}><ResetIcon /> Restablecer</button></div>
      </aside>

      <section className="signature-editor-catalog">
        <header className="signature-catalog-header">
          <div><p className="signature-catalog-eyebrow">Editor de firmas</p><h2>{form.data.name || "Nueva firma"}</h2><p>12 plantillas · 600 × 250 px <span>(firma 12: 640 × 370)</span> · imágenes a 2x</p><p className="signature-catalog-save-help">Los datos guardados alimentan las 12 plantillas. Elige una variante para editarla, copiarla o descargarla.</p></div>
          <div className="signature-catalog-actions"><button type="button" className="signature-outline-action" onClick={reset}><PlusIcon /> Nueva</button><button type="button" className="signature-save-action" disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : editingId ? "Actualizar firma" : "Guardar firma"}</button></div>
        </header>
        {notice && <div role="status" className="signature-notice">{notice}</div>}
        {error && <div role="alert" className="signature-error">{error}</div>}
        {(query.data || []).length > 0 && <section className="signature-saved-strip" aria-label="Firmas guardadas"><div className="signature-section-heading"><div><p className="signature-catalog-eyebrow">Versiones guardadas</p><h3>Firmas listas para usar</h3></div><span>{query.data?.length} guardadas</span></div><div className="signature-version-list">{(query.data || []).map((item) => <div className={`signature-version-row ${editingId === item.id ? "is-active" : ""}`} key={item.id}><button type="button" aria-label={`Editar ${item.label}`} title={`Editar ${item.label}`} onClick={() => edit(item)}><strong>{item.label}</strong><span>Editar datos comunes · descarga Firma {item.templateId} · {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-MX") : ""}</span></button><button type="button" aria-label={`Descargar ${item.label}`} onClick={async () => { const response = await adminApiRequest("GET", item.downloadUrl); if (!response.ok) return setError("No se pudo descargar la firma."); downloadBlob(await response.text(), `${item.label.replace(/[^a-z0-9]+/gi, "-")}.html`); }}><DownloadIcon /></button><button type="button" aria-label={`Eliminar ${item.label}`} onClick={() => void remove(item.id)}><TrashIcon /></button></div>)}</div></section>}
        <section className="signature-template-list" aria-label="Plantillas de firma">
          {signatureIds.map((id, index) => {
            const templateHtml = generator.build(id);
            const isSelected = form.templateId === id;
            const isCodeOpen = codeOpen === id;
            return <article className={`signature-template-card ${isSelected ? "is-selected" : ""}`} key={id}>
              <header className="signature-template-card-header"><button type="button" className="signature-template-title" aria-pressed={isSelected} onClick={() => setForm((old) => ({ ...old, templateId: id }))}><span>Firma {id}</span><small>{signatureDescriptions[index]}</small>{isSelected && <em>Seleccionada para guardar y descargar</em>}</button><button type="button" className="signature-open-template" onClick={() => setForm((old) => ({ ...old, templateId: id }))}>Abrir <ArrowTopRightIcon /></button></header>
              <div className="signature-template-preview"><iframe title={`Vista previa de Firma ${id}`} sandbox="allow-same-origin" srcDoc={templateHtml} className={id === "12" ? "signature-iframe signature-iframe-tall" : "signature-iframe"} /></div>
              <footer className="signature-template-card-footer"><button type="button" className="signature-copy-html" onClick={() => actionFor(id, "html")}><CodeIcon /> Copiar código HTML</button><button type="button" className="signature-copy-rich" onClick={() => actionFor(id, "rich")}><CopyIcon /> Copiar firma</button><button type="button" className="signature-download" onClick={() => actionFor(id, "download")}><DownloadIcon /> Descargar .html</button><button type="button" className="signature-download signature-image-download" onClick={() => actionFor(id, "image")}><ImageIcon /> Descargar PNG</button><button type="button" className="signature-view-code" onClick={() => setCodeOpen(isCodeOpen ? null : id)}>{isCodeOpen ? "Ocultar código" : "Ver código"}</button></footer>
              {isCodeOpen && <pre className="signature-code-block"><code>{templateHtml}</code></pre>}
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
