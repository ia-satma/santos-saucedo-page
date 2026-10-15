// ss26.css va primero: sus clases deben quedar antes de las utilidades de Tailwind (index.css)
import "./styles/ss26.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import serifUrl from "./styles/fonts/Newsreader-Roman-latin.woff2?url";
import sansUrl from "./styles/fonts/SourceSans3-r-latin.woff2?url";

// Precarga de las dos letras de cada página (romana y sans latinas). La itálica y los
// subconjuntos cirílicos se piden solo cuando hacen falta (unicode-range).
for (const href of [serifUrl, sansUrl]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  link.href = href;
  document.head.appendChild(link);
}

// Marca JS activo: ss26.css solo oculta lo que se revela al entrar (.ss-reveal…) con esta clase
document.documentElement.classList.add("ss-js");

createRoot(document.getElementById("root")!).render(<App />);
