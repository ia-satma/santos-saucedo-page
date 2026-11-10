import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AssetDownloadButton, PrivateAssetPreview } from "@/components/admin/AssetFiles";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import { socialFormats, type SocialContent, type SocialFormat } from "@shared/socialStudio";

const base = "/api/admin/social-assets";
const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
type Palette = "navy-lime" | "navy-white";
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
  packageUrl: string | null;
  packageExtension: "zip" | "json";
};
type Revision = Pick<Piece, "title" | "version" | "format" | "slideUrls" | "packageUrl" | "packageExtension"> & { content: SocialContent };
type PieceDetail = Piece & { content: SocialContent; versions: Revision[] };
type Review = { summary: string; suggestions: string[] };
type HistoryPage = { items: Piece[]; hasMore: boolean };
type Action = { id: string; type: "copy" | "archive" | "restore" };

async function request<T>(method: string, endpoint = "", data?: unknown): Promise<T> {
  const response = await adminApiRequest(method, `${base}${endpoint}`, data);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "No se pudo completar la operación.");
  return body;
}

function FormatOptions() {
  return <>{Object.entries(socialFormats).map(([id, format]) =>
    <option key={id} value={id}>{format.label} · {format.width} × {format.height}</option>
  )}</>;
}

function PaletteOptions() {
  return <><option value="navy-lime">Azul marino y lima</option><option value="navy-white">Blanco y azul marino</option></>;
}

function PieceFiles({ title, slideUrls, packageUrl, packageExtension }: Pick<Piece, "title" | "slideUrls" | "packageUrl" | "packageExtension">) {
  if (!slideUrls.length && !packageUrl) return <p className="text-sm text-muted-foreground">Esta versión aún no tiene archivos.</p>;
  return <div className="space-y-3">
    <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
      {slideUrls.map((url, index) => <figure key={url} className="min-w-0">
        <PrivateAssetPreview url={url} label={`${title}, pieza ${index + 1}`} />
        <figcaption className="mt-2"><AssetDownloadButton url={url} filename={`pieza-${index + 1}.png`}>PNG {index + 1}</AssetDownloadButton></figcaption>
      </figure>)}
    </div>
    {packageUrl && <AssetDownloadButton url={packageUrl} filename={`santos-saucedo-social.${packageExtension}`}>Descargar paquete</AssetDownloadButton>}
  </div>;
}

