interface PullQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
  testId?: string;
}

// Cita destacada: romana 400 en Azul Marino con filete de 1 px al inicio; atribución como etiqueta.
// Sin cursiva: la única del sitio es la frase de "Lo que creemos".
export function PullQuote({ quote, attribution, className = "", testId }: PullQuoteProps) {
  return (
    <blockquote
      className={`border-s border-ss-rule ps-6 md:ps-8 py-2 max-w-3xl ${className}`}
      data-testid={testId}
    >
      <p className="font-heading font-normal text-[clamp(24px,2.2vw,32px)] leading-[1.3] tracking-[-0.01em] text-ss-marino">
        {quote}
      </p>
      {attribution && (
        <p className="ss-label text-ss-medio mt-4">
          {attribution}
        </p>
      )}
    </blockquote>
  );
}
