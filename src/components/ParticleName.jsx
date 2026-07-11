import { useEffect, useRef } from "react";

/**
 * Renderiza `text` como una nube de partículas que se arma sola
 * y reacciona al mouse alejándose del cursor.
 * Respeta prefers-reduced-motion: en ese caso dibuja el texto
 * ya armado, una sola vez, sin animación.
 */
export default function ParticleName({ text }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];
    let mouseX = -9999;
    let mouseY = -9999;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isOnScreen = true;
    let isTabVisible = !document.hidden;

    async function build() {
      const cssW = container.clientWidth;
      const fontSize = Math.min(120, Math.max(40, cssW / (text.length * 0.62)));
      const cssH = fontSize * 1.6;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // esperar a que la fuente esté lista para no muestrear un fallback feo
      try {
        await document.fonts.load(`700 ${fontSize}px "Space Grotesk"`);
      } catch (e) {
        /* si falla, seguimos igual con el fallback del sistema */
      }

      const off = document.createElement("canvas");
      off.width = cssW * dpr;
      off.height = cssH * dpr;
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.textBaseline = "middle";
      octx.textAlign = "center";
      octx.font = `700 ${fontSize * dpr}px "Space Grotesk", sans-serif`;
      octx.fillText(text, off.width / 2, off.height / 2);

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const gap = Math.max(3, Math.floor(dpr * 3));
      const targets = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          const alpha = data[(y * off.width + x) * 4 + 3];
          if (alpha > 128) targets.push({ x: x / dpr, y: y / dpr });
        }
      }

      const colorA = [255, 110, 199]; // --blob-a
      const colorB = [94, 231, 255]; // --blob-b
      particles = targets.map((t) => {
        const mix = t.x / cssW;
        const r = Math.round(colorB[0] + (colorA[0] - colorB[0]) * mix);
        const g = Math.round(colorB[1] + (colorA[1] - colorB[1]) * mix);
        const b = Math.round(colorB[2] + (colorA[2] - colorB[2]) * mix);
        const startFromEdge = !reduceMotion;
        return {
          tx: t.x,
          ty: t.y,
          x: startFromEdge ? Math.random() * cssW * 1.4 - cssW * 0.2 : t.x,
          y: startFromEdge ? Math.random() * cssH * 1.4 - cssH * 0.2 : t.y,
          vx: 0,
          vy: 0,
          color: `rgb(${r},${g},${b})`,
        };
      });

      if (reduceMotion) {
        drawStatic();
      } else {
        loop();
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.tx, p.ty, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop() {
      if (!isOnScreen || !isTabVisible) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const cssW = container.clientWidth;
      const cssH = canvas.height / dpr;
      ctx.clearRect(0, 0, cssW, cssH);

      particles.forEach((p) => {
        const ax = (p.tx - p.x) * 0.08;
        const ay = (p.ty - p.y) * 0.08;
        p.vx = (p.vx + ax) * 0.82;
        p.vy = (p.vy + ay) * 0.82;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        const radius = 70;
        if (dist < radius) {
          const force = ((radius - dist) / radius) * 6;
          p.vx += (dx / (dist || 1)) * force;
          p.vy += (dy / (dist || 1)) * force;
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(loop);
    }

    build();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => (isOnScreen = entry.isIntersecting), {
      rootMargin: "150px",
    });
    io.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      io.disconnect();
    };
  }, [text]);

  return (
    <div ref={containerRef} className="lg-particle-name">
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
