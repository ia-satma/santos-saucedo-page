import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index, uniqueIndex, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Canonical team member categories - source of truth for role taxonomy
// DO NOT duplicate or modify these categories elsewhere
export const TEAM_MEMBER_CATEGORIES = [
  { value: "partner", en: "Partner", es: "Socio" },
  { value: "of-counsel", en: "Of Counsel", es: "Of Counsel" },
  { value: "associate", en: "Associate", es: "Asociado" },
] as const;

export type TeamMemberCategory = typeof TEAM_MEMBER_CATEGORIES[number]["value"];

// Types for team member structured data
export interface Education {
  school: string;
  schoolEs?: string;
  degree: string;
  degreeEs?: string;
  year?: string;
}

export interface BarAdmission {
  jurisdiction: string;
  jurisdictionEs?: string;
  year?: string;
}

export interface Ranking {
  publication: string;
  ranking: string;
  rankingEs?: string;
  year?: string;
  area?: string;
  areaEs?: string;
}

export interface Publication {
  title: string;
  titleEs?: string;
  journal?: string;
  year?: string;
  url?: string;
}

export interface RepresentativeMatter {
  description: string;
  descriptionEs?: string;
  client?: string;
  year?: string;
}

export interface Affiliation {
  organization: string;
  organizationEs?: string;
  role?: string;
  roleEs?: string;
}

export interface Experience {
  company: string;
  position: string;
  positionEs?: string;
  startYear?: string;
  endYear?: string;
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  excerpt: text("excerpt").notNull(),
  excerptEs: text("excerpt_es").notNull(),
  content: text("content"),
  contentEs: text("content_es"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  date: timestamp("date").defaultNow(),
  documentUrl: text("document_url"),
  documentUrlEs: text("document_url_es"),
  sourceUrl: text("source_url"),
  // Medio citado en una nota breve con fuente ("El Economista"); se muestra al pie como "Fuente: …"
  sourceName: text("source_name"),
  tags: jsonb("tags").$type<string[]>(),
  featuredHome: boolean("featured_home").default(false),
  // Nada se publica solo: una nota nueva nace en borrador salvo que una persona la publique
  published: boolean("published").default(false),
  category: text("category").default("press"),
  categoryEs: text("category_es").default("Prensa"),
  authorId: varchar("author_id"),
  // Processing status tracking
  processingStatus: text("processing_status").default("pending"), // pending, processing, ready, ready_for_approval, failed, partial_success
  lastError: text("last_error"), // Stores the last error message/code for diagnostics
  lastProcessedAt: timestamp("last_processed_at"),
  failedStep: text("failed_step"), // Which step failed: format, categorize, metadata, seo, translate, image, council
  // Content scheduling: articles with a future publishAt are hidden from public routes
  publishAt: timestamp("publish_at"),
  // Legal Council AI evaluation
  councilVerdict: jsonb("council_verdict"), // Stores CouncilVerdict: { overallStatus, riskFlag, consolidatedFeedback }

discoveryVisibility: text("discovery_visibility").notNull().default("listed"),
legacyId: text("legacy_id"),
});

export const newsCategories = [
  { value: "press", en: "Press", es: "Prensa" },
  { value: "insights", en: "Insights", es: "Insights" },
  { value: "rankings", en: "Rankings", es: "Rankings" },
  { value: "events", en: "Events", es: "Eventos" },
  { value: "alerts", en: "Alerts", es: "Alertas" },
] as const;

export const insertNewsSchema = createInsertSchema(news, { tags:z.array(z.string()).nullable().optional() }).omit({ id: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export const newsTranslations = pgTable("news_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  newsId: varchar("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 5 }).notNull(), // en, es, de, zh, ko, ja, ar, ru, fr, it
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content"),
  category: text("category"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  translatedAt: timestamp("translated_at").defaultNow(),
  translatedBy: varchar("translated_by").default("ai"), // "ai" or "manual"
});

export const insertNewsTranslationSchema = createInsertSchema(newsTranslations).omit({ id: true, translatedAt: true });
export type InsertNewsTranslation = z.infer<typeof insertNewsTranslationSchema>;
export type NewsTranslation = typeof newsTranslations.$inferSelect;

export const officeImages = pgTable("office_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull(),
  altEs: text("alt_es").notNull(),
  order: integer("order").default(0),
});

export const insertOfficeImageSchema = createInsertSchema(officeImages).omit({ id: true });
export type InsertOfficeImage = z.infer<typeof insertOfficeImageSchema>;
export type OfficeImage = typeof officeImages.$inferSelect;

export const practiceGroups = pgTable("practice_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  fullDescription: text("full_description"),
  fullDescriptionEs: text("full_description_es"),
  published: boolean("published").default(true),
  teamMemberIds: jsonb("team_member_ids").$type<string[]>(),
  iconName: text("icon_name"),
  imageUrl: text("image_url"),
  order: integer("order").default(0),

slugEs: text("slug_es").unique(),
});

export const insertPracticeGroupSchema = createInsertSchema(practiceGroups, {teamMemberIds:z.array(z.string()).nullable().optional()}).omit({ id: true });
export type InsertPracticeGroup = z.infer<typeof insertPracticeGroupSchema>;
export type PracticeGroup = typeof practiceGroups.$inferSelect;

export const industryGroups = pgTable("industry_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  fullDescription: text("full_description"),
  fullDescriptionEs: text("full_description_es"),
  iconName: text("icon_name"),
  imageUrl: text("image_url"),
  order: integer("order").default(0),

slugEs: text("slug_es").unique(),
published: boolean("published").default(true),
});

