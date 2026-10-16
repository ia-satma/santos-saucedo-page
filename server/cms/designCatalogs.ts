import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { practiceGroups, teamMembers, siteConfig } from '@shared/schema';
import { practiceGroupsData, teamMembersData } from '../seed';
import { CONFIRMED_PARTNER_SLUGS } from '@shared/teamVisibility';

// Bridge the older six-service database to the four approved practices in design d7cdf63.
// Existing edited records are never overwritten; former template entries are unpublished,
// retained in the admin catalog and can be published again deliberately.
export async function connectDesignCatalogs() {
 const key='migration.design26-catalogs.v1';
 const [done]=await db.select().from(siteConfig).where(eq(siteConfig.key,key));if(done)return;
 for(const item of practiceGroupsData)await db.insert(practiceGroups).values({...item,published:true}).onConflictDoNothing({target:practiceGroups.slug});
 for(const item of teamMembersData.filter(m=>CONFIRMED_PARTNER_SLUGS.has(m.slug)))await db.insert(teamMembers).values(item).onConflictDoNothing({target:teamMembers.slug});
 const legacy:Record<string,string>={
  'conflictos-individuales-colectivos':'Conflictos Individuales y Colectivos de Trabajo',
  'administracion-laboral':'Revisión de la Función de Administración Laboral',
  'diagnostico-relaciones-laborales':'Diagnóstico de Relaciones Laborales',
  'planes-mejora':'Planes de Mejora',
  'auditoria-juridico-laboral':'Auditoría Jurídico-Laboral',
  'planeacion-estrategica-capacitacion':'Planeación Estratégica y Capacitación',
 };
 const archived:unknown[]=[];
 for(const [slug,label]of Object.entries(legacy)){
  const changed=await db.update(practiceGroups).set({published:false}).where(and(eq(practiceGroups.slug,slug),eq(practiceGroups.nameEs,label))).returning({id:practiceGroups.id,slug:practiceGroups.slug});archived.push(...changed);
 }
 await db.insert(siteConfig).values({key,type:'json',category:'migration',value:JSON.stringify({appliedAt:new Date().toISOString(),legacyPractices:archived})}).onConflictDoNothing();
}
