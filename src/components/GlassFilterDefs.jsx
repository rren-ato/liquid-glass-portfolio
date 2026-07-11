/**
 * Filtro SVG de distorsión "liquid glass" (feDisplacementMap).
 * Se define UNA sola vez acá y se referencia por id desde CSS
 * (backdrop-filter: url(#lg-glass-distortion)).
 *
 * Importante: esto NO funciona en Safari (no soporta filtros SVG
 * dentro de backdrop-filter). Por eso en tokens.css la regla que
 * lo usa (.lg-glass-liquid) está separada de la regla base
 * (.lg-glass) — si el navegador no la entiende, la ignora entera
 * y se queda con el blur simple, que sí funciona en todos lados.
 */
export default function GlassFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="lg-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.015"
          numOctaves="2"
          seed="7"
          result="noise"
        >
          <animate
            attributeName="baseFrequency"
            dur="18s"
            values="0.008 0.015;0.014 0.02;0.008 0.015"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
