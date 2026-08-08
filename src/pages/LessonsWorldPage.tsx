import { useEffect, useState } from "react";
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

function LessonThumbIcon({ templateType }: { templateType: string }) {
  const common = {
    width: 40,
    height: 40,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (templateType) {
    case "plant_tamagotchi":
      return (
        <svg {...common}>
          <path d="M12 22v-7" />
          <path d="M12 15c-4.5 0-7-3.5-7-7 3.5 0 7 2.5 7 7z" />
          <path d="M12 15c4.5 0 7-3.5 7-7-3.5 0-7 2.5-7 7z" />
          <path d="M9 22h6" />
        </svg>
      );
    case "bacteria_viewer":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5.5" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
          <path d="M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4" />
        </svg>
      );
    case "circuit_electric":
      return (
        <svg {...common}>
          <path d="M13 2 6 13h5l-1 9 7-11h-5l1-9z" />
        </svg>
      );
    case "chemistry_sim":
      return (
        <svg {...common}>
          <path d="M9 3h6" />
          <path d="M10 3v6.2L5.5 18a2.5 2.5 0 0 0 2.2 3.7h8.6a2.5 2.5 0 0 0 2.2-3.7L14 9.2V3" />
          <path d="M8.5 15h7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
  }
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="difficulty-dots" aria-label={`Dificultate: ${DIFFICULTY_LABELS[level]}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`dot ${i < level ? "filled" : ""}`} />
      ))}
    </span>
  );
}

function stateRank(state: LessonState): number {
  return state === "locked" ? 1 : 0;
}

export default function LessonsWorldPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

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

  const filtered = (activeCategories.size === 0
    ? lessons
    : lessons.filter((l) => l.category && activeCategories.has(l.category))
  )
    .slice()
    .sort((a, b) => {
      const byState = stateRank(getLessonState(a)) - stateRank(getLessonState(b));
      if (byState !== 0) return byState;
      return a.order_index - b.order_index;
    });

  function toggleCategory(cat: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="page lessons-page">
      <div className="lessons-header">
        <h1>Lumea Lectiilor</h1>
        <p className="lessons-subtitle">
          Experiențe interactive, simulări și laboratoare virtuale.
        </p>
      </div>

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
        <div className="lessons-grid">
          {filtered.length === 0 ? (
            <p className="lessons-empty">Nicio lecție în această categorie.</p>
          ) : (
            filtered.map((lesson) => {
              const state = getLessonState(lesson);
              const expanded = expandedId === lesson.id;
              return (
                <article
                  key={lesson.id}
                  className={`lesson-card ${state} ${expanded ? "expanded" : ""}`}
                >
                  <div className="lesson-card-thumb">
                    {lesson.thumbnail_url ? (
                      <img src={lesson.thumbnail_url} alt="" loading="lazy" />
                    ) : (
                      <div className="lesson-card-thumb-placeholder">
                        <LessonThumbIcon templateType={lesson.template_type} />
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

                    {expanded && (
                      <div className="lesson-card-details">
                        <div className="lesson-card-details-meta">
                          <span className="lesson-template-tag">
                            {TEMPLATE_LABELS[lesson.template_type] ?? lesson.template_type}
                          </span>
                          <span className="lesson-difficulty-label">
                            {DIFFICULTY_LABELS[lesson.difficulty]}
                          </span>
                        </div>
                        {lesson.description && (
                          <p className="lesson-card-details-desc">{lesson.description}</p>
                        )}
                        {state === "locked" && (
                          <div className="lesson-card-lock-reason">
                            {lesson.min_xp_required > (profile?.xp ?? 0) && (
                              <p>
                                Necesită <strong>{lesson.min_xp_required} XP</strong>
                                {" "}(ai {profile?.xp ?? 0} XP)
                              </p>
                            )}
                            {lesson.prerequisite_lesson_id &&
                              !completedIds.has(lesson.prerequisite_lesson_id) && (
                                <p>Completează mai întâi lecția prerequisită</p>
                              )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="lesson-card-actions">
                      <button
                        type="button"
                        className="btn-secondary lesson-card-details-btn"
                        onClick={() => toggleExpand(lesson.id)}
                        aria-expanded={expanded}
                      >
                        {expanded ? "Ascunde" : "Detalii"}
                      </button>
                      {state === "available" && (
                        <button
                          type="button"
                          className="btn-primary lesson-card-enter-btn"
                          onClick={() => navigate(`/lectii/${lesson.slug}`)}
                        >
                          Intră →
                        </button>
                      )}
                      {state === "completed" && (
                        <button
                          type="button"
                          className="btn-secondary lesson-card-enter-btn"
                          onClick={() => navigate(`/lectii/${lesson.slug}`)}
                        >
                          Revizitează →
                        </button>
                      )}
                      {state === "locked" && (
                        <button
                          type="button"
                          className="btn-secondary lesson-card-enter-btn"
                          disabled
                        >
                          Blocat
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
