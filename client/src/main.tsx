// ss26.css va primero: sus clases deben quedar antes de las utilidades de Tailwind (index.css)
import "./styles/ss26.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { initSiteMotion } from "./lib/siteMotion";

// La precarga de las letras (romana y sans latinas) la escribe en index.html, al compilar,
// el plugin preloadFonts de vite.config.ts.

initSiteMotion();
const root = document.getElementById("root")!;
const montar = () => createRoot(root).render(<App />);

// Inicio: el servidor ya pintó en el HTML el primer cuadro de la portada (la § con la foto del dron,
// server/static.ts). React lo sustituye por el mismo dibujo cuando esa foto ya está en pantalla, para
// que el teléfono la muestre antes de ponerse a trabajar con el resto del sitio.
const quieta = root.querySelector<HTMLImageElement>("img.mk-telon__quieta");
if (quieta) {
  let hecho = false;
  const go = () => {
    if (hecho) return;
    hecho = true;
    requestAnimationFrame(() => setTimeout(montar, 0));
  };
  quieta.decode().then(go, go);
  setTimeout(go, 2500);
} else {
  montar();
}
