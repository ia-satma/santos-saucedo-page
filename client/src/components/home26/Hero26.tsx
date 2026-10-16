import { useEffect, useRef, useState } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { SectionMark } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";

// Video de la portada (client/public/video): tomas de dron de Monterrey con el tratamiento azul
// ya aplicado. Ruta con la base de Pages (/santos-saucedo-page/ en el build estático).
const VIDEO_DIR = `${import.meta.env.BASE_URL}video/`;
const POSTER = `${VIDEO_DIR}portada-azul-poster.jpg`;
// 1280 hasta 1024 px de ancho (teléfono y tableta); 1920 en el resto. Se elige al montar.
const SMALL_SCREEN = "(max-width: 1024px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

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

/** Video de fondo: mudo, en bucle, sin controles ni audio, y en pausa mientras el héroe no se ve
    (no gasta batería ni CPU al leer el resto de la página). */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => `${VIDEO_DIR}portada-azul-${window.matchMedia(SMALL_SCREEN).matches ? 1280 : 1920}.mp4`);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React no escribe el atributo muted: sin él, Safari en iOS no reproduce solo
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    const play = () => video.play().catch(() => undefined);
    play();
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : video.pause()));
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={POSTER}
      autoPlay
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
   blanca al 12 %, completa. Medidas en ss26.css (.ss-hero…), en la unidad --u (1 px a 1920 × 1080). */
export default function Hero26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].hero;
  // Con movimiento reducido no se monta el video: el póster como imagen fija, mismo encuadre
  const still = useMedia(REDUCED_MOTION);

  return (
    <section id="hero" {...langAttrs[lang]} className="ss-hero" aria-labelledby="ss26-hero-title">
      {/* Fondo: Azul Profundo mientras carga (.ss-hero), video o póster y las capas de lectura */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {still ? (
          <img src={POSTER} alt="" width={1920} height={872} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <HeroVideo />
        )}
        <div className="ss-hero-veil absolute inset-0" />
      </div>

      {/* La § oficial del logotipo (seccion.svg), blanca al 12 %: completa dentro del héroe, sin
          recortar ni deformar (aspecto fijo del trazo). Solo desde lg; debajo taparía el logotipo. */}
      <div aria-hidden="true" className="ss-hero-mark-box">
        <SectionMark className="ss-hero-mark" />
      </div>

      <div className="ss-hero-body">
        {/* Un solo h1: el logotipo (su alt es el nombre) y la frase. La raya es solo gráfica. */}
        <h1 id="ss26-hero-title" className="flex flex-col items-center">
          <img src={logoBlancoLima} alt="Santos & Saucedo" width={2400} height={393} className="ss-hero-logo" />
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
    </section>
  );
}
