import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { Data } from "@puckeditor/core";
import { adminApiRequest } from "@/lib/adminAuth";
import { notifyCmsSaved } from "@/hooks/useCmsContent";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { createInitialVisualData, visualBuilderConfig } from "./visualConfig";
import "@puckeditor/core/puck.css";
import "./visual-builder.css";

const PuckEditor = lazy(() => import("@puckeditor/core").then((module) => ({ default: module.Puck })));
const SCHEMA_VERSION = 1;
type VisualResponse = { data?: Data; draftData?: Data; previousData?: Data | null; revision?: string; schemaVersion?: number; syncedSections?: string[] };

type VisualPageEditorProps = { pageId: string; language: string; pageLabel: string; sections: Record<string, unknown> };

export function VisualPageEditor({ pageId, language, pageLabel, sections }: VisualPageEditorProps) {
  const { toast } = useToast();
  const [data, setData] = useState<Data>(() => createInitialVisualData(pageId, sections, language));
  const [revision, setRevision] = useState("initial");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string>();
  const endpoint = `/api/admin/visual-pages/${encodeURIComponent(pageId)}/${encodeURIComponent(language)}`;

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setError(undefined);
    adminApiRequest("GET", endpoint).then(async (response) => {
      const payload = await response.json() as VisualResponse & { error?: string };
      if (!response.ok && response.status !== 404) throw new Error(payload.error || "No se pudo cargar el lienzo visual.");
      if (!active) return;
      if (response.ok && (payload.draftData || payload.data)) {
        setData(payload.draftData || payload.data || createInitialVisualData(pageId, sections, language));
        setRevision(payload.revision || "initial");
        setHasPrevious(Boolean(payload.previousData));
        setDirty(false);
      } else {
        setData(createInitialVisualData(pageId, sections, language));
        setRevision("initial");
        setHasPrevious(false);
        setDirty(false);
      }
      setLoaded(true);
    }).catch((loadError) => {
      if (!active) return;
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el lienzo visual.");
      setLoaded(true);
    });
    return () => { active = false; };
  }, [endpoint, pageId, sections]);

  const saveDraft = async () => {
    setSaving(true);
    setError(undefined);
    try {
      const response = await adminApiRequest("PUT", endpoint, { draftData: data, schemaVersion: SCHEMA_VERSION, revision });
      const payload = await response.json() as VisualResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar el borrador visual.");
      setRevision(payload.revision || revision);
      setDirty(false);
      notifyCmsSaved();
      toast({ title: payload.syncedSections?.length ? "Borrador visual y CMS sincronizados" : "Borrador visual guardado" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el borrador visual.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setError(undefined);
    try {
      const response = await adminApiRequest("POST", `${endpoint}/publish`, { revision });
      const payload = await response.json() as VisualResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo publicar el diseño visual.");
      setRevision(payload.revision || revision);
      setDirty(false);
      notifyCmsSaved();
      toast({ title: payload.syncedSections?.length ? "Diseño visual y CMS publicados" : "Diseño visual publicado" });
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "No se pudo publicar el diseño visual.");
    } finally {
      setPublishing(false);
    }
  };

  const restore = async () => {
    setRestoring(true);
    setError(undefined);
    try {
      const response = await adminApiRequest("POST", `${endpoint}/restore`, { revision });
      const payload = await response.json() as VisualResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo restaurar el diseño visual.");
      setData(payload.draftData || payload.data || data);
      setRevision(payload.revision || revision);
      setHasPrevious(Boolean(payload.previousData));
      setDirty(false);
      notifyCmsSaved();
      toast({ title: "Versión visual restaurada" });
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "No se pudo restaurar el diseño visual.");
    } finally {
      setRestoring(false);
    }
  };

  const permissions = useMemo(() => ({ delete: true, duplicate: true, drag: true, edit: true, insert: true }), []);
  if (!loaded) return <div className="visual-builder-loading" role="status">Cargando constructor visual…</div>;

  return <section className="visual-builder-card" aria-labelledby="visual-builder-title">
      <div className="visual-builder-toolbar">
      <div><h2 id="visual-builder-title">Constructor visual · {pageLabel}</h2><p>La vista se actualiza en tiempo real mientras ajustas los bloques. Los cambios se guardan como borrador y la versión anterior queda disponible para restaurar.</p><p className="visual-builder-live-status" aria-live="polite">{dirty ? "Hay cambios visuales sin guardar." : "Todos los cambios visuales están guardados."}</p></div>
      <div className="visual-builder-actions"><Button type="button" variant="outline" disabled={saving || publishing || restoring} onClick={saveDraft}>{saving ? "Guardando…" : "Guardar borrador"}</Button><Button type="button" disabled={saving || publishing || restoring} onClick={publish}>{publishing ? "Publicando…" : "Publicar diseño"}</Button><Button type="button" variant="ghost" disabled={!hasPrevious || saving || publishing || restoring} onClick={restore}>{restoring ? "Restaurando…" : "Restaurar anterior"}</Button></div>
    </div>
    {error && <p className="visual-builder-error" role="alert">{error}</p>}
    <Suspense fallback={<div className="visual-builder-loading" role="status">Cargando herramientas visuales…</div>}>
      <PuckEditor config={visualBuilderConfig} data={data} onChange={(nextData) => { setData(nextData); setDirty(true); }} onPublish={(nextData) => { setData(nextData); setDirty(true); }} permissions={permissions} headerTitle={`Editar ${pageLabel}`} viewports={[{ width: 1440, height: 900, label: "Escritorio" }, { width: 390, height: 844, label: "Móvil" }]} />
    </Suspense>
  </section>;
}
