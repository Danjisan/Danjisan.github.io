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

/** Prefer suggestive icons over placeholder storage thumbs (e.g. logo SVG). */
function shouldUseRemoteThumb(url: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return !(
    lower.includes("colabme-logo") ||
    lower.endsWith(".svg")
  );
}

function LessonGlyph({ templateType }: { templateType: string }) {
  const common = {
    width: 36,
    height: 36,
    viewBox: "0 0 40 40",
    fill: "currentColor",
    "aria-hidden": true,
  };

  switch (templateType) {
    case "bacteria_viewer":
      // Morphologie: coccus, bacillus, streptococcus, staphylococcus
      return (
        <svg {...common}>
          <circle cx="9" cy="12" r="3.2" opacity="0.95" />
          <rect x="16.2" y="9.2" width="11.5" height="5.6" rx="2.8" opacity="0.9" />
          <circle cx="8" cy="27" r="2.4" />
          <circle cx="13.2" cy="27" r="2.4" />
          <circle cx="18.4" cy="27" r="2.4" />
          <circle cx="28" cy="24.5" r="2.35" />
          <circle cx="32.2" cy="27.8" r="2.35" />
          <circle cx="27.2" cy="29.8" r="2.35" />
          <circle cx="31.6" cy="22.2" r="2.1" opacity="0.85" />
        </svg>
      );
    case "plant_tamagotchi":
      return (
        <svg {...common}>
          <path d="M20 34V18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 22c-6.5-.2-10.5-4.8-10.2-10.5C15.5 12 19.2 15.8 20 22Z" />
          <path d="M20 20c6.5-.2 10.5-4.5 10.2-10.2C24.2 10.2 20.8 14.2 20 20Z" />
          <path d="M15 34h10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "circuit_electric":
      return (
        <svg {...common}>
          <path
            d="M18.5 5 11 20h7l-2.5 15L29 17h-7L24 5H18.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chemistry_sim":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="4" />
          <circle cx="27" cy="12" r="3.2" opacity="0.9" />
          <circle cx="22" cy="26" r="4.4" opacity="0.95" />
          <path
            d="M17.2 16.2 20.2 23.2M25.2 14.5 23.2 22.2M16.8 14.8 24.2 12.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="8" y="8" width="24" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M14 20h12M20 14v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
        <div className="lessons-list">
          {filtered.length === 0 ? (
            <p className="lessons-empty">Nicio lecție în această categorie.</p>
          ) : (
            filtered.map((lesson) => {
              const state = getLessonState(lesson);
              const expanded = expandedId === lesson.id;
              const remoteThumb = shouldUseRemoteThumb(lesson.thumbnail_url);

              return (
                <article
                  key={lesson.id}
                  className={`lesson-row ${state} ${expanded ? "expanded" : ""}`}
                >
                  <div className="lesson-row-main">
                    <div className="lesson-row-icon" aria-hidden="true">
                      {remoteThumb ? (
                        <img src={lesson.thumbnail_url!} alt="" loading="lazy" />
                      ) : (
                        <LessonGlyph templateType={lesson.template_type} />
                      )}
                      {state === "locked" && (
                        <span className="lesson-row-lock">🔒</span>
                      )}
                      {state === "completed" && (
                        <span className="lesson-row-done">✓</span>
                      )}
                    </div>

                    <div className="lesson-row-body">
                      <p className="lesson-row-title">{lesson.title}</p>
                      <div className="lesson-row-meta">
                        {lesson.category && (
                          <span className="lesson-cat-tag">{lesson.category}</span>
                        )}
                        <DifficultyDots level={lesson.difficulty} />
                      </div>
                    </div>

                    <div className="lesson-row-actions">
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

                  {expanded && (
                    <div className="lesson-row-details">
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
                </article>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
