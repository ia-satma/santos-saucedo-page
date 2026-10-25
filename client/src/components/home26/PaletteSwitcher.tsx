import { useEffect, useRef, useState } from "react";
import { setPreviewPalette, type BrandTheme } from "@/lib/brandColors";

// Selector privado para comparar paletas con el cliente (petición del 24-10-2026). Solo aparece en
// el navegador que abrió el sitio con ?paletas=1 (?paletas=0 lo quita); el público nunca lo ve.
// La elegida se recuerda en ese navegador y no cambia lo guardado en el panel.
//
// Método de los videos de referencia que compartió el cliente: dos colores que "se ven bien"
// juntos (primario y secundario) y un tercero que le da carácter (terciario, el acento). Aquí cada
// paleta reparte esos tres por papeles en todo el sitio: fondo de página, banda del manifiesto,
// campos oscuros (encabezado, panel, pie), títulos, texto y acento (S del logo, §, filetes y
// flechas). La portada no cambia (aprobada) y fotos y video quedan a color (pedido del cliente).
// Los códigos de los videos van exactos; los marcados "tinte" son el mismo color aclarado para leer.
type Palette = BrandTheme & { id: string; name: string; roles: [string, string, string]; note: string };

export const PALETTES: Palette[] = [
  {
    id: "original", name: "Original", roles: ["#18175B", "#F3F1EA", "#B2EB3E"],
    note: "Como está hoy",
  },
  {
    // La marca con el método: hueso domina, azul profundo lleva títulos, banda y campos; verde sobrio de acento
    id: "ss-sobrio", name: "Santos & Saucedo sobrio", roles: ["#F3F1EA", "#18175B", "#A9C25D"],
    note: "Hueso, azul profundo y verde sobrio",
    fondo: "#F3F1EA", paper: "#E9E5D9" /* tinte */, navy: "#18175B", marino: "#18175B", tinta: "#2A2950" /* tinte */,
    lime: "#A9C25D", bandaFondo: "#18175B", bandaTitulo: "#F3F1EA", bandaTexto: "#F3F1EA",
  },
  {
    // Video 2: "Ivory and gold… add deep navy": marfil de fondo, navy en títulos, texto y banda; oro en filetes, § y el título de la banda
    id: "atlas", name: "Atlas: marfil, oro y azul", roles: ["#E8E0D2", "#B89A5A", "#0E1D61"],
    note: "Ivory #E8E0D2 · Gold #B89A5A · Deep Atlas Navy #0E1D61",
    fondo: "#E8E0D2", paper: "#DCD0B9" /* tinte */, navy: "#0E1D61", marino: "#0E1D61", tinta: "#0E1D61",
    lime: "#B89A5A", bandaFondo: "#0E1D61", bandaTitulo: "#B89A5A", bandaTexto: "#E8E0D2",
  },
  {
    // Video 2: "Navy and grey… add crimson red": navy domina, piedra en texto sobre navy, carmesí en títulos de banda
    id: "midnight", name: "Midnight: azul, piedra y carmesí", roles: ["#1B1E4A", "#AFAEA2", "#D21319"],
    note: "Midnight Navy #1B1E4A · Warm Stone Grey #AFAEA2 · Crimson #D21319",
    fondo: "#F0EFEB" /* tinte de piedra */, paper: "#DCDBD4" /* tinte */, navy: "#1B1E4A", marino: "#1B1E4A", tinta: "#1B1E4A",
    lime: "#D21319", bandaFondo: "#1B1E4A", bandaTitulo: "#D21319", bandaTexto: "#AFAEA2",
  },
  {
    // Video 3: "Midnight navy and cobalt blue… bring in crimson red": navy de base, cobalto como campo, rojo de acento
    id: "cobalto", name: "Cobalto: azul noche, cobalto y rojo", roles: ["#021861", "#255DCE", "#DE1110"],
    note: "Midnight Navy #021861 · Cobalt Blue #255DCE · Bright Red #DE1110",
    fondo: "#F4F6FB" /* tinte de cobalto */, paper: "#E4EBF8" /* tinte */, navy: "#021861", marino: "#021861", tinta: "#16224A" /* tinte */,
    lime: "#DE1110", bandaFondo: "#255DCE", bandaTitulo: "#FFFFFF", bandaTexto: "#FFFFFF",
  },
  {
    // Video 1: "Warm ivory and deep blue… add coral orange": marfil de fondo, azul en títulos y campos, coral de acento
    id: "editorial", name: "Editorial: marfil, azul y coral", roles: ["#EAE6DE", "#226192", "#EF8557"],
    note: "Warm Ivory #EAE6DE · Deep Editorial Blue #226192 · Coral #EF8557",
    fondo: "#EAE6DE", paper: "#F3F1EC" /* tinte */, navy: "#226192", marino: "#226192", tinta: "#1D4A6E" /* tinte */,
    lime: "#EF8557", bandaFondo: "#226192", bandaTitulo: "#EAE6DE", bandaTexto: "#EAE6DE",
  },
  {
    // Video 3: "Ink black and warm ivory is timeless elegance, add electric teal"
    id: "tinta", name: "Tinta: negro, marfil y turquesa", roles: ["#031211", "#E8E4D3", "#00AEBB"],
    note: "Ink Black #031211 · Warm Ivory #E8E4D3 · Electric Teal #00AEBB",
    fondo: "#F3F1E8" /* tinte de marfil */, paper: "#E8E4D3", navy: "#031211", marino: "#031211", tinta: "#1E2726" /* tinte */,
    lime: "#00AEBB", bandaFondo: "#031211", bandaTitulo: "#00AEBB", bandaTexto: "#E8E4D3",
  },
];

