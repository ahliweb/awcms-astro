🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.id.md)

# ADR-0016 — Served by Bun behind Traefik/Coolify; nginx is dropped from the stack

- **Status:** Accepted
- **Date:** 31 July 2026
- **Amends:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) §7
  (the "the runtime stage stays unprivileged nginx for as long as the output is static" exception)
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (the adapter for
  on-demand routes), [`docs/deploy-coolify.md`](../deploy-coolify.md)

## Context

The owner's rule, 31 July 2026: **in development, staging, and production the
stack is Coolify and Traefik — not nginx.**

Today's state is not uniform against that rule:

| Environment | Current server | Compliant? |
| --- | --- | --- |
| Development | `bun --bun astro dev` | yes, unchanged |
| Staging & production | a final `nginxinc/nginx-unprivileged:1.29-alpine` stage serving `dist/` on `:8080`, behind Traefik | **no** |

So what changes is only the image path. Development is compliant by construction.

### Traefik cannot replace nginx directly

This is the fact that shapes this decision, and it is easy to miss: **Traefik is
a reverse proxy, not a static file server.** It has no equivalent of `root` +
`try_files`. "Delete nginx, let Traefik serve" is not an available option —
deleting nginx demands a replacement, and that replacement has to be something
that runs a process.

The only answer consistent with [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md)
is **Bun**. That also closes the gap ADR-0015 §7 honestly recorded as an
exception: until today this repo's production runtime was not Bun but nginx, even
as the repo declared itself Bun-only.

### What nginx was actually doing here

`ops/nginx-situs.conf` (deleted by this ADR's implementation; its contents are in
the git history up to the last commit before the Bun server) is not boilerplate.
Every rule in it has a written reason, and **all of them behave correctly and
silently when they disappear** — nothing fails, the pages still show:

1. `try_files $uri $uri/ $uri/index.html` — Astro uses
   `build.format: 'directory'`, so `/panduan/` is `/panduan/index.html`. Without
   it **every page 404s**.
2. `Cache-Control: public, max-age=31536000, immutable` for `/_astro/` — hashed
   assets; the only way a rebuild does not force readers to re-download all the
   CSS.
3. `Cache-Control: public, max-age=0, must-revalidate` for HTML — its comment
   states the stake: caching HTML voids the whole premise of rebuilding by
   webhook, and the site will look "not rebuilt yet" while its rebuild succeeded.
4. Three security headers from `ops/nginx-header-keamanan.conf`, re-`include`d in
   every `location` because nginx's `add_header` does **not** cascade once a
   `location` has an `add_header` of its own. That file records that this trap
   was found through testing, not through reading the configuration.
5. `error_page 404 /404.html`, refusal of dot-files, gzip, and a `wget`-based
   `HEALTHCHECK`.

Items 2–4 are the most dangerous to lose: the site still serves, looks normal,
and is wrong.

## Decision

1. **Bun serves the build output** in staging and production. Traefik still holds
   TLS and routing; Coolify still holds orchestration, builds, and variables.
2. **nginx leaves this repo**: the runtime stage in [`Dockerfile`](../../Dockerfile)
   along with `ops/nginx-situs.conf` and `ops/nginx-header-keamanan.conf`.
3. **Serving uses the Astro adapter run by Bun, not a hand-written static file
   server.** The reason is security, not convenience: a home-made file server
   means writing your own handling of path traversal, encoded-URL normalisation,
   and symlinks — a defect class nginx solved years ago and whose failure mode is
   arbitrary file reads, not an ugly page.
4. **`output: "static"` does NOT change.** An adapter is installed, every page is
   still prerendered, and not one route declares `prerender = false` in this
   change. What moves is only **who serves** the already-built files — not when a
   page is rendered. This keeps ADR-0014 intact: on-demand routes still wait on
   their PoC and P0 prerequisites.
5. **All five behaviours above must move across, and must be proven by tests.**
   Items 2 and 3 in particular: one test asserting HTML is **not** cached long and
   `/_astro/` assets **are** `immutable`. A rule that moves without proof is a
   rule that is lost.

## Consequences

**The runtime rule becomes genuinely uniform.** After this, "Bun is this repo's
runtime" holds in development, build, staging, and production without exception —
and ADR-0015 §7 no longer needs to record an exception that weakens it.

**Security headers and cache rules rise to the same layer in every environment.**
Until now both existed only in the production image; `bun run dev` never sent a
single security header. After the move, development serves the same headers —
which means a violation is visible while it is being developed, not when it is
deployed.

**The runtime surface changes shape rather than disappearing.** This has to be
stated honestly: replacing nginx with a Bun process does not mean "no runtime".
This repo's actual claim — and the one that stays true — is **there is no
database and no call to awcms at request time**. The site still serves when awcms
is down.

**An accepted cost.** A Bun process uses more memory than static nginx for the
same load, and serving static files is genuinely not the most efficient thing a
JavaScript runtime can do. For a site this size the difference decides nothing —
and a separate load analysis has already shown that the bottleneck of a static
site behind Traefik + Cloudflare is connection handling, not the serving work.

**Coolify and the healthcheck change too.** The port, the start command, and the
`HEALTHCHECK` in the Dockerfile change; [`docs/deploy-coolify.md`](../deploy-coolify.md)
is updated in the implementing PR.

## Implementation notes (1 August 2026)

The decision above has been implemented. Three things differ from, or are more
specific than, what is written above — recorded here so this ADR does not promise
something its implementation did not deliver:

1. **The adapter is `@astrojs/node` in `standalone` mode, run by Bun**, wrapped by
   [`server/penyaji.mjs`](../../server/penyaji.mjs), a few dozen lines that only
   install headers and compression. File lookup — `..`, encoded paths, symlinks,
   a directory's `index.html` — stays the adapter's, per decision 3.
2. **Compression is not hand-written**, for the same reason as file serving:
   `Accept-Encoding` negotiation, dropping `Content-Length`, and `Vary` are three
   places where being wrong produces a broken response. It uses the `compression`
   library.
3. **Development does not yet serve the same headers.** The "Consequences" section
   above states that after this move development sends the same security headers;
   that is not yet true. `bun run dev` is still the Astro development server,
   which does not pass through this server at all. What the implementation did do
   is map `bun run preview` onto the production server, so headers and caching can
   be seen locally with one command — but as long as pages are worked on through
   `bun run dev`, a violation is still invisible until somebody runs `serve`.

Decision 5 is met by [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs).
Note that this gate has two layers and **its integration layer is skipped in this
template repo's CI**, because the template repo has no content source and
therefore never has a build output; it runs inside `docker build` and in a site's
CI. The layer testing the header and cache rules runs everywhere.

## Alternatives weighed

**Traefik serving static files itself.** Refused as impossible: it does not have
that feature.

**Writing a small static server with `Bun.serve`.** Refused. It looks trivial — a
few dozen lines — and that is exactly the problem: every line translating a URL
into a file path is a line that can become an arbitrary file read. This repo has
already taken the same stance elsewhere (see `src/lib/content-blocks.ts`: there is
no raw HTML path because that path cannot be guarded). If it is ever adopted, it
must arrive with adversarial tests for `..`, double-encoded paths, and symlinks.

**Keeping nginx.** Refused: it breaks the rule that is this ADR's context, and it
preserves the one place this repo is not Bun-only.

**Caddy or another static server.** Refused: it adds a third runtime to a stack
whose rules are being simplified down to Coolify + Traefik + Bun.
