import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: number;
  template_type: string;
  thumbnail_url: string | null;
  min_xp_required: number;
  prerequisite_lesson_id: string | null;
  order_index: number;
}

type LessonState = "available" | "locked" | "completed";

const DIFFICULTY_LABELS = ["", "Începător", "Elementar", "Mediu", "Avansat", "Expert"];

const TEMPLATE_LABELS: Record<string, string> = {
  bacteria_viewer: "Vizualizare 3D",
  circuit_electric: "Experiment interactiv",
  plant_tamagotchi: "Simulare",
  chemistry_sim: "Laborator virtual",
};

function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="difficulty-dots" aria-label={`Dificultate: ${DIFFICULTY_LABELS[level]}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`dot ${i < level ? "filled" : ""}`} />
      ))}
    </span>
  );
}

export default function LessonsWorldPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (user) fetchCompletions();
  }, [user]);

  async function fetchLessons() {
    const { data } = await supabase
      .from("lessons")
      .select("id, slug, title, description, category, difficulty, template_type, thumbnail_url, min_xp_required, prerequisite_lesson_id, order_index")
      .eq("is_published", true)
      .order("order_index");
    setLessons(data ?? []);
    setLoading(false);
  }

  async function fetchCompletions() {
    const { data } = await supabase
      .from("lesson_completions")
      .select("lesson_id");
    setCompletedIds(new Set((data ?? []).map((r) => r.lesson_id)));
  }

  function getLessonState(lesson: Lesson): LessonState {
    if (completedIds.has(lesson.id)) return "completed";
    const xp = profile?.xp ?? 0;
    if (xp < lesson.min_xp_required) return "locked";
    if (lesson.prerequisite_lesson_id && !completedIds.has(lesson.prerequisite_lesson_id))
      return "locked";
    return "available";
  }

  const categories = Array.from(
    new Set(lessons.map((l) => l.category).filter(Boolean) as string[]),
  ).sort();

  const filtered = activeCategories.size === 0
    ? lessons
    : lessons.filter((l) => l.category && activeCategories.has(l.category));

  const selected = lessons.find((l) => l.id === selectedId) ?? null;
  const selectedState = selected ? getLessonState(selected) : null;

  function toggleCategory(cat: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function handleSelectCard(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }

  return (
    <section className="page lessons-page">
      <div className="lessons-header">
        <h1>Lumea Lectiilor</h1>
        <p className="lessons-subtitle">
          Experiențe interactive, simulări și laboratoare virtuale.
        </p>
      </div>

      {/* Filter chips */}
      <div className="lessons-filters">
        <button
          className={`filter-chip ${activeCategories.size === 0 ? "active" : ""}`}
          onClick={() => setActiveCategories(new Set())}
        >
          Toate
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${activeCategories.has(cat) ? "active" : ""}`}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
            {activeCategories.has(cat) && <span className="chip-remove">×</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="lessons-loading">Se încarcă…</p>
      ) : (
        <div className="lessons-layout">
          {/* Grid */}
          <div className="lessons-grid">
            {filtered.length === 0 ? (
              <p className="lessons-empty">Nicio lecție în această categorie.</p>
            ) : (
              filtered.map((lesson) => {
                const state = getLessonState(lesson);
                const isSelected = selectedId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    className={`lesson-card ${state} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectCard(lesson.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="lesson-card-thumb">
                      {lesson.thumbnail_url ? (
                        <img src={lesson.thumbnail_url} alt={lesson.title} loading="lazy" />
                      ) : (
                        <div className="lesson-card-thumb-placeholder">
                          <span>{lesson.category?.charAt(0) ?? "?"}</span>
                        </div>
                      )}
                      {state === "locked" && (
                        <div className="lesson-lock-overlay">
                          <span className="lock-icon">🔒</span>
                        </div>
                      )}
                      {state === "completed" && (
                        <div className="lesson-complete-badge">✓</div>
                      )}
                    </div>
                    <div className="lesson-card-info">
                      <p className="lesson-card-title">{lesson.title}</p>
                      <div className="lesson-card-meta">
                        {lesson.category && (
                          <span className="lesson-cat-tag">{lesson.category}</span>
                        )}
                        <DifficultyDots level={lesson.difficulty} />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          <div
            ref={detailRef}
            className={`lesson-detail-panel ${selected ? "visible" : ""}`}
            aria-live="polite"
          >
            {selected ? (
              <>
                <div className="ldp-header">
                  <span className="ldp-template-tag">
                    {TEMPLATE_LABELS[selected.template_type] ?? selected.template_type}
                  </span>
                  <button
                    className="ldp-close"
                    onClick={() => setSelectedId(null)}
                    aria-label="Închide"
                  >
                    ×
                  </button>
                </div>

                {selected.thumbnail_url && (
                  <img
                    src={selected.thumbnail_url}
                    alt={selected.title}
                    className="ldp-thumb"
                  />
                )}

                <h2 className="ldp-title">{selected.title}</h2>

                <div className="ldp-meta">
                  {selected.category && (
                    <span className="lesson-cat-tag">{selected.category}</span>
                  )}
                  <DifficultyDots level={selected.difficulty} />
                  <span className="ldp-difficulty-label">
                    {DIFFICULTY_LABELS[selected.difficulty]}
                  </span>
                </div>

                {selected.description && (
                  <p className="ldp-description">{selected.description}</p>
                )}

                {selectedState === "locked" && (
                  <div className="ldp-lock-reason">
                    {selected.min_xp_required > (profile?.xp ?? 0) && (
                      <p>🔒 Necesită <strong>{selected.min_xp_required} XP</strong> (ai {profile?.xp ?? 0} XP)</p>
                    )}
                    {selected.prerequisite_lesson_id &&
                      !completedIds.has(selected.prerequisite_lesson_id) && (
                        <p>🔒 Completează mai întâi lecția prerequisită</p>
                      )}
                  </div>
                )}

                <div className="ldp-actions">
                  {selectedState === "available" && (
                    <button
                      className="btn-primary ldp-enter-btn"
                      onClick={() => navigate(`/lectii/${selected.slug}`)}
                    >
                      Intră în lecție →
                    </button>
                  )}
                  {selectedState === "completed" && (
                    <>
                      <span className="ldp-completed-badge">✓ Completată</span>
                      <button
                        className="btn-secondary ldp-enter-btn"
                        onClick={() => navigate(`/lectii/${selected.slug}`)}
                      >
                        Revizitează →
                      </button>
                    </>
                  )}
                  {selectedState === "locked" && (
                    <button className="btn-secondary ldp-enter-btn" disabled>
                      Blocat
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="ldp-placeholder">
                <p>Selectează o lecție pentru a vedea detalii.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
