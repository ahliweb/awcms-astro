/**
 * The reader's newsletter subscription — the client half.
 *
 * ## Status: REACHABLE since 28 August 2026 (ADR-0049)
 *
 * The four blockers below were all measured against `awcms`'s source, and all
 * four are closed by its ADR-0118: the three routes now export `OPTIONS`, send
 * `Access-Control-Allow-Origin`, resolve a cross-origin request's tenant from
 * the site's own `Origin` (verified against `awcms_tenant_domains`) instead of
 * from a host that is the CMS, and build the confirmation link on the site's
 * origin — where, until then, it had pointed at a page that does not exist on
 * the CMS, so no subscriber could ever be confirmed at all. The three paths are
 * frozen in that repo's `COMMITTED_PATHS`.
 *
 * The account below is kept rather than deleted: it is the reason this file
 * shipped before it could run, and the shape of what a consumer has to read off
 * a provider's source instead of assuming from a neighbour.
 *
 * ## What it was: BUILT, and DELIBERATELY UNREACHABLE
 *
 * `awcms` shipped a `newsletter` module on 21 August 2026 (its ADR-0103): an
 * anonymous, per-IP rate-limited `POST /api/v1/newsletter/subscribe`, double
 * opt-in, with a **neutral response for every outcome**. This file is the
 * caller for it.
 *
 * It does not call anything yet, and that is not an oversight. **Two things
 * must land in `awcms` first, and both were verified against its source rather
 * than assumed:**
 *
 *   1. **The path is not frozen.** `CONSUMER_PATHS` over there lists ten
 *      consumed paths and two committed ones; no newsletter path is among them.
 *      Every surface since `/site-profile/composed` has followed the same
 *      order — `awcms` freezes the shape as COMMITTED first, and only then does
 *      this repo call it. Doing it the other way round puts this build on a
 *      shape the other repo has not agreed to keep.
 *   2. **There is no `OPTIONS` handler, so the preflight cannot be answered.**
 *      This is the detail that would have been got wrong by copying a
 *      neighbour. The two search paths carry NO header, because nothing behind
 *      them answers `OPTIONS`; the beacon MUST carry
 *      `content-type: application/json`, because `checkOrigin` refuses a
 *      form-like content type — and `src/pages/api/v1/analytics/collect.ts`
 *      exports an `OPTIONS` route precisely so the preflight that follows has
 *      an answer.
 *
 *      `src/pages/api/v1/newsletter/subscribe.ts` exports **no `OPTIONS`**. Its
 *      OpenAPI contract requires `application/json`, which makes every
 *      cross-origin submission a preflighted request — and a preflight with no
 *      handler is a request that never reaches the endpoint at all.
 *
 *      So the endpoint is, today, unreachable from a static site on its own
 *      domain. That is a finding about `awcms`, not a limitation of this file.
 *
 * ## Why the code exists anyway
 *
 * Because the shape is decided and the failure modes are testable, and because
 * writing this AFTER the freeze would mean discovering (2) at the moment
 * somebody expected a working form. It ships behind a flag that is off, so
 * nothing renders and nothing is called; the tests below prove the caller obeys
 * `awcms`'s ACTUAL refusals rather than a guess at them.
 *
 * ## The neutral response, and the one thing a consumer must not undo
 *
 * `awcms` answers **the same body** for a new address, an address already
 * active, one that is suppressed, and a host resolving to no tenant. It never
 * says which. ADR-0103 is explicit about the cost and about why it is worth it:
 * a distinguishing response turns a public endpoint into a way to ask "is this
 * person on this newsroom's list", and for a newsroom in Central Kalimantan
 * that is a question with consequences for the person being asked about.
 *
 * **So this file renders the neutral answer as-is and adds nothing.** Any
 * client-side "that address is already subscribed" would rebuild the oracle the
 * endpoint refuses to be — from the one place nobody would think to look for it.
 */

/** The shape `awcms` returns on success, per its `NewsletterNeutralResult`. */
export type HasilNetral = {
  /** The same sentence for every outcome. Rendered verbatim. */
  message?: string;
};

export type HasilLangganan =
  | { keadaan: "diterima"; pesan: string }
  | { keadaan: "tak-valid" }
  | { keadaan: "terlalu-sering" }
  | { keadaan: "gagal" };

/**
 * The one header this request carries, and the reason it is not optional.
 *
 * `awcms`'s OpenAPI declares `application/json` for the request body, and its
 * `security.checkOrigin` refuses a cross-origin POST whose content type is
 * form-like. There is no spelling of this request that avoids a preflight.
 */
export const HEADER_LANGGANAN = { "content-type": "application/json" } as const;

/** Path, stated once so a caller cannot spell it differently. */
export const JALUR_LANGGANAN = "/api/v1/newsletter/subscribe";

