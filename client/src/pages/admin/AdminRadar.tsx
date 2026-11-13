import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bell, ExternalLink, Filter, Play, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { adminApiRequest, readAdminJson, useAdminAuth } from "@/lib/adminAuth";
import { useLocation } from "wouter";

type RadarConfig = {
  enabled: boolean;
  timezone: string;
  hour: number;
  minute: number;
  days: number[];
  scope: "all_mexico";
  priorityEntity: string;
  sources: { dof: boolean; sjf: boolean };
  lastRunAt: string | null;
  lastRunStatus: "idle" | "running" | "success" | "partial" | "failed";
  lastRunMessage: string;
};
type RadarItem = { id: string; titleEs: string; excerptEs: string; sourceName?: string | null; sourceUrl?: string | null; date?: string | null; processingStatus?: string | null; tags?: string[] | null; slug: string };
type RadarResponse = { settings: RadarConfig; items: RadarItem[]; entities: string[]; sources: Array<{ code: "dof" | "sjf"; name: string; url: string; automatic: boolean }> };

const sourceLabels: Record<string, string> = { dof: "DOF", sjf: "SJF" };
const weekDays = [
  [1, "Lun"], [2, "Mar"], [3, "Mié"], [4, "Jue"], [5, "Vie"], [6, "Sáb"], [0, "Dom"],
] as const;

