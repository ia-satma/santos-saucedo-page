import { IntegrationFields } from "@/features/site-config/IntegrationFields";
import type { SiteIntegrations } from "@shared/siteIntegrations";
import { NavigationFields } from '@/features/site-config/NavigationFields';
import type { SiteNavigation } from '@shared/siteControls';
import { useRef } from "react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAdminAuth, adminApiRequest } from '@/lib/adminAuth';
import { queryClient } from '@/lib/queryClient';
import { cmsSections, type CmsSection, type CmsValue } from '@shared/cms';
import { SUPPORTED_LANGUAGES } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ConfigFields } from '@/features/site-config/ConfigFields';
import { notifyCmsSaved } from '@/hooks/useCmsContent';
import { useToast } from '@/hooks/use-toast';

type SectionResponse = { section: CmsSection; content: CmsValue; revision: string; previous: CmsValue | null };
export default function AdminSiteConfig({fixedSection}:{fixedSection?:CmsSection}={}) {
  const { section: routeSection } = useParams<{section?: string}>();
  const selected=(fixedSection||routeSection)==='cookies'?'consent':fixedSection||routeSection||'home';
  const [, navigate] = useLocation();
  const section = cmsSections.find(s=>s.key===selected) ?? cmsSections[0];
  const { isAuthenticated, isLoading, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState<CmsValue | undefined>();
  const [snapshot, setSnapshot] = useState('');
  const [revision, setRevision] = useState('initial');
  const [lang, setLang] = useState('es');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  useEffect(()=>{requireAuth();},[requireAuth]);
  const queryKey = ['/api/admin/site-config', section.key];
  const query = useQuery<SectionResponse>({queryKey, enabled:isAuthenticated, refetchOnWindowFocus:false, staleTime:Infinity,
    queryFn:async()=>{const res=await adminApiRequest('GET',`/api/admin/site-config/${section.key}`);const data=await res.json();if(!res.ok)throw new Error(data.error || 'No se pudo abrir la sección.');return data;}});
  const loadedSection=useRef('');
  useEffect(()=>{ if (query.data && (loadedSection.current!==section.key || draft===undefined || JSON.stringify(draft)===snapshot)) {loadedSection.current=section.key;setDraft(query.data.content);setSnapshot(JSON.stringify(query.data.content));setRevision(query.data.revision);setError('');} },[query.data,section.key]);
  const dirty = draft!==undefined && JSON.stringify(draft)!==snapshot;
  useEffect(()=>{const fn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',fn);return()=>window.removeEventListener('beforeunload',fn);},[dirty]);
  useUnsavedChanges(dirty);
  const save=useMutation({mutationFn:async()=>{const res=await adminApiRequest('PUT',`/api/admin/site-config/${section.key}`,{content:draft,revision});const data=await res.json();if(!res.ok)throw new Error([data.error,...(data.details??[])].join('\n'));return data as SectionResponse;},onSuccess:data=>{setDraft(data.content);setSnapshot(JSON.stringify(data.content));setRevision(data.revision);queryClient.setQueryData(queryKey,data);notifyCmsSaved();toast({title:'Cambios guardados en el sitio'});setError('');},onError:e=>setError(e.message)});
  const storageStatus = useQuery<{configured:boolean;migration:{state:string;uploaded:number;total:number;bytes:number;error?:string;skipped?:string[]}}>({queryKey:['/api/admin/storage/status'],enabled:isAuthenticated&&section.key==='media',refetchInterval:5000,queryFn:async()=>{const r=await adminApiRequest('GET','/api/admin/storage/status');if(!r.ok)throw new Error('No se pudo consultar App Storage.');return r.json();}});
  const [storageBusy,setStorageBusy]=useState(false);
  const storageAction=async(action:'verify'|'import')=>{setStorageBusy(true);setError('');try{const r=await adminApiRequest('POST',`/api/admin/storage/${action}`,{});const d=await r.json();if(!r.ok)throw new Error(d.error||'No se pudo completar la operación.');if(action==='verify')toast({title:'App Storage conectado: escritura, lectura y borrado verificados'});else toast({title:'Importación iniciada; espere la verificación de los archivos'});void storageStatus.refetch();}catch(e){setError((e as Error).message);}finally{setStorageBusy(false);}};
  const changeSection=(key:string)=>{if(key===section.key)return;if(dirty && !window.confirm('Hay cambios sin guardar. ¿Descartarlos y abrir otra sección?'))return;setDraft(undefined);setSnapshot('');setError('');navigate(`/admin/site-config/${key}`);};
  const obj=draft && !Array.isArray(draft)&&typeof draft==='object'?draft:undefined;
  const langs=SUPPORTED_LANGUAGES.filter(l=>obj&&l.code in obj);
  const selectedLang=langs.some(l=>l.code===lang)?lang:langs[0]?.code;
  const value=selectedLang&&obj?obj[selectedLang]:draft;
  if(isLoading || !isAuthenticated)return <p className="p-8" role="status">Verificando sesión…</p>;
  return <div className="min-h-screen bg-muted/30">
    <header className="border-b bg-background"><div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin/dashboard" className="text-sm underline">← Panel</Link><h1 className="text-2xl mt-2">Contenido del sitio</h1></div><div className="flex flex-wrap gap-3"><a href={section.path} target="_blank" rel="noopener noreferrer" className="text-sm underline self-center">Abrir página ↗</a><Button variant="outline" onClick={()=>setShowPreview(!showPreview)}>{showPreview?'Cerrar vista':'Ver sitio'}</Button><Button disabled={!dirty||save.isPending} onClick={()=>save.mutate()} data-testid="button-save-site-config">{save.isPending?'Guardando…':'Guardar cambios'}</Button></div></div></header>
    <main className="max-w-5xl mx-auto px-5 py-8 space-y-8">
      <div className="flex flex-wrap gap-5 items-end border-b pb-6"><div className="flex-1 min-w-[220px]"><label htmlFor="cms-section" className="block text-xs mb-2 text-muted-foreground">Sección que está editando</label><select id="cms-section" className="border p-3 bg-white w-full" value={section.key} onChange={e=>changeSection(e.target.value as CmsSection)}>{cmsSections.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div><Link href="/admin/content" className="text-xs underline mb-3">Ver directorio de páginas</Link></div>
      <section className="min-w-0"><div className="mb-6"><h2 className="text-xl">{section.label}</h2><p className="text-sm text-muted-foreground mt-2 max-w-3xl">{section.help}</p><p className="text-xs text-muted-foreground mt-3">{dirty?'Tiene cambios sin guardar.':'Los cambios guardados se reflejan en el sitio sin volver a publicar código.'}</p></div>
        {section.key==='media'&&<div className="border bg-background p-5 mb-6 space-y-3"><h3 className="font-medium">Replit App Storage</h3><p className="text-sm">{storageStatus.data?.configured?'Bucket configurado.':'Falta configurar REPLIT_APP_STORAGE_BUCKET_ID en Replit.'}</p>{storageStatus.data&&<p className="text-sm">Importación: {storageStatus.data.migration.state} · {storageStatus.data.migration.uploaded}/{storageStatus.data.migration.total} archivos verificados</p>}{storageStatus.data?.migration.error&&<p role="alert" className="text-red-700 text-sm">{storageStatus.data.migration.error}</p>}<p className="text-sm text-muted-foreground">Carga el material del diseño actual y comprueba su integridad antes de enlazarlo. No elimina originales. Si la importación actualiza las imágenes, recargue esta sección antes de editar.</p><div className="flex flex-wrap gap-3"><Button variant="outline" disabled={storageBusy||!storageStatus.data?.configured} onClick={()=>void storageAction('verify')}>Verificar conexión</Button><Button variant="outline" disabled={storageBusy||dirty||!storageStatus.data?.configured||storageStatus.data?.migration.state==='running'} onClick={()=>void storageAction('import')}>Importar material a App Storage</Button><Button variant="outline" disabled={dirty} onClick={()=>query.refetch()}>Recargar medios guardados</Button></div></div>}
        {langs.length>0&&<div className="mb-6"><label htmlFor="cms-language" className="text-sm mr-3">Idioma</label><select id="cms-language" className="border p-2 bg-background" value={selectedLang} onChange={e=>setLang(e.target.value)}>{langs.map(l=><option key={l.code} value={l.code}>{l.nameNative}</option>)}</select></div>}
        {error&&<div role="alert" className="border border-red-300 bg-red-50 text-red-800 whitespace-pre-line p-4 mb-5">{error}<Button variant="outline" size="sm" className="mt-3" onClick={()=>{if(!dirty||window.confirm('¿Descartar el borrador y cargar la última versión?')){setDraft(undefined);void query.refetch();}}}>Recargar versión guardada</Button></div>}
        {query.isLoading&&<p role="status">Cargando contenido…</p>}{query.isError&&<p role="alert">{query.error.message} <Button variant="outline" onClick={()=>query.refetch()}>Reintentar</Button></p>}
        {value!==undefined&&<div className="border bg-background p-5 md:p-8" key={`${section.key}-${selectedLang??'all'}`}>{section.key==='integrations'?<IntegrationFields value={value as unknown as SiteIntegrations} onChange={next=>setDraft(next as unknown as CmsValue)}/>:section.key==='navigation'?<NavigationFields value={value as unknown as SiteNavigation} onChange={next=>setDraft(next as unknown as CmsValue)}/>:<ConfigFields value={value} media={section.key==='media'} path={selectedLang?[selectedLang]:[]} onChange={next=>setDraft(selectedLang&&obj?{...obj,[selectedLang]:next}:next)}/>}</div>}
        {query.data?.previous&&<div className="mt-6"><Button variant="outline" onClick={()=>{if(window.confirm('¿Cargar la versión anterior como borrador? Tendrá que guardar para aplicarla.'))setDraft(query.data!.previous!);}}>Cargar versión anterior</Button></div>}
        {showPreview&&<div className="border mt-8 bg-background"><p className="p-3 text-sm">Vista del sitio guardado. El borrador se muestra después de guardar.</p><iframe key={query.data?.revision} title={`Vista de ${section.label}`} src={`${section.path}?cms-preview=1`} className="w-full h-[700px] border-t"/></div>}
      </section>
    </main>
  </div>;
}
