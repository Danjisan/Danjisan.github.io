import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LegalMailto } from "../components/LegalValue";
import { LEGAL_ORG } from "../content/legalOrg";
import {
  collectOwnUserData,
  downloadJson,
  GDPR_RIGHTS_RO,
  type UserDataExport,
} from "../lib/userDataExport";
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

  const [exportData, setExportData] = useState<UserDataExport | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function handleViewData() {
    setExportLoading(true);
    setExportError(null);
    try {
      const data = await collectOwnUserData();
      setExportData(data);
    } catch {
      setExportError("Nu am putut încărca datele. Încearcă din nou.");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDownload() {
    setExportLoading(true);
    setExportError(null);
    try {
      const data = exportData ?? (await collectOwnUserData());
      setExportData(data);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`colabme-datele-mele-${stamp}.json`, data);
    } catch {
      setExportError("Nu am putut genera exportul.");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "STERGE") return;
    setDeleting(true);
    setDeleteError(null);

    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      setDeleting(false);
      setDeleteError(
        "Ștergerea a eșuat. Încearcă din nou sau scrie-ne pe emailul GDPR.",
      );
      return;
    }

    await supabase.auth.signOut({ scope: "global" });
    setDeleting(false);
    navigate("/?deleted=1", { replace: true });
  }

  if (loading || !profile) {
    return (
      <section className="page">
        <p>Se încarcă…</p>
      </section>
    );
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
                  {s.name}
                  {s.region ? ` · ${s.region}` : ""}
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

        <div className="profile-privacy">
          <h2>Datele tale și drepturi GDPR</h2>
          <p>
            Operator: {LEGAL_ORG.legalName}. Contact:{" "}
            <LegalMailto email={LEGAL_ORG.privacyEmail} />. Documente:{" "}
            <Link to="/privacy">Confidențialitate</Link>
            {" · "}
            <Link to="/cookies">Cookies</Link>
            {" · "}
            <Link to="/termeni">Termeni</Link>.
          </p>

          <h3 className="profile-privacy-sub">Drepturile tale</h3>
          <ul className="profile-rights-list">
            {GDPR_RIGHTS_RO.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <div className="profile-privacy-actions">
            <button
              type="button"
              className="auth-submit profile-btn-secondary"
              onClick={handleViewData}
              disabled={exportLoading}
            >
              {exportLoading ? "Se încarcă…" : "Vezi datele mele"}
            </button>
            <button
              type="button"
              className="auth-submit profile-btn-secondary"
              onClick={handleDownload}
              disabled={exportLoading}
            >
              Descarcă JSON
            </button>
            <button
              type="button"
              className="profile-btn-danger"
              onClick={() => {
                setDeleteOpen((v) => !v);
                setDeleteError(null);
                setDeleteConfirm("");
              }}
            >
              Șterge contul
            </button>
          </div>

          {exportError && <p className="auth-error">{exportError}</p>}

          {exportData && (
            <div className="profile-data-panel">
              <h3 className="profile-privacy-sub">Date reținute (rezumat)</h3>
              <ul className="profile-data-summary">
                <li>
                  <strong>Email:</strong> {exportData.account.email ?? "—"}
                </li>
                <li>
                  <strong>ID cont:</strong> {exportData.account.id}
                </li>
                <li>
                  <strong>Cont creat:</strong>{" "}
                  {exportData.account.createdAt
                    ? new Date(exportData.account.createdAt).toLocaleString("ro-RO")
                    : "—"}
                </li>
                <li>
                  <strong>Profil:</strong>{" "}
                  {exportData.profile
                    ? `${String(exportData.profile.display_name)} · rol ${String(exportData.profile.role)} · XP ${String(exportData.profile.xp)}`
                    : "—"}
                </li>
                <li>
                  <strong>Lecții finalizate:</strong>{" "}
                  {exportData.lessonCompletions.length}
                </li>
                <li>
                  <strong>Sesiuni de joc:</strong> {exportData.quizSessions.length}
                </li>
                <li>
                  <strong>Răspunsuri înregistrate:</strong>{" "}
                  {exportData.sessionAnswers.length}
                </li>
              </ul>
              <p className="profile-data-hint">
                Exportul JSON include detaliile complete pe care le poți citi
                prin contul tău (profil, progres, sesiuni, răspunsuri).
              </p>
            </div>
          )}

          {deleteOpen && (
            <div className="profile-delete-panel" role="region" aria-label="Ștergere cont">
              <p>
                Ștergerea este <strong>permanentă</strong>: contul, profilul și
                datele asociate pe care le putem elimina din baza noastră.
                Backup-urile furnizorului pot mai exista scurt timp, apoi
                dispar din rotație.
              </p>
              <label className="auth-label">
                Scrie <code>STERGE</code> pentru a confirma
                <input
                  type="text"
                  className="auth-input"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  autoComplete="off"
                  placeholder="STERGE"
                />
              </label>
              {deleteError && <p className="auth-error">{deleteError}</p>}
              <button
                type="button"
                className="profile-btn-danger"
                disabled={deleting || deleteConfirm !== "STERGE"}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Se șterge…" : "Confirmă ștergerea contului"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
