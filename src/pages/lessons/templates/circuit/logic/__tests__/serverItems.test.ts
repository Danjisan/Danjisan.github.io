import { describe, expect, it } from "vitest";
import { CHAPTER_01 } from "../../../../../../content/circuits/chapters/01-primul-circuit";
import { XP_BY_DIFFICULTY } from "../../../../../../content/circuits/chapters/types";

/**
 * Lista albă de XP de pe server (colabme-server) trebuie să aibă exact mini-lecțiile capitolului,
 * cu același XP. Testul rulează doar dacă repo-ul serverului e lângă acesta (local, la Dan).
 * Modulele Node se încarcă dinamic: proiectul nu are tipuri Node în `src`.
 */
type Fs = { existsSync(p: string): boolean; readFileSync(p: string, enc: string): string };
type Url = { fileURLToPath(u: URL): string };

const fs = (await import(/* @vite-ignore */ "node:" + "fs")) as Fs;
const { fileURLToPath } = (await import(/* @vite-ignore */ "node:" + "url")) as Url;

const migration = fileURLToPath(
  new URL(
    "../../../../../../../../colabme-server/supabase/migrations/20261117_lesson_item_progress.sql",
    import.meta.url,
  ),
);

describe.skipIf(!fs.existsSync(migration))("XP pe server = XP din capitol", () => {
  it("capitolul 1", () => {
    const sql = fs.readFileSync(migration, "utf8");
    const rows = [...sql.matchAll(/\('(c1-[a-z-]+)',\s*(\d+)\)/g)].map((m) => [m[1], Number(m[2])]);
    const expected = CHAPTER_01.lessons.map((l) => [l.id, XP_BY_DIFFICULTY[l.difficulty]]);
    expect(rows).toEqual(expected);
  });
});
