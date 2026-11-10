import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, CopyIcon, Pencil1Icon, PlusIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import { adminApiRequest, readAdminJson, useAdminAuth } from "@/lib/adminAuth";
import { uploadAdminMedia } from "@/lib/adminMediaUpload";
import { queryClient } from "@/lib/queryClient";
import { createSignatureGenerator, signatureDefaults, signatureDescriptions, signatureIds, type SignatureData } from "@shared/signatureGenerator";

type SavedSignature = { id: string; label: string; templateId: string; data: SignatureData; photoUrl: string | null; updatedAt: string | null; downloadUrl: string };
type FormState = { label: string; templateId: string; data: SignatureData; photoUrl: string | null };
const initialForm = (): FormState => ({ label: "Firma nueva", templateId: "01", data: { ...signatureDefaults }, photoUrl: null });
const fields: Array<[keyof SignatureData, string, string]> = [
  ["name", "Nombre", "Nombre completo"], ["role", "Cargo", "Cargo o puesto"], ["phone", "Teléfono", "+52 81…"], ["email", "Correo", "correo@dominio.com"],
  ["addr1", "Dirección, línea 1", "Dirección"], ["addr2", "Dirección, línea 2", "Ciudad y código postal"], ["tagline", "Especialidad", "Texto de especialidad"], ["since", "Ubicación y año", "San Pedro · Desde 2010"],
  ["linkedin", "LinkedIn", "https://…"], ["facebook", "Facebook", "https://…"], ["web", "Sitio web", "www.santossaucedo.com"], ["instagram", "Instagram", "@usuario"],
];

function downloadBlob(html: string, name: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copyRich(html: string) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || html;
  if (navigator.clipboard && "ClipboardItem" in window) await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([body], { type: "text/html" }), "text/plain": new Blob([body.replace(/<[^>]+>/g, " ")], { type: "text/plain" }) })]);
  else await navigator.clipboard.writeText(body);
}

