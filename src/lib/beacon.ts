/**
 * The visitor beacon, minus the browser (`awcms` #597 item 9, ADR-0044).
 *
 * Pure — payload shape, bounds, and URL building — so the decisions that are
 * easy to get wrong run under `bun test` without a browser and without `awcms`.
 * `src/components/BeaconKunjungan.astro` is the only part that touches the DOM.
 *
 * ## What ADR-0044 decided, and what it costs
 *
 * A site may call the beacon **only when it declares it**, and **always without
 * credentials**. A cross-origin `fetch` that does not ask for credentials
 * neither sends nor stores cookies, so `awcms`'s `awcms_visitor_key` — a
 * 30-day persistent identifier on the reader's device — never lands. That is
 * what keeps `AGENTS.md` §Security's "no analytics that bind an identity" true
 * word for word rather than reinterpreted, and it is why this site owes its
 * readers no consent banner: there is nothing to consent to.
 *
 * The price is stated rather than hidden: **every page view looks like a first
 * visit.** Page views are counted; unique visitors are not, and "12,000 views"
 * stops being convertible into "how many people".
 *
 * ## This one DOES carry a header, unlike the search box
 *
 * `awcms` #637 documented the reason: Astro's `security.checkOrigin` refuses a
 * cross-origin POST whose content type is form-like, and a `fetch` with no
 * content type falls into the same refusal. Only `application/json` gets
 * through — which makes this a preflighted request, and `awcms` ships an
 * `OPTIONS` handler for exactly that. `sendBeacon` cannot be used: it sends
 * `text/plain`, which is one of the refused types.
 *
 * So the two reader-facing calls in this repo have OPPOSITE rules, and neither
 * is a preference: search must carry no header because there is no `OPTIONS`
 * handler behind it, and this must carry one because there is.
 */

/** The `awcms` surface the reader's browser posts one page view to (ADR-0044). */
export const JALUR_BEACON = "/api/v1/analytics/collect";

/**
 * The only content type `awcms` accepts here.
 *
 * Not a default that could be dropped: `text/plain` and a missing content type
 * are both refused by `security.checkOrigin` over there, with a `403` that says
 * nothing about content types.
 */
export const TIPE_ISI_BEACON = "application/json";

/** `awcms` bounds these two fields and answers `400` outside them. */
export const PANJANG_KODE_TENANT_MAKS = 128;
export const PANJANG_JALUR_MAKS = 2048;

export type MuatanBeacon = {
  tenantCode: string;
  path: string;
  referrer?: string;
};

/**
 * The body of one page-view beacon, or `null` when `awcms` would refuse it.
 *
 * Refusing HERE rather than letting the server answer `400` is the point. The
 * response is invisible to the reader either way, so a request that can only
 * fail is a request nobody would ever find out about — it would sit in the page
 * costing a round trip per view and recording nothing, and the dashboards would
 * simply read zero.
 *
 * The REFERRER is deliberately optional and deliberately unpoliced here beyond
 * its presence: `awcms` reduces it to a domain before storing it, so the full
 * URL never reaches its database. Sending nothing when there is no referrer is
 * not the same as sending an empty string, which would store as a domain of
 * `""`.
 */
export function muatanBeacon(input: MuatanBeacon): MuatanBeacon | null {
  const tenantCode = input.tenantCode.trim();
  const path = input.path.trim();

  if (tenantCode.length === 0 || tenantCode.length > PANJANG_KODE_TENANT_MAKS) {
    return null;
  }

  if (!path.startsWith("/") || path.length > PANJANG_JALUR_MAKS) {
    return null;
  }

  const referrer = input.referrer?.trim();

  return { tenantCode, path, ...(referrer ? { referrer } : {}) };
}

/**
 * The absolute URL of the beacon.
 *
 * Built with the `URL` constructor for the same reason `alamatKueri` is: an
 * origin that can be moved by anything downstream is an origin that will be.
 */
export function alamatBeacon(asal: string): string {
  return new URL(JALUR_BEACON, asal).toString();
}
