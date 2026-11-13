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

type RadarSourceCode = "dof" | "sjf" | "scjn_sqlite" | "scjn_press" | "tfca" | (string & {});
type RadarConfig = {
  enabled: boolean;
  timezone: string;
  hour: number;
  minute: number;
  days: number[];
  scope: "all_mexico";
  priorityEntity: string;
  sources: Record<string, boolean>;
  lastRunAt: string | null;
  lastRunStatus: "idle" | "running" | "success" | "partial" | "failed";
  lastRunMessage: string;
};
type RadarItem = { id: string; titleEs: string; excerptEs: string; sourceType?: string | null; sourceName?: string | null; sourceUrl?: string | null; date?: string | null; processingStatus?: string | null; tags?: string[] | null; slug: string };
type RadarResponse = { settings: RadarConfig; items: RadarItem[]; entities: string[]; sources: Array<{ code: string; name: string; url: string; automatic: boolean }> };

const sourceLabels: Record<string, string> = {
  dof: "DOF",
  sjf: "SJF",
  scjn_sqlite: "SCJN · tesis",
  scjn_press: "Comunicados SCJN",
  tfca: "TFCA",
};
const sourceDescriptions: Record<string, string> = {
  dof: "Diario Oficial de la Federación",
  sjf: "Semanario Judicial de la Federación",
  scjn_sqlite: "SCJN_SQLITE · tesis y jurisprudencia",
  scjn_press: "Comunicados oficiales de la SCJN",
  tfca: "Tribunal Federal de Conciliación y Arbitraje",
};
const defaultRadarSources: Array<{ code: RadarSourceCode; name: string }> = [
  { code: "dof", name: sourceDescriptions.dof },
  { code: "sjf", name: sourceDescriptions.sjf },
  { code: "scjn_sqlite", name: sourceDescriptions.scjn_sqlite },
  { code: "scjn_press", name: sourceDescriptions.scjn_press },
  { code: "tfca", name: sourceDescriptions.tfca },
];

function sourceCodeForItem(item: RadarItem): string {
  if (item.sourceType) return item.sourceType;
  const source = item.sourceName?.toLocaleLowerCase("es-MX") ?? "";
  if (source.includes("tribunal federal") || source.includes("tfca")) return "tfca";
  if (source.includes("comunicado") || source.includes("suprema corte")) return "scjn_press";
  if (source.includes("sqlite") || source.includes("jurisprudencia")) return "scjn_sqlite";
  if (source.includes("semanario") || source.includes("tesis")) return "sjf";
  return "dof";
}

