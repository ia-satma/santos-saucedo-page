import { downloadAppStorageObject, isPublicMediaKey, storageBucketId } from '../replitStorage';
import type { CmsValue } from '@shared/cms';
const key='public/media/bundled-manifest.json';
export const bundledManifestKey=key;
let cached: { at:number; paths:Record<string,string> } | undefined;
let pending:Promise<Record<string,string>> | undefined;
export function clearBundledMediaMap(){cached=undefined;}
export async function getBundledMediaMap():Promise<Record<string,string>>{
 if(!storageBucketId())return {};
 if(cached && Date.now()-cached.at<30000)return cached.paths;
 if(pending)return pending;
 pending=(async()=>{
  const file=await downloadAppStorageObject(key);
  const parsed=file?JSON.parse(file.toString('utf8')):{};
  const paths:Record<string,string>={};
  for(const [source,target]of Object.entries(parsed.paths??{}))if(source.startsWith('/')&&!source.includes('..')&&typeof target==='string'&&target.startsWith('/media/')&&isPublicMediaKey(target.slice(7)))paths[source]=target;
  cached={at:Date.now(),paths};return paths;
 })();
 try{return await pending;}finally{pending=undefined;}
}
export function mapBundledMedia(value:CmsValue,paths:Record<string,string>):CmsValue{
 if(typeof value==='string')return paths[value]??value;
 if(Array.isArray(value))return value.map(v=>mapBundledMedia(v,paths));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,mapBundledMedia(v,paths)]));
 return value;
}
