export default function Hero({ onNavigate }) {
  return (
    <section className="lg-hero" id="hero">
      <span className="lg-eyebrow">whoami</span>
      <h1>rren-ato, portafolio de muchas cosas</h1>
      <p className="lg-sub">
        Todavía no soy junior — estoy en la parte del camino donde se rompe más de lo que
        funciona. Este sitio es parte portfolio, parte cuaderno de experimentos con código
        creativo.
      </p>
      <div className="lg-actions">
        <button className="lg-btn primary" onClick={() => onNavigate("playground")}>
          Ver el playground
        </button>
        <button className="lg-btn ghost" onClick={() => onNavigate("contact")}>
          Decir hola
        </button>
      </div>
    </section>
  );
}
