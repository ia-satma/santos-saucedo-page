import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Check, FileText, Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AssetDownloadButton, PrivateAssetPreview } from "@/components/admin/AssetFiles";
import { DocumentUpload, type UploadedDoc } from "@/components/admin/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_LETTERHEAD_TEMPLATE, letterheadTemplates, type LetterheadTemplateId } from "@shared/letterheadTemplates";

const endpoint = "/api/admin/documents";
type Mode = "preserve" | "organize";
type DocumentVersion = {
  id: string;
  title: string;
  version: number;
  status: "active" | "archived";
  createdAt: string;
  docxUrl: string | null;
  pdfUrl: string | null;
  template: LetterheadTemplateId | null;
};
type DocumentDetail = {
  document: DocumentVersion & { sourceText: string; mode: Mode };
  versions: DocumentVersion[];
};

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const response = await adminApiRequest(method, path, data);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo completar la operación.");
  return result;
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function letterheadLabel(template: LetterheadTemplateId | null) {
  return letterheadTemplates.find((option) => option.id === template)?.label ?? "Membrete anterior";
}

export default function AdminDocuments() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState<Mode>("preserve");
  const [template, setTemplate] = useState<LetterheadTemplateId | null>(DEFAULT_LETTERHEAD_TEMPLATE);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<DocumentVersion | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<DocumentVersion | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  useEffect(() => { requireAuth(); }, [requireAuth]);

  const history = useQuery({
    queryKey: [endpoint, "history", showTrash],
    enabled: isAuthenticated,
    queryFn: () => request<DocumentVersion[]>("GET", `${endpoint}?trash=${showTrash}`),
  });
  const detail = useQuery({
    queryKey: [endpoint, "detail", selectedId],
    enabled: isAuthenticated && Boolean(selectedId),
    queryFn: () => request<DocumentDetail>("GET", `${endpoint}/${selectedId}`),
  });

  const reset = () => {
    setEditing(null);
    setTitle("");
    setSourceText("");
    setInstructions("");
    setMode("preserve");
    setTemplate(DEFAULT_LETTERHEAD_TEMPLATE);
    setDocuments([]);
  };

  const save = useMutation({
    mutationFn: () => request<DocumentVersion>(
      editing ? "PATCH" : "POST",
      editing ? `${endpoint}/${editing.id}` : `${endpoint}/generate`,
      { title, sourceText, instructions, mode, documents, template },
    ),
    onSuccess: (saved) => {
      reset();
      setShowTrash(false);
      setSelectedId(saved.id);
      setPreview(null);
      void queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({ title: editing ? "Nueva versión guardada" : "Documento generado" });
    },
    onError: (error) => toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" }),
  });

  const archive = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      request("POST", `${endpoint}/${id}/archive`, { archived }),
    onSuccess: (_result, { id, archived }) => {
      if (id === editing?.id) reset();
      setSelectedId(null);
      setPreview(null);
      void queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({ title: archived ? "Documento enviado a papelera" : "Documento restaurado" });
    },
    onError: (error) => toast({ title: "No se pudo cambiar el estado", description: error.message, variant: "destructive" }),
  });

  const openEditor = (document: DocumentDetail["document"]) => {
    setEditing(document);
    setTitle(document.title);
    setSourceText(document.sourceText);
    setMode("preserve");
    setTemplate(document.template ?? null);
    setDocuments([]);
    setInstructions("");
    window.requestAnimationFrame(() => window.document.getElementById("document-title")?.focus());
  };

  const canSave = !uploading && title.trim() && (
    sourceText.trim() || documents.length || (mode === "organize" && instructions.trim())
  );
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Documentos con membrete" description="Prepara documentos de Santos & Saucedo y conserva cada versión en DOCX y PDF." />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form className="space-y-4 border bg-background p-5 sm:p-6"
          onSubmit={(event) => { event.preventDefault(); if (canSave && !save.isPending) save.mutate(); }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 className="text-lg font-semibold text-[#0B2850]">{editing ? `Editar versión ${editing.version}` : "Nuevo documento"}</h2>
            {editing && <Button type="button" size="sm" variant="outline" onClick={reset} disabled={save.isPending || uploading}>Cancelar edición</Button>}
          </div>
          <fieldset className="space-y-4" disabled={save.isPending}>
            <div className="space-y-2">
              <Label htmlFor="document-title">Título</Label>
              <Input id="document-title" maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <fieldset className="space-y-2" aria-describedby="document-letterhead-help">
              <legend className="text-sm font-medium">Membrete</legend>
              <p id="document-letterhead-help" className="text-sm text-muted-foreground">
                El diseño elegido se aplica al DOCX y al PDF de esta versión.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {letterheadTemplates.map((option) => (
                  <label key={option.id} className="block min-w-0 cursor-pointer">
                    <input
                      type="radio"
                      name="document-letterhead"
                      value={option.id}
                      checked={template === option.id}
                      onChange={() => setTemplate(option.id)}
                      aria-labelledby={`letterhead-${option.id}-label`}
                      aria-describedby={`letterhead-${option.id}-description`}
                      className="peer sr-only"
                    />
                    <span className="relative block h-full border p-2 transition-colors hover:border-[#145385] peer-checked:border-[#0B2850] peer-checked:bg-[#0B2850]/5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#145385] peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed">
                      <span className="flex h-28 items-center justify-center bg-muted/40 p-1 sm:h-32">
                        <img src={option.previewUrl} alt="" className="h-full max-w-full object-contain" />
                      </span>
                      <span id={`letterhead-${option.id}-label`} className="mt-2 block break-words text-sm font-medium text-[#0B2850]">{option.label}</span>
                      <span id={`letterhead-${option.id}-description`} className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
                      {template === option.id && <Check aria-hidden="true" className="absolute right-2 top-2 size-5 rounded-sm bg-[#0B2850] p-0.5 text-white" />}
                    </span>
                  </label>
                ))}
              </div>
              {editing && editing.template == null && (
                <label className="flex cursor-pointer items-center gap-2 border p-2 text-sm">
                  <input
                    type="radio"
                    name="document-letterhead"
                    value="legacy"
                    checked={template === null}
                    onChange={() => setTemplate(null)}
                    className="accent-[#0B2850]"
                  />
                  Conservar el membrete anterior
                </label>
              )}
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="document-source">Contenido</Label>
              <Textarea id="document-source" value={sourceText} onChange={(event) => setSourceText(event.target.value)}
                maxLength={200_000} placeholder="Pega aquí el texto del documento" className="min-h-60" />
            </div>
            <DocumentUpload docs={documents} onChange={setDocuments} onUploadingChange={setUploading} />
            <div className="space-y-2">
              <Label htmlFor="document-mode">Modo</Label>
              <Select value={mode} onValueChange={(value: Mode) => setMode(value)}>
                <SelectTrigger id="document-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preserve">Preservar texto</SelectItem>
                  <SelectItem value="organize">Organizar con IA</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{mode === "preserve" ? "Aplica el membrete y conserva el texto." : "Sol organiza el contenido con las indicaciones que proporciones."}</p>
            </div>
            {mode === "organize" && <div className="space-y-2">
              <Label htmlFor="document-instructions">Indicaciones editoriales</Label>
              <Textarea id="document-instructions" value={instructions} maxLength={4_000}
                onChange={(event) => setInstructions(event.target.value)} placeholder="Describe la estructura o el documento que necesitas" />
            </div>}
            <Button className="bg-[#0B2850] text-white hover:bg-[#145385]" disabled={!canSave || save.isPending} type="submit">
              {save.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <FileText aria-hidden="true" />}
              {save.isPending ? "Generando archivos…" : editing ? "Guardar nueva versión" : "Generar documento"}
            </Button>
          </fieldset>
        </form>

        <section className="space-y-4 border bg-background p-5 sm:p-6" aria-labelledby="document-history">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 id="document-history" className="text-lg font-semibold text-[#0B2850]">{showTrash ? "Papelera de documentos" : "Documentos guardados"}</h2>
            <Button type="button" size="sm" variant="outline" onClick={() => {
              setShowTrash(!showTrash); setSelectedId(null); setPreview(null);
            }}>{showTrash ? "Ver guardados" : "Ver papelera"}</Button>
          </div>
          {history.isPending ? <p role="status" className="text-sm text-muted-foreground">Cargando documentos…</p>
            : history.isError ? <p role="alert" className="text-sm text-destructive">{history.error.message}</p>
            : !history.data.length ? <p className="text-sm text-muted-foreground">{showTrash ? "La papelera está vacía." : "Todavía no hay documentos guardados."}</p>
            : <ul className="divide-y">{history.data.map((document) => (
              <li key={document.id} className="py-3">
                <button type="button" className="block w-full break-words text-left font-medium text-[#0B2850] hover:underline"
                  aria-expanded={selectedId === document.id}
                  onClick={() => { setSelectedId(selectedId === document.id ? null : document.id); setPreview(null); }}>
                  {document.title}
                </button>
                <p className="text-sm text-muted-foreground">Versión {document.version} · {letterheadLabel(document.template)} · {dateLabel(document.createdAt)}</p>
              </li>
            ))}</ul>}
          {selectedId && detail.isPending && <p role="status" className="text-sm text-muted-foreground">Cargando versiones…</p>}
          {selectedId && detail.isError && <p role="alert" className="text-sm text-destructive">{detail.error.message}</p>}
          {selectedId && detail.data && <div className="space-y-4 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {!showTrash && <Button type="button" size="sm" onClick={() => openEditor(detail.data.document)} disabled={save.isPending || uploading}>Editar documento</Button>}
              <Button type="button" size="sm" variant="outline" disabled={archive.isPending || save.isPending || uploading}
                onClick={() => archive.mutate({ id: selectedId, archived: !showTrash })}>
                {showTrash ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
                {showTrash ? "Restaurar documento" : "Mover a papelera"}
              </Button>
            </div>
            <h3 className="font-semibold text-[#0B2850]">Historial de versiones</h3>
            <ul className="divide-y">
              {detail.data.versions.map((version) => (
                <li key={version.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <strong className="text-sm">Versión {version.version}</strong>
                    <p className="text-xs text-muted-foreground">{letterheadLabel(version.template)} · {dateLabel(version.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {version.docxUrl && <AssetDownloadButton url={version.docxUrl} filename={`documento-v${version.version}.docx`}>DOCX</AssetDownloadButton>}
                    {version.pdfUrl && <AssetDownloadButton url={version.pdfUrl} filename={`documento-v${version.version}.pdf`}>PDF</AssetDownloadButton>}
                    {version.pdfUrl && <Button type="button" size="sm" variant="ghost" onClick={() => setPreview(preview?.id === version.id ? null : version)}>
                      {preview?.id === version.id ? "Cerrar vista" : "Vista previa"}
                    </Button>}
                  </div>
                </li>
              ))}
            </ul>
            {preview?.pdfUrl && <PrivateAssetPreview url={preview.pdfUrl} label={`Versión ${preview.version} de ${preview.title} · ${letterheadLabel(preview.template)}`} pdf />}
          </div>}
        </section>
      </div>
    </div>
  );
}
