import fs from 'node:fs/promises';
import { bundledManifestKey, clearBundledMediaMap } from './bundledMediaMap';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { storage } from '../storage';
import { siteConfig, teamMembers, practiceGroups, industryGroups, news, officeImages, mediaItems } from '@shared/schema';
import bundled from '@shared/cms-media-manifest.json';
import { cmsDefaults, mergeCms, validateCmsValue, isCmsSection } from '@shared/cms';
import { isNamedOnTeamPage } from '@shared/teamVisibility';
import { uploadAppStorageObject, downloadAppStorageObject, storageBucketId, verifyAppStorage } from '../replitStorage';

export type ImportStatus = { state:'idle'|'running'|'complete'|'failed'; uploaded:number; total:number; bytes:number; error?:string; skipped:string[]; finishedAt?:string };
let state:ImportStatus={state:'idle',uploaded:0,total:0,bytes:0,skipped:[]};
export const mediaImportStatus=()=>state;
const statusKey='infrastructure.media-import';
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const mime:Record<string,string>={'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf','.ico':'image/x-icon'};
const root=process.cwd();
function visit(value:unknown,fn:(s:string)=>void){if(typeof value==='string')fn(value);else if(Array.isArray(value))value.forEach(v=>visit(v,fn));else if(value&&typeof value==='object')Object.values(value).forEach(v=>visit(v,fn));}
function replace(value:any,paths:Map<string,string>):any{if(typeof value==='string')return paths.get(value)??value;if(Array.isArray(value))return value.map(v=>replace(v,paths));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replace(v,paths)]));return value;}
function safeFile(base:string,suffix:string){const file=path.resolve(root,base,suffix);const allowed=path.resolve(root,base)+path.sep;return file.startsWith(allowed)?file:null;}
async function resolveSource(url:string):Promise<string|null>{
 let name:string;try{name=decodeURIComponent(url.split('?')[0]);}catch{return null;}
 const candidates:string[]=[];
 if(name.startsWith('/team_photos/')){const f=safeFile('attached_assets/team_photos',name.slice(13));if(f)candidates.push(f);}
 if(name.startsWith('/uploads/')){const f=safeFile('uploads',name.slice(9));if(f)candidates.push(f);}
 if(name.startsWith('/generated-images/')){const f=safeFile('public/generated-images',name.slice(18));if(f)candidates.push(f);}
 if(name.startsWith('/')&&!name.startsWith('//'))for(const base of ['client/public','public']){const f=safeFile(base,name.slice(1));if(f)candidates.push(f);}
 for(const f of candidates)try{if((await fs.stat(f)).isFile())return f;}catch{}
 return null;
}
async function persistStatus(){await db.insert(siteConfig).values({key:statusKey,type:'json',category:'infrastructure',value:JSON.stringify(state)}).onConflictDoUpdate({target:siteConfig.key,set:{value:JSON.stringify(state),updatedAt:new Date()}});}
export async function savedMediaImportStatus(){const [row]=await db.select().from(siteConfig).where(eq(siteConfig.key,statusKey));return state.state==='running'?state:(row?.value?JSON.parse(row.value):state);}

