import { injectSiteMetadata } from "./seo/htmlMetadata";
import { getCmsOverrides } from "./cms/siteConfig";
import cmsDefaults from "@shared/cms-defaults.json";
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Hashed JS/CSS bundles are immutable — cache for 1 year
  const assetsPath = path.join(distPath, "assets");
  if (fs.existsSync(assetsPath)) {
    app.use("/assets", express.static(assetsPath, {
      maxAge: "1y",
      immutable: true,
    }));
  }

  // Photos, the cover video and logos keep their names between versions, so they are not
  // immutable: 30 days, then the browser revalidates them with the ETag.
  for (const dir of ["v3", "video", "editorial"]) {
    const dirPath = path.join(distPath, dir);
    if (fs.existsSync(dirPath)) {
      app.use(`/${dir}`, express.static(dirPath, { index: false, maxAge: "30d" }));
    }
  }

  app.use(express.static(distPath,{index:false}));

  // fall through to index.html if the file doesn't exist
  // Portada: el póster del dron se pide al leer el <head>, sin esperar al JS (es lo primero grande que se ve).
  // Mismo archivo que pinta Telon.tsx: el WebP de 1600 px si es el póster de siempre; si no, el del panel.
  const heroPosterPreload = async () => {
    try {
      const media = ((await getCmsOverrides()).media || {}) as { hero?: { poster?: string } };
      const poster = media.hero?.poster ?? (cmsDefaults.media.hero.poster as string);
      if (!poster || !/^\/[\w./-]+$/.test(poster)) return "";
      const src = /\/video\/portada-color-poster\.jpg$/.test(poster) ? poster.replace(/\.jpg$/, "-1600.webp") : poster;
      return `<link rel="preload" as="image" href="${src}" fetchpriority="high">`;
    } catch { return ""; }
  };

  // fall through to index.html if the file doesn't exist. no-cache (no no-store): el navegador vuelve a
  // preguntar siempre, así que los cambios del panel se ven igual, y el botón «atrás» puede ser instantáneo.
  app.use("*", async (_req, res,next) => {
    try {
      let html=await fs.promises.readFile(path.resolve(distPath,"index.html"),"utf8");
      if (_req.originalUrl === "/" || _req.originalUrl.startsWith("/?")) {
        const tag = await heroPosterPreload();
        if (tag) html = html.replace("</title>", `</title>\n    ${tag}`);
      }
      res.set({"Content-Type":"text/html","Cache-Control":"no-cache"}).send(await injectSiteMetadata(html,_req.originalUrl));
    } catch(error){next(error);}
  });
}
