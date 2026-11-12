import { AssetDownloadButton, PrivateAssetPreview, PrivateAssetThumbnail } from "@/components/admin/AssetFiles";
import { useEffect, useRef, useState } from "react";
import { AdminPageHelp } from "@/components/admin/AdminPageHelp";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AgentButton } from "@/components/admin/AgentButton";
import { DocumentUpload, type UploadedDoc } from "@/components/admin/DocumentUpload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { uploadAdminMedia } from "@/lib/adminMediaUpload";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Presentation, Loader2, FileDown, FileText, Image as ImageIcon, Wand2, Eye } from "lucide-react";

interface PresentationRow {
  id: string;
  title: string;
  topic: string | null;
  template: string;
  branding: string;
  lang: string;
  slideCount: number | null;
  includeIntroSlide?: boolean;
  pptxUrl: string | null;
  pdfUrl: string | null;
  pngUrls: string[] | null;
  sourceDocs: string[] | null;
  engine: string;
  createdAt: string | null;
  availability?: {
    pptx: boolean;
    pdf: boolean;
    png: boolean[];
  };
}

type Format = "pptx" | "pdf" | "png";
const MAX_TOPIC_LENGTH = 10_000;
const MAX_SOURCE_LENGTH = 500_000;

const TEMPLATE_LABELS: Record<string, string> = {
  santossaucedo: "Santos & Saucedo",
  minimal: "Minimal",
  dark: "Oscura",
};

