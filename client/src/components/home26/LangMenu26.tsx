import { useCmsContent } from "@/hooks/useCmsContent";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/schema";
import { chrome26 } from "./chrome26";

// ES y EN van a la vista; los otros 8 (orden de shared/schema) van en la lista compacta
const MAIN: LanguageCode[] = ["es", "en"];
const OTHERS = SUPPORTED_LANGUAGES.filter((l) => !MAIN.includes(l.code));

// El árabe no admite espaciado entre letras (rompe las ligaduras) y se escribe de derecha a izquierda
const nameProps = (code: LanguageCode) =>
  code === "ar" ? { dir: "rtl" as const, className: "tracking-normal" } : {};

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.25}>
      <circle cx="8" cy="8" r="6.5" />
      <ellipse cx="8" cy="8" rx="2.75" ry="6.5" />
      <path d="M1.5 8h13" />
    </svg>
  );
}

/** Escritorio: ES / EN a la vista y un botón con los otros 8 idiomas en una lista emergente. */
export function LangSwitch26({ lang, className = "" }: { lang: LanguageCode; className?: string }) {
  const { language, setLanguage } = useLanguage();
  const liveChrome = useCmsContent("chrome", chrome26);
  const t = liveChrome[lang].langs;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeOther = OTHERS.find((l) => l.code === language);

  // Clic fuera: cierra la lista
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} role="group" aria-label={t.group}>
      <div className="ss-label flex items-center gap-2">
        {MAIN.map((code, i) => (
          <span key={code} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-white/50">/</span>}
            <button
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={language === code}
              className={`min-h-[44px] uppercase transition-colors ${language === code ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              {code}
            </button>
          </span>
        ))}
      </div>

      <div
        ref={wrapRef}
        className="relative"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
            buttonRef.current?.focus();
          }
        }}
        onBlur={(e) => {
          // Tab fuera del control: se cierra (relatedTarget nulo = clic en zona sin foco, lo atiende pointerdown)
          const next = e.relatedTarget as Node | null;
          if (open && next && !e.currentTarget.contains(next)) setOpen(false);
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="ss26-lang-others"
          aria-label={activeOther ? `${t.others} (${activeOther.code.toUpperCase()})` : t.others}
          title={t.others}
          onClick={() => setOpen((v) => !v)}
          data-testid="button-lang-others"
          className={`ss-label flex min-h-[44px] items-center gap-2 transition-colors hover:text-white ${
            activeOther || open ? "text-white" : "text-white/60"
          }`}
        >
          {/* Solo el globo en todo ancho: el texto competía con el menú principal.
              El nombre accesible está en aria-label (y title para el ratón). */}
          <GlobeIcon />
          {/* Idioma activo fuera de ES/EN: su código, subrayado en blanco (la lima es del menú actual) */}
          {activeOther && <span className="ss-link pt-[2px] [background-size:100%_1px]">{activeOther.code}</span>}
        </button>

        {open && (
          <div
            id="ss26-lang-others"
            // Pegada al borde inferior de la cabecera (80px − 44px del botón) / 2 = 18px.
            // end-0: alineada al final del botón (a la izquierda en árabe)
            className="absolute end-0 top-[calc(100%+18px)] z-10 min-w-[220px] border border-white/15 bg-ss-navy py-2"
          >
            <p id="ss26-lang-others-title" className="ss-label px-5 pb-1 pt-2 text-white/75">
              {t.others}
            </p>
            <ul aria-labelledby="ss26-lang-others-title">
              {OTHERS.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    lang={l.code}
                    aria-pressed={language === l.code}
                    onClick={() => choose(l.code)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-6 border-s-2 border-transparent pe-5 ps-[18px] text-start text-[17px] text-white/80 transition-colors hover:bg-white/5 hover:text-white aria-pressed:border-white/85 aria-pressed:text-white"
                  >
                    <span {...nameProps(l.code)}>{l.nameNative}</span>
                    <span aria-hidden="true" className="ss-label text-white/50">
                      {l.code}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** Menú móvil: ES / EN primero, como en escritorio; los otros 8 en una lista discreta de dos columnas. */
export function LangList26({ lang }: { lang: LanguageCode }) {
  const liveChrome = useCmsContent("chrome", chrome26);
  const { language, setLanguage } = useLanguage();
  return (
    <div role="group" aria-labelledby="ss26-menu-lang">
      <p id="ss26-menu-lang" className="ss-label text-white/75">
        {liveChrome[lang].langs.label}
      </p>
      <ul className="ss-label mt-1 flex items-center gap-2">
        {MAIN.map((code, i) => {
          const l = SUPPORTED_LANGUAGES.find((x) => x.code === code)!;
          return (
            <li key={code} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-white/50">
                  /
                </span>
              )}
              <button
                type="button"
                lang={code}
                aria-label={l.nameNative}
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
                className="min-h-[44px] uppercase text-white/60 transition-colors hover:text-white aria-pressed:text-white"
              >
                {code}
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="grid grid-cols-2 gap-x-6">
        {OTHERS.map((l) => (
          <li key={l.code}>
            <button
              type="button"
              lang={l.code}
              aria-pressed={language === l.code}
              onClick={() => setLanguage(l.code)}
              className="flex min-h-[44px] w-full items-center text-start text-[17px] normal-case tracking-normal text-white/60 transition-colors hover:text-white aria-pressed:text-white aria-pressed:underline aria-pressed:decoration-white/85 aria-pressed:decoration-1 aria-pressed:underline-offset-[6px]"
            >
              <span {...nameProps(l.code)}>{l.nameNative}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
