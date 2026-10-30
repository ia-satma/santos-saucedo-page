import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { SectionMark } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";
import { chrome26 } from "./chrome26";
import { SiteLink } from "./SiteLink";

// Video de la portada en color natural. Ruta con la base de Pages
// (/santos-saucedo-page/ en el build estático).
const VIDEO_DIR = `${import.meta.env.BASE_URL}video/`;
const POSTER = `${VIDEO_DIR}portada-color-poster.jpg`;
// 1280 hasta 1024 px de ancho (teléfono y tableta); 1920 en el resto. Se elige al montar.
const SMALL_SCREEN = "(max-width: 1024px)";
// Preferencia del visitante (I1): "paused" si pausó el video. Lectura y escritura con try/catch:
// en modo privado o con el almacenamiento bloqueado la elección vale solo para esta visita.
const PREF_KEY = "ss-hero-video";

function readPausedPref() {
  try {
    return window.localStorage.getItem(PREF_KEY) === "paused";
  } catch {
    return false;
  }
}

function writePausedPref(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(PREF_KEY, "paused");
    else window.localStorage.removeItem(PREF_KEY);
  } catch {
    // Sin almacenamiento: no se recuerda
  }
}

/** Ahorro de datos (saveData o conexión 2G): póster fijo, y el botón para reproducir si se quiere. */
function savesData() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

/** play() con aviso si el navegador la rechaza (reproducción automática bloqueada, ahorro de
    energía en iOS, fuente que no carga): `onRejected` pasa el botón a "Reproducir". AbortError no
    es un rechazo: la interrumpió una pausa (fuera de la vista, botón) o el video se desmontó. */
function playOrReport(video: HTMLVideoElement, onRejected: () => void) {
  video.play().catch((err: unknown) => {
    if ((err as { name?: string } | null)?.name !== "AbortError") onRejected();
  });
}

/** Video de fondo: mudo, en bucle, sin controles nativos ni audio, y en pausa mientras el héroe
    no se ve (no gasta batería ni CPU al leer el resto de la página). `paused`: lo pausó el
    visitante con el botón (o el navegador rechazó reproducirlo); entonces queda en su cuadro y el
    observador no lo reanuda. `onBlocked`: el navegador rechazó play(). */
