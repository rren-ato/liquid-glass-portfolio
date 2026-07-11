import { useEffect, useRef } from "react";

/**
 * Capa de blobs de color en movimiento para vivir DENTRO de un panel
 * de vidrio (el padre necesita position:relative + overflow:hidden).
 *
 * Se distorsiona con `filter: url(#lg-glass-distortion)` (ver tokens.css,
 * clase .lg-liquid-canvas) — a propósito NO usamos backdrop-filter acá.
 * backdrop-filter + filtros SVG es una combinación poco confiable entre
 * navegadores (falla distinto en Safari, Firefox, e incluso a veces en
 * Chromium/Brave). `filter` normal con SVG sí es sólido en todos lados,
 * así que en vez de distorsionar el fondo real de la página, esta capa
 * genera su propio "fondo" de color y a ESE lo distorsionamos.
 */
export default function LiquidBlobLayer({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let t = Math.random() * 100;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#FF6EC7", "#5EE7FF", "#FFD166"];

    const paint = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      colors.forEach((color, i) => {
        const cx = w * (0.2 + i * 0.32) + Math.sin(t * 0.6 + i * 2) * w * 0.18;
        const cy = h * 0.5 + Math.cos(t * 0.9 + i * 2) * h * 0.5;
        const r = Math.max(w, h) * 0.55;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, color + "CC");
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    let active = true;
    if (reduceMotion) {
      paint();
    } else {
      const loop = () => {
        if (!active) return;
        t += 0.012;
        paint();
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`lg-liquid-canvas ${className}`} aria-hidden="true" />;
}
