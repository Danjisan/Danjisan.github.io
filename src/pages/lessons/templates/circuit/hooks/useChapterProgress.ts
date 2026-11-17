import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../../../lib/supabase";

/**
 * Mini-lecțiile terminate dintr-un capitol.
 *
 * - Logat: se citesc din `lesson_item_progress` și se salvează prin `complete_lesson_item`
 *   (funcție pe server: dă XP o singură dată și marchează lecția finalizată la final).
 * - Vizitator: doar în localStorage. La logare, ce a făcut ca vizitator se urcă în cont.
 * - Dacă serverul nu răspunde (ex. migrația nu e rulată încă), progresul rămâne local, ca înainte.
 */

export interface CompleteResult {
  awardedXp: number;
  lessonCompleted: boolean;
}

function storageKey(lessonId: string, who: string): string {
  return `colabme:circuit-chapter:${who}:${lessonId}`;
}

function readLocal(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeLocal(key: string, done: Set<string>): void {
  try {
    if (done.size === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify([...done]));
  } catch {
    // Stocare indisponibilă — progresul rămâne doar în sesiunea curentă.
  }
}

async function completeOnServer(lessonId: string, itemId: string): Promise<CompleteResult | null> {
  const { data, error } = await supabase.rpc("complete_lesson_item", {
    p_lesson_id: lessonId,
    p_item_id: itemId,
  });
  if (error || !data) return null;
  const result = data as { awarded_xp?: number; lesson_completed?: boolean };
  return { awardedXp: result.awarded_xp ?? 0, lessonCompleted: result.lesson_completed === true };
}

export function useChapterProgress(
  lessonId: string,
  userId: string | null | undefined,
  /** Chemat după ce serverul a salvat ceva (XP / lecție finalizată), ca pagina să reîncarce profilul. */
  onServerChange?: () => void,
) {
  const guestKey = storageKey(lessonId, "guest");
  const [done, setDone] = useState<Set<string>>(() => readLocal(userId ? storageKey(lessonId, userId) : guestKey));
  const [loading, setLoading] = useState(Boolean(userId));
  const onServerChangeRef = useRef(onServerChange);
  onServerChangeRef.current = onServerChange;

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setDone(readLocal(guestKey));
      setLoading(false);
      return;
    }

    const userKey = storageKey(lessonId, userId);
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("lesson_item_progress")
        .select("item_id")
        .eq("lesson_id", lessonId);

      if (cancelled) return;

      // Fără server: rămânem pe progresul local al contului.
      if (error) {
        setDone(new Set([...readLocal(userKey), ...readLocal(guestKey)]));
        setLoading(false);
        return;
      }

      const serverDone = new Set((data ?? []).map((r) => r.item_id as string));
      setDone(serverDone);
      setLoading(false);

      // Ce s-a făcut local (ca vizitator sau înainte de migrație) urcă în cont.
      const pending = [...readLocal(guestKey), ...readLocal(userKey)].filter((id) => !serverDone.has(id));
      if (pending.length === 0) return;
      let synced = false;
      for (const id of new Set(pending)) {
        const res = await completeOnServer(lessonId, id);
        if (res) {
          synced = true;
          serverDone.add(id);
        }
      }
      if (cancelled) return;
      setDone(new Set(serverDone));
      writeLocal(guestKey, new Set());
      writeLocal(userKey, new Set());
      if (synced) onServerChangeRef.current?.();
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId, userId, guestKey]);

  const markDone = useCallback(
    async (itemId: string): Promise<CompleteResult | null> => {
      setDone((prev) => (prev.has(itemId) ? prev : new Set(prev).add(itemId)));

      if (!userId) {
        writeLocal(guestKey, new Set(readLocal(guestKey)).add(itemId));
        return null;
      }

      const res = await completeOnServer(lessonId, itemId);
      if (res) {
        onServerChangeRef.current?.();
      } else {
        const userKey = storageKey(lessonId, userId);
        writeLocal(userKey, new Set(readLocal(userKey)).add(itemId));
      }
      return res;
    },
    [lessonId, userId, guestKey],
  );

  return { done, loading, markDone };
}