// Read/upload/verify every source before changing a single reference. Hash-named objects
// make retries safe; no source files or previous objects are deleted.
export async function importBundledMedia(){
 if(state.state==='running')throw new Error('Ya hay una importación en curso.');
 if(!storageBucketId())throw new Error('Falta REPLIT_APP_STORAGE_BUCKET_ID.');
 state={state:'running',uploaded:0,total:0,bytes:0,skipped:[]};await persistStatus();
 try{
  await verifyAppStorage();
  const configs=await db.select().from(siteConfig);
  const people=await storage.getTeamMembers();
  const practices=await storage.getPracticeGroups();
  const industries=await storage.getIndustryGroups();
  const notes=await storage.getNews();
  const gallery=await storage.getOfficeImages();
  const items=await storage.getMediaItems();
  const mediaRow=configs.find((r:any)=>r.key==='editorial.media');
  const currentMedia=mergeCms(cmsDefaults.media,mediaRow?.value?JSON.parse(mediaRow.value).content:undefined);
  const urls=new Set<string>();
  const add=(s:string)=>{if(s.startsWith('/')&&!s.startsWith('/media/')&&mime[path.extname(s.split('?')[0]).toLowerCase()])urls.add(s);};
  visit(currentMedia,add);
  for (const item of bundled) add(item.url);
  for(const p of people.filter(isNamedOnTeamPage))if(p.imageUrl)add(p.imageUrl);
  for(const group of [...practices,...industries])if(group.imageUrl)add(group.imageUrl);
  for(const note of notes)if(note.imageUrl)add(note.imageUrl);
  for(const image of gallery)add(image.imageUrl);
  for(const item of items)add(item.path);
  for(const c of configs.filter((r:any)=>r.key.startsWith('editorial.')&&r.value)){const data=JSON.parse(c.value).content;visit(data,add);}
  const sources=new Map<string,string>();
  for(const url of Array.from(urls)){const file=await resolveSource(url);if(file)sources.set(url,file);else state.skipped.push(url);}
  state.total=sources.size;await persistStatus();
  const paths=new Map<string,string>();
  const knownMediaPaths=new Set(items.map(i=>i.path));
  for(const [url,file]of Array.from(sources)){
   const content=await fs.readFile(file);const digest=hash(content);const ext=path.extname(file).toLowerCase();
   const filename=`${digest.slice(0,24)}-${path.basename(file).replace(/[^a-zA-Z0-9._-]/g,'-')}`;
   const objectKey=`public/media/${filename}`;
   await uploadAppStorageObject(objectKey,content);
   const check=await downloadAppStorageObject(objectKey);
   if(!check||hash(check)!==digest)throw new Error(`Falló la verificación del archivo ${path.basename(file)}.`);
   const target=`/media/${objectKey}`;paths.set(url,target);
   if(!knownMediaPaths.has(target)){ await db.insert(mediaItems).values({filename,originalName:path.basename(file),path:target,mimeType:mime[ext],size:content.length,alt:path.basename(file),altEs:path.basename(file)});knownMediaPaths.add(target); }
   state.uploaded++;state.bytes+=content.length;
   if(state.uploaded%10===0)await persistStatus();
   console.log(`[MediaImport] Verificado ${state.uploaded}/${state.total}: ${path.basename(file)}`);
  }
  // Every media default must be importable. Missing legacy references remain unchanged and
  // are reported, but missing current brand/video/photo sources stop the reference switch.
  const mandatory:string[]=[];visit(currentMedia,s=>{if(urls.has(s)&&!paths.has(s))mandatory.push(s);});
  if(mandatory.length)throw new Error(`Faltan archivos del diseño actual: ${mandatory.join(', ')}`);
  const publishedManifest=Buffer.from(JSON.stringify({ paths:Object.fromEntries(paths), files:state.total, bytes:state.bytes }));
  await uploadAppStorageObject(bundledManifestKey,publishedManifest);
  const verifyManifest=await downloadAppStorageObject(bundledManifestKey);
  if(!verifyManifest?.equals(publishedManifest))throw new Error('No se pudo verificar el índice de medios.');
  clearBundledMediaMap();
  const nextMedia=replace(currentMedia,paths);
  const errors=validateCmsValue('media',nextMedia);if(errors.length)throw new Error(errors.join(' '));
  const raw=JSON.stringify({content:nextMedia,previous:currentMedia});
  const changed=mediaRow?await db.update(siteConfig).set({value:raw,updatedAt:new Date()}).where(and(eq(siteConfig.key,'editorial.media'),eq(siteConfig.value,mediaRow.value))).returning():await db.insert(siteConfig).values({key:'editorial.media',type:'json',category:'editorial',value:raw}).onConflictDoNothing().returning();
  if(!changed.length)throw new Error('La configuración de medios cambió durante la importación; vuelva a ejecutarla para conservar las ediciones.');
  for(const [table,rows,column]of [[teamMembers,people,'imageUrl'],[practiceGroups,practices,'imageUrl'],[industryGroups,industries,'imageUrl'],[news,notes,'imageUrl'],[officeImages,gallery,'imageUrl'],[mediaItems,items,'path']] as const){for(const row of rows){const old=(row as any)[column];const target=paths.get(old);if(target)await db.update(table).set({[column]:target}).where(and(eq((table as any).id,row.id),eq((table as any)[column],old)));}}
  for(const c of configs.filter((r:any)=>r.key.startsWith('editorial.')&&r.key!=='editorial.media'&&r.value)){
   const key=c.key.slice(10);if(!isCmsSection(key))continue;const parsed=JSON.parse(c.value);const next=replace(parsed.content,paths);if(JSON.stringify(next)!==JSON.stringify(parsed.content))await db.update(siteConfig).set({value:JSON.stringify({content:next,previous:parsed.content}),updatedAt:new Date()}).where(and(eq(siteConfig.id,c.id),eq(siteConfig.value,c.value)));
  }
  state={...state,state:'complete',finishedAt:new Date().toISOString()};await persistStatus();return state;
 }catch(error){state={...state,state:'failed',error:(error as Error).message,finishedAt:new Date().toISOString()};await persistStatus();throw error;}
}