function sourceLabelForItem(item: RadarItem): string {
  const code = sourceCodeForItem(item);
  return sourceLabels[code] ?? item.sourceName ?? code.toUpperCase();
}
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
  const [topicFilter, setTopicFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const topicPatterns: Record<string, RegExp> = {
    laboral: /laboral|trabajo|salario|empleo|sindicat|seguridad social|patron|trabajador|despido|jornada/i,
    migratorio: /migrator|inmigr|refugiad|visa|extranjer|nacionalidad/i,
    corporativo: /corporativ|societar|contractual|contrato|empresa|mercantil|comercio/i,
    litigio: /litig|tribunal|juicio|demanda|procedimiento|controversia/i,
    penal: /penal|delito|fiscal|responsabilidad criminal/i,
  };

  const radarQuery = useQuery<RadarResponse>({
    queryKey: ["/api/admin/radar"],
    queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/radar"), "No se pudo cargar el Radar jurídico."),
    enabled: isAuthenticated,
  });
  const [draftConfig, setDraftConfig] = useState<RadarConfig | null>(null);
  const config = draftConfig ?? radarQuery.data?.settings;
  const setConfig = (patch: Partial<RadarConfig>) => setDraftConfig({ ...(config as RadarConfig), ...patch });
  const sourceOptions = useMemo(() => {
    const apiSources = radarQuery.data?.sources ?? [];
    const merged = [...defaultRadarSources];
    for (const source of apiSources) {
      if (!merged.some((candidate) => candidate.code === source.code)) merged.push({ code: source.code, name: source.name });
    }
    return merged;
  }, [radarQuery.data?.sources]);
  const sourceConfigKey = (source: string): string => {
    if (source === "scjn_press" && config?.sources?.scjn_press === undefined && config?.sources?.scjnPress !== undefined) return "scjnPress";
    return source;
  };

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
      const matchesSource = sourceFilter === "all" || sourceCodeForItem(item) === sourceFilter || source.includes(sourceFilter.toLocaleLowerCase("es-MX"));
      const matchesStatus = statusFilter === "all" || (statusFilter === "review" ? item.processingStatus === "ready_for_approval" : item.processingStatus === statusFilter);
      const itemDate = item.date ? item.date.slice(0, 10) : "";
      const matchesDateFrom = !dateFrom || (itemDate && itemDate >= dateFrom);
      const matchesDateTo = !dateTo || (itemDate && itemDate <= dateTo);
      const haystack = `${item.titleEs} ${item.excerptEs} ${item.sourceName ?? ""} ${item.sourceType ?? ""} ${item.tags?.join(" ") ?? ""}`.toLocaleLowerCase("es-MX");
      const matchesTopic = topicFilter === "all" || topicPatterns[topicFilter]?.test(haystack) === true;
      return matchesSource && matchesStatus && matchesTopic && matchesDateFrom && matchesDateTo && (!needle || haystack.includes(needle));
    });
    if (stateFilter === "Todas") return filtered;
    const entityPattern = new RegExp(stateFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), "i");
    return filtered.sort((left, right) => {
      const priority = (item: RadarItem) => entityPattern.test(`${item.titleEs} ${item.excerptEs} ${item.tags?.join(" ") ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ? 0 : 1;
      return priority(left) - priority(right);
    });
  }, [radarQuery.data?.items, search, sourceFilter, statusFilter, stateFilter, topicFilter, dateFrom, dateTo]);

  const toggleSource = (source: string) => {
    if (!config) return;
    const key = sourceConfigKey(source);
    const sources = { ...config.sources, [key]: !config.sources[key] };
    if (!Object.values(sources).some(Boolean)) return;
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
            <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="relative"><Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar hallazgos" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-radar-search" /></div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}><SelectTrigger data-testid="select-radar-source"><SelectValue placeholder="Fuente" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las fuentes</SelectItem>{sourceOptions.map((source) => <SelectItem key={source.code} value={source.code}>{sourceLabels[source.code] ?? source.name}</SelectItem>)}</SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger data-testid="select-radar-status"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem><SelectItem value="review">Pendiente de revisión</SelectItem><SelectItem value="pending">Borrador</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent></Select>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm"><span className="font-medium">Cobertura</span><Badge variant="secondary">Todo México</Badge><span>Prioridad territorial</span><Select value={stateFilter} onValueChange={setStateFilter}><SelectTrigger className="h-8 w-[180px]" data-testid="select-radar-state"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Nuevo León">Nuevo León</SelectItem><SelectItem value="Todas">Todas las entidades</SelectItem>{(radarQuery.data?.entities ?? []).filter((entity) => entity !== "Nuevo León").map((entity) => <SelectItem key={entity} value={entity}>{entity}</SelectItem>)}</SelectContent></Select><span>Temática</span><Select value={topicFilter} onValueChange={setTopicFilter}><SelectTrigger className="h-8 w-[205px]" data-testid="select-radar-topic"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los temas</SelectItem><SelectItem value="laboral">Derecho laboral</SelectItem><SelectItem value="migratorio">Migratorio</SelectItem><SelectItem value="corporativo">Corporativo y contractual</SelectItem><SelectItem value="litigio">Litigio</SelectItem><SelectItem value="penal">Penal laboral</SelectItem></SelectContent></Select></div>
            <div className="mb-5 grid gap-3 sm:grid-cols-[150px_150px_auto] sm:items-end"><div><Label htmlFor="radar-date-from" className="text-xs text-muted-foreground">Desde</Label><Input id="radar-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} data-testid="input-radar-date-from" /></div><div><Label htmlFor="radar-date-to" className="text-xs text-muted-foreground">Hasta</Label><Input id="radar-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} data-testid="input-radar-date-to" /></div><Button type="button" variant="ghost" className="justify-self-start" onClick={() => { setSearch(""); setSourceFilter("all"); setStatusFilter("all"); setStateFilter("Nuevo León"); setTopicFilter("all"); setDateFrom(""); setDateTo(""); }}>Limpiar filtros</Button></div>
            {radarQuery.isLoading ? <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Cargando hallazgos…</div> : items.length === 0 ? <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No hay hallazgos con estos filtros. Ejecuta una revisión para consultar las fuentes oficiales.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-md border p-4" data-testid={`radar-item-${item.id}`}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><Badge variant="outline">{sourceLabelForItem(item)}</Badge><Badge variant={item.processingStatus === "ready_for_approval" ? "outline" : "secondary"}>{item.processingStatus === "ready_for_approval" ? "Pendiente de revisión" : item.processingStatus || "Borrador"}</Badge>{item.date && <time dateTime={item.date} className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("es-MX")}</time>}</div><h3 className="font-medium leading-snug">{item.titleEs}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.excerptEs}</p></div><div className="flex shrink-0 items-center gap-2"><Link href={`/admin/news/${item.id}/edit`}><Button size="sm" variant="outline">Revisar</Button></Link>{item.sourceUrl && <a className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label="Abrir fuente oficial">Fuente oficial <ExternalLink className="h-3.5 w-3.5" /></a>}</div></div></article>)}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Programación y fuentes</CardTitle><CardDescription>La revisión diaria se ejecuta con la zona horaria de Monterrey.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            {!config ? <p className="text-sm text-muted-foreground">Cargando configuración…</p> : <>
              <div className="flex items-center justify-between rounded-md border p-3"><div><Label htmlFor="radar-enabled">Revisión diaria</Label><p className="text-xs text-muted-foreground">Guarda borradores sin publicar.</p></div><Switch id="radar-enabled" checked={config.enabled} onCheckedChange={(enabled) => setConfig({ enabled })} data-testid="switch-radar-enabled" /></div>
              <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="radar-time">Hora local</Label><Input id="radar-time" type="time" value={timeValue} onChange={(event) => { const [hour, minute] = event.target.value.split(":").map(Number); setConfig({ hour, minute }); }} /></div><div><Label>Frecuencia</Label><Input value="Cada día" disabled /></div></div>
              <div><Label>Días de revisión</Label><div className="mt-2 flex flex-wrap gap-2">{weekDays.map(([day, label]) => <label key={day} className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs"><input type="checkbox" checked={config.days.includes(day)} onChange={() => { const days = config.days.includes(day) ? config.days.filter((value) => value !== day) : [...config.days, day]; if (days.length) setConfig({ days }); }} />{label}</label>)}</div></div>
              <div><Label>Fuentes oficiales</Label><p className="mt-1 text-xs text-muted-foreground">Elige qué repositorios consulta el Radar. Los resultados siempre quedan pendientes de revisión.</p><div className="mt-2 space-y-2">{sourceOptions.map((source) => { const key = sourceConfigKey(source.code); return <label key={source.code} className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={config.sources[key] ?? false} onChange={() => toggleSource(source.code)} className="mt-0.5" /><span><span className="font-medium">{source.name}</span>{radarQuery.data?.sources.find((item) => item.code === source.code)?.automatic === false && <span className="ml-2 text-xs text-muted-foreground">requiere fuente configurada</span>}</span></label>; })}</div></div>
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
