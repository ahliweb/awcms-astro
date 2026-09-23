# Contracts index

What this repo may call on `awcms`, and the rules that make those calls
trustworthy — a graph query can find every `fetch` call site, but not which
of them is inside contract and which is not.

## The three frozen build-time surfaces

`awcms` ADR-0065 freezes the response shape of exactly the surfaces this
build calls at `astro build` time, derived by grepping this repo, not from
memory. [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs)
hardens that set to three and checks it against the marked table in the
[`awcms-astro-integrasi`](../../.claude/skills/awcms-astro-integrasi/SKILL.md)
skill in both directions. A fourth build-time surface reddens that gate until
`awcms` freezes its shape there too — **"the endpoint already exists" is not
an answer of "no"** (`AGENTS.md` §"One test before starting anything").

Separately, a smaller set of reader-browser surfaces (search, suggest, the
visitor beacon, the newsletter endpoints) is called at runtime from a
reader's own browser, not from the build — see the skill above for the full
list and why they do not share one CORS/header rule.

## The tenant comes from the token

`AWCMS_API_TOKEN` determines the tenant; `AWCMS_TENANT_ID` is only an
assertion checked against it, never a resolution input. Sending a tenant
header does nothing — `awcms` derives the tenant from the machine credential
and ignores a header that disagrees. Getting this wrong looks like a healthy
build that happens to publish another tenant's content.

## `view=full` is not optional

The post list returns SUMMARIES unless `view=full` is requested (which
requires `order=created_at`). `contentJson`, `excerpt`, `metaDescription`,
`canonicalUrl`, and `translationGroupId` are `undefined` without it — no
error, just an empty site with a green build (this happened once, see
[`lessons-learned.md`](lessons-learned.md)).

## Refusals that must be imitated, not caught and hidden

`403 TENANT_SUSPENDED` and `403 PARTNER_SUSPENDED` both fail the build
totally and read exactly like a revoked token, but only one is fixable from
this repo (issuing a new token) — the other requires the tenant's own status
to change on the `awcms` side. Full detail: `AGENTS.md` §"Data sources".
