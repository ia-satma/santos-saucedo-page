/* Portada «telón» del Inicio (demo v3, módulo marca, pieza «portada»; aprobada el 5-11-2026).
   La § oficial es una ventana al video del dron; con el scroll crece y abre la escena como un telón.
   Abierta, la § queda como marca de agua al 12 % y llegan el logo, la frase que rota, «San Pedro
   Garza García · Desde…» y la firma abajo a la izquierda. Botón de pausa (video y frase).
   Textos y medios del panel donde el sitio ya los tenía: logo, video, póster, frase y lugar
   (home.hero), etiquetas del botón (chrome.heroVideo). Comportamiento: ./escenaTelon.ts (sin el nombre telon.ts, que en la Mac choca con Telon.tsx). */
import "@/v3/shared";
import "./telon.css";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { chrome26 } from "@/components/home26/chrome26";
import { useV3Lang, type V3Lang } from "@/v3/shared";
import { useLanguage } from "@/contexts/LanguageContext";
import { initTelon, type TelonApi } from "./escenaTelon";
import { getVideoEmbedUrl } from "@/lib/videoSource";

/* Textos nuevos de la demo (español literal de la demo; inglés en el mismo registro) */
const TXT = {
  es: {
    firma: "Al lado de las empresas en cada decisión que involucra a su personal.",
    // La frase del panel («Derecho laboral para empresas») deja fijo «Derecho laboral» y hace rotar a
    // quién sirve la firma. Antes rotaba entre las prácticas (laboral, migratorio, corporativo,
    // contractual) y en la junta del 6-11-2026 Mario dijo: «Yo no quisiera venderme como un despacho
    // multimateria»; «este es un despacho laboral». Lo laboral queda fijo; lo amplio son sus clientes.
    words: ["empresas", "la industria", "multinacionales"],
    and: "y",
  },
  en: {
    firma: "Alongside companies in every decision that involves their people.",
    words: ["companies", "industry", "multinationals"],
    and: "and",
  },
  de: { firma: "An der Seite von Unternehmen bei jeder Entscheidung, die ihre Mitarbeiter betrifft.", words: ["Unternehmen", "Industrie", "multinationale Unternehmen"], and: "und" },
  zh: { firma: "在每一项涉及员工的决策中与企业并肩前行。", words: ["企业", "行业", "跨国公司"], and: "和" },
  ko: { firma: "직원과 관련된 모든 의사결정에서 기업과 함께합니다.", words: ["기업", "산업", "다국적 기업"], and: "및" },
  ja: { firma: "従業員に関わるあらゆる意思決定で、企業に寄り添います。", words: ["企業", "産業", "多国籍企業"], and: "と" },
  ar: { firma: "إلى جانب الشركات في كل قرار يتعلق بموظفيها.", words: ["الشركات", "القطاع", "الشركات متعددة الجنسيات"], and: "و" },
  ru: { firma: "Мы рядом с компаниями в каждом решении, которое касается их сотрудников.", words: ["компании", "отрасль", "транснациональные компании"], and: "и" },
  fr: { firma: "Aux côtés des entreprises pour chaque décision concernant leur personnel.", words: ["entreprises", "secteur", "multinationales"], and: "et" },
  it: { firma: "Accanto alle imprese in ogni decisione che riguarda il loro personale.", words: ["imprese", "settore", "multinazionali"], and: "e" },
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

/** La palabra que rota va al final de la frase: «Derecho laboral para empresas» → primer renglón
    «Derecho laboral», segundo «para» + la palabra. Si la frase del panel ya no termina en ella: null. */
function splitFinal(tagline: string, first: string) {
  const t = tagline.trim();
  const m = new RegExp(`(^|\\s)(${escapeRe(first)})[.]?$`, "i").exec(t);
  if (!m) return null;
  const before = t.slice(0, m.index + m[1].length).trim().split(/\s+/);
  if (before.length < 2) return null;
  const pre2 = before.pop() as string;
  return { l1: before.join(" "), pre2 };
}

export default function Telon({ lang }: { lang: V3Lang }) {
  const { attrs } = useV3Lang();
  const { language } = useLanguage();
  const media = useCmsMedia();
  const liveHome = useCmsContent("home", home26);
  const liveChrome = useCmsContent("chrome", chrome26);
  const hero = liveHome[lang].hero;
  const labels = liveChrome[lang].heroVideo;
  const sourceTxt = TXT[language] ?? TXT.en;
  const txt = {
    firma: (hero as typeof hero & { firma?: string }).firma || sourceTxt.firma,
    words: (hero as typeof hero & { words?: readonly string[] }).words || sourceTxt.words,
    and: (hero as typeof hero & { and?: string }).and || sourceTxt.and,
  };

  const tagline = hero.tagline || "";
  const parts = useMemo(() => splitFinal(tagline, txt.words[0]), [tagline, txt]);
  const words = parts ? [...txt.words] : null;
  const wordsKey = words ? words.join("|") : "";
  const srTag = parts
    ? (() => {
        const list = `${txt.words.slice(0, -1).join(", ")} ${txt.and} ${txt.words[txt.words.length - 1]}`;
        const s = [parts.l1, parts.pre2, list].filter(Boolean).join(" ");
        return s.charAt(0).toUpperCase() + s.slice(1);
      })()
    : tagline;

  // Video: el póster ocupa el primer render; la fuente llega cuando el navegador terminó la entrada
  const [smallScreen] = useState(() => typeof window !== "undefined" && window.matchMedia(SMALL_SCREEN).matches);
  const [startPaused] = useState(() => typeof window !== "undefined" && (readPausedPref() || savesData() || smallScreen));
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
  const externalVideoSrc = videoSrc ? getVideoEmbedUrl(videoSrc, !paused) : null;
  const poster = media.hero.poster;
  // El póster predeterminado, en WebP (203 KB en lugar de 257 KB, idéntico a la vista); uno del panel va tal cual
  const posterSrc = poster && /\/video\/portada-color-poster\.jpg$/.test(poster) ? poster.replace(/\.jpg$/, "-1600.webp") : poster;
  const posterSrcSet = posterSrc && /\/video\/portada-color-poster-1600\.webp$/.test(posterSrc)
    ? `${posterSrc.replace("-1600.webp", "-768.webp")} 768w, ${posterSrc} 1600w`
    : undefined;

  // Comportamiento (demo: modules/marca/script.js + shell.js)
  const rootRef = useRef<HTMLDivElement>(null);
  const api = useRef<TelonApi | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // El navegador rechazó la reproducción: el botón pasa a "Reproducir" sin guardar preferencia
  const onBlocked = useCallback(() => setPaused(true), []);
  // El módulo se monta una vez (y otra solo si la frase pasa de rotar a fija o al revés: cambia su
  // marcado). Un cambio de idioma o de la frase del panel solo cambia las palabras (efecto de abajo):
  // la portada no se cierra ni repite su entrada.
  const rota = !!parts;
  const wordsRef = useRef(wordsKey);
  wordsRef.current = wordsKey;
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const k = wordsRef.current;
    const a = initTelon(el, { words: k ? k.split("|") : null, paused: pausedRef.current, onBlocked });
    api.current = a;
    return () => { a.destroy(); if (api.current === a) api.current = null; };
  }, [rota, onBlocked]);
  useEffect(() => { api.current?.palabras(wordsKey ? wordsKey.split("|") : null); }, [wordsKey, tagline]);
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
                <img className="mk-telon__quieta" src={posterSrc} srcSet={posterSrcSet} sizes="100vw" alt="" width={1600} height={726} {...{ fetchpriority: "high" }} />
                {videoEnabled && (externalVideoSrc ? <iframe className="mk-telon__video" src={externalVideoSrc} title="Video de portada" allow="autoplay; fullscreen; picture-in-picture" /> : (
                  <video
                    className="mk-telon__video"
                    src={videoSrc}
                    poster={posterSrc}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    tabIndex={-1}
                    onError={() => { if (videoSrc) setFailed(true); }}
                  />
                ))}
              </div>
            </div>
            <div className="mk-telon__fija" aria-hidden="true">
              <img src={posterSrc} srcSet={posterSrcSet} sizes="100vw" alt="" width={1600} height={726} decoding="async" />
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
                  <span className="sh-tag__l1">{parts.l1}</span>
                  <span className="sh-tag__l1">
                    <span className="sh-tag__pre">{parts.pre2}</span>
                    {/* La palabra la escribe el módulo (rota); React no la toca */}
                    <span className="sh-tag__slot"><b className="sh-tag__w" /></span>
                  </span>
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
