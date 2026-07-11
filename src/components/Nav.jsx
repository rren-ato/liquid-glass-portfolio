import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../data/nav";
import LiquidBlobLayer from "./LiquidBlobLayer";

// duración de cada fase — subilas/bajalas para más o menos exageración
const STRETCH_MS = 130; // fase 1: el "puente" que conecta origen y destino
const STRETCH_EASE = "left 0.14s ease-out, width 0.14s ease-out";
const SETTLE_EASE =
  "left 0.45s cubic-bezier(0.32, 1.8, 0.6, 1), width 0.45s cubic-bezier(0.32, 1.8, 0.6, 1)";

// cuánto puede crecer el texto cuando está 100% tapado por el vidrio
const MAX_GROW = 0.16;

export default function Nav({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [transition, setTransition] = useState("none");
  const linkRefs = useRef([]);
  const labelRefs = useRef([]);
  const indicatorRef = useRef(null);
  const containerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const draggingRef = useRef(false);

  const rectOf = (index) => {
    const el = linkRefs.current[index];
    return el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 };
  };

  // posición inicial, sin animar
  useEffect(() => {
    setIndicator(rectOf(activeIndex));
    requestAnimationFrame(() => requestAnimationFrame(() => setTransition(SETTLE_EASE)));

    const onResize = () => setIndicator(rectOf(activeIndexRef.current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "lupa": mide en cada frame cuánto tapa el vidrio a cada texto y lo agranda en proporción
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      labelRefs.current.forEach((el, i) => {
        if (el) el.style.transform = i === activeIndex ? `scale(${1 + MAX_GROW})` : "scale(1)";
      });
      return;
    }

    let raf;
    const tick = () => {
      const indEl = indicatorRef.current;
      if (indEl) {
        const indRect = indEl.getBoundingClientRect();
        linkRefs.current.forEach((linkEl, i) => {
          const labelEl = labelRefs.current[i];
          if (!linkEl || !labelEl) return;
          const rect = linkEl.getBoundingClientRect();
          const overlap = Math.max(
            0,
            Math.min(indRect.right, rect.right) - Math.max(indRect.left, rect.left)
          );
          const ratio = rect.width > 0 ? overlap / rect.width : 0;
          labelEl.style.transform = `scale(${1 + ratio * MAX_GROW})`;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  const goTo = (index) => {
    if (index === activeIndexRef.current) return;
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

    activeIndexRef.current = index;
    setActiveIndex(index);
    onNavigate(NAV_LINKS[index].href);
  };

  // permite deslizar el dedo/mouse por el nav y que el indicador
  // vaya "siguiendo" el tab que está debajo, como en la tab bar de Música
  const indexAtPointer = (clientX) => {
    let found = null;
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) found = i;
    });
    return found;
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    containerRef.current?.setPointerCapture(e.pointerId);
    const i = indexAtPointer(e.clientX);
    if (i !== null) goTo(i);
  };
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const i = indexAtPointer(e.clientX);
    if (i !== null) goTo(i);
  };
  const endDrag = () => {
    draggingRef.current = false;
  };

  return (
    <nav className="lg-nav lg-liquid-surface">
      <LiquidBlobLayer />
      <div className="lg-liquid-tint" />
      <div
        ref={containerRef}
        className="lg-liquid-content lg-nav-links"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span
          ref={indicatorRef}
          className="lg-nav-indicator"
          style={{ left: indicator.left, width: indicator.width, transition }}
        />
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={`#${link.href}`}
            ref={(el) => (linkRefs.current[i] = el)}
            onClick={(e) => {
              e.preventDefault();
              goTo(i);
            }}
          >
            <span ref={(el) => (labelRefs.current[i] = el)} className="lg-nav-label">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
