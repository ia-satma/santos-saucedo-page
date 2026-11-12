import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { adminApiRequest, readAdminJson, useMyPermissions } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Article = {
  id: string;
  title: string;
  titleEs: string;
  published: boolean;
  translatedLanguages: string[];
  missingLanguages: string[];
};
type LanguageRow = { code: string; nameNative: string; name: string; enabled: boolean };
type LanguageCoverage = LanguageRow & { translated: number; total: number; percentage: number };
type Job = { id: string; status: string; startedAt?: string; completedAt?: string; error?: string; payload?: { targetLanguages?: string[] } };
type Tab = "summary" | "articles" | "jobs" | "languages";

const tabLabels: Record<Tab, string> = {
  summary: "Resumen",
  articles: "Artículos",
  jobs: "Trabajos recientes",
  languages: "Idiomas activos",
};

export default function AdminTranslations() {
  const { toast } = useToast();
  const { has } = useMyPermissions();
  const [tab, setTab] = useState<Tab>("summary");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const query = useQuery<{
    languages: string[];
    activeLanguages: string[];
    allLanguages: LanguageRow[];
    coverage: { translatedCells: number; totalCells: number; percentage: number };
    languageCoverage?: LanguageCoverage[];
    articles: Article[];
  }>({
    queryKey: ["/api/admin/translation-overview"],
    queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/translation-overview"), "No se pudo cargar la cobertura."),
  });
  const jobs = useQuery<Job[]>({
    queryKey: ["/api/agents/jobs", "polyglot_translator"],
    enabled: tab === "jobs",
    queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/agents/jobs?agentType=polyglot_translator&limit=20"), "No se pudieron cargar los trabajos."),
  });
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  useEffect(() => { if (query.data) setActiveLanguages(query.data.activeLanguages); }, [query.data]);

  const saveLanguages = async () => {
    try {
      const result = await readAdminJson<{ activeLanguages: string[] }>(await adminApiRequest("PUT", "/api/admin/active-languages", { activeLanguages }), "No se pudieron guardar los idiomas activos.");
      setActiveLanguages(result.activeLanguages);
      toast({ title: "Idiomas activos actualizados" });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/translation-overview"] });
    } catch (error) {
      toast({ title: "No se guardaron los idiomas", description: (error as Error).message, variant: "destructive" });
    }
  };
  const translate = async (article: Article) => {
    setBusy(article.id);
    try {
      const result = await readAdminJson<{ success: boolean; error?: string }>(await adminApiRequest("POST", "/api/agents/run/polyglot_translator", { articleId: article.id, targetLanguages: article.missingLanguages, applyChanges: true }), "No se pudo completar la traducción.");
      if (!result.success) throw new Error(result.error || "La traducción requiere revisión.");
      toast({ title: "Traducciones guardadas en el borrador" });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/translation-overview"] });
    } catch (error) {
      toast({ title: "No se guardó la traducción", description: (error as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };
  const data = query.data;
  const coverage = data?.languageCoverage ?? data?.languages.map((code) => {
    const language = data.allLanguages.find((item) => item.code === code) as LanguageRow;
    const translated = data.articles.filter((article) => article.translatedLanguages.includes(code)).length;
    return { ...language, translated, total: data.articles.length, percentage: data.articles.length ? Math.round((translated / data.articles.length) * 100) : 100 };
  }) ?? [];
  const filteredArticles = data?.articles.filter((article) => `${article.title} ${article.titleEs}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  const translatedArticles = data?.articles.filter((article) => data.activeLanguages.every((language) => article.translatedLanguages.includes(language))).length ?? 0;

  return <main className="admin-management-page">
    <p className="admin-page-kicker">Configuración · Traducciones</p>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1>Cobertura de traducción</h1><p className="my-3 max-w-3xl text-muted-foreground">Edita español e inglés desde el CMS. El agente genera los idiomas adicionales activos con el glosario jurídico y la guía editorial de Santos &amp; Saucedo.</p></div>
      <Button variant="outline" onClick={() => void query.refetch()}>Actualizar</Button>
    </div>
    <div className="mt-6 rounded-md border bg-white p-1" role="tablist" aria-label="Secciones de traducciones">
      {(Object.keys(tabLabels) as Tab[]).map((key) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded px-4 py-2 text-sm ${tab === key ? "bg-slate-900 text-white" : "text-muted-foreground hover:bg-slate-100"}`}>{tabLabels[key]}</button>)}
    </div>
    {query.isPending ? <p className="mt-8" role="status">Cargando cobertura…</p> : query.isError ? <p className="mt-8" role="alert">{query.error.message}</p> : data ? <>
      {tab === "summary" && <>
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen de cobertura">
          {[["Total de artículos", data.articles.length], ["Traducidos", translatedArticles], ["Tasa de cobertura", `${data.coverage.percentage}%`], ["Idiomas activos", data.activeLanguages.length]].map(([label, value]) => <div className="rounded-md border bg-white p-5" key={String(label)}><p className="text-sm text-muted-foreground">{label}</p><strong className="mt-3 block text-3xl font-medium tracking-tight">{value}</strong></div>)}
        </section>
        <section className="mt-6 rounded-md border bg-white p-5" aria-labelledby="coverage-by-language"><h2 id="coverage-by-language" className="text-lg font-medium">Cobertura por idioma</h2><p className="mb-5 text-sm text-muted-foreground">Progreso de cada idioma activo en los artículos del Monitor Laboral.</p><div className="space-y-4">{coverage.map((language) => <div key={language.code}><div className="mb-1 flex justify-between text-sm"><span>{language.nameNative} <span className="text-muted-foreground">({language.name})</span></span><span>{language.translated} / {language.total} · {language.percentage}%</span></div><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-slate-800" style={{ width: `${language.percentage}%` }} /></div></div>)}</div></section>
        <section className="mt-6 rounded-md border bg-white p-5" aria-labelledby="distribution-by-language"><h2 id="distribution-by-language" className="text-lg font-medium">Distribución por idioma</h2><p className="mb-5 text-sm text-muted-foreground">Las traducciones adicionales se generan con IA y quedan disponibles para revisión.</p><div className="space-y-3">{coverage.map((language) => <div key={language.code} className="flex items-center gap-3"><span className="w-28 text-sm">{language.nameNative}</span><div className="h-3 flex-1 rounded bg-slate-100"><div className="h-3 rounded bg-slate-500" style={{ width: `${data.articles.length ? Math.max(1, (language.translated / data.articles.length) * 100) : 0}%` }} /></div><span className="w-12 text-right text-sm tabular-nums">{language.translated}</span></div>)}</div></section>
        <section className="mt-6 rounded-md border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-medium">Base de conocimiento del traductor</h2><p className="text-sm text-muted-foreground">Glosario laboral mexicano, estilo por idioma y controles de calidad editables.</p></div><Link className="underline" href="/admin/knowledge">Abrir base de conocimiento ↗</Link></div></section>
      </>}
      {tab === "articles" && <section className="mt-6 rounded-md border bg-white p-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-medium">Artículos</h2><Input aria-label="Buscar artículos para traducir" placeholder="Buscar por título…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" /></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Título</th><th className="p-3">Estado de traducción</th><th className="p-3">Acción</th></tr></thead><tbody>{filteredArticles.map((article) => <tr className="border-b last:border-0" key={article.id}><td className="p-3"><Link className="underline" href={`/admin/news/${article.id}/edit`}>{article.titleEs || article.title}</Link><p className="text-xs text-muted-foreground">{article.published ? "Publicada" : "Borrador"}</p></td><td className="p-3"><div className="flex flex-wrap gap-1">{data.allLanguages.filter((language) => data.activeLanguages.includes(language.code)).map((language) => <span key={language.code} className={`rounded border px-2 py-0.5 text-xs ${article.translatedLanguages.includes(language.code) ? "border-slate-300 bg-slate-100" : "border-slate-200 text-muted-foreground"}`}>{language.code.toUpperCase()}</span>)}</div></td><td className="p-3"><Button disabled={!!busy || article.published || !article.missingLanguages.length || !has("agents")} onClick={() => void translate(article)}>{busy === article.id ? "Traduciendo…" : article.published ? "Pasar a borrador para traducir" : "Crear borrador para traducir"}</Button></td></tr>)}</tbody></table>{!filteredArticles.length && <p className="p-4 text-muted-foreground">Todavía no hay publicaciones.</p>}</div></section>}
      {tab === "jobs" && <section className="mt-6 rounded-md border bg-white p-5"><h2 className="mb-4 text-lg font-medium">Trabajos recientes</h2>{jobs.isPending ? <p role="status">Cargando trabajos…</p> : jobs.isError ? <p role="alert">{jobs.error.message}</p> : jobs.data?.length ? <div className="divide-y">{jobs.data.map((job) => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={job.id}><div><strong>{job.status}</strong><p className="text-sm text-muted-foreground">{job.startedAt ? new Date(job.startedAt).toLocaleString("es-MX") : "Sin fecha"}</p></div><span className="text-sm text-muted-foreground">{job.payload?.targetLanguages?.join(", ") || "Idiomas activos"}</span></div>)}</div> : <p className="text-muted-foreground">Todavía no hay trabajos de traducción.</p>}</section>}
      {tab === "languages" && <section className="mt-6 rounded-md border bg-white p-5"><h2 className="text-lg font-medium">Idiomas activos</h2><p className="mb-5 text-sm text-muted-foreground">Español es el idioma base y español e inglés se editan manualmente. Active los idiomas adicionales que el agente debe generar.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{data.allLanguages.map((language) => <label key={language.code} className="flex items-center gap-2 rounded border p-3 text-sm"><input type="checkbox" checked={activeLanguages.includes(language.code)} disabled={language.code === "es" || !has("advanced")} onChange={() => setActiveLanguages((current) => current.includes(language.code) ? current.filter((item) => item !== language.code) : [...current, language.code])} /><span>{language.code === "es" ? "Español (base)" : language.nameNative}</span></label>)}</div><Button className="mt-5" onClick={() => void saveLanguages()} disabled={!has("advanced") || !activeLanguages.includes("es")}>Guardar idiomas activos</Button></section>}
    </> : null}
  </main>;
}
