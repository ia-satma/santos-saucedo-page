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
  const update = (next: TeamMosaicItem[]) => onChange({ ...current, teamMosaic: next.map(toCmsItem) });
  const updateItem = (index: number, patch: Partial<TeamMosaicItem>) => update(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };
  const add = () => update([...items, { id: `team-${Date.now()}`, mediaPath: "", enabled: true, order: items.length, altByLanguage: {} }]);

  return <fieldset className="space-y-5 rounded-xl border border-[var(--admin-line,#e3e8e7)] p-5" data-testid="team-mosaic-editor">
    <legend className="px-2 text-base font-semibold text-[var(--admin-ink,#172b39)]">Fotografías de colaboradores</legend>
    <p className="text-sm text-muted-foreground">Estas fotografías aparecen en Socios y equipo. Puede cambiar el archivo, el orden, la visibilidad, el texto alternativo y el encuadre desde esta misma página.</p>
    {items.map((item, index) => <article key={item.id} className="space-y-4 rounded-lg border p-4" data-testid={`team-mosaic-item-${index}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-medium">Fotografía {index + 1}</h3><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm"><Switch checked={item.enabled} onCheckedChange={(enabled) => updateItem(index, { enabled })} />{item.enabled ? "Visible" : "Oculta"}</label><Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir fotografía ${index + 1}`}>↑</Button><Button type="button" variant="ghost" size="sm" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar fotografía ${index + 1}`}>↓</Button><Button type="button" variant="ghost" size="sm" onClick={() => update(items.filter((_, itemIndex) => itemIndex !== index))}>Quitar</Button></div></div>
      <MediaField id={`team-mosaic-media-${index}`} value={item.mediaPath} onChange={(mediaPath) => updateItem(index, { mediaPath })} />
      <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><label htmlFor={`team-mosaic-alt-${index}`} className="text-sm font-medium">Texto alternativo ({activeLanguage})</label><Textarea id={`team-mosaic-alt-${index}`} rows={3} value={item.altByLanguage[activeLanguage] ?? ""} onChange={(event) => updateItem(index, { altByLanguage: { ...item.altByLanguage, [activeLanguage]: event.target.value } })} /></div><div className="space-y-2"><p className="text-sm font-medium">Punto focal del recorte</p><div className="grid grid-cols-2 gap-3"><label className="text-sm">Horizontal<input className="mt-1 w-full rounded-md border bg-background p-2" type="number" min="0" max="100" value={item.focalPoint?.x ?? 50} onChange={(event) => updateItem(index, { focalPoint: { x: Number(event.target.value), y: item.focalPoint?.y ?? 50 } })} /></label><label className="text-sm">Vertical<input className="mt-1 w-full rounded-md border bg-background p-2" type="number" min="0" max="100" value={item.focalPoint?.y ?? 50} onChange={(event) => updateItem(index, { focalPoint: { x: item.focalPoint?.x ?? 50, y: Number(event.target.value) } })} /></label></div><p className="text-xs text-muted-foreground">El recorte usa estos porcentajes al mostrar la fotografía.</p></div></div>
    </article>)}
    <Button type="button" variant="outline" onClick={add}>Añadir fotografía</Button>
  </fieldset>;
}
