import { useCallback, useEffect, useState } from "react";

/**
 * Mini-lecțiile terminate dintr-un capitol, ținute local (per utilizator + lecție)
 * până la tabelul de progres din Supabase (pasul 4 din docs/circuit-revamp.md).
 */
function storageKey(lessonId: string, userId: string | null | undefined): string {
  return `colabme:circuit-chapter:${userId ?? "guest"}:${lessonId}`;
}

function read(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function useChapterProgress(lessonId: string, userId: string | null | undefined) {
  const key = storageKey(lessonId, userId);
  const [state, setState] = useState(() => ({ key, done: read(key) }));

  useEffect(() => {
    setState((prev) => (prev.key === key ? prev : { key, done: read(key) }));
  }, [key]);

  const markDone = useCallback((miniLessonId: string) => {
    setState((prev) => {
      if (prev.done.has(miniLessonId)) return prev;
      const done = new Set(prev.done).add(miniLessonId);
      try {
        localStorage.setItem(prev.key, JSON.stringify([...done]));
      } catch {
        // Stocare indisponibilă — progresul rămâne doar în sesiunea curentă.
      }
      return { ...prev, done };
    });
  }, []);

  return { done: state.done, markDone };
}
