import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowTopRightIcon, CodeIcon, CopyIcon, DownloadIcon, Pencil1Icon, PlusIcon, ResetIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
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

export default function AdminSignatures() {
  const auth = useAdminAuth();
  const [form, setForm] = useState<FormState>(() => initialForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeOpen, setCodeOpen] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const query = useQuery<SavedSignature[]>({ queryKey: ["/api/admin/signatures"], queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/signatures"), "No se pudieron cargar las firmas.") });
  const generator = useMemo(() => createSignatureGenerator({ assetsUrl: `${window.location.origin}/signatures/assets/`, data: form.data, photo: form.photoUrl }), [form.data, form.photoUrl]);
  const html = generator.build(form.templateId);
  const fieldMap = useMemo(() => new Map(fields.map((field) => [field[0], field])), []);
  const updateData = (key: keyof SignatureData, value: string) => setForm((old) => ({ ...old, data: { ...old.data, [key]: value } }));
  const reset = () => { setEditingId(null); setForm(initialForm()); setCodeOpen(null); setNotice(""); setError(""); };
  const edit = (item: SavedSignature) => { setEditingId(item.id); setForm({ label: item.label, templateId: item.templateId, data: { ...signatureDefaults, ...item.data }, photoUrl: item.photoUrl }); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const save = async () => {
    setBusy(true); setError(""); setNotice("");
    try { const method = editingId ? "PUT" : "POST"; const url = editingId ? `/api/admin/signatures/${editingId}` : "/api/admin/signatures"; const saved = await readAdminJson<SavedSignature>(await adminApiRequest(method, url, form), "No se pudo guardar la firma."); setEditingId(saved.id); setNotice("Firma guardada en App Storage."); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] }); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar esta firma y su HTML guardado?")) return;
    setBusy(true); setError("");
    try { const response = await adminApiRequest("DELETE", `/api/admin/signatures/${id}`); if (!response.ok) throw new Error((await response.json()).error || "No se pudo eliminar."); if (editingId === id) reset(); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] }); setNotice("Firma eliminada."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const uploadPhoto = async (file: File) => {
    setBusy(true); setError("");
    try { const media = await uploadAdminMedia(file); setForm((old) => ({ ...old, photoUrl: media.path })); setNotice("Fotografía guardada en la biblioteca de medios."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); if (photoInput.current) photoInput.current.value = ""; }
  };
  const actionFor = (id: string, action: "html" | "rich" | "download") => {
    const document = generator.build(id);
    if (action === "html") void navigator.clipboard.writeText(document).then(() => setNotice(`HTML de la firma ${id} copiado.`));
    if (action === "rich") void copyRich(document).then(() => setNotice(`Firma ${id} copiada.`));
    if (action === "download") downloadBlob(document, `firma-${id}.html`);
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
            <button type="button" disabled={busy} onClick={() => photoInput.current?.click()}><UploadIcon /> {form.photoUrl ? "Cambiar fotografía" : "Subir fotografía"}</button>
            {form.photoUrl && <button type="button" className="signature-remove-photo" onClick={() => setForm({ ...form, photoUrl: null })}>Quitar fotografía</button>}
          </div>
        </div>
        <div className="signature-sidebar-footer"><span>Datos originales</span><button type="button" onClick={reset}><ResetIcon /> Restablecer</button></div>
      </aside>

      <section className="signature-editor-catalog">
        <header className="signature-catalog-header">
          <div><p className="signature-catalog-eyebrow">Editor de firmas</p><h2>{form.data.name || "Nueva firma"}</h2><p>12 plantillas · 600 × 250 px <span>(firma 12: 640 × 370)</span> · imágenes a 2x</p></div>
          <div className="signature-catalog-actions"><button type="button" className="signature-outline-action" onClick={reset}><PlusIcon /> Nueva</button><button type="button" className="signature-save-action" disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : editingId ? "Actualizar firma" : "Guardar firma"}</button></div>
        </header>
        {notice && <div role="status" className="signature-notice">{notice}</div>}
        {error && <div role="alert" className="signature-error">{error}</div>}
        {(query.data || []).length > 0 && <section className="signature-saved-strip" aria-label="Firmas guardadas"><div className="signature-section-heading"><div><p className="signature-catalog-eyebrow">Versiones guardadas</p><h3>Firmas listas para usar</h3></div><span>{query.data?.length} guardadas</span></div><div className="signature-version-list">{(query.data || []).map((item) => <div className={`signature-version-row ${editingId === item.id ? "is-active" : ""}`} key={item.id}><button type="button" onClick={() => edit(item)}><strong>{item.label}</strong><span>Plantilla {item.templateId} · {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-MX") : ""}</span></button><button type="button" aria-label={`Descargar ${item.label}`} onClick={async () => { const response = await adminApiRequest("GET", item.downloadUrl); if (!response.ok) return setError("No se pudo descargar la firma."); downloadBlob(await response.text(), `${item.label.replace(/[^a-z0-9]+/gi, "-")}.html`); }}><DownloadIcon /></button><button type="button" aria-label={`Eliminar ${item.label}`} onClick={() => void remove(item.id)}><TrashIcon /></button></div>)}</div></section>}
        <section className="signature-template-list" aria-label="Plantillas de firma">
          {signatureIds.map((id, index) => {
            const templateHtml = generator.build(id);
            const isSelected = form.templateId === id;
            const isCodeOpen = codeOpen === id;
            return <article className={`signature-template-card ${isSelected ? "is-selected" : ""}`} key={id}>
              <header className="signature-template-card-header"><button type="button" className="signature-template-title" onClick={() => setForm((old) => ({ ...old, templateId: id }))}><span>Firma {id}</span><small>{signatureDescriptions[index]}</small></button><button type="button" className="signature-open-template" onClick={() => setForm((old) => ({ ...old, templateId: id }))}>Abrir <ArrowTopRightIcon /></button></header>
              <div className="signature-template-preview"><iframe title={`Vista previa de Firma ${id}`} sandbox="allow-same-origin" srcDoc={templateHtml} className={id === "12" ? "signature-iframe signature-iframe-tall" : "signature-iframe"} /></div>
              <footer className="signature-template-card-footer"><button type="button" className="signature-copy-html" onClick={() => actionFor(id, "html")}><CodeIcon /> Copiar código HTML</button><button type="button" className="signature-copy-rich" onClick={() => actionFor(id, "rich")}><CopyIcon /> Copiar firma</button><button type="button" className="signature-download" onClick={() => actionFor(id, "download")}><DownloadIcon /> Descargar .html</button><button type="button" className="signature-view-code" onClick={() => setCodeOpen(isCodeOpen ? null : id)}>{isCodeOpen ? "Ocultar código" : "Ver código"}</button></footer>
              {isCodeOpen && <pre className="signature-code-block"><code>{templateHtml}</code></pre>}
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
