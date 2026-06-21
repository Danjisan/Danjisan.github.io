import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../lib/types";

interface School {
  id: string;
  name: string;
  region: string | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  profesor: "Profesor",
  parinte: "Părinte",
  elev: "Elev",
  anonim: "Vizitator",
};

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) setSchoolId(profile.school_id ?? "");
  }, [profile]);

  useEffect(() => {
    supabase
      .from("schools")
      .select("id, name, region")
      .order("name")
      .then(({ data }) => setSchools(data ?? []));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("user_profiles")
      .update({ school_id: schoolId || null })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setError("Nu s-a putut salva. Încearcă din nou.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading || !profile) {
    return <section className="page"><p>Se încarcă…</p></section>;
  }

  return (
    <section className="page">
      <h1>Profilul meu</h1>
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="profile-name">{profile.display_name}</p>
            <p className="profile-email">{user?.email}</p>
            <span className={`nav-role-badge role-${profile.role}`}>
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{profile.xp}</span>
            <span className="profile-stat-label">XP</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSave}>
          <label className="auth-label">
            Școală / grup
            <select
              className="auth-input auth-select"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <option value="">— Neselectat —</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.region ? ` · ${s.region}` : ""}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="auth-error">{error}</p>}
          {saved && <p className="auth-info">Salvat cu succes!</p>}
          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? "Se salvează…" : "Salvează"}
          </button>
        </form>
      </div>
    </section>
  );
}
