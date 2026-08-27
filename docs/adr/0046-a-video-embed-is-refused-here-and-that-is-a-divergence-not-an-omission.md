🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.id.md)

# ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission

- **Status:** Accepted
- **Date:** 27 August 2026
- **Related:** `awcms` ADR-0110 (a video-embed origin is an operator's decision), `awcms` ADR-0069 / ADR-0070 (the two divergences already recorded at this repo's written request), `AGENTS.md` §Keamanan, [ADR-0019](0019-csp-ketat-dikirim-penyaji.md), Issue #76

## Context

`src/lib/content-blocks.ts` renders a `video_news` block as a **link**, never as
an embedded player. That has been true since the block type was implemented, and
the reason is written in the file:

> An embedded player is a third-party surface that sees the reader before the
> reader has chosen to watch anything, which is exactly what this repo's
> no-third-party rule exists to prevent.

On 23 August 2026 `awcms` accepted its ADR-0110: an operator who sets
`BLOG_VIDEO_EMBED_ENABLED=true` adds exactly one origin —
`https://www.youtube-nocookie.com` — to `frame-src`, and nothing else. It is a
careful decision, and this ADR does not argue with it. The origin is not derived
from tenant data (one tenant enabling video would open it for every tenant on
that deployment), it widens `frame-src` only and never `script-src`, and
`frame-ancestors 'none'` stays untouched.

**So the two repos now do different things with the same block type, and nothing
anywhere said so.** Not this repo's ADR index, not `awcms`'s, and not
`awcms-family-compatibility.yaml`, which is the file the family keeps precisely
so that a deliberate difference cannot be mistaken for drift.

That silence is the whole problem. A difference nobody recorded reads, to the
next person, as one side not having got to it yet — and the obvious "fix" is to
copy the sibling. Here that would mean shipping an iframe into a template whose
CSP was written on the premise that it does not.

## Decision

**This repo refuses a video embed, on every deployment, with no switch. The
refusal is recorded as an intentional family divergence.**

Three parts:

1. **`video_news` renders as a link.** Unchanged behaviour, now with a decision
   behind it rather than a comment.
2. **There is no `BLOG_VIDEO_EMBED_ENABLED` here, and adding one is refused.**
   Not because the flag is badly designed — it is well designed — but because
   the two repos are not the same kind of thing. `awcms` is ONE deployment whose
   operator configures it. This repo is a TEMPLATE: the operator of a derived
   site is the organisation that owns the domain, and the flag would arrive
   pre-wired in a repo they copied rather than as a choice they made. The same
   asymmetry already produced the `hsts-include-subdomains` divergence.
3. **`ahliweb/awcms` is asked to record it** in `intentionalDivergences`, the
   way ADR-0069 and ADR-0070 were recorded at this repo's written request. This
   repo cannot write that file, and its ADR-0034 §Hubungan already established
   that asking is the mechanism.

## Consequences

- `frame-src` stays absent from this repo's CSP, and `tests/keluaran-csp.test.mjs`
  keeps asserting the policy it asserts today.
- A reader who wants the video gets a link and reaches YouTube **after choosing
  to**. The cost is real and is accepted: an embed converts better, and one
  fewer click is a genuine benefit to a newsroom.
- An editor placing a `video_news` block gets a working, labelled link rather
  than a broken frame — which is what would happen if the block rendered an
  iframe against a policy that blocks it.
- The family manifest gains a third entry describing this repo, once `awcms`
  records it. Until then the divergence is recorded HERE and only here, and that
  is stated rather than left to look complete.

## Rejected

- **Copying `BLOG_VIDEO_EMBED_ENABLED`.** See decision 2. A flag whose default
  is off is still a flag somebody will turn on without reading why it exists,
  and the reader whose browser is then seen by a third party is not the person
  who turned it on.
- **Embedding only for `youtube-nocookie.com`.** The domain name is a promise
  about cookies, not about the request: the origin still sees an IP address, a
  `User-Agent`, and a `Referer` naming the article, before the reader has
  pressed play.
- **Leaving it undocumented because the behaviour is not changing.** That is the
  state this ADR exists to end. Twelve `awcms` decisions drifted unabsorbed
  because "no change needed" and "nobody looked" produce the same silence.
