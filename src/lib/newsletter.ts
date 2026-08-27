/**
 * The reader's newsletter subscription — the client half.
 *
 * ## Status: BUILT, and DELIBERATELY UNREACHABLE
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
