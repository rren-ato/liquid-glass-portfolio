export default function Footer() {
  return (
    <footer className="lg-glass lg-footer" id="contact">
      <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-muted)" }}>
        ¿charlamos?
      </span>
      <div className="lg-links">
        <a href="#">GitHub</a>
        <a href="#">LinkedIn</a>
        <a href="#">Email</a>
      </div>
      <p className="lg-music-credit">
        Música: "Fluidscape", "Digital Lemonade" y "Shiny Tech" por{" "}
        <a href="https://incompetech.com" target="_blank" rel="noreferrer">
          Kevin MacLeod (incompetech.com)
        </a>{" "}
        — Licencia:{" "}
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
          CC BY 3.0
        </a>
      </p>
    </footer>
  );
}