export const insertIndustryGroupSchema = createInsertSchema(industryGroups).omit({ id: true });
export type InsertIndustryGroup = z.infer<typeof insertIndustryGroupSchema>;
export type IndustryGroup = typeof industryGroups.$inferSelect;

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  role: text("role").notNull(),
  roleEs: text("role_es").notNull(),
  bio: text("bio"),
  bioEs: text("bio_es"),
  email: text("email"),
  phone: text("phone"),
  imageUrl: text("image_url"),
  linkedinUrl: text("linkedin_url"),
  isPartner: boolean("is_partner").default(false),
  isPublic: boolean("is_public"),
  showOnHome: boolean("show_on_home"),
  order: integer("order").default(0),
  // Extended profile fields
  education: jsonb("education").$type<Education[]>(),
  barAdmissions: jsonb("bar_admissions").$type<BarAdmission[]>(),
  languages: jsonb("languages").$type<string[]>(),
  affiliations: jsonb("affiliations").$type<Affiliation[]>(),
  rankings: jsonb("rankings").$type<Ranking[]>(),
  publications: jsonb("publications").$type<Publication[]>(),
  representativeMatters: jsonb("representative_matters").$type<RepresentativeMatter[]>(),
  experience: jsonb("experience").$type<Experience[]>(),

givenNames: text("given_names"),
firstSurname: text("first_surname"),
secondSurname: text("second_surname"),
bioIntro: text("bio_intro"),
bioIntroEs: text("bio_intro_es"),
biographyDisplayMode: text("biography_display_mode")
    .$type<BiographyDisplayMode>()
    .notNull()
    .default("expanded"),
partnerSinceYear: integer("partner_since_year"),
showPartnerSince: boolean("show_partner_since").notNull().default(true),
published: boolean("published").default(true),
languagesEs: jsonb("languages_es").$type<string[]>(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers, {biographyDisplayMode:z.enum(["auto","expanded","collapsed"]).optional(),
education:z.array(z.object({school:z.string(),schoolEs:z.string().optional(),degree:z.string(),degreeEs:z.string().optional(),year:z.string().optional()})).nullable().optional(),
barAdmissions:z.array(z.object({jurisdiction:z.string(),jurisdictionEs:z.string().optional(),year:z.string().optional()})).nullable().optional(),
languages:z.array(z.string()).nullable().optional(),
languagesEs:z.array(z.string()).nullable().optional(),
affiliations:z.array(z.object({organization:z.string(),organizationEs:z.string().optional(),role:z.string().optional(),roleEs:z.string().optional()})).nullable().optional(),
rankings:z.array(z.object({publication:z.string(),ranking:z.string(),rankingEs:z.string().optional(),year:z.string().optional(),area:z.string().optional(),areaEs:z.string().optional()})).nullable().optional(),
publications:z.array(z.object({title:z.string(),titleEs:z.string().optional(),journal:z.string().optional(),year:z.string().optional(),url:z.string().optional()})).nullable().optional(),
representativeMatters:z.array(z.object({description:z.string(),descriptionEs:z.string().optional(),client:z.string().optional(),year:z.string().optional()})).nullable().optional(),
experience:z.array(z.object({company:z.string(),position:z.string(),positionEs:z.string().optional(),startYear:z.string().optional(),endYear:z.string().optional()})).nullable().optional()
}).omit({ id: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const teamMemberPracticeGroups = pgTable("team_member_practice_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull(),
  practiceGroupId: varchar("practice_group_id").notNull(),
});

export const teamMemberIndustryGroups = pgTable("team_member_industry_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull(),
  industryGroupId: varchar("industry_group_id").notNull(),
});

export const newsTeamMembers = pgTable("news_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  newsId: varchar("news_id").notNull(),
  teamMemberId: varchar("team_member_id").notNull(),

verificationStatus: text("verification_status").$type<AuthorVerificationStatus>().notNull().default("legacy_unverified"),
relationshipRole: text("relationship_role").$type<NewsTeamMemberRelationshipRole>().notNull().default("related"),
});

export const insertNewsTeamMemberSchema = createInsertSchema(newsTeamMembers).omit({ id: true });
export type InsertNewsTeamMember = z.infer<typeof insertNewsTeamMemberSchema>;
export type NewsTeamMember = typeof newsTeamMembers.$inferSelect;

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  visionTitle: string;
  visionText: string;
  locationTitle: string;
  locationText: string;
  statsTitle: string;
  quoteText: string;
  quoteAuthor: string;
  quoteRole: string;
  address: string;
  phone: string;
  email: string;
}

export interface Stat {
  value: string;
  label: string;
  labelEs: string;
}

export interface MenuItem {
  label: string;
  labelEs: string;
  href: string;
}

// Representative Matters table for Experience page
export const representativeMatters = pgTable("representative_matters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  client: text("client"),
  clientEs: text("client_es"),
  year: integer("year").notNull(),
  practiceAreaSlug: text("practice_area_slug").notNull(),
  industrySlug: text("industry_slug"),
  isHighlight: boolean("is_highlight").default(false),
  order: integer("order").default(0),
});

export const insertRepresentativeMatterSchema = createInsertSchema(representativeMatters).omit({ id: true });
export type InsertRepresentativeMatter = z.infer<typeof insertRepresentativeMatterSchema>;
export type RepresentativeMatterDb = typeof representativeMatters.$inferSelect;

