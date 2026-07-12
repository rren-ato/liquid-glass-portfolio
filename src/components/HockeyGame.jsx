import { useEffect, useRef, useState } from "react";

/**
 * Mini air hockey jugable — vos controlás la paleta de abajo
 * (mouse o dedo), una IA simple controla la de arriba.
 * Colores tomados directo de los tokens del sitio, no de una
 * referencia externa (no pude ver el diseño exacto del video
 * de origen, así que este es un diseño propio).
 */
export default function HockeyGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W, H;
    const PADDLE_R = 22;
    const PUCK_R = 11;
    const GOAL_HALF = 46;

    let puck = { x: 0, y: 0, vx: 0, vy: 0 };
    let player = { x: 0, y: 0, px: 0, py: 0 };
    let ai = { x: 0, y: 0 };
    let frozen = 40; // frames de pausa al arrancar/después de un gol
    let scoreRef = { player: 0, ai: 0 };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.width * 1.3;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetPuck();
      player.x = W / 2;
      player.y = H - 46;
      ai.x = W / 2;
      ai.y = 46;
    };

    const resetPuck = () => {
      puck.x = W / 2;
      puck.y = H / 2;
      const angle = Math.random() * Math.PI * 2;
      puck.vx = Math.cos(angle) * 2.4;
      puck.vy = Math.sin(angle) * 2.4;
      frozen = 40;
    };

    resize();
    window.addEventListener("resize", resize);

    let isOnScreen = true;
    let isTabVisible = !document.hidden;
    const io = new IntersectionObserver(([entry]) => (isOnScreen = entry.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(wrap);
    const onVisibility = () => (isTabVisible = !document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    // --- control de la paleta del jugador (mouse / touch) ---
    const setPlayerFromClient = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, x));
      y = Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, y));
      player.px = player.x;
      player.py = player.y;
      player.x = x;
      player.y = y;
    };
    const onPointerMove = (e) => {
      if (e.cancelable) e.preventDefault();
      setPlayerFromClient(e.clientX, e.clientY);
    };
    canvas.addEventListener("pointerdown", (e) => canvas.setPointerCapture(e.pointerId));
    canvas.addEventListener("pointermove", onPointerMove, { passive: false });

    const colors = {
      table: "rgba(255,255,255,0.03)",
      line: "rgba(255,255,255,0.18)",
      player: "#5EE7FF",
      ai: "#FF6EC7",
      puck: "#F5F3FF",
    };

    let raf;
    const step = () => {
      if (isOnScreen && isTabVisible) {
        update();
        draw();
      }
      raf = requestAnimationFrame(step);
    };

    function update() {
      if (frozen > 0) {
        frozen--;
        return;
      }

      // IA: sigue al puck en X con velocidad limitada
      const aiSpeed = 3.2;
      const dx = puck.x - ai.x;
      ai.x += Math.max(-aiSpeed, Math.min(aiSpeed, dx));
      ai.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, ai.x));
      ai.y = 46;

      puck.x += puck.vx;
      puck.y += puck.vy;

      // paredes laterales
      if (puck.x < PUCK_R) {
        puck.x = PUCK_R;
        puck.vx *= -1;
      }
      if (puck.x > W - PUCK_R) {
        puck.x = W - PUCK_R;
        puck.vx *= -1;
      }

      // gol arriba (IA recibe) / abajo (jugador recibe)
      const inGoalRange = puck.x > W / 2 - GOAL_HALF && puck.x < W / 2 + GOAL_HALF;
      if (puck.y < -PUCK_R) {
        if (inGoalRange) {
          scoreRef.player++;
          setScore({ ...scoreRef });
        }
        resetPuck();
        return;
      }
      if (puck.y > H + PUCK_R) {
        if (inGoalRange) {
          scoreRef.ai++;
          setScore({ ...scoreRef });
        }
        resetPuck();
        return;
      }
      if (puck.y < PUCK_R && !inGoalRange) {
        puck.y = PUCK_R;
        puck.vy *= -1;
      }
      if (puck.y > H - PUCK_R && !inGoalRange) {
        puck.y = H - PUCK_R;
        puck.vy *= -1;
      }

      // colisión con paletas
      collide(player, player.x - player.px, player.y - player.py);
      collide(ai, 0, 0);

      // fricción leve + tope de velocidad
      const speed = Math.hypot(puck.vx, puck.vy);
      const maxSpeed = 9;
      if (speed > maxSpeed) {
        puck.vx = (puck.vx / speed) * maxSpeed;
        puck.vy = (puck.vy / speed) * maxSpeed;
      }
    }

    function collide(paddle, paddleVx, paddleVy) {
      const dx = puck.x - paddle.x;
      const dy = puck.y - paddle.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minDist = PADDLE_R + PUCK_R;
      if (dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        puck.x = paddle.x + nx * minDist;
        puck.y = paddle.y + ny * minDist;
        const speed = Math.hypot(puck.vx, puck.vy) + 1.5;
        puck.vx = nx * speed + paddleVx * 0.4;
        puck.vy = ny * speed + paddleVy * 0.4;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = colors.table;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 40, 0, Math.PI * 2);
      ctx.stroke();

      // arcos
      ctx.strokeStyle = colors.player;
      ctx.beginPath();
      ctx.moveTo(W / 2 - GOAL_HALF, H - 2);
      ctx.lineTo(W / 2 + GOAL_HALF, H - 2);
      ctx.stroke();
      ctx.strokeStyle = colors.ai;
      ctx.beginPath();
      ctx.moveTo(W / 2 - GOAL_HALF, 2);
      ctx.lineTo(W / 2 + GOAL_HALF, 2);
      ctx.stroke();

      drawDisc(puck.x, puck.y, PUCK_R, colors.puck);
      drawDisc(ai.x, ai.y, PADDLE_R, colors.ai);
      drawDisc(player.x, player.y, PADDLE_R, colors.player);
    }

    function drawDisc(x, y, r, color) {
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "88");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <div className="lg-hockey">
      <div className="lg-hockey-score">
        <span className="lg-hockey-score-tag" style={{ color: "var(--blob-b)" }}>
          vos {score.player}
        </span>
        <span className="lg-hockey-score-tag" style={{ color: "var(--blob-a)" }}>
          ia {score.ai}
        </span>
      </div>
      <div ref={wrapRef} className="lg-hockey-table">
        <canvas ref={canvasRef} />
      </div>
      <span className="lg-hockey-hint">arrastrá tu paleta (abajo) ↕</span>
    </div>
  );
}
