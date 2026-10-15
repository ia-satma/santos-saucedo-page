import { Component, Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import seccionBlanco from "@assets/ss26/seccion-blanco-800.png";
import seccionUrl from "@assets/ss26/seccion.svg";

// El shader se baja aparte: no pesa en la carga inicial del Inicio.
const LiquidMetal = lazy(() =>
  import("@paper-design/shaders-react").then(({ LiquidMetal }) => ({ default: LiquidMetal })),
);

const FADE_MS = 600;

// El shader monta solo con WebGL2; se libera el contexto de prueba (los navegadores limitan cuántos hay).
function hasWebGL2() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

// Póster fijo: el § en plata cepillada. Nunca hay marco vacío.
const POSTER_STYLE: CSSProperties = {
  WebkitMaskImage: `url("${seccionUrl}")`,
  maskImage: `url("${seccionUrl}")`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  backgroundImage: "linear-gradient(135deg, #ffffff 0%, #b9bccb 38%, #eef0f6 62%, #7d8199 100%)",
};

// inset 2% = scale 0.96 del shader, para que el cruce no salte.
function SealPoster({ hidden = false }: { hidden?: boolean }) {
  return (
    <span
      className="pointer-events-none absolute inset-[2%] block select-none"
      style={{
        ...POSTER_STYLE,
        opacity: hidden ? 0 : 1,
        // Al ocultarse espera a que el metal ya esté encima: sin bajón de brillo.
        transition: `opacity ${FADE_MS}ms ease ${hidden ? FADE_MS / 2 : 0}ms`,
      }}
    />
  );
}

// Si el shader o su descarga fallan, queda el póster.
class SealBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * El § del logotipo como sello de metal líquido (paper-design/shaders, Apache-2.0).
 * La plata retoma la insignia de aniversario de la presentación 2026.
 * Primero se ve el póster; el metal entra con un fundido cuando ya pintó.
 * Con movimiento reducido queda congelado; sin WebGL2 o si algo falla, queda el póster.
 */
export default function LiquidSeal({ label, className = "" }: { label: string; className?: string }) {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(hasWebGL2());
  }, []);

  // Fuera de pantalla el metal se detiene: no gasta batería ni procesador.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // El shader marca su div con data-paper-shader al montar; un cuadro después ya pintó.
  // Si pierde el contexto WebGL, vuelve el póster.
  useEffect(() => {
    const box = boxRef.current;
    if (!webgl || !box || typeof MutationObserver === "undefined") return;
    let raf = 0;
    let canvas: HTMLCanvasElement | null = null;
    const onLost = () => setReady(false);
    const found = () => {
      const mount = box.querySelector("[data-paper-shader]");
      if (!mount) return false;
      canvas = mount.querySelector("canvas");
      canvas?.addEventListener("webglcontextlost", onLost);
      raf = requestAnimationFrame(() => setReady(true));
      return true;
    };
    const mo = new MutationObserver(() => {
      if (found()) mo.disconnect();
    });
    if (!found()) {
      mo.observe(box, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-paper-shader"] });
    }
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      canvas?.removeEventListener("webglcontextlost", onLost);
    };
  }, [webgl]);

  const moving = visible && !reduce;
  const poster = <SealPoster />;

  return (
    <div
      ref={boxRef}
      aria-hidden
      title={label}
      className={`relative ${className}`}
      style={{ aspectRatio: "1200 / 1838", opacity: 0.92, filter: "saturate(0.42) contrast(1.18)", contain: "paint" }}
    >
      {webgl ? (
        <SealBoundary fallback={poster}>
          <Suspense fallback={poster}>
            <SealPoster hidden={ready} />
            <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}>
              <LiquidMetal
                image={seccionBlanco}
                colorBack="#00000000"
                colorTint="#ffffff"
                repetition={3}
                softness={0.1}
                shiftRed={0.08}
                shiftBlue={0.1}
                distortion={0.1}
                contour={0.4}
                angle={72}
                speed={moving ? 0.32 : 0}
                frame={4200}
                scale={0.96}
                fit="contain"
                maxPixelCount={880 * 880}
                suspendWhenProcessingImage
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
            </div>
          </Suspense>
        </SealBoundary>
      ) : (
        poster
      )}
    </div>
  );
}
