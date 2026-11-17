import { useCallback, useEffect, useState } from "react";

/**
 * Provocările rezolvate, ținute local (per utilizator + lecție) până avem tabelul de progres în Supabase.
 * Vezi docs/circuit-revamp.md, „Progres și XP”.
 */
function storageKey(lessonId: string, userId: string | null | undefined): string {
  return `colabme:circuit-progress:${userId ?? "guest"}:${lessonId}`;
}

function readSolved(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSolved(key: string, solved: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...solved]));
  } catch {
    // Stocare indisponibilă (mod privat etc.) — progresul rămâne doar în sesiunea curentă.
  }
}

export function useChallengeProgress(lessonId: string, userId: string | null | undefined) {
  const key = storageKey(lessonId, userId);
  const [state, setState] = useState(() => ({ key, solved: readSolved(key) }));

  // Userul se încarcă asincron: când se schimbă cheia, citim progresul pentru noua cheie.
  useEffect(() => {
    setState((prev) => (prev.key === key ? prev : { key, solved: readSolved(key) }));
  }, [key]);

  const markSolved = useCallback(
    (challengeId: string) => {
      setState((prev) => {
        if (prev.solved.has(challengeId)) return prev;
        const solved = new Set(prev.solved).add(challengeId);
        writeSolved(prev.key, solved);
        return { ...prev, solved };
      });
    },
    [],
  );

  return { solvedIds: state.solved, progressKey: state.key, markSolved };
}
