import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRequireRole } from "../../hooks/useRequireRole";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  text: "",
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
  category: "",
  difficulty: 3,
  default_timer_sec: 30,
};

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  category: string | null;
  difficulty: number;
  default_timer_sec: number;
  created_at: string;
}

export default function QuestionsPage() {
  const { loading } = useRequireRole(["admin", "profesor"]);
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const { data } = await supabase
      .from("questions")
      .select("id, text, options, correct_answer, explanation, category, difficulty, default_timer_sec, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setQuestions(data ?? []);
    setLoadingQ(false);
  }

  function startEdit(q: Question) {
    const options = [...q.options];
    while (options.length < 4) options.push("");
    setForm({
      text: q.text,
      options,
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? "",
      category: q.category ?? "",
      difficulty: q.difficulty,
      default_timer_sec: q.default_timer_sec,
    });
    setEditingId(q.id);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
  }

  function setOption(index: number, value: string) {
    setForm((f) => {
      const options = [...f.options];
      options[index] = value;
      return { ...f, options };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filledOptions = form.options.filter((o) => o.trim() !== "");
    if (filledOptions.length < 2) {
      setError("Adaugă cel puțin 2 variante de răspuns.");
      return;
    }
    if (!form.options.includes(form.correct_answer)) {
      setError("Răspunsul corect trebuie să fie una din variante.");
      return;
    }

    setSaving(true);
    const payload = {
      type: "multiple_choice" as const,
      text: form.text.trim(),
      options: form.options.filter((o) => o.trim() !== ""),
      correct_answer: form.correct_answer,
      explanation: form.explanation.trim() || null,
      category: form.category.trim() || null,
      difficulty: form.difficulty,
      default_timer_sec: form.default_timer_sec,
    };

    const { error } = editingId
      ? await supabase.from("questions").update(payload).eq("id", editingId)
      : await supabase.from("questions").insert({ ...payload, created_by: user?.id });

    setSaving(false);

    if (error) {
      setError("Eroare la salvare: " + error.message);
    } else {
      setSaved(true);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchQuestions();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return <section className="page"><p>Se încarcă…</p></section>;

  return (
    <section className="page">
      <h1>Întrebări</h1>

      <div className="admin-layout">
        {/* ── Formular adăugare ── */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>{editingId ? "Editează întrebarea" : "Întrebare nouă"}</h2>
            {editingId && (
              <button type="button" className="admin-cancel-btn" onClick={cancelEdit}>
                Anulează
              </button>
            )}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              Întrebare
              <textarea
                className="auth-input auth-textarea"
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                required
                rows={3}
                placeholder="Scrie întrebarea aici…"
              />
            </label>

            <fieldset className="admin-options-fieldset">
              <legend className="auth-label">Variante de răspuns</legend>
              {form.options.map((opt, i) => (
                <div key={i} className="admin-option-row">
                  <input
                    type="radio"
                    name="correct"
                    className="admin-option-radio"
                    checked={form.correct_answer === opt && opt !== ""}
                    onChange={() => opt && setForm((f) => ({ ...f, correct_answer: opt }))}
                    title="Marchează ca răspuns corect"
                  />
                  <input
                    type="text"
                    className="auth-input admin-option-input"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Varianta ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
              <p className="admin-hint">Selectează butonul radio din dreptul variantei corecte.</p>
            </fieldset>

            <label className="auth-label">
              Explicație (afișată după răspuns)
              <textarea
                className="auth-input auth-textarea"
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                rows={2}
                placeholder="Opțional — de ce e corect răspunsul?"
              />
            </label>

            <div className="admin-row">
              <label className="auth-label">
                Categorie
                <input
                  type="text"
                  className="auth-input"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="ex: Biologie"
                />
              </label>
              <label className="auth-label">
                Dificultate (1–5)
                <input
                  type="number"
                  className="auth-input"
                  value={form.difficulty}
                  min={1}
                  max={5}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))}
                />
              </label>
              <label className="auth-label">
                Timer (sec)
                <input
                  type="number"
                  className="auth-input"
                  value={form.default_timer_sec}
                  min={5}
                  max={120}
                  onChange={(e) => setForm((f) => ({ ...f, default_timer_sec: Number(e.target.value) }))}
                />
              </label>
            </div>

            {error && <p className="auth-error">{error}</p>}
            {saved && <p className="auth-info">Întrebare salvată!</p>}
            <button type="submit" className="auth-submit" disabled={saving}>
              {saving ? "Se salvează…" : editingId ? "Salvează modificările" : "Adaugă întrebare"}
            </button>
          </form>
        </div>

        {/* ── Listă întrebări ── */}
        <div className="admin-panel">
          <h2>Întrebări adăugate ({questions.length})</h2>
          {loadingQ ? (
            <p>Se încarcă…</p>
          ) : questions.length === 0 ? (
            <p className="admin-empty">Nicio întrebare încă.</p>
          ) : (
            <ul className="questions-list">
              {questions.map((q) => (
                <li key={q.id} className={`question-item${editingId === q.id ? " editing" : ""}`}>
                  <div className="question-item-header">
                    <p className="question-text">{q.text}</p>
                    <button
                      type="button"
                      className="q-expand-btn"
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      aria-label={expandedId === q.id ? "Ascunde detalii" : "Arată detalii"}
                    >
                      {expandedId === q.id ? "▲" : "▼"}
                    </button>
                  </div>
                  <div className="question-meta">
                    {q.category && <span className="q-tag">{q.category}</span>}
                    <span className="q-tag">Dif. {q.difficulty}/5</span>
                    <span className="q-tag">{q.default_timer_sec}s</span>
                    <span className="q-correct">✓ {q.correct_answer}</span>
                  </div>
                  {expandedId === q.id && (
                    <div className="question-detail">
                      <ul className="q-options-list">
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={`q-option${opt === q.correct_answer ? " q-option-correct" : ""}`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && (
                        <p className="q-explanation">💡 {q.explanation}</p>
                      )}
                      <button
                        type="button"
                        className="q-edit-btn"
                        onClick={() => startEdit(q)}
                      >
                        Editează
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
