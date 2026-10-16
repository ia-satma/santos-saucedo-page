import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface NumberedCardProps {
  index: number;
  title: ReactNode;
  body?: ReactNode;
  /** Ya no se dibuja (sin iconos junto a los titulares); se acepta para no romper llamadas. */
  icon?: LucideIcon;
  children?: ReactNode;
  dataTestid?: string;
  className?: string;
  /** false: sin numeral, para elementos sin orden (los numerales solo cuando significan algo) */
  showIndex?: boolean;
}

/**
 * Fila abierta numerada: filete superior en Línea, numeral 01–04 en romana 350 Gris Claro
 * (showIndex={false}: sin numeral),
 * titular en romana 400 Azul Marino y descripción de 16 px en Gris Tinta. Sin caja, sombra,
 * icono ni barra.
 */
export function NumberedCard({
  index,
  title,
  body,
  children,
  dataTestid,
  className = "",
  showIndex = true,
}: NumberedCardProps) {
  const padded = String(index + 1).padStart(2, "0");
  const content = (
    <div className="flex flex-col min-w-0">
      <h3 className="ss-h3">{title}</h3>
      {body && (
        <p className="mt-2 text-base leading-[1.55] text-ss-tinta">{body}</p>
      )}
      {children}
    </div>
  );

  return (
    <article
      className={`relative h-full border-t border-ss-rule pt-6 ${className}`}
      data-testid={dataTestid}
    >
      {showIndex ? (
        <div className="grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-5">
          <span aria-hidden="true" className="ss-numeral pt-0.5">
            {padded}
          </span>
          {content}
        </div>
      ) : (
        content
      )}
    </article>
  );
}
