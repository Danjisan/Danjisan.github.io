import type { CircuitChallenge } from "../types";

export type ChallengeStatus = "solved" | "open" | "locked";

/** Indexul primei provocări nerezolvate; -1 dacă sunt toate rezolvate. */
export function firstUnsolvedIndex(challenges: CircuitChallenge[], solved: Set<string>): number {
  return challenges.findIndex((c) => !solved.has(c.id));
}

/** O provocare e deschisă dacă e rezolvată sau e prima nerezolvată; restul sunt blocate. */
export function challengeStatuses(
  challenges: CircuitChallenge[],
  solved: Set<string>,
): ChallengeStatus[] {
  const frontier = firstUnsolvedIndex(challenges, solved);
  return challenges.map((c, i) => {
    if (solved.has(c.id)) return "solved";
    return i === frontier ? "open" : "locked";
  });
}

/** Unde pornește elevul: la prima nerezolvată sau, dacă a terminat tot, la ultima. */
export function startingIndex(challenges: CircuitChallenge[], solved: Set<string>): number {
  const frontier = firstUnsolvedIndex(challenges, solved);
  return frontier === -1 ? Math.max(0, challenges.length - 1) : frontier;
}
