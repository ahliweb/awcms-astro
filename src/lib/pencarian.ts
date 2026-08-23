/**
 * The reader's search box, minus the browser (`awcms` #607, `awcms` #597 item 3).
 *
 * Everything here is PURE — URL building, parameter reading, snippet parsing —
 * so the decisions that are easy to get wrong can be executed by `bun test`
 * without a browser and without `awcms`. The component script in
 * `src/components/KotakPencarian.astro` is the only part that touches the DOM,
 * and it is deliberately thin for exactly that reason.
 *
 * ## This is the first time the READER's browser calls `awcms`
 *
 * Every other call in this repo happens during `astro build`, from a machine
 * holding a read-only credential. This one happens in a stranger's browser,
 * anonymously, cross-origin, against endpoints that `awcms` ADR-0107 designed
 * for it. Three properties of that contract decide the code below, and none of
 * them is visible from the request that fails when they are broken:
 *
 *   1. **No custom headers.** A `GET` carrying only CORS-safelisted headers is
 *      a *simple request* and needs no preflight. `awcms` deliberately ships no
 *      `OPTIONS` handler, so adding one header — an `accept`, a tenant id, a
 *      correlation id — does not degrade: it fails in the reader's browser,
 *      where nobody watching the server can see it.
 *   2. **No credentials.** The grant carries no `Access-Control-Allow-Credentials`,
 *      so a `credentials: "include"` request cannot read its own answer.
 *   3. **The tenant comes from the `Origin`**, matched against that
 *      deployment's registered domains. An unregistered origin is answered with
 *      the neutral empty payload and no grant header — the same bytes as "no
 *      results". So a site whose domain is not registered over there gets a
 *      search box that finds nothing, and the only thing that knows why is a
 *      counter on the server.
 *
 * ## And the snippet never becomes HTML here
 *
 * `awcms` returns snippets whose only markup is `<mark>`, and it earns that
 * claim honestly (escape the whole `ts_headline` output first, THEN swap
 * plain-ASCII sentinels for the tags). This module still refuses to hand that
 * string to `innerHTML`, because `AGENTS.md` §Security's "no raw-HTML path from
 * the CMS" is not a statement about how careful the other side is — it is what
 * keeps the next field, from the next endpoint, from arriving through a path
 * that already exists. `potongSnippet` turns the string into text segments the
 * component writes with `textContent`.
 */

/** The two `awcms` surfaces the reader's browser calls (`awcms` ADR-0107). */
export const JALUR_KUERI = "/api/v1/site-search/query";
export const JALUR_SARAN = "/api/v1/site-search/suggest";

/**
 * The term facets a reader may filter on, and the ONLY parameter names this
 * module will put on a request (`awcms` #633).
 *
 * An allow-list rather than "forward whatever is in the address bar". Every
 * shared link carries somebody's tracking parameters (`utm_source`, `fbclid`),
 * and forwarding them would push reader-identifying values from THIS site into
 * a request to another origin — the one thing `AGENTS.md` §Security's "no
 * collection of readers' personal data" is about. `awcms` ignores unknown keys
 * rather than rejecting them, so nothing would have failed.
 *
 * The list matches the facets `awcms`'s search-source registry declares. A
 * facet added there is inert here until this list names it, which is the
 * correct direction: an unknown parameter reaching the query string would be a
 * probe of the index's shape, answered by the result count.
 */
export const FACET_TERM = ["channel", "topic", "institution", "region"] as const;

export type FacetTerm = (typeof FACET_TERM)[number];

/** `?type=` — the content-type facet, which is not a term facet (`awcms` #632). */
export const PARAM_TIPE = "type";

/** `?q=` — the query itself, on this site's URL and on `awcms`'s alike. */
export const PARAM_KUERI = "q";

/**
 * Longest query this site will send. `awcms` bounds it at 128 and REJECTS
 * anything longer rather than truncating, so a longer string buys a round trip
 * that can only answer "too_long".
 */
export const PANJANG_KUERI_MAKS = 128;

