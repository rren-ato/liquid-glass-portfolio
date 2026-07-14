import { useEffect, useRef, useState } from "react";

/**
 * A* vs Dijkstra — un explorador (diseño propio, no un personaje con
 * derechos de autor) tiene que cruzar un río construyendo su propio
 * puente. Cruzar cuesta más que caminar por tierra, así que el
 * algoritmo no siempre elige la línea más recta — elige la más barata.
 *
 * Dijkstra = A* con heurística en cero: explora "a ciegas" en todas
 * direcciones por igual. A* usa distancia Manhattan al objetivo para
 * priorizar explorar hacia donde conviene — por eso explora mucho
 * menos para llegar al mismo resultado.
 */
const COLS = 14;
const ROWS = 9;
const RIVER_COST = 4;
const GRASS_COST = 1;

function generateMap() {
  const riverWidth = 2 + Math.floor(Math.random() * 2);
  let riverStart = 5 + Math.floor(Math.random() * 3);
  const terrain = [];
  for (let y = 0; y < ROWS; y++) {
    if (y > 0 && Math.random() < 0.55) {
      riverStart += Math.random() < 0.5 ? -1 : 1;
      riverStart = Math.max(3, Math.min(COLS - riverWidth - 2, riverStart));
    }
    const row = [];
    for (let x = 0; x < COLS; x++) {
      row.push(x >= riverStart && x < riverStart + riverWidth ? "river" : "grass");
    }
    terrain.push(row);
  }
  return {
    terrain,
    start: { x: 0, y: Math.floor(Math.random() * ROWS) },
    goal: { x: COLS - 1, y: Math.floor(Math.random() * ROWS) },
  };
}

const key = (n) => `${n.x},${n.y}`;
const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const cellCost = (terrain, x, y) => (terrain[y][x] === "river" ? RIVER_COST : GRASS_COST);

function runSearch(terrain, start, goal, useHeuristic) {
  const open = [{ ...start, f: useHeuristic ? heuristic(start, goal) : 0 }];
  const gScore = { [key(start)]: 0 };
  const cameFrom = {};
  const visited = new Set();
  const exploredOrder = [];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    const ckey = key(current);
    if (visited.has(ckey)) continue;
    visited.add(ckey);
    exploredOrder.push({ x: current.x, y: current.y });

    if (current.x === goal.x && current.y === goal.y) break;

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];
    for (const n of neighbors) {
      if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS) continue;
      const nkey = key(n);
      const tentative = gScore[ckey] + cellCost(terrain, n.x, n.y);
      if (gScore[nkey] === undefined || tentative < gScore[nkey]) {
        gScore[nkey] = tentative;
        cameFrom[nkey] = ckey;
        open.push({ ...n, f: tentative + (useHeuristic ? heuristic(n, goal) : 0) });
      }
    }
  }

  const path = [];
  let curKey = gScore[key(goal)] !== undefined ? key(goal) : null;
  while (curKey) {
    const [x, y] = curKey.split(",").map(Number);
    path.unshift({ x, y });
    curKey = cameFrom[curKey];
  }

  return { exploredOrder, path, totalCost: gScore[key(goal)] };
}

