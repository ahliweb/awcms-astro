🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0024-seni-lokal-di-src-assets.id.md)

# ADR-0024 — Local artwork in `src/assets/`, resolved to URLs by `import.meta.glob`

- **Status:** Accepted
- **Date:** 3 August 2026
- **Related:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (`img-src 'self'`), [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) §Resumption points item 1, [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (which made this work allowed to land)

## Context

`src/lib/article-images.ts` described **two** artwork sources from the start and
implemented **zero** — `getArticleImage` returned `src: undefined` unconditionally,
and its three callers did not even read `src`: they rendered a
`.visual-placeholder` regardless.

The consequence is more than "there are no images yet":

- **Four CSS frames have `img` rules nobody ever used.** `.feature-hero-img img`,
  `.card-img-wrapper img`, `.hero-visual-frame img`, `.article-hero-frame img` —
  all of them already correct, and not one ever tested against a real `<img>`.
- **The `audit:konten` ratio gate had nothing to check.** It reported
  "src/assets/ does not exist — skipped" on every run: a gate that looks like it
  runs while never answering a single question.

The second source — `awcms` media through `featuredMediaId` — **stays held**
(ADR-0021, narrowed by ADR-0023): its code is code whose shape is decided by an
`awcms` response, and this template repo has no instance to prove its calls are
right.

## Decision

**Local artwork lives in `src/assets/` and is resolved by `import.meta.glob` into
URL strings.**

The naming convention, relative to `src/assets/` and **without an extension**:

| Key | Used for |
| --- | --- |
| `hero` | The home page hero |
| `tab/<tab>` | A section hero |
| `artikel/<tab>/<slug>` | One article |

Any extension from `EKSTENSI_SENI` applies, so swapping a `.svg` for a `.webp`
touches not one line of code.

### `query: "?url"`, not `astro:assets`

`astro:assets` would re-encode and emit a `srcset`, and that is genuinely better
for raster. It is **refused for now** because its price is not performance but
shape:

- It returns `ImageMetadata`, not a string — so `ArticleVisual.src` changes shape,
  and all four frames have to move from `<img>` to the `<Image>` component.
- It treats SVG differently from raster, while SVG is exactly the format this
  repo's gates were written to read (`viewBox`, smallest text size).
- **Cropping does not disappear without it.** The frames crop in CSS, and
  `audit:konten` already refuses a source that is not 16∶9 before it can be
  published.

One shape for every format the gate accepts is worth more than a `srcset` on a
template that today carries zero images.

### No fallback from an article to its section's artwork

An article with no artwork file renders a placeholder, **not** its section's
image. A fallback would make every article in a section use the same image while
looking — at every call site — exactly like an image chosen for that article. A
placeholder is honest; a fallback is not.

### Two files with the same name = a failed build

`hero.svg` and `hero.png` together is an **error**, not a silent choice. Picking
one of them means the site publishes artwork that is not its author's latest
edit, with no way to see it short of opening every page.

### The image/placeholder branch lives in one component

`src/components/Ilustrasi.astro`. Written four times in four frames, it would
diverge four times — and the most likely shape of that divergence is a missing
`alt` or a `role="img"` left behind on an element that has become an `<img>`: two
defects felt only by a reader who cannot see the screen.

## Consequences

- **`img-src 'self'` suffices, the CSP does not change.** Vite emits assets to
  `/_astro/<name>.<hash>.<ext>` on the site's own origin. This **contrasts** with
  the second source: `awcms` media live on another origin and will require
  ADR-0019 to be widened.
- **The ratio gate stops being empty.** Verified in both directions when it
  landed: a 16∶9 source passes, a 1∶1 source turns `audit:konten` red naming its
  cropping.
- **The extension list now lives in three places** — the `EKSTENSI_SENI`
  constant, the literal `import.meta.glob` pattern (Vite requires it literal), and
  `EKSTENSI_GAMBAR` in `scripts/audit-konten.mjs`. Diverging, it produces a silent
  defect in both directions: an extension that is absorbed but not checked
  publishes artwork at the wrong ratio; one that is checked but not absorbed makes
  a file that passes the audit never appear. `tests/seni-lokal.test.mjs` compares
  all three as text.
- **The logic is tested without a build**, because building this template repo
  needs `awcms`. `src/lib/seni-lokal.ts` separates the whole mapping from
  `import.meta.glob` so `bun test` can reach it; what stays in
  `article-images.ts` is only the glob and three calls.
- **An accepted risk:** large rasters are not re-encoded, so a site using
  photographs instead of illustrations carries the full files. If that happens,
  moving to `astro:assets` is a reasonable change deserving its own ADR — it is
  the shape of `ArticleVisual` that would change, not the naming convention.

## Alternatives considered

- **`astro:assets` now** — see above; refused on shape, not on quality.
- **A manual registry (a slug → file map in a `.ts`)** — refused: two places that
  have to move together for every image, and the second will be forgotten.
  A naming convention cannot forget.
- **Putting artwork in `public/`** — refused: `public/` is not hashed, so
  replacing an image is held back by readers' caches; and `audit:konten`
  deliberately does **not** check ratios there, because its contents are site
  furniture (favicons, icons), not illustrations.
