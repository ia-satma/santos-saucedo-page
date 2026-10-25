import { Fragment, useEffect, useRef, type ImgHTMLAttributes, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Dos movimientos de la portada adaptados de 21st.dev (plan Builder de la agencia):
// ReadingReveal, de «Reading Text Reveal» (waleedkibhen), y CountUp, de «Count Up» (unlumen).
// Con "Reducir movimiento" ambos muestran el texto final, quieto.

function Word({ children, progress, range }: { children: ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/** Titular cuyas palabras se encienden una a una mientras el lector baja por la sección */
export function ReadingReveal({ text, id, className }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  // Empieza cuando el titular asoma por abajo y termina antes de media pantalla: en reposo se lee entero
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.45"] });
  if (reduce) return <h2 id={id} className={className}>{text}</h2>;
  const words = text.split(" ");
  return (
    <h2 ref={ref} id={id} className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <Word progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h2>
  );
}

/** Número entero que cuenta desde 0 al entrar en pantalla, una sola vez. Se escribe como texto
    (no como odómetro): misma tipografía y línea base que el resto de la cifra. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const target = useMotionValue(reduce ? to : 0);
  const spring = useSpring(target, { stiffness: 42, damping: 18, restDelta: 0.01 });
  useEffect(() => {
    if (inView) target.set(to);
  }, [inView, to, target]);
  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      }),
    [spring],
  );
  // El lector de pantalla oye la cifra final; el conteo es solo visual
  return (
    <span className={className}>
      <span className="sr-only">{to}</span>
      <span ref={ref} aria-hidden="true">
        {reduce ? to : 0}
      </span>
    </span>
  );
}

/** Foto que se asienta mientras se recorre su sección: de 1.12 a 1 (equipo de motion; una de las
    tres animaciones ligadas al scroll del sitio). Con "reducir movimiento", quieta. */
export function ScrollSettle(props: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  if (reduce) return <img ref={ref} {...props} />;
  const { style, ...rest } = props;
  return <motion.img ref={ref} {...(rest as object)} style={{ ...style, scale }} />;
}
