import { useEffect, useId, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Check, ChevronDown, FileText, Loader2, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AssetDownloadButton, PrivateAssetPreview } from "@/components/admin/AssetFiles";
import { DocumentRichTextEditor } from "@/components/admin/DocumentRichTextEditor";
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
import { plainTextToRichText, richTextToPlainText, type DocumentRichText } from "@shared/documentRichText";

const endpoint = "/api/admin/documents";
const primaryClass = "bg-[#0B2850] text-white hover:bg-[#145385]";
const emptyDocument = plainTextToRichText("");
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
  document: DocumentVersion & { sourceText: string; richContent?: DocumentRichText | null; mode: Mode };
  versions: DocumentVersion[];
};

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const response = await adminApiRequest(method, path, data);
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "No se pudo completar la operación.");
  return result;
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function letterheadLabel(template: LetterheadTemplateId | null) {
  return letterheadTemplates.find(option => option.id === template)?.label ?? "Membrete anterior";
}

function LetterheadPicker({ template, allowLegacy = false, onChange }: {
  template: LetterheadTemplateId | null;
  allowLegacy?: boolean;
  onChange: (value: LetterheadTemplateId | null) => void;
}) {
  const id = useId();
  return <fieldset className="space-y-2" aria-describedby={`${id}-help`}>
    <legend className="text-sm font-medium">Membrete</legend>
    <p id={`${id}-help`} className="text-xs text-muted-foreground">El diseño elegido se aplica al DOCX y al PDF de esta versión.</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {letterheadTemplates.map(option => <label key={option.id} className="block min-w-0 cursor-pointer">
        <input type="radio" name={`${id}-letterhead`} value={option.id} checked={template === option.id}
          onChange={() => onChange(option.id)} aria-labelledby={`${id}-${option.id}-label`}
          aria-describedby={`${id}-${option.id}-description`} className="peer sr-only" />
        <span className="relative block h-full rounded-sm border p-2 transition-colors hover:border-[#145385] peer-checked:border-[#0B2850] peer-checked:bg-[#0B2850]/5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#145385] peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed">
          <span className="flex h-16 items-center justify-center bg-muted/40 p-1 sm:h-20">
            <img src={option.previewUrl} alt="" className="h-full max-w-full object-contain" />
          </span>
          <span id={`${id}-${option.id}-label`} className="mt-1.5 block break-words text-xs font-semibold text-[#0B2850]">{option.label}</span>
          <span id={`${id}-${option.id}-description`} className="sr-only">{option.description}</span>
          {template === option.id && <Check aria-hidden="true" className="absolute right-1.5 top-1.5 size-4 rounded-sm bg-[#0B2850] p-0.5 text-white" />}
        </span>
      </label>)}
    </div>
    {allowLegacy && <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="radio" name={`${id}-letterhead`} value="legacy" checked={template === null} onChange={() => onChange(null)} className="accent-[#0B2850]" />
      Conservar el membrete anterior
    </label>}
  </fieldset>;
}

