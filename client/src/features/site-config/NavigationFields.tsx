import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SUPPORTED_LANGUAGES } from "@shared/schema";
import type { SiteNavigation, NavigationEntry } from "@shared/siteControls";

const captions: Record<string, string> = {
  enabled: "Mostrar bloque",
  searchEnabled: "Mostrar buscador",
  phoneEnabled: "Mostrar teléfono",
  languageEnabled: "Mostrar selector de idiomas",
  officeEnabled: "Mostrar dirección y contacto",
  linksEnabled: "Mostrar enlaces del despacho",
  legalEnabled: "Mostrar enlaces legales y cookies",
  languagesEnabled: "Mostrar idiomas",
  adminEnabled: "Mostrar acceso al CMS",
};
const newEntry = (): NavigationEntry => ({
  id: crypto.randomUUID(),
  href: "/contact",
  labels: { es: "Nuevo enlace", en: "New link" },
  visible: false,
  order: 0,
});
function Entries({
  items,
  onChange,
  children = false,
}: {
  items: SiteNavigation["items"] | NavigationEntry[];
  onChange: (items: any[]) => void;
  children?: boolean;
}) {
  const change = (i: number, next: NavigationEntry) =>
    onChange(items.map((old, j) => (i === j ? next : old)));
  const move = (i: number, delta: number) => {
    const next = [...items];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    onChange(next.map((v, order) => ({ ...v, order })));
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <fieldset key={item.id} className="border p-4 space-y-4">
          <legend className="px-2 font-medium">
            {item.labels.es || item.labels.en || "Enlace"}
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3">
              <Switch
                checked={item.visible}
                onCheckedChange={(visible) => change(i, { ...item, visible })}
              />
              Activo
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              Subir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              Bajar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Quitar enlace
            </Button>
          </div>
          <label className="block space-y-2">
            <span>Destino: ruta del sitio o URL HTTPS</span>
            <Input
              value={item.href}
              onChange={(e) => change(i, { ...item, href: e.target.value })}
            />
          </label>
          <details>
            <summary className="cursor-pointer py-2">
              Etiquetas por idioma
            </summary>
            <div className="grid gap-4 sm:grid-cols-2 pt-3">
              {SUPPORTED_LANGUAGES.map((l) => (
                <label key={l.code} className="space-y-2">
                  <span>{l.nameNative}</span>
                  <Input
                    value={item.labels[l.code] || ""}
                    placeholder="Usa español o inglés si queda vacío"
                    onChange={(e) =>
                      change(i, {
                        ...item,
                        labels: { ...item.labels, [l.code]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </details>
          {children && "children" in item && (
            <details>
              <summary className="cursor-pointer py-2">
                Submenús (
                {(item as SiteNavigation["items"][number]).children.length})
              </summary>
              <Entries
                items={(item as SiteNavigation["items"][number]).children}
                onChange={(next) =>
                  change(i, {
                    ...item,
                    children: next,
                  } as SiteNavigation["items"][number])
                }
              />
            </details>
          )}
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...items,
            {
              ...newEntry(),
              order: items.length,
              ...(children ? { children: [] } : {}),
            },
          ])
        }
      >
        Añadir {children ? "enlace principal" : "enlace"}
      </Button>
    </div>
  );
}
export function NavigationFields({
  value,
  onChange,
}: {
  value: SiteNavigation;
  onChange: (value: SiteNavigation) => void;
}) {
  return (
    <div className="space-y-9">
      <p className="text-muted-foreground">
        Los enlaces nuevos comienzan desactivados. Edite sus etiquetas y destino
        y actívelos cuando estén listos. Los submenús se muestran al abrir su
        desplegable.
      </p>
      {(["header", "footer"] as const).map((key) => (
        <fieldset key={key} className="space-y-4">
          <legend className="text-xl font-semibold mb-4">
            {key === "header" ? "Cabecera" : "Pie de página"}
          </legend>
          {Object.entries(value[key]).map(([k, checked]) => (
            <label key={k} className="flex items-center justify-between gap-4">
              <span>{captions[k] || k}</span>
              <Switch
                checked={checked}
                onCheckedChange={(next) =>
                  onChange({ ...value, [key]: { ...value[key], [k]: next } })
                }
              />
            </label>
          ))}
        </fieldset>
      ))}
      <section className="space-y-5">
        <h3 className="text-xl font-semibold">Menú principal y submenús</h3>
        <Entries
          items={value.items}
          children
          onChange={(items) => onChange({ ...value, items })}
        />
      </section>
      <section className="space-y-5">
        <h3 className="text-xl font-semibold">Enlaces del pie</h3>
        <Entries
          items={value.footerItems}
          onChange={(footerItems) => onChange({ ...value, footerItems })}
        />
      </section>
      <section className="space-y-5">
        <h3 className="text-xl font-semibold">Enlaces legales del pie</h3>
        <Entries
          items={value.legalItems}
          onChange={(legalItems) => onChange({ ...value, legalItems })}
        />
      </section>
    </div>
  );
}
