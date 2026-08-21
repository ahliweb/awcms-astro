/**
 * Bounded section archives (`awcms` #597 item 2, PRD FR-DSC-006).
 *
 * ## What this is for
 *
 * Every section page in this template rendered its ENTIRE history into one
 * document. With the sections a template ships that is invisible; with the
 * 23,906-article migration it names, it is a single HTML response carrying
 * every headline a newsroom has ever published — which no reader scrolls, no
 * crawler treats as a useful index, and no build produces quickly.
 *
 * ## Pure, because the decisions are the risky part
 *
 * The slicing is arithmetic. What is easy to get wrong, and invisible when
 * wrong, is where a page LIVES:
 *
 *   - **Page 1 stays at `/panduan/`.** It does not move to
 *     `/panduan/halaman/1/`, and that twin is never generated. Publishing both
 *     would give one page two URLs, split whatever ranking it has, and move an
 *     address that is already indexed — for a section that gained a second page
 *     only because somebody published a thirteenth article.
 *   - **Every page canonicalises to ITSELF.** Pointing pages 2..N at page 1 is
 *     a common habit and it would hide the entire archive from the index: for
 *     23,906 articles, every URL past the first twelve becomes unreachable
 *     except by clicking, which is exactly the outcome FR-DSC-006 exists to
 *     prevent.
 *   - **An empty section is page 1 of 1**, never page 1 of 0. A section with no
 *     articles is a normal state in a template, and "page 1 of 0" is a number
 *     no reader can make sense of.
 *
 * Those three are what `tests/paginasi.test.mjs` pins.
 */
import {
  SEGMEN_HALAMAN,
  localePath,
  type Locale
} from "../config/site";

export type Halaman<T> = {
  /** The items on this page, in the order they were given. */
  butir: T[];
  /** 1-based. */
  nomor: number;
  /** At least 1, even for an empty section. */
  total: number;
  sebelumnya: number | null;
  berikutnya: number | null;
};

/** How many pages `jumlah` items fill. At least 1 — see the module header. */
export function jumlahHalaman(jumlah: number, perHalaman: number): number {
  return Math.max(1, Math.ceil(jumlah / perHalaman));
}

/**
 * One page of a section.
 *
 * A `nomor` outside the range is CLAMPED rather than refused: the only callers
 * are `getStaticPaths` results, which cannot produce one, and a clamp keeps a
 * hand-typed URL rendering the nearest real page instead of an empty grid that
 * looks like a section which lost its articles.
 */
export function potongHalaman<T>(
  semua: readonly T[],
  nomor: number,
  perHalaman: number
): Halaman<T> {
  const total = jumlahHalaman(semua.length, perHalaman);
  const aman = Math.min(Math.max(1, Math.trunc(nomor)), total);
  const mulai = (aman - 1) * perHalaman;

  return {
    butir: semua.slice(mulai, mulai + perHalaman),
    nomor: aman,
    total,
    sebelumnya: aman > 1 ? aman - 1 : null,
    berikutnya: aman < total ? aman + 1 : null
  };
}

/**
 * The page numbers a route must GENERATE for a section — 2..N.
 *
 * Page 1 is deliberately absent: it is served by the section route itself, and
 * generating `/halaman/1/` as well is the duplicate URL this module exists to
 * avoid. An empty or single-page section therefore produces no extra routes at
 * all.
 */
export function nomorHalamanTambahan(
  jumlah: number,
  perHalaman: number
): number[] {
  const total = jumlahHalaman(jumlah, perHalaman);
  return Array.from({ length: total - 1 }, (_, i) => i + 2);
}

/** The path of one page of a section. Page 1 is the section's own path. */
export function jalurHalaman(
  locale: Locale,
  tab: string,
  nomor: number
): string {
  return nomor <= 1
    ? localePath(locale, `/${tab}/`)
    : localePath(locale, `/${tab}/${SEGMEN_HALAMAN}/${nomor}/`);
}
