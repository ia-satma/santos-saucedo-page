import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminApiRequest } from '@/lib/adminAuth';
import { Button } from '@/components/ui/button';
import type { ContactSubmission, NewsletterSubscriber } from '@shared/schema';
export default function AdminInbox(){
 const {isAuthenticated,requireAuth}=useAdminAuth();const [error,setError]=useState('');
 useEffect(()=>{requireAuth();},[requireAuth]);
 const read=async(url:string)=>{const r=await adminApiRequest('GET',url);if(!r.ok)throw new Error('No se pudo cargar la información.');return r.json();};
 const contacts=useQuery<ContactSubmission[]>({queryKey:['/api/admin/contact-submissions'],enabled:isAuthenticated,queryFn:()=>read('/api/admin/contact-submissions')});
 const subscribers=useQuery<NewsletterSubscriber[]>({queryKey:['/api/admin/newsletter-subscribers'],enabled:isAuthenticated,queryFn:()=>read('/api/admin/newsletter-subscribers')});
 const markRead=async(id:string)=>{setError('');try{const r=await adminApiRequest('PATCH',`/api/admin/contact-submissions/${id}/read`,{});if(!r.ok)throw new Error('No se pudo marcar el mensaje.');await contacts.refetch();}catch(e){setError((e as Error).message);}};
 if(!isAuthenticated)return null;
 return <main className="max-w-6xl mx-auto p-6"><Link href="/admin/dashboard" className="underline">← Panel</Link><h1 className="text-2xl mt-8">Mensajes y suscriptores</h1><p className="text-sm text-muted-foreground mt-2">Información recibida por los formularios del sitio. Esta pantalla no envía correos.</p>
 {error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}
 <section className="mt-10"><h2 className="text-xl mb-5">Contacto</h2>{contacts.isLoading&&<p role="status">Cargando mensajes…</p>}{contacts.isError&&<p role="alert">{contacts.error.message}</p>}{contacts.data?.length===0&&<p>Aún no hay mensajes.</p>}<div className="space-y-4">{contacts.data?.map(m=><article key={m.id} className="border p-5"><div className="flex flex-wrap justify-between gap-4"><div><h3 className="font-semibold">{m.fullName}</h3><p className="text-sm">{m.email} · {m.company}</p><p className="text-xs text-muted-foreground">{m.submittedAt?new Date(m.submittedAt).toLocaleString('es-MX'):''} · {m.practiceArea}</p></div>{!m.read?<Button variant="outline" onClick={()=>void markRead(m.id)}>Marcar como leído</Button>:<span className="text-sm">Leído</span>}</div><p className="whitespace-pre-line mt-4">{m.message}</p></article>)}</div></section>
 <section className="mt-12"><h2 className="text-xl mb-5">Suscripciones al Monitor Laboral</h2>{subscribers.isLoading&&<p role="status">Cargando suscripciones…</p>}{subscribers.isError&&<p role="alert">{subscribers.error.message}</p>}{subscribers.data?.length===0&&<p>Aún no hay suscripciones.</p>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Correo</th><th className="p-3">Nombre / empresa</th><th className="p-3">Idioma</th><th className="p-3">Estado</th></tr></thead><tbody>{subscribers.data?.map(s=><tr key={s.id} className="border-b"><td className="p-3">{s.email}</td><td className="p-3">{s.name} {s.company}</td><td className="p-3">{s.preferredLanguage}</td><td className="p-3">{s.isActive?'Activa':'Inactiva'}</td></tr>)}</tbody></table></div></section>
 </main>;
}
