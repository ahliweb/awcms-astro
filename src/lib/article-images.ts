/**
 * Article and section imagery.
 *
 * ## Two sources, and only one of them works today
 *
 * The reference implementation this template came from shipped 30 hand-drawn
 * SVGs keyed by article slug, optimised at build time by `astro:assets`. That
 * is not portable: the art belonged to one site, and images pulled from a CMS
 * do not exist on disk when the build runs.
 *
 * So the API is preserved and the SOURCE is not. A site fills it in one of two
 * ways, and **the first one is now implemented**:
 *
 *   1. **Local art** — drop files under `src/assets/` following the naming
 *      convention below. Nothing else: no registry to edit, no code to write.
 *      This path touches `awcms` nowhere at all.
 *   2. **awcms media** — `featuredMediaId` resolved to a public URL through
 *      `GET /api/v1/media/objects?ids=…`. **This is now implemented too**
 *      (ADR-0025), and it lives in `content.ts`, not here: this module is
 *      synchronous and components must never fetch. Both decisions ADR-0021
 *      recorded were kept — the resolved image lands on `LocalizedArticle`, and
 *      `img-src` names the media origin, discovered from
 *      `GET /api/v1/media/public-origin` rather than copied by hand.
 *
 * **awcms media wins over local art.** A `featuredMediaId` was chosen by an
 * editor for one specific article; a file under `src/assets/` is whatever the
 * site put at that path. When both exist, the more specific choice is the one
 * that was actually made about this article — see `getArticleVisual` below.
 *
 * ## Naming convention
 *
 * Relative to `src/assets/`, extension free — any of the extensions in
 * `EKSTENSI_SENI` works, and swapping `.svg` for `.webp` needs no code change:
 *
 * ```
 * hero.svg                  → the homepage hero
 * tab/<tab>.svg             → a section's hero, e.g. tab/pajak.svg
 * artikel/<tab>/<slug>.svg  → one article, e.g. artikel/pajak/pbb-2026.svg
 * ```
 *
 * **There is deliberately no fallback from an article to its section's art.**
 * A fallback would give every article in a section the same picture while
 * looking, at every call site, exactly like art that was chosen for it. A
 * missing file renders the styled placeholder instead, which is honest.
 *
 * `src: undefined` is a supported, styled state, not a broken one — every call
 * site renders a token-coloured block through `Ilustrasi.astro`. A missing
 * illustration must never be a missing page.
 *
 * ## Whatever you fill this with must be 16:9
 *
 * Every image frame in this template declares `--ratio-visual` (16:9) and crops
 * with `object-fit: cover`. A source in any other ratio is therefore not scaled
 * down — it is CROPPED, silently, at every viewport. A 1:1 source loses the top
 * 22% and the bottom 22%, which is exactly where an illustration's caption
 * tends to live. Nothing fails the build when this happens: the image still
 * renders, only its meaning goes missing.
 *
 * That is not hypothetical. The reference implementation shipped eleven banners
 * that way and nobody noticed until someone tried to read them.
 *
 * The rule is enforced rather than merely written down:
 * `scripts/audit-konten.mjs` checks the ratio of every source under
 * `src/assets/` — including the `viewBox` of SVGs — reads each file's format
 * from its CONTENT rather than its extension, and fails on a format whose
 * dimensions it cannot read rather than passing it silently. Run it with
 * `bun run audit:konten`; CI and the production image both do.
 *
 * Two further rules bind the CONTENT of whatever you add, and no checker can
 * verify them:
 *
 *   - No state emblems, logos, or official insignia — not even inside an
 *     illustration. A site built from this template is independent, and an
 *     emblem on the page contradicts that in one glance.
 *   - Text inside an image is a topic label only. No amounts, dates,
 *     registration numbers, names, or mock-ups of official documents and
 *     government app screens. A number inside an image cannot carry its source
 *     and legal basis, so it escapes every rule that governs the other numbers
 *     on the site — and it does not get updated when the tariff changes.
 */
import { cariSeni, indeksSeni, manusiawi } from "./seni-lokal";
import type { LocalizedArticle } from "./content";

/**
 * Every file under `src/assets/`, as a URL.
 *
 * `query: "?url"` rather than `astro:assets`, and that is a trade-off worth
 * stating. `astro:assets` would re-encode and emit a `srcset`, but it hands
 * back an `ImageMetadata` object rather than a string — which would change
 * `ArticleVisual.src` and every call site's markup, and it treats SVG (the
 * format this template's own gate is written to read) differently from raster.
 * A URL string keeps one shape for every format the gate accepts. Cropping is
 * not lost either way: the frames crop in CSS, and `audit:konten` already
 * refuses a source that is not 16:9.
 *
 * The pattern is a literal because Vite requires it — and its extension list
 * must match `EKSTENSI_SENI`, which `tests/seni-lokal.test.mjs` enforces
 * against `scripts/audit-konten.mjs` as well.
 */
const MODUL = import.meta.glob("../assets/**/*.{png,jpg,jpeg,gif,webp,avif,svg}", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const SENI = indeksSeni(MODUL, "../assets/");

export type ArticleVisual = {
  /** Absolute or site-relative URL, or `undefined` when there is no art for it. */
  src: string | undefined;
  alt: string;
  /** Intrinsic size, when the source reported one. awcms media does; local art does not. */
  width?: number | null;
  height?: number | null;
};

/**
 * The image for one article: awcms media first, local art second, placeholder
 * third.
 *
 * The order is the whole point, and it is not "remote beats local". It is
 * **specific beats generic**: `featuredMediaId` is a choice an editor made
 * about THIS article in the CMS, while `artikel/<tab>/<slug>` is a file a site
 * happened to place at a matching path. When both exist, honouring the file
 * would silently override an editorial decision — and nothing on the page would
 * say so.
 *
 * A site that wants the opposite does not need a flag: it stops setting the
 * featured image in awcms. That is a decision made where the article lives.
 */
export function getArticleVisual(
  article: Pick<LocalizedArticle, "gambar">,
  tab: string,
  slug: string
): ArticleVisual {
  return article.gambar ?? getArticleImage(tab, slug);
}

export function getArticleImage(tab: string, slug: string): ArticleVisual {
  return {
    src: cariSeni(SENI, `artikel/${tab}/${slug}`),
    alt: `${manusiawi(slug)} — ${tab.toUpperCase()}`
  };
}

export function getTabImage(tab: string): ArticleVisual {
  return { src: cariSeni(SENI, `tab/${tab}`), alt: manusiawi(tab) };
}

/**
 * The homepage hero. `alt` stays empty here and is supplied by the caller from
 * the PO catalogue — the homepage is the one place with a translated string for
 * it, and a humanised filename would be worse in both languages.
 */
export const heroImage: ArticleVisual = { src: cariSeni(SENI, "hero"), alt: "" };
