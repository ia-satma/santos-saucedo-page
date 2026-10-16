import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { Client } from '@replit/object-storage';

const localStorageRoot = path.join(process.cwd(), 'uploads');
const isReplitRuntime = Boolean(process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT || process.env.REPLIT_DEV_DOMAIN);
let clientPromise: Promise<Client | null> | undefined;
export const storageBucketId = () => process.env.REPLIT_APP_STORAGE_BUCKET_ID || process.env.APP_STORAGE_BUCKET_ID;
export function isPublicMediaKey(name: string) {
  return /^public\/media\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) && !name.includes('..');
}
function assertKey(name: string) { if (!isPublicMediaKey(name)) throw new Error('Invalid App Storage object name'); }
function objectPath(name: string) { assertKey(name); return path.join(localStorageRoot, name); }
async function getClient(): Promise<Client | null> {
  if (!clientPromise) clientPromise = (async () => {
    const bucketId = storageBucketId();
    if (!isReplitRuntime && process.env.NODE_ENV !== 'production' && !bucketId) return null;
    if (!bucketId) throw new Error('REPLIT_APP_STORAGE_BUCKET_ID must be configured before uploading media');
    const { Client } = await import('@replit/object-storage');
    return new Client({ bucketId });
  })();
  return clientPromise;
}
export async function uploadAppStorageObject(name: string, contents: Buffer) {
  assertKey(name);
  const client = await getClient();
  if (client) { const r = await client.uploadFromBytes(name, contents); if (!r.ok) throw new Error(`App Storage upload failed: ${JSON.stringify(r.error)}`); return; }
  const file = objectPath(name); await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, contents);
}
export async function downloadAppStorageObject(name: string): Promise<Buffer | null> {
  assertKey(name);
  const client = await getClient();
  if (client) {
    const r = await client.downloadAsBytes(name);
    if (!r.ok) { const reason = JSON.stringify(r.error); if (/404|not.?found|does not exist/i.test(reason)) return null; throw new Error(`App Storage read failed: ${reason}`); }
    const value: unknown = r.value;
    if (Buffer.isBuffer(value)) return value;
    if (Array.isArray(value) && typeof value[0] !== 'number') return Buffer.from(value[0] as Uint8Array);
    return Buffer.from(value as Uint8Array);
  }
  try { return await fs.readFile(objectPath(name)); } catch (e: any) { if(e.code==='ENOENT') return null; throw e; }
}
export async function deleteAppStorageObject(name: string) {
  assertKey(name);
  const client = await getClient();
  if (client) { const r=await client.delete(name,{ignoreNotFound:true});if(!r.ok)throw new Error(`App Storage delete failed: ${JSON.stringify(r.error)}`);return; }
  try { await fs.unlink(objectPath(name)); } catch(e:any) { if(e.code!=='ENOENT')throw e; }
}
export function appStorageObjectKeyFromPath(mediaPath: string) {
  const name=mediaPath.startsWith('/media/')?mediaPath.slice(7):'';
  return isPublicMediaKey(name)?name:null;
}
export async function verifyAppStorage() {
  if (!storageBucketId()) throw new Error('Configure REPLIT_APP_STORAGE_BUCKET_ID en Replit.');
  const contents=Buffer.from('Santos & Saucedo App Storage check');
  const key=`public/media/check-${createHash('sha256').update(String(Date.now())).digest('hex').slice(0,12)}.txt`;
  await uploadAppStorageObject(key,contents);
  try { const received=await downloadAppStorageObject(key);if(!received?.equals(contents))throw new Error('La lectura de verificación no coincide.'); }
  finally { await deleteAppStorageObject(key); }
  return { connected:true };
}

export async function uploadAppStorageFile(name: string, source: string) {
  assertKey(name);
  const client=await getClient();
  if(client){const r=await client.uploadFromFilename(name,source,{compress:false});if(!r.ok)throw new Error('App Storage no pudo guardar el archivo.');return;}
  const target=objectPath(name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);
}
