/* Portada «telón» del Inicio (demo v3, módulo marca, pieza «portada»; aprobada el 5-11-2026).
   La § oficial es una ventana al video del dron; con el scroll crece y abre la escena como un telón.
   Abierta, la § queda como marca de agua al 12 % y llegan el logo, la frase que rota, «San Pedro
   Garza García · Desde…» y la firma abajo a la izquierda. Botón de pausa (video y frase).
   Textos y medios del panel donde el sitio ya los tenía: logo, video, póster, frase y lugar
   (home.hero), etiquetas del botón (chrome.heroVideo). Comportamiento: ./telon.ts. */
import "@/v3/shared";
import "./telon.css";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { chrome26 } from "@/components/home26/chrome26";
import { useV3Lang, type V3Lang } from "@/v3/shared";
import { initTelon, type TelonApi } from "./telon";

/* Textos nuevos de la demo (español literal de la demo; inglés en el mismo registro) */
const TXT = {
  es: {
    firma: "Al lado de las empresas en cada decisión que involucra a su personal.",
    // La frase del panel («Derecho laboral para empresas») hace rotar su palabra entre las prácticas
    words: ["laboral", "migratorio", "corporativo", "contractual"],
    and: "y",
  },
  en: {
    firma: "Alongside companies in every decision that involves their people.",
    words: ["labor", "immigration", "corporate", "contract"],
    and: "and",
  },
} as const;

// 1280 hasta 1024 px de ancho (teléfono y tableta); 1920 en el resto (como Hero26)
const SMALL_SCREEN = "(max-width: 1024px)";
// Preferencia del visitante: la misma clave que el héroe anterior ("paused" si pausó el video)
const PREF_KEY = "ss-hero-video";

function readPausedPref() {
  try { return window.localStorage.getItem(PREF_KEY) === "paused"; } catch { return false; }
}
function writePausedPref(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(PREF_KEY, "paused");
    else window.localStorage.removeItem(PREF_KEY);
  } catch { /* sin almacenamiento: vale para esta visita */ }
}
/** Ahorro de datos (saveData o conexión 2G): póster fijo, y el botón para reproducir si se quiere. */
function savesData() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Parte la frase del panel alrededor de la palabra que rota. «Derecho laboral para empresas» →
    antes «Derecho», l2 «para empresas»; «Labor law for companies» → la palabra va primero y «law»
    queda con ella en el primer renglón. Si el panel cambió la frase y ya no la trae: frase fija. */
function splitTagline(tagline: string, first: string) {
  const m = new RegExp(`(^|\\s)(${escapeRe(first)})(?=[\\s,.;:]|$)`, "i").exec(tagline);
  if (!m) return null;
  const start = m.index + m[1].length;
  const before = tagline.slice(0, start).trim();
  const rest = tagline.slice(start + first.length).trim();
  if (before) return { before, after: "", l2: rest };
  const [w1 = "", ...more] = rest.split(/\s+/);
  return { before: "", after: w1, l2: more.join(" ") };
}

