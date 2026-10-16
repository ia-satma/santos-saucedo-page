import { ensureAgentSchema } from "./agentSchema";
import type { Express } from 'express';
import { getBundledMediaMap, mapBundledMedia } from './bundledMediaMap';
import { createHash } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db, editorialDb } from '../db';
import { siteConfig } from '@shared/schema';
import { cmsDefaults, cmsSections, isCmsSection, mergeCms, validateCmsValue, type CmsSection, type CmsValue } from '@shared/cms';
import { authMiddleware, requireRole } from '../auth';
import { importBundledMedia, savedMediaImportStatus } from './mediaImport';
import { storageBucketId, verifyAppStorage } from '../replitStorage';

const prefix = 'editorial.';
type Stored = { content: CmsValue; previous?: CmsValue };
const revision = (raw: string | null | undefined) => raw ? createHash('sha256').update(raw).digest('hex') : 'initial';
function decode(raw: string | null | undefined): Stored | undefined {
  if (!raw) return;
  try { return JSON.parse(raw) as Stored; } catch { return; }
}

// Idempotent compatibility migration. It adds no content and never changes existing rows.
export async function ensureCmsSchema() {
  await ensureAgentSchema();
  await editorialDb.transaction(async tx=>{await tx.execute(sql`SELECT pg_advisory_xact_lock(14703261)`);
  await tx.execute(sql`CREATE TABLE IF NOT EXISTS career_applications (id varchar PRIMARY KEY DEFAULT gen_random_uuid(),full_name text NOT NULL,email text NOT NULL,phone text,interest text,message text,cv_path text NOT NULL,cv_original_name text NOT NULL,preferred_language text DEFAULT 'es',consented_at timestamp DEFAULT now(),submitted_at timestamp DEFAULT now(),read boolean DEFAULT false,status text DEFAULT 'received',archived_at timestamp)`);
  });
  await db.execute(sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb, ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_access_events (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(), user_id varchar, actor_id varchar,
    action text NOT NULL, details jsonb, created_at timestamp DEFAULT now()
  )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS admin_access_events_created_idx ON admin_access_events (created_at DESC)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS site_config (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL UNIQUE,
    value text, value_es text, type text NOT NULL DEFAULT 'text',
    category text DEFAULT 'general', description text, updated_at timestamp DEFAULT now()
  )`);
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_public boolean`);
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS show_on_home boolean`);
  await db.execute(sql`ALTER TABLE practice_groups ADD COLUMN IF NOT EXISTS team_member_ids jsonb`);
  await db.execute(sql`ALTER TABLE practice_groups ADD COLUMN IF NOT EXISTS published boolean DEFAULT true`);
  await db.execute(sql`ALTER TABLE media_items ADD COLUMN IF NOT EXISTS archived_at timestamp`);
  await db.execute(sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS document_url text, ADD COLUMN IF NOT EXISTS document_url_es text, ADD COLUMN IF NOT EXISTS source_url text, ADD COLUMN IF NOT EXISTS tags jsonb, ADD COLUMN IF NOT EXISTS featured_home boolean DEFAULT false`);
}

export async function getCmsOverrides(): Promise<Record<string, CmsValue>> {
  const rows = await db.select().from(siteConfig);
  const result: Record<string, CmsValue> = {};
  for (const row of rows) {
    if (!row.key.startsWith(prefix)) continue;
    const section = row.key.slice(prefix.length);
    if (!isCmsSection(section)) continue;
    const stored = decode(row.value);
    if (stored?.content !== undefined && validateCmsValue(section, mergeCms(cmsDefaults[section], stored.content)).length === 0) {
      result[section] = stored.content;
    }
  }
  const paths=await getBundledMediaMap();
  if(Object.keys(paths).length) result.media=mapBundledMedia(mergeCms(cmsDefaults.media,result.media),paths);
  return result;
}

export async function getCmsVoice() {
 const [row]=await db.select().from(siteConfig).where(eq(siteConfig.key,prefix+'voice'));
 return mergeCms(cmsDefaults.voice,decode(row?.value)?.content) as typeof import('@shared/cms-defaults.json')['voice'];
}

export async function getCmsIntegrations() {
 const [row]=await db.select().from(siteConfig).where(eq(siteConfig.key,prefix+'integrations'));
 return mergeCms(cmsDefaults.integrations,decode(row?.value)?.content) as typeof import('@shared/cms-defaults.json')['integrations'];
}

