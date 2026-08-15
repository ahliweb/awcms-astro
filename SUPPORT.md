🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SUPPORT.id.md)

# Support

## What this channel is NOT

**This repo is a template, not a site.** If you arrived here because of a site built with it, contact that site's operators — this repo does not hold their content, does not hold their data, and cannot change anything published there.

Questions about the template — how to start a new site, integration with `awcms`, or component behaviour — are welcome through GitHub Issues.

If you receive a message in this site's name asking for payment or personal data, it is a scam.

## What can be helped with here

| Need | Route |
| --- | --- |
| Template error, broken layout, dead link, wrong build output | Open an issue with the **Bug report** template |
| Something turns out to need editing outside `src/config/site.ts` and `.env` | Open an issue — that breaks this template's central promise, and we treat it as a bug |
| Wanting to help translate the interface catalogue | Open an issue, then see [`CONTRIBUTING.md`](CONTRIBUTING.md#translation) |
| A question about integrating with `awcms` | Open an issue; the contract is in [`docs/awcms-astro/integrasi-awcms.md`](docs/awcms-astro/integrasi-awcms.md) |
| Wanting to use this repo as the starting point for another site | Read [`docs/awcms-astro/`](docs/awcms-astro/README.md) |
| Finding a security vulnerability | **Do not open a public issue.** Follow [`SECURITY.md`](SECURITY.md) |

## Priority

Handled before anything else: defects that **do not fail the build**. A site that looks successful but is missing articles, a page showing a key name as reader-facing text, an image silently cropped, an `og:image` tag pointing at a file that does not exist, and cache headers that keep a successful rebuild from ever being seen by a reader — all of them pass a green CI, and all of them travel to every site born from this template.

Correcting a site's content is not this repo's business: that content lives in that site's own `awcms` instance, and this repo cannot change anything published there.