/**
 * The two token paths, and the two PAGE paths they are reached from.
 *
 * The page paths are **not this repo's to choose.** `awcms` builds the link it
 * emails from `NEWSLETTER_CONFIRM_PATH` / `NEWSLETTER_UNSUBSCRIBE_PATH` in its
 * `newsletter-mail.ts`, joined onto the site's own origin — so a page must
 * exist at exactly `/newsletter/confirm` and `/newsletter/unsubscribe`, in
 * English, unprefixed by locale, whatever this site calls its other routes.
 * Renaming either one here breaks a link that is already in somebody's inbox
 * and cannot be recalled.
 */
export const JALUR_KONFIRMASI = "/api/v1/newsletter/confirm";
export const JALUR_BERHENTI = "/api/v1/newsletter/unsubscribe";
export const HALAMAN_KONFIRMASI = "/newsletter/confirm";
export const HALAMAN_BERHENTI = "/newsletter/unsubscribe";

/** The query parameter `awcms` puts the token in. Same reason as the paths. */
export const PARAM_TOKEN = "token";

/**
 * Post a token to one of the two token endpoints.
 *
 * Both take `{ token }` and nothing else, and both answer the same neutral body
 * whether the token was valid, already spent, or never existed. That is
 * ADR-0103's decision and this file does not undo it: a reader who follows a
 * dead link is told the same thing as one who follows a live one, because the
 * alternative is a page that confirms to anyone holding a guessed token that it
 * was once real.
 *
 * A MALFORMED token still answers 400 over there — a statement about the
 * request, not about any subscription — and that is the one case worth telling
 * a reader apart, because it is the case where the link was mangled in transit
 * and re-copying it might work.
 *
 * @param asal `awcms` origin, or `undefined` when this build has none.
 */
export async function tokenKirim(
  asal: string | undefined,
  jalur: typeof JALUR_KONFIRMASI | typeof JALUR_BERHENTI,
  token: string,
  ambil: typeof fetch = fetch
): Promise<HasilLangganan> {
  if (asal === undefined) return { keadaan: "gagal" };

  // Refused here rather than posted: an empty token is a link that lost its
  // query string, which no round trip can fix and which would spend a limiter
  // slot the reader may need for the real one.
  if (token.trim().length === 0) return { keadaan: "tak-valid" };

  let respons: Response;

  try {
    respons = await ambil(`${asal}${jalur}`, {
      method: "POST",
      headers: HEADER_LANGGANAN,
      body: JSON.stringify({ token })
    });
  } catch {
    return { keadaan: "gagal" };
  }

  return bacaHasil(respons);
}

/**
 * Submit an address.
 *
 * `credentials` is deliberately never set, so it stays `same-origin` — the
 * default — and no cookie `awcms` may set travels back. Same decision as the
 * beacon (ADR-0044): a reader subscribing to a newsletter has not agreed to be
 * recognised on their next visit to an unrelated page.
 *
 * @param asal `awcms` origin, or `undefined` when this build has none.
 */
export async function langgananKirim(
  asal: string | undefined,
  email: string,
  ambil: typeof fetch = fetch
): Promise<HasilLangganan> {
  if (asal === undefined) return { keadaan: "gagal" };

  let respons: Response;

  try {
    respons = await ambil(`${asal}${JALUR_LANGGANAN}`, {
      method: "POST",
      headers: HEADER_LANGGANAN,
      body: JSON.stringify({ email })
    });
  } catch {
    // A network failure, a blocked preflight, or a CSP refusal all land here,
    // and a reader cannot act on the difference between them.
    return { keadaan: "gagal" };
  }

  return bacaHasil(respons);
}

/**
 * Map one `awcms` response onto the four outcomes a reader can be shown.
 *
 * Shared by all three callers because all three endpoints answer with the same
 * envelope and the same neutral body. A second copy of this would be a second
 * place for somebody to add "already subscribed" to — from the one file nobody
 * would think to look in for the oracle ADR-0103 refuses to be.
 */
async function bacaHasil(respons: Response): Promise<HasilLangganan> {
  if (respons.status === 429) return { keadaan: "terlalu-sering" };

  // 400 is a statement about the REQUEST, not about any address, so surfacing
  // it leaks nothing — `awcms`'s own contract says so in as many words.
  if (respons.status === 400) return { keadaan: "tak-valid" };

  if (!respons.ok) return { keadaan: "gagal" };

  type Amplop = { data?: HasilNetral; message?: string };
  let muatan: Amplop | null = null;

  try {
    muatan = (await respons.json()) as Amplop | null;
  } catch {
    return { keadaan: "gagal" };
  }

  const pesan = muatan?.data?.message ?? muatan?.message;

  return {
    keadaan: "diterima",
    // The server's sentence when there is one. The fallback is deliberately
    // just as uninformative: a consumer that said more than the endpoint does
    // would undo the anti-enumeration decision from the client side.
    pesan: typeof pesan === "string" && pesan.trim().length > 0 ? pesan.trim() : ""
  };
}