export default function PathfindingQuest() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [algorithm, setAlgorithm] = useState("astar");
  const [mapData, setMapData] = useState(() => generateMap());
  const [stats, setStats] = useState(null);
  const animRef = useRef({ phase: "idle", revealCount: 0, walkT: 0, result: null, color: "" });

  const handleSearch = () => {
    const result = runSearch(mapData.terrain, mapData.start, mapData.goal, algorithm === "astar");
    animRef.current = {
      phase: "exploring",
      revealCount: 0,
      walkT: 0,
      result,
      color: algorithm === "astar" ? "126,255,148" : "255,99,99",
    };
    setStats(null);
  };

  const handleNewMap = () => {
    setMapData(generateMap());
    animRef.current = { phase: "idle", revealCount: 0, walkT: 0, result: null, color: "" };
    setStats(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let isOnScreen = true;
    let isTabVisible = !document.hidden;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.width * (ROWS / COLS);
    };
    resize();
    window.addEventListener("resize", resize);

    const io = new IntersectionObserver(([e]) => (isOnScreen = e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(wrap);
    const onVis = () => (isTabVisible = !document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const step = () => {
      const a = animRef.current;
      if (a.phase === "exploring" && a.result) {
        a.revealCount = Math.min(a.revealCount + 2, a.result.exploredOrder.length);
        if (a.revealCount >= a.result.exploredOrder.length) {
          a.phase = a.result.path.length ? "walking" : "stuck";
          if (a.phase === "stuck") setStats({ explored: a.result.exploredOrder.length, noPath: true });
        }
      } else if (a.phase === "walking") {
        a.walkT = Math.min(a.walkT + 0.018, 1);
        if (a.walkT >= 1) {
          a.phase = "done";
          setStats({
            explored: a.result.exploredOrder.length,
            cost: a.result.totalCost,
            steps: a.result.path.length,
          });
        }
      }
    };

    const render = () => {
      const a = animRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cw = w / COLS;
      const ch = h / ROWS;
      ctx.clearRect(0, 0, w, h);

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const isRiver = mapData.terrain[y][x] === "river";
          ctx.fillStyle = isRiver ? "rgba(94,180,255,0.3)" : "rgba(255,255,255,0.04)";
          ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
        }
      }

      if (a.result) {
        const shown =
          a.phase === "exploring" ? a.revealCount : a.result.exploredOrder.length;
        for (let i = 0; i < shown; i++) {
          const n = a.result.exploredOrder[i];
          ctx.fillStyle = `rgba(${a.color},0.4)`;
          ctx.fillRect(n.x * cw + 1, n.y * ch + 1, cw - 2, ch - 2);
          ctx.strokeStyle = `rgba(${a.color},0.9)`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(n.x * cw + 1.5, n.y * ch + 1.5, cw - 3, ch - 3);

          // el río se repinta encima del escaneo para que siga
          // leyéndose como agua aunque esa celda ya esté explorada
          if (mapData.terrain[n.y][n.x] === "river") {
            ctx.fillStyle = "rgba(94,180,255,0.28)";
            ctx.fillRect(n.x * cw + 1, n.y * ch + 1, cw - 2, ch - 2);
          }
        }

        if (a.phase === "walking" || a.phase === "done") {
          const path = a.result.path;
          const explorerT = a.phase === "done" ? 1 : a.walkT;
          const explorerPos = explorerT * (path.length - 1);
          const upTo = a.phase === "done" ? path.length : Math.ceil(path.length * a.walkT);

          ctx.strokeStyle = "#FFD166";
          ctx.lineWidth = Math.max(2, cw * 0.15);
          ctx.beginPath();
          path.slice(0, upTo).forEach((n, i) => {
            const px = n.x * cw + cw / 2;
            const py = n.y * ch + ch / 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          // tablones del puente: se van "clavando" uno por uno a medida
          // que el explorador realmente llega a esa celda de río, no
          // todos de golpe al pisar el borde de la celda.
          path.forEach((n, i) => {
            if (mapData.terrain[n.y][n.x] !== "river") return;
            const buildProgress = a.phase === "done" ? 1 : Math.max(0, Math.min(1, explorerPos - i + 1));
            if (buildProgress <= 0) return;

            ctx.strokeStyle = "rgba(15,12,34,0.7)";
            ctx.lineWidth = 1;
            const px = n.x * cw;
            const py = n.y * ch;
            const plankSlots = [];
            for (let p = 2; p < ch; p += 5) plankSlots.push(p);
            const plankCount = Math.ceil(plankSlots.length * buildProgress);
            plankSlots.slice(0, plankCount).forEach((p) => {
              ctx.beginPath();
              ctx.moveTo(px + 2, py + p);
              ctx.lineTo(px + cw - 2, py + p);
              ctx.stroke();
            });
          });
        }
      }

      // meta
      const goalPx = mapData.goal.x * cw + cw / 2;
      const goalPy = mapData.goal.y * ch + ch / 2;
      ctx.fillStyle = "#FFD166";
      ctx.beginPath();
      ctx.moveTo(goalPx - cw * 0.15, goalPy - ch * 0.3);
      ctx.lineTo(goalPx - cw * 0.15, goalPy + ch * 0.3);
      ctx.lineTo(goalPx + cw * 0.2, goalPy - ch * 0.1);
      ctx.closePath();
      ctx.fill();

      // explorador (diseño propio: circulo con gradiente + gorra triangular)
      let ex = mapData.start.x * cw + cw / 2;
      let ey = mapData.start.y * ch + ch / 2;
      if (a.result && (a.phase === "walking" || a.phase === "done")) {
        const path = a.result.path;
        const t = a.phase === "done" ? 1 : a.walkT;
        const idx = Math.min(path.length - 1, Math.floor(t * (path.length - 1)));
        const n = path[idx] || mapData.start;
        ex = n.x * cw + cw / 2;
        ey = n.y * ch + ch / 2;
      }
      const r = Math.min(cw, ch) * 0.32;
      const grad = ctx.createRadialGradient(ex - r * 0.3, ey - r * 0.3, 1, ex, ey, r);
      grad.addColorStop(0, "#FF6EC7");
      grad.addColorStop(1, "#5EE7FF");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14102B";
      ctx.beginPath();
      ctx.moveTo(ex - r * 0.6, ey - r * 0.5);
      ctx.lineTo(ex + r * 0.6, ey - r * 0.5);
      ctx.lineTo(ex, ey - r * 1.3);
      ctx.closePath();
      ctx.fill();
    };

    const loop = () => {
      if (isOnScreen && isTabVisible) {
        step();
        render();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  return (
    <div className="lg-quest">
      <div ref={wrapRef} className="lg-quest-map">
        <canvas ref={canvasRef} />
      </div>

      <div className="lg-quest-controls">
        <div className="lg-quest-toggle">
          <button
            className={algorithm === "astar" ? "active" : ""}
            onClick={() => setAlgorithm("astar")}
          >
            A*
          </button>
          <button
            className={algorithm === "dijkstra" ? "active" : ""}
            onClick={() => setAlgorithm("dijkstra")}
          >
            Dijkstra
          </button>
        </div>
        <div className="lg-quest-buttons">
          <button className="lg-btn primary" onClick={handleSearch}>
            buscar camino
          </button>
          <button className="lg-btn ghost" onClick={handleNewMap}>
            nuevo río
          </button>
        </div>
      </div>

      {stats && (
        <p className="lg-quest-stats">
          {stats.noPath
            ? `sin camino posible — exploró ${stats.explored} celdas`
            : `exploró ${stats.explored} celdas · camino de ${stats.steps} pasos · costo total ${stats.cost}`}
        </p>
      )}
      <p className="lg-music-hint">
        verde = explorado con A* (heurística) · rojo = explorado con Dijkstra (sin heurística)
      </p>
    </div>
  );
}
