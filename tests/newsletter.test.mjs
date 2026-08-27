/**
 * The newsletter caller — and the two `awcms` facts that keep it switched off.
 *
 * ## What this file is really guarding
 *
 * A test double that is MORE LENIENT than the real `awcms` is green for code
 * that fails in production. That rule already governs
 * `tests/kontrak-awcms.test.mjs`, and it matters more here than anywhere,
 * because the endpoint under test **cannot currently be reached at all**:
 *
 *   1. `POST /api/v1/newsletter/subscribe` is not in `CONSUMER_PATHS` over
 *      there, so its shape is not frozen.
 *   2. `src/pages/api/v1/newsletter/subscribe.ts` exports **no `OPTIONS`**,
 *      while `src/pages/api/v1/analytics/collect.ts` does. Its contract
 *      requires `application/json`, which makes every cross-origin submission
 *      preflighted — and a preflight with no handler never reaches the endpoint.
 *
 * Both were read off `awcms`'s source, not inferred from a neighbour. The last
 * case in this file imitates (2), because a blocked preflight is exactly the
 * failure a naive double would render invisible.
 */
import { describe, expect, test } from "bun:test";

import {
  HEADER_LANGGANAN,
  JALUR_LANGGANAN,
  langgananKirim
} from "../src/lib/newsletter.ts";
import { newsletterAktif } from "../src/config/site.ts";

const ASAL = "https://awcms.uji";

/** A double that records what it was called with. */
function ambilTiruan(jawab) {
  const jejak = [];
  const fn = async (url, opsi) => {
    jejak.push({ url: String(url), opsi });
    return jawab(url, opsi);
  };
  fn.jejak = jejak;
  return fn;
}

describe("switched off, and it stays off until awcms moves", () => {
  test("`newsletterAktif` is false in this template", () => {
    // A form rendered against an endpoint that cannot answer is a promise to a
    // reader that nothing can keep.
    expect(newsletterAktif).toBe(false);
  });

  test("no origin means no request is attempted at all", async () => {
    const ambil = ambilTiruan(() => {
      throw new Error("tidak boleh dipanggil");
    });

    expect(await langgananKirim(undefined, "a@contoh.test", ambil)).toEqual({
      keadaan: "gagal"
    });
    expect(ambil.jejak).toHaveLength(0);
  });
});

describe("the request awcms actually declared", () => {
  test("POSTs JSON to the exact path, with the content type its contract requires", async () => {
    const ambil = ambilTiruan(() =>
      Response.json({ success: true, data: { message: "Periksa surel Anda." } })
    );

    await langgananKirim(ASAL, "a@contoh.test", ambil);

    const [panggilan] = ambil.jejak;
    expect(panggilan.url).toBe(`${ASAL}${JALUR_LANGGANAN}`);
    expect(panggilan.opsi.method).toBe("POST");
    // NOT copied from the search box, which carries no header at all. awcms's
    // `checkOrigin` refuses a form-like content type, and its OpenAPI declares
    // `application/json`.
    expect(panggilan.opsi.headers).toEqual(HEADER_LANGGANAN);
    expect(JSON.parse(panggilan.opsi.body)).toEqual({ email: "a@contoh.test" });
  });

  test("credentials are NEVER set, so no cookie travels back", async () => {
    // Same decision as the beacon (ADR-0044): a reader subscribing has not
    // agreed to be recognised on their next visit to an unrelated page.
    const ambil = ambilTiruan(() => Response.json({ success: true, data: {} }));
    await langgananKirim(ASAL, "a@contoh.test", ambil);

    expect(ambil.jejak[0].opsi.credentials).toBeUndefined();
  });
});

describe("the neutral answer, which a consumer must not undo", () => {
  test("the server's sentence is rendered verbatim", async () => {
    const ambil = ambilTiruan(() =>
      Response.json({ success: true, data: { message: "Periksa surel Anda." } })
    );

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "diterima",
      pesan: "Periksa surel Anda."
    });
  });

  test("a NEW address and an ALREADY-ACTIVE one are indistinguishable here", async () => {
    // The whole point of ADR-0103's decision, asserted from the consumer side:
    // awcms answers the same body for both, and this caller must produce the
    // same result for both. Any difference would rebuild the enumeration oracle
    // the endpoint refuses to be — from the one place nobody would look for it.
    const sama = { success: true, data: { message: "Periksa surel Anda." } };

    const baru = await langgananKirim(
      ASAL,
      "baru@contoh.test",
      ambilTiruan(() => Response.json(sama))
    );
    const sudahAda = await langgananKirim(
      ASAL,
      "sudah@contoh.test",
      ambilTiruan(() => Response.json(sama))
    );

    expect(baru).toEqual(sudahAda);
  });

  test("a response with no message still reads as accepted, and says nothing extra", async () => {
    const ambil = ambilTiruan(() => Response.json({ success: true, data: {} }));

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "diterima",
      pesan: ""
    });
  });
});

describe("refusals imitated from awcms's own contract", () => {
  test("400 is reported — it is a statement about the REQUEST, not an address", async () => {
    // awcms's OpenAPI says so in as many words: a malformed body answers 400
    // and that leaks nothing, so surfacing it costs the reader nothing either.
    const ambil = ambilTiruan(() =>
      Response.json({ success: false, error: { code: "VALIDATION_ERROR" } }, { status: 400 })
    );

    expect(await langgananKirim(ASAL, "bukan-surel", ambil)).toEqual({
      keadaan: "tak-valid"
    });
  });

  test("429 is its own outcome, not a generic failure", async () => {
    // The endpoint is per-IP rate-limited. Telling a reader "try again shortly"
    // is different from telling them something broke, and only one of those is
    // true.
    const ambil = ambilTiruan(() =>
      Response.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 })
    );

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "terlalu-sering"
    });
  });

  test("a 5xx is a failure, not a silent success", async () => {
    const ambil = ambilTiruan(() => new Response("boom", { status: 503 }));

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "gagal"
    });
  });

  test("a 200 with an unparseable body is a failure", async () => {
    // A proxy that rewrites the body, or an awcms older than this contract.
    // Reading it as success would tell a reader their address was recorded when
    // nothing can say that it was.
    const ambil = ambilTiruan(() => new Response("<html>", { status: 200 }));

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "gagal"
    });
  });

  test("A BLOCKED PREFLIGHT looks like a failure and must not look like anything else", async () => {
    // This is today's ACTUAL state of the endpoint, imitated.
    //
    // `subscribe.ts` exports no `OPTIONS`, and its contract requires
    // `application/json` — so the browser preflights, gets no answer, and the
    // `fetch` rejects before any response exists. A double that returned a
    // cheerful 200 here would make this file green for a form that can never
    // work.
    const ambil = ambilTiruan(() => {
      throw new TypeError("Failed to fetch");
    });

    expect(await langgananKirim(ASAL, "a@contoh.test", ambil)).toEqual({
      keadaan: "gagal"
    });
  });
});
