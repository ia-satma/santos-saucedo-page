import { and, eq, sql } from "drizzle-orm";
import { db, editorialDb } from "../db";
import { siteConfig } from "@shared/schema";
import { navigationSchema, type SiteNavigation } from "@shared/siteControls";
import defaults from "@shared/cms-defaults.json";

// Testimonios: DDL aditivo e idempotente, igual que ensureCmsSchema (producción en Replit no
// corre db:push al publicar). Coincide con shared/schema.ts para que un db:push posterior no
// vea diferencias. La tabla testimonials ya existía (plantilla sin uso): se le agregan columnas,
// quote_es deja de ser obligatoria y published nace en false. Una fila heredada queda
// "pending": no sale en el sitio hasta que alguien la apruebe.
export async function ensureTestimonialSchema() {
  await editorialDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(14703262)`);
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS testimonials (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(), quote text NOT NULL, quote_es text,
      author_name text NOT NULL, author_title text, author_title_es text, author_company text,
      author_photo_url text, source text, source_es text, year integer, practice_group_id varchar,
      is_featured boolean DEFAULT false, published boolean DEFAULT false, "order" integer DEFAULT 0,
      created_at timestamp DEFAULT now()
    )`);
    await tx.execute(sql`ALTER TABLE testimonials
      ALTER COLUMN quote_es DROP NOT NULL,
      ALTER COLUMN published SET DEFAULT false,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS show_company boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS language text,
      ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'panel',
      ADD COLUMN IF NOT EXISTS invite_id varchar,
      ADD COLUMN IF NOT EXISTS consent_at timestamp,
      ADD COLUMN IF NOT EXISTS approved_by varchar,
      ADD COLUMN IF NOT EXISTS approved_by_name text,
      ADD COLUMN IF NOT EXISTS approved_at timestamp,
      ADD COLUMN IF NOT EXISTS reviewed_by_name text,
      ADD COLUMN IF NOT EXISTS reviewed_at timestamp,
      ADD COLUMN IF NOT EXISTS updated_at timestamp`);
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS testimonial_invites (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash text NOT NULL CONSTRAINT testimonial_invites_token_hash_unique UNIQUE,
      client_name text, client_email text, created_by varchar, created_by_name text,
      created_at timestamp NOT NULL DEFAULT now(), expires_at timestamp NOT NULL,
      used_at timestamp, revoked_at timestamp, testimonial_id varchar
    )`);
  });
}

// "Testimonios" en el menú y en el pie de una base que ya guardó la navegación desde el panel
// (los valores por defecto ya la traen). Se agrega una sola vez, tras "Socios", sin tocar nada
// más; la marca en site_config evita volver a agregarla si alguien la quita después.
const MARK = "migration.navigation-testimonials";

export async function addTestimonialsToNavigation() {
  const [mark] = await db.select({ id: siteConfig.id }).from(siteConfig).where(eq(siteConfig.key, MARK));
  if (mark) return;
  const done = () =>
    db.insert(siteConfig).values({ key: MARK, value: new Date().toISOString(), category: "migration", type: "text" }).onConflictDoNothing();
  const [row] = await db.select().from(siteConfig).where(eq(siteConfig.key, "editorial.navigation"));
  let stored: { content?: SiteNavigation; previous?: unknown } | undefined;
  try {
    stored = row?.value ? JSON.parse(row.value) : undefined;
  } catch {
    stored = undefined;
  }
  if (!row || !stored?.content) return void (await done());
  const nav = stored.content;
  const base = defaults.navigation;
  const header = base.items.find((i) => i.id === "testimonials")!;
  const footer = base.footerItems.find((i) => i.id === "testimonials")!;
  const has = (items: { id: string; href: string }[]) =>
    items.some((i) => i.id === "testimonials" || i.href.split("?")[0] === "/testimonios");
  // Tras "Socios", con su mismo número de orden: el orden es estable y queda justo después
  const insertAfterTeam = <T extends { id: string; href: string; order: number }>(items: T[], entry: T): T[] => {
    if (has(items)) return items;
    const at = items.findIndex((i) => i.id === "team" || i.href === "/team");
    const order = at >= 0 ? items[at].order : Math.min(1000, Math.max(-1, ...items.map((i) => i.order)) + 1);
    const next = [...items];
    next.splice(at >= 0 ? at + 1 : next.length, 0, { ...entry, order });
    return next;
  };
  const content: SiteNavigation = {
    ...nav,
    items: insertAfterTeam(nav.items ?? [], { ...header, children: [] }),
    footerItems: insertAfterTeam(nav.footerItems ?? [], { ...footer }),
  };
  if (nav.items?.length >= 20 || nav.footerItems?.length >= 30 || !navigationSchema.safeParse(content).success) {
    console.warn("[CMS] No se agregó Testimonios al menú guardado: agréguelo desde Navegación");
    return void (await done());
  }
  const raw = JSON.stringify({ content, previous: nav });
  const changed = await db
    .update(siteConfig)
    .set({ value: raw, updatedAt: new Date() })
    .where(and(eq(siteConfig.id, row.id), eq(siteConfig.value, row.value!)))
    .returning({ id: siteConfig.id });
  // Si alguien guardó al mismo tiempo, se reintenta en el próximo arranque
  if (!changed.length) return;
  await done();
  console.log("[CMS] Testimonios agregado al menú y al pie guardados");
}
