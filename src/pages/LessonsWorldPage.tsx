import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  SUBJECTS,
  chapterUrl,
  collectSlugs,
  findSubject,
  resolveChapterPath,
  subjectUrl,
  type ChapterNode,
  type Subject,
  type TreeNode,
} from "../content/lessonTree";
import TileGrid, { type Tile, type TileStatus } from "./lessons/world/TileGrid";
import WorldIcon, { iconForTemplate } from "./lessons/world/WorldIcon";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: number;
  template_type: string;
  min_xp_required: number;
  prerequisite_lesson_id: string | null;
  order_index: number;
}

type LessonState = "available" | "locked" | "completed";

/** Ținut în history state: dacă ai intrat în capitol din Home, „←” te duce înapoi acolo. */
interface WorldNavState {
  fromHome?: boolean;
}

const HOME_URL = "/lectii";

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
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchLessons();
  }, []);

  useEffect(() => {
    if (user) void fetchCompletions();
    else setCompletedIds(new Set());
  }, [user]);

  async function fetchLessons() {
    const { data } = await supabase
      .from("lessons")
      .select("id, slug, title, description, category, difficulty, template_type, min_xp_required, prerequisite_lesson_id, order_index")
      .eq("is_published", true)
      .order("order_index");
    setLessons(data ?? []);
    setLoading(false);
  }

  async function fetchCompletions() {
    const { data } = await supabase.from("lesson_completions").select("lesson_id");
    setCompletedIds(new Set((data ?? []).map((r) => r.lesson_id)));
  }

  // ── Unde suntem:
  //    /lectii                                  → Home (toate materiile, pe coloane)
  //    /lectii?m=<materie>                      → o materie
  //    /lectii/capitol/<materie>/<capitol>/...  → în capitol
  const splat = params["*"];
  const inChapter = splat !== undefined;
  const segments = (splat ?? "").split("/").filter(Boolean);
  const subject = findSubject(inChapter ? segments[0] : searchParams.get("m"));
  const isHome = !inChapter && !subject;
  const chapterPath = inChapter && subject ? resolveChapterPath(subject, segments.slice(1)) : [];
  const fromHome = (location.state as WorldNavState | null)?.fromHome === true;

  if (inChapter && (!subject || !chapterPath || chapterPath.length === 0)) {
    return <Navigate to={subject ? subjectUrl(subject.id) : HOME_URL} replace />;
  }

  const currentChapter = chapterPath?.at(-1);
  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  const placedSlugs = collectSlugs(SUBJECTS.flatMap((s) => s.children));

  function getLessonState(lesson: Lesson): LessonState {
    if (completedIds.has(lesson.id)) return "completed";
    if ((profile?.xp ?? 0) < lesson.min_xp_required) return "locked";
    if (lesson.prerequisite_lesson_id && !completedIds.has(lesson.prerequisite_lesson_id)) return "locked";
    return "available";
  }

  /** Lecțiile publicate dintr-un capitol (recursiv). */
  function lessonsIn(nodes: TreeNode[]): Lesson[] {
    return nodes.flatMap((n) =>
      n.kind === "lesson" ? (bySlug.get(n.slug) ? [bySlug.get(n.slug)!] : []) : lessonsIn(n.children),
    );
  }

  function chapterTile(chapter: ChapterNode, inSubject: Subject, parentIds: string[]): Tile {
    const inside = lessonsIn(chapter.children);
    const states = inside.map(getLessonState);
    const done = states.filter((s) => s === "completed").length;
    let status: TileStatus;
    if (inside.length === 0) status = "soon";
    else if (done === inside.length) status = "completed";
    else if (states.some((s) => s === "available")) status = "available";
    else status = "locked";

    const ids = [...parentIds, chapter.id];
    const state: WorldNavState = { fromHome: isHome || fromHome };

    return {
      key: `c:${inSubject.id}/${ids.join("/")}`,
      title: chapter.title,
      icon: chapter.icon,
      status,
      badge: inside.length > 0 ? `${done}/${inside.length}` : undefined,
      panel: (
        <>
          <div className="world-panel-meta">
            <span className="lesson-template-tag">{isHome ? inSubject.title : "Capitol"}</span>
            {inside.length > 0 && (
              <span className="lesson-difficulty-label">
                {done}/{inside.length} {inside.length === 1 ? "lecție terminată" : "lecții terminate"}
              </span>
            )}
          </div>
          <p className="world-panel-desc">{chapter.description}</p>
          {status === "soon" ? (
            <p className="world-panel-note">Lecțiile din acest capitol vin în curând.</p>
          ) : (
            <>
              {status === "locked" && (
                <div className="lesson-card-lock-reason">
                  <p>Lecțiile de aici sunt încă blocate, dar poți să te uiți ce conține capitolul.</p>
                </div>
              )}
              <button
                type="button"
                className="world-panel-btn"
                onClick={() => navigate(chapterUrl(inSubject.id, ids), { state })}
              >
                Intră în capitol →
              </button>
            </>
          )}
        </>
      ),
    };
  }

  function lessonTile(lesson: Lesson, iconOverride?: Tile["icon"]): Tile {
    const state = getLessonState(lesson);
    const xp = profile?.xp ?? 0;
    return {
      key: `l:${lesson.slug}`,
      title: lesson.title,
      icon: iconOverride ?? iconForTemplate(lesson.template_type),
      status: state,
      panel: (
        <>
          <div className="world-panel-meta">
            <span className="lesson-template-tag">
              {TEMPLATE_LABELS[lesson.template_type] ?? lesson.template_type}
            </span>
            <DifficultyDots level={lesson.difficulty} />
            <span className="lesson-difficulty-label">{DIFFICULTY_LABELS[lesson.difficulty]}</span>
          </div>
          {lesson.description && <p className="world-panel-desc">{lesson.description}</p>}
          {state === "locked" ? (
            <div className="lesson-card-lock-reason">
              {lesson.min_xp_required > xp && (
                <p>
                  Necesită <strong>{lesson.min_xp_required} XP</strong> (ai {xp} XP)
                </p>
              )}
              {lesson.prerequisite_lesson_id && !completedIds.has(lesson.prerequisite_lesson_id) && (
                <p>Completează mai întâi lecția prerequisită</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={`world-panel-btn ${state === "completed" ? "revisit" : ""}`}
              onClick={() => navigate(`/lectii/${lesson.slug}`)}
            >
              {state === "completed" ? "Revizitează →" : "Intră →"}
            </button>
          )}
        </>
      ),
    };
  }

  /** Pătratele unui nivel: capitole/lecții din arbore (+ lecțiile neîncadrate, la rădăcina materiei). */
  function levelTiles(inSubject: Subject, nodes: TreeNode[], parentIds: string[]): Tile[] {
    const tiles: Tile[] = [];
    for (const node of nodes) {
      if (node.kind === "chapter") tiles.push(chapterTile(node, inSubject, parentIds));
      else {
        const lesson = bySlug.get(node.slug);
        if (lesson) tiles.push(lessonTile(lesson, node.icon));
      }
    }
    if (parentIds.length === 0) {
      for (const lesson of lessons) {
        if (lesson.category === inSubject.category && !placedSlugs.has(lesson.slug)) tiles.push(lessonTile(lesson));
      }
    }
    return tiles;
  }

  // ── Grila curentă
  let tiles: (Tile | null)[];
  if (isHome) {
    // Rândul k = al k-lea capitol din fiecare materie; materia = coloana
    const columns = SUBJECTS.map((s) => levelTiles(s, s.children, []));
    const rows = Math.max(0, ...columns.map((c) => c.length));
    tiles = [];
    for (let r = 0; r < rows; r++) for (const col of columns) tiles.push(col[r] ?? null);
  } else if (currentChapter) {
    tiles = levelTiles(subject!, currentChapter.children, chapterPath!.map((c) => c.id));
  } else {
    tiles = levelTiles(subject!, subject!.children, []);
  }

  const levelKey = isHome ? "home" : [subject!.id, ...(chapterPath ?? []).map((c) => c.id)].join("/");

  function backUrl(): string {
    if (chapterPath && chapterPath.length > 1) {
      return chapterUrl(subject!.id, chapterPath.slice(0, -1).map((c) => c.id));
    }
    return fromHome ? HOME_URL : subjectUrl(subject!.id);
  }

  return (
    <section className="page lessons-page">
      <div className="lessons-header">
        <div className="lessons-title-row">
          <h1>Lumea Lectiilor</h1>
          <Link
            to={HOME_URL}
            className={`world-home-btn ${isHome ? "active" : ""}`}
            aria-label="Toate materiile"
            aria-current={isHome ? "page" : undefined}
            title="Toate materiile"
          >
            <WorldIcon id="home" />
          </Link>
        </div>
        <p className="lessons-subtitle">Experiențe interactive, simulări și laboratoare virtuale.</p>
      </div>

      {currentChapter ? (
        <nav className="world-crumbs" aria-label="Unde ești">
          <Link
            className="world-crumbs-back"
            to={backUrl()}
            state={chapterPath!.length > 1 ? { fromHome } : undefined}
            aria-label="Înapoi"
          >
            ←
          </Link>
          <Link to={subjectUrl(subject!.id)}>{subject!.title}</Link>
          {chapterPath!.map((c, i) => (
            <span key={c.id} className="world-crumbs-item">
              <span className="world-crumbs-sep">/</span>
              {i === chapterPath!.length - 1 ? (
                <span aria-current="page">{c.title}</span>
              ) : (
                <Link
                  to={chapterUrl(subject!.id, chapterPath!.slice(0, i + 1).map((x) => x.id))}
                  state={{ fromHome }}
                >
                  {c.title}
                </Link>
              )}
            </span>
          ))}
        </nav>
      ) : (
        // Capsulele stau pe aceeași grilă de 3 coloane ca pătratele, deci deasupra coloanei materiei lor
        <div className="world-tabs" role="tablist" aria-label="Materii">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === subject?.id}
              className={`world-tab ${s.id === subject?.id ? "active" : ""}`}
              onClick={() => setSearchParams({ m: s.id }, { replace: true })}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="lessons-loading">Se încarcă…</p>
      ) : tiles.length === 0 ? (
        <p className="lessons-empty">Încă nu sunt lecții aici.</p>
      ) : isHome ? (
        <div className="world-overview">
          <TileGrid key={levelKey} tiles={tiles} />
        </div>
      ) : (
        <TileGrid key={levelKey} tiles={tiles} />
      )}
    </section>
  );
}
