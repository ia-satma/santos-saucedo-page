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

  // Portada del Inicio pintada desde el HTML, sin esperar al JS (en el teléfono el programa tarda segundos).
  // Es el primer cuadro del telón tal como lo dibuja React: encabezado con el logo y la § con la foto
  // del dron, con la geometría fija de .mk-js.rm (el mismo tamaño y lugar que con movimiento, telon.css).
  // React lo reemplaza al arrancar con el mismo dibujo y añade frase, menú y video. Póster y logo son los
  // del panel; si el panel apagó la portada, no se pinta nada.
  // La misma cuenta que medir() + pintar(0) de client/src/v3/marca/escenaTelon.ts (si cambia allá, cambia
  // aquí): tamaño y lugar de la § y la escena un 8 % más cerca, en px de esta pantalla. Con «reducir
  // movimiento», la geometría fija de .rm, como Telon.tsx.
  const GEOMETRIA_TELON = `(function(){try{var e=document.querySelector("#root .mk-telon__escena");if(!e)return;`
    + `var j=e.closest(".mk-js"),h=document.documentElement;`
    + `if(h.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){j.classList.add("rm");return;}`
    + `var m=e.querySelector(".mk-telon__marco"),d=e.querySelector(".mk-telon__medio"),vw=e.clientWidth,vh=e.clientHeight;if(!vw||!vh)return;`
    + `var R=[[.42,296,880,249.1,593.1],[.46,1144,1200,267.8,582.1],[.5,1152,1208,283.7,567.4],[.56,1160,1216,305.4,545.3],[.62,1168,1224,323.2,521.2],[.75,1176,1208,337.4,449.9],[1,1184,1184,352.2,352.2],[1.25,1192,1192,371.9,297.5],[1.45,304,760,391.3,269.9],[1.6,312,760,415.9,259.9],[1.78,328,776,445,250],[2,344,776,480.1,240],[2.4,360,784,537.7,224]];`
    + `var K=8,H0=Math.min(vh*.7,vw*.78*2160/1409),W0=H0*1409/2160,mx=(vw-W0)/2,my=(vh-H0)/2,a=vw/vh,r=R[0];`
    + `for(var i=1;i<R.length;i++)if(Math.abs(Math.log(R[i][0]/a))<Math.abs(Math.log(r[0]/a)))r=R[i];`
    + `var k=H0/2160,sf=1.06*Math.max(vw/(r[3]*k),vh/(r[4]*k)),Lx=(sf*r[1]*k-W0/2)/(sf-1),Ly=(sf*r[2]*k-H0/2)/(sf-1),px=mx-Lx*(K-1),py=my-Ly*(K-1);`
    + `m.style.cssText="left:"+px+"px;top:"+py+"px;width:"+W0*K+"px;height:"+H0*K+"px;transform-origin:"+Lx*K+"px "+Ly*K+"px;transform:scale("+(1/K).toFixed(6)+")";`
    + `d.style.cssText="left:"+(-px)+"px;top:"+(-py)+"px;width:"+vw+"px;height:"+vh+"px;transform-origin:"+(Lx*K+px)+"px "+(Ly*K+py)+"px;transform:scale("+(K*1.08).toFixed(6)+")";`
    + `}catch(_){}})();`;
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const portadaInicial = async () => {
    try {
      const cms = await getCmsOverrides();
      const layout = (cms.layout || {}) as { home?: { hero?: boolean } };
      if (layout.home?.hero === false) return null;
      const media = (cms.media || {}) as { hero?: { poster?: string }; brand?: { logoLight?: string } };
      const poster = media.hero?.poster ?? (cmsDefaults.media.hero.poster as string);
      const logo = media.brand?.logoLight || (cmsDefaults.media.brand.logoLight as string);
      if (!poster || !/^\/[\w./-]+$/.test(poster) || !/^\/[\w./-]+$/.test(logo)) return null;
      const src = /\/video\/portada-color-poster\.jpg$/.test(poster) ? poster.replace(/\.jpg$/, "-1600.webp") : poster;
      const head = `<link rel="preload" as="image" href="${esc(src)}" fetchpriority="high">\n    <link rel="preload" as="image" href="/v3/seccion-blanca.png" fetchpriority="high">`;
      const root = `<div id="root"><div class="ss26 hm-page min-h-screen" aria-hidden="true">`
        + `<header class="ss26 ss-header group/hdr sticky top-0 z-50 text-white ss-header--home-hero bg-transparent"><div class="ss-container flex h-[68px] items-center justify-between gap-4 lg:h-20 lg:gap-6 xl:gap-5"><span class="shrink-0"><img src="${esc(logo)}" alt="" class="h-[22px] w-auto min-[360px]:h-[26px] xl:h-[30px]" width="183" height="30"></span></div></header>`
        + `<main><div class="v3 mk-raiz" data-vista="inicio" style="--mk-art:url(&quot;/v3/seccion-blanca.png&quot;)"><div class="mk-js"><section class="mk-telon sobre-azul"><div class="mk-telon__escena">`
        + `<div class="mk-telon__marco"><div class="mk-telon__medio"><img class="mk-telon__quieta" src="${esc(src)}" alt="" width="1600" height="726" fetchpriority="high"></div></div>`
        + `<div class="mk-telon__barra"></div></div></section></div></div></main></div>`
        + `<script>${GEOMETRIA_TELON}</script></div>`;
      return { head, root };
    } catch { return null; }
  };

  // fall through to index.html if the file doesn't exist. no-cache (no no-store): el navegador vuelve a
  // preguntar siempre, así que los cambios del panel se ven igual, y el botón «atrás» puede ser instantáneo.
  app.use("*", async (_req, res,next) => {
    try {
      const requestPath = new URL(_req.originalUrl, "http://localhost").pathname;
      if (
        !/^\/(?:es|en|de|zh|ko|ja|ar|ru|fr|it)(?:\/|$)/.test(requestPath) &&
        !/^\/(?:admin|api|assets|static-api|team_photos|v3|favicon|robots|sitemap)/.test(requestPath)
      ) {
        const suffix = _req.originalUrl.slice(requestPath.length);
        return res.redirect(308, "/es" + (requestPath === "/" ? "/" : requestPath) + suffix);
      }
      let html=await fs.promises.readFile(path.resolve(distPath,"index.html"),"utf8");
      if (_req.originalUrl === "/" || _req.originalUrl.startsWith("/?")) {
        const p = await portadaInicial();
        if (p && html.includes('<div id="root"></div>')) {
          html = html.replace("</title>", `</title>\n    ${p.head}`).replace('<div id="root"></div>', p.root);
          // El programa del sitio y las dos letras se piden cuando la foto de la portada ya llegó: en el
          // teléfono no le quitan conexión (después de pintarla). Si tarda más de 2,5 s, van de todos modos.
          const fuentes: string[] = [];
          let programa = "";
          html = html
            .replace(/<link rel="preload" as="font" type="font\/woff2" crossorigin href="([^"]+)">\s*/g, (_m, f: string) => { fuentes.push(f); return ""; })
            .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>\s*/, (_m, f: string) => { programa = f; return ""; });
          if (programa) {
            const carga = `(function(){var i=document.querySelector("#root img.mk-telon__quieta"),h=0;function go(){if(h)return;h=1;`
              + `${JSON.stringify(fuentes)}.forEach(function(f){var l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/woff2";l.crossOrigin="anonymous";l.href=f;document.head.appendChild(l)});`
              + `var s=document.createElement("script");s.type="module";s.crossOrigin="anonymous";s.src=${JSON.stringify(programa)};document.head.appendChild(s)}`
              + `function pintada(){requestAnimationFrame(function(){requestAnimationFrame(go)})}`
              + `if(i&&i.decode)i.decode().then(pintada,go);else go();setTimeout(go,2500)})();`;
            html = html.replace("</body>", `<script>${carga}</script>\n  </body>`);
          } else {
            for (const f of fuentes) html = html.replace("</head>", `<link rel="preload" as="font" type="font/woff2" crossorigin href="${f}">\n</head>`);
          }
        }
      }
      res.set({"Content-Type":"text/html","Cache-Control":"no-cache"}).send(await injectSiteMetadata(html,_req.originalUrl));
    } catch(error){next(error);}
  });
}