/**
 * Shortest query the box will send, and the debounce before it sends one.
 *
 * Both are CLIENT policy and neither is a security control: `awcms` enforces
 * its own `min_query_length` per tenant and its own per-IP rate limit, and this
 * site cannot see either. What they buy is not sending a request per keystroke
 * from a reader's browser — including the readers on metered connections whom
 * an autocomplete costs the most.
 */
export const PANJANG_SARAN_MIN = 2;
export const JEDA_SARAN_MS = 250;

export type FilterPencarian = {
  kueri: string;
  /** Content type (`blog_post`, …), or `undefined` for every type. */
  tipe?: string;
  /** Term facets, `{ channel: "politik" }`. Only `FACET_TERM` keys survive. */
  term: Partial<Record<FacetTerm, string>>;
};

/** One piece of a snippet: literal text, and whether `awcms` marked it as a hit. */
export type SegmenSnippet = { teks: string; sorot: boolean };

export type ButirHasil = {
  resourceType: string;
  resourceId: string;
  url: string;
  title: string;
  snippet: string;
  locale: string;
};

export type NilaiFacet = { value: string; count: number; label?: string };

export type HasilPencarian = {
  items: ButirHasil[];
  nextCursor: string | null;
  facets: { resourceTypes: NilaiFacet[]; terms: Record<string, NilaiFacet[]> };
  query: string;
  locale: string;
};

/**
 * Reads the filter state out of a URL's query string.
 *
 * Unknown keys are DROPPED, not carried: see `FACET_TERM`. An over-long query
 * is truncated here rather than refused, because this one is the reader's own
 * typing arriving through their address bar — refusing it would show an error
 * for a URL they may have pasted from somewhere legitimate, and `awcms` would
 * refuse the request anyway.
 */
export function bacaFilter(params: URLSearchParams): FilterPencarian {
  const term: Partial<Record<FacetTerm, string>> = {};

  for (const kunci of FACET_TERM) {
    const nilai = params.get(kunci)?.trim();
    if (nilai) term[kunci] = nilai;
  }

  const tipe = params.get(PARAM_TIPE)?.trim();

  return {
    kueri: (params.get(PARAM_KUERI) ?? "").trim().slice(0, PANJANG_KUERI_MAKS),
    ...(tipe ? { tipe } : {}),
    term
  };
}

/**
 * The `awcms` origin a request may be sent to, or `undefined`.
 *
 * Parsed rather than trusted, and reduced to its `origin` — that is what drops
 * a path, a query string, and the whitespace that could otherwise smuggle a
 * second value into the `connect-src` directive `server/penyaji.mjs` builds
 * from the same input. A value that is not an http(s) URL is treated as ABSENT,
 * which renders a site with no search box rather than a box that calls
 * something unexpected.
 */
export function asalPencarian(mentah: string | undefined): string | undefined {
  if (!mentah) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(mentah);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return undefined;
  }

  return parsed.origin;
}

/**
 * The absolute URL of one search request.
 *
 * Built with the `URL` constructor rather than string concatenation so the
 * ORIGIN cannot be moved by anything in the filter: a `kueri` of
 * `//evil.test/` concatenated after a base would produce a request to another
 * host, and it would look like a search that returned nothing.
 */
export function alamatKueri(
  asal: string,
  filter: FilterPencarian,
  extra: { locale?: string; cursor?: string } = {}
): string {
  const url = new URL(JALUR_KUERI, asal);

  url.searchParams.set(PARAM_KUERI, filter.kueri);
  if (extra.locale) url.searchParams.set("locale", extra.locale);
  if (filter.tipe) url.searchParams.set(PARAM_TIPE, filter.tipe);
  if (extra.cursor) url.searchParams.set("cursor", extra.cursor);

  for (const kunci of FACET_TERM) {
    const nilai = filter.term[kunci];
    if (nilai) url.searchParams.set(kunci, nilai);
  }

  return url.toString();
}

/** The absolute URL of one suggestion request. Same origin rules as `alamatKueri`. */
export function alamatSaran(
  asal: string,
  kueri: string,
  locale?: string
): string {
  const url = new URL(JALUR_SARAN, asal);
  url.searchParams.set(PARAM_KUERI, kueri.slice(0, PANJANG_KUERI_MAKS));
  if (locale) url.searchParams.set("locale", locale);
  return url.toString();
}

