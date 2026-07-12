import { useEffect, useRef, useState } from "react";

/**
 * Envuelve a `children` y los hace aparecer deslizándose de derecha
 * a izquierda cuando entran en pantalla (una sola vez). Con
 * `delay` (ms) se pueden escalonar varios elementos en secuencia.
 */
export default function RevealRTL({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`lg-reveal-rtl ${visible ? "lg-reveal-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
