import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import BacteriaViewerTemplate from "./templates/BacteriaViewerTemplate";
import CircuitElectricTemplate from "./templates/CircuitElectricTemplate";
import PlantTamagotchiTemplate from "./templates/PlantTamagotchiTemplate";
import ChemistrySimTemplate from "./templates/ChemistrySimTemplate";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  template_type: string;
  metadata: Record<string, unknown>;
  min_xp_required: number;
  prerequisite_lesson_id: string | null;
}

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    if (slug) fetchLesson(slug);
  }, [slug]);

  useEffect(() => {
    if (user && lesson) fetchCompletion();
  }, [user, lesson]);

  async function fetchLesson(s: string) {
    const { data } = await supabase
      .from("lessons")
      .select("id, slug, title, description, category, template_type, metadata, min_xp_required, prerequisite_lesson_id")
      .eq("slug", s)
      .eq("is_published", true)
      .single();
    setLesson(data ?? null);
    setLoading(false);
  }

  async function fetchCompletion() {
    if (!lesson || !user) return;
    const { data } = await supabase
      .from("lesson_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    setCompleted(!!data);
  }

  async function toggleComplete() {
    if (!lesson || !user) return;
    setMarkingDone(true);
    if (completed) {
      await supabase
        .from("lesson_completions")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id);
      setCompleted(false);
    } else {
      await supabase
        .from("lesson_completions")
        .insert({ user_id: user.id, lesson_id: lesson.id });
      setCompleted(true);
    }
    setMarkingDone(false);
  }

  if (loading) return <section className="page"><p>Se încarcă…</p></section>;
  if (!lesson) return (
    <section className="page">
      <p>Lecția nu a fost găsită. <button className="btn-secondary" onClick={() => navigate("/lectii")}>Înapoi</button></p>
    </section>
  );

  const templateProps = { lesson, completed, onToggleComplete: toggleComplete, markingDone };

  return (
    <section className="page lesson-page">
      <div className="lesson-page-nav">
        <button className="btn-back" onClick={() => navigate("/lectii")}>
          ← Lumea Lectiilor
        </button>
        <div className="lesson-page-completion">
          {user && (
            <button
              className={`btn-complete ${completed ? "done" : ""}`}
              onClick={toggleComplete}
              disabled={markingDone}
            >
              {completed ? "✓ Completată" : "Marchează finalizat"}
            </button>
          )}
        </div>
      </div>

      <h1 className="lesson-page-title">{lesson.title}</h1>
      {lesson.category && <span className="lesson-cat-tag">{lesson.category}</span>}

      <div className="lesson-template-wrap">
        {lesson.template_type === "bacteria_viewer" && <BacteriaViewerTemplate {...templateProps} />}
        {lesson.template_type === "circuit_electric" && <CircuitElectricTemplate {...templateProps} />}
        {lesson.template_type === "plant_tamagotchi" && <PlantTamagotchiTemplate {...templateProps} />}
        {lesson.template_type === "chemistry_sim" && <ChemistrySimTemplate {...templateProps} />}
        {!["bacteria_viewer","circuit_electric","plant_tamagotchi","chemistry_sim"].includes(lesson.template_type) && (
          <p>Template necunoscut: <code>{lesson.template_type}</code></p>
        )}
      </div>
    </section>
  );
}