export default function Telon({ lang }: { lang: V3Lang }) {
  const { attrs } = useV3Lang();
  const media = useCmsMedia();
  const liveHome = useCmsContent("home", home26);
  const liveChrome = useCmsContent("chrome", chrome26);
  const hero = liveHome[lang].hero;
  const labels = liveChrome[lang].heroVideo;
  const txt = TXT[lang];

  const tagline = hero.tagline || "";
  const parts = useMemo(() => splitTagline(tagline, txt.words[0]), [tagline, txt]);
  const words = parts ? [...txt.words] : null;
  const wordsKey = words ? words.join("|") : "";
  const srTag = parts
    ? (() => {
        const list = `${txt.words.slice(0, -1).join(", ")} ${txt.and} ${txt.words[txt.words.length - 1]}`;
        const s = [parts.before, list, parts.after, parts.l2].filter(Boolean).join(" ");
        return s.charAt(0).toUpperCase() + s.slice(1);
      })()
    : tagline;

  // Video: el póster ocupa el primer render; la fuente llega cuando el navegador terminó la entrada
  const [startPaused] = useState(() => typeof window !== "undefined" && (readPausedPref() || savesData()));
  const [paused, setPaused] = useState(startPaused);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoEnabled = media.hero.videoEnabled !== false;
  useEffect(() => setFailed(false), [media.hero.videoDesktop, media.hero.videoMobile]);
  useEffect(() => {
    if (ready || startPaused || paused || !videoEnabled || savesData()) return;
    let cancelled = false, idleReady = false, delayReady = false;
    const start = () => { if (!cancelled && idleReady && delayReady) setReady(true); };
    const iw = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    const delayId = window.setTimeout(() => { delayReady = true; start(); }, 900);
    const idleId = iw.requestIdleCallback?.(() => { idleReady = true; start(); }, { timeout: 1600 });
    if (!iw.requestIdleCallback) idleReady = true;
    return () => {
      cancelled = true;
      window.clearTimeout(delayId);
      if (idleId !== undefined) iw.cancelIdleCallback?.(idleId);
    };
  }, [ready, startPaused, paused, videoEnabled]);
  const videoSrc = useMemo(() => {
    if (!ready || failed || !videoEnabled || typeof window === "undefined") return undefined;
    const small = window.matchMedia(SMALL_SCREEN).matches;
    return (small ? media.hero.videoMobile || media.hero.videoDesktop : media.hero.videoDesktop || media.hero.videoMobile) || undefined;
  }, [ready, failed, videoEnabled, media.hero.videoDesktop, media.hero.videoMobile]);
  const poster = media.hero.poster;

  // Comportamiento (demo: modules/marca/script.js + shell.js)
  const rootRef = useRef<HTMLDivElement>(null);
  const api = useRef<TelonApi | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // El navegador rechazó la reproducción: el botón pasa a "Reproducir" sin guardar preferencia
  const onBlocked = useCallback(() => setPaused(true), []);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const a = initTelon(el, { words: wordsKey ? wordsKey.split("|") : null, paused: pausedRef.current, onBlocked });
    api.current = a;
    return () => { a.destroy(); if (api.current === a) api.current = null; };
    // tagline: si el panel cambia la frase, React rehace su marcado y el módulo vuelve a empezar
  }, [wordsKey, tagline, onBlocked]);
  useEffect(() => { api.current?.pausa(paused); }, [paused]);
  useEffect(() => { api.current?.video(); }, [videoSrc]);

  const toggle = () => {
    const next = !paused;
    if (!next && !ready) setReady(true);
    setPaused(next);
    writePausedPref(next);
  };

  // Clases del envoltorio fijadas al montar: después las cambia el módulo (rm) sin que React las pise
  const [wrapClass] = useState(() => {
    const rm = typeof document !== "undefined" &&
      (document.documentElement.classList.contains("rm") || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    return rm ? "mk-js rm" : "mk-js";
  });
  const rootStyle = { "--mk-art": `url("${import.meta.env.BASE_URL}v3/seccion-blanca.png")` } as CSSProperties;
  const logoSrc = media.brand.logoLight || logoBlancoLima;
  const firmName = media.brand.name || "Santos & Saucedo";

  return (
    <div ref={rootRef} className="v3 mk-raiz" data-vista="inicio" style={rootStyle} {...attrs}>
      <div className={wrapClass}>
        <section className="mk-telon sobre-azul" id="portada" aria-labelledby="portada-h">
          <div className="mk-telon__escena">
            <div className="mk-telon__marco" aria-hidden="true">
              <div className="mk-telon__medio">
                <img className="mk-telon__quieta" src={poster} alt="" width={1600} height={726} decoding="async" />
                {videoEnabled && (
                  <video
                    className="mk-telon__video"
                    src={videoSrc}
                    poster={poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    tabIndex={-1}
                    onError={() => { if (videoSrc) setFailed(true); }}
                  />
                )}
              </div>
            </div>
            <div className="mk-telon__fija" aria-hidden="true">
              <img src={poster} alt="" width={1600} height={726} decoding="async" />
            </div>
            <div className="sh-portada__velo" aria-hidden="true" />
            {/* La § como marca de agua (módulo marca, pieza 1), del tamaño y en el lugar de la ventana */}
            <div className="mk-portada" aria-hidden="true">
              <div className="mk-portada__sitio">
                <div className="mk-portada__deriva">
                  <span className="mk-mitad mk-mitad--sup" />
                  <span className="mk-mitad mk-mitad--inf" />
                </div>
              </div>
            </div>
            {/* Fondo del encabezado del sitio (Header26) mientras la § está cerrada sobre el claro */}
            <div className="mk-telon__barra" aria-hidden="true" />
            <div className="sh-portada__centro">
              <h1 className="sh-portada__logo" id="portada-h">
                <img
                  src={logoSrc}
                  alt={firmName}
                  width={2400}
                  height={393}
                 
                  onError={(e) => { if (e.currentTarget.src !== logoBlancoLima) e.currentTarget.src = logoBlancoLima; }}
                />
              </h1>
              {parts ? (
                <p className="sh-tag" aria-hidden="true" data-frase="a">
                  <span className="sh-tag__l1">
                    {parts.before ? <span className="sh-tag__pre">{parts.before}</span> : null}
                    {/* La palabra la escribe el módulo (rota); React no la toca */}
                    <span className="sh-tag__slot"><b className="sh-tag__w" /></span>
                    {parts.after ? <span className="sh-tag__pre">{parts.after}</span> : null}
                  </span>
                  {parts.l2 ? <span className="sh-tag__l2">{parts.l2}</span> : null}
                </p>
              ) : (
                <p className="sh-tag">{tagline}</p>
              )}
              {parts ? <p className="sh-sr">{srTag}</p> : null}
              <p className="sh-portada__lugar">
                <span className="mk-lugar">{hero.place[0]}</span>{" "}
                <span className="mk-lugar__punto" aria-hidden="true">·</span>{" "}
                <span className="mk-lugar">{hero.place[1]}</span>
              </p>
            </div>
            <p className="mk-telon__firma">{txt.firma}</p>
            {(videoEnabled || parts) && (
              <button
                className="sh-pausa"
                type="button"
                aria-label={paused ? labels.play : labels.pause}
                onClick={toggle}
                data-testid="button-hero-video"
              >
                {paused ? (
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                ) : (
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4.5v11M13 4.5v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
