import { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const minTime = 900; // ms mínimo, para que no "parpadee" en conexiones rápidas
    const start = Date.now();

    const finish = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(minTime - elapsed, 0);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 500); // debe coincidir con la transición CSS
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className={`lg-preloader ${fading ? "lg-preloader-out" : ""}`} aria-hidden="true">
      <div className="lg-preloader-orb" />
      <span className="lg-preloader-text">
        cargando experiencia<span className="lg-dot">.</span>
        <span className="lg-dot">.</span>
        <span className="lg-dot">.</span>
      </span>
    </div>
  );
}