export default function AdminRadar() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("Nuevo León");

  const radarQuery = useQuery<RadarResponse>({
    queryKey: ["/api/admin/radar"],
    queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/radar"), "No se pudo cargar el Radar jurídico."),
    enabled: isAuthenticated,
  });
  const [draftConfig, setDraftConfig] = useState<RadarConfig | null>(null);
  const config = draftConfig ?? radarQuery.data?.settings;
  const setConfig = (patch: Partial<RadarConfig>) => setDraftConfig({ ...(config as RadarConfig), ...patch });

  if (!authLoading && !isAuthenticated) {
    setLocation("/admin/login");
    return null;
  }

  const saveConfig = useMutation({
    mutationFn: async (next: RadarConfig) => readAdminJson<{ settings: RadarConfig }>(await adminApiRequest("PUT", "/api/admin/radar/settings", next), "No se pudo guardar la programación."),
    onSuccess: (result: { settings: RadarConfig }) => {
      setDraftConfig(result.settings);
      radarQuery.refetch();
      toast({ title: "Programación guardada", description: "El Radar revisará las fuentes según este horario." });
    },
    onError: (error: Error) => toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" }),
  });
  const runRadar = useMutation({
    mutationFn: async () => readAdminJson<{ created?: number }>(await adminApiRequest("POST", "/api/admin/radar/run", {}), "No se pudo iniciar la revisión."),
    onSuccess: (result: any) => {
      radarQuery.refetch();
      const created = Number(result?.created ?? 0);
      toast({ title: "Revisión terminada", description: `${created} borrador${created === 1 ? "" : "es"} nuevo${created === 1 ? "" : "s"} pendiente${created === 1 ? "" : "s"} de revisión humana.` });
    },
    onError: (error: Error) => toast({ title: "No se pudo ejecutar", description: error.message, variant: "destructive" }),
  });

  const items = useMemo(() => {
    const all = radarQuery.data?.items ?? [];
    const needle = search.trim().toLocaleLowerCase("es-MX");
    const filtered = all.filter((item) => {
      const source = item.sourceName?.toLocaleLowerCase("es-MX") ?? "";
      const matchesSource = sourceFilter === "all" || (sourceFilter === "dof" ? source.includes("diario oficial") : source.includes("semanario judicial"));
      const matchesStatus = statusFilter === "all" || (statusFilter === "review" ? item.processingStatus === "ready_for_approval" : item.processingStatus === statusFilter);
      const haystack = `${item.titleEs} ${item.excerptEs} ${item.sourceName ?? ""}`.toLocaleLowerCase("es-MX");
      return matchesSource && matchesStatus && (!needle || haystack.includes(needle));
    });
    if (stateFilter === "Todas") return filtered;
    const entityPattern = new RegExp(stateFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), "i");
    return filtered.sort((left, right) => {
      const priority = (item: RadarItem) => entityPattern.test(`${item.titleEs} ${item.excerptEs} ${item.tags?.join(" ") ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ? 0 : 1;
      return priority(left) - priority(right);
    });
  }, [radarQuery.data?.items, search, sourceFilter, statusFilter, stateFilter]);

  const toggleSource = (source: "dof" | "sjf") => {
    if (!config) return;
    const sources = { ...config.sources, [source]: !config.sources[source] };
    if (!sources.dof && !sources.sjf) return;
    setConfig({ sources });
  };

  const timeValue = config ? `${String(config.hour).padStart(2, "0")}:${String(config.minute).padStart(2, "0")}` : "07:00";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" data-testid="admin-radar-page">
      <AdminPageHeader
        title="Radar jurídico"
        description="Detecta novedades oficiales de todo México, prioriza Nuevo León y prepara borradores para revisión humana."
        icon={Bell}
        actions={<Button onClick={() => runRadar.mutate()} disabled={runRadar.isPending || !config} data-testid="button-radar-run"><Play className="mr-2 h-4 w-4" />{runRadar.isPending ? "Revisando…" : "Revisar ahora"}</Button>}
      />

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="note">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>El Radar nunca publica automáticamente. Cada hallazgo se guarda como borrador del Monitor Laboral y una persona debe editarlo y aprobarlo.</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <Card>
          <CardHeader><CardTitle>Hallazgos recientes</CardTitle><CardDescription>Fuentes oficiales filtradas para el seguimiento laboral y de seguridad social.</CardDescription></CardHeader>
          <CardContent>
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_160px_160px]">
              <div className="relative"><Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar hallazgos" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-radar-search" /></div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}><SelectTrigger data-testid="select-radar-source"><SelectValue placeholder="Fuente" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las fuentes</SelectItem><SelectItem value="dof">DOF</SelectItem><SelectItem value="sjf">SJF</SelectItem></SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger data-testid="select-radar-status"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem><SelectItem value="review">Pendiente de revisión</SelectItem><SelectItem value="pending">Borrador</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent></Select>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm"><span className="font-medium">Cobertura</span><Badge variant="secondary">Todo México</Badge><span>Prioridad</span><Select value={stateFilter} onValueChange={setStateFilter}><SelectTrigger className="h-8 w-[190px]" data-testid="select-radar-state"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Nuevo León">Nuevo León</SelectItem><SelectItem value="Todas">Todas las entidades</SelectItem>{(radarQuery.data?.entities ?? []).filter((entity) => entity !== "Nuevo León").map((entity) => <SelectItem key={entity} value={entity}>{entity}</SelectItem>)}</SelectContent></Select></div>
            {radarQuery.isLoading ? <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Cargando hallazgos…</div> : items.length === 0 ? <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No hay hallazgos con estos filtros. Ejecuta una revisión para consultar las fuentes oficiales.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-md border p-4" data-testid={`radar-item-${item.id}`}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><Badge variant="outline">{item.sourceName?.includes("Semanario") ? sourceLabels.sjf : sourceLabels.dof}</Badge><Badge variant={item.processingStatus === "ready_for_approval" ? "outline" : "secondary"}>{item.processingStatus === "ready_for_approval" ? "Pendiente de revisión" : item.processingStatus || "Borrador"}</Badge></div><h3 className="font-medium leading-snug">{item.titleEs}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.excerptEs}</p></div><div className="flex shrink-0 gap-2"><Link href={`/admin/news/${item.id}/edit`}><Button size="sm" variant="outline">Revisar</Button></Link>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label="Abrir fuente oficial"><Button size="icon" variant="ghost"><ExternalLink className="h-4 w-4" /></Button></a>}</div></div></article>)}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Programación y fuentes</CardTitle><CardDescription>La revisión diaria se ejecuta con la zona horaria de Monterrey.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            {!config ? <p className="text-sm text-muted-foreground">Cargando configuración…</p> : <>
              <div className="flex items-center justify-between rounded-md border p-3"><div><Label htmlFor="radar-enabled">Revisión diaria</Label><p className="text-xs text-muted-foreground">Guarda borradores sin publicar.</p></div><Switch id="radar-enabled" checked={config.enabled} onCheckedChange={(enabled) => setConfig({ enabled })} data-testid="switch-radar-enabled" /></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="radar-time">Hora local</Label><Input id="radar-time" type="time" value={timeValue} onChange={(event) => { const [hour, minute] = event.target.value.split(":").map(Number); setConfig({ hour, minute }); }} /></div><div><Label>Frecuencia</Label><Input value="Cada día" disabled /></div></div>
              <div><Label>Días de revisión</Label><div className="mt-2 flex flex-wrap gap-2">{weekDays.map(([day, label]) => <label key={day} className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs"><input type="checkbox" checked={config.days.includes(day)} onChange={() => { const days = config.days.includes(day) ? config.days.filter((value) => value !== day) : [...config.days, day]; if (days.length) setConfig({ days }); }} />{label}</label>)}</div></div>
              <div><Label>Fuentes oficiales</Label><div className="mt-2 space-y-2">{(["dof", "sjf"] as const).map((source) => <label key={source} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={config.sources[source]} onChange={() => toggleSource(source)} />{source === "dof" ? "Diario Oficial de la Federación" : "Semanario Judicial de la Federación"}</label>)}</div></div>
              <div className="rounded-md bg-muted p-3 text-sm"><strong>Alcance</strong><p className="mt-1 text-muted-foreground">Todo México, con <span className="font-medium text-foreground">{config.priorityEntity}</span> como filtro prioritario.</p></div>
              <Button className="w-full" onClick={() => saveConfig.mutate(config)} disabled={saveConfig.isPending} data-testid="button-radar-save"><Save className="mr-2 h-4 w-4" />{saveConfig.isPending ? "Guardando…" : "Guardar programación"}</Button>
              {config.lastRunAt && <p className="text-xs text-muted-foreground">Última revisión: {new Date(config.lastRunAt).toLocaleString("es-MX", { timeZone: config.timezone })}. {config.lastRunMessage}</p>}
            </>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
