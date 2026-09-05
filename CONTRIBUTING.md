🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](CONTRIBUTING.id.md)

# Contributing Guide

Thank you for intending to help. Before anything else, one thing shapes every rule below:

**This repo is a template, not a site.** What you send is not an article but the mould other sites are cast from. A defect here does not appear once — it travels to every site born from this template, and most of the costliest defects here do not fail any build: one site's identity embedded in the code, a catalogue key displayed as reader-facing text, an image silently cropped, an `og:image` tag pointing at a file that never existed. That is why many rules here feel stricter than in a typical web project.

A site built from this template adds its own content rules — verifying tariffs, legal bases, service unit data — and those rules are enforced on the `awcms` side where its content lives, not here.

> **The development hold is OVER** as of 4 August 2026
> ([ADR-0027](docs/adr/0027-penahanan-adr-0021-selesai.md)); this repo and
> [`ahliweb/awcms`](https://github.com/ahliweb/awcms) are both under development.
> What replaced it is one question that still applies:
> **would this change be rewritten if `awcms` changed?** If yes, it needs an
> `awcms` instance to prove its calls are right before it lands — and
> "the endpoint already exists" is not an answer of "no"
> ([ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)).
> This template repo has no instance, so a contribution touching content
> fetching is most useful when it comes from a real site.

AI agent contributors: read [`AGENTS.md`](AGENTS.md) first. It is the binding technical working contract, not a summary.

## What is needed most

| Contribution | Why it is valuable |
| --- | --- |
| **Reports from the gates that already exist** | The three gates once listed here — the SEO metadata audit, dead links in `dist/`, the image ratio checker — now live in [`scripts/audit-konten.mjs`](scripts/audit-konten.mjs). What is valuable now is the opposite: the **false positives** it reports on a real site, and the defect classes it misses |
| **Keeping the output free of inline styles and scripts** | Already done (ADR-0018/0019) and guarded by [`tests/keluaran-csp.test.mjs`](tests/keluaran-csp.test.mjs); the server now really does send a strict CSP. What is valuable: a new component that quietly brings them back — Astro inlines small bundles into the HTML based on SIZE, so compliance can be lost without any rule being changed |
| **Interface catalogue translations** | `src/locales/<locale>/messages.po`. There are few strings and all of them appear on every page |
| **Reports from a real site** | What turned out to need editing outside `src/config/site.ts` and `.env` — every such finding breaks this template's central promise |

## Setting up

```bash
bun --version         # >= 1.4.0, per `engines.bun`
cp .env.example .env  # fill in AWCMS_API_URL, the token, and the tenant
bun install
bun run dev           # http://localhost:4321
```

| Command | Purpose |
| --- | --- |
| `bun run dev` | The Astro development server (HMR) |
| `bun run check` | The lockfile gate, then `astro check` |
| `bun run check:lockfile` | The lockfile gate only — pure file reading, no network |
| `bun test` | The block renderer, the PO catalogue gate, and the serving gate |
| `bun run build` | `check` → `astro build` → bundle the server |
| `bun run serve` | Runs the production server over the build output (`preview` and `start` are its aliases) |
| `bun audit` | Dependency-chain vulnerabilities |
| `bun run release <level>` | A tagged release (a maintainer's authority) |

`bun run dev` is **not** the production server: it sends neither the security headers nor the cache rules in [`server/penyaji.mjs`](server/penyaji.mjs). To see exactly what a reader sees, run `bun run build && bun run serve`.

`bun run build` pulls content from a real `awcms` instance. This template repo has none, so a full build can only be run if you point it at your own instance — which is also why the `build` job in CI is conditioned on `vars.AWCMS_API_URL` being filled in. A change that does not touch content fetching can still be validated fully with `bun run check` and `bun test`.

## The contribution flow

1. **Start from an issue** with a clear scope. If the change touches a base standard, write an [ADR](docs/adr/README.md) first — the list of triggers is in [`GOVERNANCE.md`](GOVERNANCE.md#when-a-change-needs-an-adr).
2. **Branch from `main` before touching any file.** Do not commit directly to `main`.
3. **One iteration = one atomic scope.** Finish and validate it before moving on. Do not stack several unrelated changes on one branch.
4. **Before writing any value specific to one site, ask what happens when the next site uses it.** Names, marks, regions, and the list of tabs are inputs — not constants.
5. **Update the documentation** when behaviour, workflow, structure, or configuration changes — in the same iteration. In this repo the documentation is part of the product.
6. **Write a changeset** in [`.changesets/`](.changesets/README.md) in the same iteration, not batched up at the end.
7. **Run `bun run build` and `bun test`**; both must be clean.
8. **Open a Pull Request** with `Closes #<issue>`. Merge after review and a green CI, then delete the branch.

### Branch naming

`feat/<slug>`, `fix/<slug>`, `docs/<topic>`, `chore/<slug>`, `terjemahan/<locale>-<slug>`.

### Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`.

| Type | For |
| --- | --- |
| `feat` | A new capability visible to a template user or a site reader |
| `fix` | Correcting wrong behaviour |
| `terjemahan` | Filling in or editing a locale catalogue |
| `docs` | Documentation, ADRs, skills |
| `chore` | Dependencies, configuration, tooling |
| `refactor` | A change of code shape with no change of behaviour |
| `style` | Presentation and CSS |

Example scopes: `konten`, `i18n`, `seo`, `share`, `gambar`, `deploy`, `runtime`, `lockfile`, `rilis`.

The commit body explains **why**, rather than repeating the diff.

## Rules that are not negotiable

The full detail and the reasoning for each is in [`AGENTS.md`](AGENTS.md). The ones most often broken without noticing — all of them because breaking them **never fails**:

- **Only `src/lib/awcms/client.ts` may contact awcms.** Components receive data through props.
- **There is no raw HTML path from the CMS.** Content blocks are assembled from escaped text and fixed tags; `set:html` only ever accepts the output of `renderContentBlocks`.
- **A build token is never prefixed `PUBLIC_`.** Astro injects variables with that prefix into the client output.
- **One site's identity may not enter the code.** Its place is `src/config/site.ts` and `.env`.
- **Interface strings go through the PO catalogue**, including labels that come from configuration. A key assembled from configuration or editorial data must be called with a readable fallback argument — the end of the `t()` chain is the KEY NAME, and a key name on screen is not a readable page.
- **Every core function works without JavaScript**, and WCAG 2.1 AA accessibility is a floor, not a target.
- **Do not advertise an asset this build does not publish.** `og:image` and `ImageObject` are claims; a claim pointing at a 404 is worse than an absent tag.
- Forbidden: third-party scripts, collecting readers' personal data, the emblems or logos of state institutions (including inside illustrations), and mocked-up government documents or application interfaces.

## Translation

The interface catalogues are in `src/locales/<locale>/messages.po`. Which locales exist is decided by `localeMeta` in `src/config/site.ts`; this template carries `id` and `en`.

Two rules guarded by `tests/katalog-po.test.mjs`, and easy to break:

- **A new key goes into EVERY locale catalogue.** A catalogue left behind never fails on its own — it falls back to the default locale and looks fine until somebody reads that page in that language.
- **An empty `msgstr` is the same as an absent key**, but it looks translated when a human reads the catalogue.

A site may set stricter conditions for a particular language — for instance requiring a native speaker for a language with a thin technical register. Write that condition as an ADR in the site's repo from the start, not after machine translation has already been published.

What may not change in translation: numbers, regulation references, the degree of certainty of a sentence, and official warnings.

**The documents in this repo have their own translation direction, and it is the opposite of the above.** English at the bare path is the source and Indonesian at `<name>.id.md` is the mirror ([ADR-0039](docs/adr/0039-english-is-the-source-language.md)); `bun run audit:translation` detects a mirror gone stale against the source it records the hash of. That is about documents. The PO catalogues above are about the interface a reader sees, and their default locale stays `id`.

## Definition of Done

The full and binding list is in [`AGENTS.md`](AGENTS.md#definition-of-done). In brief, a piece of work is done when **all** of these hold:

- [ ] The atomic scope is met; no unrelated changes hitched a ride.
- [ ] `bun run build` is clean, including `astro check`.
- [ ] `bun test` is green — including the PO catalogue, serving, `awcms` surface,
      and toolchain version gates.
- [ ] `bun run audit:konten`, `bun run audit:dokumen`, `bun run audit:translation`,
      and `bun run audit:graf` are green. The last guards `graphify-out/` — an
      artefact that is tracked, and therefore read as a map by whoever comes
      after you.
- [ ] `bun audit` reports **0 vulnerabilities**.

`bun run release <level> --apply` runs six of those commands in an order that
means something — build, `bun test`, `audit:konten`, `audit:dokumen`,
`audit:graf`, and `bun audit`. It does **not** run `bun run audit:translation`;
CI does, on every push. The releaser is not a substitute for running them while
working on a PR, but it is what makes sure no release skips them.
- [ ] A new page works with JavaScript switched off.
- [ ] New interface strings enter every locale catalogue; dynamic keys have a readable fallback.
- [ ] The default locale and prefixed locales produce the same number of pages.
- [ ] No single site's identity is embedded in the code.
- [ ] A new env variable is documented in `.env.example`, along with the consequence of filling it in wrongly.
- [ ] The presentation is usable from 360px wide up to desktop, in both themes.
- [ ] A new image is at `--ratio-visual`, its extension matches the file contents, and it carries no institutional emblem or mock data.
- [ ] Documentation explaining changed behaviour is updated with it.
- [ ] A changeset is written when the change affects public output, structure, dependencies, or deployment.

## Reporting problems

- Security vulnerabilities: [`SECURITY.md`](SECURITY.md) — do **not** open a public issue.
- Bugs and questions: [`SUPPORT.md`](SUPPORT.md).
- Contributor behaviour: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