// Contact form schema
export const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().max(254).min(1, "Email is required").email("Invalid email address"),
  phone: z.string().trim().max(60).optional(),
  company: z.string().trim().max(250).optional(),
  practiceArea: z.string().trim().max(180).optional(),
  message: z.string().trim().min(1, "Message is required").max(12000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  practiceArea: text("practice_area"),
  message: text("message").notNull(),
  ipAddress: text("ip_address"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, submittedAt: true, read: true });
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Practice areas list for contact form
export const practiceAreas = [
  { value: "corporate-ma", en: "Corporate, Mergers & Acquisitions", es: "Corporativo, fusiones y adquisiciones" },
  { value: "antitrust-competition", en: "Antitrust & Competition", es: "Competencia económica" },
  { value: "arbitration", en: "Arbitration", es: "Arbitraje" },
  { value: "litigation", en: "Litigation", es: "Litigio" },
  { value: "investigations-anticorruption", en: "Investigations, Anti-corruption & Compliance", es: "Investigaciones, anticorrupción y compliance" },
  { value: "bankruptcy-restructuring", en: "Bankruptcy & Restructuring", es: "Concursos mercantiles y reestructuración" },
  { value: "banking-finance", en: "Banking & Finance", es: "Bancario y financiero" },
  { value: "energy-natural-resources", en: "Energy & Natural Resources", es: "Energía y recursos naturales" },
  { value: "esg", en: "ESG (Environmental, Social & Corporate Governance)", es: "ESG (ambiental, social y gobierno corporativo)" },
  { value: "real-estate", en: "Real Estate", es: "Inmobiliario" },
  { value: "intellectual-property", en: "Intellectual Property", es: "Propiedad intelectual" },
  { value: "labor-employment", en: "Labor & Employment", es: "Laboral" },
  { value: "tax", en: "Tax", es: "Fiscal" },
  { value: "international-trade", en: "International Trade", es: "Comercio exterior" },
  { value: "telecommunications-media-technology", en: "Telecommunications, Media & Technology", es: "Telecomunicaciones, medios y tecnología" },
  { value: "environmental", en: "Environmental", es: "Ambiental" },
  { value: "administrative-law", en: "Administrative Law", es: "Derecho administrativo" },
] as const;

// ============================================
// BLOG ADMIN MODULE
// ============================================

