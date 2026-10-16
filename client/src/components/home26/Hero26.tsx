import { motion, useReducedMotion } from "framer-motion";
import { Reveal, SectionMark } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Hero26({ lang }: { lang: Lang26 }) {
  const t = home26[lang];
  const reduce = useReducedMotion();

  return (
    <section id="hero" {...langAttrs[lang]} className="ss-navy relative isolate overflow-hidden text-white" aria-labelledby="ss26-hero-title">
      {/* Alto mínimo solo desde lg, donde el § ocupa la columna derecha. En teléfono y tableta
          el § no se muestra y la altura la da el texto: sin hueco vacío entre entrada y cifras. */}
      <div className="ss-container grid grid-cols-1 items-center gap-x-6 gap-y-10 pt-12 lg:min-h-[min(calc(100svh-240px),660px)] lg:grid-cols-12 lg:pb-20 lg:pt-16">
        <div className="relative z-10 lg:col-span-7">
          {/* Solo la ubicación, sin "§ 00": los números de sección son los del menú y el héroe
              no es una sección del menú. La § del héroe es la marca de agua de la derecha. */}
          <Reveal>
            <p className="ss-label text-white/75">{t.hero.kicker}</p>
          </Reveal>

          <h1
            id="ss26-hero-title"
            className="ss-display mt-8 text-[clamp(46px,5.7vw,86px)] leading-[1.02] tracking-[-0.022em] lg:mt-10"
          >
            {t.hero.title.map((line, i) => (
              // pb: los trazos descendentes (p, ç) no se recortan con overflow-hidden
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                {reduce ? (
                  <span className="block">{line}</span>
                ) : (
                  <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.52, ease: EASE, delay: 0.1 + i * 0.08 }}
                  >
                    {line}
                  </motion.span>
                )}
              </span>
            ))}
          </h1>

          <Reveal delay={0.35}>
            {/* Sobre Azul Profundo, .ss-lead pasa a la sans 400 al 84 % (ss26.css) */}
            <p className="ss-lead mt-8 max-w-[36em] lg:mt-10">{t.hero.lead}</p>
          </Reveal>
        </div>

        {/* El § del logotipo como marca de agua tonal, estática: máscara de seccion.svg en
            blanco al 4.5 %, sin degradado ni filtros. Solo desde lg. Alto por ventana; el ancho
            sale del aspecto del § y nunca pasa de min(440px, 42vw). */}
        <div className="relative hidden justify-end lg:col-span-5 lg:flex">
          <SectionMark className="h-[min(58vh,520px)] max-w-[min(440px,42vw)] bg-white/[.045]" />
        </div>
      </div>

      {/* Cifras: dato, no promesa. Bajo lg, 48 px después de la entrada. Dos cifras (fundación
          y ciudades) en los dos primeros tercios desde lg; el filete sigue al ancho del contenedor */}
      <div className="ss-container relative z-10 mt-12 pb-12 lg:mt-0 lg:pb-16">
        <dl className="grid grid-cols-2 border-t border-white/15 lg:grid-cols-3">
          {t.facts.map((fact, i) => (
            <Reveal
              key={fact.label}
              delay={0.45 + i * 0.06}
              className={`flex flex-col-reverse justify-end pt-6 lg:pt-8 ${i > 0 ? "border-l border-white/15 pl-4 sm:pl-6 lg:pl-10" : "pr-4"}`}
            >
              <dt className="ss-label mt-3 text-white/75">{fact.label}</dt>
              <dd className="ss-figure">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
