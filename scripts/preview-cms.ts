import "dotenv/config";
import fs from "node:fs/promises";
import { injectSiteMetadata } from "../server/seo/htmlMetadata";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { registerRoutes } from "../server/routes";
import { initializeAgents } from "../server/agents";
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
)
  throw new Error("Esta vista de pruebas requiere PostgreSQL local.");
process.env.ENABLE_APP_AGENTS = "true";
process.env.AGENT_AUTO_PROCESSING = "false";
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
const server = createServer(app);
await registerRoutes(server, app);
await initializeAgents();
app.get("/readyz", (_req, res) =>
  res.json({ ok: true, ready: true, localPreview: true }),
);
const root = path.resolve("dist/public");
app.use(express.static(root, { index: false }));
app.get("*", async (_req, res, next) => {
  try {
    res
      .type("html")
      .send(
        await injectSiteMetadata(
          await fs.readFile(path.join(root, "index.html"), "utf8"),
        ),
      );
  } catch (e) {
    next(e);
  }
});
server.listen(Number(process.env.PORT || 5050), "127.0.0.1", () =>
  console.log("Local CMS preview ready; background jobs stopped."),
);