export default function AdminSignatures() {
  const auth = useAdminAuth();
  const [form, setForm] = useState<FormState>(() => initialForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const query = useQuery<SavedSignature[]>({ queryKey: ["/api/admin/signatures"], queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/signatures"), "No se pudieron cargar las firmas.") });
  const generator = useMemo(() => createSignatureGenerator({ assetsUrl: `${window.location.origin}/signatures/assets/`, data: form.data, photo: form.photoUrl }), [form.data, form.photoUrl]);
  const html = generator.build(form.templateId);
  const updateData = (key: keyof SignatureData, value: string) => setForm((old) => ({ ...old, data: { ...old.data, [key]: value } }));
  const reset = () => { setEditingId(null); setForm(initialForm()); setNotice(""); setError(""); };
  const edit = (item: SavedSignature) => { setEditingId(item.id); setForm({ label: item.label, templateId: item.templateId, data: { ...signatureDefaults, ...item.data }, photoUrl: item.photoUrl }); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const save = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      const method = editingId ? "PUT" : "POST"; const url = editingId ? `/api/admin/signatures/${editingId}` : "/api/admin/signatures";
      const saved = await readAdminJson<SavedSignature>(await adminApiRequest(method, url, form), "No se pudo guardar la firma.");
      setEditingId(saved.id); setNotice("Firma guardada en App Storage y lista para descargar."); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] });
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar esta firma y su HTML guardado?")) return;
    setBusy(true); setError("");
    try { const r = await adminApiRequest("DELETE", `/api/admin/signatures/${id}`); if (!r.ok) throw new Error((await r.json()).error || "No se pudo eliminar."); if (editingId === id) reset(); await queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures"] }); setNotice("Firma eliminada."); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const uploadPhoto = async (file: File) => {
    setBusy(true); setError("");
    try { const media = await uploadAdminMedia(file); setForm((old) => ({ ...old, photoUrl: media.path })); setNotice("Fotografía guardada en la biblioteca de medios."); } catch (e) { setError((e as Error).message); } finally { setBusy(false); if (photoInput.current) photoInput.current.value = ""; }
  };
  if (!auth.isLoading && !auth.isAuthenticated) return null;
  return <main className="admin-overview">
    <div className="admin-overview-heading"><div><p className="admin-page-kicker">Herramienta editorial</p><h1>Firmas de correo</h1><p className="admin-page-description">Edite una de las 12 plantillas, guárdela en App Storage y descargue el HTML listo para usar en su correo.</p></div><button className="admin-primary-link" onClick={reset}><PlusIcon /> Nueva firma</button></div>
    {notice && <p role="status" className="my-4 text-sm">{notice}</p>}{error && <p role="alert" className="admin-error my-4">{error}</p>}
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] mt-7">
      <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-end gap-3 mb-5"><label className="grow"><span className="text-sm font-medium">Nombre de la firma</span><input className="admin-input mt-1 w-full" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} maxLength={120} /></label><label><span className="text-sm font-medium">Plantilla</span><select className="admin-input mt-1" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>{signatureIds.map((id, i) => <option key={id} value={id}>{id} · {signatureDescriptions[i]}</option>)}</select></label></div>
        <div className="grid gap-3 sm:grid-cols-2">{fields.map(([key, label, placeholder]) => <label key={key}><span className="text-sm font-medium">{label}</span><input className="admin-input mt-1 w-full" value={form.data[key]} placeholder={placeholder} onChange={(e) => updateData(key, e.target.value)} /></label>)}</div>
        <div className="mt-5 flex flex-wrap items-center gap-3"><input ref={photoInput} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPhoto(file); }} /><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" disabled={busy} onClick={() => photoInput.current?.click()}><UploadIcon /> {form.photoUrl ? "Cambiar fotografía" : "Subir fotografía"}</button>{form.photoUrl && <button className="text-sm underline" onClick={() => setForm({ ...form, photoUrl: null })}>Quitar fotografía</button>}</div>
        <div className="mt-6 flex flex-wrap gap-2"><button className="admin-primary-link" disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : editingId ? "Actualizar firma" : "Guardar firma"}</button><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" disabled={busy} onClick={() => void navigator.clipboard.writeText(html).then(() => setNotice("HTML copiado al portapapeles."))}><CopyIcon /> Copiar HTML</button><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" disabled={busy} onClick={() => void copyRich(html).then(() => setNotice("Firma enriquecida copiada."))}><CopyIcon /> Copiar firma</button><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" disabled={busy} onClick={() => downloadBlob(html, `firma-${form.templateId}.html`)}><DownloadIcon /> Descargar HTML</button></div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-3"><div><p className="admin-page-kicker">Vista previa</p><h2 className="text-lg font-semibold">Plantilla {form.templateId}</h2></div><span className="text-xs text-muted-foreground">Las imágenes usan rutas públicas del CMS</span></div><div className="overflow-auto rounded border bg-white p-3"><iframe title="Vista previa de la firma" sandbox="allow-same-origin" srcDoc={html} className="h-[390px] min-w-[660px] w-full border-0" /></div><p className="mt-3 text-xs text-muted-foreground">El HTML se genera de nuevo en el servidor al guardar. Los datos no dependen de localStorage.</p></div>
    </section>
    <section className="mt-9"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Firmas guardadas</h2><span className="text-sm text-muted-foreground">{query.data?.length || 0} guardadas</span></div>{query.isError ? <p className="admin-error">{query.error.message}</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(query.data || []).map((item) => <article className="rounded-lg border border-slate-200 bg-white p-4" key={item.id}><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{item.label}</h3><p className="text-xs text-muted-foreground">Plantilla {item.templateId}</p></div><span className="text-xs text-muted-foreground">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-MX") : ""}</span></div><div className="mt-4 flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => edit(item)}><Pencil1Icon /> Editar</button><button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" onClick={async () => { const r = await adminApiRequest("GET", item.downloadUrl); if (!r.ok) return setError("No se pudo descargar la firma."); downloadBlob(await r.text(), `${item.label.replace(/[^a-z0-9]+/gi, "-")}.html`); }}><DownloadIcon /> Descargar</button><button className="text-sm text-red-700" onClick={() => void remove(item.id)}><TrashIcon /> Eliminar</button></div></article>)}</div>}</section>
  </main>;
}
