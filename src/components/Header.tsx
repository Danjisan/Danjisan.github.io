import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const NAV_ITEMS = [
  { to: "/", label: "Acasă" },
  { to: "/despre", label: "Despre ColabMe" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/proiecte", label: "Proiecte" },
  { to: "/contact", label: "Contact" },
  { to: "/lectii", label: "Lumea Lectiilor" },
  { to: "/lobby", label: "Lumea Online" },
];

const ADMIN_NAV = [
  { to: "/admin/intrebari", label: "Întrebări" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
    setMenuOpen(false);
  }

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

        {/* Link-uri admin/profesor — vizibile doar pentru rolurile permise */}
        {!loading && profile && ["admin", "profesor"].includes(profile.role) &&
          ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))
        }

        {!loading && (
          user ? (
            <div className="nav-user">
              <NavLink to="/profil" className="nav-user-name" onClick={() => setMenuOpen(false)}>
                {profile?.display_name ?? user.email}
              </NavLink>
              {profile?.role && profile.role !== "anonim" && (
                <span className={`nav-role-badge role-${profile.role}`}>
                  {profile.role}
                </span>
              )}
              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                Ieși
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="nav-login-btn"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
}