function HeroVideo({
  media,
  paused,
  videoRef: ref,
  onBlocked,
  onFailed,
}: {
  media: ReturnType<typeof useCmsMedia>["hero"];
  paused: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  onBlocked: () => void;
  onFailed: () => void;
}) {
  const pausedRef = useRef(paused);
  // Siempre el último aviso, sin volver a crear el observador
  const onBlockedRef = useRef(onBlocked);
  onBlockedRef.current = onBlocked;
  const reportBlocked = () => {
    if (!pausedRef.current) onBlockedRef.current();
  };
  const src = window.matchMedia(SMALL_SCREEN).matches ? media.videoMobile||media.videoDesktop : media.videoDesktop||media.videoMobile;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React no escribe el atributo muted: sin él, Safari en iOS no reproduce solo
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    if (!("IntersectionObserver" in window)) return;
    // Fuera de la vista se detiene; al volver se reanuda solo si el visitante no lo pausó
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!pausedRef.current) playOrReport(video, reportBlocked);
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  // El botón del héroe: pausa o reproduce (también al montar)
  useEffect(() => {
    pausedRef.current = paused;
    const video = ref.current;
    if (!video) return;
    if (paused) video.pause();
    else playOrReport(video, reportBlocked);
  }, [paused]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      onError={onFailed}
      poster={media.poster}
      // Si se vuelve a montar ya en pausa (al quitar el movimiento reducido), no arranca solo
      autoPlay={!paused}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

/* Portada editorial: logo oficial blanco/lima y monograma oficial como marca de agua. */
export default function Hero26({ lang }: { lang: Lang26 }) {
  const media = useCmsMedia();
  const liveHome = useCmsContent("home", home26);
  const liveChrome = useCmsContent("chrome", chrome26);
  const links = useCmsContent("links", { about: "/about", contact: "/contact" });
  const t = liveHome[lang].hero;
  const labels = liveChrome[lang].heroVideo;
  // Movimiento reducido (macOS/iOS "Reducir movimiento"): el cliente pidió que el video se vea en
  // todos los equipos (junta del 16-10-2026). Es una toma aérea lenta, sin destellos, y el botón de
  // pausa queda siempre visible (WCAG 2.2.2). El póster ocupa el primer render para diferir la
  // descarga y decodificación; si el visitante lo pausó o ahorra datos, queda como frame fijo.
  const [startPaused] = useState(() => typeof window !== "undefined" && (readPausedPref() || savesData()));
  const [paused, setPaused] = useState(startPaused);
  // El póster ocupa el primer render; el video se crea cuando el navegador ya terminó la entrada.
  const [mounted, setMounted] = useState(false);
  const [videoFailed,setVideoFailed]=useState(false);
  useEffect(()=>setVideoFailed(false),[media.hero.videoDesktop,media.hero.videoMobile]);
  useEffect(() => {
    if (startPaused || paused || !media.hero.videoEnabled || savesData()) return;

    let cancelled = false;
    let idleReady = false;
    let delayReady = false;
    const startVideo = () => {
      if (!cancelled && idleReady && delayReady) setMounted(true);
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const delayId = window.setTimeout(() => {
      delayReady = true;
      startVideo();
    }, 900);
    const idleId = idleWindow.requestIdleCallback?.(() => {
      idleReady = true;
      startVideo();
    }, { timeout: 1600 });
    if (!idleWindow.requestIdleCallback) idleReady = true;

    return () => {
      cancelled = true;
      window.clearTimeout(delayId);
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
    };
  }, [media.hero.videoEnabled, paused, startPaused]);
  const still = videoFailed || !mounted || !media.hero.videoEnabled;
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  // El fondo se mueve más lento que la página. El margen extra evita huecos durante la
  // transformación y el resorte elimina los pequeños saltos del scroll de trackpad.
  const backgroundY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 110]), {
    stiffness: 80,
    damping: 24,
    mass: 0.7,
  });
  const backgroundScale = useSpring(useTransform(scrollYProgress, [0, 1], [1.06, 1.12]), {
    stiffness: 80,
    damping: 24,
    mass: 0.7,
  });

  // El navegador rechazó la reproducción (K6): el botón pasa a "Reproducir" sin guardar
  // preferencia (no la eligió el visitante). Una pulsación lo inicia.
  const onBlocked = useCallback(() => setPaused(true), []);

  const toggle = () => {
    const next = !paused;
    if (!next) {
      setMounted(true);
      // play() dentro del gesto: el navegador que rechazó la reproducción automática la acepta
      // ahora. Si el video aún no está montado, lo monta este clic y lo reproduce su efecto.
      if (videoRef.current) playOrReport(videoRef.current, onBlocked);
    }
    setPaused(next);
    writePausedPref(next);
  };

  return (
    <section ref={heroRef} id="hero" {...langAttrs[lang]} className="ss-hero" aria-labelledby="ss26-hero-title">
      {/* Fondo: Azul Profundo mientras carga (.ss-hero), video o póster y las capas de lectura */}
      <motion.div
        aria-hidden="true"
        className="ss-hero-media -inset-[8%] absolute -z-10 will-change-transform"
        style={{
          y: reduceMotion ? 0 : backgroundY,
          scale: reduceMotion ? 1.06 : backgroundScale,
        }}
      >
        {still ? (
          <img src={media.hero.poster} alt="" width={1920} height={872} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <HeroVideo media={media.hero} paused={paused} videoRef={videoRef} onBlocked={onBlocked} onFailed={()=>setVideoFailed(true)} />
        )}
        <div className="ss-hero-veil absolute inset-0" />
      </motion.div>

      {/* Monograma oficial proporcional, recortado en el margen derecho como en la referencia. */}
      <div aria-hidden="true" className="ss-hero-mark-box">
        <SectionMark className="ss-hero-mark" />
      </div>

      <div className="ss-hero-body">
        {/* La marca usa siempre el logo oficial; el contenido editorial debajo sigue siendo editable desde CMS. */}
        <div className="ss-hero-copy">
          <p className="ss-hero-eyebrow">{t.eyebrow}</p>
          <h1 id="ss26-hero-title">
            <img
              src={media.brand.logoLight || logoBlancoLima}
              alt={media.brand.name || "Santos & Saucedo"}
              width={2400}
              height={393}
              className="ss-hero-logo"
              onError={(event) => {
                if (event.currentTarget.src !== logoBlancoLima) event.currentTarget.src = logoBlancoLima;
              }}
            />
          </h1>
          <span aria-hidden="true" className="ss-hero-rule" />
          <p className="ss-hero-tagline">{t.tagline}</p>
          <p className="ss-hero-place">
            <span>{t.place[0]}</span>
            <span aria-hidden="true" className="ss-hero-dot">·</span>
            <span className="ss-hero-year">{t.place[1]}</span>
          </p>
        </div>
        <nav className="ss-hero-actions" aria-label={lang === "es" ? "Enlaces principales" : "Primary links"}>
          <SiteLink href={links.about} data-testid="hero-cta-firm" className="ss-hero-cta ss-hero-cta--primary">
            {t.primaryCta}<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 8h10m-4-4 4 4-4 4" /></svg>
          </SiteLink>
          <SiteLink href={links.contact} data-testid="hero-cta-contact" className="ss-hero-cta ss-hero-cta--secondary">
            {t.secondaryCta}<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 8h10m-4-4 4 4-4 4" /></svg>
          </SiteLink>
        </nav>
      </div>

      {/* Pausa del video (WCAG 2.2.2): un solo botón, solo icono, en la esquina inferior del lado
          final; la etiqueta cambia con el estado (sin aria-pressed). */}
      {media.hero.videoEnabled && (
        <button
          type="button"
          className="ss-hero-toggle"
          aria-label={paused ? labels.play : labels.pause}
          onClick={toggle}
          data-testid="button-hero-video"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5}>
            {paused ? <path d="M4.75 2.75v10.5L13.25 8z" strokeLinejoin="round" /> : <path d="M5.25 2.75v10.5M10.75 2.75v10.5" />}
          </svg>
        </button>
      )}
    </section>
  );
}
