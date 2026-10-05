/** Cale internă din `?next=`. Respinge URL-uri externe. */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (!raw) return fallback;
  let path: string;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return fallback;
  }
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes(":")
  ) {
    return fallback;
  }
  return path;
}

/** Link de login/register care păstrează destinația de după autentificare. */
export function authPath(kind: "login" | "register", next: string): string {
  if (next === "/") return `/${kind}`;
  return `/${kind}?next=${encodeURIComponent(next)}`;
}
