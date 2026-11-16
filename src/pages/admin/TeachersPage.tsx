import { useCallback, useEffect, useState } from "react";
import { useRequireRole } from "../../hooks/useRequireRole";
import { supabase } from "../../lib/supabase";

/** Rând întors de `admin_list_teachers()` (vezi colabme-server, 20261116_teacher_approval.sql). */
interface TeacherRow {
  id: string;
  display_name: string;
  email: string;
  status: "pending" | "active";
  created_at: string;
}

type Action = "approve_teacher" | "reject_teacher" | "revoke_teacher";

const CONFIRM: Record<Action, (name: string) => string> = {
  approve_teacher: (n) => `Aprobi contul de profesor pentru ${n}?`,
  reject_teacher: (n) =>
    `Respingi cererea lui ${n}? Contul rămâne activ ca Vizitator.`,
  revoke_teacher: (n) =>
    `Revoci rolul de profesor pentru ${n}? Contul devine Vizitator.`,
};

const DONE: Record<Action, (name: string) => string> = {
  approve_teacher: (n) => `${n} e acum profesor.`,
  reject_teacher: (n) => `Cererea lui ${n} a fost respinsă.`,
  revoke_teacher: (n) => `${n} nu mai e profesor.`,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TeachersPage() {
  const { loading, profile } = useRequireRole(["admin"]);
  const isAdmin = profile?.role === "admin";

  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    const { data, error: listError } = await supabase.rpc("admin_list_teachers");
    if (listError) {
      setError("Nu am putut încărca lista. Reîncarcă pagina.");
    } else {
      setRows((data ?? []) as TeacherRow[]);
    }
    setLoadingRows(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void fetchRows();
  }, [isAdmin, fetchRows]);

  async function runAction(action: Action, row: TeacherRow) {
    if (!window.confirm(CONFIRM[action](row.display_name))) return;
    setBusyId(row.id);
    setInfo(null);
    setError(null);
    const { error: rpcError } = await supabase.rpc(action, { target: row.id });
    setBusyId(null);
    if (rpcError) {
      setError(
        rpcError.code === "P0002"
          ? "Starea contului s-a schimbat între timp. Lista a fost reîncărcată."
          : "Nu am putut salva. Încearcă din nou.",
      );
    } else {
      setInfo(DONE[action](row.display_name));
    }
    await fetchRows();
  }

  if (loading || !isAdmin) {
    return (
      <section className="page">
        <p>Se încarcă…</p>
      </section>
    );
  }

  const pending = rows.filter((r) => r.status === "pending");
  const active = rows.filter((r) => r.status === "active");

  return (
    <section className="page">
      <h1>Profesori</h1>
      <p className="admin-intro">
        Contactează persoana pe email și verifică-i identitatea înainte să
        aprobi. Până la aprobare, contul funcționează ca Vizitator.
      </p>
      {info && <p className="auth-info">{info}</p>}
      {error && <p className="auth-error">{error}</p>}

      <div className="admin-layout">
        <div className="admin-panel">
          <h2>Cereri în așteptare ({pending.length})</h2>
          {loadingRows ? (
            <p className="admin-empty">Se încarcă…</p>
          ) : pending.length === 0 ? (
            <p className="admin-empty">Nicio cerere nouă.</p>
          ) : (
            <ul className="teacher-list">
              {pending.map((row) => (
                <li key={row.id} className="teacher-item">
                  <TeacherInfo row={row} label="Cerere din" />
                  <div className="teacher-actions">
                    <button
                      type="button"
                      className="teacher-btn teacher-btn-primary"
                      disabled={busyId !== null}
                      onClick={() => void runAction("approve_teacher", row)}
                    >
                      Aprobă
                    </button>
                    <button
                      type="button"
                      className="teacher-btn"
                      disabled={busyId !== null}
                      onClick={() => void runAction("reject_teacher", row)}
                    >
                      Respinge
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2>Profesori activi ({active.length})</h2>
          {loadingRows ? (
            <p className="admin-empty">Se încarcă…</p>
          ) : active.length === 0 ? (
            <p className="admin-empty">Niciun profesor încă.</p>
          ) : (
            <ul className="teacher-list">
              {active.map((row) => (
                <li key={row.id} className="teacher-item">
                  <TeacherInfo row={row} label="Cont din" />
                  <div className="teacher-actions">
                    <button
                      type="button"
                      className="teacher-btn teacher-btn-danger"
                      disabled={busyId !== null}
                      onClick={() => void runAction("revoke_teacher", row)}
                    >
                      Revocă
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function TeacherInfo({ row, label }: { row: TeacherRow; label: string }) {
  return (
    <div className="teacher-info">
      <span className="teacher-name">{row.display_name}</span>
      <a className="auth-link teacher-email" href={`mailto:${row.email}`}>
        {row.email}
      </a>
      <span className="teacher-date">
        {label} {formatDate(row.created_at)}
      </span>
    </div>
  );
}
