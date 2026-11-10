import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Clipboard, Images, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { AssetDownloadButton, PrivateAssetPreview } from "@/components/admin/AssetFiles";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DocumentUpload, type UploadedDoc } from "@/components/admin/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth, adminApiRequest, getAuthHeaders } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import { SOCIAL_NETWORKS, socialCopyLimits, socialContentSchema, socialFormats, type SocialContent, type SocialFormat, type SocialPayload } from "@shared/socialStudio";

const base = "/api/admin/social-assets";
const selectClass = "flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50";
const primaryClass = "bg-[#0B2850] text-white hover:bg-[#145385]";
const directions = {
  varied: "Variado dentro de la identidad",
  editorial: "Editorial y sobrio",
  typographic: "Protagonismo tipográfico",
  photographic: "Fotografía documental",
  educational: "Didáctico y secuencial",
} as const;
const backgrounds = {
  auto: "Según el contenido",
  solid: "Color uniforme",
  tonal: "Degradado tonal de la marca",
  glow: "Luz suave sobre el fondo",
} as const;
const palettes = {
  "navy-lime": { label: "Azul marino y lima", colors: ["#0B2850", "#BBF741", "#FFFFFF"] },
  "navy-white": { label: "Blanco editorial", colors: ["#FFFFFF", "#0B2850", "#BBF741"] },
  ivory: { label: "Marfil y azul", colors: ["#F4F1E8", "#0B2850", "#8CC63F"] },
  graphite: { label: "Grafito y lima", colors: ["#23232B", "#BBF741", "#FFFFFF"] },
} as const;
const networkLabels = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", x: "X", threads: "Threads", tiktok: "TikTok" };
type Direction = keyof typeof directions;
type Background = keyof typeof backgrounds;
type Palette = keyof typeof palettes;
type PaletteRequest = Palette | "auto" | "mixed";
type Network = keyof typeof networkLabels;
type PieceDesign = NonNullable<SocialContent["slides"][number]["design"]>;
type Piece = {
  id: string;
  kind: "post" | "carousel";
  title: string;
  format: SocialFormat;
  palette: Palette;
  language: string;
  slideCount: number;
  status: "draft" | "ready" | "archived";
  version: number;
  slideUrls: string[];
  htmlUrls?: string[];
  packageUrl: string | null;
  packageExtension: "zip" | "json";
  createdAt?: string;
  updatedAt?: string;
};
type Revision = Pick<Piece, "title" | "version" | "format" | "slideUrls" | "htmlUrls" | "packageUrl" | "packageExtension"> & { content: SocialPayload };
type PieceDetail = Piece & { content: SocialPayload; versions: Revision[] };
type Review = { summary: string; suggestions: string[] };
type HistoryPage = { items: Piece[]; hasMore: boolean };
type Action = { id: string; type: "copy" | "archive" | "restore" };

async function request<T>(method: string, endpoint = "", data?: unknown): Promise<T> {
  const response = await adminApiRequest(method, `${base}${endpoint}`, data);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? "No se pudo completar la operación.");
  return body;
}

function FormatOptions() {
  return <>{Object.entries(socialFormats).map(([id, format]) =>
    <option key={id} value={id}>{format.label} · {format.width} × {format.height}</option>
  )}</>;
}

