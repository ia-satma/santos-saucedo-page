import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { adminApiRequest } from "@/lib/adminAuth";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { MediaField } from "@/features/site-config/MediaField";
import { TextEditor } from "@/features/admin/TextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { newsCategories } from "@shared/schema";
import { sourceLabel } from "@/lib/shareNews";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const initial = {
  title: "",
  titleEs: "",
  excerpt: "",
  excerptEs: "",
  content: "",
  contentEs: "",
  slug: "",
  imageUrl: "",
  documentUrl: "",
  documentUrlEs: "",
  sourceUrl: "",
  sourceName: "",
  category: "insights",
  categoryEs: "Insights",
  published: false,
  featuredHome: false,
  date: today(),
  publishAt: "",
  tags: "",
  memberIds: [] as string[],
};
type Draft = typeof initial;
// Estructura de la nota breve con fuente: análisis propio de la firma sobre una noticia
// externa. No se copia el texto del medio; se cita al pie con "Fuente".
const BRIEF_TEMPLATE_ES = `Contexto en una o dos frases, con palabras de la firma: qué se publicó, quién lo emitió y desde cuándo aplica.

## Qué significa para las empresas

Análisis de la firma: a quién aplica, qué cambia en la operación y qué riesgos o plazos conviene vigilar.

Recomendación práctica: qué revisar, documentar o ajustar.`;
const BRIEF_TEMPLATE_EN = `Context in one or two sentences, in the firm's own words: what was published, who issued it and when it applies.

## What it means for employers

The firm's analysis: who it applies to, what changes in day-to-day operations and which risks or deadlines to watch.

Practical recommendation: what to review, document or adjust.`;
function localInput(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export default function AdminNewsForm() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [draft, setDraft] = useState<Draft>({ ...initial });
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [revision, setRevision] = useState<string>();
  const [lang, setLang] = useState<"es" | "en">("es");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== baseline;
  useUnsavedChanges(dirty && !busy);
  const query = useQuery<any>({
    queryKey: ["/api/admin/editor/news", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const r = await adminApiRequest("GET", `/api/admin/editor/news/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
  });
  const people = useQuery<{
    items: { id: string; label: string; visible: boolean }[];
  }>({
    queryKey: ["/api/admin/catalog-order", "team"],
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/admin/catalog-order/team");
      if (!r.ok) throw new Error("No se pudo cargar el equipo.");
      return r.json();
    },
  });
  const loadedId = useRef<string>();
  const populate = (data: any) => {
    const item = data.item;
    const next = {
      ...initial,
      ...Object.fromEntries(
        Object.keys(initial)
          .filter((k) => k !== "memberIds")
          .map((k) => [k, item[k] ?? initial[k as keyof Draft]]),
      ),
      date: item.date
        ? new Date(item.date).toISOString().slice(0, 10)
        : today(),
      publishAt: item.publishAt ? localInput(item.publishAt) : "",
      tags: (item.tags ?? []).join(", "),
      memberIds: data.memberIds,
    } as Draft;
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setRevision(data.revision);
  };
  useEffect(() => {
    if (query.data && (!dirty || loadedId.current !== id)) {
      loadedId.current = id;
      populate(query.data);
    }
  }, [query.data, id]);
  const field = (key: keyof Draft, value: any) => {
    setDraft((old) => ({ ...old, [key]: value }));
    setNotice("");
  };
  const save = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...draft,
        date: draft.date ? `${draft.date}T12:00:00.000Z` : null,
        publishAt: draft.publishAt
          ? new Date(draft.publishAt).toISOString()
          : null,
        tags: Array.from(
          new Set(
            draft.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ),
        ...(revision ? { revision } : {}),
      };
      const r = await adminApiRequest(
        id ? "PUT" : "POST",
        id ? `/api/admin/editor/news/${id}` : "/api/admin/editor/news",
        payload,
      );
      const d = await r.json();
      if (!r.ok)
        throw new Error(
          d.details
            ?.map((x: any) => `${x.path.join(".")}: ${x.message}`)
            .join("\n") || d.error,
        );
      setBaseline(JSON.stringify(draft));
      setRevision(d.revision);
      setNotice(
        "Publicación guardada. Puede revisar la vista previa en ambos idiomas.",
      );
      if (!id) navigate(`/admin/news/${d.item.id}/edit`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const titleKey = lang === "es" ? "titleEs" : "title";
  const excerptKey = lang === "es" ? "excerptEs" : "excerpt";
  const contentKey = lang === "es" ? "contentEs" : "content";
  return (
    <main className="admin-overview">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-7"
      >
        <ArrowLeftIcon />
        Monitor Laboral
      </Link>
      <div className="admin-overview-heading">
        <div>
          <p className="admin-page-kicker">Editor de publicaciones</p>
          <h1>{id ? "Editar publicación" : "Nueva publicación"}</h1>
          <p className="admin-page-description">
            Guarde un borrador, revise la versión en español e inglés y active
            “Publicada” cuando esté lista.
          </p>
        </div>
        <Button
          disabled={busy || query.isLoading || (!!id && query.isError)}
          onClick={() => void save()}
        >
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
      {query.isLoading && <p className="admin-empty">Cargando publicación…</p>}
      {query.isError && (
        <p role="alert" className="admin-error mt-6">
          {query.error.message}
        </p>
      )}
      {error && (
        <div role="alert" className="admin-error mt-6 whitespace-pre-line">
          {error}
          {id && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(
                    "¿Descartar el borrador y abrir la versión más reciente?",
                  )
                ) {
                  if (query.data) populate(query.data);
                  void query.refetch();
                }
              }}
            >
              Recargar registro
            </Button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm mt-5">
          {notice}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        className="grid xl:grid-cols-[minmax(0,1fr)_290px] gap-9 mt-8"
      >
        <fieldset
          disabled={busy || query.isLoading || (!!id && query.isError)}
          className="min-w-0 space-y-6"
        >
          <div
            className="flex gap-2"
            role="group"
            aria-label="Idioma del contenido"
          >
            <Button
              type="button"
              size="sm"
              variant={lang === "es" ? "default" : "outline"}
              onClick={() => setLang("es")}
            >
              Español
            </Button>
            <Button
              type="button"
              size="sm"
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLang("en")}
            >
              English
            </Button>
          </div>
          <div>
            <label htmlFor="news-title" className="block text-sm mb-2">
              Título {lang === "es" ? "en español" : "en inglés"}
            </label>
            <Input
              id="news-title"
              maxLength={300}
              value={draft[titleKey]}
              onChange={(e) => field(titleKey, e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="news-excerpt" className="block text-sm mb-2">
              Extracto {lang === "es" ? "en español" : "en inglés"}
            </label>
            <Textarea
              id="news-excerpt"
              rows={3}
              value={draft[excerptKey]}
              onChange={(e) => field(excerptKey, e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Resumen que aparece en el listado y en los resultados de búsqueda.
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
              <label htmlFor="news-body" className="block text-sm">
                Cuerpo de la publicación
              </label>
              {!draft[contentKey].trim() && (
                <button
                  type="button"
                  className="text-xs underline"
                  data-testid="button-brief-template"
                  onClick={() =>
                    field(contentKey, lang === "es" ? BRIEF_TEMPLATE_ES : BRIEF_TEMPLATE_EN)
                  }
                >
                  Usar formato de nota breve con fuente
                </button>
              )}
            </div>
            <TextEditor
              id="news-body"
              value={draft[contentKey]}
              onChange={(v) => field(contentKey, v)}
              rows={16}
            />
          </div>
          <section>
            <h2 className="text-sm font-medium mb-4">Documentos y fuente</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm mb-2" htmlFor="news-pdf-es">
                  PDF en español
                </label>
                <MediaField
                  id="news-pdf-es"
                  document
                  value={draft.documentUrlEs}
                  onChange={(v) => field("documentUrlEs", v)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" htmlFor="news-pdf-en">
                  PDF en inglés
                </label>
                <MediaField
                  id="news-pdf-en"
                  document
                  value={draft.documentUrl}
                  onChange={(v) => field("documentUrl", v)}
                />
              </div>
              <div className="border bg-white p-5 rounded-md space-y-4" data-testid="section-news-source">
                <div>
                  <h3 className="text-sm font-medium">Fuente citada (nota breve)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para comentar una noticia de otro medio: título propio, de dos a
                    cuatro párrafos de análisis de la firma (“Qué significa para las
                    empresas”) y la fuente al pie. No copie la nota del medio; cite su
                    enlace.
                  </p>
                </div>
                <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
                  <div>
                    <label className="block text-sm mb-2" htmlFor="news-source-name">
                      Medio
                    </label>
                    <Input
                      id="news-source-name"
                      maxLength={120}
                      placeholder="El Economista"
                      value={draft.sourceName}
                      onChange={(e) => field("sourceName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" htmlFor="news-source">
                      Enlace a la noticia
                    </label>
                    <Input
                      id="news-source"
                      type="url"
                      placeholder="https://"
                      value={draft.sourceUrl}
                      onChange={(e) => field("sourceUrl", e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground" data-testid="text-source-preview">
                  {draft.sourceUrl.trim()
                    ? <>Al pie de la nota se verá: <strong>Fuente: {sourceLabel(draft.sourceName, draft.sourceUrl) || "…"}</strong>, con enlace al medio.</>
                    : "Sin enlace no se muestra fuente. El documento PDF y la fuente son referencias independientes."}
                </p>
              </div>
            </div>
          </section>
        </fieldset>
        <fieldset
          disabled={busy || query.isLoading || (!!id && query.isError)}
          className="space-y-6 min-w-0"
        >
          <section className="border bg-white p-5 rounded-md space-y-5">
            <h2 className="text-sm font-medium">Publicación</h2>
            <div className="flex justify-between items-center gap-4">
              <label htmlFor="news-published">Publicada</label>
              <Switch
                id="news-published"
                checked={draft.published}
                onCheckedChange={(v) => field("published", v)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Un borrador puede revisarse en privado. Nada se publica solo:
              la nota aparece en el sitio únicamente cuando una persona activa
              “Publicada”. Una fecha futura la mantiene fuera hasta ese momento.
            </p>
            <div>
              <label htmlFor="news-date" className="block text-xs mb-2">
                Fecha editorial
              </label>
              <Input
                id="news-date"
                type="date"
                value={draft.date}
                onChange={(e) => field("date", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="news-schedule" className="block text-xs mb-2">
                Programar publicación (opcional)
              </label>
              <Input
                id="news-schedule"
                type="datetime-local"
                value={draft.publishAt}
                onChange={(e) => field("publishAt", e.target.value)}
              />
            </div>
            <div className="flex justify-between gap-3 items-center">
              <label htmlFor="news-home">Destacar en Inicio</label>
              <Switch
                id="news-home"
                checked={draft.featuredHome}
                onCheckedChange={(v) => field("featuredHome", v)}
              />
            </div>
            {id && (
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <a
                  className="text-xs underline inline-flex items-center gap-2"
                  href={`/admin/preview/news/${id}?lang=es`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vista previa ES
                  <ExternalLinkIcon />
                </a>
                <a
                  className="text-xs underline"
                  href={`/admin/preview/news/${id}?lang=en`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EN
                </a>
              </div>
            )}
          </section>
          <section className="space-y-3">
            <label className="block text-sm" htmlFor="news-image">
              Imagen destacada
            </label>
            <MediaField
              id="news-image"
              value={draft.imageUrl}
              onChange={(v) => field("imageUrl", v)}
            />
          </section>
          <div>
            <label htmlFor="news-slug" className="block text-sm mb-2">
              Identificador de la dirección
            </label>
            <Input
              id="news-slug"
              value={draft.slug}
              onChange={(e) => field("slug", e.target.value)}
            />
            {!id && (
              <button
                className="text-xs underline mt-2"
                type="button"
                onClick={() =>
                  field(
                    "slug",
                    (draft.titleEs || draft.title)
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  )
                }
              >
                Generar desde el título
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Evite cambiar una dirección ya compartida.
            </p>
          </div>
          <div>
            <label htmlFor="news-category" className="block text-sm mb-2">
              Categoría
            </label>
            <select
              id="news-category"
              className="border p-3 w-full"
              value={draft.category}
              onChange={(e) => {
                field("category", e.target.value);
                field(
                  "categoryEs",
                  newsCategories.find((c) => c.value === e.target.value)?.es ??
                    "",
                );
              }}
            >
              {newsCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.es}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="news-tags" className="block text-sm mb-2">
              Etiquetas
            </label>
            <Input
              id="news-tags"
              value={draft.tags}
              placeholder="Laboral, Seguridad social"
              onChange={(e) => field("tags", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separe con comas. Máximo 12 etiquetas.
            </p>
          </div>
          <section>
            <h2 className="text-sm font-medium mb-3">Autores</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Seleccione únicamente autorías confirmadas. Un perfil oculto
              conserva el vínculo sin aparecer públicamente.
            </p>
            {people.isError && <p role="alert">No se pudo cargar el equipo.</p>}
            <div className="max-h-64 overflow-auto space-y-3">
              {people.data?.items.map((p) => (
                <label key={p.id} className="flex gap-3 items-start text-xs">
                  <input
                    type="checkbox"
                    checked={draft.memberIds.includes(p.id)}
                    onChange={(e) =>
                      field(
                        "memberIds",
                        e.target.checked
                          ? [...draft.memberIds, p.id]
                          : draft.memberIds.filter((x) => x !== p.id),
                      )
                    }
                  />
                  <span>
                    {p.label}
                    {!p.visible ? " · Oculto" : ""}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </fieldset>
      </form>
    </main>
  );
}
