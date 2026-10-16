import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SiteIntegrations } from "@shared/siteIntegrations";
export function IntegrationFields({
  value,
  onChange,
}: {
  value: SiteIntegrations;
  onChange: (v: SiteIntegrations) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Dominio público</h3>
        <label className="block space-y-2">
          <span>URL canónica del sitio</span>
          <Input
            value={value.siteUrl}
            onChange={(e) => onChange({ ...value, siteUrl: e.target.value })}
            placeholder="https://dominio-del-despacho.com"
          />
        </label>
        <p className="text-sm text-muted-foreground">
          Se utiliza para metadatos y para limitar los proveedores de medición
          al dominio autorizado.
        </p>
      </section>
      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">Google Search Console</h3>
        <label className="block space-y-2">
          <span>Token de verificación HTML</span>
          <Input
            value={value.searchConsole.verification}
            onChange={(e) =>
              onChange({
                ...value,
                searchConsole: { verification: e.target.value },
              })
            }
            placeholder="Solo el valor content del meta tag"
          />
        </label>
        <p className="text-sm">
          {value.searchConsole.verification
            ? "Token configurado. Se emitirá en el HTML del sitio al guardar."
            : "Sin token configurado. También puede verificar la propiedad mediante DNS en su proveedor."}
        </p>
        <a
          className="underline"
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir Search Console
        </a>
        <p className="text-sm text-muted-foreground">
          Este panel instala la verificación. La propiedad, sus permisos y el
          resultado de Google se administran en Search Console.
        </p>
      </section>
      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">Google Analytics 4</h3>
        <label className="block space-y-2">
          <span>ID de medición</span>
          <Input
            value={value.ga4.measurementId}
            onChange={(e) =>
              onChange({
                ...value,
                ga4: {
                  ...value.ga4,
                  measurementId: e.target.value.trim().toUpperCase(),
                },
              })
            }
            placeholder="G-XXXXXXXXXX"
          />
        </label>
        <label className="flex justify-between gap-4 items-center">
          <span>Activar Google Analytics</span>
          <Switch
            checked={value.ga4.enabled}
            onCheckedChange={(enabled) =>
              onChange({ ...value, ga4: { ...value.ga4, enabled } })
            }
          />
        </label>
        <p className="text-sm text-muted-foreground">
          La etiqueta solo se carga en el dominio público y después de que el
          visitante acepte analítica. El CMS y sus vistas previas quedan
          excluidos. Los títulos, consultas y campos de formularios no se
          envían.
        </p>
        <a
          className="underline"
          href="https://analytics.google.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir Google Analytics
        </a>
      </section>
      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">Leadinfo</h3>
        <label className="block space-y-2">
          <span>Site ID</span>
          <Input
            value={value.leadinfo.siteId}
            onChange={(e) =>
              onChange({
                ...value,
                leadinfo: { ...value.leadinfo, siteId: e.target.value },
              })
            }
          />
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={value.leadinfo.disclosureReviewed}
            onChange={(e) =>
              onChange({
                ...value,
                leadinfo: {
                  ...value.leadinfo,
                  disclosureReviewed: e.target.checked,
                },
              })
            }
          />
          <span>
            El despacho revisó la descripción de Leadinfo en sus avisos de
            privacidad y cookies.
          </span>
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>Activar Leadinfo</span>
          <Switch
            checked={value.leadinfo.enabled}
            onCheckedChange={(enabled) =>
              onChange({ ...value, leadinfo: { ...value.leadinfo, enabled } })
            }
          />
        </label>
        <p className="text-sm text-muted-foreground">
          Permanece apagado sin Site ID, revisión y consentimiento específico
          del visitante. No pegue scripts de terceros en estos campos.
        </p>
      </section>
    </div>
  );
}
