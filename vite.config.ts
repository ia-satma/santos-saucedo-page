import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Precarga de las dos letras de cada página (romana y sans latinas) escrita en index.html al
// compilar: el navegador las pide al leer el <head>, sin esperar a que corra el JS. Los nombres
// llevan hash, así que se buscan en el bundle. La itálica y los subconjuntos cirílicos se piden
// solo cuando hacen falta (unicode-range). En desarrollo no hay bundle y no hace nada.
function preloadFonts(): Plugin {
  const fonts = [/(^|\/)Newsreader-Roman-latin-[\w-]+\.woff2$/, /(^|\/)SourceSans3-r-latin-[\w-]+\.woff2$/];
  let base = "/";
  return {
    name: "ss-preload-fonts",
    enforce: "post",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const files = Object.keys(ctx.bundle);
        const tags = fonts.flatMap((re) => {
          const file = files.find((f) => re.test(f));
          return file
            ? [
                {
                  tag: "link",
                  attrs: { rel: "preload", as: "font", type: "font/woff2", crossorigin: true, href: base + file },
                  injectTo: "head" as const,
                },
              ]
            : [];
        });
        return { html, tags };
      },
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    preloadFonts(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
