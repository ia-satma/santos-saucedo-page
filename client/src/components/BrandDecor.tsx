import isotipo from "@assets/logos-v2/SantosSaucedo_Isotipo-Principal-07.png";

type Props = { className?: string };

/**
 * Flowing "wave-line" texture from the 2026 presentation — thin topographic
 * curves sweeping across a section. Uses currentColor, so set the color and
 * opacity on the wrapper (e.g. `text-white/10`). Purely decorative.
 */
export function WaveLines({ className = "" }: Props) {
  const lines = Array.from({ length: 16 }, (_, i) => {
    const y = 10 + i * 26;
    const amp = 24 + (i % 3) * 10;
    return `M -40 ${y} C 160 ${y - amp}, 320 ${y + amp}, 500 ${y - amp / 1.6} S 840 ${y + amp}, 1020 ${y - amp / 2}`;
  });
  return (
    <svg
      className={className}
      viewBox="0 0 980 430"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/**
 * The Santos & Saucedo "S" isotype used as an oversized, low-opacity watermark
 * (à la the presentation cover). Position/size/opacity via className.
 */
export function MonogramS({ className = "" }: Props) {
  return <img src={isotipo} alt="" aria-hidden="true" loading="lazy" decoding="async" className={className} />;
}
