# Lessons learned

Real recorded incidents only, each with what it cost — so the next person who
finds the pattern tempting does not have to re-discover why it was refused.

## The summary-vs-`view=full` empty build (ADR-0018)

The content adapter once read the post list without `view=full`. The field
`kategori` lives inside `contentJson`, which a summary response does not
carry — it reads as `undefined`, not as an error. The result: every section of
the site went empty, `astro check` stayed clean, and `bun run build` stayed
green. Cost: a published site whose every article was empty, caught only by
someone looking at the output, not by any gate. Fixed by requiring
`view=full` + `order=created_at` on every list traversal — see
[`contracts-index.md`](contracts-index.md).

## 60 of 101 communities mislabelled inside valid JSON

A stale `.sig` sidecar in a previous graphify run let a label move to the
wrong community during a rebuild — 60 of 101 labels ended up attached to a
community other than the one they described, while the JSON stayed
syntactically valid and every other gate stayed green, because none of them
read `graphify-out/`. Cost: a graph whose labels looked authoritative and
were not. Fixed by `bun run audit:graf` reading community names directly and
refusing a bare hub filename or a name that disagrees between `graph.json`
and `GRAPH_REPORT.md`.

## Translated key names published as reader-facing prose

The `t()` fallback chain ends at a key name, and this repo once published
`translation.notice.label`, `biaya.jenis.pnbp`, `tab.articleNo`, and
`tab.readMoreCta` as literal on-screen text, in both languages, with
`astro check` clean and a green build — because each was a dynamic key
assembled from configuration or editorial data, invisible to the PO-catalogue
gate that only sees literal calls. Cost: reader-facing pages with placeholder
key names instead of copy, undetected by any pre-build check. Fixed by
requiring a readable fallback argument on every dynamically assembled key
(`t(locale, key, tab.label)`), backstopped by `scripts/audit-konten.mjs`
scanning the **built output** for text shaped like this catalogue's own key
namespace.

## `padding` on a `.container` element deletes its own side padding

`.header-top` carried a `padding` shorthand on an element that also had the
`.container` class, silently overriding the container's side padding with
zero. Above `--max-width` the container is already inset by its own auto
margins, so nothing looked wrong on a desktop screenshot — the defect only
appears at the 360px floor, where the container is the full screen and
content sits flush against the edge of the glass. Cost: months of a visibly
broken small-screen layout that no desktop-based review caught. Fixed by
using `padding-block` instead, and by measuring `x=0`, not by trusting "looks
fine in the screenshot."

## The gate-count table drifted from the tests it counted

`README.md` once stated 21 gate files while `tests/` held 39, and not one gate
read that count to check it against reality. Cost: a document readers trusted
as a map of what CI actually checks, silently wrong for an unknown span of
history, discovered only by counting by hand. Fixed by
[`tests/documented-counts.test.mjs`](../../tests/documented-counts.test.mjs)
cross-checking the gate-file count against the documents that state it — the
same reason this issue's own spec insists any new test file land in a count
that document also tracks.
