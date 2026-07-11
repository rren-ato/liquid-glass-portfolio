export default function Playground() {
  return (
    <section className="lg-section" id="playground">
      <div className="lg-section-head">// playground</div>
      <h2 className="lg-section-title">Creative coding, en vivo</h2>
      <div className="lg-glass lg-playground-card">
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6 }}>
          Los blobs del fondo de esta página reaccionan al mouse — es el mismo tipo de
          experimento que podés ir coleccionando acá: sketches chicos, hechos por vos, mientras
          aprendés.
        </p>
        <p className="lg-playground-hint">mové el cursor por la pantalla ↑</p>
      </div>
    </section>
  );
}