function PaletteOptions() {
  return <>{Object.entries(palettes).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</>;
}

function DirectionOptions() {
  return <>{Object.entries(directions).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</>;
}

function BackgroundOptions() {
  return <>{Object.entries(backgrounds).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</>;
}

function Swatches({ colors }: { colors: readonly string[] }) {
  return <span aria-hidden="true" className="inline-flex gap-1">
    {colors.map(color => <span key={color} className="size-3.5 rounded-sm border border-black/10" style={{ backgroundColor: color }} />)}
  </span>;
}

function SupportImages({ images, onChange, onUploadingChange }: {
  images: UploadedDoc[];
  onChange: (value: UploadedDoc[]) => void;
  onUploadingChange: (value: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function upload(files: FileList) {
    const next = [...images];
    const candidates = Array.from(files).slice(0, 10 - next.length);
    const errors: string[] = [];
    onUploadingChange(true);
    setError("");
    if (files.length > candidates.length) errors.push("Puedes añadir hasta 10 imágenes.");
    try {
      for (let index = 0; index < candidates.length; index += 1) {
        const file = candidates[index];
        if (file.size > 12 * 1024 * 1024) {
          errors.push(`"${file.name}" supera los 12 MB.`);
          continue;
        }
        setStatus(`Subiendo ${index + 1} de ${candidates.length} · ${file.name}`);
        try {
          const body = new FormData();
          body.append("file", file);
          const response = await fetch(`${base}/upload-image`, { method: "POST", headers: getAuthHeaders(), body, credentials: "include" });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result?.url) throw new Error(result?.error || "No se pudo subir la imagen.");
          next.push({ url: result.url, name: result.name || file.name });
        } catch (failure) {
          errors.push(`${file.name} · ${failure instanceof Error ? failure.message : "Error al subir la imagen."}`);
        }
      }
      onChange(next);
    } finally {
      setStatus("");
      setError(errors.join(" "));
      onUploadingChange(false);
      if (input.current) input.current.value = "";
    }
  }
  return <div className="space-y-2">
    <input ref={input} type="file" className="hidden" multiple accept="image/png,image/jpeg,image/webp"
      data-testid="social-support-images" onChange={event => {
        if (event.target.files?.length) void upload(event.target.files);
      }} />
    <Button type="button" variant="outline" disabled={Boolean(status) || images.length >= 10} onClick={() => input.current?.click()}>
      {status ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Images aria-hidden="true" />}
      {status ? "Subiendo imágenes…" : "Subir imágenes"}
    </Button>
    <p className="text-xs text-muted-foreground">Hasta 10 imágenes PNG, JPG o WebP, de 12 MB cada una. Se asignan en el orden de carga.</p>
    {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {images.length > 0 && <ol className="space-y-1">
      {images.map((item, index) => <li key={item.url} className="flex items-center justify-between gap-2 border px-3 py-1.5 text-sm">
        <span className="min-w-0 truncate">{index + 1}. {item.name}</span>
        <button type="button" disabled={Boolean(status)} className="p-1 text-muted-foreground hover:text-destructive" aria-label={`Quitar ${item.name}`}
          onClick={() => onChange(images.filter(image => image.url !== item.url))}><X className="size-4" aria-hidden="true" /></button>
      </li>)}
    </ol>}
  </div>;
}

function ChannelCopy({ content, readOnly, pending, regenerateDisabled, onChange, onRegenerate }: {
  content: SocialContent;
  readOnly: boolean;
  pending: boolean;
  regenerateDisabled: boolean;
  onChange: (content: SocialContent) => void;
  onRegenerate: () => void;
}) {
  const { toast } = useToast();
  const [network, setNetwork] = useState<Network>("instagram");
  const textFor = (id: Network) => content.copies?.[id] ?? content.caption.slice(0, socialCopyLimits[id]);
  const value = textFor(network);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `Texto de ${networkLabels[network]} copiado` });
    } catch {
      toast({ title: "El navegador bloqueó el portapapeles", description: "Puedes seleccionar el texto y copiarlo manualmente.", variant: "destructive" });
    }
  };
  const download = () => {
    const text = SOCIAL_NETWORKS.map(id => `${networkLabels[id]}\n${textFor(id)}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "santos-saucedo-copies.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  return <section className="space-y-3 border-t pt-5" aria-labelledby="social-copy-heading">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 id="social-copy-heading" className="font-semibold text-[#0B2850]">Copy por red social</h3>
      {!readOnly && <Button type="button" variant="outline" size="sm" disabled={regenerateDisabled} onClick={onRegenerate}>Actualizar copy con IA</Button>}
    </div>
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Red social">
      {SOCIAL_NETWORKS.map(id => <Button key={id} type="button" variant={id === network ? "default" : "outline"} size="sm"
        aria-pressed={id === network} className={id === network ? primaryClass : undefined} onClick={() => setNetwork(id)}>{networkLabels[id]}</Button>)}
    </div>
    <Label htmlFor="social-channel-copy">Texto para {networkLabels[network]}</Label>
    <Textarea id="social-channel-copy" rows={5} maxLength={socialCopyLimits[network]} readOnly={readOnly} disabled={pending && !readOnly} value={value}
      onChange={event => {
        const copies = Object.fromEntries(SOCIAL_NETWORKS.map(id => [id, id === network ? event.target.value : textFor(id)]));
        onChange({ ...content, copies: copies as SocialContent["copies"] });
      }} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{value.length.toLocaleString("es-MX")} / {socialCopyLimits[network].toLocaleString("es-MX")} caracteres</span>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!value.trim()} onClick={() => void copy()}><Clipboard aria-hidden="true" />Copiar texto</Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>Descargar textos</Button>
      </div>
    </div>
  </section>;
}

function PieceEditor({ piece, onSaved, onClose }: { piece: PieceDetail; onSaved: (piece: PieceDetail) => void; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(piece.title);
  const [content, setContent] = useState<SocialContent>(piece.content);
  const [format, setFormat] = useState(piece.format);
  const [palette, setPalette] = useState<PaletteRequest>(piece.content.design?.requestedPalette ?? piece.palette);
  const [direction, setDirection] = useState<Direction>(piece.content.design?.direction ?? "varied");
  const [background, setBackground] = useState<Background>(piece.content.design?.background ?? "auto");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [index, setIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewDraft, setPreviewDraft] = useState<{ index: number; slide: SocialContent["slides"][number] } | null>(null);
  const historical = piece.versions.find(item => String(item.version) === selectedVersion);
  const shown = historical ?? piece;
  const readOnly = Boolean(historical) || piece.status === "archived";
  const shownContent = readOnly ? shown.content : content;
  const activeIndex = Math.min(index, shownContent.slides.length - 1);
  const slide = shownContent.slides[activeIndex];
  const onError = (error: Error) => toast({ title: "No se pudo completar", description: error.message, variant: "destructive" });
  const edit = useMutation({
    mutationFn: () => request<PieceDetail>("PATCH", `/${piece.id}`, { title, version: piece.version, content: { caption: content.caption, slides: content.slides, copies: content.copies } }),
    onSuccess: onSaved,
    onError,
  });
  const redesign = useMutation({
    mutationFn: () => request<PieceDetail>("POST", `/${piece.id}/redesign`, {
      format, palette, designDirection: direction, background, version: piece.version,
    }),
    onSuccess: onSaved,
    onError,
  });
  const review = useMutation({
    mutationFn: () => request<Review>("POST", `/${piece.id}/review`, {}),
    onError,
  });
  const regenerate = useMutation({
    mutationFn: () => request<PieceDetail>("POST", `/${piece.id}/regenerate`, { version: piece.version, copiesOnly: true }),
    onSuccess: onSaved,
    onError,
  });
  const pending = edit.isPending || redesign.isPending || review.isPending || regenerate.isPending;
  const hasEdits = title !== piece.title || content !== piece.content;
  const valid = title.trim() && socialContentSchema.safeParse({
    caption: content.caption,
    slides: content.slides,
    copies: content.copies,
  });
  const visualDraft = !readOnly && slide !== piece.content.slides[activeIndex] && Boolean(slide?.title.trim() && slide?.body.trim());
  useEffect(() => {
    if (!visualDraft) {
      setPreviewDraft(null);
      return;
    }
    const timer = window.setTimeout(() => setPreviewDraft({ index: activeIndex, slide }), 500);
    return () => window.clearTimeout(timer);
  }, [activeIndex, slide, visualDraft]);
  const isCurrentPreview = visualDraft && previewDraft?.index === activeIndex && previewDraft.slide === slide;
  const preview = useQuery({
    queryKey: [base, piece.id, "preview", piece.version, previewDraft],
    enabled: isCurrentPreview && !pending,
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(`${base}/${piece.id}/preview`, {
        method: "POST",
        credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ version: piece.version, ...previewDraft }),
        signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo actualizar la vista previa.");
      }
      return response.blob();
    },
  });
  useEffect(() => {
    const url = isCurrentPreview && preview.data ? URL.createObjectURL(preview.data) : "";
    setPreviewUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [isCurrentPreview, preview.data]);

  const updateSlide = (patch: Partial<SocialContent["slides"][number]>) => {
    setContent(prev => ({ ...prev, slides: prev.slides.map((item, i) => i === activeIndex ? { ...item, ...patch } : item) }));
  };
  const updateDesign = (design: PieceDesign) => updateSlide({ design: { ...slide.design, ...design } });
  const sameDesign = format === piece.format && palette === (piece.content.design?.requestedPalette ?? piece.palette) && direction === (piece.content.design?.direction ?? "varied") && background === (piece.content.design?.background ?? "auto");
  const fileNumber = activeIndex + 1;
  const slideUrl = shown.slideUrls[activeIndex];
  const htmlUrl = shown.htmlUrls?.[activeIndex];
  async function copyHtml() {
    if (!htmlUrl) return;
    try {
      const response = await adminApiRequest("GET", htmlUrl);
      if (!response.ok) throw new Error("No se pudo cargar el HTML de esta pieza.");
      await navigator.clipboard.writeText(await response.text());
      toast({ title: "HTML copiado" });
    } catch {
      toast({ title: "No se pudo copiar el HTML", description: "Usa la descarga de HTML editable para obtener el archivo.", variant: "destructive" });
    }
  }
  return <section className="scroll-mt-24 space-y-5 border bg-background p-5 sm:p-7" aria-label={`Estudio de ${piece.title}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <p className="text-sm text-muted-foreground">Estudio de diseño</p>
        <h2 className="break-words text-2xl font-semibold text-[#0B2850]">{shown.title}</h2>
        <p className="text-sm text-muted-foreground">Versión {shown.version} · {socialFormats[shown.format]?.label}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {shown.packageUrl && <AssetDownloadButton url={shown.packageUrl} filename={`santos-saucedo-social.${shown.packageExtension}`}>Descargar paquete</AssetDownloadButton>}
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onClose}>Cerrar estudio</Button>
      </div>
    </div>
    {piece.versions.length > 0 && <div className="max-w-52 space-y-1.5">
      <Label htmlFor="social-versions">Historial de versiones</Label>
      <select id="social-versions" className={selectClass} value={selectedVersion} onChange={event => { setSelectedVersion(event.target.value); setIndex(0); }}>
        <option value="">Versión actual</option>
        {piece.versions.map(version => <option key={version.version} value={version.version}>Versión {version.version}</option>)}
      </select>
    </div>}
    {shownContent.slides.length > 1 && <div className="flex gap-2 overflow-x-auto p-1" role="group" aria-label="Piezas del diseño">
      {shownContent.slides.map((item, i) => <Button type="button" key={i} size="sm"
        variant={i === activeIndex ? "default" : "outline"} className={i === activeIndex ? primaryClass : undefined}
        title={item.title} aria-pressed={i === activeIndex} onClick={() => setIndex(i)}>Pieza {i + 1}</Button>)}
    </div>}
    {slide && <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Pieza {fileNumber} de {shownContent.slides.length}</p>
          <div className="flex flex-wrap gap-2">
            {slideUrl && <AssetDownloadButton url={slideUrl} filename={`pieza-${fileNumber}.png`}>Descargar PNG</AssetDownloadButton>}
            {htmlUrl && <>
              <AssetDownloadButton url={htmlUrl} filename={`pieza-${fileNumber}.html`}>HTML editable</AssetDownloadButton>
              <Button type="button" variant="ghost" size="sm" onClick={() => void copyHtml()}>Copiar HTML</Button>
            </>}
          </div>
        </div>
        <div className="grid place-items-center border bg-muted/35 px-3 py-4 sm:p-5">
          <div className="w-full max-w-[27rem]">
            {previewUrl ? <img src={previewUrl} alt={`Vista previa de la pieza ${fileNumber} con cambios`} className="w-full rounded-md border" />
              : slideUrl ? <PrivateAssetPreview url={slideUrl} label={`${shown.title}, pieza ${fileNumber}`} />
              : <p className="p-6 text-sm text-muted-foreground">Esta pieza todavía no tiene una imagen guardada.</p>}
          </div>
        </div>
        {isCurrentPreview && preview.isFetching && <p className="text-sm text-muted-foreground" role="status">Actualizando vista previa…</p>}
        {isCurrentPreview && preview.isError && <p className="text-sm text-destructive" role="alert">{preview.error.message}</p>}
        {visualDraft && <p className="text-xs text-muted-foreground">Las descargas corresponden a la última versión guardada.</p>}
      </div>
      {readOnly ? <div className="min-w-0 space-y-2 border p-4">
        <h3 className="font-semibold text-[#0B2850]">{slide.title}</h3>
        <p className="whitespace-pre-line break-words text-sm">{slide.body}</p>
      </div> : <div className="min-w-0 space-y-3 border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <h3 className="font-semibold text-[#0B2850]">Editar pieza</h3>
          <span className="text-xs text-muted-foreground">{hasEdits ? "Cambios por guardar" : "Guardado"}</span>
        </div>
        <fieldset disabled={pending} className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="social-edit-title">Título interno del proyecto</Label>
            <Input id="social-edit-title" maxLength={180} value={title} onChange={event => setTitle(event.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="social-slide-title">Título de la pieza</Label>
            <Textarea id="social-slide-title" rows={2} maxLength={90} value={slide.title} onChange={event => updateSlide({ title: event.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="social-slide-body">Texto en la imagen</Label>
            <Textarea id="social-slide-body" rows={3} maxLength={220} value={slide.body} onChange={event => updateSlide({ body: event.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="social-slide-direction">Dirección de esta pieza</Label>
            <select id="social-slide-direction" className={selectClass} value={slide.design?.direction ?? ""} onChange={event => updateDesign({ direction: (event.target.value || undefined) as Direction | undefined })}>
              <option value="">Según el proyecto</option><DirectionOptions />
            </select></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="social-slide-palette">Paleta de esta pieza</Label>
              <select id="social-slide-palette" className={selectClass} value={slide.design?.palette ?? ""} onChange={event => updateDesign({ palette: (event.target.value || undefined) as Palette | undefined })}>
                <option value="">Según el proyecto</option><PaletteOptions />
              </select></div>
            <div className="space-y-1.5"><Label htmlFor="social-slide-background">Fondo de esta pieza</Label>
              <select id="social-slide-background" className={selectClass} value={slide.design?.background ?? ""} onChange={event => updateDesign({ background: (event.target.value || undefined) as Background | undefined })}>
                <option value="">Según el proyecto</option><BackgroundOptions />
              </select></div>
          </div>
        </fieldset>
      </div>}
    </div>}
    {!readOnly && <details className="group border-t pt-4">
      <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium text-[#0B2850]">
        Rediseño y revisión<ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5"><Label htmlFor="social-redesign-format">Formato del proyecto</Label><select className={selectClass} id="social-redesign-format" value={format} onChange={event => setFormat(event.target.value as SocialFormat)}><FormatOptions /></select></div>
        <div className="space-y-1.5"><Label htmlFor="social-redesign-palette">Paleta del proyecto</Label><select className={selectClass} id="social-redesign-palette" value={palette} onChange={event => setPalette(event.target.value as PaletteRequest)}><option value="auto">Según el material</option><option value="mixed">Combinar paletas</option><PaletteOptions /></select></div>
        <div className="space-y-1.5"><Label htmlFor="social-redesign-direction">Dirección del proyecto</Label><select className={selectClass} id="social-redesign-direction" value={direction} onChange={event => setDirection(event.target.value as Direction)}><DirectionOptions /></select></div>
        <div className="space-y-1.5"><Label htmlFor="social-redesign-background">Fondo del proyecto</Label><select className={selectClass} id="social-redesign-background" value={background} onChange={event => setBackground(event.target.value as Background)}><BackgroundOptions /></select></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={pending || hasEdits || sameDesign} onClick={() => redesign.mutate()}>{redesign.isPending ? "Renderizando…" : "Guardar rediseño"}</Button>
        <Button type="button" variant="outline" disabled={pending || hasEdits} onClick={() => review.mutate()}>{review.isPending ? "Revisando…" : "Revisar con IA"}</Button>
      </div>
      {review.data && <div className="mt-3 space-y-1 border-l-2 border-[#8CC63F] pl-3 text-sm" role="status">
        <p>{review.data.summary}</p>
        {!!review.data.suggestions.length && <ul className="list-disc space-y-1 pl-5">{review.data.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>}
      </div>}
    </details>}
    <ChannelCopy content={shownContent} readOnly={readOnly} pending={pending} regenerateDisabled={pending || hasEdits} onChange={setContent} onRegenerate={() => regenerate.mutate()} />
    {shown.content.design?.webSearch && <section className="space-y-2 border-t pt-4">
      <h3 className="font-semibold text-[#0B2850]">Fuentes web</h3>
      {shown.content.sources?.length ? <ul className="space-y-1 text-sm">
        {shown.content.sources.filter(url => /^https?:\/\//i.test(url)).map(url => <li key={url} className="break-all">
          <a className="underline underline-offset-2" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </li>)}
      </ul> : <p className="text-sm text-muted-foreground">No se recuperaron fuentes web. Se usó el material compartido.</p>}
    </section>}
    {!readOnly && <div className="flex flex-wrap items-center gap-2 border-t pt-4">
      <Button type="button" className={primaryClass} disabled={pending || !hasEdits || !valid || !valid.success} onClick={() => edit.mutate()}>{edit.isPending ? "Guardando…" : "Guardar versión"}</Button>
      <Button type="button" variant="outline" disabled={pending || !hasEdits} onClick={() => { setTitle(piece.title); setContent(piece.content); }}>Descartar cambios</Button>
      {hasEdits && valid && !valid.success && <p className="text-xs text-destructive">{valid.error.issues[0]?.message}</p>}
    </div>}
  </section>;
}

export default function AdminSocial() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const studioRef = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<Piece["kind"]>("post");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("es");
  const [format, setFormat] = useState<SocialFormat>("portrait");
  const [palette, setPalette] = useState<PaletteRequest>("auto");
  const [direction, setDirection] = useState<Direction>("varied");
  const [background, setBackground] = useState<Background>("auto");
  const [slideCount, setSlideCount] = useState("5");
  const [sourceNotes, setSourceNotes] = useState("");
  const [illustrate, setIllustrate] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [images, setImages] = useState<UploadedDoc[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { requireAuth(); }, [requireAuth]);
  useEffect(() => {
    if (selected) {
      const studio = studioRef.current;
      studio?.focus({ preventScroll: true });
      studio?.scrollIntoView({ block: "start" });
    }
  }, [selected]);

  const assets = useQuery({
    queryKey: [base, archived, page],
    enabled: isAuthenticated,
    queryFn: () => request<HistoryPage>("GET", `?archived=${archived}&page=${page}`),
  });
  const detail = useQuery({
    queryKey: [base, selected],
    enabled: isAuthenticated && selected !== null,
    queryFn: () => request<PieceDetail>("GET", `/${selected}`),
  });
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: [base] }); };
  const onError = (error: Error) => toast({ title: "No se pudo completar", description: error.message, variant: "destructive" });
  const onSaved = (piece: PieceDetail) => {
    queryClient.setQueryData([base, piece.id], piece);
    refresh();
    toast({ title: "Versión guardada" });
  };
  const generate = useMutation({
    mutationFn: () => request<PieceDetail>("POST", "/generate", {
      kind, title, topic, language, format, slideCount: kind === "post" ? 1 : Number(slideCount),
      palette, designDirection: direction, background, sourceNotes, documents, supportImages: images, illustrate, webSearch,
    }),
    onSuccess: (piece) => {
      queryClient.setQueryData([base, piece.id], piece);
      refresh();
      setArchived(false);
      setPage(1);
      setSelected(piece.id);
      setTitle("");
      setTopic("");
      setSourceNotes("");
      setDocuments([]);
      setImages([]);
      toast({ title: piece.kind === "carousel" ? "Carrusel generado" : "Post generado" });
    },
    onError,
  });
  const action = useMutation({
    mutationFn: ({ id, type }: Action) => type === "copy" ? request<PieceDetail>("POST", `/${id}/copy`, {})
      : request<Piece>("POST", `/${id}/archive`, { archived: type === "archive" }),
    onSuccess: (piece, { type }) => {
      if (type === "copy") queryClient.setQueryData([base, piece.id], piece);
      refresh();
      setSelected(type === "copy" ? piece.id : null);
      setPage(1);
      toast({ title: type === "archive" ? "Pieza enviada a la papelera" : type === "restore" ? "Pieza restaurada" : "Copia guardada" });
    },
    onError,
  });

  const hasSource = Boolean(topic.trim() || sourceNotes.trim() || documents.length);
  const webHasQuery = !webSearch || Boolean(topic.trim() || title.trim());
  const canGenerate = hasSource && webHasQuery && !uploadingDocuments && !uploadingImages && !generate.isPending;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canGenerate) generate.mutate();
  }

  const swatchColors = palette === "auto" || palette === "mixed" ? palettes["navy-lime"].colors : palettes[palette].colors;
  const formatSpec = socialFormats[format];

  return <div className="mx-auto max-w-6xl space-y-6" data-testid="page-admin-social">
    <AdminPageHeader title="Post y Carruseles IA" description="Prepara piezas para redes sociales y textos por canal con la identidad de Santos & Saucedo." />
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <span className="size-2 rounded-full bg-[#8CC63F]" aria-hidden="true" />
      Sol (gpt-6.1-sol) · Fast · Identidad Santos & Saucedo
    </p>
    <form className="space-y-5 border bg-background p-5 sm:p-7" onSubmit={submit}>
      <fieldset disabled={generate.isPending} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="social-topic">Tema / instrucciones</Label>
            <Textarea id="social-topic" maxLength={10_000} value={topic} onChange={event => setTopic(event.target.value)} className="min-h-28"
              placeholder="Ej. Un carrusel para responsables de recursos humanos sobre cómo preparar una auditoría laboral." />
            <p className="text-xs text-muted-foreground">Indica el objetivo y el público. Puedes dejarlo vacío si adjuntas documentos o pegas información de apoyo.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Información de referencia <span className="font-normal text-muted-foreground">(opcional)</span></p>
            <DocumentUpload docs={documents} onChange={setDocuments} onUploadingChange={setUploadingDocuments} maxTotalMb={200} />
          </div>
        </div>

        <details className="group border-b pb-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0B2850]">
            <ChevronDown className="size-4 -rotate-90 transition-transform group-open:rotate-0" aria-hidden="true" /> Pegar información adicional
          </summary>
          <div className="mt-3 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="social-notes">Material de apoyo</Label>
              <Textarea id="social-notes" maxLength={20_000} rows={4} value={sourceNotes} onChange={event => setSourceNotes(event.target.value)}
                placeholder="Pega contexto, datos, citas o indicaciones que el agente deba conservar." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="social-title">Título interno (opcional)</Label>
              <Input id="social-title" maxLength={180} value={title} onChange={event => setTitle(event.target.value)} />
            </div>
          </div>
        </details>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label htmlFor="social-kind">Qué quieres crear</Label>
            <select className={selectClass} id="social-kind" value={kind} onChange={event => {
              const nextKind = event.target.value as Piece["kind"];
              setKind(nextKind);
              if (nextKind === "post" && palette === "mixed") setPalette("auto");
            }}><option value="post">Un solo post</option><option value="carousel">Un carrusel</option></select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="social-slides">Piezas del carrusel</Label>
            <Input id="social-slides" type="number" disabled={kind === "post"} required min={2} max={12}
              value={kind === "post" ? 1 : slideCount} onChange={event => setSlideCount(event.target.value)} />
          </div>
          <div className="space-y-1.5"><Label htmlFor="social-format">Formato de las imágenes</Label>
            <select className={selectClass} id="social-format" value={format} onChange={event => setFormat(event.target.value as SocialFormat)}><FormatOptions /></select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground" role="status">{formatSpec.label} · {formatSpec.width} × {formatSpec.height} px</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label htmlFor="social-direction">Dirección de diseño</Label>
            <select className={selectClass} id="social-direction" value={direction} onChange={event => setDirection(event.target.value as Direction)}><DirectionOptions /></select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="social-language">Idioma</Label>
            <select className={selectClass} id="social-language" value={language} onChange={event => setLanguage(event.target.value)}>{SUPPORTED_LANGUAGES.map(({ code, nameNative }) => <option value={code} key={code}>{nameNative}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Identidad gráfica</p>
            <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 rounded-md border bg-muted/25 px-3 py-2 text-sm text-[#0B2850]">
              <Swatches colors={palettes["navy-lime"].colors} /><strong>Santos &amp; Saucedo</strong>
            </div>
          </div>
        </div>

        <div className="space-y-1.5"><Label htmlFor="social-palette">Paleta de colores</Label>
          <select className={selectClass} id="social-palette" value={palette} onChange={event => setPalette(event.target.value as PaletteRequest)}>
            <option value="auto">Según el material</option>
            {kind === "carousel" && <option value="mixed">Combinar paletas de la firma</option>}
            <PaletteOptions />
          </select>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Swatches colors={swatchColors} />Puedes ajustar la paleta de cada pieza en el estudio.</p>
        </div>
        <div className="space-y-1.5"><Label htmlFor="social-background">Tratamiento del fondo</Label>
          <select className={selectClass} id="social-background" value={background} onChange={event => setBackground(event.target.value as Background)}><BackgroundOptions /></select>
        </div>

        <div className="divide-y border-y">
          <div className="flex items-center justify-between gap-4 py-3">
            <div><Label htmlFor="social-illustrate">Generar fotografías de apoyo con IA</Label><p id="social-illustrate-help" className="mt-1 text-xs text-muted-foreground">Las imágenes que subas tienen prioridad. La generación usa créditos.</p></div>
            <Switch id="social-illustrate" aria-describedby="social-illustrate-help" className="shrink-0 data-[state=checked]:bg-[#0B2850]" checked={illustrate} onCheckedChange={setIllustrate} />
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <div><Label htmlFor="social-web">Consultar información en la web</Label><p id="social-web-help" className="mt-1 text-xs text-muted-foreground">Usa el tema para buscar fuentes actuales. Con la opción apagada se usa tu material.</p></div>
            <Switch id="social-web" aria-describedby="social-web-help" className="shrink-0 data-[state=checked]:bg-[#0B2850]" checked={webSearch} onCheckedChange={setWebSearch} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Imágenes de apoyo <span className="font-normal text-muted-foreground">(opcional)</span></p>
          <SupportImages images={images} onChange={setImages} onUploadingChange={setUploadingImages} />
        </div>
        {!webHasQuery && <p className="text-sm text-destructive">Escribe un tema o un título para la búsqueda web.</p>}
        {generate.isError && <p role="alert" className="text-sm text-destructive">{generate.error.message}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button className={primaryClass} disabled={!canGenerate}>
            {generate.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {generate.isPending ? "Generando piezas…" : kind === "post" ? "Generar post y copy" : "Generar carrusel y copy"}
          </Button>
          <span className="text-xs text-muted-foreground">Recibirás PNG, HTML editable y copy para seis redes.</span>
        </div>
        {generate.isPending && <p role="status" className="border-l-2 border-[#8CC63F] pl-3 text-sm text-muted-foreground">Preparando el texto, el diseño y los archivos.</p>}
      </fieldset>
    </form>

    {selected && <div ref={studioRef} className="scroll-mt-24" tabIndex={-1}>
      {detail.data ? <PieceEditor key={`${detail.data.id}:${detail.data.version}`} piece={detail.data} onSaved={onSaved} onClose={() => setSelected(null)} />
        : detail.isError ? <p role="alert" className="border p-5 text-sm text-destructive">{detail.error.message}</p>
        : <p role="status" className="border p-5 text-sm text-muted-foreground">Abriendo estudio…</p>}
    </div>}

    <section className="space-y-4 border bg-background p-5 sm:p-7" aria-labelledby="social-library">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Biblioteca del estudio</p>
          <h2 id="social-library" className="mt-1 text-xl font-semibold text-[#0B2850]">{archived ? "Papelera del estudio" : "Posts y carruseles guardados"}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => { setSelected(null); setPage(1); setArchived(!archived); }}>{archived ? "Volver al historial" : "Ver papelera"}</Button>
          <Button type="button" variant="outline" size="sm" disabled={assets.isFetching} onClick={() => void assets.refetch()}>
            <RefreshCw className={assets.isFetching ? "animate-spin" : undefined} aria-hidden="true" />Actualizar
          </Button>
        </div>
      </div>
      {assets.isLoading && <p role="status" className="text-sm text-muted-foreground">Cargando piezas…</p>}
      {assets.isError && <p role="alert" className="text-sm text-destructive">{assets.error.message}</p>}
      {assets.data?.items.length === 0 && <p className="border-t py-5 text-sm text-muted-foreground">{archived ? "La papelera está vacía." : "Genera un post o carrusel para abrir el estudio."}</p>}
      {assets.data && assets.data.items.length > 0 && <ul className="divide-y border-t">
        {assets.data.items.map(piece => <li key={piece.id} className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-3 py-3 sm:grid-cols-[5.25rem_minmax(0,1fr)_auto] sm:gap-4">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-muted/40">
            {!archived && piece.slideUrls[0] ? <PrivateAssetPreview url={piece.slideUrls[0]} label={`Miniatura de ${piece.title}`} />
              : <Images className="size-5 text-muted-foreground" aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            {(piece.updatedAt || piece.createdAt) && <time dateTime={piece.updatedAt || piece.createdAt} className="text-xs text-muted-foreground">{new Date(piece.updatedAt || piece.createdAt!).toLocaleDateString("es-MX")}</time>}
            <h3 className="break-words font-semibold text-[#0B2850]">{piece.title}</h3>
            <p className="text-xs text-muted-foreground">{piece.kind === "carousel" ? "Carrusel" : "Post"} · {piece.slideCount} {piece.slideCount === 1 ? "pieza" : "piezas"} · {socialFormats[piece.format]?.label} · v{piece.version}</p>
          </div>
          <div className="col-span-2 flex flex-wrap gap-1 sm:col-span-1 sm:justify-end">
            <Button type="button" variant="outline" size="sm" aria-expanded={selected === piece.id} onClick={() => setSelected(selected === piece.id ? null : piece.id)}>{selected === piece.id ? "Cerrar estudio" : "Abrir estudio"}</Button>
            {!archived && <Button type="button" variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ id: piece.id, type: "copy" })}>Duplicar</Button>}
            <Button type="button" variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ id: piece.id, type: archived ? "restore" : "archive" })}>{archived ? "Restaurar" : "A papelera"}</Button>
          </div>
        </li>)}
      </ul>}
      {(page > 1 || assets.data?.hasMore) && <nav aria-label="Páginas del historial" className="flex items-center justify-between gap-2 border-t pt-4">
        <Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => { setSelected(null); setPage(page - 1); }}>Anterior</Button>
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <Button type="button" variant="outline" size="sm" disabled={!assets.data?.hasMore} onClick={() => { setSelected(null); setPage(page + 1); }}>Siguiente</Button>
      </nav>}
    </section>
  </div>;
}
