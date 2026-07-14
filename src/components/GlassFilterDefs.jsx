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
          scale="55"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/*
        Aberración cromática — separa el texto en sus canales R/G/B y
        desplaza el rojo y el azul en direcciones opuestas (el verde
        queda fijo en el medio). A diferencia del filtro de arriba,
        este se aplica con `filter: url()` normal (NO backdrop-filter),
        que sí tiene soporte sólido en todos los navegadores, Safari
        incluido — por eso este funciona siempre.

        dx/dy de los feOffset se actualizan por JS (ver Nav.jsx) según
        cuánto tapa el vidrio a cada letra, así la distorsión aparece
        justo donde corresponde en vez de estar siempre prendida.
      */}
      <filter id="lg-chroma-filter" x="-30%" y="-30%" width="160%" height="160%">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="lg-chroma-red-channel"
        />
        <feOffset id="lg-chroma-r" in="lg-chroma-red-channel" dx="0" dy="0" result="lg-chroma-red" />

        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="lg-chroma-green"
        />

        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="lg-chroma-blue-channel"
        />
        <feOffset id="lg-chroma-b" in="lg-chroma-blue-channel" dx="0" dy="0" result="lg-chroma-blue" />

        <feBlend in="lg-chroma-red" in2="lg-chroma-green" mode="screen" result="lg-chroma-rg" />
        <feBlend in="lg-chroma-rg" in2="lg-chroma-blue" mode="screen" />
      </filter>
    </svg>
  );
}
