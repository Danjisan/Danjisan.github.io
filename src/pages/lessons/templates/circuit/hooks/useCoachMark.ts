import { useCallback, useState } from "react";

/**
 * Indicații vizuale („aici apeși”) care apar doar primele câteva ori, până elevul învață interfața.
 * Socoteala e per dispozitiv (localStorage); dacă stocarea nu merge, indicația apare ca de obicei.
 */
const PREFIX = "colabme:coach:";

function readCount(key: string): number {
  try {
    return Number(localStorage.getItem(PREFIX + key)) || 0;
  } catch {
    return 0;
  }
}

export function useCoachMark(key: string, times = 3) {
  const [count, setCount] = useState(() => readCount(key));

  /** Elevul a făcut acțiunea: o indicație mai puțin data viitoare. */
  const done = useCallback(() => {
    const next = readCount(key) + 1;
    try {
      localStorage.setItem(PREFIX + key, String(next));
    } catch {
      // fără stocare: indicația rămâne activă doar în sesiunea asta
    }
    setCount(next);
  }, [key]);

  return { active: count < times, done };
}
