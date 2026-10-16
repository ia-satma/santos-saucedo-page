import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAdminAuth, adminApiRequest } from '@/lib/adminAuth';
import { notifyCmsSaved } from '@/hooks/useCmsContent';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { JobOpening } from '@shared/schema';
const initial = { title:'',titleEs:'',description:'',descriptionEs:'',department:'',departmentEs:'',location:'San Pedro Garza García, N.L.',locationEs:'San Pedro Garza García, N.L.',type:'full_time',applicationEmail:'',applicationUrl:'',requirements:'',requirementsEs:'',benefits:'',benefitsEs:'',salaryRange:'',published:false,expiresAt:'' };
type Draft = typeof initial;
const labels: Record<string,string>={title:'Título en inglés',titleEs:'Título en español',description:'Descripción en inglés',descriptionEs:'Descripción en español',department:'Área en inglés',departmentEs:'Área en español',location:'Ubicación en inglés',locationEs:'Ubicación en español',applicationEmail:'Correo para postularse (opcional)',applicationUrl:'Enlace HTTPS para postularse (opcional)',requirements:'Requisitos en inglés',requirementsEs:'Requisitos en español',benefits:'Prestaciones en inglés',benefitsEs:'Prestaciones en español',salaryRange:'Rango salarial (opcional)'};
export default function AdminJobs(){
 const {isAuthenticated,requireAuth}=useAdminAuth();const [draft,setDraft]=useState<Draft|null>(null);const [id,setId]=useState<string|null>(null);const [error,setError]=useState('');
 useEffect(()=>{requireAuth();},[requireAuth]);
 const query=useQuery<JobOpening[]>({queryKey:['/api/admin/jobs'],enabled:isAuthenticated,queryFn:async()=>{const r=await adminApiRequest('GET','/api/admin/jobs');if(!r.ok)throw new Error('No se pudieron cargar las vacantes.');return r.json();}});
 const save=useMutation({mutationFn:async()=>{if(!draft?.title.trim()||!draft.titleEs.trim()||!draft.description.trim()||!draft.descriptionEs.trim())throw new Error('Complete título y descripción en español e inglés.');if(draft.applicationUrl&&!/^https:\/\//.test(draft.applicationUrl))throw new Error('El enlace de postulación debe usar HTTPS.');const r=await adminApiRequest(id?'PUT':'POST',id?`/api/admin/jobs/${id}`:'/api/admin/jobs',{...draft,expiresAt:draft.expiresAt?new Date(draft.expiresAt).toISOString():null});const d=await r.json();if(!r.ok)throw new Error(d.error||'No se pudo guardar.');return d;},onSuccess:()=>{setDraft(null);setError('');notifyCmsSaved();void query.refetch();},onError:e=>setError(e.message)});
 const start=(job?:JobOpening)=>{if(draft&&!window.confirm('¿Descartar los cambios de esta vacante?'))return;setError('');setId(job?.id??null);setDraft(job?Object.fromEntries(Object.entries(initial).map(([k,v])=>[k,k==='expiresAt'?(job.expiresAt?new Date(job.expiresAt).toISOString().slice(0,16):''):(job as any)[k]??v])) as Draft:{...initial});};
 if(!isAuthenticated)return null;
 return <div className="max-w-6xl mx-auto p-6"><Link href="/admin/dashboard" className="underline">← Panel</Link><header className="flex justify-between gap-5 my-8"><div><h1 className="text-2xl">Vacantes</h1><p className="text-sm text-muted-foreground mt-2">Las publicadas y vigentes aparecen en Carreras.</p></div><Button onClick={()=>start()}>Nueva vacante</Button></header>
 {query.isError&&<p role="alert">{query.error.message}</p>}
 <div className="grid gap-8 md:grid-cols-[300px_1fr]"><aside className="space-y-3">{query.data?.map(j=><button key={j.id} className="block w-full border p-4 text-left" onClick={()=>start(j)}><strong className="block">{j.titleEs}</strong><span className="text-sm text-muted-foreground">{j.published?'Publicada':'Borrador'}</span></button>)}{!query.isLoading&&!query.data?.length&&<p>No hay vacantes. La página muestra el mensaje de lista vacía.</p>}</aside>
 {draft&&<form className="space-y-5 border p-6" onSubmit={e=>{e.preventDefault();save.mutate();}}><h2 className="text-xl">{id?'Editar vacante':'Nueva vacante'}</h2>{Object.keys(labels).map(key=><div key={key}><label htmlFor={`job-${key}`} className="text-sm block mb-2">{labels[key]}</label>{/description|requirements|benefits/.test(key)?<Textarea id={`job-${key}`} value={String(draft[key as keyof Draft])} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>:<Input id={`job-${key}`} value={String(draft[key as keyof Draft])} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>}</div>)}
 <div><label htmlFor="job-type" className="block text-sm mb-2">Modalidad</label><select id="job-type" value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})} className="border bg-background p-2"><option value="full_time">Tiempo completo</option><option value="part_time">Medio tiempo</option><option value="internship">Pasante</option><option value="contract">Contrato</option></select></div>
 <div><label htmlFor="job-expiry">Vigencia (opcional)</label><Input id="job-expiry" type="datetime-local" value={draft.expiresAt} onChange={e=>setDraft({...draft,expiresAt:e.target.value})}/></div>
 <div className="flex items-center gap-4"><label htmlFor="job-published">Publicada</label><Switch id="job-published" checked={draft.published} onCheckedChange={v=>setDraft({...draft,published:v})}/></div>
 {error&&<p role="alert" className="text-red-700">{error}</p>}<Button disabled={save.isPending} type="submit">{save.isPending?'Guardando…':'Guardar vacante'}</Button><Button type="button" variant="outline" className="ml-3" onClick={()=>{if(window.confirm('¿Cerrar este borrador sin guardar?'))setDraft(null);}}>Cerrar</Button></form>}
 </div></div>;
}
