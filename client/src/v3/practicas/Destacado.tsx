/* Banda azul de una práctica sin lámina (litigio): sus servicios, del texto de la práctica en el panel,
   sobre el azul noche y junto a una foto de la oficina de la firma (de las fotos del panel, cmsMedia).
   Es la banda «sh-filo» de la demo (la de la filosofía en el Inicio): foto a la derecha que se funde en
   el azul, texto a la izquierda; aquí con el tamaño de título de una sección. La foto se acerca una vez al
   entrar (salvo en Modo Mario), como en el Inicio. */
import { useEffect, useRef, type ReactNode } from "react";
import { useCmsMedia, mediaDefaults } from "@/lib/cmsMedia";
import { officePhotoAlt } from "@/components/home26/PhotoBand";
import { useLanguage } from "@/contexts/LanguageContext";
import { keepFirmName } from "@/lib/firmName";
import type { Feature } from "./config";

export function Destacado({ feature, children, testId }: { feature: Feature; children: ReactNode; testId?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const { photos } = useCmsMedia();
  const foto = photos[feature.photo] ?? mediaDefaults.photos[feature.photo];
  const alt = officePhotoAlt[language]?.[feature.photo] ?? officePhotoAlt.en[feature.photo] ?? "";
  const srcSet = foto.smallUrl && foto.smallUrl !== foto.url ? `${foto.smallUrl} 768w, ${foto.url} 1536w` : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { el?.classList.add("is-visto"); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { el.classList.add("is-visto"); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="sh-filo sobre-azul pd-dest" data-testid={testId}>
      <figure className="sh-filo__foto pd-dest__foto">
        <img
          src={foto.url}
          srcSet={srcSet}
          sizes="(max-width: 820px) 100vw, 60vw"
          alt={keepFirmName(alt)}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: feature.pos }}
        />
      </figure>
      <div className="sh-wrap sh-filo__in pd-dest__in">{children}</div>
    </section>
  );
}