export async function getCmsFormControls() {
  const [row]=await db.select().from(siteConfig).where(eq(siteConfig.key,prefix+'forms'));
  return mergeCms(cmsDefaults.forms,decode(row?.value)?.content) as typeof import('@shared/cms-defaults.json')['forms'];
}

export async function getCmsContact() {
  const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, prefix + 'contactData'));
  return mergeCms(cmsDefaults.contactData, decode(row?.value)?.content) as typeof import('@shared/cms-defaults.json')['contactData'];
}

export function registerCmsRoutes(app: Express) {
  app.get('/api/admin/storage/status', authMiddleware, requireRole('editor', 'admin'), async (_req,res) => {
    try { res.setHeader('Cache-Control','no-store');res.json({configured:!!storageBucketId(), migration:await savedMediaImportStatus()}); }
    catch { res.status(503).json({error:'No se pudo consultar App Storage.'}); }
  });
  app.post('/api/admin/storage/verify', authMiddleware, requireRole('admin'), async (_req,res) => {
    try { res.json(await verifyAppStorage()); } catch(error) { res.status(503).json({error:(error as Error).message}); }
  });
  app.post('/api/admin/storage/import', authMiddleware, requireRole('admin'), async (_req,res) => {
    if(!storageBucketId())return res.status(503).json({error:'Configure REPLIT_APP_STORAGE_BUCKET_ID.'});
    const status=await savedMediaImportStatus();
    if(status.state==='running')return res.status(409).json({error:'Ya hay una importación en curso.'});
    void importBundledMedia().catch(error=>console.error('[MediaImport]',error.message));
    res.status(202).json({started:true});
  });
  app.get('/api/site-config', async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      res.json(await getCmsOverrides());
    } catch (error) {
      console.error('[CMS] Read failed', error);
      res.status(503).json({ error: 'No se pudo cargar el contenido del sitio.' });
    }
  });
  app.get('/api/admin/site-config', authMiddleware, requireRole('editor', 'admin'), (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ sections: cmsSections });
  });
  app.get('/api/admin/site-config/:section', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const section = req.params.section;
    if (!isCmsSection(section)) return res.status(404).json({ error: 'Sección desconocida.' });
    try {
      const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, prefix + section));
      const saved = decode(row?.value);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ section, content: mergeCms(cmsDefaults[section], saved?.content), revision: revision(row?.value), previous: saved?.previous ?? null });
    } catch (error) {
      console.error('[CMS] Section read failed', error);
      res.status(503).json({ error: 'No se pudo abrir la sección.' });
    }
  });
  app.put('/api/admin/site-config/:section', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const section = req.params.section;
    if (!isCmsSection(section)) return res.status(404).json({ error: 'Sección desconocida.' });
    if (!req.body || typeof req.body.revision !== 'string' || !Object.prototype.hasOwnProperty.call(req.body, 'content')) return res.status(400).json({ error: 'Faltan el contenido y su revisión.' });
    const errors = validateCmsValue(section, req.body.content);
    if (errors.length) return res.status(400).json({ error: 'Revise los campos indicados.', details: errors });
    try {
      const key = prefix + section;
      const [old] = await db.select().from(siteConfig).where(eq(siteConfig.key, key));
      if (req.body.revision !== revision(old?.value)) return res.status(409).json({ error: 'Otra persona cambió esta sección. Recargue antes de guardar; su borrador sigue en pantalla.' });
      const previous = mergeCms(cmsDefaults[section], decode(old?.value)?.content);
      const raw = JSON.stringify({ content: req.body.content, previous });
      const metadata = { value: raw, category: 'editorial', type: 'json', updatedAt: new Date() };
      // Atomic compare-and-set also catches two first saves and simultaneous updates.
      const changed = old
        ? await db.update(siteConfig).set(metadata).where(and(eq(siteConfig.key, key), old.value === null ? sql`${siteConfig.value} IS NULL` : eq(siteConfig.value, old.value))).returning()
        : await db.insert(siteConfig).values({ key, ...metadata }).onConflictDoNothing().returning();
      if (!changed.length) return res.status(409).json({ error: 'La sección cambió mientras se guardaba. Recargue y revise su borrador.' });
      console.log('[CMS]', JSON.stringify({ action: 'update', section, userId: req.adminUser!.id, at: new Date().toISOString() }));
      res.json({ section, content: req.body.content, revision: revision(raw), previous });
    } catch (error) {
      console.error('[CMS] Save failed', error);
      res.status(500).json({ error: 'No se pudo guardar. Su borrador se conserva.' });
    }
  });
}
