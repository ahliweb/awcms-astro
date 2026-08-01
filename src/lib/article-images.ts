/**
 * Article and section imagery.
 *
 * ## Why this is a stub with a real interface
 *
 * The reference implementation this template came from shipped 30 hand-drawn
 * SVGs keyed by article slug, optimised at build time by `astro:assets`. That
 * is not portable: the art belonged to one site, and `astro:assets` can only
 * optimise images that exist on disk when the build runs — which content pulled
 * from a CMS does not.
 *
 * So the API is preserved and the SOURCE is not. Call sites keep the same
 * shape, and a site that wants illustrations fills them in one of two ways:
 *
 *   1. **Local art** — drop images under `src/assets/` and resolve them here
 *      with `import.meta.glob`, exactly as the reference did. Best quality,
 *      because `astro:assets` can then crop and re-encode at build time.
 *   2. **awcms media** — resolve `featuredMediaId` to a public R2 URL. The
 *      endpoint this needed NOW EXISTS: `GET /api/v1/media/objects?ids=…`
 *      batch-resolves media ids to `{ publicUrl, altText, mimeType, width,
 *      height }`, reports unresolved ids rather than dropping them, and is
 *      gated on `media_library.media.read` — a read-only permission a machine
 *      credential may hold. Its own docstring in awcms names THIS file as the
 *      reason it was built. The build feed already carries `featuredMediaId`
 *      on every full row, so nothing upstream is missing any more.
 *
 *      What is still missing is on this side, and it is two decisions rather
 *      than a blocked contract:
 *
 *      - **Where the resolved image lands.** Not here: this module is
 *        synchronous and components must not fetch (see `AGENTS.md`). It
 *        belongs on `LocalizedArticle`, resolved once per build in
 *        `content.ts`, exactly like every other field.
 *      - **What `img-src` allows.** The public URL sits on the media host's
 *        origin, not this site's, so the strict CSP in `server/penyaji.mjs`
 *        (ADR-0019) blocks it until that origin is named. ADR-0019 §Menyesuaikan
 *        says to widen it in that file rather than through an env var — read
 *        the reasoning there before choosing otherwise.
 *
 *      Until both are decided, `src` stays `undefined`.
 *
 * `src: undefined` is a supported, styled state, not a broken one — every call
 * site renders a token-coloured block instead (`.visual-placeholder`). A
 * missing illustration must never be a missing page.
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
 * The rule is now enforced rather than merely written down:
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

export type ArticleVisual = {
  /** Absolute or site-relative URL, or `undefined` when this site has no art. */
  src: string | undefined;
  alt: string;
};

/**
 * `alt` is deliberately built from the human-readable slug rather than left
 * empty. Decorative-empty `alt` would be correct if these were decorations, but
 * they sit at the top of the article as its visual identity — a reader on a
 * screen reader should learn which article they are on.
 */
function humanise(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getArticleImage(tab: string, slug: string): ArticleVisual {
  return { src: undefined, alt: `${humanise(slug)} — ${tab.toUpperCase()}` };
}

export function getTabImage(tab: string): ArticleVisual {
  return { src: undefined, alt: humanise(tab) };
}

export const heroImage: ArticleVisual = { src: undefined, alt: "" };
