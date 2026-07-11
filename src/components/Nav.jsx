import { NAV_LINKS } from "../data/nav";

export default function Nav({ onNavigate }) {
  return (
    <nav className="lg-glass lg-glass-liquid lg-nav">
      {NAV_LINKS.map((link) => (
        <a key={link.href} onClick={() => onNavigate(link.href)}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
