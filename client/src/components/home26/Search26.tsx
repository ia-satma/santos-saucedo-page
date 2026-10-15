import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember, PracticeGroup, IndustryGroup, News, LanguageCode } from "@shared/schema";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { chrome26 } from "./chrome26";
import { useDialog26 } from "./useDialog26";

interface SearchResults {
  team: TeamMember[];
  practiceGroups: PracticeGroup[];
  industryGroups: IndustryGroup[];
  news: News[];
}

// App.tsx no tiene rutas /industry-groups desde el reposicionamiento (4f995a6) y la tabla
// está vacía: el grupo queda listo, pero apagado, para no enlazar a una página inexistente.
const SHOW_INDUSTRIES = false;

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

type GroupId = keyof SearchResults;
// Prefijos de data-testid del Header anterior
const testPrefix: Record<GroupId, string> = {
  team: "team",
  practiceGroups: "practice",
  industryGroups: "industry",
  news: "news",
};
interface Row {
  key: string;
  href: string;
  title: string;
  /** Idioma del dato (ES o EN), que puede no ser el de la interfaz */
  titleLang?: string;
  meta?: string;
  metaLang?: string;
}

// Los datos solo existen en ES/EN: en español el campo ES; en los otros 9 idiomas el EN;
// si falta, el otro. Devuelve también su idioma para el atributo lang (lectores de pantalla).
function pick(es: boolean, esText: string | null | undefined, enText: string | null | undefined) {
  const first = es ? esText : enText;
  if (first) return { text: first, lang: chrome26[es ? "es" : "en"].attrs.lang };
  return { text: (es ? enText : esText) || "", lang: chrome26[es ? "en" : "es"].attrs.lang };
}

