import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaField } from "@/features/site-config/MediaField";
import { normalizeTeamMosaic, type TeamMosaicItem } from "@/lib/teamMosaic";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";
import type { CmsValue } from "@shared/cms";

function record(value: CmsValue): Record<string, CmsValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, CmsValue> : {};
}

function toCmsItem(item: TeamMosaicItem): CmsValue {
  return {
    id: item.id,
    mediaPath: item.mediaPath,
    enabled: item.enabled,
    order: item.order,
    altByLanguage: item.altByLanguage as Record<string, CmsValue>,
    ...(item.focalPoint ? { focalPoint: item.focalPoint } : {}),
  };
}

export function TeamMosaicFields({ value, onChange, language = "es" }: { value: CmsValue; onChange: (value: CmsValue) => void; language?: string }) {
  const current = record(value);
  const items = normalizeTeamMosaic(current.teamMosaic);
  const activeLanguage = (SUPPORTED_LANGUAGES.some((item) => item.code === language) ? language : "es") as LanguageCode;
  const update = (next: TeamMosaicItem[]) => onChange({
    ...current,
    teamMosaic: next.map((item, index) => toCmsItem({ ...item, order: index })),
  });
  const updateItem = (index: number, patch: Partial<TeamMosaicItem>) => update(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };
  const add = () => update([...items, { id: `team-${Date.now()}`, mediaPath: "", enabled: true, order: items.length, altByLanguage: {} }]);
  const visibleCount = items.filter((item) => item.enabled && item.mediaPath).length;

  return <fieldset className="space-y-5 rounded-xl border border-[var(--admin-line,#e3e8e7)] p-5" data-testid="team-mosaic-editor">
    <legend className="px-2 text-base font-semibold text-[var(--admin-ink,#172b39)]">Carrusel de colaboradores</legend>
    <div className="rounded-lg bg-muted/40 p-4 text-sm">
      <p className="font-semibold text-[var(--admin-ink,#172b39)]">Cómo se ordena en la página</p>
      <p className="mt-1 text-muted-foreground">La fotografía 1 aparece primero, luego la 2 y así sucesivamente. Usa las flechas para cambiar la posición. Los cambios quedan como borrador hasta pulsar «Guardar borrador».</p>
      <p className="mt-2 font-medium text-[var(--admin-ink,#172b39)]">{items.length} fotografías · {visibleCount} visibles en Socios y equipo</p>
    </div>
    <ol aria-label="Orden de fotografías de colaboradores" className="space-y-3">
      {items.map((item, index) => <li key={item.id}>
        <article className="space-y-4 rounded-lg border p-4" data-testid={`team-mosaic-item-${index}`}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted" aria-hidden="true">
              {item.mediaPath ? <img src={item.mediaPath} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <span className="px-2 text-center text-xs text-muted-foreground">Sin imagen</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Posición {index + 1} de {items.length}</p>
                  <h3 className="mt-1 font-medium">Fotografía {index + 1}</h3>
                  <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground" title={item.mediaPath || "Sin imagen seleccionada"}>{item.mediaPath || "Sin imagen seleccionada"}</p>
                </div>
                <span className={item.enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800" : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"}>{item.enabled ? "Visible en el sitio" : "Oculta del sitio"}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm"><Switch checked={item.enabled} onCheckedChange={(enabled) => updateItem(index, { enabled })} />Mostrar en Socios y equipo</label>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir fotografía ${index + 1}`}>↑ Subir</Button>
                <Button type="button" variant="outline" size="sm" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar fotografía ${index + 1}`}>↓ Bajar</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => update(items.filter((_, itemIndex) => itemIndex !== index))}>Quitar fotografía</Button>
              </div>
            </div>
          </div>
          <details className="rounded-md border bg-muted/20 p-3">
            <summary className="cursor-pointer font-medium">Editar imagen, accesibilidad y encuadre</summary>
            <div className="mt-4 space-y-4">
              <MediaField id={`team-mosaic-media-${index}`} value={item.mediaPath} onChange={(mediaPath) => updateItem(index, { mediaPath })} />
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><label htmlFor={`team-mosaic-alt-${index}`} className="text-sm font-medium">Texto alternativo ({activeLanguage})</label><Textarea id={`team-mosaic-alt-${index}`} rows={3} value={item.altByLanguage[activeLanguage] ?? ""} onChange={(event) => updateItem(index, { altByLanguage: { ...item.altByLanguage, [activeLanguage]: event.target.value } })} /><p className="text-xs text-muted-foreground">Describe a la persona o la imagen para lectores de pantalla.</p></div><div className="space-y-2"><p className="text-sm font-medium">Punto focal del recorte</p><div className="grid grid-cols-2 gap-3"><label className="text-sm">Horizontal<input className="mt-1 w-full rounded-md border bg-background p-2" type="number" min="0" max="100" value={item.focalPoint?.x ?? 50} onChange={(event) => updateItem(index, { focalPoint: { x: Number(event.target.value), y: item.focalPoint?.y ?? 50 } })} /></label><label className="text-sm">Vertical<input className="mt-1 w-full rounded-md border bg-background p-2" type="number" min="0" max="100" value={item.focalPoint?.y ?? 50} onChange={(event) => updateItem(index, { focalPoint: { x: item.focalPoint?.x ?? 50, y: Number(event.target.value) } })} /></label></div><p className="text-xs text-muted-foreground">El recorte usa estos porcentajes al mostrar la fotografía.</p></div></div>
            </div>
          </details>
        </article>
      </li>)}
    </ol>
    <Button type="button" variant="outline" onClick={add}>Añadir fotografía</Button>
  </fieldset>;
}