const FLAG = "ss-paletas";
const CHOICE = "ss-paleta";
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string | null) => {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch {}
};

function enabledFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("paletas");
  if (q === "1") write(FLAG, "1");
  if (q === "0") { write(FLAG, null); write(CHOICE, null); }
  return read(FLAG) === "1";
}

export function PaletteSwitcher() {
  const [enabled] = useState(enabledFromUrl);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => read(CHOICE) || "original");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const p = PALETTES.find((x) => x.id === active);
    setPreviewPalette(p && p.id !== "original" ? p : null);
  }, [enabled, active]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  if (!enabled) return null;
  const choose = (id: string) => { setActive(id); write(CHOICE, id); };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-label="Paletas"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ss-label flex min-h-[44px] items-center gap-2 tracking-[0.10em] text-white/80 transition-colors hover:text-white"
        data-testid="button-palettes"
      >
        <span aria-hidden="true" className="flex">
          <span className="h-3 w-3 rounded-full border border-white/40 bg-ss-navy" />
          <span className="-ms-1 h-3 w-3 rounded-full border border-white/40 bg-ss-lime" />
          <span className="-ms-1 h-3 w-3 rounded-full border border-white/40 bg-ss-paper" />
        </span>
        <span className="hidden sm:inline">Paletas</span>
      </button>
      {open && (
        <div className="fixed inset-x-4 top-[calc(var(--ss-header-h)+8px)] z-[70] max-h-[calc(100dvh-var(--ss-header-h)-24px)] overflow-y-auto border border-white/15 bg-ss-navy p-2 shadow-lg sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-[420px]" role="menu" aria-label="Paletas de color">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={active === p.id}
              onClick={() => choose(p.id)}
              className={`flex w-full items-center gap-3 px-3 py-3 text-start text-[15px] text-white/90 hover:bg-white/10 ${active === p.id ? "bg-white/10" : ""}`}
              data-testid={`palette-${p.id}`}
            >
              <span aria-hidden="true" className="flex shrink-0 overflow-hidden rounded-sm border border-white/20">
                {p.roles.map((c, i) => <span key={i} className={i === 2 ? "h-7 w-3" : "h-7 w-6"} style={{ background: c }} />)}
              </span>
              <span className="flex flex-1 flex-col">
                <span>{p.name}</span>
                <span className="text-[12px] leading-snug text-white/60">{p.note}</span>
              </span>
              {active === p.id && <span aria-hidden="true">✓</span>}
            </button>
          ))}
          <p className="px-3 pb-1 pt-2 text-[13px] leading-snug text-white/60">
            Primario, secundario y terciario, en ese orden. Fotos y video quedan a color. Solo se ve en este navegador; cuando elijan una, se deja fija en el sitio.
          </p>
        </div>
      )}
    </div>
  );
}
