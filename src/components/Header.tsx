import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Acasă" },
  { to: "/despre", label: "Despre ColabMe" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/proiecte", label: "Proiecte" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-bar">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          ColabMe
        </NavLink>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle-icon" aria-hidden="true">
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>
      <nav
        className={menuOpen ? "site-nav open" : "site-nav"}
        aria-label="Navigație principală"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            end={item.to === "/"}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <button type="button" className="nav-login" disabled title="În curând">
          Login
        </button>
      </nav>
    </header>
  );
}
