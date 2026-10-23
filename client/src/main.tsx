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
createRoot(document.getElementById("root")!).render(<App />);
