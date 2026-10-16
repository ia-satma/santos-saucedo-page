import { getAuthHeaders } from './adminAuth';
import type { MediaItem } from '@shared/schema';
export const MAX_MEDIA_BYTES=200*1024*1024;
const mimeByExt:Record<string,string>={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',pdf:'application/pdf',mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',mov:'video/quicktime',ogv:'video/ogg',ogg:'video/ogg'};
export function browserMediaMime(file:File){const mime=file.type.toLowerCase();return !mime||['application/octet-stream','video/x-m4v','video/m4v'].includes(mime)?mimeByExt[file.name.split('.').at(-1)?.toLowerCase()||'']||mime:mime;}
type Options={onProgress?:(percentage:number)=>void;signal?:AbortSignal};
class UploadError extends Error{constructor(message:string,readonly status:number){super(message);}}
async function request(url:string,body:BodyInit,headers:Record<string,string>,signal?:AbortSignal){
 const r=await fetch(url,{method:'POST',headers:{...getAuthHeaders(),...headers},body,signal});const data=await r.json().catch(()=>null);if(!r.ok)throw new UploadError(data?.error||'No se pudo cargar el archivo.',r.status);return data;
}
async function retry<T>(action:()=>Promise<T>,signal?:AbortSignal):Promise<T>{for(let i=0;;i++){try{return await action();}catch(e){if(signal?.aborted||i>=2||e instanceof UploadError&&e.status<500)throw e;await new Promise<void>((resolve,reject)=>{const timer=setTimeout(resolve,500*(i+1));signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Carga cancelada','AbortError'));},{once:true});});}}}
export async function uploadAdminMedia(file:File,options:Options={}):Promise<MediaItem>{
 if(!file.size||file.size>MAX_MEDIA_BYTES)throw new Error('Elija un archivo de hasta 200 MB.');
 const mime=browserMediaMime(file);if(!Object.values(mimeByExt).includes(mime))throw new Error('Use JPG, PNG, WebP, GIF, PDF, MP4, M4V, WebM, MOV u OGV.');
 options.onProgress?.(0);
 if(file.size<=4*1024*1024){const body=new FormData();body.append('file',file);const data=await request('/api/admin/media/upload',body,{},options.signal);options.onProgress?.(100);return data;}
 let token='';
 try{
  const session=await request('/api/admin/media/upload/start',JSON.stringify({originalName:file.name,mimeType:mime,size:file.size}),{'Content-Type':'application/json'},options.signal);token=session.token;
  for(let index=0;index<session.totalChunks;index++){
   const bytes=await file.slice(index*session.chunkSize,Math.min(file.size,(index+1)*session.chunkSize)).arrayBuffer();
   const checksum=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
   await retry(()=>request('/api/admin/media/upload/chunk',bytes,{'Content-Type':'application/octet-stream','X-Upload-Token':token,'X-Chunk-Index':String(index),'X-Chunk-Sha256':checksum},options.signal),options.signal);
   options.onProgress?.(Math.min(95,Math.round((index+1)/session.totalChunks*95)));
  }
  const result=await retry(()=>request('/api/admin/media/upload/complete',JSON.stringify({token}),{'Content-Type':'application/json'},options.signal),options.signal);options.onProgress?.(100);return result;
 }catch(e){if(token)await request('/api/admin/media/upload/abort',JSON.stringify({token}),{'Content-Type':'application/json'}).catch(()=>{});if(options.signal?.aborted)throw new Error('Carga cancelada. Se conserva el archivo anterior.');throw e;}
}
