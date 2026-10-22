import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { SectionMark } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";
import { chrome26 } from "./chrome26";

// Video de la portada en color natural. Ruta con la base de Pages
// (/santos-saucedo-page/ en el build estático).
const VIDEO_DIR = `${import.meta.env.BASE_URL}video/`;
const POSTER = `${VIDEO_DIR}portada-color-poster.jpg`;
// 1280 hasta 1024 px de ancho (teléfono y tableta); 1920 en el resto. Se elige al montar.
const SMALL_SCREEN = "(max-width: 1024px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
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

/** Consulta de medios leída al montar (la portada solo se pinta en el navegador) y seguida después. */
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
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
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

/* Héroe de la portada, composición aprobada por el cliente (H4, referencia
   video-portada/muestras/portada-completa.jpg, lienzo 1920 × 1080): video a toda la primera
   pantalla bajo el encabezado transparente; al centro, el logotipo blanco con § lima, la raya
   lima, la frase y la línea de lugar y año; a la derecha, la § del logotipo como marca de agua
   blanca al 20 %, completa. Medidas en ss26.css (.ss-hero…), en la unidad --u (1 px a 1920 × 1080). */
export default function Hero26({ lang }: { lang: Lang26 }) {
  const media = useCmsMedia();
  const liveHome = useCmsContent("home", home26);
  const liveChrome = useCmsContent("chrome", chrome26);
  const t = liveHome[lang].hero;
  const labels = liveChrome[lang].heroVideo;
  // Con movimiento reducido no se monta el video ni hay botón: el póster como imagen fija, mismo encuadre
  const reduced = useMedia(REDUCED_MOTION);
  // Si el visitante lo pausó en otra visita o ahorra datos, el video no se monta (ni se descarga):
  // póster fijo y el botón ofrece reproducir. Al pulsarlo se monta y se reproduce; al pausarlo
  // después queda montado en su cuadro.
  const [startPaused] = useState(() => typeof window !== "undefined" && (readPausedPref() || savesData()));
  const [paused, setPaused] = useState(startPaused);
  const [mounted, setMounted] = useState(!startPaused);
  const [videoFailed,setVideoFailed]=useState(false);
  useEffect(()=>setVideoFailed(false),[media.hero.videoDesktop,media.hero.videoMobile]);
  const still = videoFailed || reduced || !mounted || !media.hero.videoEnabled;
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <section id="hero" {...langAttrs[lang]} className="ss-hero" aria-labelledby="ss26-hero-title">
      {/* Fondo: Azul Profundo mientras carga (.ss-hero), video o póster y las capas de lectura */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {still ? (
          <img src={media.hero.poster} alt="" width={1920} height={872} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <HeroVideo media={media.hero} paused={paused} videoRef={videoRef} onBlocked={onBlocked} onFailed={()=>setVideoFailed(true)} />
        )}
        <div className="ss-hero-veil absolute inset-0" />
      </div>

      {/* La § oficial del logotipo (seccion.svg), blanca al 20 %: completa dentro del héroe, sin
          recortar ni deformar (aspecto fijo del trazo). Solo desde lg; debajo taparía el logotipo. */}
      <div aria-hidden="true" className="ss-hero-mark-box">
        <SectionMark className="ss-hero-mark" />
      </div>

      <div className="ss-hero-body">
        {/* Un solo h1: el logotipo (su alt es el nombre) y la frase. La raya es solo gráfica. */}
        <h1 id="ss26-hero-title" className="flex flex-col items-center">
          <img src={media.brand.logoLight} alt={media.brand.name} width={2400} height={393} className="ss-hero-logo" />
          <span aria-hidden="true" className="ss-hero-rule" />
          <span className="ss-hero-tagline">{t.tagline}</span>
        </h1>
        <p className="ss-hero-place">
          <span>{t.place[0]}</span>
          {/* En teléfono, lugar y año en dos líneas, sin el punto medio */}
          <span aria-hidden="true" className="ss-hero-dot">
            ·
          </span>
          <span className="ss-hero-year">{t.place[1]}</span>
        </p>
      </div>

      {/* Pausa del video (WCAG 2.2.2): un solo botón, solo icono, en la esquina inferior del lado
          final; la etiqueta cambia con el estado (sin aria-pressed). Fuera con movimiento reducido. */}
      {!reduced && media.hero.videoEnabled && (
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
