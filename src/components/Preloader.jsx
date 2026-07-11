import { useEffect, useRef, useState } from "react";
import { ALIAS } from "../data/site";


export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [squish, setSquish] = useState({ x: 1, y: 1 });
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const drag = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, lastX: 0, lastY: 0 });

  // misma lógica de "esperar a que cargue de verdad" que antes
  useEffect(() => {
    const minTime = 1300;
    const start = Date.now();
    const finish = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(minTime - elapsed, 0);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 500);
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  const handlePointerDown = (e) => {
    setSnapping(false);
    setDragging(true);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const d = drag.current;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const vx = e.clientX - d.lastX;
    const vy = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;

    setPos({ x: d.origX + dx, y: d.origY + dy });

    // "gelatina": se estira un poco en la dirección del movimiento
    setSquish({
      x: Math.min(Math.max(1 + vx * 0.02 - vy * 0.01, 0.75), 1.3),
      y: Math.min(Math.max(1 + vy * 0.02 - vx * 0.01, 0.75), 1.3),
    });
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    setSnapping(true);
    setSquish({ x: 1, y: 1 });
    setPos({ x: 0, y: 0 });
    setTimeout(() => setSnapping(false), 650);
  };

  if (!visible) return null;

  return (
    <div className={`lg-preloader ${fading ? "lg-preloader-out" : ""}`}>
      <div
        className={`lg-glass lg-glass-liquid lg-preloader-tag ${dragging ? "lg-dragging" : ""} ${
          snapping ? "lg-snapping" : ""
        }`}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${squish.x}, ${squish.y})`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="lg-preloader-alias">{ALIAS}</span>
      </div>
      <span className="lg-preloader-hint">arrastrame ↗</span>
    </div>
  );
}
