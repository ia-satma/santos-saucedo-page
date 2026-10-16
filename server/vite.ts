import { injectSiteMetadata } from "./seo/htmlMetadata";
import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const port = parseInt(process.env.PORT || "5000", 10);
  // Replit serves the development app through an HTTPS proxy while the
  // workspace server listens on the internal HTTP port. Vite's default HMR
  // client then tries to reconnect to that internal port and can reload the
  // whole page repeatedly (which is especially disruptive on admin forms).
  // Keep HMR for local development, but disable it in Replit where the proxy
  // is responsible for serving the stable preview.
  const isReplitPreview = Boolean(
    process.env.REPL_ID ||
    process.env.REPLIT_DEPLOYMENT ||
    process.env.REPLIT_DB_URL ||
    process.env.REPLIT_DEV_DOMAIN,
  );
  const serverOptions = {
    middlewareMode: true,
    hmr: isReplitPreview ? false : { server, clientPort: port },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(await injectSiteMetadata(page));
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
