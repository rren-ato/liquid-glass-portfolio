import LiquidBlobLayer from "./LiquidBlobLayer";

/**
 * Demo del sistema de "liquid glass" aplicado a formas básicas.
 * Cada tile reusa el mismo LiquidBlobLayer (blobs de color +
 * filter: url() para la distorsión real) recortado con clip-path
 * a una forma distinta — la misma técnica que en el nav/preloader,
 * solo que acá se ve la forma "en bruto" en vez de una píldora.
 */
const SHAPES = [
  { id: "square", label: "cuadrado", clip: null },
  { id: "circle", label: "círculo", clip: "circle(50% at 50% 50%)" },
  { id: "triangle", label: "triángulo", clip: "polygon(50% 2%, 2% 98%, 98% 98%)" },
  {
    id: "hexagon",
    label: "hexágono",
    clip: "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
  },
  { id: "rhombus", label: "rombo", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  {
    id: "x",
    label: "equis",
    clip:
      "polygon(20% 0%,50% 28%,80% 0%,100% 20%,72% 50%,100% 80%,80% 100%,50% 72%,20% 100%,0% 80%,28% 50%,0% 20%)",
  },
  { id: "mystery", label: "¿algo más?", clip: null, glyph: "?" },
];

export default function LiquidShapesDemo() {
  return (
    <div className="lg-shapes-grid">
      {SHAPES.map((s) => (
        <div key={s.id} className="lg-shape-tile">
          <div
            className={`lg-shape-clip ${!s.clip ? "lg-shape-rounded" : ""}`}
            style={s.clip ? { clipPath: s.clip } : undefined}
          >
            <LiquidBlobLayer />
            <div className="lg-liquid-tint" />
            {s.glyph && <span className="lg-shape-glyph">{s.glyph}</span>}
          </div>
          <span className="lg-shape-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
