/* La § del pie (demo v3, módulo marca, pieza «pie»): la § oficial entera, tenue, que sube y se asienta
   dentro del pie azul del sitio (Footer26, en todas las páginas). Capa decorativa: aria-hidden, sin
   eventos de puntero, debajo del contenido del pie (que va en position:relative; z-index:1).
   El pie no está dentro de .v3: la capa lleva su propio .v3 para que demo.css le aplique.
   Comportamiento: ./pie.ts. */
import "@/v3/shared";
import "./pie.css";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { initPie } from "./pie";

const capaStyle = { "--mk-art": `url("${import.meta.env.BASE_URL}v3/seccion-blanca.png")` } as CSSProperties;

export default function PieMarca() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    return el ? initPie(el) : undefined;
  }, []);
  return (
    <div ref={ref} className="v3 mk-pie-capa" aria-hidden="true" style={capaStyle}>
      <div className="mk-pie">
        <div className="mk-pie__sitio">
          <div className="mk-pie__sube" />
        </div>
      </div>
    </div>
  );
}
