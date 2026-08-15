🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0019-csp-ketat-dikirim-penyaji.id.md)

# ADR-0019 — A strict CSP sent by the server, and scripts no longer live inside the HTML

- **Status:** Accepted
- **Date:** 2 August 2026
- **Applies to:** the public `awcms-astro` site (the ADR-0017 admin surface does not exist)
- **Related:** ADR-0016 (the Bun server holds the headers), ADR-0018 (output made CSP-ready for styles)

## Context

ADR-0018 cleared every inline **style** out of the build output and shipped
`tests/keluaran-csp.test.mjs` to guard it. What it left behind was stated plainly
in the README: a strict `script-src` could not yet be claimed, because the output
still carried scripts inside the HTML.

Recounted against the actual build output, the number is not two but **three
paths**, and the third is not visible from `src/` at all:

1. `<script is:inline>` for the theme switcher in `BaseLayout.astro` — two blocks,
   one in `<head>` to set `data-theme` before paint, one at the end of `<body>` to
   attach the button listener.
2. `<script is:inline type="application/ld+json">` — JSON-LD in BaseLayout,
   Breadcrumb, and FaqAccordion.
3. **A `<script type="module">` nobody wrote.** `ShareButtons.astro` uses a plain
   `<script>`, which Astro bundles. A bundle with no imports smaller than Vite's
   `assetsInlineLimit` (4 kB by default) is **inlined back into the HTML** instead
   of being emitted as a file. This is exactly the same pattern as the
   `inlineStylesheets: 'auto'` that ADR-0018 switched off for CSS: it depends on
   SIZE, so a site can be compliant today and stop being compliant tomorrow
   because somebody deleted three lines from a component.

Meanwhile `server/penyaji.mjs` sent three security headers and sent **no** CSP at
all. So the state was: a repo declaring its output "CSP-ready", with not one
reader ever having received a CSP.

## Decision

**1. The theme switcher moves to `public/tema.js`, loaded as a classic script.**

It has to run before the first paint — a `data-theme` set after the page is
painted means a white flash on every navigation for a reader who chose the dark
theme. A script bundled by Astro becomes `type="module"`, and modules are
**always** deferred until the document has finished parsing, so that path is
closed. What remains is a file in `public/` loaded by
`<script src="/tema.js">` with no `defer`/`async`, inside `<head>`.

An accepted consequence: that file's name is not hashed, so it is served
`must-revalidate` like HTML rather than `immutable` like `/_astro/`. That is
correct and deliberate — a fix to the theme switcher must reach an existing
reader on the next rebuild, not a year later.

**2. `vite.build.assetsInlineLimit: 0` in `astro.config.mjs`.**

This closes the third path above — and at the same time stops small images and
fonts being emitted as `data:` URIs, which is the only reason the `img-src 'self'`
and `font-src 'self'` below can be written without `data:`.

**3. JSON-LD STAYS inline, and that is not a loosened exception.**

`<script type="application/ld+json">` is not a script but a **data block**: a type
that is not a JavaScript MIME type makes the browser stop before any step that
executes code, so `script-src` does not apply to it. Moving JSON-LD to an external
file — which the README once recorded as a way out — is a pure loss with no
security gain: search engines read JSON-LD from the page, and JSON-LD in a
separate file is data nobody reads.

What guards its contents is not the CSP but its contract: all JSON-LD is
assembled by `JSON.stringify` over an object built by `src/lib/schema.ts`, with
not one HTML string passing through.

**4. `server/penyaji.mjs` sends `Content-Security-Policy`**, as the fourth
security header:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';
font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';
base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

**Matched to the `awcms` posture**, which already sends its own CSP
(`BASE_CSP_DIRECTIVES` in `src/lib/security/security-headers.ts`). Two values are
taken from there rather than chosen afresh here:

- **`base-uri 'none'`, not `'self'`.** `'self'` still permits an injected
  `<base href="/anything/">` to shift the resolution of EVERY relative link on the
  page. A static site never uses `<base>`, so nothing is lost by closing it.
- **`Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`**
  as the **fifth** security header. A site from this template has no forms,
  collects no reader personal data, and loads no third-party scripts — none of
  those four capabilities is used by anyone, and declaring them means a script
  that does slip through one day still cannot ask for a reader's camera or
  location.

One difference from `awcms` remains, and it runs in this repo's favour: `awcms`
has to name the **SHA-256 hash** of its theme-init script in `script-src`, because
that script is `is:inline` and must run before paint. This repo needs no hash at
all — item 1 above moves the same script into a file of its own. `script-src` here
is therefore stricter, not merely equivalent.

This repo also declares `style-src`/`img-src`/`font-src`/`connect-src`
explicitly, where `awcms` lets them fall back to `default-src`. The effect is
identical; the explicit form is chosen so that the directive a site is most likely
to loosen (`img-src`) appears as a line of its own rather than having to be found
first.

This policy lives in the same file as the three other headers because ADR-0016
already decided that response headers are settled in one place. Adding it in
Traefik instead of here would create two policy sources overwriting each other —
and the quietest way to end up with no policy at all.

Two things that are **not** installed, with their reasons:

- **`upgrade-insecure-requests`** — TLS is terminated by Traefik and every site
  URL is relative or on the `SITE_URL` origin. What it adds in production is zero,
  while on `bun run serve` over `http://localhost` it only obstructs the preview
  the README specifically asks people to use.
- **Per-page nonces or hashes** — both demand HTML that differs per request or a
  hash list that changes on every build. This site is static; the right solution
  is to have no inline scripts at all, and that is what the three items above do.

## Consequences

- **Loosening the CSP requires editing `server/penyaji.mjs` and `tests/penyaji.test.mjs`.**
  The most likely need: `img-src` for a site serving article images from the awcms
  media host. That is deliberate — a policy that can be loosened through an env
  variable is a policy that gets loosened with nobody reading it.
- **`tests/keluaran-csp.test.mjs` is promoted from advice to a production guard.**
  Before this ADR, its failing meant "the output is not CSP-ready yet". Now it
  means a page will lose its function in production: the gate refuses any inline
  script other than a JSON-LD data block, refuses cross-origin sources and `data:`
  URIs, and then **proves the JS did not disappear with them** — `/tema.js` on
  every page and at least one `/_astro/*.js` bundle.
- **Third-party scripts now fail hard.** AGENTS.md already forbade them; from now
  on it is the browser enforcing it, not only review.
- **The ADR-0017 admin surface inherits this policy as its FLOOR.** The Jualanku
  BFF document already states "the portal CSP may not be looser than the public
  CSP"; since this ADR that statement has a value it can be compared against.
