---
bump: minor
tipe: konten
dampak: publik
---

# A reader can finally subscribe, confirm, and leave

`awcms` shipped a `newsletter` module on 21 August 2026 with three anonymous
public endpoints. A reader of a site built from this template could reach none
of them. The caller landed here on 27 August behind a hard-coded
`newsletterAktif = false`, because reading that repo's source rather than
assuming turned up **four** things that made the endpoint unreachable from a
static site.

All four are now closed by `awcms`
[ADR-0118](https://github.com/ahliweb/awcms/pull/748), and the three paths are
frozen in its `COMMITTED_PATHS` — the order both repos' Definition of Done
requires. The fourth blocker is worth naming on its own: the confirmation link
was built on the CMS's own origin, where no such page exists, so **double opt-in
had never worked for anyone at all**.

## What a site gets

`SITE_NEWSLETTER=true` turns on three surfaces together
([ADR-0049](../docs/adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)),
and only where `AWCMS_API_URL` is set:

- a subscribe form in the site footer — present on every page, interrupting
  nothing;
- `/newsletter/confirm`, where the link in the confirmation email lands;
- `/newsletter/unsubscribe`, which asks for one click and nothing else.

Those two page paths are **not this repo's to rename**: `awcms` builds the link
it emails from them, so a renamed page breaks a link already sitting in
somebody's inbox.

## Three decisions worth reading before touching it

- **The token is posted on a CLICK, never on page load.** Link scanners in mail
  clients fetch every URL in a message before its recipient sees it. A page that
  posted on load would record an unsubscribe nobody asked for — and, on the
  confirmation page, record consent no human ever gave.
- **The neutral answer is rendered as-is.** `awcms` says the same sentence for a
  new address, an already-active one, a spent token and one that never existed.
  A client-side "that address is already subscribed" would rebuild the
  enumeration oracle from the one place nobody would think to look.
- **The privacy page grows a section when, and only when, the form does.** An
  email address is the first per-person data this site asks a reader FOR.

This is the fourth call in this repo made from a reader's browser, and the first
that WRITES: a submission makes `awcms` send mail to an address somebody typed.
`tests/kontrak-awcms.test.mjs` now asserts thirteen called surfaces, and the
promised-but-not-called block is empty for the first time since it existed.
