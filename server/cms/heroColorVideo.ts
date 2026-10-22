import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { siteConfig } from '@shared/schema';
import { cmsDefaults } from '@shared/cms';

// The client asked (2026-10-22) for the home video in natural colour, without the blue
// treatment. The defaults already point to portada-color-*, but a published database may hold
// the old portada-azul-* paths in editorial.media (saved from the panel, or rewritten to
// /media/... by the App Storage import). This one-way step swaps only those values for the new
// defaults and leaves anything else an editor chose untouched. Idempotent.
const fields = ['videoDesktop', 'videoMobile', 'poster'] as const;

export async function switchHeroToColourVideo() {
  const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, 'editorial.media'));
  if (!row?.value) return;
  let stored: any;
  try { stored = JSON.parse(row.value); } catch { return; }
  const hero = stored?.content?.hero;
  if (!hero || typeof hero !== 'object') return;
  const defaults = (cmsDefaults as any).media.hero;
  let changed = false;
  const nextHero = { ...hero };
  for (const field of fields) {
    if (typeof hero[field] === 'string' && hero[field].includes('portada-azul-')) {
      nextHero[field] = defaults[field];
      changed = true;
    }
  }
  if (!changed) return;
  const raw = JSON.stringify({ content: { ...stored.content, hero: nextHero }, previous: stored.content });
  await db.update(siteConfig).set({ value: raw, updatedAt: new Date() })
    .where(and(eq(siteConfig.id, row.id), eq(siteConfig.value, row.value)));
  console.log('[CMS] Video de portada cambiado a la versión a color');
}
