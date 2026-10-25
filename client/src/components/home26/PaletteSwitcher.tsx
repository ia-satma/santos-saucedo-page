import { useEffect, useRef, useState } from "react";
import { setPreviewPalette, type BrandTheme } from "@/lib/brandColors";

// Selector privado para comparar paletas con el cliente (petición del 24-10-2026). Solo aparece en
// el navegador que abrió el sitio con ?paletas=1 (?paletas=0 lo quita); el público nunca lo ve.
// Cada paleta tiene los mismos cuatro papeles: superficie oscura (navy), tinta y acción (marino),
// acento (lime: la S del logo y los detalles) y papel claro (paper). La elegida se recuerda en
// ese navegador y no cambia lo guardado en el panel.
type Palette = BrandTheme & { id: string; name: string };

// Las paletas 3 a 6 llevan los códigos exactos de los videos de referencia que compartió el
// cliente (azules: #1B1E4A, #0E1D61, #021861, #255DCE, #226192); la 2 es la propuesta del verde
// sobrio y la 7 combina tinta con el verde sobrio.
export const PALETTES: Palette[] = [
  { id: "original", name: "Original", navy: "#18175B", marino: "#1D1C68", lime: "#B2EB3E", paper: "#F3F1EA" },
  { id: "verde-sobrio", name: "Marino, marfil y verde sobrio", navy: "#18175B", marino: "#1D1C68", lime: "#A9C25D", paper: "#F4EFE4" },
  { id: "atlas", name: "Deep Atlas Navy, marfil y oro", navy: "#0E1D61", marino: "#0E1D61", lime: "#B89A5A", paper: "#E8E0D2" },
  { id: "midnight", name: "Midnight Navy, piedra y carmesí", navy: "#1B1E4A", marino: "#1B1E4A", lime: "#D21319", paper: "#AFAEA2" },
  { id: "cobalto", name: "Midnight Navy, cobalto y rojo", navy: "#021861", marino: "#255DCE", lime: "#DE1110", paper: "#F3F1EA" },
  { id: "editorial", name: "Deep Editorial Blue, marfil y coral", navy: "#226192", marino: "#226192", lime: "#EF8557", paper: "#EAE6DE" },
  { id: "tinta", name: "Tinta, marfil y verde sobrio", navy: "#12181C", marino: "#22303A", lime: "#A9C25D", paper: "#EDE6D6" },
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
        Paletas
      </button>
      {open && (
        <div className="absolute end-0 top-full z-[70] mt-2 w-[min(92vw,360px)] border border-white/15 bg-ss-navy p-2 shadow-lg" role="menu" aria-label="Paletas de color">
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
                {[p.navy, p.marino, p.lime, p.paper].map((c, i) => <span key={i} className="h-6 w-5" style={{ background: c }} />)}
              </span>
              <span className="flex-1">{p.name}</span>
              {active === p.id && <span aria-hidden="true">✓</span>}
            </button>
          ))}
          <p className="px-3 pb-1 pt-2 text-[13px] leading-snug text-white/60">
            Solo se ve en este navegador. Para guardar una paleta en el sitio, cópiala en el panel: Colores de marca.
          </p>
        </div>
      )}
    </div>
  );
}
