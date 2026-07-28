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
 *   2. **awcms media** — resolve `featuredMediaId` to a public R2 URL. This
 *      needs a media-resolution endpoint on the awcms side that does not exist
 *      yet; until it does, `src` stays `undefined`.
 *
 * `src: undefined` is a supported, styled state, not a broken one — every call
 * site renders a token-coloured block instead. A missing illustration must
 * never be a missing page.
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
