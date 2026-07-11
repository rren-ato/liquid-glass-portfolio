import { NAV_LINKS } from "../data/nav";
import LiquidBlobLayer from "./LiquidBlobLayer";

export default function Nav({ onNavigate }) {
  return (
    <nav className="lg-nav lg-liquid-surface">
      <LiquidBlobLayer />
      <div className="lg-liquid-tint" />
      <div className="lg-liquid-content lg-nav-links">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={`#${link.href}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.href);
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
