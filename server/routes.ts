import sharp from "sharp";
import { saveTeamMember, teamPracticeIds, validatePracticeRoster } from "./cms/teamEditor";
import { registerContentPreview } from "./cms/preview";
import { connectDesignCatalogs } from "./cms/designCatalogs";
import { registerCatalogOrder } from "./cms/catalogOrder";
import { mediaInventory, persistentMediaItem, registerMediaLibrary } from "./cms/mediaLibrary";
import { registerNewsEditor } from "./cms/newsEditor";
import { getBundledMediaMap } from "./cms/bundledMediaMap";
import { ensureCmsSchema, registerCmsRoutes, getCmsContact } from "./cms/siteConfig";
import type { Express, Request, Response } from "express";
import { createServer, type IncomingMessage, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { seed, teamMembersData } from "./seed";
import { syncSeedContent } from "./contentSync";
import { db } from "./db";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import {
  appStorageObjectKeyFromPath,
  isPublicMediaKey,
  deleteAppStorageObject,
  downloadAppStorageObject,
  uploadAppStorageObject,
} from "./replitStorage";

// Global WebSocket clients map for pipeline progress updates
const pipelineClients: Map<string, WebSocket> = new Map();

export function broadcastPipelineProgress(articleId: string, data: {
  step: string;
  status: 'running' | 'completed' | 'error';
  language?: string;
  progress?: number;
  message?: string;
  data?: any;
}) {
  const payload = JSON.stringify({ articleId, ...data, timestamp: new Date().toISOString() });
  
  // Broadcast to all connected clients
  pipelineClients.forEach((client, clientId) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
import { 
  contactFormSchema, 
  adminLoginSchema, 
  insertBlogPostSchema,
  insertBlogCategorySchema,
  insertBlogTagSchema,
  insertNewsSchema,
  insertTeamMemberSchema,
  insertPracticeGroupSchema,
  insertIndustryGroupSchema,
  insertEventSchema,
  insertRankingSchema,
  insertAwardSchema,
  insertRepresentativeClientSchema,
  insertTestimonialSchema,
  insertJobOpeningSchema,
  insertOfficeSchema,
  insertAllianceSchema,
  insertSpecializedDeskSchema,
  insertOfficeImageSchema,
  newsletterSubscribers,
  mediaItems,
  events as eventsTable,
} from "@shared/schema";
import { isNamedOnTeamPage, toPublicTeamMember, toPublicTeamProfile } from "@shared/teamVisibility";
import { isPublicNews, toPublicNews } from "@shared/publicNews";
import { desc, eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import {
  SUPPORTED_LANGUAGES,
  translateLegalText,
  translateMultipleTexts,
  suggestTranslation,
  type LanguageCode,
} from "./openai";
import {
  hashPassword,
  comparePassword,
  generateToken,
  getSessionExpiry,
  checkRateLimit,
  recordLoginAttempt,
  authMiddleware,
  requireRole,
  validateSessionToken,
} from "./auth";

function apiError(res: Response, status: number, message: string, details?: unknown): void {
  const body: Record<string, unknown> = { error: message };
  if (details !== undefined) body.details = details;
  res.status(status).json(body);
}

function auditLog(
  action: "create" | "update" | "delete",
  resource: string,
  resourceId: string | null,
  userId: string,
  details?: Record<string, unknown>
): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    resourceId,
    userId,
  };
  if (details) entry.details = details;
  console.log("[AUDIT]", JSON.stringify(entry));
}

// Error de los formularios públicos para el registro (N4): solo nombre y código, sin el
// mensaje ni el objeto (un error de Postgres puede traer los valores, p. ej. el correo).
function describeErrorForLog(error: unknown): string {
  if (!(error instanceof Error)) return String(typeof error);
  const code = (error as { code?: unknown }).code;
  return `${error.name}${typeof code === "string" ? ` ${code}` : ""}`;
}

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Videos and documents share the persistent media library
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const receiveMedia:express.RequestHandler=(req,res,next)=>upload.single('file')(req,res,(error:any)=>{
  if(error)return res.status(error.code==='LIMIT_FILE_SIZE'?413:415).json({error:error.code==='LIMIT_FILE_SIZE'?'El archivo supera 50 MB.':'Formato no admitido. Use JPG, PNG, WebP, GIF, MP4, WebM o PDF.'});
  next();
});
const safeMediaUrl=z.string().max(2048).refine(v=>!v||/^https:\/\//.test(v)||/^\/(?!\/)/.test(v),'Use una URL HTTPS o un archivo del sitio.');
const safeNewsWrite=insertNewsSchema.extend({
 slug:z.string().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
 imageUrl:safeMediaUrl.nullable().optional(),documentUrl:safeMediaUrl.nullable().optional(),documentUrlEs:safeMediaUrl.nullable().optional(),sourceUrl:z.string().url().startsWith('https://').or(z.literal('')).nullable().optional(),
 tags:z.array(z.string().min(2).max(60)).max(12).nullable().optional(),date:z.coerce.date().nullable().optional(),publishAt:z.coerce.date().nullable().optional(),
});

function generateVCard(member: any, language: "es" | "en" = "es"): string {
  const title = language === "es" ? member.titleEs : member.title;
  const role = language === "es" ? member.roleEs : member.role;
  
  const safeName = member.name || member.slug?.replace(/-/g, ' ') || 'Unknown';
  const nameParts = safeName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${safeName}`,
    `N:${lastName};${firstName};;;`,
    `ORG:Santos & Saucedo, S.C.`,
    `TITLE:${title}`,
    `ROLE:${role}`,
  ];
  
  if (member.email) {
    lines.push(`EMAIL;TYPE=WORK:${member.email}`);
  }
  
  if (member.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${member.phone}`);
  }
  
  lines.push(`ADR;TYPE=WORK:;;Río Tamazunchale 205 Norte, Col. del Valle;San Pedro Garza García;N.L.;66220;México`);
  lines.push(`URL:https://www.santossaucedo.com`);
  
  if (member.linkedinUrl) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${member.linkedinUrl}`);
  }
  
  if (member.imageUrl) {
    lines.push(`PHOTO;VALUE=URI:${member.imageUrl}`);
  }
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await ensureCmsSchema();
  registerCmsRoutes(app);
  registerCatalogOrder(app);
  registerMediaLibrary(app);
  registerNewsEditor(app);
  registerContentPreview(app);
  app.get('/api/admin/overview',authMiddleware,async(_req,res)=>{
    try {
      const [people,practices,notes,media,contacts]=await Promise.all([storage.getTeamMembers(),storage.getAllPracticeGroups(),storage.getNews(),mediaInventory(),storage.getContactSubmissions()]);
      res.set('Cache-Control','private, no-store');
      res.json({team:{total:people.length,visible:people.filter(isNamedOnTeamPage).length},practices:{total:practices.length,visible:practices.filter(g=>g.published!==false).length},news:{total:notes.length,visible:notes.filter(n=>isPublicNews(n)).length},media:{total:media.length},unread:contacts.filter(c=>!c.read).length,recent:notes.slice(0,5).map(n=>({id:n.id,title:n.titleEs||n.title,category:n.categoryEs||n.category,date:n.date,visible:isPublicNews(n)}))});
    }catch{res.status(503).json({error:'No se pudo cargar el resumen del sitio.'});}
  });
  // Existing public asset URLs retain compatibility while bytes live in App Storage.
  app.use(async (req,res,next) => {
    if (!['GET','HEAD'].includes(req.method) || req.path.startsWith('/team_photos/')) return next();
    try { const target=(await getBundledMediaMap())[req.path];if(target)return res.redirect(302,target); }
    catch(error){console.error('[AppStorage] Media index unavailable', (error as Error).message);}
    next();
  });
  try {
    await seed();
  } catch (err) {
    console.error("[seed] Seeding failed, continuing without seed data:", err);
  }
  await connectDesignCatalogs();
  // En una base ya poblada, pone al día los textos de la semilla que nadie editó (prácticas y equipo)
  try {
    await syncSeedContent();
  } catch (err) {
    console.error("[seed] No se pudieron actualizar los textos de la semilla:", err);
  }

  const agentsEnabled = process.env.ENABLE_APP_AGENTS === "true";
  if (!agentsEnabled) {
    const disabledAgentService = (_req: Request, res: Response) => {
      res.status(503).json({
        error: "Application agents are disabled",
        hint: "Set ENABLE_APP_AGENTS=true after the CMS schema and AI Secrets are validated.",
      });
    };
    // Con o sin agentes, sin sesión del panel: 401 (L2); el estado de los agentes no es público
    app.use("/api/agents", authMiddleware, disabledAgentService);
    app.use("/api/audits", authMiddleware, disabledAgentService);
    app.use("/api/health-check", authMiddleware, disabledAgentService);
  }

  // Rutas retiradas (D4, E4): redirección permanente que conserva la consulta. /experience
  // listaba asuntos sin confirmar; /articles repetía la lista de /news y /events era una página
  // sin eventos. Las páginas siguen en el código sin ruta, y el cliente (App.tsx) redirige igual
  // en GitHub Pages, donde no hay servidor. /offices ya no se retira: es "La oficina" (H1).
  const RETIRED_ROUTES: Record<string, string> = {
    "/experience": "/practice-groups",
    "/articles": "/news",
    "/events": "/news",
  };
  for (const [from, to] of Object.entries(RETIRED_ROUTES)) {
    app.get([from, `${from}/*`], (req, res) => {
      const queryStart = req.originalUrl.indexOf("?");
      const query = queryStart >= 0 ? req.originalUrl.slice(queryStart) : "";
      res.redirect(301, `${to}${query}`);
    });
  }

  // Orígenes admitidos: los de la lista de CORS (CORS_ORIGIN, la misma que server/index.ts) o el
  // propio sitio (mismo host, también detrás del proxy). Los usan los formularios públicos y el
  // WebSocket del proceso de notas.
  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isAllowedOrigin = (origin: string, req: IncomingMessage): boolean => {
    if (allowedOrigins.includes(origin)) return true;
    try {
      const { host } = new URL(origin);
      const forwardedHost = String(req.headers["x-forwarded-host"] ?? "").split(",")[0].trim();
      return host === req.headers.host || (!!forwardedHost && host === forwardedHost);
    } catch {
      return false;
    }
  };

  // WebSocket del proceso de notas (L7): manda pasos, estados y errores de cada nota, también de
  // los borradores, así que solo acepta una sesión válida del panel (subprotocolo, validado como en
  // authMiddleware) desde un origen admitido. Sin token, con otro Origin o sin Origin: 401/403
  // antes de abrir la conexión.
  const PIPELINE_WS_PROTOCOL = 'ss-pipeline';
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws/pipeline',
    handleProtocols: (protocols) => (protocols.has(PIPELINE_WS_PROTOCOL) ? PIPELINE_WS_PROTOCOL : false),
    verifyClient: (info, done) => {
      const origin = info.origin;
      if (!origin || !isAllowedOrigin(origin, info.req)) {
        done(false, 403, 'Forbidden');
        return;
      }
      // Token como subprotocolo ("ss-pipeline", token), no en la URL: la URL queda en los
      // registros de los proxies. El servidor responde solo con "ss-pipeline" (handleProtocols).
      const offered = String(info.req.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const token = offered[0] === PIPELINE_WS_PROTOCOL && offered.length === 2 ? offered[1] : null;
      validateSessionToken(token)
        .then((result) => done(result.ok, result.ok ? undefined : 401, result.ok ? undefined : 'Unauthorized'))
        .catch((error) => {
          console.error('[WebSocket] Session check failed:', error);
          done(false, 500, 'Internal Server Error');
        });
    },
  });
  
  // Heartbeat to detect stale connections
  const heartbeatInterval = setInterval(() => {
    pipelineClients.forEach((ws, clientId) => {
      if (ws.readyState !== WebSocket.OPEN) {
        pipelineClients.delete(clientId);
        return;
      }
      try {
        ws.ping();
      } catch (error) {
        console.error('[WebSocket] Heartbeat ping failed for client:', clientId, error);
        pipelineClients.delete(clientId);
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
  
  wss.on('connection', (ws, req) => {
    const clientId = crypto.randomBytes(8).toString('hex');
    pipelineClients.set(clientId, ws);
    console.log(`[WebSocket] Pipeline client connected: ${clientId}`);
    
    ws.on('close', () => {
      pipelineClients.delete(clientId);
      console.log(`[WebSocket] Pipeline client disconnected: ${clientId}`);
    });
    
    ws.on('error', (error) => {
      console.error(`[WebSocket] Client error ${clientId}:`, error);
      pipelineClients.delete(clientId);
    });

    ws.on('pong', () => {
      // Client is alive, nothing to do
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });

  // /partner_photos, /associate_photos y /of_counsel_photos ya no existen (L3): eran retratos de
  // la plantilla de otra firma y ninguna página los usaba. Los retratos salen solo de /team_photos.
  // Sus rutas dan 404 (no la página del sitio con 200), como /team_photos con un nombre no permitido.
  for (const retiredPhotoPath of ['/partner_photos', '/associate_photos', '/of_counsel_photos']) {
    app.use(retiredPhotoPath, (_req, res) => {
      res.status(404).end();
    });
  }

  // /team_photos (J1): solo los retratos de quien el sitio nombra (isNamedOnTeamPage: socios
  // confirmados y Of Counsel); los de asociados, staff y socios sin confirmar dan 404, igual que
  // en el build estático (script/generate-static-api.ts no los copia). La lista sale de la base
  // (caché de 60 s); si la base falla, del seed. Archivos: "<slug>.<png|jpg|jpeg>" y sus tamaños
  // "<slug>-128.webp", "<slug>-360.webp", "<slug>-652.webp"; cualquier otro nombre, 404.
  const TEAM_PHOTO_FILE = /^\/([a-z0-9-]+?)(?:\.(?:png|jpe?g)|-(?:128|360|652)\.webp)$/i;
  const NAMED_PHOTO_TTL_MS = 60_000;
  let namedPhotoSlugs: { slugs: Set<string>; loadedAt: number } | null = null;
  const getNamedPhotoSlugs = async (): Promise<Set<string>> => {
    if (namedPhotoSlugs && Date.now() - namedPhotoSlugs.loadedAt < NAMED_PHOTO_TTL_MS) {
      return namedPhotoSlugs.slugs;
    }
    try {
      const members = await storage.getTeamMembers();
      const slugs = new Set(members.filter((m) => isNamedOnTeamPage(m)).map((m) => m.slug));
      namedPhotoSlugs = { slugs, loadedAt: Date.now() };
      return slugs;
    } catch (error) {
      console.error("[team_photos] No se pudo leer el equipo; se usa el seed:", error);
      return new Set(teamMembersData.filter((m) => isNamedOnTeamPage(m)).map((m) => m.slug));
    }
  };
  app.use('/team_photos', async (req, res, next) => {
    const match = TEAM_PHOTO_FILE.exec(req.path);
    if (!match) return res.status(404).end();
    const slugs = await getNamedPhotoSlugs();
    if (!slugs.has(match[1].toLowerCase())) return res.status(404).end();
    try { const target=(await getBundledMediaMap())[req.originalUrl.split('?')[0]];if(target)return res.redirect(302,target); }catch{}
    next();
  });

  // Serve Santos & Saucedo team photos from attached_assets/team_photos
  app.use('/team_photos', express.static(path.join(process.cwd(), 'attached_assets', 'team_photos'), {
    maxAge: '7d',
    immutable: true,
  }));
  
  // Portadas que genera el proceso de notas (SmartImageGenerator: "article-<id>-gemini-<ms>.png").
  // L1: solo un nombre simple con extensión de imagen, sin carpetas ni "..", resuelto dentro de
  // public/generated-images. Cualquier otra petición (%2f, %5c, doble codificación, espacios,
  // subcarpetas, otro método) da 404 JSON sin leer nada fuera de esta carpeta. Un solo
  // manejador para todo el prefijo, también para que no caiga en la página del sitio.
  const generatedImagesDir = path.resolve(process.cwd(), 'public', 'generated-images');
  if (!fs.existsSync(generatedImagesDir)) {
    fs.mkdirSync(generatedImagesDir, { recursive: true });
  }
  const GENERATED_IMAGE_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]*\.(png|jpe?g|webp|gif)$/i;

  app.use('/generated-images', (req, res) => {
    const notFound = () => {
      if (!res.headersSent) res.status(404).json({ error: 'Image not found' });
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') return notFound();
    let name: string;
    try {
      name = decodeURIComponent(req.path.slice(1));
    } catch {
      return notFound();
    }
    if (!GENERATED_IMAGE_NAME.test(name) || name.includes('..')) return notFound();
    const filePath = path.resolve(generatedImagesDir, name);
    if (!filePath.startsWith(generatedImagesDir + path.sep)) return notFound();
    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) return notFound();
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('X-Content-Type-Options', 'nosniff');
      res.sendFile(filePath, (sendError) => {
        if (sendError) notFound();
      });
    });
  });

  // Detección del idioma en la primera visita: solo la cabecera Accept-Language del
  // navegador, sin terceros (antes se enviaba la IP del visitante a ipapi.co). Si ningún
  // idioma de la cabecera está entre los 10 del sitio, español.
  const SUPPORTED_UI_LANGUAGES = ["es", "en", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"];

  function parseAcceptLanguage(header: string | undefined): string | null {
    if (!header) return null;
    const languages = header
      .split(",")
      .map((part) => {
        const [tag, ...params] = part.trim().split(";");
        const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
        const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
        return { lang: tag.split("-")[0].toLowerCase(), q: Number.isFinite(q) ? q : 0 };
      })
      // q=0: el navegador declara que no acepta ese idioma
      .filter(({ q }) => q > 0)
      .sort((a, b) => b.q - a.q);
    for (const { lang } of languages) {
      if (SUPPORTED_UI_LANGUAGES.includes(lang)) return lang;
    }
    return null;
  }

  app.get("/api/detect-language", (req, res) => {
    const fromHeader = parseAcceptLanguage(req.headers["accept-language"]);
    // Varía según la cabecera: una caché intermedia no debe servir el idioma de otro visitante
    res.set("Vary", "Accept-Language");
    res.json({ language: fromHeader ?? "es", source: fromHeader ? "accept-language" : "default" });
  });

  // Monitor Laboral (J2): las rutas públicas dan solo notas publicadas y ya en fecha
  // (isPublicNews) y solo los campos que pintan las páginas (toPublicNews, sin los del proceso
  // interno del CMS). Borradores y programadas, con todos sus campos, solo en /api/admin/news…
  app.get("/api/news", async (_req, res) => {
    try {
      const allNews = await storage.getNews();
      const now = new Date();
      res.json(allNews.filter((n) => isPublicNews(n, now)).map(toPublicNews));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/published", async (_req, res) => {
    try {
      const allNews = await storage.getNews();
      const now = new Date();
      res.set("Cache-Control", "public, max-age=60");
      res.json(allNews.filter((n) => isPublicNews(n, now)).map(toPublicNews));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch published news" });
    }
  });

  // Nota pública por slug o id; borrador, programada o inexistente: 404 (sin distinguirlas)
  async function findPublicNews(idOrSlug: string) {
    const item = (await storage.getNewsBySlug(idOrSlug)) ?? (await storage.getNewsById(idOrSlug));
    return item && isPublicNews(item) ? item : undefined;
  }

  app.get("/api/news/:idOrSlug", async (req, res) => {
    try {
      const news = await findPublicNews(req.params.idOrSlug);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(toPublicNews(news));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Autores de una nota pública: solo quien el sitio nombra (J1), con los campos de la ficha
  app.get("/api/news/:slug/authors", async (req, res) => {
    try {
      const newsItem = await storage.getNewsBySlug(req.params.slug);
      if (!newsItem || !isPublicNews(newsItem)) {
        return res.status(404).json({ error: "News not found" });
      }
      const teamMembersList = await storage.getTeamMembersByNewsId(newsItem.id);
      res.json(teamMembersList.filter((m) => isNamedOnTeamPage(m)).map(toPublicTeamProfile));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch authors for news" });
    }
  });

  app.get("/api/office-images", async (_req, res) => {
    try {
      const images = await storage.getOfficeImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.post("/api/admin/office-images", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const parsed = insertOfficeImageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const image = await storage.createOfficeImage(parsed.data);
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to create office image" });
    }
  });

  app.patch("/api/admin/office-images/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const patchSchema = insertOfficeImageSchema.pick({ alt: true, altEs: true, order: true }).partial();
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const updated = await storage.updateOfficeImage(req.params.id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Image not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update office image" });
    }
  });

  app.delete("/api/admin/office-images/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteOfficeImage(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Image not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete office image" });
    }
  });

  app.get("/api/site-content", async (_req, res) => {
    try {
      const content = { ...storage.getSiteContent(), ...await getCmsContact() };
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site content" });
    }
  });

  app.get("/api/stats", (_req, res) => {
    try {
      const stats = storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/practice-groups", async (_req, res) => {
    try {
      const groups = await storage.getPracticeGroups();
      res.set("Cache-Control", "public, max-age=60");
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice groups" });
    }
  });

  app.get("/api/practice-groups/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      let group = await storage.getPracticeGroupBySlug(param);
      if (!group) {
        group = await storage.getPracticeGroupById(param);
      }
      if (!group || group.published === false) {
        return res.status(404).json({ error: "Practice group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice group" });
    }
  });

  app.get("/api/industry-groups", async (_req, res) => {
    try {
      const groups = await storage.getIndustryGroups();
      res.set("Cache-Control", "public, max-age=60");
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch industry groups" });
    }
  });

  app.get("/api/industry-groups/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      let group = await storage.getIndustryGroupBySlug(param);
      if (!group) {
        group = await storage.getIndustryGroupById(param);
      }
      if (!group) {
        return res.status(404).json({ error: "Industry group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch industry group" });
    }
  });

  // E11, J1: el API público solo da lo que el sitio muestra. Listas, ficha, vCard y notas de
  // una persona, solo de quien /team nombra (isNamedOnTeamPage: socios confirmados y Of
  // Counsel). Asociados y staff no salen en ningún JSON público: el mosaico de /team usa fotos
  // estáticas, sin nombres. Listas con el DTO de tarjeta; la ficha, con el de ficha.
  app.get("/api/team", async (_req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.set("Cache-Control", "public, max-age=60");
      res.json(members.filter((m) => isNamedOnTeamPage(m)).map(toPublicTeamMember));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/partners", async (_req, res) => {
    try {
      const partners = await storage.getPartners();
      res.set("Cache-Control", "public, max-age=60");
      res.json(partners.filter((m) => isNamedOnTeamPage(m)).map(toPublicTeamMember));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.get("/api/team/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      let member = await storage.getTeamMemberBySlug(param);
      if (!member) {
        member = await storage.getTeamMemberById(param);
      }
      if (!member || !isNamedOnTeamPage(member)) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json({...toPublicTeamProfile(member),practiceGroupIds:await teamPracticeIds(member,true)});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.get("/api/team/:idOrSlug/vcard", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      const langParam = req.query.lang as string;
      const language: "es" | "en" = langParam === "en" ? "en" : "es";
      
      let member = await storage.getTeamMemberBySlug(param);
      if (!member) {
        member = await storage.getTeamMemberById(param);
      }
      if (!member || !isNamedOnTeamPage(member)) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      const vcard = generateVCard(member, language);
      const filename = member.slug.replace(/[^a-z0-9-]/g, '') + '.vcf';
      
      res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(vcard);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  // Notas de una persona nombrada: solo las públicas, con el DTO público (J2)
  app.get("/api/team/:slug/news", async (req, res) => {
    try {
      const slug = req.params.slug;
      const member = await storage.getTeamMemberBySlug(slug);
      if (!member || !isNamedOnTeamPage(member)) {
        return res.status(404).json({ error: "Team member not found" });
      }
      const newsList = await storage.getNewsByTeamMemberId(member.id);
      const now = new Date();
      res.json(newsList.filter((n) => isPublicNews(n, now)).map(toPublicNews));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news for team member" });
    }
  });

  // Formularios públicos (J4): /api/contact y /api/newsletter.
  // IP del visitante: la primera de X-Forwarded-For (la que guarda el contacto) o la del socket.
  const clientIp = (req: Request): string => {
    const fwd = req.headers["x-forwarded-for"];
    const raw = Array.isArray(fwd) ? fwd[0] : fwd;
    return raw?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
  };

  // Origen: si el navegador manda Origin, debe ser el propio sitio o uno de la lista de CORS
  // (isAllowedOrigin); si no, 403. Sin Origin (curl, formularios antiguos) se deja pasar: lo
  // frenan el límite y la trampa.
  const isAllowedFormOrigin = (req: Request): boolean => {
    const origin = req.headers.origin;
    return !origin || isAllowedOrigin(origin, req);
  };

  // Límite en memoria: 5 envíos por IP cada 10 minutos en cada formulario; respuesta 429 con
  // mensaje genérico. Sin tope global (L5): con unos 50 envíos basura cualquiera bloqueaba los
  // formularios para todos durante 10 minutos.
  // Es un límite de mejor esfuerzo: la clave es la primera entrada de X-Forwarded-For (la
  // escribe el cliente) o, sin ella, la dirección del socket. No se usa "trust proxy" con
  // req.ip porque no se sabe cuántos proxies pone Replit delante, y con un número equivocado
  // todos los visitantes compartirían la misma clave (el proxy) y se bloquearían entre sí.
  const FORM_WINDOW_MS = 10 * 60 * 1000;
  const FORM_MAX_PER_IP = 5;
  // maxPerIp: 5 en los formularios; la traducción pública usa la misma clave con 30 (N1)
  const createFormLimiter = (maxPerIp = FORM_MAX_PER_IP) => {
    const perIp = new Map<string, { count: number; resetAt: number }>();
    return (ip: string): boolean => {
      const now = Date.now();
      if (perIp.size > 5000) {
        perIp.forEach((entry, key) => {
          if (entry.resetAt <= now) perIp.delete(key);
        });
        // Claves inventadas en masa (X-Forwarded-For distinto en cada envío): se vacía el mapa
        // antes que dejarlo crecer sin límite en memoria
        if (perIp.size > 20000) perIp.clear();
      }
      let entry = perIp.get(ip);
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + FORM_WINDOW_MS };
        perIp.set(ip, entry);
      }
      if (entry.count >= maxPerIp) return false;
      entry.count += 1;
      return true;
    };
  };

  // Origen, límite y campo trampa ("website", oculto en el formulario): una persona no lo ve ni
  // lo alcanza; si llega lleno, se responde como un envío correcto sin guardar nada.
  const publicFormGuard = (successBody: Record<string, unknown>) => {
    const allow = createFormLimiter();
    return (req: Request, res: Response, next: () => void) => {
      if (!isAllowedFormOrigin(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (!allow(clientIp(req))) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }
      const trap = req.body?.website;
      if (typeof trap === "string" ? trap.trim() !== "" : trap != null) {
        return res.json(successBody);
      }
      next();
    };
  };

  const contactSuccess = { success: true, message: "Contact form submitted successfully" };
  // La casilla del aviso de privacidad también se exige aquí, no solo en el formulario
  const contactRequestSchema = contactFormSchema.extend({ consent: z.literal(true) });

  app.post("/api/contact", publicFormGuard(contactSuccess), async (req, res) => {
    try {
      const validationResult = contactRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors
        });
      }

      const contactData = validationResult.data;

      const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

      const sanitizedData = {
        fullName: sanitize(contactData.fullName),
        email: contactData.email.trim().toLowerCase(),
        phone: contactData.phone ? sanitize(contactData.phone) : undefined,
        company: contactData.company ? sanitize(contactData.company) : undefined,
        practiceArea: contactData.practiceArea ? sanitize(contactData.practiceArea) : undefined,
        message: sanitize(contactData.message),
        ipAddress: clientIp(req),
      };

      const submission = await storage.createContactSubmission(sanitizedData);

      // Solo el id del envío (N4): nombre, correo y mensaje no van al registro
      console.log(`[Contact] New submission saved with id ${submission.id}`);

      res.json(contactSuccess);
    } catch (error) {
      console.error("Contact form error:", describeErrorForLog(error));
      res.status(500).json({ error: "Failed to process contact form" });
    }
  });

  // Suscripción al Monitor Laboral (E20, J4): guarda el correo en newsletter_subscribers; no
  // envía correos. Exige la casilla del aviso de privacidad (consent: true). Nombre y apellido,
  // si llegan, se guardan juntos en name (el formulario actual, D13, solo pide el correo). Un
  // correo ya suscrito recibe la misma respuesta que un alta nueva (no revela quién está
  // suscrito) y su registro no cambia; uno dado de baja se reactiva, con la misma respuesta.
  const newsletterSchema = z.object({
    email: z.string().trim().toLowerCase().min(1).max(254).email(),
    firstName: z.string().trim().max(100).optional().catch(undefined),
    lastName: z.string().trim().max(100).optional().catch(undefined),
    // Idioma de la página, si viene; uno desconocido se ignora (queda el de la tabla, "es")
    preferredLanguage: z
      .string()
      .refine((code) => SUPPORTED_LANGUAGES.some((l) => l.code === code))
      .optional()
      .catch(undefined),
    consent: z.literal(true),
  });
  const newsletterSuccess = { success: true };

  app.post("/api/newsletter", publicFormGuard(newsletterSuccess), async (req, res) => {
    const parsed = newsletterSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed" });
    }
    try {
      const { email, firstName, lastName, preferredLanguage } = parsed.data;
      const name = [firstName, lastName]
        .map((part) => part?.replace(/<[^>]*>/g, "").trim())
        .filter(Boolean)
        .join(" ");
      await db
        .insert(newsletterSubscribers)
        .values({
          email,
          ...(name ? { name } : {}),
          ...(preferredLanguage ? { preferredLanguage } : {}),
        })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: {
            isActive: true,
            unsubscribedAt: null,
            ...(name ? { name } : {}),
            ...(preferredLanguage ? { preferredLanguage } : {}),
          },
          // Solo las bajas: un suscriptor activo queda como estaba
          setWhere: eq(newsletterSubscribers.isActive, false),
        });
      res.json(newsletterSuccess);
    } catch (error) {
      console.error("Newsletter subscription error:", describeErrorForLog(error));
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  // Rutas retiradas (J3). Asuntos representativos: no hay asuntos confirmados (los 18 del seed
  // son de plantilla), así que las dos rutas devuelven una lista vacía. Eventos: /events
  // redirige a /news y ninguna página pública los lee: lista vacía y 404. El panel lee los
  // eventos (también los no publicados) en /api/admin/events, con sesión.
  app.get("/api/representative-matters", (_req, res) => {
    res.json([]);
  });

  app.get("/api/practice-groups/:slug/representative-matters", (_req, res) => {
    res.json([]);
  });

  app.get("/api/events", (_req, res) => {
    res.json([]);
  });

  app.get("/api/events/upcoming", (_req, res) => {
    res.json([]);
  });

  app.get("/api/events/:id", (_req, res) => {
    res.status(404).json({ error: "Event not found" });
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || '').toLowerCase().trim();
      if (!query || query.length < 2) {
        return res.json({ team: [], practiceGroups: [], industryGroups: [], news: [] });
      }
      
      const [team, practiceGroups, industryGroups, news] = await Promise.all([
        storage.getTeamMembers(),
        storage.getPracticeGroups(),
        storage.getIndustryGroups(),
        storage.getNews(),
      ]);
      
      // Solo quien aparece con nombre en /team (socios confirmados y Of Counsel) y solo notas
      // públicas (isPublicNews), como /api/news; resultados con los DTO públicos (J1, J2)
      const now = new Date();
      const filteredTeam = team.filter(m => isNamedOnTeamPage(m)).filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query) ||
        m.titleEs.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.roleEs.toLowerCase().includes(query) ||
        (m.bio && m.bio.toLowerCase().includes(query)) ||
        (m.bioEs && m.bioEs.toLowerCase().includes(query))
      ).slice(0, 10);
      
      const filteredPractice = practiceGroups.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.nameEs.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.descriptionEs.toLowerCase().includes(query)
      ).slice(0, 5);
      
      const filteredIndustry = industryGroups.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.nameEs.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.descriptionEs.toLowerCase().includes(query)
      ).slice(0, 5);
      
      const filteredNews = news.filter(n => isPublicNews(n, now)).filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.titleEs.toLowerCase().includes(query) ||
        n.excerpt.toLowerCase().includes(query) ||
        n.excerptEs.toLowerCase().includes(query) ||
        (n.content && n.content.toLowerCase().includes(query)) ||
        (n.contentEs && n.contentEs.toLowerCase().includes(query))
      ).slice(0, 5);
      
      res.json({
        team: filteredTeam.map(toPublicTeamMember),
        practiceGroups: filteredPractice,
        industryGroups: filteredIndustry,
        news: filteredNews.map(toPublicNews),
      });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const robotsTxt = `# robots.txt for https://www.santossaucedo.com
User-agent: *
Allow: /

# Disallow API endpoints
Disallow: /api/

# Sitemap location
Sitemap: https://www.santossaucedo.com/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(robotsTxt);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = 'https://www.santossaucedo.com';
      const today = new Date().toISOString().split('T')[0];

      const staticPages = [
        { loc: '/', changefreq: 'weekly', priority: '1.0' },
        { loc: '/about', changefreq: 'monthly', priority: '0.8' },
        { loc: '/team', changefreq: 'weekly', priority: '0.9' },
        { loc: '/practice-groups', changefreq: 'monthly', priority: '0.8' },
        { loc: '/news', changefreq: 'daily', priority: '0.9' },
        { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
        { loc: '/offices', changefreq: 'monthly', priority: '0.6' },
        { loc: '/careers', changefreq: 'weekly', priority: '0.7' },
        { loc: '/careers/interns', changefreq: 'monthly', priority: '0.5' },
        { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
        { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
      ];

      const [teamMembers, practiceGroups, newsItems] = await Promise.all([
        storage.getTeamMembers(),
        storage.getPracticeGroups(),
        storage.getNews(),
      ]);

      let urlEntries = '';

      for (const page of staticPages) {
        urlEntries += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }

      // Fichas: solo quien aparece con nombre en /team (shared/teamVisibility.ts)
      for (const member of teamMembers.filter(m => isNamedOnTeamPage(m))) {
        urlEntries += `
  <url>
    <loc>${baseUrl}/team/${member.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      for (const group of practiceGroups) {
        urlEntries += `
  <url>
    <loc>${baseUrl}/practice-groups/${group.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }

      // Solo notas públicas (isPublicNews, el criterio de /api/news)
      const now = new Date();
      const publishedNews = newsItems.filter(n => isPublicNews(n, now));
      for (const newsItem of publishedNews) {
        const lastmod = newsItem.date ? new Date(newsItem.date).toISOString().split('T')[0] : today;
        urlEntries += `
  <url>
    <loc>${baseUrl}/news/${newsItem.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
    }
  });

  // Serve uploaded files
  app.get('/media/*', async (req: Request, res: Response) => {
    try {
      const objectName = req.params[0];
      if (!objectName || !isPublicMediaKey(objectName)) {
        return res.status(404).end();
      }

      const contents = await downloadAppStorageObject(objectName);
      if (!contents) return res.status(404).end();

      const extension = path.extname(objectName).toLowerCase();
      const mimeByExtension: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
      };
      res.setHeader('Content-Type', mimeByExtension[extension] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Accept-Ranges', 'bytes');
      if (req.headers.range) {
        const ranges = req.range(contents.length);
        if (!ranges || ranges === -1 || ranges === -2 || ranges.length !== 1) {
          res.setHeader('Content-Range', `bytes */${contents.length}`);return res.status(416).end();
        }
        const { start, end } = ranges[0];
        res.setHeader('Content-Range', `bytes ${start}-${end}/${contents.length}`);
        return res.status(206).send(contents.subarray(start, end + 1));
      }
      res.send(contents);
    } catch (error) {
      console.error('Serve App Storage media error:', error);
      res.status(500).end();
    }
  });

  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    immutable: true,
  }));

  // =============================================
  // ADMIN ROUTES
  // =============================================

  // Admin Initialization (create first admin user)
  const adminInitSchema = z.object({
    username: z.string().trim().email(),
    password: z.string().min(12).max(200),
  });
  app.post("/api/admin/init", async (req: Request, res: Response) => {
    try {
      if (process.env.ALLOW_ADMIN_INIT !== "true") {
        return res.status(404).json({ error: "Admin initialization is disabled" });
      }

      // Alta (pantalla /admin/setup): un correo válido y una contraseña de al menos 12
      // caracteres; solo mientras el secreto ALLOW_ADMIN_INIT está encendido
      const validation = adminInitSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validation.error.errors 
        });
      }

      const username = validation.data.username.toLowerCase();
      const { password } = validation.data;
      const passwordHash = await hashPassword(password);

      // Check if user with this email already exists
      const existingUser = await storage.getAdminUserByEmail(username);
      if (existingUser) {
        return res.status(403).json({ error: "Admin user with this email already exists" });
      }

      // Create the first admin user
      const user = await storage.createAdminUser({
        username: username.split('@')[0],
        email: username,
        passwordHash,
        role: "super_admin",
        isActive: true,
      });

      res.json({
        success: true,
        message: "Admin user created successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Init error:", error);
      res.status(500).json({ error: "Initialization failed" });
    }
  });

  // Admin Login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const ip = clientIp(req);
      // Límite por dirección y usuario (N3), con la misma dirección de mejor esfuerzo que los
      // formularios. Con req.ip solo, detrás del proxy todos compartían una clave y cinco
      // intentos de un extraño bloqueaban 30 minutos al editor real desde cualquier dirección.
      const attemptedUser = typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
      const rateKey = `${ip}|${attemptedUser}`;

      // Check rate limit
      const rateCheck = checkRateLimit(rateKey);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: "Too many login attempts", 
          retryAfter: rateCheck.retryAfter 
        });
      }

      // Validate input
      const validation = adminLoginSchema.safeParse(req.body);
      if (!validation.success) {
        recordLoginAttempt(rateKey, false);
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validation.error.errors 
        });
      }

      const { username, password } = validation.data;

      // Find user by email or username
      let user = await storage.getAdminUserByEmail(username);
      if (!user) {
        user = await storage.getAdminUserByUsername(username);
      }
      if (!user) {
        await comparePassword(password, "$2b$12$InvalidHashToPreventTimingAttackXXXXXXXXXXXX");
        recordLoginAttempt(rateKey, false);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user is active
      if (!user.isActive) {
        recordLoginAttempt(rateKey, false);
        return res.status(401).json({ error: "Account is disabled" });
      }

      // Verify password
      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) {
        recordLoginAttempt(rateKey, false);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Record successful attempt
      recordLoginAttempt(rateKey, true);

      // Create session
      const token = generateToken();
      const session = await storage.createAdminSession({
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
      });

      // Update last login
      await storage.updateAdminUserLogin(user.id);

      res.json({
        token: session.token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin Logout
  app.post("/api/admin/logout", authMiddleware, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await storage.deleteAdminSession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current admin user
  app.get("/api/admin/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.adminUser!;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // =============================================
  // BLOG POSTS CRUD
  // =============================================

  // Get all blog posts with pagination
  app.get("/api/admin/posts", authMiddleware, async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string || "";
      const status = req.query.status as string || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      let posts = await storage.getBlogPosts();
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchLower) ||
          post.titleEs.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by status
      if (status && status !== "all") {
        posts = posts.filter(post => post.status === status);
      }
      
      const total = posts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedPosts = posts.slice(startIndex, startIndex + limit);
      
      res.json({
        posts: paginatedPosts,
        total,
        page,
        totalPages,
      });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get single blog post
  app.get("/api/admin/posts/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const post = await storage.getBlogPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Create blog post
  app.post("/api/admin/posts", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validation = insertBlogPostSchema.safeParse({
        ...req.body,
        authorId: req.adminUser!.id,
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      // Check for duplicate slug
      const existingPost = await storage.getBlogPostBySlug(validation.data.slug);
      if (existingPost) {
        return res.status(400).json({ error: "Slug already exists" });
      }

      const post = await storage.createBlogPost(validation.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Update blog post
  app.put("/api/admin/posts/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const existingPost = await storage.getBlogPostById(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check for duplicate slug if slug is being changed
      if (req.body.slug && req.body.slug !== existingPost.slug) {
        const slugPost = await storage.getBlogPostBySlug(req.body.slug);
        if (slugPost) {
          return res.status(400).json({ error: "Slug already exists" });
        }
      }

      const post = await storage.updateBlogPost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  // Delete blog post (soft delete)
  app.delete("/api/admin/posts/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // =============================================
  // BLOG CATEGORIES CRUD
  // =============================================

  // Get all categories
  app.get("/api/admin/categories", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get single category
  app.get("/api/admin/categories/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const category = await storage.getBlogCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Create category
  app.post("/api/admin/categories", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validation = insertBlogCategorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const category = await storage.createBlogCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Update category
  app.put("/api/admin/categories/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const category = await storage.updateBlogCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Delete category
  app.delete("/api/admin/categories/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteBlogCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // =============================================
  // BLOG TAGS CRUD
  // =============================================

  // Get all tags
  app.get("/api/admin/tags", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Get tags error:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  // Create tag
  app.post("/api/admin/tags", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validation = insertBlogTagSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const tag = await storage.createBlogTag(validation.data);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Create tag error:", error);
      res.status(500).json({ error: "Failed to create tag" });
    }
  });

  // Delete tag
  app.delete("/api/admin/tags/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteBlogTag(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete tag error:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  // =============================================
  // ADMIN NEWS CRUD
  // =============================================

  // Get all news with pagination/search
  app.get("/api/admin/news", authMiddleware, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";
      const category = (req.query.category as string) || "";

      let allNews = await storage.getNews();

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        allNews = allNews.filter(n => 
          n.title.toLowerCase().includes(searchLower) ||
          n.titleEs.toLowerCase().includes(searchLower) ||
          n.excerpt.toLowerCase().includes(searchLower) ||
          n.excerptEs.toLowerCase().includes(searchLower)
        );
      }

      // Filter by category
      if (category && category !== "all") {
        allNews = allNews.filter(n => n.category === category);
      }

      const total = allNews.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedNews = allNews.slice(offset, offset + limit);

      res.json({
        news: paginatedNews,
        total,
        page,
        totalPages,
      });
    } catch (error) {
      console.error("Get admin news error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Get news stats
  app.get("/api/admin/news/stats", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const allNews = await storage.getNews();
      const total = allNews.length;
      const published = allNews.filter(n => n.published).length;
      const unpublished = total - published;

      res.json({ total, published, unpublished });
    } catch (error) {
      console.error("Get news stats error:", error);
      res.status(500).json({ error: "Failed to fetch news stats" });
    }
  });

  // Todas las notas, con borradores, programadas y los campos del proceso (J2): lo que antes
  // daba /api/news, que ahora solo entrega las públicas. La lee el panel (procesamiento de
  // artículos). Antes de /api/admin/news/:id, que si no tomaría "all" como id.
  app.get("/api/admin/news/all", authMiddleware, async (_req: Request, res: Response) => {
    try {
      res.json(await storage.getNews());
    } catch (error) {
      console.error("Get all admin news error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Get comprehensive CMS stats for admin dashboard
  app.get("/api/admin/cms-stats", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const allNews = await storage.getNews();
      const totalArticles = allNews.length;
      
      // Get all translations and count by language
      const translationsByLanguage: Record<string, number> = {};
      const articlesWithTranslationsSet = new Set<string>();
      let totalTranslations = 0;
      
      // Fetch translations for all news articles
      for (const newsItem of allNews) {
        const translations = await storage.getNewsTranslations(newsItem.id);
        if (translations.length > 0) {
          articlesWithTranslationsSet.add(newsItem.id);
        }
        for (const translation of translations) {
          totalTranslations++;
          translationsByLanguage[translation.language] = 
            (translationsByLanguage[translation.language] || 0) + 1;
        }
      }
      
      // Get recent articles (last 5)
      const recentArticles = allNews.slice(0, 5).map(n => ({
        id: n.id,
        title: n.title,
        titleEs: n.titleEs,
        slug: n.slug,
        date: n.date,
        category: n.category,
        published: n.published,
      }));
      
      res.json({
        totalArticles,
        articlesWithTranslations: articlesWithTranslationsSet.size,
        totalTranslations,
        translationsByLanguage,
        recentArticles,
        languagesSupported: 10,
        processingStatus: "idle", // Could be connected to actual processing status
      });
    } catch (error) {
      console.error("Get CMS stats error:", error);
      res.status(500).json({ error: "Failed to fetch CMS stats" });
    }
  });

  // Get translation counts for all news articles
  app.get("/api/admin/news/translation-counts", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const counts = await storage.getNewsTranslationCounts();
      res.json(counts);
    } catch (error) {
      console.error("Get translation counts error:", error);
      res.status(500).json({ error: "Failed to fetch translation counts" });
    }
  });

  // Get translations for a specific news article
  app.get("/api/admin/news/:id/translations", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const translations = await storage.getNewsTranslations(id);
      res.json(translations);
    } catch (error) {
      console.error("Get news translations error:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  // Get single news by ID
  app.get("/api/admin/news/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const newsItem = await storage.getNewsById(req.params.id);
      if (!newsItem) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(newsItem);
    } catch (error) {
      console.error("Get news error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Create news
  app.post("/api/admin/news", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validation = safeNewsWrite.safeParse(req.body);
      
      if (!validation.success) {
        return apiError(res, 400, "Validation failed", validation.error.errors);
      }

      const newsItem = await storage.createNews(validation.data);
      auditLog("create", "news", newsItem.id, (req as any).adminUser?.id || "unknown");
      res.status(201).json(newsItem);
    } catch (error) {
      console.error("Create news error:", error);
      return apiError(res, 500, "Failed to create news");
    }
  });

  // Update news
  app.put("/api/admin/news/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const parsed=safeNewsWrite.partial().safeParse(req.body);
      if(!parsed.success)return apiError(res,400,"Revise los campos de la publicación.",parsed.error.errors);
      const newsItem = await storage.updateNews(req.params.id, parsed.data);
      if (!newsItem) {
        return apiError(res, 404, "News not found");
      }
      auditLog("update", "news", req.params.id, (req as any).adminUser?.id || "unknown");
      res.json(newsItem);
    } catch (error) {
      console.error("Update news error:", error);
      return apiError(res, 500, "Failed to update news");
    }
  });

  // Delete news
  app.delete("/api/admin/news/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteNews(req.params.id);
      if (!deleted) {
        return apiError(res, 404, "News not found");
      }
      auditLog("delete", "news", req.params.id, (req as any).adminUser?.id || "unknown");
      res.json({ success: true });
    } catch (error) {
      console.error("Delete news error:", error);
      return apiError(res, 500, "Failed to delete news");
    }
  });

  // =============================================
  // ADMIN TEAM MEMBERS CRUD
  // =============================================

  // Get all team members (admin)
  app.get("/api/admin/team", authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed=z.object({page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().max(160).default(''),role:z.string().max(80).default(''),visibility:z.enum(['all','visible','hidden']).default('all')}).safeParse(req.query);
      if(!parsed.success)return res.status(400).json({error:'Revise los filtros del equipo.'});
      const {page,limit,search,role,visibility}=parsed.data;
      let members = await storage.getTeamMembers();
      if(visibility!=='all')members=members.filter(member=>isNamedOnTeamPage(member)===(visibility==='visible'));

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        members = members.filter(m => 
          m.name.toLowerCase().includes(searchLower) ||
          (m.email && m.email.toLowerCase().includes(searchLower))
        );
      }

      // Filter by role/title
      if (role && role !== "all") {
        members = members.filter(m => m.title.toLowerCase().includes(role.toLowerCase()));
      }

      const total = members.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedMembers = members.slice(offset, offset + limit);

      res.json({
        members: paginatedMembers,
        total,
        page,
        totalPages,
      });
    } catch (error) {
      console.error("Get admin team members error:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Static route must precede /:id (otherwise "stats" is treated as a member ID).
  app.get("/api/admin/team/stats", authMiddleware, async (_req, res) => {
    const members = await storage.getTeamMembers();
    res.json({total:members.length,partners:members.filter(m=>m.isPartner).length,ofCounsel:members.filter(m=>m.title.toLowerCase()==='of counsel').length,associates:members.filter(m=>/associate/i.test(m.title)).length});
  });

  // Get single team member (admin)
  app.get("/api/admin/team/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const member = await storage.getTeamMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json({...member,practiceGroupIds:await teamPracticeIds(member)});
    } catch (error) {
      console.error("Get team member error:", error);
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  // Create team member
  app.post("/api/admin/team", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const member = await saveTeamMember(req.body);
      auditLog("create", "team", member!.id, (req as any).adminUser?.id || "unknown");
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof ZodError) {
        return apiError(res, 400, "Validation failed", error.errors);
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Create team member error:", error);
      return apiError(res, 500, "Failed to create team member");
    }
  });

  // Update team member
  app.put("/api/admin/team/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const member = await saveTeamMember(req.body,req.params.id);
      if (!member) {
        return apiError(res, 404, "Team member not found");
      }
      auditLog("update", "team", req.params.id, (req as any).adminUser?.id || "unknown");
      res.json(member);
    } catch (error) {
      if (error instanceof ZodError) {
        return apiError(res, 400, "Validation failed", error.errors);
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Update team member error:", error);
      return apiError(res, 500, "Failed to update team member");
    }
  });

  // Delete team member
  app.delete("/api/admin/team/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTeamMember(req.params.id);
      if (!deleted) {
        return apiError(res, 404, "Team member not found");
      }
      auditLog("delete", "team", req.params.id, (req as any).adminUser?.id || "unknown");
      res.json({ success: true });
    } catch (error) {
      console.error("Delete team member error:", error);
      return apiError(res, 500, "Failed to delete team member");
    }
  });

  // =============================================
  // ADMIN PRACTICE GROUPS CRUD
  // =============================================

  // Get all practice groups (admin)
  app.get("/api/admin/practice-groups", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const groups = await storage.getAllPracticeGroups();
      res.json(groups);
    } catch (error) {
      console.error("Get practice groups error:", error);
      res.status(500).json({ error: "Failed to fetch practice groups" });
    }
  });

  // Create practice group
  app.post("/api/admin/practice-groups", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertPracticeGroupSchema.extend({teamMemberIds:z.array(z.string().uuid()).max(100).nullable().optional()}).parse(req.body);
      await validatePracticeRoster(validatedData.teamMemberIds);
      const group = await storage.createPracticeGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Create practice group error:", error);
      res.status(500).json({ error: "Failed to create practice group" });
    }
  });

  // Update practice group
  app.put("/api/admin/practice-groups/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertPracticeGroupSchema.extend({teamMemberIds:z.array(z.string().uuid()).max(100).nullable().optional()}).partial().parse(req.body);
      await validatePracticeRoster(validatedData.teamMemberIds);
      const group = await storage.updatePracticeGroup(req.params.id, validatedData);
      if (!group) {
        return res.status(404).json({ error: "Practice group not found" });
      }
      res.json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Update practice group error:", error);
      res.status(500).json({ error: "Failed to update practice group" });
    }
  });

  // Delete practice group
  app.delete("/api/admin/practice-groups/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deletePracticeGroup(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Practice group not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete practice group error:", error);
      res.status(500).json({ error: "Failed to delete practice group" });
    }
  });

  // =============================================
  // ADMIN INDUSTRY GROUPS CRUD
  // =============================================

  // Get all industry groups (admin)
  app.get("/api/admin/industry-groups", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const groups = await storage.getIndustryGroups();
      res.json(groups);
    } catch (error) {
      console.error("Get industry groups error:", error);
      res.status(500).json({ error: "Failed to fetch industry groups" });
    }
  });

  // Create industry group
  app.post("/api/admin/industry-groups", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertIndustryGroupSchema.parse(req.body);
      const group = await storage.createIndustryGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Create industry group error:", error);
      res.status(500).json({ error: "Failed to create industry group" });
    }
  });

  // Update industry group
  app.put("/api/admin/industry-groups/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertIndustryGroupSchema.partial().parse(req.body);
      const group = await storage.updateIndustryGroup(req.params.id, validatedData);
      if (!group) {
        return res.status(404).json({ error: "Industry group not found" });
      }
      res.json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      if ((error as any)?.code === "23505" || (error as any)?.cause?.code === "23505") return res.status(409).json({error:"Ya existe un registro con ese identificador. Cambie la dirección para conservar ambos."});
      console.error("Update industry group error:", error);
      res.status(500).json({ error: "Failed to update industry group" });
    }
  });

  // Delete industry group
  app.delete("/api/admin/industry-groups/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteIndustryGroup(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Industry group not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete industry group error:", error);
      res.status(500).json({ error: "Failed to delete industry group" });
    }
  });

  // =============================================
  // ADMIN EVENTS CRUD
  // =============================================
  
  // Todos los eventos, también los no publicados (storage.getEvents solo da los publicados y
  // el panel no veía sus borradores); J3
  app.get("/api/admin/events", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const eventsList = await db.select().from(eventsTable).orderBy(desc(eventsTable.date));
      res.json(eventsList);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/admin/events", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json(event);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create event error:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/admin/events/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const updated = await storage.updateEvent(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update event error:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/admin/events/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // =============================================
  // ADMIN RANKINGS CRUD
  // =============================================
  
  app.get("/api/admin/rankings", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const rankingsList = await storage.getRankings();
      res.json(rankingsList);
    } catch (error) {
      console.error("Get rankings error:", error);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  app.post("/api/admin/rankings", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertRankingSchema.parse(req.body);
      const ranking = await storage.createRanking(validatedData);
      res.json(ranking);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create ranking error:", error);
      res.status(500).json({ error: "Failed to create ranking" });
    }
  });

  app.put("/api/admin/rankings/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertRankingSchema.partial().parse(req.body);
      const updated = await storage.updateRanking(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Ranking not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update ranking error:", error);
      res.status(500).json({ error: "Failed to update ranking" });
    }
  });

  app.delete("/api/admin/rankings/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteRanking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Ranking not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete ranking error:", error);
      res.status(500).json({ error: "Failed to delete ranking" });
    }
  });

  // =============================================
  // ADMIN AWARDS CRUD
  // =============================================
  
  app.get("/api/admin/awards", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const awardsList = await storage.getAwards();
      res.json(awardsList);
    } catch (error) {
      console.error("Get awards error:", error);
      res.status(500).json({ error: "Failed to fetch awards" });
    }
  });

  app.post("/api/admin/awards", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAwardSchema.parse(req.body);
      const award = await storage.createAward(validatedData);
      res.json(award);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create award error:", error);
      res.status(500).json({ error: "Failed to create award" });
    }
  });

  app.put("/api/admin/awards/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAwardSchema.partial().parse(req.body);
      const updated = await storage.updateAward(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Award not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update award error:", error);
      res.status(500).json({ error: "Failed to update award" });
    }
  });

  app.delete("/api/admin/awards/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteAward(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Award not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete award error:", error);
      res.status(500).json({ error: "Failed to delete award" });
    }
  });

  // =============================================
  // ADMIN REPRESENTATIVE CLIENTS CRUD
  // =============================================
  
  app.get("/api/admin/clients", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const clientsList = await storage.getRepresentativeClients();
      res.json(clientsList);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/admin/clients", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertRepresentativeClientSchema.parse(req.body);
      const client = await storage.createRepresentativeClient(validatedData);
      res.json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create client error:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.put("/api/admin/clients/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertRepresentativeClientSchema.partial().parse(req.body);
      const updated = await storage.updateRepresentativeClient(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update client error:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/admin/clients/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteRepresentativeClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // =============================================
  // ADMIN TESTIMONIALS CRUD
  // =============================================
  
  app.get("/api/admin/testimonials", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const testimonialsList = await storage.getTestimonials();
      res.json(testimonialsList);
    } catch (error) {
      console.error("Get testimonials error:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.json(testimonial);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create testimonial error:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestimonialSchema.partial().parse(req.body);
      const updated = await storage.updateTestimonial(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update testimonial error:", error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete testimonial error:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  app.get("/api/jobs", async (_req, res) => {
    try {
      const now = new Date();
      const jobs = (await storage.getJobOpenings()).filter(j => j.published && (!j.expiresAt || new Date(j.expiresAt) > now));
      res.setHeader("Cache-Control", "no-store");
      res.json(jobs.map(j => ({ id: j.id, title: j.title, titleEs: j.titleEs, department: j.department, departmentEs: j.departmentEs, location: j.location, locationEs: j.locationEs, type: j.type, description: j.description, descriptionEs: j.descriptionEs, applicationEmail: j.applicationEmail, applicationUrl: j.applicationUrl })));
    } catch { res.status(503).json({ error: "No se pudieron cargar las vacantes." }); }
  });

  // =============================================
  // ADMIN JOB OPENINGS CRUD
  // =============================================
  
  app.get("/api/admin/jobs", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const jobsList = await storage.getJobOpenings();
      res.json(jobsList);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/admin/jobs", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertJobOpeningSchema.extend({ expiresAt: z.coerce.date().nullable().optional() }).parse(req.body);
      const job = await storage.createJobOpening(validatedData);
      res.json(job);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create job error:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.put("/api/admin/jobs/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertJobOpeningSchema.extend({ expiresAt: z.coerce.date().nullable().optional() }).partial().parse(req.body);
      const updated = await storage.updateJobOpening(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update job error:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/admin/jobs/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteJobOpening(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // =============================================
  // ADMIN OFFICES CRUD
  // =============================================
  
  app.get("/api/admin/offices", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const officesList = await storage.getOffices();
      res.json(officesList);
    } catch (error) {
      console.error("Get offices error:", error);
      res.status(500).json({ error: "Failed to fetch offices" });
    }
  });

  app.post("/api/admin/offices", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertOfficeSchema.parse(req.body);
      const office = await storage.createOffice(validatedData);
      res.json(office);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create office error:", error);
      res.status(500).json({ error: "Failed to create office" });
    }
  });

  app.put("/api/admin/offices/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertOfficeSchema.partial().parse(req.body);
      const updated = await storage.updateOffice(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update office error:", error);
      res.status(500).json({ error: "Failed to update office" });
    }
  });

  app.delete("/api/admin/offices/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteOffice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete office error:", error);
      res.status(500).json({ error: "Failed to delete office" });
    }
  });

  // =============================================
  // ADMIN ALLIANCES CRUD
  // =============================================
  
  app.get("/api/admin/alliances", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const alliancesList = await storage.getAlliances();
      res.json(alliancesList);
    } catch (error) {
      console.error("Get alliances error:", error);
      res.status(500).json({ error: "Failed to fetch alliances" });
    }
  });

  app.post("/api/admin/alliances", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAllianceSchema.parse(req.body);
      const alliance = await storage.createAlliance(validatedData);
      res.json(alliance);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create alliance error:", error);
      res.status(500).json({ error: "Failed to create alliance" });
    }
  });

  app.put("/api/admin/alliances/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAllianceSchema.partial().parse(req.body);
      const updated = await storage.updateAlliance(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Alliance not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update alliance error:", error);
      res.status(500).json({ error: "Failed to update alliance" });
    }
  });

  app.delete("/api/admin/alliances/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteAlliance(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Alliance not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete alliance error:", error);
      res.status(500).json({ error: "Failed to delete alliance" });
    }
  });

  // =============================================
  // ADMIN CONTACT SUBMISSIONS
  // =============================================

  app.get("/api/admin/newsletter-subscribers", authMiddleware, requireRole("editor", "admin"), async (_req, res) => {
    try { res.setHeader("Cache-Control", "no-store"); res.json(await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt))); }
    catch { res.status(500).json({ error: "No se pudieron cargar los suscriptores." }); }
  });

  app.get("/api/admin/contact-submissions", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Get contact submissions error:", error);
      res.status(500).json({ error: "Failed to fetch contact submissions" });
    }
  });

  app.patch("/api/admin/contact-submissions/:id/read", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const found = await storage.markContactSubmissionRead(req.params.id);
      if (!found) {
        return res.status(404).json({ error: "Submission not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Mark contact submission read error:", error);
      res.status(500).json({ error: "Failed to update submission" });
    }
  });

  // =============================================
  // ADMIN SPECIALIZED DESKS CRUD
  // =============================================
  
  app.get("/api/admin/desks", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const desksList = await storage.getSpecializedDesks();
      res.json(desksList);
    } catch (error) {
      console.error("Get desks error:", error);
      res.status(500).json({ error: "Failed to fetch desks" });
    }
  });

  app.post("/api/admin/desks", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertSpecializedDeskSchema.parse(req.body);
      const desk = await storage.createSpecializedDesk(validatedData);
      res.json(desk);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Create desk error:", error);
      res.status(500).json({ error: "Failed to create desk" });
    }
  });

  app.put("/api/admin/desks/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertSpecializedDeskSchema.partial().parse(req.body);
      const updated = await storage.updateSpecializedDesk(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Desk not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Update desk error:", error);
      res.status(500).json({ error: "Failed to update desk" });
    }
  });

  app.delete("/api/admin/desks/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteSpecializedDesk(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Desk not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete desk error:", error);
      res.status(500).json({ error: "Failed to delete desk" });
    }
  });

  // =============================================
  // AGENT KNOWLEDGE CRUD (Admin)
  // =============================================

  app.get("/api/admin/knowledge", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const { dbPersistence } = await import('./agents/storage/DatabasePersistence');
      const documents = await dbPersistence.getAllKnowledge();
      res.json(documents);
    } catch (error) {
      console.error("Get knowledge error:", error);
      res.status(500).json({ error: "Failed to fetch knowledge documents" });
    }
  });

  app.post("/api/admin/knowledge", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { category, title, content, agentType, metadata } = req.body;
      if (!category || !title || !content || !agentType) {
        return res.status(400).json({ error: "Missing required fields: category, title, content, agentType" });
      }
      const { dbPersistence } = await import('./agents/storage/DatabasePersistence');
      const document = await dbPersistence.createKnowledge({
        category,
        title,
        content,
        agentType,
        metadata: metadata || {},
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Create knowledge error:", error);
      res.status(500).json({ error: "Failed to create knowledge document" });
    }
  });

  app.put("/api/admin/knowledge/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { category, title, content, agentType, metadata } = req.body;
      const { dbPersistence } = await import('./agents/storage/DatabasePersistence');
      const existing = await dbPersistence.getKnowledge(id);
      if (!existing) {
        return res.status(404).json({ error: "Knowledge document not found" });
      }
      const updated = await dbPersistence.updateKnowledge(id, {
        ...(category && { category }),
        ...(title && { title }),
        ...(content && { content }),
        ...(agentType && { agentType }),
        ...(metadata && { metadata }),
      });
      res.json(updated);
    } catch (error) {
      console.error("Update knowledge error:", error);
      res.status(500).json({ error: "Failed to update knowledge document" });
    }
  });

  app.delete("/api/admin/knowledge/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { dbPersistence } = await import('./agents/storage/DatabasePersistence');
      const existing = await dbPersistence.getKnowledge(id);
      if (!existing) {
        return res.status(404).json({ error: "Knowledge document not found" });
      }
      await dbPersistence.deleteKnowledge(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete knowledge error:", error);
      res.status(500).json({ error: "Failed to delete knowledge document" });
    }
  });

  app.post("/api/admin/knowledge/bulk", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array is required" });
      }
      const { dbPersistence } = await import('./agents/storage/DatabasePersistence');
      let created = 0;
      for (const item of items) {
        if (item.category && item.title && item.content && item.agentType) {
          await dbPersistence.createKnowledge({
            category: item.category,
            title: item.title,
            content: item.content,
            agentType: item.agentType,
            metadata: item.metadata || {},
          });
          created++;
        }
      }
      res.status(201).json({ created, total: items.length });
    } catch (error) {
      console.error("Bulk create knowledge error:", error);
      res.status(500).json({ error: "Failed to bulk create knowledge documents" });
    }
  });

  // =============================================
  // MEDIA ITEMS CRUD
  // =============================================

  // Get all media items
  app.get("/api/admin/media", authMiddleware, async (req: Request, res: Response) => {
    try {
      const kind=req.query.kind;const prefixes:Record<string,string>={image:'image/',video:'video/',document:'application/pdf'};
      if(kind!==undefined&&(typeof kind!=='string'||!Object.hasOwn(prefixes,kind)))return res.status(400).json({error:'Tipo de archivo desconocido.'});
      const items = await mediaInventory();
      res.set('Cache-Control','private, no-store');
      res.json(typeof kind==='string'?items.filter(item=>item.mimeType.startsWith(prefixes[kind])):items);
    } catch (error) {
      console.error("Get media error:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Upload media
  app.post("/api/admin/media/upload", authMiddleware, requireRole("editor", "admin"), receiveMedia, async (req: Request, res: Response) => {
    let objectName: string | null = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uniqueSuffix = crypto.randomBytes(8).toString("hex");
      const extensions: Record<string,string> = { 'image/jpeg':'.jpg', 'image/png':'.png', 'image/gif':'.gif', 'image/webp':'.webp', 'video/mp4':'.mp4', 'video/webm':'.webm', 'application/pdf':'.pdf' };
      const ext = extensions[req.file.mimetype];
      const b = req.file.buffer;
      const valid = ext === '.jpg' ? b[0]===0xff && b[1]===0xd8 && b[2]===0xff
        : ext === '.png' ? b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : ext === '.webp' ? b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP'
        : ext === '.gif' ? /^GIF8[79]a$/.test(b.toString('ascii',0,6))
        : ext === '.pdf' ? b.toString('ascii',0,5)==='%PDF-'
        : ext === '.mp4' ? b.toString('ascii',4,8)==='ftyp'
        : ext === '.webm' ? b.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])) : false;
      if (!valid) return res.status(400).json({error:'El contenido del archivo no coincide con su tipo. Use PNG, JPEG, WebP, GIF, MP4, WebM o PDF.'});
      let contents=req.file.buffer;
      let dimensions:{width?:number;height?:number}={};
      if(req.file.mimetype.startsWith('image/')){
        try{
          const image=sharp(contents,{animated:ext==='.gif',limitInputPixels:40000000}).rotate();
          await image.metadata();
          contents=await (ext==='.jpg'?image.jpeg({quality:92}):ext==='.webp'?image.webp({quality:92}):ext==='.gif'?image.gif():image.png()).toBuffer();
          const resultMetadata=await sharp(contents,{animated:ext==='.gif'}).metadata();
          dimensions={width:resultMetadata.width,height:resultMetadata.pageHeight??resultMetadata.height};
        }catch{return res.status(400).json({error:'La imagen no se puede leer. Exporte un JPG, PNG, WebP o GIF válido y vuelva a intentarlo.'});}
      }
      const filename = `${Date.now()}-${uniqueSuffix}${ext}`;
      objectName = `public/media/${filename}`;
      await uploadAppStorageObject(objectName, contents);

      const mediaItem = await storage.createMediaItem({
        filename,
        originalName: req.file.originalname,
        path: `/media/${objectName}`,
        mimeType: req.file.mimetype,
        size: contents.length,
        ...dimensions,
        uploadedBy: req.adminUser!.id,
        alt: req.body.alt || null,
        altEs: req.body.altEs || null,
      });

      res.status(201).json(mediaItem);
    } catch (error) {
      if (objectName) {
        try {
          await deleteAppStorageObject(objectName);
        } catch (cleanupError) {
          console.error("Upload cleanup error:", cleanupError);
        }
      }
      console.error("Upload media error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Delete media item
  app.delete("/api/admin/media/:id", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const mediaItem = await persistentMediaItem(req.params.id);
      if (!mediaItem) {
        return res.status(404).json({ error: "Media item not found" });
      }

      // Reversible retirement from the picker. Existing pages, older saved versions
      // and other references retain their bytes; restoration is available in Media.
      await db.update(mediaItems).set({archivedAt:new Date()}).where(eq(mediaItems.id,mediaItem.id));
      res.json({ success: true, archived:true });
    } catch (error) {
      console.error("Delete media error:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // =============================================
  // NEWS-TEAM MEMBERS RELATIONSHIP (Admin)
  // =============================================

  // Add a team member to a news article
  app.post("/api/news/:id/team-members", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const newsId = req.params.id;
      const { teamMemberId } = req.body;

      if (!teamMemberId) {
        return res.status(400).json({ error: "teamMemberId is required" });
      }

      const newsItem = await storage.getNewsById(newsId);
      if (!newsItem) {
        return res.status(404).json({ error: "News not found" });
      }

      const teamMember = await storage.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }

      await storage.addTeamMemberToNews(newsId, teamMemberId);
      res.status(201).json({ success: true, message: "Team member added to news article" });
    } catch (error) {
      console.error("Add team member to news error:", error);
      res.status(500).json({ error: "Failed to add team member to news" });
    }
  });

  // Remove a team member from a news article
  app.delete("/api/news/:id/team-members/:teamMemberId", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { id: newsId, teamMemberId } = req.params;

      const newsItem = await storage.getNewsById(newsId);
      if (!newsItem) {
        return res.status(404).json({ error: "News not found" });
      }

      await storage.removeTeamMemberFromNews(newsId, teamMemberId);
      res.json({ success: true, message: "Team member removed from news article" });
    } catch (error) {
      console.error("Remove team member from news error:", error);
      res.status(500).json({ error: "Failed to remove team member from news" });
    }
  });

  // =============================================
  // LEGAL COUNCIL API (Human-in-the-Loop)
  // =============================================

  // POST /api/news/:id/validate - Validate and publish article
  app.post("/api/news/:id/validate", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newsItem = await storage.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ error: "News article not found" });
      }

      // Only allow validation if ready_for_approval
      if (newsItem.processingStatus !== 'ready_for_approval') {
        return res.status(400).json({ 
          error: "Article must be ready for approval before validation",
          currentStatus: newsItem.processingStatus 
        });
      }

      // Check council verdict exists and is approved
      const verdict = newsItem.councilVerdict as any;
      if (!verdict || verdict.overallStatus === 'rejected') {
        return res.status(400).json({ 
          error: "Article was rejected by the Legal Council",
          verdict 
        });
      }

      // Update status to ready (published)
      await storage.updateNews(id, {
        processingStatus: 'ready',
        published: true,
        lastProcessedAt: new Date(),
      });

      res.json({ 
        success: true, 
        message: "Article validated and published successfully",
        newStatus: 'ready'
      });
    } catch (error) {
      console.error("Validate article error:", error);
      res.status(500).json({ error: "Failed to validate article" });
    }
  });

  // POST /api/news/:id/council-review - Re-run council review
  app.post("/api/news/:id/council-review", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newsItem = await storage.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ error: "News article not found" });
      }

      if (!newsItem.content) {
        return res.status(400).json({ error: "Article has no content to review" });
      }

      // Import and run Legal Council
      const { legalCouncilService } = await import('../services/agents/LegalCouncilService');
      const verdict = await legalCouncilService.evaluateArticle(newsItem.content);

      // Update article with new verdict
      const newStatus = verdict.overallStatus === 'rejected' ? 'failed' : 'ready_for_approval';
      await storage.updateNews(id, {
        councilVerdict: verdict,
        processingStatus: newStatus,
        lastProcessedAt: new Date(),
        failedStep: verdict.overallStatus === 'rejected' ? 'council' : null,
      });

      res.json({ 
        success: true, 
        verdict,
        newStatus
      });
    } catch (error) {
      console.error("Council review error:", error);
      res.status(500).json({ error: "Failed to run council review" });
    }
  });

  // =============================================
  // TRANSLATION API (AI-powered)
  // =============================================

  // GET /api/languages - Get list of supported languages
  app.get("/api/languages", (_req, res) => {
    res.json(SUPPORTED_LANGUAGES);
  });

  // POST /api/translate - Translate single text
  app.post("/api/translate", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;

      if (!text || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: text, sourceLanguage, targetLanguage" 
        });
      }

      const validCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(sourceLanguage) || !validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid language code" });
      }

      const translation = await translateLegalText(
        text,
        sourceLanguage as LanguageCode,
        targetLanguage as LanguageCode
      );

      res.json({ translation, sourceLanguage, targetLanguage });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // POST /api/translate/batch - Translate multiple texts
  app.post("/api/translate/batch", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { texts, sourceLanguage, targetLanguage } = req.body;

      if (!texts || !Array.isArray(texts) || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: texts (array), sourceLanguage, targetLanguage" 
        });
      }

      const validCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(sourceLanguage) || !validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid language code" });
      }

      const translations = await translateMultipleTexts(
        texts,
        sourceLanguage as LanguageCode,
        targetLanguage as LanguageCode
      );

      res.json({ translations, sourceLanguage, targetLanguage });
    } catch (error) {
      console.error("Batch translation error:", error);
      res.status(500).json({ error: "Failed to translate texts" });
    }
  });

  // POST /api/translate/suggest - Suggest translation for blog post
  app.post("/api/translate/suggest", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { originalText, existingTranslations, targetLanguage } = req.body;

      if (!originalText || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: originalText, targetLanguage" 
        });
      }

      const validCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid target language code" });
      }

      const result = await suggestTranslation(
        originalText,
        existingTranslations || {},
        targetLanguage as LanguageCode
      );

      res.json({ ...result, targetLanguage });
    } catch (error) {
      console.error("Translation suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest translation" });
    }
  });

  // =============================================
  // TRANSLATION CACHE API
  // =============================================

  // GET /api/translations/:contentType/:entityId/:targetLanguage - Get all cached translations for an entity
  app.get("/api/translations/:contentType/:entityId/:targetLanguage", async (req: Request, res: Response) => {
    try {
      const { contentType, entityId, targetLanguage } = req.params;

      const validCodes: string[] = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid target language code" });
      }

      // Solo de contenido público (getEntity): nada de notas no públicas ni personas sin ficha
      const entity = await getEntity(contentType, entityId);
      if (!entity) {
        return res.json({ translations: {}, contentType, entityId, targetLanguage });
      }

      // For news content, first check the newsTranslations table
      if (contentType === 'news') {
        const newsTranslation = await storage.getNewsTranslation(entityId, targetLanguage);
        if (newsTranslation) {
          const translationsMap: Record<string, string> = {};
          if (newsTranslation.title) {
            translationsMap.title = newsTranslation.title;
          }
          if (newsTranslation.excerpt) {
            translationsMap.excerpt = newsTranslation.excerpt;
          }
          if (newsTranslation.content) {
            translationsMap.content = newsTranslation.content;
          }
          
          // Return if we found any translations
          if (Object.keys(translationsMap).length > 0) {
            return res.json({ translations: translationsMap, contentType, entityId, targetLanguage });
          }
        }
      }

      // Fall back to translationCache lookup
      const translations = await storage.getTranslations(contentType, entityId, targetLanguage);
      
      // Solo los campos públicos del tipo (validFieldsByContentType) y solo si la traducción es
      // del texto publicado hoy: la caché puede guardar otros campos o textos ya cambiados
      // (p. ej. tras actualizar los textos de la semilla o editar en el panel)
      const publicFields = validFieldsByContentType[contentType] ?? [];
      const translationsMap: Record<string, string> = {};
      for (const t of translations) {
        if (
          t.field &&
          t.translatedText &&
          publicFields.includes(t.field) &&
          isPublicSourceText(entity, t.field, t.sourceText)
        ) {
          translationsMap[t.field] = t.translatedText;
        }
      }

      res.json({ translations: translationsMap, contentType, entityId, targetLanguage });
    } catch (error) {
      console.error("Get translations error:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  // Public translation endpoints only translate text that already exists in the CMS,
  // so anonymous visitors cannot spend the AI budget on arbitrary text.
  // Solo contenido público (J1–J3): una persona que el sitio no nombra, una nota no pública y
  // los eventos y asuntos retirados no se traducen ni devuelven traducciones guardadas.
  // L6: se devuelve lo que el sitio publica, no el registro entero: el DTO público de la nota
  // (toPublicNews) y el perfil público de la persona (toPublicTeamProfile); las prácticas e
  // industrias ya se publican completas en /api/practice-groups y /api/industry-groups.
  async function getEntity(contentType: string, entityId: string): Promise<Record<string, unknown> | undefined> {
    switch (contentType) {
      case "team_member": {
        const member = await storage.getTeamMemberById(entityId);
        return member && isNamedOnTeamPage(member) ? toPublicTeamProfile(member) : undefined;
      }
      case "practice_group": {
        const group = await storage.getPracticeGroupById(entityId);
        return group && group.published !== false ? group : undefined;
      }
      case "industry_group": return await storage.getIndustryGroupById(entityId);
      case "news": {
        const item = await storage.getNewsById(entityId);
        return item && isPublicNews(item) ? toPublicNews(item) : undefined;
      }
    }
    return undefined;
  }

  // Campos que se traducen de cada tipo, en /api/translate-content y /api/translate-entity (L6)
  const validFieldsByContentType: Record<string, readonly string[]> = {
    team_member: ['title', 'role', 'bio', 'degree'],
    practice_group: ['name', 'description', 'fullDescription'],
    industry_group: ['name', 'description', 'fullDescription'],
    news: ['title', 'excerpt', 'content'],
    event: ['title', 'description', 'location'],
    representative_matter: ['title', 'description', 'client'],
  };

  // Texto de origen admitido para un campo (L6): su valor publicado, entity[field], o el de su
  // gemelo en español (field + "Es"): varias pantallas mandan el español bajo la clave inglesa
  // (NewsSection, la ficha del equipo). Ni otros campos ni valores internos. Alternar los dos
  // textos falla la caché, pero cada fallo gasta una llamada del límite por dirección (N1).
  function isPublicSourceText(entity: Record<string, unknown>, field: string, text: unknown): text is string {
    if (typeof text !== "string" || !text.trim()) return false;
    return entity[field] === text || entity[`${field}Es`] === text;
  }

  // Gasto de IA de las rutas públicas de traducción (N1).
  // - Una sola llamada por clave en curso: las peticiones simultáneas de la misma traducción
  //   (tipo|id|campo|idioma, con el mismo texto de origen) esperan la misma promesa, que
  //   traduce y guarda. Al terminar bien, la entrada se queda unos segundos para que una
  //   petición que leyó la caché justo antes del guardado no repita la llamada.
  // - Límite por dirección (la clave de mejor esfuerzo de los formularios): 30 llamadas reales
  //   cada 10 minutos, 429 al pasarse. Solo cuentan los fallos de caché que llaman a la IA; las
  //   respuestas desde la caché o desde una llamada ya en curso no cuentan.
  const TRANSLATE_MAX_AI_CALLS_PER_IP = 30;
  const allowTranslationCall = createFormLimiter(TRANSLATE_MAX_AI_CALLS_PER_IP);
  const TRANSLATION_LINGER_MS = 30 * 1000;
  type SharedTranslation = { sourceText: string; promise: Promise<string | undefined> };
  const translationsInFlight = new Map<string, SharedTranslation>();
  const translationKey = (contentType: string, entityId: string, field: string, targetLanguage: string) =>
    `${contentType}|${entityId}|${field}|${targetLanguage}`;
  const translationInFlight = (key: string, sourceText: string) => {
    const shared = translationsInFlight.get(key);
    return shared && shared.sourceText === sourceText ? shared.promise : undefined;
  };
  // run() traduce y guarda; devuelve undefined si la IA no trajo texto para ese campo
  function shareTranslation(key: string, sourceText: string, run: () => Promise<string | undefined>) {
    const shared: SharedTranslation = { sourceText, promise: run() };
    translationsInFlight.set(key, shared);
    const forget = () => {
      if (translationsInFlight.get(key) === shared) translationsInFlight.delete(key);
    };
    shared.promise.then(
      (text) => (text === undefined ? forget() : setTimeout(forget, TRANSLATION_LINGER_MS).unref()),
      forget,
    );
    return shared.promise;
  }
  const tooManyTranslations = (res: Response) =>
    res.status(429).json({ error: "Too many requests. Please try again later." });

  // POST /api/translate-content - Translate single content and cache it
  app.post("/api/translate-content", async (req: Request, res: Response) => {
    try {
      const { contentType, entityId, field, sourceText, sourceLanguage, targetLanguage } = req.body;

      if (!contentType || !entityId || !field || !sourceText || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: contentType, entityId, field, sourceText, sourceLanguage, targetLanguage" 
        });
      }

      const validCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(sourceLanguage) || !validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid language code" });
      }

      const validFields = Object.hasOwn(validFieldsByContentType, contentType)
        ? validFieldsByContentType[contentType]
        : [];
      if (!validFields.includes(field)) {
        return res.status(400).json({ error: "Invalid field name" });
      }

      const entity = await getEntity(contentType, entityId);
      if (!entity || !isPublicSourceText(entity, field, sourceText)) {
        return res.status(400).json({ error: "Source text does not match published content" });
      }
      const existingTranslation = await storage.getTranslation(contentType, entityId, field, targetLanguage);
      if (existingTranslation && existingTranslation.sourceText === sourceText) {
        return res.json({ 
          translation: existingTranslation.translatedText, 
          cached: true,
          contentType, 
          entityId, 
          field, 
          targetLanguage 
        });
      }

      // Fallo de caché: se une a la llamada en curso o, si no hay, gasta una del límite (N1)
      const key = translationKey(contentType, entityId, field, targetLanguage);
      let pending = translationInFlight(key, sourceText);
      if (!pending) {
        if (!allowTranslationCall(clientIp(req))) return tooManyTranslations(res);
        pending = shareTranslation(key, sourceText, async () => {
          const translatedText = await translateLegalText(
            sourceText,
            sourceLanguage as LanguageCode,
            targetLanguage as LanguageCode
          );
          const saved = await storage.saveTranslation({
            contentType,
            entityId,
            field,
            sourceLanguage,
            targetLanguage,
            sourceText,
            translatedText,
          });
          return saved.translatedText ?? translatedText;
        });
      }
      const translatedText = await pending;

      res.json({ 
        translation: translatedText ?? sourceText, 
        cached: false,
        contentType, 
        entityId, 
        field, 
        targetLanguage 
      });
    } catch (error) {
      console.error("Translate content error:", error);
      res.status(500).json({ error: "Failed to translate content" });
    }
  });

  // POST /api/translate-entity - Batch translate all translatable fields for an entity
  app.post("/api/translate-entity", async (req: Request, res: Response) => {
    try {
      const { contentType, entityId, fields, sourceLanguage, targetLanguage } = req.body;

      if (!contentType || !entityId || !fields || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: contentType, entityId, fields, sourceLanguage, targetLanguage" 
        });
      }

      const validContentTypes = ['team_member', 'practice_group', 'industry_group', 'news', 'event', 'representative_matter'] as const;
      if (!validContentTypes.includes(contentType)) {
        return res.status(400).json({ 
          error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}` 
        });
      }

      const validFields = validFieldsByContentType[contentType] || [];
      const submittedFields = Object.keys(fields as Record<string, string>);
      const invalidFields = submittedFields.filter(f => !validFields.includes(f));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({ 
          error: `Invalid field names for ${contentType}: ${invalidFields.join(', ')}. Valid fields are: ${validFields.join(', ')}` 
        });
      }

      const validCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      if (!validCodes.includes(sourceLanguage) || !validCodes.includes(targetLanguage)) {
        return res.status(400).json({ error: "Invalid language code" });
      }

      const entity = await getEntity(contentType, entityId);
      if (!entity) {
        return res.status(404).json({ error: "Content not found" });
      }
      const fieldsToTranslate: { key: string; text: string }[] = [];
      const cachedTranslations: Record<string, string> = {};
      // Campos que ya traduce otra petición en este momento (N1): se espera su resultado
      const sharedFields: { key: string; promise: Promise<string | undefined> }[] = [];

      for (const [fieldName, text] of Object.entries(fields as Record<string, string>)) {
        if (!text || typeof text !== 'string' || !text.trim()) continue;
        if (!isPublicSourceText(entity, fieldName, text)) continue;

        // The CMS already stores English in the base field next to its *Es twin; serve it without calling the AI.
        const englishText = entity[fieldName];
        if (targetLanguage === 'en' && typeof englishText === 'string' && englishText.trim() && entity[`${fieldName}Es`]) {
          cachedTranslations[fieldName] = englishText;
          continue;
        }

        const existingTranslation = await storage.getTranslation(contentType, entityId, fieldName, targetLanguage);
        if (existingTranslation && existingTranslation.sourceText === text && existingTranslation.translatedText) {
          cachedTranslations[fieldName] = existingTranslation.translatedText;
        } else {
          const inFlight = translationInFlight(translationKey(contentType, entityId, fieldName, targetLanguage), text);
          if (inFlight) sharedFields.push({ key: fieldName, promise: inFlight });
          else fieldsToTranslate.push({ key: fieldName, text });
        }
      }

      // Los campos sin caché ni llamada en curso van en una sola llamada a la IA, que cuenta
      // una vez en el límite de la dirección; cada campo queda compartido mientras dura
      if (fieldsToTranslate.length > 0) {
        if (!allowTranslationCall(clientIp(req))) return tooManyTranslations(res);
        const batch = (async () => {
          const result = await translateMultipleTexts(
            fieldsToTranslate,
            sourceLanguage as LanguageCode,
            targetLanguage as LanguageCode
          );
          const saved: Record<string, string> = {};
          for (const { key, text } of fieldsToTranslate) {
            const translatedText = result?.[key];
            if (typeof translatedText !== 'string' || !translatedText.trim()) continue;
            await storage.saveTranslation({
              contentType,
              entityId,
              field: key,
              sourceLanguage,
              targetLanguage,
              sourceText: text,
              translatedText,
            });
            saved[key] = translatedText;
          }
          return saved;
        })();
        for (const { key, text } of fieldsToTranslate) {
          sharedFields.push({
            key,
            promise: shareTranslation(translationKey(contentType, entityId, key, targetLanguage), text, async () => (await batch)[key]),
          });
        }
      }

      const newTranslations: Record<string, string> = {};
      const sharedResults = await Promise.all(sharedFields.map((shared) => shared.promise));
      sharedFields.forEach(({ key }, index) => {
        const translatedText = sharedResults[index];
        if (translatedText !== undefined) newTranslations[key] = translatedText;
      });

      const allTranslations = { ...cachedTranslations, ...newTranslations };

      res.json({ 
        translations: allTranslations, 
        contentType, 
        entityId, 
        targetLanguage,
        cachedCount: Object.keys(cachedTranslations).length,
        translatedCount: Object.keys(newTranslations).length,
      });
    } catch (error) {
      console.error("Translate entity error:", error);
      res.status(500).json({ error: "Failed to translate entity" });
    }
  });

  // =============================================
  // ARTICLE PROCESSING PIPELINE (AI Translation)
  // =============================================

  // Generate image for article
  app.post("/api/agents/generate-image/:articleId", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { articleId } = req.params;
      
      const article = await storage.getNewsById(articleId);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      // Use ImageSuggestionAgent
      const { imageSuggestionAgent } = await import('./agents');
      const context = {
        jobId: `img-${articleId}-${Date.now()}`,
        agentType: 'image_suggestion' as any,
        startTime: new Date(),
        metadata: { articleId },
      };

      const result = await imageSuggestionAgent.execute(context, { articleId });

      if (result.success && result.data) {
        res.json({
          success: true,
          ...result.data,
        });
      } else {
        res.status(500).json({ error: result.error || "Failed to generate image" });
      }
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Process single article - FULL RAG AGENTIC PIPELINE
  // Runs ALL agents in sequence: Format → Categorize → Link Metadata → SEO → Translate → Image
  app.post("/api/agents/pipeline/:articleId", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { articleId } = req.params;
      const { generateImage = false } = req.body;
      
      const article = await storage.getNewsById(articleId);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const { 
        formatterAgent, 
        categoryAgent, 
        metadataLinkerAgent, 
        seoOptimizerAgent, 
        polyglotTranslatorAgent,
        imageSuggestionAgent 
      } = await import('./agents');

      const createContext = (agentType: string) => ({
        jobId: `${agentType}-${articleId}-${Date.now()}`,
        agentType: agentType as any,
        startTime: new Date(),
        metadata: { articleId },
      });

      const pipelineResults: Record<string, any> = {
        articleId,
        steps: {},
        success: true,
        errors: [],
      };

      const totalSteps = generateImage ? 6 : 5;
      const completedSteps = new Set<string>();

      // Helper to broadcast progress - only count unique step completions
      const emitProgress = (step: string, status: 'running' | 'completed' | 'error', language?: string, message?: string) => {
        let progress = 0;
        if (status === 'completed' && !completedSteps.has(step)) {
          completedSteps.add(step);
        }
        progress = Math.round((completedSteps.size / totalSteps) * 100);
        
        broadcastPipelineProgress(articleId, {
          step,
          status,
          language,
          progress,
          message,
        });
      };

      // Step 1: FORMAT - Clean and structure the article text
      console.log(`[Pipeline] Step 1: Formatting article ${articleId}`);
      emitProgress('format', 'running', undefined, 'Cleaning article text...');
      try {
        const formatResult = await formatterAgent.execute(
          createContext('formatter'),
          { articleId }
        );
        pipelineResults.steps.format = { 
          success: formatResult.success, 
          data: formatResult.data,
          error: formatResult.error 
        };
        emitProgress('format', formatResult.success ? 'completed' : 'error', undefined, formatResult.success ? 'Article formatted' : formatResult.error);
      } catch (err: any) {
        pipelineResults.steps.format = { success: false, error: err.message };
        pipelineResults.errors.push(`Format: ${err.message}`);
        emitProgress('format', 'error', undefined, err.message);
      }

      // Step 2: CATEGORIZE - Automatically categorize for SEO
      console.log(`[Pipeline] Step 2: Categorizing article ${articleId}`);
      emitProgress('categorize', 'running', undefined, 'Categorizing article...');
      try {
        const categoryResult = await categoryAgent.execute(
          createContext('category_agent'),
          { articleId }
        );
        pipelineResults.steps.categorize = { 
          success: categoryResult.success, 
          data: categoryResult.data,
          error: categoryResult.error 
        };
        emitProgress('categorize', categoryResult.success ? 'completed' : 'error', undefined, 
          categoryResult.success ? `Category: ${(categoryResult.data as any)?.primaryCategory || 'assigned'}` : categoryResult.error);
      } catch (err: any) {
        pipelineResults.steps.categorize = { success: false, error: err.message };
        pipelineResults.errors.push(`Categorize: ${err.message}`);
        emitProgress('categorize', 'error', undefined, err.message);
      }

      // Step 3: LINK METADATA - Connect to authors, practice areas, industries
      console.log(`[Pipeline] Step 3: Linking metadata for article ${articleId}`);
      emitProgress('metadata', 'running', undefined, 'Linking authors and practice areas...');
      try {
        const metadataResult = await metadataLinkerAgent.execute(
          createContext('metadata_linker'),
          { articleId }
        );
        pipelineResults.steps.metadata = { 
          success: metadataResult.success, 
          data: metadataResult.data,
          error: metadataResult.error 
        };
        emitProgress('metadata', metadataResult.success ? 'completed' : 'error', undefined, 
          metadataResult.success ? 'Metadata linked' : metadataResult.error);
      } catch (err: any) {
        pipelineResults.steps.metadata = { success: false, error: err.message };
        pipelineResults.errors.push(`Metadata: ${err.message}`);
        emitProgress('metadata', 'error', undefined, err.message);
      }

      // Step 4: SEO OPTIMIZE - Improve titles, descriptions, slugs
      console.log(`[Pipeline] Step 4: SEO optimizing article ${articleId}`);
      emitProgress('seo', 'running', undefined, 'Optimizing for SEO...');
      try {
        const seoResult = await seoOptimizerAgent.execute(
          createContext('seo_optimizer'),
          { articleId }
        );
        pipelineResults.steps.seo = { 
          success: seoResult.success, 
          data: seoResult.data,
          error: seoResult.error 
        };
        emitProgress('seo', seoResult.success ? 'completed' : 'error', undefined, 
          seoResult.success ? 'SEO optimized' : seoResult.error);
      } catch (err: any) {
        pipelineResults.steps.seo = { success: false, error: err.message };
        pipelineResults.errors.push(`SEO: ${err.message}`);
        emitProgress('seo', 'error', undefined, err.message);
      }

      // Step 5: TRANSLATE - Translate to all 9 target languages (source is Spanish)
      const targetLanguages = ['en', 'de', 'zh', 'ko', 'ja', 'ar', 'ru', 'fr', 'it'];
      console.log(`[Pipeline] Step 5: Translating article ${articleId} to ${targetLanguages.length} languages`);
      emitProgress('translate', 'running', undefined, `Translating to ${targetLanguages.length} languages...`);
      
      try {
        const translateResult = await polyglotTranslatorAgent.execute(
          createContext('polyglot_translator'),
          { articleId }
        );
        pipelineResults.steps.translate = { 
          success: translateResult.success, 
          data: translateResult.data,
          error: translateResult.error 
        };
        
        const translatedCount = (translateResult.data as any)?.translatedCount || 0;
        const cachedCount = (translateResult.data as any)?.cachedCount || 0;
        emitProgress('translate', translateResult.success ? 'completed' : 'error', undefined, 
          translateResult.success 
            ? `Translated: ${translatedCount} new, ${cachedCount} cached` 
            : translateResult.error);
      } catch (err: any) {
        pipelineResults.steps.translate = { success: false, error: err.message };
        pipelineResults.errors.push(`Translate: ${err.message}`);
        emitProgress('translate', 'error', undefined, err.message);
      }

      // Step 6: GENERATE IMAGE (optional)
      if (generateImage) {
        console.log(`[Pipeline] Step 6: Generating image for article ${articleId}`);
        emitProgress('image', 'running', undefined, 'Generating article image with DALL-E...');
        try {
          const imageResult = await imageSuggestionAgent.execute(
            createContext('image_suggestion'),
            { articleId }
          );
          pipelineResults.steps.image = { 
            success: imageResult.success, 
            data: imageResult.data,
            error: imageResult.error 
          };
          emitProgress('image', imageResult.success ? 'completed' : 'error', undefined, 
            imageResult.success ? 'Image generated' : imageResult.error);
        } catch (err: any) {
          pipelineResults.steps.image = { success: false, error: err.message };
          pipelineResults.errors.push(`Image: ${err.message}`);
          emitProgress('image', 'error', undefined, err.message);
        }
      }

      // Calculate overall success - IMAGE FAILURES DO NOT FAIL THE PIPELINE
      // Core steps: format, categorize, metadata, seo, translate
      // Optional step: image (failure = warning, not error)
      const coreStepKeys = ['format', 'categorize', 'metadata', 'seo', 'translate'];
      const coreSteps = coreStepKeys
        .filter(key => pipelineResults.steps[key])
        .map(key => ({ key, ...pipelineResults.steps[key] }));
      
      const successfulCoreSteps = coreSteps.filter(s => s.success).length;
      const totalCoreSteps = coreSteps.length;
      
      // Image is optional - its failure is a warning, not an error
      const imageStep = pipelineResults.steps.image;
      const imageWarning = imageStep && !imageStep.success;
      
      const stepResults = Object.values(pipelineResults.steps) as any[];
      const successfulSteps = stepResults.filter(s => s.success).length;
      pipelineResults.successfulSteps = successfulSteps;
      pipelineResults.totalSteps = stepResults.length;
      
      // SUCCESS = all core steps passed (image failure is acceptable)
      pipelineResults.success = successfulCoreSteps === totalCoreSteps;
      pipelineResults.partialSuccess = pipelineResults.success && imageWarning;
      pipelineResults.imageWarning = imageWarning ? (imageStep?.error || 'Image generation failed') : null;

      console.log(`[Pipeline] Completed: ${successfulCoreSteps}/${totalCoreSteps} core steps successful${imageWarning ? ' (image warning)' : ''}`);
      
      // Broadcast completion
      broadcastPipelineProgress(articleId, {
        step: 'complete',
        status: 'completed',
        progress: 100,
        message: `Pipeline complete: ${successfulSteps}/${stepResults.length} steps successful`,
        data: pipelineResults,
      });

      res.json(pipelineResults);
    } catch (error: any) {
      console.error("Pipeline error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to process article pipeline" 
      });
    }
  });

  // Process all articles - FULL RAG AGENTIC PIPELINE for all articles
  app.post("/api/agents/pipeline/process-all", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const allNews = await storage.getNews();
      
      if (!allNews || allNews.length === 0) {
        return res.json({ success: true, total: 0, successful: 0, message: "No articles to process" });
      }

      const { generateImage = false } = req.body;
      const { 
        formatterAgent, 
        categoryAgent, 
        metadataLinkerAgent, 
        seoOptimizerAgent, 
        polyglotTranslatorAgent,
        imageSuggestionAgent 
      } = await import('./agents');

      const createContext = (agentType: string, articleId: string) => ({
        jobId: `${agentType}-${articleId}-${Date.now()}`,
        agentType: agentType as any,
        startTime: new Date(),
        metadata: { articleId },
      });

      let successfulCount = 0;
      const results: Record<string, any>[] = [];

      for (const article of allNews) {
        console.log(`[Pipeline] Processing article ${article.id}: ${article.titleEs?.substring(0, 50)}...`);
        const articleResult: Record<string, any> = { 
          articleId: article.id, 
          title: article.titleEs,
          steps: {},
          success: false 
        };

        try {
          // Step 1: FORMAT
          try {
            const formatResult = await formatterAgent.execute(
              createContext('formatter', article.id),
              { articleId: article.id }
            );
            articleResult.steps.format = { success: formatResult.success };
          } catch (err: any) {
            console.error(`[Pipeline] Format error for ${article.id}:`, err.message);
            articleResult.steps.format = { success: false, error: err.message };
          }

          // Step 2: CATEGORIZE
          try {
            const categoryResult = await categoryAgent.execute(
              createContext('category_agent', article.id),
              { articleId: article.id }
            );
            articleResult.steps.categorize = { success: categoryResult.success };
          } catch (err: any) {
            console.error(`[Pipeline] Categorize error for ${article.id}:`, err.message);
            articleResult.steps.categorize = { success: false, error: err.message };
          }

          // Step 3: METADATA
          try {
            const metadataResult = await metadataLinkerAgent.execute(
              createContext('metadata_linker', article.id),
              { articleId: article.id }
            );
            articleResult.steps.metadata = { success: metadataResult.success };
          } catch (err: any) {
            console.error(`[Pipeline] Metadata error for ${article.id}:`, err.message);
            articleResult.steps.metadata = { success: false, error: err.message };
          }

          // Step 4: SEO
          try {
            const seoResult = await seoOptimizerAgent.execute(
              createContext('seo_optimizer', article.id),
              { articleId: article.id }
            );
            articleResult.steps.seo = { success: seoResult.success };
          } catch (err: any) {
            console.error(`[Pipeline] SEO error for ${article.id}:`, err.message);
            articleResult.steps.seo = { success: false, error: err.message };
          }

          // Step 5: TRANSLATE
          try {
            const translateResult = await polyglotTranslatorAgent.execute(
              createContext('polyglot_translator', article.id),
              { articleId: article.id }
            );
            articleResult.steps.translate = { success: translateResult.success };
          } catch (err: any) {
            console.error(`[Pipeline] Translate error for ${article.id}:`, err.message);
            articleResult.steps.translate = { success: false, error: err.message };
          }

          // Step 6: IMAGE (optional)
          if (generateImage) {
            try {
              console.log(`[Pipeline] Starting image generation for ${article.id}...`);
              const imageResult = await imageSuggestionAgent.execute(
                createContext('image_suggestion', article.id),
                { articleId: article.id }
              );
              console.log(`[Pipeline] Image result for ${article.id}:`, imageResult.success ? 'SUCCESS' : imageResult.error);
              articleResult.steps.image = { success: imageResult.success, error: imageResult.error };
            } catch (err: any) {
              console.error(`[Pipeline] Image generation error for ${article.id}:`, err.message);
              articleResult.steps.image = { success: false, error: err.message };
            }
          }

          articleResult.success = true;
          successfulCount++;
        } catch (error) {
          console.error(`Error processing article ${article.id}:`, error);
        }

        results.push(articleResult);
      }

      res.json({
        success: true,
        total: allNews.length,
        successful: successfulCount,
        message: `Processed ${successfulCount} of ${allNews.length} articles`,
      });
    } catch (error) {
      console.error("Batch processing error:", error);
      res.status(500).json({ error: "Failed to process articles" });
    }
  });

  // Auto-Recovery Agent - Repairs failed articles with smart retry logic
  app.post("/api/agents/recover", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      console.log('[Recovery] Starting auto-recovery for failed articles...');
      const { recoverFailedItems, getFailedArticlesSummary } = await import('./agents/AutoRecoveryAgent');
      
      const summary = await getFailedArticlesSummary();
      console.log(`[Recovery] Found ${summary.total} failed articles`);
      
      if (summary.total === 0) {
        return res.json({
          success: true,
          message: 'No failed articles to recover',
          recovered: 0,
          stillFailed: 0
        });
      }
      
      const report = await recoverFailedItems();
      
      res.json({
        success: true,
        message: `Recovery complete: ${report.totalRecovered}/${report.totalFailed} articles recovered`,
        recovered: report.totalRecovered,
        stillFailed: report.totalStillFailed,
        results: report.results
      });
    } catch (error: any) {
      console.error('[Recovery] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Recovery failed' 
      });
    }
  });

  // Get failed articles summary for diagnostics
  app.get("/api/agents/failed-summary", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { getFailedArticlesSummary } = await import('./agents/AutoRecoveryAgent');
      const summary = await getFailedArticlesSummary();
      res.json({ success: true, ...summary });
    } catch (error: any) {
      console.error('[FailedSummary] Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // System Chronicler API - Nerve Center data. Solo con sesión del panel (L4): son datos
  // internos del proceso de notas y del CMS que ninguna página pública lee.
  app.get("/api/system/chronicler", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { systemChronicler } = await import('./agents/SystemChronicler');
      
      const agents = systemChronicler.getAllAgents();
      const timeline = systemChronicler.getEvolutionTimeline();
      const stats = systemChronicler.getSystemStats();
      
      res.json({
        success: true,
        agents,
        timeline,
        stats,
        categories: {
          brain: systemChronicler.getAgentsByCategory("brain"),
          hands: systemChronicler.getAgentsByCategory("hands"),
          shield: systemChronicler.getAgentsByCategory("shield")
        }
      });
    } catch (error: any) {
      console.error('[SystemChronicler] Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Record evolution event (admin only)
  app.post("/api/system/chronicler/evolution", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { systemChronicler } = await import('./agents/SystemChronicler');
      const { title, description, agentId, impact, category } = req.body;
      
      if (!title || !description || !impact || !category) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: title, description, impact, category' 
        });
      }
      
      systemChronicler.recordEvolution({
        title,
        description,
        agentId,
        impact,
        category
      });
      
      res.json({ success: true, message: 'Evolution recorded' });
    } catch (error: any) {
      console.error('[SystemChronicler] Error recording evolution:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Website Audit API routes
  app.get("/api/audits", authMiddleware, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const audits = await storage.getWebsiteAudits(limit);
      res.json({ success: true, audits });
    } catch (error) {
      console.error("Failed to get audits:", error);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.get("/api/audits/latest", authMiddleware, async (req: Request, res: Response) => {
    try {
      const audit = await storage.getLatestWebsiteAudit();
      if (!audit) {
        return res.json({ success: true, audit: null });
      }
      const findings = await storage.getWebsiteAuditFindings(audit.id);
      res.json({ success: true, audit, findings });
    } catch (error) {
      console.error("Failed to get latest audit:", error);
      res.status(500).json({ error: "Failed to fetch latest audit" });
    }
  });

  app.get("/api/audits/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const audit = await storage.getWebsiteAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      const findings = await storage.getWebsiteAuditFindings(audit.id);
      res.json({ success: true, audit, findings });
    } catch (error) {
      console.error("Failed to get audit:", error);
      res.status(500).json({ error: "Failed to fetch audit" });
    }
  });

  app.get("/api/audits/:id/findings", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { category, severity } = req.query;
      let findings;
      
      if (category) {
        findings = await storage.getWebsiteAuditFindingsByCategory(req.params.id, category as string);
      } else if (severity) {
        findings = await storage.getWebsiteAuditFindingsBySeverity(req.params.id, severity as string);
      } else {
        findings = await storage.getWebsiteAuditFindings(req.params.id);
      }
      
      res.json({ success: true, findings });
    } catch (error) {
      console.error("Failed to get audit findings:", error);
      res.status(500).json({ error: "Failed to fetch findings" });
    }
  });

  app.post("/api/audits/run", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { runType = 'full', skipModules } = req.body;
      
      const { orchestrator } = await import('./agents');
      
      const job = await orchestrator.enqueueJob(
        'website_auditor',
        {
          runType,
          skipModules,
          triggeredBy: 'manual',
        },
        { priority: 'high' }
      );
      
      if (!orchestrator.isProcessing()) {
        orchestrator.start();
      }
      
      res.json({ 
        success: true, 
        jobId: job.id,
        message: 'Audit job queued successfully. Check audit history for results.',
      });
    } catch (error) {
      console.error("Failed to run audit:", error);
      res.status(500).json({ error: "Failed to run audit" });
    }
  });

  app.get("/api/audits/findings/open", authMiddleware, async (req: Request, res: Response) => {
    try {
      const findings = await storage.getOpenFindings();
      res.json({ success: true, findings });
    } catch (error) {
      console.error("Failed to get open findings:", error);
      res.status(500).json({ error: "Failed to fetch open findings" });
    }
  });

  // System Health Check - Deep Audit API. Solo con sesión del panel (L2): el informe nombra
  // personas, borradores y el estado de las traducciones. Mismos roles que reset-zombies; para
  // saber si el servidor está vivo sin sesión queda /healthz.
  app.get("/api/health-check/run", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { systemHealthCheck } = await import('./agents/SystemHealthCheck');
      const report = await systemHealthCheck.runDeepAudit();
      res.json({ 
        success: true, 
        report,
        humanReadable: systemHealthCheck.generateHumanReport(report),
      });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({ error: error.message || "Failed to run health check" });
    }
  });

  app.post("/api/health-check/reset-zombies", authMiddleware, requireRole("editor", "admin"), async (req: Request, res: Response) => {
    try {
      const { systemHealthCheck } = await import('./agents/SystemHealthCheck');
      const resetCount = await systemHealthCheck.resetZombieJobs();
      res.json({ 
        success: true, 
        message: `Reset ${resetCount} zombie jobs`,
        resetCount,
      });
    } catch (error: any) {
      console.error("Failed to reset zombies:", error);
      res.status(500).json({ error: error.message || "Failed to reset zombie jobs" });
    }
  });

  app.patch("/api/audits/findings/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { status, resolvedBy } = req.body;
      
      if (status === 'resolved') {
        const finding = await storage.resolveWebsiteAuditFinding(req.params.id, resolvedBy || 'manual');
        return res.json({ success: true, finding });
      }
      
      const finding = await storage.updateWebsiteAuditFinding(req.params.id, { status });
      res.json({ success: true, finding });
    } catch (error) {
      console.error("Failed to update finding:", error);
      res.status(500).json({ error: "Failed to update finding" });
    }
  });

  if (agentsEnabled) {
    // Agent system routes
    const agentRoutes = await import('./agents/api/agentRoutes');
    app.use('/api/agents', authMiddleware, requireRole("editor", "admin"), agentRoutes.default);

    // Initialize agents on server start
    const { initializeAgents } = await import('./agents');
    initializeAgents().catch(err => console.error('[Agents] Initialization error:', err));
  }

  return httpServer;
}
