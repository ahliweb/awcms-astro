🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.id.md)

# ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser

- **Status:** Accepted
- **Date:** 28 August 2026
- **Related:** [ADR-0043](0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md) (the reader-browser call class), [ADR-0044](0044-what-a-page-view-may-cost-a-reader.md) (what a page view may cost a reader), [ADR-0042](0042-a-byline-is-the-first-per-person-data-this-template-publishes.md) (the first per-person data this template PUBLISHES; this is the first it COLLECTS), `awcms` ADR-0103 (the module and its neutral answers), `awcms` ADR-0118 (the cross-origin policy that made it reachable), `awcms` PRD §30, Issue #79, `awcms` Issue #745

## Context

`awcms` shipped a `newsletter` module on 21 August 2026 with three anonymous
public endpoints. A reader of a site built from this template could reach none
of them: there was no form, no confirmation page, no unsubscribe page.

The caller landed here on 27 August behind a hard-coded `newsletterAktif =
false`, because reading `awcms`'s source rather than assuming turned up **four**
things that made the endpoint unreachable from a static site — no `OPTIONS` for
the preflight its own JSON contract forces, no `Access-Control-Allow-Origin`, a
tenant resolved from a HOST that is the CMS rather than from the site's
`Origin`, and a confirmation link built on the CMS's own origin where no such
page exists. The fourth meant double opt-in had never worked for anyone at all:
`consent_at` could not be written, so no subscriber could become `active`.

`awcms` ADR-0118 closed all four and froze the three paths as COMMITTED. This
decision is what this repo does with that.

## Decision

**A site may publish a newsletter, and does so by declaring `SITE_NEWSLETTER=true`.**

### 1. Three surfaces, one declaration

The footer form, `/newsletter/confirm`, and `/newsletter/unsubscribe` all appear
together or not at all. Splitting them into separate switches would allow the
half-set state that matters most: a form whose confirmation link goes nowhere.

The flag takes effect only where `AWCMS_API_URL` is set. All three are calls to
`awcms` from a reader's browser, and the beacon pairs the same two conditions
for the same reason: a declaration with no origin behind it publishes surfaces
that can do nothing.

### 2. The two page paths are NOT this repo's to choose

`awcms` builds the link it emails from `NEWSLETTER_CONFIRM_PATH` and
`NEWSLETTER_UNSUBSCRIBE_PATH` joined onto the site's origin. So the pages sit at
exactly `/newsletter/confirm` and `/newsletter/unsubscribe` — English,
unprefixed by locale, in a site whose other routes are neither. Renaming either
one breaks a link that is already in somebody's inbox and cannot be recalled.

The consequence is stated rather than hidden: those two pages render in the
site's DEFAULT locale. `awcms` stores a subscriber's locale and mails them in
it, but does not put it in the URL, so a bilingual site sends its English reader
to an Indonesian page. Fixing that requires `awcms` to change the shape of the
link, which is that repo's decision to make.

### 3. The token is posted on a CLICK, never on page load

This is the decision with the highest cost of getting wrong, and it is not about
style. Link scanners in mail clients and antivirus proxies fetch every URL in a
message before its recipient sees it. A page that posted its token on load would
record an unsubscribe nobody asked for — and, on the confirmation page, record
**consent no human ever gave**. Consent recorded without a human act is not
consent, and it is the one thing double opt-in exists to produce.

### 4. The neutral answer is rendered as-is, on all three surfaces

`awcms` answers the same sentence for a new address, an already-active one, a
suppressed one, a spent token and a token that never existed. This repo renders
that sentence and adds nothing. A client-side "that address is already
subscribed" would rebuild the oracle the endpoint refuses to be, from the one
place nobody would think to look for it.

Two responses keep their own meaning, and both are statements about the
REQUEST rather than about any subscription: `400` (a malformed address, a
mangled link) and `429` (this network has tried too often).

### 5. The privacy page grows a section when, and only when, the form does

An email address is the first per-person data this site asks a reader FOR —
ADR-0042 covered the first it publishes. A privacy page that does not mention it
is wrong on the one part it most needs to be right on. The section is
conditional for the same reason the beacon's is: a site that asks for nothing
must not read as though it asks.

## Consequences

- **The reader-browser class grows from three to four, and the fourth WRITES.**
  Search, suggest and the beacon read or count; this one makes `awcms` send mail
  to an address somebody typed. A wrong shape here does not merely leave a page
  empty — it sends something, or silently stops sending, to a person who asked
  for it.
- **The form locks while a request is in flight.** Without it one double-click
  spends two of five per-IP limiter slots, and the second is refused with a
  sentence the reader cannot tell apart from a failure.
- **The footer carries one more script on every page.** It is small, and it is
  measured by `audit:aset` like everything else the reader downloads.
- **A site can publish a form that quietly collects nothing.** If the `awcms`
  tenant has the module disabled, the endpoint answers the same neutral body as
  a success. Nothing here can see the difference, and nothing here should try:
  the check belongs on the CMS's admin screen, where the person who can act on
  it is looking.
- **The template itself publishes none of this.** `SITE_NEWSLETTER` is unset
  here, which is what `tests/kontrak-awcms.test.mjs` asserts.

## Rejected

- **Rendering the form without JavaScript.** The site is static; a `<form>` with
  no `action` that appears before its script is a control that stays silent when
  pressed, which `AGENTS.md` §Antarmuka calls worse than no control at all. It
  is hidden in the source, the script reveals it, and `<noscript>` says so.
- **Posting the token on page load.** See decision 3. It is the difference
  between recording consent and recording a mail scanner.
- **Telling a reader that an address is already subscribed**, or that a link was
  already used. Both rebuild the enumeration oracle from the client.
- **Locale-prefixed confirmation pages.** The link is built by `awcms` without a
  locale; a prefixed page would 404 for every subscriber.
- **Sending the email address alongside the unsubscribe token.** PRD §30 makes
  leaving the one action that must never require proving who you are, and a
  consumer that helpfully added the address would reintroduce exactly that.
- **A form in the article body.** It would interrupt what somebody is reading
  and would need one layout decision per page type. The footer is on every page
  and interrupts nothing.
