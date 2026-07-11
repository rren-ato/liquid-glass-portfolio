import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../data/nav";
import LiquidBlobLayer from "./LiquidBlobLayer";

export default function Nav({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false); // evita animar desde 0,0 al montar
  const linkRefs = useRef([]);

  const measure = (index) => {
    const el = linkRefs.current[index];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  };

  // medir posición inicial SIN animación, y recién después habilitar la transición
  useEffect(() => {
    measure(activeIndex);
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    const onResize = () => measure(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    measure(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleClick = (e, link, index) => {
    e.preventDefault();
    setActiveIndex(index);
    onNavigate(link.href);
  };

  return (
    <nav className="lg-nav lg-liquid-surface">
      <LiquidBlobLayer />
      <div className="lg-liquid-tint" />
      <div className="lg-liquid-content lg-nav-links">
        <span
          className="lg-nav-indicator"
          style={{
            left: indicator.left,
            width: indicator.width,
            transition: ready ? undefined : "none",
          }}
        />
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={`#${link.href}`}
            ref={(el) => (linkRefs.current[i] = el)}
            onClick={(e) => handleClick(e, link, i)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
