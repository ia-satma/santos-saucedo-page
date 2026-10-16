import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { orchestrator } from "./agents/core/AgentOrchestrator";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

app.use(compression());

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));

let applicationReady = false;

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, service: "santos-saucedo" });
});

app.get("/readyz", (_req, res) => {
  if (!applicationReady) {
    res.status(503).json({ ok: false, ready: false });
    return;
  }
  res.status(200).json({ ok: true, ready: true });
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Registro de peticiones /api (L12). En producción solo método, ruta, estado y duración: el
// cuerpo de la respuesta puede llevar datos del CMS, de contactos o de la sesión. En desarrollo
// se añade el cuerpo recortado a 200 caracteres, con tokens, contraseñas y datos personales tapados.
const LOG_RESPONSE_BODY = process.env.NODE_ENV !== "production";
const LOG_BODY_MAX_CHARS = 200;
const SECRET_LOG_KEY = /token|password|secret|hash/i;
// Datos personales de visitantes (N4): en desarrollo tampoco van al registro, p. ej. los
// envíos de contacto o los suscriptores que lista el panel
const PERSONAL_LOG_KEY = /^(email|fullName|firstName|lastName|name|phone|company|message|ipAddress|userAgent)$/;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  if (LOG_RESPONSE_BODY) {
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (LOG_RESPONSE_BODY && capturedJsonResponse !== undefined) {
        let body = JSON.stringify(capturedJsonResponse, (key, value) =>
          key && (SECRET_LOG_KEY.test(key) || PERSONAL_LOG_KEY.test(key)) ? "[oculto]" : value,
        );
        if (body && body.length > LOG_BODY_MAX_CHARS) {
          body = `${body.slice(0, LOG_BODY_MAX_CHARS - 1)}…`;
        }
        logLine += ` :: ${body}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ error: message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    async () => {
      log(`serving on port ${port}`);
      
      const agentsEnabled = process.env.ENABLE_APP_AGENTS === "true";
      if (agentsEnabled) {
        try {
          await orchestrator.initialize();
          orchestrator.start(2000); // Process jobs every 2 seconds
          log("Agent orchestrator initialized and started", "agents");
        } catch (error) {
          log(`Failed to initialize agent orchestrator: ${error}`, "agents");
        }
      } else {
        log("Application agents disabled; set ENABLE_APP_AGENTS=true to enable them", "agents");
      }

      applicationReady = true;

      // Hourly maintenance tick — clean expired admin sessions
      setInterval(async () => {
        try {
          const count = await storage.cleanExpiredSessions();
          if (count > 0) {
            log(`[Scheduler] Cleaned ${count} expired sessions`, "scheduler");
          }
        } catch (err) {
          log(`[Scheduler] Error during hourly tick: ${err}`, "scheduler");
        }
      }, 60 * 60 * 1000);
    },
  );
})();
