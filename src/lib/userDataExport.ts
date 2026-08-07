import { supabase } from "./supabase";

export interface UserDataExport {
  exportedAt: string;
  account: {
    id: string;
    email: string | undefined;
    createdAt: string | undefined;
    lastSignInAt: string | undefined;
    userMetadata: Record<string, unknown>;
  };
  profile: Record<string, unknown> | null;
  lessonCompletions: unknown[];
  quizSessions: unknown[];
  sessionAnswers: unknown[];
  rightsSummary: string[];
}

export const GDPR_RIGHTS_RO = [
  "Acces — poți vedea datele pe care le ținem despre tine",
  "Rectificare — poți corecta datele greșite (ex. școală, din profil)",
  "Ștergere — poți șterge contul și datele asociate din această pagină",
  "Portabilitate — poți descărca un export JSON al datelor tale",
  "Restricționare / opoziție — contactează-ne pe emailul GDPR din Politica de confidențialitate",
  "Plângere — poți sesiza ANSPDCP (România)",
] as const;

/** Colectează datele vizibile userului curent (prin RLS). */
export async function collectOwnUserData(): Promise<UserDataExport> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Nu ești autentificat.");
  }
  const user = userData.user;
  const uid = user.id;

  const [profileRes, completionsRes, sessionsRes, answersRes] =
    await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("lesson_completions").select("*").eq("user_id", uid),
      supabase
        .from("quiz_sessions")
        .select("*")
        .or(`player1_id.eq.${uid},player2_id.eq.${uid}`),
      supabase.from("session_answers").select("*").eq("player_id", uid),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: uid,
      email: user.email,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      userMetadata: (user.user_metadata ?? {}) as Record<string, unknown>,
    },
    profile: profileRes.data ?? null,
    lessonCompletions: completionsRes.data ?? [],
    quizSessions: sessionsRes.data ?? [],
    sessionAnswers: answersRes.data ?? [],
    rightsSummary: [...GDPR_RIGHTS_RO],
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