export default function AdminPresentations() {
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAdminAuth();
  useEffect(() => { requireAuth(); }, [requireAuth]);
  const { toast } = useToast();

  // --- Estado del generador ---
  const [topic, setTopic] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const sourceDetails = useRef<HTMLDetailsElement>(null);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [slideCount, setSlideCount] = useState(8);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [formats, setFormats] = useState<Record<Format, boolean>>({ pptx: true, pdf: true, png: true });
  const [visuals, setVisuals] = useState(true);
  const [illustrate, setIllustrate] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [includeIntroSlide, setIncludeIntroSlide] = useState(true);
  const [bookendTone, setBookendTone] = useState<"blue" | "white">("blue");
  const [supportImages, setSupportImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [supportUploadStatus, setSupportUploadStatus] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: presentations = [], isLoading, isError, error, refetch } = useQuery<PresentationRow[]>({
    queryKey: ["/api/admin/generated-presentations"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/admin/generated-presentations");
      if (!res.ok) throw new Error("No se pudo cargar el historial de presentaciones.");
      return res.json();
    },
  });

  const toggleFormat = (f: Format) => setFormats((prev) => ({ ...prev, [f]: !prev[f] }));

  const uploadSupportImages = async (files: FileList) => {
    setUploadingImg(true);
    setSupportUploadStatus("Preparando imágenes…");
    const next = [...supportImages];
    try {
      const selected = Array.from(files);
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        setSupportUploadStatus(`Imagen ${index + 1} de ${selected.length}: subiendo…`);
        const data = await uploadAdminMedia(file);
        const url = data.path;
        if (typeof url === "string" && url) next.push(url);
      }
      setSupportImages(next);
    } catch (error) {
      toast({
        title: "No se pudieron cargar todas las imágenes",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setUploadingImg(false);
      setSupportUploadStatus("");
    }
  };

  const generateMutation = useMutation({
    onMutate: () => setNotes([]),
    mutationFn: async () => {
      const selectedFormats = (Object.keys(formats) as Format[]).filter((f) => formats[f]);
      const res = await adminApiRequest("POST", "/api/admin/presentations/generate", {
        topic,
        sourceNotes,
        docs,
        slideCount,
        lang,
        formats: selectedFormats,
        visuals,
        illustrate,
        supportImages,
        webSearch,
        includeIntroSlide,
        bookendTone,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotes([...(Array.isArray(data?.docNotes) ? data.docNotes : []), ...(Array.isArray(data?.visualNotes) ? data.visualNotes : [])]);
        throw new Error((data as any)?.error || "No se pudo generar la presentación.");
      }
      if (data?.usedFallback === true || /^fallback/i.test(String(data?.presentation?.engine || ""))) {
        throw new Error("La respuesta no contiene una presentación generada con IA. Puedes reintentar con el material que sigue cargado.");
      }
      if (!data?.presentation?.id) throw new Error("No se recibió una presentación guardada. Reintenta la generación.");
      const expectedTotal = slideCount + 1 + Number(includeIntroSlide);
      if (data.presentation.slideCount !== expectedTotal) {
        throw new Error(`La respuesta no contiene las ${slideCount} diapositivas de contenido y sus láminas institucionales. Reintenta la generación.`);
      }
      return data;
    },
    onSuccess: (data: any) => {
      setNotes([...(Array.isArray(data?.docNotes) ? data.docNotes : []), ...(Array.isArray(data?.visualNotes) ? data.visualNotes : [])]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/generated-presentations"] });
      toast({
        title: "Presentación generada",
        description: "Descárgala desde el historial de abajo.",
      });
    },
    onError: (err: any) => {
      toast({ title: "No se pudo generar", description: String(err?.message || err), variant: "destructive" });
    },
  });

  const topicTooLong = topic.trim().length > MAX_TOPIC_LENGTH;
  const sourceTooLong = sourceNotes.trim().length > MAX_SOURCE_LENGTH;
  const canGenerate =
    !generateMutation.isPending &&
    !uploadingImg &&
    !topicTooLong && !sourceTooLong &&
    (topic.trim().length > 0 || sourceNotes.trim().length > 0 || docs.length > 0) &&
    (formats.pptx || formats.pdf || formats.png);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-40" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <AdminPageHeader
          title="PRESENTACIONES IA"
          description="Genera presentaciones con el branding de Santos & Saucedo a partir de un tema escrito y/o documentos subidos. Descárgalas en PowerPoint (PPTX), PDF e imágenes (PNG por diapositiva)."
          icon={Presentation}
        />
        <p className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <span aria-hidden="true" className="size-2 rounded-full bg-[#8CC63F]" />
          Santos &amp; Saucedo · SOL (gpt-6.1-sol) · Fast
        </p>

        <AdminPageHelp pageId="presentations">
          Escribe un tema (o súbele documentos .pdf/.docx/.pptx/.tex), elige los formatos, y presiona
          "Generar presentación". La IA arma las diapositivas y el sistema las exporta con el logo y los colores de la
          firma. El número solicitado corresponde al contenido y se añaden las láminas institucionales seleccionadas.
          Los archivos .doc/.ppt antiguos deben convertirse a .docx/.pptx.
        </AdminPageHelp>

        <Card className="mb-6 border-[#0B2850]/15 bg-[#0B2850]/[0.03]">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B2850]">Plantilla aprobada</p>
              <h2 className="mt-1 text-lg font-semibold">Presentación institucional Santos &amp; Saucedo</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                El agente usa esta referencia para ordenar agenda, cifras, servicios, metodología, actualidad y contacto.
                La plantilla queda disponible para revisión y descarga desde el CMS.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/api/admin/presentations/reference-template/pptx" download>Descargar PPTX editable</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/admin/presentations/reference-template/html" download>Descargar HTML de referencia</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Generador --- */}
        <Card className="mb-10">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pres-topic">Tema / instrucciones</Label>
                <Textarea
                  id="pres-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. Panorama de la reforma en competencia económica en México 2026, para clientes corporativos…"
                  rows={5}
                  aria-describedby="pres-topic-help"
                  aria-invalid={topicTooLong}
                  data-testid="input-topic"
                />
                <p id="pres-topic-help" className="text-xs text-muted-foreground">Instrucciones breves · {topic.length.toLocaleString("es-MX")} / {MAX_TOPIC_LENGTH.toLocaleString("es-MX")} caracteres. Puedes usar solo el material de apoyo o documentos.</p>
                {topicTooLong && <div className="space-y-2 text-sm">
                  <p className="text-destructive">El tema supera el límite de instrucciones. Coloca el texto extenso en Material de apoyo.</p>
                  {topic.length + (sourceNotes ? sourceNotes.length + 2 : 0) <= MAX_SOURCE_LENGTH && <Button type="button" variant="outline" size="sm" onClick={() => {
                    setSourceNotes(previous => [previous, topic].filter(Boolean).join("\n\n"));
                    setTopic("");
                    if (sourceDetails.current) sourceDetails.current.open = true;
                  }}>Usar como material de apoyo</Button>}
                </div>}
              </div>

              <div className="space-y-2">
                <Label>Documentos de insumo (opcional)</Label>
                <DocumentUpload
                  docs={docs}
                  onChange={setDocs}
                />
              </div>
            </div>

            <details ref={sourceDetails} className="space-y-3 border-b pb-4">
              <summary className="cursor-pointer text-sm font-medium text-[#0B2850]">Pegar material de apoyo</summary>
              <div className="space-y-2 pt-2">
                <Label htmlFor="pres-source-notes">Material de apoyo</Label>
                <Textarea id="pres-source-notes" rows={6} value={sourceNotes}
                  onChange={event => setSourceNotes(event.target.value)} aria-invalid={sourceTooLong}
                  aria-describedby="pres-source-help" placeholder="Pega aquí documentos extensos, antecedentes, cifras y contenido de referencia." />
                <p id="pres-source-help" className="text-xs text-muted-foreground">
                  {sourceNotes.length.toLocaleString("es-MX")} / {MAX_SOURCE_LENGTH.toLocaleString("es-MX")} caracteres.
                </p>
                {sourceTooLong && <p role="alert" className="text-sm text-destructive">El material supera el límite. Reduce el texto o adjúntalo como documento.</p>}
              </div>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pres-slides">Diapositivas de contenido</Label>
                <Input
                  id="pres-slides"
                  type="number"
                  min={3}
                  max={20}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Math.max(3, Math.min(20, parseInt(e.target.value || "8", 10) || 8)))}
                  data-testid="input-slide-count"
                />
                <p className="text-xs text-muted-foreground">{slideCount + 1 + Number(includeIntroSlide)} láminas en total, con {includeIntroSlide ? "entrada y cierre institucionales" : "cierre institucional"}.</p>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={lang} onValueChange={(v) => setLang(v as "es" | "en")}>
                  <SelectTrigger data-testid="select-lang"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plantilla</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">Santos & Saucedo</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Branding</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">Santos & Saucedo · logo y colores oficiales</div>
              </div>

              <div className="space-y-2">
                <Label>Formatos de descarga</Label>
                <div className="flex flex-col gap-2 pt-1">
                  {([
                    ["pptx", "PowerPoint (.pptx) — editable"],
                    ["pdf", "PDF"],
                    ["png", "PNG por diapositiva y vista previa (siempre incluidas)"],
                  ] as [Format, string][]).map(([f, label]) => (
                    <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={f === "png" || formats[f]} disabled={f === "png"} onCheckedChange={() => toggleFormat(f)} data-testid={`checkbox-format-${f}`} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Elementos visuales */}
            <div className="border-t pt-5 space-y-4">
              <Label className="text-sm">Elementos visuales</Label>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pres-intro">Incluir diapositiva de entrada</Label>
                  <p className="text-xs text-muted-foreground">Usa la portada institucional de Santos & Saucedo antes del contenido.</p>
                </div>
                <Switch id="pres-intro" checked={includeIntroSlide} onCheckedChange={setIncludeIntroSlide} data-testid="switch-intro-slide" />
              </div>
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="pres-bookend-tone">Diseño institucional de entrada y cierre</Label>
                <Select value={bookendTone} onValueChange={(tone: "blue" | "white") => setBookendTone(tone)}>
                  <SelectTrigger id="pres-bookend-tone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Original azul</SelectItem>
                    <SelectItem value="white">Original blanco</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Las láminas originales se usan completas, sin superponer texto.</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Incluir gráficas y diagramas</p>
                  <p className="text-xs text-muted-foreground">La IA los propone cuando el contenido lo amerita (las gráficas y diagramas no gastan créditos).</p>
                </div>
                <Switch checked={visuals} onCheckedChange={setVisuals} data-testid="switch-visuals" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Ilustrar con imágenes generadas por IA</p>
                  <p className="text-xs text-muted-foreground">Genera hasta 4 imágenes por presentación con GPT Image 2 (o el motor alterno configurado). <span className="text-amber-600">Usa créditos de OpenAI.</span></p>
                </div>
                <Switch checked={illustrate} onCheckedChange={setIllustrate} aria-label="Ilustrar con imágenes generadas por IA" data-testid="switch-illustrate" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Buscar información en la web</p>
                  <p className="text-xs text-muted-foreground">La IA busca datos actuales en internet (OpenAI) para enriquecer la presentación. Si está apagado, usa solo lo que compartes. <span className="text-amber-600">Usa créditos de OpenAI.</span></p>
                </div>
                <Switch checked={webSearch} onCheckedChange={setWebSearch} data-testid="switch-websearch" />
              </div>

              {(
                <div className="space-y-2">
                  <Label className="text-xs">Imágenes de apoyo (opcional) — se usan en las diapositivas de imagen antes que la IA</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 text-sm border rounded-md px-3 py-1.5 cursor-pointer hover:bg-muted/50">
                      {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Subir imágenes
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && e.target.files.length > 0 && uploadSupportImages(e.target.files)}
                        data-testid="input-support-images"
                      />
                    </label>
                    {supportImages.map((url, i) => (
                      <div key={url + i} className="relative">
                        <img src={url} alt="" className="h-14 w-20 object-cover border rounded" />
                        <button
                          type="button"
                          onClick={() => setSupportImages((prev) => prev.filter((u) => u !== url))}
                          className="absolute -top-2 -right-2 bg-background border rounded-full w-5 h-5 text-xs leading-none text-red-600"
                          aria-label="Quitar imagen"
                        >×</button>
                      </div>
                    ))}
                  </div>
                  {uploadingImg && supportUploadStatus && (
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {supportUploadStatus}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Material preparado · {sourceNotes.length.toLocaleString("es-MX")} caracteres de apoyo · {docs.length} documentos adjuntos.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <AgentButton
                onClick={() => generateMutation.mutate()}
                disabled={!canGenerate}
                icon={generateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1.5" />}
                data-testid="button-generate-presentation"
              >
                {generateMutation.isPending ? "Generando…" : "Generar presentación"}
              </AgentButton>
              <span className="text-xs text-muted-foreground">
                La duración depende de la extensión del material y de las imágenes solicitadas.
              </span>
            </div>

            {generateMutation.isPending && <p role="status" className="border-l-2 border-[#8CC63F] pl-3 text-sm text-muted-foreground">La solicitud sigue en curso. El resultado aparecerá cuando sus archivos estén guardados.</p>}
            {generateMutation.isError && <div role="alert" className="space-y-2 border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p>{generateMutation.error.message}</p>
              <p className="text-muted-foreground">El tema, los documentos y las opciones siguen cargados.</p>
              <Button type="button" size="sm" variant="outline" disabled={!canGenerate} onClick={() => generateMutation.mutate()}>Reintentar generación</Button>
            </div>}
            {notes.length > 0 && (
              <ul className="text-xs text-amber-600 list-disc pl-5 space-y-0.5" data-testid="list-doc-notes">
                {notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* --- Historial --- */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0B2850]">Historial del CMS</p>
            <h2 className="mt-1 text-xl font-semibold">Presentaciones guardadas ({presentations.length})</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>Actualizar</Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}
          </div>
        )}

        {!isLoading && isError && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">{error instanceof Error ? error.message : "No se pudo cargar el historial de presentaciones."}</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && presentations.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Presentation className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aún no se ha generado ninguna presentación.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && presentations.length > 0 && (
          <div className="space-y-3">
            {presentations.map((p) => {
              const pngUrls = Array.isArray(p.pngUrls) ? p.pngUrls : [];
              const pngAvailable = pngUrls.map((_, index) => p.availability?.png[index] ?? true);
              const thumbnailSlides = pngUrls.map((url, index) => ({ url, index }))
                .filter(({ url, index }) => url && pngAvailable[index]).slice(0, 3);
              const hasPreview = pngAvailable.some(Boolean) || Boolean(p.pdfUrl);
              const hasPptx = Boolean(p.pptxUrl && (p.availability?.pptx ?? true));
              const hasPdf = Boolean(p.pdfUrl && (p.availability?.pdf ?? true));
              const hasStoredPaths = Boolean(p.pptxUrl || p.pdfUrl || pngUrls.length);
              const hasAvailableFile = hasPptx || hasPdf || hasPreview;
              const hasMissingFile = Boolean(
                (p.pptxUrl && !hasPptx)
                || (p.pdfUrl && !hasPdf)
                || pngAvailable.some((available) => !available),
              );
              return (
              <Card key={p.id} data-testid={`presentation-card-${p.id}`}>
                <CardContent className="grid gap-4 p-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                  {thumbnailSlides.length > 0 && (
                    <button type="button" onClick={() => setPreviewId(p.id)}
                      aria-label={`Ver diapositivas de ${p.title}`}
                      className="grid w-full grid-cols-3 gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      {thumbnailSlides.map(({ url, index }) => (
                        <PrivateAssetThumbnail key={url} url={`${url}?thumb=1`} label={`Diapositiva ${index + 1}`} />
                      ))}
                    </button>
                  )}
                  {thumbnailSlides.length === 0 && (
                    <span className="grid min-h-14 place-items-center rounded border bg-muted/30 text-muted-foreground">
                      <Presentation aria-hidden="true" className="size-6" />
                    </span>
                  )}
                  <div className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{TEMPLATE_LABELS[p.template] || p.template}</Badge>
                    <Badge variant="outline">{(p.lang || "es").toUpperCase()}</Badge>
                  </div>

                  <p className="font-medium text-sm text-foreground line-clamp-2" title={p.title}>{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.slideCount || 0} diapositivas
                    {p.createdAt ? ` · ${new Date(p.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}` : ""}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {hasPreview && (
                      <Button size="sm" variant="outline" onClick={() => setPreviewId(p.id)} data-testid={`preview-${p.id}`}>
                        <Eye className="w-3 h-3 mr-1" />Previsualizar
                      </Button>
                    )}
                    {hasPptx && p.pptxUrl && <AssetDownloadButton url={p.pptxUrl} filename={`presentacion-${p.id}.pptx`} testId={`download-pptx-${p.id}`}>PPTX</AssetDownloadButton>}
                    {hasPdf && p.pdfUrl && <AssetDownloadButton url={p.pdfUrl} filename={`presentacion-${p.id}.pdf`} testId={`download-pdf-${p.id}`}>PDF</AssetDownloadButton>}
                    {pngAvailable.some(Boolean) && <AssetDownloadButton url={`/api/admin/generated-presentations/${p.id}/slides.zip`} filename={`diapositivas-${p.id}.zip`} testId={`download-png-${p.id}`}>Todas las PNG (ZIP)</AssetDownloadButton>}

                  </div>

                  {p.availability && hasStoredPaths && hasMissingFile && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2" role="status">
                      {hasAvailableFile
                        ? "Parte de los archivos históricos ya no está disponible. Las descargas conservadas siguen activas."
                        : "El historial permanece en la base, pero sus archivos ya no están disponibles. Vuelve a generar la presentación para restaurar sus descargas."}
                    </p>
                  )}
                  </div>

                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Vista previa privada de las diapositivas conservadas. */}
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="admin-asset-dialog max-w-5xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista previa de la presentación</DialogTitle>
            <DialogDescription>Revise y descargue las diapositivas conservadas en el historial privado.</DialogDescription>
          </DialogHeader>
          {(() => {
            const pre = presentations.find((p) => p.id === previewId);
            const pngs = pre?.pngUrls || [];
            const availablePngs = pngs
              .map((url, index) => ({
                url,
                index,
                available: pre?.availability?.png[index] ?? true,
              }))
              .filter((entry) => entry.available);
            if (!availablePngs.length && pre?.pdfUrl) return <PrivateAssetPreview url={pre.pdfUrl} label={pre.title} pdf />;
            if (!availablePngs.length) {
              return (
                <p className="text-sm text-muted-foreground py-2">
                  Esta presentación no conserva imágenes disponibles para previsualizar.
                </p>
              );
            }
            const slideLabel = (index: number) => index === 0 && pre?.includeIntroSlide !== false ? "Portada" : `Diapositiva ${index + 1}`;
            return (
              <div className="space-y-4 py-1">
                {availablePngs.map(({ url, index }) => (
                  <div key={url} className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {slideLabel(index)}
                    </p>
                    <PrivateAssetPreview url={url} label={slideLabel(index)} />
                    <AssetDownloadButton url={`${url}?download=1`} filename={`presentacion-${pre!.id}-diapositiva-${index + 1}.png`} testId={`download-slide-${index}`}>Descargar {slideLabel(index).toLowerCase()}</AssetDownloadButton>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
