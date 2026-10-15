// ss26.css va primero: sus clases deben quedar antes de las utilidades de Tailwind (index.css)
import "./styles/ss26.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

// La precarga de las letras (romana y sans latinas) la escribe en index.html, al compilar,
// el plugin preloadFonts de vite.config.ts.

// Marca JS activo: ss26.css solo oculta lo que se revela al entrar (.ss-reveal…) con esta clase
document.documentElement.classList.add("ss-js");

createRoot(document.getElementById("root")!).render(<App />);
