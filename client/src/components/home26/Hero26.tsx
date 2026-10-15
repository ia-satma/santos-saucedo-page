import { motion, useReducedMotion } from "framer-motion";
import LiquidSeal from "./LiquidSeal";
import { Reveal, SectionHead } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";

const EASE = [0.2, 0.7, 0.2, 1] as const;
// Alto por punto de quiebre; el ancho sale del aspecto del § y nunca pasa de min(440px, 42vw).
const SEAL_BOX = "h-[180px] max-w-[min(440px,42vw)] sm:h-[240px] lg:h-[min(58vh,520px)]";

export default function Hero26({ lang }: { lang: Lang26 }) {
  const t = home26[lang];
  const reduce = useReducedMotion();

  return (
    <section id="hero" {...langAttrs[lang]} className="ss-gradient relative isolate overflow-hidden text-white" aria-labelledby="ss26-hero-title">
      <div className="ss-container grid min-h-[min(calc(100svh-240px),660px)] grid-cols-1 items-center gap-x-6 gap-y-10 pb-14 pt-12 lg:grid-cols-12 lg:pb-20 lg:pt-16">
        <div className="relative z-10 lg:col-span-7">
          <Reveal>
            <SectionHead num="00" label={t.hero.kicker} tone="dark" accent />
          </Reveal>

          <h1
            id="ss26-hero-title"
            className="ss-display mt-8 text-[clamp(56px,6.8vw,112px)] leading-[0.9] lg:mt-10"
          >
            {t.hero.title.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.04em]">
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
            <p className="ss-lead mt-8 max-w-[36em] text-white/75 lg:mt-10">{t.hero.lead}</p>
          </Reveal>
        </div>

        <div className="relative -mt-4 flex justify-end lg:col-span-5 lg:mt-0">
          {reduce ? (
            <LiquidSeal label={t.hero.sealLabel} className={SEAL_BOX} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.62, ease: EASE, delay: 0.24 }}
            >
              <LiquidSeal label={t.hero.sealLabel} className={SEAL_BOX} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Cifras: dato, no promesa */}
      <div className="ss-container relative z-10 pb-12 lg:pb-16">
        <dl className="grid grid-cols-3 border-t border-white/15">
          {t.facts.map((fact, i) => (
            <Reveal
              key={fact.label}
              delay={0.45 + i * 0.06}
              className={`flex flex-col-reverse justify-end pt-6 lg:pt-8 ${i > 0 ? "border-l border-white/15 pl-4 sm:pl-6 lg:pl-10" : "pr-4"}`}
            >
              <dt className="ss-label mt-3 text-[11px] text-white/70 sm:text-[12px]">{fact.label}</dt>
              <dd className="ss-display ss-num text-[clamp(44px,5vw,80px)] leading-none text-ss-lime">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
