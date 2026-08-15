🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

# `awcms-astro` project skills

Project-level Claude Code skills. Each skill encodes the standards in
[`docs/awcms-astro/`](../../docs/awcms-astro/README.md) and the decisions in
[`docs/adr/`](../../docs/adr/README.md) so that a coding agent applies them
consistently. They are invoked automatically when relevant, or by hand through
`/<skill-name>`.

> Read [`AGENTS.md`](../../AGENTS.md) first — that is the working contract.

## Catalogue

| Skill | When it is used |
| --- | --- |
| [`awcms-astro-integrasi`](awcms-astro-integrasi/SKILL.md) | Touching `src/lib/content.ts`, `src/lib/awcms/`, or `scripts/asal-media.mjs`; a build publishes a site that looks right but is missing content |
| [`awcms-astro-gerbang`](awcms-astro-gerbang/SKILL.md) | Before a PR; adding a rule to a document; a gate is red and the reason is not obvious |
| [`awcms-astro-situs-baru`](awcms-astro-situs-baru/SKILL.md) | Starting a new site repo from this template; a derived site behaves like its template |
| [`awcms-astro-performa-keamanan`](awcms-astro-performa-keamanan/SKILL.md) | Before a release or a go-live; touching `server/penyaji.mjs` or the performance budgets; answering a compliance question |

## Four skills, not fifty

`awcms` has 55 skills because it has 22 registered modules. This repo has one
principal responsibility — publishing public pages from `awcms` content — and a
skill describing something that does not exist here is more dangerous than a
skill that is missing: its reader assumes it applies.

Since [ADR-0034](../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
this repo has a SECOND role — a USER admin surface when a site declares one
through `permukaanAdmin` — and that role **deliberately has no skill yet**. The
reason is the rule above applied to itself: today `permukaanAdmin` is empty in
the template, there is not a single admin route, and there is not one line of
authenticated-surface code. A skill would be describing a procedure over code
that does not exist. The material is real and has already landed — as a
DOCUMENT, in
[`docs/awcms-astro/permukaan-admin-user.md`](../../docs/awcms-astro/permukaan-admin-user.md),
which is exactly the place to explain what a derived site must do. If a site
genuinely switches it on one day and the procedure proves repetitive, a fifth
skill will clear its own bar; today it does not.

**A new skill is added when there is a procedure that genuinely repeats in this
repo**, not to complete a catalogue. The fourth cleared that bar because
performance and security checks repeat at every template release **and** at
every derived-site go-live — two events far apart in time, run by different
people, and until now answered from memory.

## What is copied into a derived site

This repo is a GitHub **template repository**, so the entire contents of this
directory travel to every site that presses "Use this template". All four are
written for the template — not for one domain — so they stay true there. A
skill specific to a site's domain is written **in that site's repo**, not here.

## The rules that apply to skills in this directory

The same as for any document in this repo: **a skill that states something that
does not exist is a defect.** `bun run audit:dokumen` checks the links and the
file paths named here exactly as it checks `docs/` — `.claude/` is not excluded.

That rule is the spirit of `awcms`
[ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md),
which gated its 55 skills against the code they describe after finding four
skills pointing at files that had moved and six skills teaching a flow that had
been removed. The reasoning applies exactly the same way here, and more sharply:
**a document is read by a human who can doubt it; a skill is FOLLOWED.** The way
it ages runs opposite to an ordinary correction, too — the sentence "this does
not exist in this repo yet" starts out true, then the thing gets built, and the
sentence ages into a confident lie.

Since 5 August 2026 rules 1–3 of `awcms` ADR-0062 apply here in full:
`ADR-NNNN` citations are now checked by `bun run audit:dokumen` — one that does
not resolve to `docs/adr/` and is not marked as belonging to another repo
(`awcms`, "reference repo", or a github link in the same paragraph) is a
violation. That work is recorded in
[ADR-0028](../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) §E.

**There are FOUR rules, and the fourth has no checker here.** Rule 4 of `awcms`
ADR-0062 reads "a command a skill tells you to run must exist": a skill that
says `bun run <something>` that is not in `package.json` is a violation. Not one
of the six `audit:dokumen` gates reads `package.json`, so that rule is **not
enforced** in this repo. There is no violation of it today — but that is luck,
not a gate, and writing it up as "applies in full" would be precisely the claim
[ADR-0030](../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) exists
to argue against.
