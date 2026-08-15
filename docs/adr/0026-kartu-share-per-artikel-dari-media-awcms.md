🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0026-kartu-share-per-artikel-dari-media-awcms.id.md)

# ADR-0026 — Per-article share cards from `awcms` media, with the metadata travelling alongside

- **Status:** Accepted
- **Date:** 3 August 2026
- **Extends:** [ADR-0025](0025-gambar-artikel-dari-media-awcms.md) — the source and the resolution mechanism are the same; this ADR adds a second surface that uses them.
- **Related:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md), `awcms` [ADR-0056](https://github.com/ahliweb/awcms/blob/main/docs/adr/0056-media-library-admin-surface.md)

## Context

"A share card per page" is this repo's oldest backlog item, and the reason was
always the same: this template carries no card generator, and the one in the
reference repo is bound to its own artwork and domain data.

That reason is true of a **generated** card. It was never true of an **uploaded**
one — and `awcms` already stores exactly that: `seoImageMediaId`, which its own
specification calls an explicit override, *"use this image for social/SEO
preview"*, that **beats** `featuredMediaId`. ADR-0025 already built the media
resolution batch, so this second surface adds not one new request.

What held it back was not the generator but something smaller and more dangerous:
**this page declares its card's dimensions and MIME type as constants.**

## Decision

**An article uses its own share card when `awcms` has one, and that card's
metadata travels with its URL.**

### 1. The order belongs to `awcms`, not to this repo

`seoImageMediaId ?? featuredMediaId` — exactly what `seo-facts-port-adapter.ts`
in `awcms` resolves. Assembling our own order here would mean the site and its
CMS's SEO surface answering one question with two answers, only one of which the
editor can see.

What does **not** travel with it: the image in the article body stays
`featuredMediaId`. What `awcms` prioritises is only the preview surface.

### 2. MIME type and dimensions travel too, and that is the core of this ADR

`BaseLayout` set `og:image:type` to `image/png` with `og:image:width` 1200 and
`og:image:height` 630 for ANY image, and `schema.ts` wrote an `ImageObject` with
the same constants.

That is true of `SITE_SOCIAL_IMAGE` — `.env.example` states that contract to
whoever fills it in. For an `awcms` media object it is wrong three times over:
those files are generally WebP at 1600×900. The consequence is not an ugly card
but **a card that lies to machines** — a preview fetcher trusting those numbers
stretches it into the wrong box or refuses the card, and there is not one failure
in the build. Its shape is identical to the defect `social-image.ts` was born to
end: an `og:image` pointing at a 404 with a green build.

So `ogImageType`/`ogImageWidth`/`ogImageHeight` become inputs that follow the
image, with the site card's constants as a **default** rather than as universal
truth. The JSON-LD `ImageObject` follows the same rule.

### 3. Three states, all supported

| What exists | What is published |
| --- | --- |
| `seoImageMediaId` or `featuredMediaId` | The article card, with its own MIME type and dimensions |
| Neither, but `SITE_SOCIAL_IMAGE` is filled in | The site card, `image/png` 1200×630 |
| Neither of them | **No image tag at all** — the preview falls back to a tidy text card |

The third state remains the most important to preserve: a preview with no image
falls back to something; a preview with a broken image falls back to nothing.

## Consequences

- **The "share card per page" backlog item narrows to GENERATED cards.** What an
  editor uploads already works, with no new dependency and no domain artwork.
- **Zero additional requests.** Both ids enter the same batch and are
  deduplicated; an article using one image for two surfaces is still one id.
- **A card's dimensions are no longer guaranteed to be 1200×630.** A 16∶9 media
  object is a valid card but not an optimal one; what this ADR guarantees is that
  **the numbers published are true**, not that they are ideal. Normalising them
  needs a generator — and that remains a backlog item with its own ADR.
- **An accepted risk:** `og:image:type` now comes from the `mimeType` `awcms`
  stores. `awcms` sniffs the MIME type from the bytes at upload finalisation (not
  from the extension), so that value is more trustworthy than the constant it
  replaces — but it is still a value from another system, and this repo does not
  re-verify it.

## Alternatives considered

- **Using `featuredMediaId` alone** — refused: `seoImageMediaId` exists precisely
  so an editor can choose a card different from the article illustration, and
  ignoring it makes that control have no effect at all with no sign of it in the
  CMS.
- **Keeping the 1200×630 constants for article cards** — refused; see §2. That is
  not a simplification but three false claims on every article page.
- **Dropping `og:image:width`/`height` entirely** — refused: they let some
  fetchers render the card without waiting for the image to download. Removing
  them trades one real problem for another real one, whereas sending true values
  trades nothing.
- **Generating a 1200×630 card from the article image at build time** — refused
  for now: it adds an image encoder as a build runtime dependency, and that is a
  decision that deserves to stand on its own.