/**
 * This site's own `/cari/` URL for a filter state — what a facet chip links to
 * and what the box writes into the address bar.
 *
 * A real `href` on every chip rather than a click handler, so a reader can open
 * a filtered search in a new tab, bookmark it, or share it. A control that only
 * responds to a left click is a control that behaves differently from every
 * other link on the page.
 */
export function jalurPencarian(dasar: string, filter: FilterPencarian): string {
  const params = new URLSearchParams();

  if (filter.kueri) params.set(PARAM_KUERI, filter.kueri);
  if (filter.tipe) params.set(PARAM_TIPE, filter.tipe);
  for (const kunci of FACET_TERM) {
    const nilai = filter.term[kunci];
    if (nilai) params.set(kunci, nilai);
  }

  const kueriString = params.toString();
  return kueriString ? `${dasar}?${kueriString}` : dasar;
}

/** Filter state with one facet set, or CLEARED when it is already that value. */
export function dengan(
  filter: FilterPencarian,
  kunci: FacetTerm | typeof PARAM_TIPE,
  nilai: string
): FilterPencarian {
  if (kunci === PARAM_TIPE) {
    // Clicking the active chip clears it. Without that a reader who narrows to
    // one channel has no way back except editing the address bar — and the
    // facet counts, which are computed WITHOUT their own filter precisely so
    // the way back stays visible, would be pointing at a door with no handle.
    const tanpaTipe: FilterPencarian = { kueri: filter.kueri, term: filter.term };
    return filter.tipe === nilai ? tanpaTipe : { ...tanpaTipe, tipe: nilai };
  }

  const term = { ...filter.term };
  if (term[kunci] === nilai) delete term[kunci];
  else term[kunci] = nilai;

  return { ...filter, term };
}

const SENTINEL_MULAI = "<mark>";
const SENTINEL_SELESAI = "</mark>";

/**
 * Undo `awcms`'s snippet escaping for the five characters it escapes.
 *
 * `&amp;` LAST, and that order is the whole correctness of this function. The
 * escaper runs `&` first, so `&lt;` in the source content leaves as
 * `&amp;lt;`; decoding `&amp;` first would turn that back into `&lt;` and then
 * into `<`, resurrecting a character the escaper existed to neutralise. Decoded
 * last, it yields the literal text `&lt;`, which is what the reader wrote.
 */
function bacaEntitas(teks: string): string {
  return teks
    .split("&#39;")
    .join("'")
    .split("&quot;")
    .join('"')
    .split("&gt;")
    .join(">")
    .split("&lt;")
    .join("<")
    .split("&amp;")
    .join("&");
}

/**
 * Splits a snippet into text segments, marking the ones `awcms` highlighted.
 *
 * The output is TEXT — no markup, no `innerHTML`. The component writes each
 * segment with `textContent` into a `<mark>` or a text node, so a snippet that
 * somehow carried a tag would render as the characters of that tag rather than
 * as an element. That is a second line behind `awcms`'s own escaping, and it is
 * there because this repo's rule is about the PATH existing, not about the
 * current contents of the string.
 *
 * An unbalanced sentinel is not an error: a `<mark>` with no closer highlights
 * to the end, which is what a reader would expect to see and is impossible to
 * turn into markup either way.
 */
export function potongSnippet(snippet: string): SegmenSnippet[] {
  const segmen: SegmenSnippet[] = [];
  let sisa = snippet;
  let sorot = false;

  while (sisa.length > 0) {
    const batas = sorot ? SENTINEL_SELESAI : SENTINEL_MULAI;
    const index = sisa.indexOf(batas);

    if (index < 0) {
      segmen.push({ teks: bacaEntitas(sisa), sorot });
      break;
    }

    if (index > 0) {
      segmen.push({ teks: bacaEntitas(sisa.slice(0, index)), sorot });
    }

    sisa = sisa.slice(index + batas.length);
    sorot = !sorot;
  }

  return segmen;
}