// Admin Users with roles
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("editor"), // super_admin, editor, author
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers, {permissions:z.array(z.string()).nullable().optional()}).omit({ id: true, createdAt: true, lastLogin: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const adminAccessEvents = pgTable("admin_access_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  actorId: varchar("actor_id"),
  action: text("action").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog Categories
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionEs: text("description_es"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({ id: true, createdAt: true });
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

// Blog Tags
export const blogTags = pgTable("blog_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  slug: text("slug").notNull().unique(),
});

export const insertBlogTagSchema = createInsertSchema(blogTags).omit({ id: true });
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
export type BlogTag = typeof blogTags.$inferSelect;

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  contentEs: text("content_es"),
  excerpt: text("excerpt"),
  excerptEs: text("excerpt_es"),
  featuredImage: text("featured_image"),
  categoryId: varchar("category_id"),
  authorId: varchar("author_id"),
  status: text("status").notNull().default("draft"), // draft, published, trash
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaTitleEs: text("meta_title_es"),
  metaDescription: text("meta_description"),
  metaDescriptionEs: text("meta_description_es"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog Post Tags (pivot table)
export const blogPostTags = pgTable("blog_post_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  tagId: varchar("tag_id").notNull(),
});

// Media Library
export const mediaItems = pgTable("media_items", {
  archivedAt: timestamp("archived_at"),
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  altEs: text("alt_es"),
  uploadedBy: varchar("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({ id: true, createdAt: true });
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItems.$inferSelect;

// Admin sessions for token-based auth
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({ id: true, createdAt: true });
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;

// Admin login schema for validation (accepts email or username)
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

// Blog post creation schema with validation
export const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  titleEs: z.string().min(1, "Spanish title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(250),
  content: z.string().optional(),
  contentEs: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  excerptEs: z.string().max(500).optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["draft", "published", "trash"]).default("draft"),
  publishedAt: z.date().optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaTitleEs: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaDescriptionEs: z.string().max(160).optional(),
  tagIds: z.array(z.string()).optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

// ============================================
// EVENTS MODULE
// ============================================

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  locationEs: text("location_es"),
  imageUrl: text("image_url"),
  eventType: text("event_type").default("conference"),
  eventTypeEs: text("event_type_es"),
  externalUrl: text("external_url"),
  isHighlight: boolean("is_highlight").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const eventTypes = [
  { 
    value: "conference", 
    en: "Conference", 
    es: "Conferencia", 
    de: "Konferenz", 
    zh: "会议", 
    ko: "컨퍼런스", 
    ja: "カンファレンス", 
    ar: "مؤتمر", 
    ru: "Конференция", 
    fr: "Conférence", 
    it: "Conferenza" 
  },
  { 
    value: "webinar", 
    en: "Webinar", 
    es: "Webinar", 
    de: "Webinar", 
    zh: "网络研讨会", 
    ko: "웨비나", 
    ja: "ウェビナー", 
    ar: "ندوة عبر الإنترنت", 
    ru: "Вебинар", 
    fr: "Webinaire", 
    it: "Webinar" 
  },
  { 
    value: "sponsorship", 
    en: "Sponsorship", 
    es: "Patrocinio", 
    de: "Sponsoring", 
    zh: "赞助", 
    ko: "스폰서십", 
    ja: "スポンサーシップ", 
    ar: "رعاية", 
    ru: "Спонсорство", 
    fr: "Parrainage", 
    it: "Sponsorizzazione" 
  },
  { 
    value: "speaking", 
    en: "Speaking Engagement", 
    es: "Ponencia", 
    de: "Vortrag", 
    zh: "演讲活动", 
    ko: "강연", 
    ja: "講演", 
    ar: "مشاركة في التحدث", 
    ru: "Выступление", 
    fr: "Conférence", 
    it: "Intervento" 
  },
  { 
    value: "networking", 
    en: "Networking Event", 
    es: "Evento de networking", 
    de: "Networking-Veranstaltung", 
    zh: "社交活动", 
    ko: "네트워킹 이벤트", 
    ja: "ネットワーキングイベント", 
    ar: "حدث التواصل", 
    ru: "Нетворкинг", 
    fr: "Événement de réseautage", 
    it: "Evento di networking" 
  },
] as const;

// ============================================
// MULTI-LANGUAGE SUPPORT
// ============================================

// Translation cache table for storing AI-generated translations
export const translationCache = pgTable("translation_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: text("content_type").notNull(), // 'team_member', 'practice_group', 'industry_group', 'news', 'site_content'
  entityId: varchar("entity_id").notNull(), // ID of the entity being translated
  field: text("field"), // 'title', 'bio', 'description', etc. - optional when using translations JSONB
  sourceLanguage: text("source_language").default("en"), // Source language code
  targetLanguage: text("target_language").notNull(), // Target language code
  sourceText: text("source_text"), // Original text - optional when using translations JSONB
  translatedText: text("translated_text"), // Translated text - optional when using translations JSONB
  translations: jsonb("translations"), // JSONB for storing multiple translations at once { title, excerpt, content }
  isApproved: boolean("is_approved").default(false), // Whether translation has been reviewed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTranslationCacheSchema = createInsertSchema(translationCache).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTranslationCache = z.infer<typeof insertTranslationCacheSchema>;
export type TranslationCache = typeof translationCache.$inferSelect;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nameNative: "English" },
  { code: "es", name: "Spanish", nameNative: "Español" },
  { code: "de", name: "German", nameNative: "Deutsch" },
  { code: "zh", name: "Chinese", nameNative: "中文" },
  { code: "ko", name: "Korean", nameNative: "한국어" },
  { code: "ja", name: "Japanese", nameNative: "日本語" },
  { code: "ar", name: "Arabic", nameNative: "العربية" },
  { code: "ru", name: "Russian", nameNative: "Русский" },
  { code: "fr", name: "French", nameNative: "Français" },
  { code: "it", name: "Italian", nameNative: "Italiano" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// ============================================
// CONTENT ANALYSIS RESULTS
// ============================================

export interface SEORecommendation {
  keywords: string[];
  titleSuggestion: string;
  metaDescription: string;
  headingImprovements: string[];
  contentGaps: string[];
  internalLinkOpportunities: string[];
}

export interface SpellingGrammarIssue {
  original: string;
  correction: string;
  type: 'spelling' | 'grammar' | 'terminology' | 'style';
  explanation: string;
}

export interface LawyerMention {
  name: string;
  role: string;
  context: string;
}

export interface ContentAnalysisResult {
  seoRecommendations: SEORecommendation;
  categories: {
    primary: string;
    secondary: string[];
  };
  spellingGrammar: SpellingGrammarIssue[];
  lawyersMentioned: LawyerMention[];
  legalBranches: {
    primary: string[];
    secondary: string[];
  };
  industries: {
    primary: string;
    secondary: string[];
  };
  qualityScore: number;
  analysisTimestamp: string;
}

export const contentAnalysis = pgTable("content_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull(),
  analysisResult: jsonb("analysis_result").$type<ContentAnalysisResult>().notNull(),
  qualityScore: integer("quality_score").default(0),
  issuesCount: integer("issues_count").default(0),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentAnalysisSchema = createInsertSchema(contentAnalysis).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentAnalysis = z.infer<typeof insertContentAnalysisSchema>;
export type ContentAnalysis = typeof contentAnalysis.$inferSelect;

// ============================================
// AI AGENT SYSTEM TABLES
// ============================================

// Agent jobs queue
export const agentJobs = pgTable("agent_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentType: text("agent_type").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed, cancelled
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  payload: jsonb("payload").notNull(),
  result: jsonb("result"),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  parentJobId: varchar("parent_job_id"),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const insertAgentJobSchema = createInsertSchema(agentJobs).omit({ id: true, createdAt: true });
export type InsertAgentJob = z.infer<typeof insertAgentJobSchema>;
export type AgentJob = typeof agentJobs.$inferSelect;

// Agent events log
export const agentEvents = pgTable("agent_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  agentType: text("agent_type").notNull(),
  eventType: text("event_type").notNull(), // start, progress, complete, error, learning, evolution_proposal
  message: text("message").notNull(),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAgentEventSchema = createInsertSchema(agentEvents).omit({ id: true, timestamp: true });
export type InsertAgentEvent = z.infer<typeof insertAgentEventSchema>;
export type AgentEvent = typeof agentEvents.$inferSelect;

// Agent knowledge documents
export const agentKnowledge = pgTable("agent_knowledge", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentType: text("agent_type").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

dataClassification: text("data_classification").notNull().default("unclassified"),
approvedForAiAt: timestamp("approved_for_ai_at"),
approvedForAiBy: varchar("approved_for_ai_by"),
});

export const insertAgentKnowledgeSchema = createInsertSchema(agentKnowledge).omit({ id: true, createdAt: true, updatedAt: true, usageCount: true });
export type InsertAgentKnowledge = z.infer<typeof insertAgentKnowledgeSchema>;
export type AgentKnowledge = typeof agentKnowledge.$inferSelect;

// Agent skills tracking
export const agentSkills = pgTable("agent_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentType: text("agent_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  expertise: integer("expertise").default(50), // 0-100
  usageCount: integer("usage_count").default(0),
  successRate: integer("success_rate").default(100), // 0-100
  learnings: jsonb("learnings"), // Array of skill learnings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAgentSkillSchema = createInsertSchema(agentSkills).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentSkill = z.infer<typeof insertAgentSkillSchema>;
export type AgentSkill = typeof agentSkills.$inferSelect;

// Evolution proposals from agents
export const agentEvolutionProposals = pgTable("agent_evolution_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentType: text("agent_type").notNull(),
  proposalType: text("proposal_type").notNull(), // skill_improvement, new_skill, config_change, knowledge_update
  title: text("title").notNull(),
  description: text("description").notNull(),
  rationale: text("rationale"),
  impact: text("impact").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, approved, rejected, implemented
  proposedChanges: jsonb("proposed_changes"),
  metricsBefore: jsonb("metrics_before"),
  metricsAfter: jsonb("metrics_after"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
});

export const insertAgentEvolutionProposalSchema = createInsertSchema(agentEvolutionProposals).omit({ id: true, createdAt: true });
export type InsertAgentEvolutionProposal = z.infer<typeof insertAgentEvolutionProposalSchema>;
export type AgentEvolutionProposal = typeof agentEvolutionProposals.$inferSelect;

// Website Audits - Summary of audit runs
export const websiteAudits = pgTable("website_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runType: text("run_type").notNull().default("full"), // full, delta, links_only, translations_only, seo_only, content_only
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  pagesScanned: integer("pages_scanned").default(0),
  linksChecked: integer("links_checked").default(0),
  translationsChecked: integer("translations_checked").default(0),
  issuesFound: integer("issues_found").default(0),
  criticalCount: integer("critical_count").default(0),
  highCount: integer("high_count").default(0),
  mediumCount: integer("medium_count").default(0),
  lowCount: integer("low_count").default(0),
  metrics: jsonb("metrics"), // Performance metrics, load times, etc.
  triggeredBy: text("triggered_by").default("manual"), // manual, scheduled, webhook
});

export const insertWebsiteAuditSchema = createInsertSchema(websiteAudits).omit({ id: true, startedAt: true });
export type InsertWebsiteAudit = z.infer<typeof insertWebsiteAuditSchema>;
export type WebsiteAudit = typeof websiteAudits.$inferSelect;

// Website Audit Findings - Individual issues found during audits
export const websiteAuditFindings = pgTable("website_audit_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").notNull().references(() => websiteAudits.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // links, navigation, translations, performance, seo, content
  issueType: text("issue_type").notNull(), // broken_link, missing_translation, incomplete_profile, slow_load, missing_meta, etc.
  severity: text("severity").notNull().default("medium"), // critical, high, medium, low
  status: text("status").notNull().default("open"), // open, in_progress, resolved, ignored, wont_fix
  entityType: text("entity_type"), // team_member, news, practice_group, industry_group, page, link
  entityId: varchar("entity_id"), // ID of the affected entity
  language: varchar("language", { length: 5 }), // For translation issues: en, es, de, zh, ko, ja, ar, ru, fr, it
  url: text("url"), // URL where the issue was found
  details: jsonb("details").notNull(), // Detailed issue information
  recommendation: text("recommendation"), // Suggested fix
  ownerAgent: text("owner_agent"), // Agent responsible for fixing: polyglot_translator, seo_optimizer, metadata_linker
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"), // agent or manual
  remediationJobId: varchar("remediation_job_id"), // If an agent job was created to fix this
});

export const insertWebsiteAuditFindingSchema = createInsertSchema(websiteAuditFindings).omit({ id: true, reportedAt: true });
export type InsertWebsiteAuditFinding = z.infer<typeof insertWebsiteAuditFindingSchema>;
export type WebsiteAuditFinding = typeof websiteAuditFindings.$inferSelect;

// Audit finding categories and issue types for reference
export const auditCategories = {
  links: {
    issueTypes: ['broken_link', 'redirect_chain', 'external_link_broken', 'anchor_missing'],
    severity: 'critical'
  },
  navigation: {
    issueTypes: ['wrong_destination', 'dead_end', 'orphan_page', 'circular_navigation'],
    severity: 'high'
  },
  translations: {
    issueTypes: ['missing_translation', 'partial_translation', 'untranslated_field', 'language_mismatch'],
    severity: 'high'
  },
  performance: {
    issueTypes: ['slow_page_load', 'large_image', 'unoptimized_asset', 'render_blocking'],
    severity: 'medium'
  },
  seo: {
    issueTypes: ['missing_title', 'missing_description', 'missing_og_tags', 'missing_hreflang', 'duplicate_content', 'missing_alt_text'],
    severity: 'medium'
  },
  content: {
    issueTypes: ['incomplete_profile', 'missing_bio', 'missing_photo', 'empty_section', 'outdated_content', 'missing_practice_areas'],
    severity: 'high'
  }
} as const;

// ============================================
// RANKINGS & AWARDS MODULE
// ============================================

export const rankings = pgTable("rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  publication: text("publication").notNull(),
  publicationEs: text("publication_es"),
  year: integer("year").notNull(),
  category: text("category"),
  categoryEs: text("category_es"),
  ranking: text("ranking"),
  rankingEs: text("ranking_es"),
  description: text("description"),
  descriptionEs: text("description_es"),
  logoUrl: text("logo_url"),
  externalUrl: text("external_url"),
  isHighlight: boolean("is_highlight").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRankingSchema = createInsertSchema(rankings).omit({ id: true, createdAt: true });
export type InsertRanking = z.infer<typeof insertRankingSchema>;
export type FirmRanking = typeof rankings.$inferSelect;

export const awards = pgTable("awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  organization: text("organization").notNull(),
  organizationEs: text("organization_es"),
  year: integer("year").notNull(),
  category: text("category"),
  categoryEs: text("category_es"),
  description: text("description"),
  descriptionEs: text("description_es"),
  logoUrl: text("logo_url"),
  certificateUrl: text("certificate_url"),
  isHighlight: boolean("is_highlight").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAwardSchema = createInsertSchema(awards).omit({ id: true, createdAt: true });
export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Award = typeof awards.$inferSelect;

// Link rankings/awards to team members
export const teamMemberRankings = pgTable("team_member_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull(),
  rankingId: varchar("ranking_id").notNull(),
});

export const teamMemberAwards = pgTable("team_member_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull(),
  awardId: varchar("award_id").notNull(),
});

// ============================================
// REPRESENTATIVE CLIENTS MODULE
// ============================================

export const representativeClients = pgTable("representative_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry"),
  industryEs: text("industry_es"),
  description: text("description"),
  descriptionEs: text("description_es"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRepresentativeClientSchema = createInsertSchema(representativeClients).omit({ id: true, createdAt: true });
export type InsertRepresentativeClient = z.infer<typeof insertRepresentativeClientSchema>;
export type RepresentativeClient = typeof representativeClients.$inferSelect;

// Link clients to practice areas
export const clientPracticeGroups = pgTable("client_practice_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  practiceGroupId: varchar("practice_group_id").notNull(),
});

// ============================================
// TESTIMONIALS MODULE
// ============================================

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quote: text("quote").notNull(),
  quoteEs: text("quote_es").notNull(),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title"),
  authorTitleEs: text("author_title_es"),
  authorCompany: text("author_company"),
  authorPhotoUrl: text("author_photo_url"),
  source: text("source"),
  sourceEs: text("source_es"),
  year: integer("year"),
  practiceGroupId: varchar("practice_group_id"),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ============================================
// JOB OPENINGS & INTERNSHIPS MODULE
// ============================================

export const jobOpenings = pgTable("job_openings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  department: text("department"),
  departmentEs: text("department_es"),
  location: text("location"),
  locationEs: text("location_es"),
  type: text("type").notNull().default("full_time"), // full_time, part_time, internship, contract
  level: text("level"), // entry, mid, senior, partner
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  requirements: text("requirements"),
  requirementsEs: text("requirements_es"),
  benefits: text("benefits"),
  benefitsEs: text("benefits_es"),
  salaryRange: text("salary_range"),
  applicationEmail: text("application_email"),
  applicationUrl: text("application_url"),
  practiceGroupId: varchar("practice_group_id"),
  isUrgent: boolean("is_urgent").default(false),
  published: boolean("published").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type JobOpening = typeof jobOpenings.$inferSelect;

export const jobTypes = [
  { value: "full_time", en: "Full Time", es: "Tiempo completo" },
  { value: "part_time", en: "Part Time", es: "Medio tiempo" },
  { value: "internship", en: "Internship", es: "Pasantía" },
  { value: "contract", en: "Contract", es: "Contrato" },
] as const;

export const jobLevels = [
  { value: "entry", en: "Entry Level", es: "Nivel de entrada" },
  { value: "mid", en: "Mid Level", es: "Nivel medio" },
  { value: "senior", en: "Senior Level", es: "Nivel senior" },
  { value: "associate", en: "Associate", es: "Asociado" },
  { value: "counsel", en: "Counsel", es: "Counsel" },
  { value: "partner", en: "Partner", es: "Socio" },
] as const;

// ============================================
// OFFICES & LOCATIONS MODULE
// ============================================

export const offices = pgTable("offices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  countryEs: text("country_es"),
  address: text("address").notNull(),
  addressEs: text("address_es"),
  phone: text("phone"),
  fax: text("fax"),
  email: text("email"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timezone: text("timezone"),
  description: text("description"),
  descriptionEs: text("description_es"),
  imageUrl: text("image_url"),
  isHeadquarters: boolean("is_headquarters").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfficeSchema = createInsertSchema(offices).omit({ id: true, createdAt: true });
export type InsertOffice = z.infer<typeof insertOfficeSchema>;
export type Office = typeof offices.$inferSelect;

// ============================================
// STRATEGIC ALLIANCES MODULE
// ============================================

export const alliances = pgTable("alliances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  type: text("type").notNull().default("network"), // network, association, partnership, correspondent
  description: text("description"),
  descriptionEs: text("description_es"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  country: text("country"),
  countryEs: text("country_es"),
  memberSince: integer("member_since"),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAllianceSchema = createInsertSchema(alliances).omit({ id: true, createdAt: true });
export type InsertAlliance = z.infer<typeof insertAllianceSchema>;
export type Alliance = typeof alliances.$inferSelect;

export const allianceTypes = [
  { value: "network", en: "International Network", es: "Red internacional" },
  { value: "association", en: "Association", es: "Asociación" },
  { value: "partnership", en: "Strategic Partnership", es: "Alianza estratégica" },
  { value: "correspondent", en: "Correspondent Firm", es: "Firma corresponsal" },
] as const;

// ============================================
// SPECIALIZED DESKS MODULE
// ============================================

export const specializedDesks = pgTable("specialized_desks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEs: text("name_es").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country"),
  countryEs: text("country_es"),
  flagEmoji: text("flag_emoji"),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  fullDescription: text("full_description"),
  fullDescriptionEs: text("full_description_es"),
  imageUrl: text("image_url"),
  contactEmail: text("contact_email"),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpecializedDeskSchema = createInsertSchema(specializedDesks).omit({ id: true, createdAt: true });
export type InsertSpecializedDesk = z.infer<typeof insertSpecializedDeskSchema>;
export type SpecializedDesk = typeof specializedDesks.$inferSelect;

// Link team members to specialized desks
export const teamMemberDesks = pgTable("team_member_desks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull(),
  deskId: varchar("desk_id").notNull(),
  role: text("role"), // lead, member
});

// ============================================
// PRO BONO & CSR MODULE
// ============================================

export const proBonoProjects = pgTable("pro_bono_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  organization: text("organization"),
  organizationEs: text("organization_es"),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  impact: text("impact"),
  impactEs: text("impact_es"),
  year: integer("year"),
  imageUrl: text("image_url"),
  category: text("category"),
  categoryEs: text("category_es"),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProBonoProjectSchema = createInsertSchema(proBonoProjects).omit({ id: true, createdAt: true });
export type InsertProBonoProject = z.infer<typeof insertProBonoProjectSchema>;
export type ProBonoProject = typeof proBonoProjects.$inferSelect;

// ============================================
// DIVERSITY & INCLUSION MODULE
// ============================================

export const diversityInitiatives = pgTable("diversity_initiatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  description: text("description").notNull(),
  descriptionEs: text("description_es").notNull(),
  category: text("category"), // gender, disability, lgbtq, age, culture
  categoryEs: text("category_es"),
  impact: text("impact"),
  impactEs: text("impact_es"),
  year: integer("year"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiversityInitiativeSchema = createInsertSchema(diversityInitiatives).omit({ id: true, createdAt: true });
export type InsertDiversityInitiative = z.infer<typeof insertDiversityInitiativeSchema>;
export type DiversityInitiative = typeof diversityInitiatives.$inferSelect;

// ============================================
// FAQ MODULE
// ============================================

export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  questionEs: text("question_es").notNull(),
  answer: text("answer").notNull(),
  answerEs: text("answer_es").notNull(),
  category: text("category"),
  categoryEs: text("category_es"),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true });
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// ============================================
// SITE CONFIGURATION MODULE
// ============================================

export const siteConfig = pgTable("site_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  valueEs: text("value_es"),
  type: text("type").notNull().default("text"), // text, html, url, image, json
  category: text("category").default("general"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({ id: true, updatedAt: true });
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfig.$inferSelect;

// ============================================
// BANNERS & PROMOTIONS MODULE
// ============================================

export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEs: text("title_es"),
  subtitle: text("subtitle"),
  subtitleEs: text("subtitle_es"),
  imageUrl: text("image_url"),
  imageUrlMobile: text("image_url_mobile"),
  linkUrl: text("link_url"),
  linkText: text("link_text"),
  linkTextEs: text("link_text_es"),
  position: text("position").notNull().default("hero"), // hero, sidebar, popup, footer
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  published: boolean("published").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// ============================================
// NEWSLETTER SUBSCRIBERS MODULE
// ============================================

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  company: text("company"),
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("es"),
  practiceInterests: text("practice_interests").array(),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// ============================================
// LEGAL DOCUMENTS MODULE
// ============================================

export const legalDocuments = pgTable("legal_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // privacy_policy, terms_of_use, cookie_policy, disclaimer
  title: text("title").notNull(),
  titleEs: text("title_es").notNull(),
  content: text("content").notNull(),
  contentEs: text("content_es").notNull(),
  version: text("version").default("1.0"),
  effectiveDate: timestamp("effective_date").defaultNow(),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type LegalDocument = typeof legalDocuments.$inferSelect;

export const legalDocumentTypes = [
  { value: "privacy_policy", en: "Privacy Policy", es: "Aviso de privacidad" },
  { value: "terms_of_use", en: "Terms of Use", es: "Términos de uso" },
  { value: "cookie_policy", en: "Cookie Policy", es: "Política de cookies" },
  { value: "disclaimer", en: "Legal Disclaimer", es: "Aviso Legal" },
] as const;


// CMS agent runtime, generated assets and governance (adapted from the supplied reference).
export const generatedImages = pgTable("generated_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  sanitizedPrompt: text("sanitized_prompt"),
  engine: text("engine").notNull(),
  articleId: varchar("article_id").references(() => news.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kind: text("kind").notNull(),                    // 'chat' | 'translation' | 'image' | 'tts'
  model: text("model"),
  promptTokens: integer("prompt_tokens").default(0),
  completionTokens: integer("completion_tokens").default(0),
  images: integer("images").default(0),
  costUsd: doublePrecision("cost_usd").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({ createdIdx: index("api_usage_created_idx").on(t.createdAt) }));

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).omit({ id: true, createdAt: true });

export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;

export type GeneratedImage = typeof generatedImages.$inferSelect;

export const generatedAudio = pgTable("generated_audio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  audioUrl: text("audio_url").notNull(),
  sourceText: text("source_text"),
  voiceId: text("voice_id"),
  engine: text("engine").notNull(),
  sourceType: text("source_type").notNull(), // newsletter | social_media | legal_alerts
  articleId: varchar("article_id").references(() => news.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGeneratedAudioSchema = createInsertSchema(generatedAudio).omit({ id: true, createdAt: true });

export type InsertGeneratedAudio = z.infer<typeof insertGeneratedAudioSchema>;

export type GeneratedAudio = typeof generatedAudio.$inferSelect;

export const generatedPresentations = pgTable("generated_presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  topic: text("topic"),
  template: text("template").notNull().default("santossaucedo"),
  branding: text("branding").notNull().default("santossaucedo"),
  lang: text("lang").notNull().default("es"),
  slideCount: integer("slide_count").default(0),
  pptxUrl: text("pptx_url"),
  pdfUrl: text("pdf_url"),
  pngUrls: jsonb("png_urls").$type<string[]>().default([]),
  sourceDocs: jsonb("source_docs").$type<string[]>().default([]),
  engine: text("engine").notNull(),
  status: text("status").notNull().default("active"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusCreatedIdx: index("generated_presentations_status_created_idx").on(table.status, table.createdAt),
}));

export const insertGeneratedPresentationSchema = createInsertSchema(generatedPresentations, {
  // Refina los jsonb a arreglos de strings (drizzle-zod infiere unknown[] por defecto).
  pngUrls: z.array(z.string()).optional(),
  sourceDocs: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, status: true, archivedAt: true });

export type InsertGeneratedPresentation = z.infer<typeof insertGeneratedPresentationSchema>;

export type GeneratedPresentation = typeof generatedPresentations.$inferSelect;

export const mediaDeletionRequests = pgTable("media_deletion_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaItemId: varchar("media_item_id").notNull(),
  publicPath: text("public_path").notNull(),
  objectName: text("object_name"),
  status: text("status").notNull().default("pending"),
  requestedBy: varchar("requested_by").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
}, (table) => ({
  mediaItemUnique: uniqueIndex("media_deletion_requests_media_item_idx").on(table.mediaItemId),
  statusRequestedIdx: index("media_deletion_requests_status_requested_idx").on(table.status, table.requestedAt),
}));

export const insertMediaDeletionRequestSchema = createInsertSchema(mediaDeletionRequests)
  .omit({ id: true, requestedAt: true, processedAt: true, attempts: true, lastError: true, status: true });

export type InsertMediaDeletionRequest = z.infer<typeof insertMediaDeletionRequestSchema>;

export type MediaDeletionRequest = typeof mediaDeletionRequests.$inferSelect;

export const agentCopyHistory = pgTable("agent_copy_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceJobId: varchar("source_job_id"),
  agentType: text("agent_type").notNull(),
  copyType: text("copy_type").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  searchText: text("search_text").notNull(),
  language: text("language").notNull().default("multi"),
  articleId: varchar("article_id").references(() => news.id, { onDelete: "set null" }),
  status: text("status").notNull().default("proposal"), // proposal | applied | draft | recovered
  origin: text("origin").notNull().default("manual"), // manual | pipeline | scheduled | recovered
  actorId: varchar("actor_id").references(() => adminUsers.id, { onDelete: "set null" }),
  archived: boolean("archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  sourceJobIdx: uniqueIndex("agent_copy_history_source_job_unique").on(t.sourceJobId),
  createdIdx: index("agent_copy_history_created_idx").on(t.createdAt),
  agentStatusIdx: index("agent_copy_history_agent_status_idx").on(t.agentType, t.status),
  articleIdx: index("agent_copy_history_article_idx").on(t.articleId),
  archivedCreatedIdx: index("agent_copy_history_archived_created_idx").on(t.archived, t.createdAt),
}));

export type AgentCopyHistory = typeof agentCopyHistory.$inferSelect;

export const aiGovernanceEvents = pgTable("ai_governance_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  operation: text("operation").notNull(),
  purpose: text("purpose").notNull(),
  agentType: text("agent_type"),
  classification: text("classification").notNull(),
  decision: text("decision").notNull(),
  reasonCodes: jsonb("reason_codes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  contentSha256: varchar("content_sha256", { length: 64 }).notNull(),
  contentBytes: integer("content_bytes").notNull(),
  policyVersion: text("policy_version").notNull(),
  actorId: varchar("actor_id"),
  jobId: varchar("job_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  createdIdx: index("ai_governance_events_created_idx").on(table.createdAt),
  decisionCreatedIdx: index("ai_governance_events_decision_created_idx").on(table.decision, table.createdAt),
}));

export type AiGovernanceEvent = typeof aiGovernanceEvents.$inferSelect;

export const protectedFieldEnvelopes = pgTable("protected_field_envelopes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceType: text("resource_type").notNull(),
  resourceId: varchar("resource_id").notNull(),
  fieldName: text("field_name").notNull(),
  ciphertext: text("ciphertext").notNull(),
  keyId: text("key_id").notNull(),
  encryptionVersion: integer("encryption_version").notNull().default(1),
  contentSha256: varchar("content_sha256", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  resourceIdx: index("protected_field_envelopes_resource_idx").on(table.resourceType, table.resourceId),
  versionUnique: uniqueIndex("protected_field_envelopes_version_idx").on(
    table.resourceType,
    table.resourceId,
    table.fieldName,
    table.encryptionVersion,
  ),
}));

export type ProtectedFieldEnvelope = typeof protectedFieldEnvelopes.$inferSelect;

export const biographyDisplayModes = ["auto", "expanded", "collapsed"] as const;
export type BiographyDisplayMode = typeof biographyDisplayModes[number];
export const authorVerificationStatuses = ["verified_historic", "verified_editorial_2026", "verified_manual", "legacy_unverified"] as const;
export type AuthorVerificationStatus = typeof authorVerificationStatuses[number];
export const newsTeamMemberRelationshipRoles = ["author", "related"] as const;
export type NewsTeamMemberRelationshipRole = typeof newsTeamMemberRelationshipRoles[number];

// Private recruitment submissions. CV paths are opaque and never part of public DTOs.
export const careerApplications=pgTable('career_applications',{
 id:varchar('id').primaryKey().default(sql`gen_random_uuid()`),fullName:text('full_name').notNull(),email:text('email').notNull(),phone:text('phone'),interest:text('interest'),message:text('message'),cvPath:text('cv_path').notNull(),cvOriginalName:text('cv_original_name').notNull(),preferredLanguage:text('preferred_language').default('es'),consentedAt:timestamp('consented_at').defaultNow(),submittedAt:timestamp('submitted_at').defaultNow(),read:boolean('read').default(false),status:text('status').default('received'),archivedAt:timestamp('archived_at')
});
export type CareerApplication=typeof careerApplications.$inferSelect;
