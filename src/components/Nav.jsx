import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../data/nav";
import LiquidBlobLayer from "./LiquidBlobLayer";

// duración de cada fase — subilas/bajalas para más o menos exageración
const STRETCH_MS = 130; // fase 1: el "puente" que conecta origen y destino
const STRETCH_EASE = "left 0.14s ease-out, width 0.14s ease-out";
const SETTLE_EASE =
  "left 0.45s cubic-bezier(0.32, 1.8, 0.6, 1), width 0.45s cubic-bezier(0.32, 1.8, 0.6, 1)";

export default function Nav({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [transition, setTransition] = useState("none");
  const linkRefs = useRef([]);

  const rectOf = (index) => {
    const el = linkRefs.current[index];
    return el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 };
  };

  // posición inicial, sin animar
  useEffect(() => {
    setIndicator(rectOf(activeIndex));
    requestAnimationFrame(() => requestAnimationFrame(() => setTransition(SETTLE_EASE)));

    const onResize = () => setIndicator(rectOf(activeIndex));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (index) => {
    const target = rectOf(index);

    setIndicator((prev) => {
      const left = Math.min(prev.left, target.left);
      const right = Math.max(prev.left + prev.width, target.left + target.width);
      return { left, width: right - left };
    });
    setTransition(STRETCH_EASE);

    setTimeout(() => {
      setIndicator(target);
      setTransition(SETTLE_EASE);
    }, STRETCH_MS);

    setActiveIndex(index);
  };

  const handleClick = (e, link, index) => {
    e.preventDefault();
    goTo(index);
    onNavigate(link.href);
  };

  return (
    <nav className="lg-nav lg-liquid-surface">
      <LiquidBlobLayer />
      <div className="lg-liquid-tint" />
      <div className="lg-liquid-content lg-nav-links">
        <span
          className="lg-nav-indicator"
          style={{ left: indicator.left, width: indicator.width, transition }}
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
