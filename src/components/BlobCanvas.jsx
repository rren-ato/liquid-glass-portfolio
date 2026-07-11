import { useEffect, useRef } from "react";

export default function BlobCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, raf;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#FF6EC7", "#5EE7FF", "#FFD166"];
    const blobs = colors.map((c, i) => ({
      color: c,
      baseX: (i + 1) * (window.innerWidth / (colors.length + 1)),
      baseY: window.innerHeight * (0.3 + i * 0.2),
      r: 220 + i * 40,
      t: i * 100,
    }));

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      blobs.forEach((b, i) => {
        b.t += reduceMotion ? 0 : 0.006;
        const driftX = Math.sin(b.t + i) * 60;
        const driftY = Math.cos(b.t * 1.3 + i) * 60;
        const pullX = (mouseX - b.baseX) * 0.04;
        const pullY = (mouseY - b.baseY) * 0.04;
        const x = b.baseX + driftX + pullX;
        const y = b.baseY + driftY + pullY;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        grad.addColorStop(0, b.color + "CC");
        grad.addColorStop(1, b.color + "00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="lg-canvas" />;
}
