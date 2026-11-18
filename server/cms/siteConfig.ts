import { ensureAgentSchema } from "./agentSchema";
import { ensureTestimonialSchema } from "./testimonialSchema";
import type { Express } from 'express';
import { getBundledMediaMap, mapBundledMedia } from './bundledMediaMap';
import { createHash } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db, editorialDb } from '../db';
import { siteConfig, translationCache } from '@shared/schema';
import { cmsDefaults, cmsSections, isCmsSection, mergeCms, validateCmsValue, type CmsSection, type CmsValue } from '@shared/cms';
import { authMiddleware, requireRole } from '../auth';
import { importBundledMedia, savedMediaImportStatus } from './mediaImport';
import { storageBucketId, verifyAppStorage } from '../replitStorage';
import { SUPPORTED_LANGUAGES } from '@shared/constants';
import { readStaticCmsSection } from '../localization/staticSnapshots';
import { getCmsSectionSource } from './cmsTranslationAgent';
import { reviewTranslation } from '../services/translationQa';

const prefix = 'editorial.';
type Stored = { content: CmsValue; draft?: CmsValue; previous?: CmsValue };
const revision = (raw: string | null | undefined) => raw ? createHash('sha256').update(raw).digest('hex') : 'initial';
function enqueueCmsTranslation(section: CmsSection) {
  void Promise.all([import('../agents'), import('./cmsTranslationAgent')]).then(async ([{ orchestrator }, { getCmsSectionSource }]) => {
    const source = await getCmsSectionSource(section);
    if (!source) return;
    await orchestrator.enqueueJob('polyglot_translator', {
      cmsSection: section,
      sourceHash: source.sourceHash,
      targetLanguages: SUPPORTED_LANGUAGES.map(({ code }) => code).filter((code) => code !== 'es'),
      applyChanges: true,
    }, { priority: 'normal' });
  }).catch((error) => console.warn('[CMS] Translation job enqueue failed', error instanceof Error ? error.message : 'unknown error'));
}
function enqueueCmsQualityAudit() {
  void import('../agents').then(async ({ orchestrator }) => {
    await orchestrator.enqueueJob('website_auditor', {
      runType: 'quality_only',
      applyChanges: false,
      triggeredBy: 'cms_save',
    }, { priority: 'low', maxRetries: 1 });
  }).catch((error) => console.warn('[CMS] Quality audit enqueue failed', error instanceof Error ? error.message : 'unknown error'));
}
function enqueueCmsSecurityAudit(section: CmsSection) {
  void import('../agents').then(async ({ orchestrator }) => {
    await orchestrator.enqueueJob('editorial_security_auditor', {
      cmsSection: section,
      sourceType: 'cms_save',
    }, { priority: 'low', maxRetries: 1 });
  }).catch((error) => console.warn('[CMS] Security audit enqueue failed', error instanceof Error ? error.message : 'unknown error'));
}
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function flattenCms(value: CmsValue, path: string[] = [], out: { path: string[]; value: string }[] = []) {
  if (typeof value === 'string' && value.trim()) out.push({ path, value });
  else if (Array.isArray(value)) value.forEach((item, index) => flattenCms(item, [...path, String(index)], out));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => flattenCms(item, [...path, key], out));
  return out;
}
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
  await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_passkeys (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    credential_id text NOT NULL UNIQUE,
    public_key text NOT NULL,
    counter integer NOT NULL DEFAULT 0,
    transports jsonb NOT NULL DEFAULT '[]'::jsonb,
    name text NOT NULL DEFAULT 'Llave de acceso',
    created_at timestamp NOT NULL DEFAULT now(),
    last_used_at timestamp
  )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS admin_passkeys_user_idx ON admin_passkeys (user_id)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_passkey_challenges (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar REFERENCES admin_users(id) ON DELETE CASCADE,
    kind text NOT NULL,
    challenge text NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS admin_passkey_challenges_expiry_idx ON admin_passkey_challenges (expires_at)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS site_config (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL UNIQUE,
    value text, value_es text, type text NOT NULL DEFAULT 'text',
    category text DEFAULT 'general', description text, updated_at timestamp DEFAULT now()
  )`);
  await editorialDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(14703263)`);
    const marker = await tx.execute(sql`SELECT key FROM site_config WHERE key = 'security.migration.admin_session_token_hash_v1' LIMIT 1`);
    if (marker.rows.length) return;
    const sessions = await tx.execute(sql`SELECT id, token FROM admin_sessions`);
    for (const row of sessions.rows as { id: string; token: string }[]) {
      await tx.execute(sql`UPDATE admin_sessions SET token = ${createHash('sha256').update(row.token, 'utf8').digest('hex')} WHERE id = ${row.id}`);
    }
    await tx.execute(sql`
      INSERT INTO site_config (key, value, type, category, updated_at)
      VALUES ('security.migration.admin_session_token_hash_v1', 'applied', 'text', 'security', now())
      ON CONFLICT (key) DO NOTHING
    `);
  });
  // New installations start with the two editorial languages. Additional
  // languages remain opt-in from the translation settings panel.
  const defaultLanguages = 'es,en';
  const [languageRow] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, 'active_languages')).limit(1);
  const currentLanguages = (languageRow?.value || '').split(',').map((code) => code.trim()).filter(Boolean);
  if (!languageRow || currentLanguages.length === 0) {
    await db.insert(siteConfig).values({ key: 'active_languages', value: defaultLanguages, type: 'text', category: 'localization', updatedAt: new Date() }).onConflictDoUpdate({ target: siteConfig.key, set: { value: defaultLanguages, type: 'text', category: 'localization', updatedAt: new Date() } });
  }
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_public boolean`);
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS show_on_home boolean`);
  await db.execute(sql`ALTER TABLE practice_groups ADD COLUMN IF NOT EXISTS team_member_ids jsonb`);
  await db.execute(sql`ALTER TABLE practice_groups ADD COLUMN IF NOT EXISTS published boolean DEFAULT true`);
  await db.execute(sql`ALTER TABLE media_items ADD COLUMN IF NOT EXISTS archived_at timestamp`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS email_signatures (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(), label text NOT NULL, template_id varchar(2) NOT NULL,
    data jsonb NOT NULL, photo_url text, html_object_key text NOT NULL, created_by varchar, updated_by varchar,
    created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now()
  )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS email_signatures_updated_idx ON email_signatures (updated_at DESC)`);
  await editorialDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(14703262)`);
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS generated_documents (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, source_text text NOT NULL,
      rich_content jsonb, instructions text, mode text NOT NULL DEFAULT 'organize', template text, language text NOT NULL DEFAULT 'es',
      docx_url text, pdf_url text, version integer NOT NULL DEFAULT 1, parent_id varchar,
      status text NOT NULL DEFAULT 'active', archived_at timestamp, created_by varchar,
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await tx.execute(sql`ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS template text`);
    await tx.execute(sql`ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS rich_content jsonb`);
    await tx.execute(sql`CREATE INDEX IF NOT EXISTS generated_documents_status_created_idx ON generated_documents (status, created_at DESC)`);
    await tx.execute(sql`CREATE INDEX IF NOT EXISTS generated_documents_parent_idx ON generated_documents (parent_id)`);
    await tx.execute(sql`ALTER TABLE generated_presentations ADD COLUMN IF NOT EXISTS include_intro_slide boolean NOT NULL DEFAULT true`);
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS social_assets (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL DEFAULT 'post',
      title text NOT NULL, topic text NOT NULL, language text NOT NULL DEFAULT 'es',
      format text NOT NULL DEFAULT 'square', slide_count integer NOT NULL DEFAULT 1,
      brand text NOT NULL DEFAULT 'santos-saucedo', palette text NOT NULL DEFAULT 'navy-lime',
      status text NOT NULL DEFAULT 'draft', render_status text NOT NULL DEFAULT 'ready',
      payload jsonb NOT NULL, versions jsonb DEFAULT '[]'::jsonb,
      preview_url text, package_url text, created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now(), archived_at timestamp
    )`);
    await tx.execute(sql`CREATE INDEX IF NOT EXISTS social_assets_status_created_idx ON social_assets (status, created_at DESC)`);
    await tx.execute(sql`CREATE INDEX IF NOT EXISTS social_assets_kind_idx ON social_assets (kind)`);
  });
  await db.execute(sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS document_url text, ADD COLUMN IF NOT EXISTS document_url_es text, ADD COLUMN IF NOT EXISTS source_url text, ADD COLUMN IF NOT EXISTS tags jsonb, ADD COLUMN IF NOT EXISTS featured_home boolean DEFAULT false, ADD COLUMN IF NOT EXISTS ai_classification jsonb`);
  await db.execute(sql`ALTER TABLE news_translations ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true`);
  await ensureTestimonialSchema();
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
  app.get('/api/localized-content/:section/:language', async (req, res) => {
    const { section, language } = req.params;
    if (!isCmsSection(section) || !SUPPORTED_LANGUAGES.some((item) => item.code === language)) {
      return res.status(400).json({ error: 'Sección o idioma inválido.' });
    }
    try {
      const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, `localized.${section}.${language}`));
      const stored = row?.value ? JSON.parse(row.value) : null;
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      if (stored?.status === 'published' && stored.content !== undefined) {
        return res.json(stored.content);
      }
      return res.json(await readStaticCmsSection(section, language) ?? {});
    } catch (error) {
      console.error('[CMS] Localized content read failed', error);
      return res.status(503).json({ error: 'No se pudo cargar el contenido localizado.' });
    }
  });
  app.get('/api/admin/site-config', authMiddleware, requireRole('editor', 'admin'), (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ sections: cmsSections });
  });
  app.get('/api/admin/content/search', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 160) : '';
    if (query.length < 2) return res.json({ query, results: [] });
    const needle = normalizeSearch(query);
    try {
      const rows = await db.select().from(siteConfig);
      const saved = new Map(rows.filter((row) => row.key.startsWith(prefix)).map((row) => [row.key.slice(prefix.length), decode(row.value)?.content]));
      const results: { section: CmsSection; label: string; path: string; publicPath: string; field: string; value: string; language?: string }[] = [];
      for (const section of cmsSections) {
        const content = mergeCms(cmsDefaults[section.key], saved.get(section.key));
        for (const match of flattenCms(content)) {
          const haystack = normalizeSearch(`${section.label} ${section.help} ${match.path.join(' ')} ${match.value}`);
          if (!haystack.includes(needle)) continue;
          const language = SUPPORTED_LANGUAGES.some((item) => item.code === match.path[0]) ? match.path[0] : undefined;
          results.push({
            section: section.key,
            label: section.label,
            path: match.path.join('.'),
            publicPath: section.path,
            field: match.path.at(-1) ?? section.label,
            value: match.value,
            language,
          });
          if (results.length >= 80) break;
        }
        if (results.length >= 80) break;
      }
      res.setHeader('Cache-Control', 'no-store');
      res.json({ query, results });
    } catch (error) {
      console.error('[CMS] Search failed', error);
      res.status(503).json({ error: 'No se pudo buscar el contenido.' });
    }
  });
  app.get('/api/admin/cms-translations/:section/:language', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const { section, language } = req.params;
    if (!isCmsSection(section) || !SUPPORTED_LANGUAGES.some((item) => item.code === language)) return res.status(400).json({ error: 'Sección o idioma inválido.' });
    const [row] = await db.select().from(translationCache).where(and(eq(translationCache.contentType, 'site_content'), eq(translationCache.entityId, section), eq(translationCache.targetLanguage, language))).orderBy(sql`${translationCache.updatedAt} DESC`).limit(1);
    const sourceHash = typeof row?.sourceText === 'string' && row.sourceText.startsWith('sha256:') ? row.sourceText.slice(7) : null;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ section, language, status: row?.isApproved ? 'published' : row ? 'pending' : 'missing', sourceHash, content: row?.translations ?? null });
  });
  app.post('/api/admin/cms-translations/:section/:language/approve', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const { section, language } = req.params;
    if (!isCmsSection(section) || !SUPPORTED_LANGUAGES.some((item) => item.code === language) || language === 'es') return res.status(400).json({ error: 'Sección o idioma inválido.' });
    const [row] = await db.select().from(translationCache).where(and(eq(translationCache.contentType, 'site_content'), eq(translationCache.entityId, section), eq(translationCache.targetLanguage, language))).orderBy(sql`${translationCache.updatedAt} DESC`).limit(1);
    if (!row?.translations || typeof row.translations !== 'object' || Array.isArray(row.translations)) return res.status(404).json({ error: 'No existe una propuesta para aprobar.' });
    const content = row.translations as CmsValue;
    const sourceHash = typeof row.sourceText === 'string' && row.sourceText.startsWith('sha256:') ? row.sourceText.slice(7) : null;
    const source = await getCmsSectionSource(section);
    if (!source || source.sourceHash !== sourceHash) return res.status(409).json({ error: 'La propuesta quedó obsoleta. Genere una traducción nueva.' });
    const qa = reviewTranslation(source.source, content, language);
    if (qa.status === 'blocked') return res.status(422).json({ error: 'La propuesta no pasó la revisión automática.', findings: qa.findings });
    const key = `localized.${section}.${language}`;
    const value = JSON.stringify({ status: 'published', translationStatus: 'published', version: 1, sourceLanguage: row.sourceLanguage || 'es', targetLanguage: language, sourceHash, content, approvedAt: new Date().toISOString(), approvedBy: req.adminUser!.id });
    await db.update(translationCache).set({ isApproved: true, updatedAt: new Date() }).where(eq(translationCache.id, row.id));
    await db.insert(siteConfig).values({ key, value, type: 'json', category: 'localization', updatedAt: new Date() }).onConflictDoUpdate({ target: siteConfig.key, set: { value, type: 'json', category: 'localization', updatedAt: new Date() } });
    res.json({ approved: true, section, language, sourceHash });
  });
  app.get('/api/admin/site-config/:section', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const section = req.params.section;
    if (!isCmsSection(section)) return res.status(404).json({ error: 'Sección desconocida.' });
    try {
      const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, prefix + section));
      const saved = decode(row?.value);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ section, content: mergeCms(cmsDefaults[section], saved?.draft ?? saved?.content), revision: revision(row?.value), previous: saved?.previous ?? null, published: mergeCms(cmsDefaults[section], saved?.content) });
    } catch (error) {
      console.error('[CMS] Section read failed', error);
      res.status(503).json({ error: 'No se pudo abrir la sección.' });
    }
  });
  app.put('/api/admin/site-config-bundle', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const items = Array.isArray(req.body?.sections) ? req.body.sections : [];
    if (!items.length || items.length > 20) return res.status(400).json({ error: 'El paquete de página no contiene secciones válidas.' });
    const seen = new Set<string>();
    const parsed: { section: CmsSection; content: CmsValue; revision: string }[] = [];
    for (const raw of items as unknown[]) {
      const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const section = String(item.section || '');
      const content = item.content as CmsValue;
      const revisionValue = String(item.revision || '');
      if (!isCmsSection(section) || seen.has(section) || !revisionValue || !Object.prototype.hasOwnProperty.call(item, 'content')) {
        return res.status(400).json({ error: 'El paquete de página contiene una sección inválida.' });
      }
      seen.add(section);
      parsed.push({ section, content, revision: revisionValue });
    }
    for (const item of parsed) {
      const errors = validateCmsValue(item.section, item.content);
      if (errors.length) return res.status(400).json({ error: `Revise ${item.section}.`, details: errors });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const current = new Map<string, { value: string | null }>();
        for (const item of parsed) {
          const [row] = await tx.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, prefix + item.section));
          if (item.revision !== revision(row?.value)) throw Object.assign(new Error('REVISION_CONFLICT'), { section: item.section });
          current.set(item.section, { value: row?.value ?? null });
        }
        const saved: Record<string, { content: CmsValue; revision: string; previous: CmsValue | null }> = {};
        for (const item of parsed) {
          const old = current.get(item.section)!;
          const stored = decode(old?.value);
          const published = mergeCms(cmsDefaults[item.section], stored?.content);
          const previous = stored?.previous ?? published;
          const raw = JSON.stringify({ content: published, draft: item.content, previous });
          const metadata = { value: raw, category: 'editorial', type: 'json', updatedAt: new Date() };
          if (old?.value === null) {
            const inserted = await tx.insert(siteConfig).values({ key: prefix + item.section, ...metadata }).onConflictDoNothing().returning();
            if (!inserted.length) throw Object.assign(new Error('REVISION_CONFLICT'), { section: item.section });
          } else {
            const updated = await tx.update(siteConfig).set(metadata).where(and(eq(siteConfig.key, prefix + item.section), eq(siteConfig.value, old.value))).returning();
            if (!updated.length) throw Object.assign(new Error('REVISION_CONFLICT'), { section: item.section });
          }
          saved[item.section] = { content: item.content, revision: revision(raw), previous };
        }
        return saved;
      });
      console.log('[CMS]', JSON.stringify({ action: 'update-bundle', sections: parsed.map((item) => item.section), userId: req.adminUser!.id, at: new Date().toISOString() }));
      for (const section of Object.keys(result)) {
        enqueueCmsTranslation(section as CmsSection);
        enqueueCmsSecurityAudit(section as CmsSection);
      }
      enqueueCmsQualityAudit();
      res.json({ sections: result });
    } catch (error: any) {
      if (error?.message === 'REVISION_CONFLICT') return res.status(409).json({ error: `La sección ${error.section || 'editada'} cambió mientras se guardaba. Recargue antes de publicar.` });
      console.error('[CMS] Bundle save failed', error);
      res.status(500).json({ error: 'No se pudo guardar el paquete. Su borrador se conserva.' });
    }
  });
  app.post('/api/admin/site-config-bundle/publish', authMiddleware, requireRole('editor', 'admin'), async (req, res) => {
    const items = Array.isArray(req.body?.sections) ? req.body.sections : [];
    if (!items.length || items.length > 20) return res.status(400).json({ error: 'El paquete de publicación no contiene secciones válidas.' });
    const parsed: { section: CmsSection; revision: string }[] = [];
    const seen = new Set<string>();
    for (const raw of items as unknown[]) {
      const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const section = String(item.section || '');
      if (!isCmsSection(section) || seen.has(section) || !item.revision) return res.status(400).json({ error: 'El paquete de publicación contiene una sección inválida.' });
      seen.add(section);
      parsed.push({ section, revision: String(item.revision) });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const current = new Map<string, { value: string | null }>();
        for (const item of parsed) {
          const [row] = await tx.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, prefix + item.section));
          if (item.revision !== revision(row?.value)) throw Object.assign(new Error('REVISION_CONFLICT'), { section: item.section });
          current.set(item.section, { value: row?.value ?? null });
        }
        const published: Record<string, { content: CmsValue; revision: string; previous: CmsValue | null }> = {};
        for (const item of parsed) {
          const old = current.get(item.section)!;
          const stored = decode(old.value);
          const draft = stored?.draft;
          if (draft === undefined) continue;
          const previous = stored?.previous ?? mergeCms(cmsDefaults[item.section], stored?.content);
          const raw = JSON.stringify({ content: draft, previous });
          const metadata = { value: raw, category: 'editorial', type: 'json', updatedAt: new Date() };
          const updated = old.value === null
            ? await tx.insert(siteConfig).values({ key: prefix + item.section, ...metadata }).onConflictDoNothing().returning()
            : await tx.update(siteConfig).set(metadata).where(and(eq(siteConfig.key, prefix + item.section), eq(siteConfig.value, old.value))).returning();
          if (!updated.length) throw Object.assign(new Error('REVISION_CONFLICT'), { section: item.section });
          published[item.section] = { content: draft, revision: revision(raw), previous };
        }
        return published;
      });
      console.log('[CMS]', JSON.stringify({ action: 'publish-bundle', sections: parsed.map((item) => item.section), userId: req.adminUser!.id, at: new Date().toISOString() }));
      res.json({ sections: result });
    } catch (error: any) {
      if (error?.message === 'REVISION_CONFLICT') return res.status(409).json({ error: `La sección ${error.section || 'editada'} cambió mientras se publicaba. Recargue antes de continuar.` });
      console.error('[CMS] Bundle publish failed', error);
      res.status(500).json({ error: 'No se pudo publicar el paquete. El borrador se conserva.' });
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
      enqueueCmsTranslation(section as CmsSection);
      enqueueCmsQualityAudit();
      enqueueCmsSecurityAudit(section as CmsSection);
      res.json({ section, content: req.body.content, revision: revision(raw), previous });
    } catch (error) {
      console.error('[CMS] Save failed', error);
      res.status(500).json({ error: 'No se pudo guardar. Su borrador se conserva.' });
    }
  });
}