function PieceEditor({ piece, onSaved }: { piece: PieceDetail; onSaved: (piece: PieceDetail) => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(piece.title);
  const [content, setContent] = useState(piece.content);
  const [format, setFormat] = useState(piece.format);
  const [palette, setPalette] = useState(piece.palette);
  const [selectedVersion, setSelectedVersion] = useState("");
  const historical = piece.versions.find(item => String(item.version) === selectedVersion);
  const onError = (error: Error) => toast({ title: "No se pudo completar", description: error.message, variant: "destructive" });
  const edit = useMutation({
    mutationFn: () => request<PieceDetail>("PATCH", `/${piece.id}`, {
      title, version: piece.version, content: { caption: content.caption, slides: content.slides },
    }),
    onSuccess: onSaved,
    onError,
  });
  const redesign = useMutation({
    mutationFn: () => request<PieceDetail>("POST", `/${piece.id}/redesign`, { format, palette, version: piece.version }),
    onSuccess: onSaved,
    onError,
  });
  const review = useMutation({
    mutationFn: () => request<Review>("POST", `/${piece.id}/review`, {}),
    onError,
  });
  const regenerate = useMutation({
    mutationFn: () => request<PieceDetail>("POST", `/${piece.id}/regenerate`, { version: piece.version }),
    onSuccess: onSaved,
    onError,
  });
  const pending = edit.isPending || redesign.isPending || review.isPending || regenerate.isPending;
  const hasEdits = title !== piece.title || content !== piece.content;
  const archived = piece.status === "archived";
  return <section className="space-y-4 border-t pt-5" aria-label={`Edición de ${piece.title}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-medium">Versión {piece.version}</h3>
      {piece.versions.length > 0 && <select className={`${selectClass} w-auto`} value={selectedVersion} onChange={event => setSelectedVersion(event.target.value)} aria-label="Versiones guardadas">
        <option value="">Versión actual</option>
        {piece.versions.map(version => <option key={version.version} value={version.version}>Versión {version.version}</option>)}
      </select>}
    </div>
    <PieceFiles {...(historical ?? piece)} />
    {historical || archived ? <div className="space-y-2 text-sm">
      {(historical ?? piece).content.slides.map((slide, index) => <div key={index}><strong>{slide.title}</strong><p className="whitespace-pre-line">{slide.body}</p></div>)}
      <p className="whitespace-pre-wrap">{(historical ?? piece).content.caption}</p>
    </div> : <>
      <form onSubmit={event => { event.preventDefault(); edit.mutate(); }} className="space-y-3">
        <div><Label htmlFor="social-edit-title">Título interno</Label><Input id="social-edit-title" maxLength={180} required value={title} onChange={event => setTitle(event.target.value)} /></div>
        <div><Label htmlFor="social-edit-caption">Texto para publicar</Label><Textarea id="social-edit-caption" maxLength={2500} required value={content.caption} onChange={event => setContent({ ...content, caption: event.target.value })} /></div>
        {content.slides.map((slide, index) => <fieldset key={index} className="space-y-2 border-t py-2">
          <legend className="pr-2 text-sm font-medium">Pieza {index + 1}</legend>
          <div><Label htmlFor={`social-edit-slide-${index}`}>Título</Label><Input id={`social-edit-slide-${index}`} required maxLength={90} value={slide.title} onChange={event => setContent({
            ...content, slides: content.slides.map((item, i) => i === index ? { ...item, title: event.target.value } : item),
          })} /></div>
          <div><Label htmlFor={`social-edit-body-${index}`}>Texto en la imagen</Label><Textarea id={`social-edit-body-${index}`} required maxLength={220} value={slide.body} onChange={event => setContent({
            ...content, slides: content.slides.map((item, i) => i === index ? { ...item, body: event.target.value } : item),
          })} /></div>
        </fieldset>)}
        <div className="flex flex-wrap gap-2">
          <Button disabled={pending || !hasEdits}>{edit.isPending ? "Guardando…" : "Guardar versión"}</Button>
          <Button type="button" variant="outline" disabled={pending || !hasEdits} onClick={() => { setTitle(piece.title); setContent(piece.content); }}>Descartar cambios</Button>
        </div>
      </form>
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-medium">Rediseño y revisión</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="social-redesign-format">Formato</Label><select className={selectClass} id="social-redesign-format" value={format} onChange={event => setFormat(event.target.value as SocialFormat)}><FormatOptions /></select></div>
          <div><Label htmlFor="social-redesign-palette">Combinación de marca</Label><select className={selectClass} id="social-redesign-palette" value={palette} onChange={event => setPalette(event.target.value as Palette)}><PaletteOptions /></select></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending || hasEdits || (format === piece.format && palette === piece.palette)} onClick={() => redesign.mutate()}>{redesign.isPending ? "Renderizando…" : "Guardar rediseño"}</Button>
          <Button variant="outline" disabled={pending || hasEdits} onClick={() => regenerate.mutate()}>{regenerate.isPending ? "Redactando…" : "Regenerar textos"}</Button>
          <Button variant="outline" disabled={pending || hasEdits} onClick={() => review.mutate()}>{review.isPending ? "Revisando…" : "Revisar con IA"}</Button>
        </div>
        {review.data && <div className="space-y-1 border-l-2 border-[#8CC63F] pl-3 text-sm" role="status">
          <p>{review.data.summary}</p>
          {!!review.data.suggestions.length && <ul className="list-disc space-y-1 pl-5">{review.data.suggestions.map((item, index) => <li key={index}>{item}</li>)}</ul>}
        </div>}
      </div>
    </>}
  </section>;
}

export default function AdminSocial() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [kind, setKind] = useState<Piece["kind"]>("post");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("es");
  const [format, setFormat] = useState<SocialFormat>("square");
  const [palette, setPalette] = useState<Palette>("navy-lime");
  const [slideCount, setSlideCount] = useState("4");
  const [sourceNotes, setSourceNotes] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { requireAuth(); }, [requireAuth]);

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
      kind, title, topic, language, format, slideCount: kind === "post" ? 1 : Number(slideCount), palette, sourceNotes,
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
      toast({ title: kind === "carousel" ? "Carrusel generado" : "Post generado" });
    },
    onError,
  });
  const action = useMutation({
    mutationFn: ({ id, type }: Action) => type === "copy" ? request<PieceDetail>("POST", `/${id}/copy`, {})
      : request<Piece>("POST", `/${id}/archive`, { archived: type === "archive" }),
    onSuccess: (piece, { type }) => {
      refresh();
      setSelected(type === "copy" ? piece.id : null);
      setPage(1);
      toast({ title: type === "archive" ? "Pieza enviada a la papelera" : type === "restore" ? "Pieza restaurada" : "Copia guardada" });
    },
    onError,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!generate.isPending) generate.mutate();
  }

  return <div className="space-y-6" data-testid="page-admin-social">
    <AdminPageHeader title="Post y Carruseles IA" description="Genera piezas para redes sociales con la identidad de Santos & Saucedo." />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <form className="space-y-4 border bg-white p-5" onSubmit={submit}>
        <h2 className="text-lg font-semibold text-[#0B2850]">Nueva pieza</h2>
        <div><Label htmlFor="social-kind">Tipo de pieza</Label><select className={selectClass} id="social-kind" value={kind} onChange={event => setKind(event.target.value as Piece["kind"])}><option value="post">Post</option><option value="carousel">Carrusel</option></select></div>
        <div><Label htmlFor="social-title">Título interno</Label><Input id="social-title" required maxLength={180} value={title} onChange={event => setTitle(event.target.value)} /></div>
        <div><Label htmlFor="social-topic">Tema e instrucciones</Label><Textarea id="social-topic" required maxLength={10_000} value={topic} onChange={event => setTopic(event.target.value)} className="min-h-28" /></div>
        <div><Label htmlFor="social-notes">Material de apoyo (opcional)</Label><Textarea id="social-notes" maxLength={20_000} value={sourceNotes} onChange={event => setSourceNotes(event.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="social-language">Idioma</Label><select className={selectClass} id="social-language" value={language} onChange={event => setLanguage(event.target.value)}>{SUPPORTED_LANGUAGES.map(({ code, name }) => <option value={code} key={code}>{name}</option>)}</select></div>
          <div><Label htmlFor="social-format">Formato</Label><select className={selectClass} id="social-format" value={format} onChange={event => setFormat(event.target.value as SocialFormat)}><FormatOptions /></select></div>
        </div>
        <div><Label htmlFor="social-palette">Combinación de marca</Label><select className={selectClass} id="social-palette" value={palette} onChange={event => setPalette(event.target.value as Palette)}><PaletteOptions /></select></div>
        {kind === "carousel" && <div><Label htmlFor="social-slides">Piezas del carrusel</Label><Input id="social-slides" type="number" required min={2} max={12} value={slideCount} onChange={event => setSlideCount(event.target.value)} /></div>}
        <Button disabled={generate.isPending || !title.trim() || !topic.trim()}>{generate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}{generate.isPending ? "Generando piezas…" : "Generar con IA"}</Button>
        {generate.isPending && <p role="status" className="text-sm text-muted-foreground">Preparando el texto y las imágenes para descarga.</p>}
      </form>
      <section className="space-y-4 border bg-white p-5" aria-label="Historial de piezas">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold text-[#0B2850]">{archived ? "Papelera" : "Piezas guardadas"}</h2><Button variant="outline" size="sm" onClick={() => { setSelected(null); setPage(1); setArchived(!archived); }}>{archived ? "Volver al historial" : "Ver papelera"}</Button></div>
        {assets.isLoading && <p role="status" className="text-sm text-muted-foreground">Cargando piezas…</p>}
        {assets.isError && <p role="alert" className="text-sm text-destructive">{assets.error.message}</p>}
        {assets.data?.items.length === 0 && <p className="text-sm text-muted-foreground">{archived ? "La papelera está vacía." : "Aún no hay piezas guardadas."}</p>}
        <ul className="divide-y border-t">{assets.data?.items.map(piece => <li key={piece.id} className="space-y-3 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-muted-foreground">{piece.kind === "carousel" ? "Carrusel" : "Post"} · {piece.slideCount} {piece.slideCount === 1 ? "pieza" : "piezas"} · v{piece.version}</p><h3 className="break-words font-medium">{piece.title}</h3></div>
            <div className="flex flex-wrap gap-1">
              <Button variant="outline" size="sm" aria-expanded={selected === piece.id} onClick={() => setSelected(selected === piece.id ? null : piece.id)}>{selected === piece.id ? "Cerrar" : archived ? "Ver" : "Abrir y editar"}</Button>
              {!archived && <Button variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ id: piece.id, type: "copy" })}>Duplicar</Button>}
              <Button variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ id: piece.id, type: archived ? "restore" : "archive" })}>{archived ? "Restaurar" : "A papelera"}</Button>
            </div>
          </div>
          {selected === piece.id && (detail.data ? <PieceEditor key={`${piece.id}:${detail.data.version}`} piece={detail.data} onSaved={onSaved} />
            : detail.isError ? <p role="alert" className="text-sm text-destructive">{detail.error.message}</p> : <p role="status" className="text-sm text-muted-foreground">Cargando versión…</p>)}
        </li>)}</ul>
        {(page > 1 || assets.data?.hasMore) && <nav aria-label="Páginas del historial" className="flex items-center justify-between gap-2 border-t pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => { setSelected(null); setPage(page - 1); }}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page}</span>
          <Button variant="outline" size="sm" disabled={!assets.data?.hasMore} onClick={() => { setSelected(null); setPage(page + 1); }}>Siguiente</Button>
        </nav>}
      </section>
    </div>
  </div>;
}
