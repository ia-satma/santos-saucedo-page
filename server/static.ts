import { injectSiteMetadata } from "./seo/htmlMetadata";
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

  app.use(express.static(distPath,{index:false}));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (_req, res,next) => {
    try { const html=await fs.promises.readFile(path.resolve(distPath,"index.html"),"utf8");res.set({"Content-Type":"text/html","Cache-Control":"no-store"}).send(await injectSiteMetadata(html,_req.originalUrl)); } catch(error){next(error);}
  });
}