function formatDate(value: unknown, locale: string) {
  if (!value) return undefined;
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

// Cargo del miembro. "Staff" llega igual en titleEs: en español se omite antes que mostrar
// una etiqueta sin traducir.
function memberMeta(m: TeamMember, es: boolean): Pick<Row, "meta" | "metaLang"> {
  const { text, lang } = pick(es, m.titleEs, m.title);
  if (!text) return {};
  if (es && text.trim().toLowerCase() === "staff") return {};
  return { meta: text, metaLang: lang };
}

// Mismas rutas que el Header anterior: /team/:slug, /practice-groups/:slug, /news/:slug
function toGroups(data: SearchResults, lang: LanguageCode): { id: GroupId; rows: Row[] }[] {
  const es = lang === "es";
  const groups: { id: GroupId; rows: Row[] }[] = [
    {
      id: "team",
      rows: (data.team ?? []).map((m) => ({
        key: m.slug,
        href: `/team/${m.slug}`,
        title: m.name,
        ...memberMeta(m, es),
      })),
    },
    {
      id: "practiceGroups",
      rows: (data.practiceGroups ?? []).map((g) => {
        const name = pick(es, g.nameEs, g.name);
        return { key: g.slug, href: `/practice-groups/${g.slug}`, title: name.text, titleLang: name.lang };
      }),
    },
    {
      id: "industryGroups",
      rows: SHOW_INDUSTRIES
        ? (data.industryGroups ?? []).map((g) => {
            const name = pick(es, g.nameEs, g.name);
            return { key: g.slug, href: `/industry-groups/${g.slug}`, title: name.text, titleLang: name.lang };
          })
        : [],
    },
    {
      id: "news",
      rows: (data.news ?? []).map((n) => {
        const title = pick(es, n.titleEs, n.title);
        return {
          key: n.slug,
          href: `/news/${n.slug}`,
          title: title.text,
          titleLang: title.lang,
          // Fecha en el formato del idioma de la interfaz
          meta: formatDate(n.date, chrome26[lang].locale),
        };
      }),
    },
  ];
  return groups.filter((g) => g.rows.length > 0);
}

interface Search26Props {
  /** Idioma de la interfaz (lo decide Header26) */
  lang: LanguageCode;
  /** Escape, botón Cerrar o clic en un resultado */
  onClose: () => void;
  /** Tras cerrar o desmontar: devolver el foco */
  onClosed: () => void;
}

/** Buscador a pantalla completa. Se monta al abrir: cada apertura empieza vacía. */
export default function Search26({ lang, onClose, onClosed }: Search26Props) {
  const { attrs, search: t } = chrome26[lang];
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Enter mientras llegan resultados nuevos: ir al primero cuando lleguen
  const focusFirstWhenReady = useRef(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useDialog26(true, dialogRef, {
    initialFocus: () => inputRef.current,
    onEscape: onClose,
    onClosed,
  });

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  const active = debounced.length >= MIN_CHARS;
  // Escribiendo: ya hay dos caracteres pero la espera de 250ms no ha terminado
  const typing = query.trim().length >= MIN_CHARS && query.trim() !== debounced;
  // Misma forma de clave que el Header anterior: ["/api/search", q] → /api/search?q=
  const { data, isFetching, isError, isPlaceholderData } = useQuery<SearchResults>({
    queryKey: ["/api/search", debounced],
    enabled: active,
    // Mientras llega la nueva respuesta se mantienen los resultados anteriores
    placeholderData: (prev) => prev,
  });

  const groups = active && data ? toGroups(data, lang) : [];
  const total = groups.reduce((n, g) => n + g.rows.length, 0);
  const pending = typing || (active && (isFetching || isPlaceholderData));

  // Sin esperar los 250ms: la consulta escrita pasa a buscarse ya
  const flushQuery = () => {
    const q = query.trim();
    if (q !== debounced) setDebounced(q);
  };

  const focusFirstResult = () => dialogRef.current?.querySelector<HTMLElement>("[data-search-result]")?.focus();

  // Si al cambiar los resultados desaparece el enlace que tenía el foco, el foco cae en
  // <body>, fuera del diálogo: vuelve al campo. Y un Enter pendiente va al primer resultado.
  useEffect(() => {
    if (pending) return;
    if (focusFirstWhenReady.current) {
      focusFirstWhenReady.current = false;
      if (groups.length > 0) {
        focusFirstResult();
        return;
      }
    }
    const d = dialogRef.current;
    if (d && !d.contains(document.activeElement)) inputRef.current?.focus();
    // groups se deriva de data y debounced
  }, [data, debounced, pending]);

  // Región viva (polite): cargando, sin resultados, error o número de resultados
  let status = "";
  if (pending) status = t.loading;
  else if (active) {
    if (isError && !data) status = t.error;
    else status = total === 0 ? t.empty(debounced) : t.count(total);
  }

  // Flechas: del campo a los resultados y entre resultados (lista de enlaces, sin combobox)
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const input = inputRef.current;
    if (!input) return;
    const items = [input, ...Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-search-result]"))];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    // Resultados de la consulta anterior aún en pantalla: no se entra en ellos
    if (pending && i === 0 && e.key === "ArrowDown") {
      e.preventDefault();
      focusFirstWhenReady.current = true;
      flushQuery();
      return;
    }
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    if (next === i) return;
    e.preventDefault();
    items[next].focus();
  };

  return createPortal(
    <div
      ref={dialogRef}
      id="search-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog}
      {...attrs}
      data-testid="modal-search"
      className="ss26 fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ss-navy text-white"
    >
      <div className="ss-container flex h-[68px] shrink-0 items-center justify-between lg:h-20">
        <img src={logoBlancoLima} alt="Santos & Saucedo" className="h-[26px] w-auto lg:h-[30px]" width={183} height={30} />
        <button
          type="button"
          className="ss-label flex min-h-[44px] items-center gap-3 text-white"
          data-testid="button-close-search"
          onClick={onClose}
        >
          {t.close}
          <span aria-hidden="true" className="hidden text-white/50 lg:inline">
            Esc
          </span>
        </button>
      </div>

      <form
        role="search"
        className="ss-container mt-[clamp(28px,7vh,88px)] pb-20"
        data-testid="container-search"
        onSubmit={(e) => {
          // Enter: al primer resultado (no hay página de resultados). Si los que se ven son
          // de la consulta anterior, se busca ya y el foco va al primero cuando lleguen.
          e.preventDefault();
          if (pending) {
            focusFirstWhenReady.current = true;
            flushQuery();
            return;
          }
          focusFirstResult();
        }}
        onKeyDown={onKeyDown}
      >
        <label htmlFor="ss26-search-input" className="ss-label block text-white/75">
          {t.label}
        </label>
        <input
          ref={inputRef}
          id="ss26-search-input"
          type="search"
          value={query}
          onChange={(e) => {
            focusFirstWhenReady.current = false;
            setQuery(e.target.value);
          }}
          placeholder={t.placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby="ss26-search-hint"
          data-testid="input-global-search"
          // Sin radio, filete blanco al 30 %; el foco de teclado sobre Azul Profundo es lima
          className="mt-4 w-full appearance-none rounded-none border-0 border-b border-white/30 bg-transparent pb-3 text-[clamp(28px,2.4vw+16px,40px)] font-normal leading-tight text-white caret-white placeholder:text-white/50 focus:border-transparent focus-visible:!shadow-[inset_0_-2px_0_0_var(--ss-lime)] focus-visible:!outline-none"
        />
        {/* Con la consulta ya escrita la pista sobra a la vista; sigue para aria-describedby */}
        <p
          id="ss26-search-hint"
          className={`mt-3 max-w-[60ch] text-[15px] leading-relaxed text-white/75 ${query.trim().length >= MIN_CHARS ? "sr-only" : ""}`}
        >
          {t.hint}
        </p>

        <p role="status" aria-live="polite" className="ss-label ss-num mt-10 min-h-[1.35em] text-white/75">
          {status}
        </p>

        {groups.length > 0 && (
          <div className={`mt-6 space-y-12 transition-opacity ${pending ? "opacity-60" : ""}`}>
            {groups.map((g) => (
              <section
                key={g.id}
                aria-labelledby={`ss26-search-${g.id}`}
                className="grid gap-4 lg:grid-cols-[minmax(160px,3fr)_9fr] lg:gap-10"
              >
                <h2 id={`ss26-search-${g.id}`} className="ss-label pt-1 text-white/[.66] lg:pt-5">
                  {t.groups[g.id]}
                </h2>
                <ul className="border-t border-white/15">
                  {g.rows.map((row) => (
                    <li key={row.key} className="border-b border-white/15 last:border-b-0">
                      <Link
                        href={row.href}
                        data-search-result=""
                        data-testid={`search-result-${testPrefix[g.id]}-${row.key}`}
                        onClick={onClose}
                        // Foco: el contorno lima de 3px de .ss26 (ss26.css), más tinte y el subrayado del título
                        className="-ms-4 flex flex-col gap-1 py-4 ps-4 transition-colors focus-visible:bg-white/5"
                      >
                        <span className="text-[19px] leading-snug text-white lg:text-[21px]">
                          <span className="ss-link" lang={row.titleLang}>
                            {row.title}
                          </span>
                        </span>
                        {row.meta && (
                          <span className="ss-label ss-num text-white/75" lang={row.metaLang}>
                            {row.meta}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </form>
    </div>,
    document.body,
  );
}
