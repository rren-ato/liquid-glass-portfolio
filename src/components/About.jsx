export default function About() {
  return (
    <section className="lg-section" id="about">
      <div className="lg-section-head">// about</div>
      <h2 className="lg-section-title">Donde estoy parado ahora</h2>
      <div className="lg-glass lg-about-card">
        <p>
          Empecé a programar hace poco y todavía estoy armando las bases: lógica, estructuras, y
          sobre todo, criterio de diseño. Prefiero mostrar el proceso en lugar de esconderlo
          detrás de un portfolio que finge más experiencia de la que tengo.
        </p>
        <p>
          Lo que más me atrae es el punto donde el código deja de ser solo funcional y empieza a
          ser expresivo — animaciones, generative art, interfaces que se sienten vivas.
        </p>
        <div className="lg-chip-row">
          <span className="lg-chip solid">HTML/CSS</span>
          <span className="lg-chip solid">JavaScript</span>
          <span className="lg-chip solid">React (aprendiendo)</span>
          <span className="lg-chip next">next: animación con Canvas/WebGL →</span>
        </div>
      </div>
    </section>
  );
}
