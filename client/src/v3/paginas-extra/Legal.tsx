/* Cuerpo de los avisos legales (Aviso de privacidad y Términos de uso) con el lenguaje de la demo v3:
   índice fijo a la izquierda (en el teléfono, plegable), el texto a una medida de lectura cómoda con sus
   títulos en la romana y, al final, la banda azul con el correo y el teléfono. Solo maquetación: el texto
   legal de cada idioma sigue en su página y en el panel ("privacy", "terms"). */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { keepFirmName } from "@/lib/firmName";
import { useV3Lang } from "@/v3/shared";
import { PX } from "./textos";

// Teléfonos aislados de izquierda a derecha (<bdi dir="ltr">): en árabe, dentro del texto
// corrido, los grupos de cifras salían invertidos ("2086 8335 81 52+"). "Santos & Saucedo"
// con espacios duros: el nombre no se parte entre líneas.
function isolatePhones(text: string): ReactNode[] {
  return keepFirmName(text)
    .split(/(\+\d[\d ]{6,}\d)/)
    .map((part, i) => (i % 2 === 1 ? <bdi key={i} dir="ltr">{part}</bdi> : part));
}

// Una línea corta que termina en dos puntos y abre lo que sigue en su bloque («Datos de identificación:»,
// «Dirección:») es un subtítulo: va en peso medio para que el texto se recorra a simple vista.
const isLead = (line: string) => /[:：]\s*$/.test(line) && line.trim().length <= 90;

// Texto de una sección: párrafos separados por línea en blanco; las líneas que empiezan por
// "• " pasan a una lista real con sangría francesa (al partirse, el texto queda alineado y no
// bajo la viñeta). El resto conserva sus saltos de línea (direcciones, horarios).
export function renderLegalText(text: string): ReactNode[] {
  return text.split(/\n{2,}/).map((block, blockIndex) => {
    const parts: ReactNode[] = [];
    const all = block.split("\n");
    let lines: string[] = [];
    let items: string[] = [];
    const flushLines = () => {
      if (lines.length) {
        parts.push(<p key={`p${parts.length}`} style={{ whiteSpace: "pre-line" }}>{isolatePhones(lines.join("\n"))}</p>);
        lines = [];
      }
    };
    const flushItems = () => {
      if (items.length) {
        parts.push(
          <ul key={`u${parts.length}`}>
            {items.map((item, i) => <li key={i}>{isolatePhones(item)}</li>)}
          </ul>
        );
        items = [];
      }
    };
    all.forEach((line, i) => {
      if (line.startsWith("• ")) {
        flushLines();
        items.push(line.slice(2));
      } else if (i < all.length - 1 && isLead(line)) {
        flushItems();
        flushLines();
        parts.push(<p key={`s${parts.length}`} className="px-legal__sub">{isolatePhones(line)}</p>);
      } else {
        flushItems();
        lines.push(line);
      }
    });
    flushLines();
    flushItems();
    return <div key={blockIndex}>{parts}</div>;
  });
}

/** «1. Introducción» → número y título por separado (el número va en versalitas, el título en la romana) */
const splitTitle = (title: string) => {
  const m = /^(\d+)[.．]\s*(.+)$/.exec(title);
  return m ? { n: m[1], t: m[2] } : { n: "", t: title };
};

export type LegalSection = { id: string; title: string; content: string };

export function LegalBody({
  sections, testPrefix, anchorPrefix, contactText, email, emailTestId, phone, phoneHref, phoneTestId,
}: {
  sections: LegalSection[];
  /** "privacy" o "terms": los data-testid de siempre (section-privacy-…, link-privacy-email…) */
  testPrefix: string;
  /** Prefijo de los id de cada sección (los enlaces del índice) */
  anchorPrefix: string;
  contactText: string;
  email: string;
  emailTestId: string;
  phone: string;
  phoneHref: string;
  phoneTestId: string;
}) {
  const { locale, attrs } = useV3Lang();
  const T = PX[locale];
  const docsRef = useRef<HTMLDivElement>(null);
  const indiceRef = useRef<HTMLDetailsElement>(null);
  const [actual, setActual] = useState("");

  // Índice: abierto siempre en la computadora; en el teléfono y la tableta, plegado hasta que se toca
  useEffect(() => {
    const el = indiceRef.current;
    if (!el || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 1001px)");
    const sync = () => { el.open = mq.matches; };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // La sección que se está leyendo queda marcada en el índice: la última cuyo título ya pasó el primer
  // tercio de la pantalla (arriba del todo, ninguna). Se calcula al desplazarse, una vez por cuadro.
  useEffect(() => {
    const root = docsRef.current;
    if (!root) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".px-legal__sec"));
    let raf = 0;
    const medir = () => {
      raf = 0;
      const linea = window.innerHeight * 0.32;
      let id = "";
      for (const s of secs) {
        if (s.getBoundingClientRect().top <= linea) id = s.id;
        else break;
      }
      // Pasado el final del texto, ninguna
      if (id && root.getBoundingClientRect().bottom < linea) id = "";
      setActual(id);
    };
    const pedir = () => { if (!raf) raf = window.requestAnimationFrame(medir); };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [sections]);

  // En el teléfono, al elegir una sección el índice se pliega
  const elegir = () => {
    const el = indiceRef.current;
    if (el && window.matchMedia && !window.matchMedia("(min-width: 1001px)").matches) el.open = false;
  };

  return (
    <>
      <section className="px-legal">
        <div className="sh-wrap">
          <div className="px-legal__grid">
            <nav className="px-legal__nav" aria-label={T.indiceLabel}>
              <details ref={indiceRef} className="px-indice">
                <summary><span className="sh-cap px-indice__k" {...attrs}>{T.indice}</span></summary>
                <ol className="px-indice__lista">
                  {sections.map((s) => {
                    const { n, t } = splitTitle(s.title);
                    const id = `${anchorPrefix}-${s.id}`;
                    return (
                      <li key={s.id}>
                        <a href={`#${id}`} className={actual === id ? "is-on" : undefined} aria-current={actual === id ? "true" : undefined} onClick={elegir}>
                          <span className="px-indice__n" aria-hidden={n ? undefined : true}>{n}</span>
                          <span>{t}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </details>
            </nav>

            <div className="px-legal__docs" ref={docsRef}>
              {sections.map((section) => {
                const { n, t } = splitTitle(section.title);
                return (
                  <section
                    key={section.id}
                    id={`${anchorPrefix}-${section.id}`}
                    className="px-legal__sec"
                    aria-labelledby={`${anchorPrefix}-${section.id}-h`}
                    data-testid={`section-${testPrefix}-${section.id}`}
                  >
                    <h2 id={`${anchorPrefix}-${section.id}-h`} className="px-legal__h" data-testid={`text-section-title-${section.id}`}>
                      {n ? <span className="px-legal__n">{n}.</span> : null}
                      <span>{t}</span>
                    </h2>
                    <div className="px-legal__txt" data-testid={`text-section-content-${section.id}`}>
                      {renderLegalText(section.content)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contacto: el correo y el teléfono en la romana, sobre la banda azul */}
      <section className="px-legal-contacto sobre-azul">
        <div className="sh-wrap px-legal-contacto__in">
          <p className="px-legal-contacto__p">{contactText}</p>
          <ul className="px-legal-contacto__datos">
            <li>
              <a href={`mailto:${email}`} data-testid={emailTestId}>{email}</a>
            </li>
            {phone ? (
              <li>
                <a href={phoneHref} data-testid={phoneTestId}><span dir="ltr">{phone}</span></a>
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </>
  );
}