function DocumentWorkspace({ detail, onSaved, onClose }: {
  detail: DocumentDetail;
  onSaved: (saved: DocumentVersion) => void;
  onClose: () => void;
}) {
  const { document, versions } = detail;
  const { toast } = useToast();
  const [title, setTitle] = useState(document.title);
  const [template, setTemplate] = useState(document.template ?? null);
  const [richContent, setRichContent] = useState(document.richContent ?? null);
  const [initialContent] = useState(() => document.richContent ?? plainTextToRichText(document.sourceText));
  const [contentError, setContentError] = useState("");
  const [previewId, setPreviewId] = useState(document.id);
  const preview = versions.find(version => version.id === previewId) ?? document;
  const archived = document.status === "archived";
  const sourceText = richContent ? richTextToPlainText(richContent) : document.sourceText;
  const changed = title !== document.title || template !== document.template || richContent !== (document.richContent ?? null);
  const save = useMutation({
    mutationFn: () => request<DocumentVersion>("PATCH", `${endpoint}/${document.id}`, {
      title: title.trim(), sourceText, mode: "preserve", documents: [], template,
      ...(richContent ? { richContent } : {}),
    }),
    onSuccess: onSaved,
    onError: (error) => toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" }),
  });
  return <section className="space-y-5 border bg-background p-5 sm:p-7" aria-labelledby="document-workspace-heading">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
      <div className="min-w-0 space-y-1">
        <h2 id="document-workspace-heading" className="text-xl font-semibold text-[#0B2850]">Editar y descargar</h2>
        <p className="break-words text-sm text-muted-foreground">{document.title || "Documento sin título"} · Versión {document.version}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {preview.docxUrl && <AssetDownloadButton url={preview.docxUrl} filename={`documento-v${preview.version}.docx`}>Descargar DOCX</AssetDownloadButton>}
        {preview.pdfUrl && <AssetDownloadButton url={preview.pdfUrl} filename={`documento-v${preview.version}.pdf`}>Descargar PDF</AssetDownloadButton>}
        <Button type="button" size="sm" variant="ghost" disabled={save.isPending} onClick={onClose}>Cerrar edición</Button>
      </div>
    </header>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form className="min-w-0 space-y-4" onSubmit={event => {
        event.preventDefault();
        if (!archived && changed && sourceText.trim() && !contentError && !save.isPending) save.mutate();
      }}>
        <fieldset disabled={save.isPending || archived} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="document-edit-title">Nombre del documento</Label>
            <Input id="document-edit-title" maxLength={180} value={title} onChange={event => setTitle(event.target.value)} />
          </div>
          <details className="group border-y py-3">
            <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[#0B2850]">
              <span>Cambiar membrete <span className="text-muted-foreground">· {letterheadLabel(template)}</span></span>
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="mt-3"><LetterheadPicker template={template} allowLegacy={document.template == null} onChange={setTemplate} /></div>
          </details>
          <DocumentRichTextEditor label="Contenido de la versión" initialContent={initialContent} disabled={save.isPending || archived}
            error={contentError} onChange={(value, error) => { setRichContent(value); setContentError(error); }} />
          {!archived && <div className="flex flex-wrap items-center gap-2">
            <Button className={primaryClass} type="submit" disabled={!changed || !sourceText.trim() || Boolean(contentError) || save.isPending}>
              {save.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
              {save.isPending ? "Guardando versión…" : "Guardar cambios"}
            </Button>
            {changed && !save.isPending && <span className="text-xs text-muted-foreground" role="status">Cambios por guardar</span>}
          </div>}
        </fieldset>
        {save.isError && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
      </form>
      <section className="min-w-0 space-y-3" aria-labelledby="document-preview-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="space-y-1">
            <h3 id="document-preview-heading" className="font-semibold text-[#0B2850]">Vista previa del PDF</h3>
            <p className="text-xs text-muted-foreground">Versión {preview.version} guardada · {letterheadLabel(preview.template)}</p>
          </div>
          {versions.length > 1 && <div className="space-y-1">
            <Label className="text-xs" htmlFor="document-preview-version">Versiones guardadas</Label>
            <Select value={preview.id} onValueChange={setPreviewId}>
              <SelectTrigger className="min-w-36" id="document-preview-version"><SelectValue /></SelectTrigger>
              <SelectContent>
                {versions.map(version => <SelectItem key={version.id} value={version.id}>Versión {version.version} · {letterheadLabel(version.template)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>}
        </div>
        {preview.pdfUrl ? <PrivateAssetPreview url={preview.pdfUrl} label={`PDF de ${preview.title || "documento sin título"}, versión ${preview.version}`} pdf />
          : <p className="rounded-sm border bg-muted/30 p-4 text-sm text-muted-foreground">Esta versión no tiene un PDF disponible.</p>}
      </section>
    </div>
  </section>;
}

export default function AdminDocuments() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const workspace = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [richContent, setRichContent] = useState<DocumentRichText | null>(null);
  const [contentError, setContentError] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState<Mode>("preserve");
  const [template, setTemplate] = useState<LetterheadTemplateId | null>(DEFAULT_LETTERHEAD_TEMPLATE);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => { requireAuth(); }, [requireAuth]);
  useEffect(() => {
    if (selectedId) {
      workspace.current?.focus({ preventScroll: true });
      workspace.current?.scrollIntoView({ block: "start" });
    }
  }, [selectedId]);

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

  const sourceText = richContent ? richTextToPlainText(richContent) : "";
  const onSaved = (saved: DocumentVersion, message: string) => {
    setShowTrash(false);
    setSelectedId(saved.id);
    void queryClient.invalidateQueries({ queryKey: [endpoint] });
    toast({ title: message });
  };
  const generate = useMutation({
    mutationFn: () => request<DocumentVersion>("POST", `${endpoint}/generate`, {
      title: title.trim(), sourceText, instructions, mode, documents, template,
      ...(richContent && sourceText.trim() ? { richContent } : {}),
    }),
    onSuccess: (saved) => {
      setTitle("");
      setRichContent(null);
      setContentError("");
      setEditorKey(key => key + 1);
      setInstructions("");
      setMode("preserve");
      setDocuments([]);
      onSaved(saved, "Documento generado");
    },
    onError: (error) => toast({ title: "No se pudo generar", description: error.message, variant: "destructive" }),
  });
  const archive = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      request("POST", `${endpoint}/${id}/archive`, { archived }),
    onSuccess: (_result, { id, archived }) => {
      if (selectedId === id) setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({ title: archived ? "Documento enviado a papelera" : "Documento restaurado" });
    },
    onError: (error) => toast({ title: "No se pudo cambiar el estado", description: error.message, variant: "destructive" }),
  });

  const canGenerate = !uploading && !contentError && Boolean(
    sourceText.trim() || documents.length || (mode === "organize" && instructions.trim())
  );

  return <div className="mx-auto max-w-6xl space-y-6" data-testid="page-admin-documents">
    <AdminPageHeader title="Documentos con membrete" description="Prepara documentos con la identidad de Santos & Saucedo y descarga cada versión en Word o PDF." />
    <form className="space-y-5 border bg-background p-5 sm:p-7" onSubmit={event => {
      event.preventDefault();
      if (canGenerate && !generate.isPending) generate.mutate();
    }}>
      <h2 className="text-xl font-semibold text-[#0B2850]">Nuevo documento</h2>
      <fieldset className="space-y-5" disabled={generate.isPending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="document-title">Título (opcional)</Label>
            <Input id="document-title" maxLength={180} value={title} onChange={event => setTitle(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="document-mode">Modo</Label>
            <Select value={mode} onValueChange={(value: Mode) => setMode(value)} disabled={generate.isPending}>
              <SelectTrigger id="document-mode"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="preserve">Preservar texto</SelectItem>
                <SelectItem value="organize">Organizar con IA</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mode === "preserve" ? "Aplica el membrete y conserva el texto y su formato." : "Sol organiza el contenido con las indicaciones que proporciones."}
            </p>
          </div>
        </div>
        <DocumentRichTextEditor key={editorKey} initialContent={emptyDocument} disabled={generate.isPending}
          error={contentError} onChange={(value, error) => { setRichContent(value); setContentError(error); }} />
        <div className="space-y-2">
          <p className="text-sm font-medium">Documentos de referencia <span className="font-normal text-muted-foreground">(opcional)</span></p>
          <DocumentUpload docs={documents} onChange={setDocuments} onUploadingChange={setUploading} />
        </div>
        {mode === "organize" && <div className="space-y-2">
          <Label htmlFor="document-instructions">Indicaciones editoriales</Label>
          <Textarea id="document-instructions" value={instructions} maxLength={4_000} rows={3}
            onChange={event => setInstructions(event.target.value)} placeholder="Describe la estructura o el documento que necesitas" />
        </div>}
        <LetterheadPicker template={template} onChange={setTemplate} />
        <Button className={primaryClass} disabled={!canGenerate || generate.isPending} type="submit">
          {generate.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <FileText aria-hidden="true" />}
          {generate.isPending ? "Generando archivos…" : "Generar documento"}
        </Button>
        {generate.isPending && <p role="status" className="text-sm text-muted-foreground">Preparando el Word editable y la vista previa en PDF.</p>}
        {generate.isError && <p role="alert" className="text-sm text-destructive">{generate.error.message}</p>}
      </fieldset>
    </form>

    {selectedId && <div ref={workspace} tabIndex={-1} className="scroll-mt-24">
      {detail.isPending ? <p role="status" className="border p-5 text-sm text-muted-foreground">Abriendo documento…</p>
        : detail.isError ? <p role="alert" className="border p-5 text-sm text-destructive">{detail.error.message}</p>
        : <DocumentWorkspace key={detail.data.document.id} detail={detail.data}
            onSaved={saved => onSaved(saved, "Nueva versión guardada")} onClose={() => setSelectedId(null)} />}
    </div>}

    <section className="space-y-4 border bg-background p-5 sm:p-7" aria-labelledby="document-history">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <h2 id="document-history" className="text-xl font-semibold text-[#0B2850]">{showTrash ? "Papelera de documentos" : "Documentos guardados"}</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => {
            setShowTrash(!showTrash); setSelectedId(null);
          }}>{showTrash ? "Ver guardados" : "Ver papelera"}</Button>
          <Button type="button" size="sm" variant="outline" disabled={history.isFetching} onClick={() => void history.refetch()}>
            <RefreshCw className={history.isFetching ? "animate-spin" : undefined} aria-hidden="true" />Actualizar
          </Button>
        </div>
      </div>
      {history.isPending ? <p role="status" className="text-sm text-muted-foreground">Cargando documentos…</p>
        : history.isError ? <p role="alert" className="text-sm text-destructive">{history.error.message}</p>
        : !history.data.length ? <p className="text-sm text-muted-foreground">{showTrash ? "La papelera está vacía." : "Todavía no hay documentos guardados."}</p>
        : <ul className="divide-y">{history.data.map(document => <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div className="min-w-0">
            <h3 className="break-words font-medium text-[#0B2850]">{document.title || "Documento sin título"}</h3>
            <p className="text-xs text-muted-foreground">Versión {document.version} · {letterheadLabel(document.template)} · {dateLabel(document.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" aria-expanded={selectedId === document.id}
              onClick={() => setSelectedId(selectedId === document.id ? null : document.id)}>
              {selectedId === document.id ? "Cerrar documento" : showTrash ? "Ver documento" : "Editar documento"}
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={archive.isPending} onClick={() => archive.mutate({ id: document.id, archived: !showTrash })}>
              {showTrash ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
              {showTrash ? "Restaurar" : "Mover a papelera"}
            </Button>
          </div>
        </li>)}</ul>}
    </section>
  </div>;
}
