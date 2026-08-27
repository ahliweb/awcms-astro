/**
 * The newsletter caller — subscribe, confirm, unsubscribe.
 *
 * ## What this file is really guarding
 *
 * A test double that is MORE LENIENT than the real `awcms` is green for code
 * that fails in production. That rule already governs
 * `tests/kontrak-awcms.test.mjs`, and it mattered more here than anywhere while
 * the endpoint could not be reached at all — four measured things in `awcms`,
 * closed by its ADR-0118 on 28 August 2026:
 *
 *   1. no newsletter path in its `CONSUMER_PATHS`, so no frozen shape;
 *   2. no `OPTIONS` on any of the three routes, while the JSON contract makes
 *      every cross-origin submission preflighted — a preflight with no handler
 *      never reaches the endpoint;
 *   3. no `Access-Control-Allow-Origin`, so even an answered preflight left the
 *      browser discarding the response;
 *   4. the confirmation link built on the CMS's own origin, where no such page
 *      exists — so nobody could ever confirm, and no subscriber ever became
 *      active.
 *
 * All four were read off `awcms`'s source, not inferred from a neighbour. The
 * blocked-preflight case below is kept and still imitates (2): it is exactly
 * the failure a naive double renders invisible, and the one this caller must go
 * on treating as an ordinary failure rather than as something to explain to a
 * reader.
 */
import { describe, expect, test } from "bun:test";

import {
  HALAMAN_BERHENTI,
  HALAMAN_KONFIRMASI,
  HEADER_LANGGANAN,
  JALUR_BERHENTI,
  JALUR_KONFIRMASI,
  JALUR_LANGGANAN,
  PARAM_TOKEN,
  langgananKirim,
  tokenKirim
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

describe("off in the template, on only where a site declares it", () => {
  test("`newsletterAktif` is false in this template", () => {
    // The template declares no `SITE_NEWSLETTER`, so it publishes no form. A
    // site that wants one says so — and the flag also needs an origin to post
    // to, because a declaration with nothing behind it would publish three
    // surfaces that can do nothing.
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

describe("the two token endpoints, and the pages they are reached from", () => {
  test("the PAGE paths are awcms's, spelled exactly as it emails them", () => {
    // Not this repo's to choose: `awcms` builds the link from
    // `NEWSLETTER_CONFIRM_PATH` / `NEWSLETTER_UNSUBSCRIBE_PATH` joined onto the
    // site's origin. A rename here breaks a link that is already in somebody's
    // inbox and cannot be recalled — which is why the literals are asserted
    // rather than derived from anything.
    expect(HALAMAN_KONFIRMASI).toBe("/newsletter/confirm");
    expect(HALAMAN_BERHENTI).toBe("/newsletter/unsubscribe");
    expect(PARAM_TOKEN).toBe("token");
  });

  test("a page really exists at each of those paths", async () => {
    // The half a constant cannot prove. A correct literal beside a missing page
    // is a confirmation link that 404s, which is the defect `awcms` had on its
    // own side and the one this repo is now responsible for not repeating.
    for (const halaman of [HALAMAN_KONFIRMASI, HALAMAN_BERHENTI]) {
      const berkas = Bun.file(`src/pages${halaman}.astro`);
      expect(await berkas.exists()).toBe(true);
    }
  });

  test("each posts { token } as JSON to its own endpoint", async () => {
    for (const [jalur, nama] of [
      [JALUR_KONFIRMASI, "confirm"],
      [JALUR_BERHENTI, "unsubscribe"]
    ]) {
      const ambil = ambilTiruan(() => Response.json({ data: { message: "ok" } }));
      await tokenKirim(ASAL, jalur, "tok-123", ambil);

      expect(ambil.jejak).toHaveLength(1);
      expect(ambil.jejak[0].url).toBe(`${ASAL}${jalur}`);
      expect(ambil.jejak[0].url).toContain(nama);
      expect(ambil.jejak[0].opsi.method).toBe("POST");
      expect(ambil.jejak[0].opsi.headers).toEqual(HEADER_LANGGANAN);
      expect(JSON.parse(ambil.jejak[0].opsi.body)).toEqual({ token: "tok-123" });
      // Same decision as subscribe and the beacon: never set, so it stays
      // `same-origin` and no cookie awcms may set travels back.
      expect(ambil.jejak[0].opsi.credentials).toBeUndefined();
    }
  });

  test("the address is never in the request — the token is the whole credential", async () => {
    // `awcms` PRD §30: leaving must not require proving who you are. A consumer
    // that helpfully sent the address along would reintroduce exactly that.
    const ambil = ambilTiruan(() => Response.json({ data: { message: "ok" } }));
    await tokenKirim(ASAL, JALUR_BERHENTI, "tok-123", ambil);

    expect(Object.keys(JSON.parse(ambil.jejak[0].opsi.body))).toEqual(["token"]);
  });

  test("an empty token is refused here, without spending a limiter slot", async () => {
    // A link that lost its query string. No round trip can fix it, and the slot
    // it would spend is one the reader may need for the real link.
    const ambil = ambilTiruan(() => {
      throw new Error("tidak boleh dipanggil");
    });

    for (const kosong of ["", "   "]) {
      expect(await tokenKirim(ASAL, JALUR_KONFIRMASI, kosong, ambil)).toEqual({
        keadaan: "tak-valid"
      });
    }
    expect(ambil.jejak).toHaveLength(0);
  });

  test("a spent token and a valid one are indistinguishable", async () => {
    // ADR-0103's decision, and the one a consumer is most tempted to undo:
    // telling a reader "that link was already used" tells anyone holding a
    // guessed token that it was once real.
    const netral = { data: { message: "If that link was still valid, the subscription is now confirmed." } };

    const pertama = await tokenKirim(ASAL, JALUR_KONFIRMASI, "tok-a", ambilTiruan(() => Response.json(netral)));
    const kedua = await tokenKirim(ASAL, JALUR_KONFIRMASI, "tok-b", ambilTiruan(() => Response.json(netral)));

    expect(pertama).toEqual(kedua);
  });

  test("429 and 400 keep their own meaning here too", async () => {
    const terlalu = await tokenKirim(
      ASAL,
      JALUR_BERHENTI,
      "tok",
      ambilTiruan(() => new Response("", { status: 429 }))
    );
    expect(terlalu).toEqual({ keadaan: "terlalu-sering" });

    // 400 is a statement about the REQUEST — a mangled link — not about any
    // subscription, so surfacing it leaks nothing and is the one case worth
    // telling a reader apart.
    const takValid = await tokenKirim(
      ASAL,
      JALUR_KONFIRMASI,
      "tok",
      ambilTiruan(() => new Response("", { status: 400 }))
    );
    expect(takValid).toEqual({ keadaan: "tak-valid" });
  });

  test("a blocked preflight is an ordinary failure on these two as well", async () => {
    const ambil = ambilTiruan(() => {
      throw new TypeError("Failed to fetch");
    });

    expect(await tokenKirim(ASAL, JALUR_KONFIRMASI, "tok", ambil)).toEqual({
      keadaan: "gagal"
    });
  });
});

describe("the token page sends nothing until a human acts", () => {
  const VIEW = "src/components/views/HalamanTokenBuletin.astro";

  test("the token is posted on a CLICK, never on page load", async () => {
    // The defect this prevents is not hypothetical: link scanners in mail
    // clients and antivirus proxies fetch every URL in a message before its
    // recipient sees it. A page that posted its token on load would record an
    // unsubscribe nobody asked for — and, on the confirmation page, record
    // CONSENT no human ever gave. Consent recorded without a human act is not
    // consent.
    const sumber = await Bun.file(VIEW).text();

    expect(sumber).toContain("addEventListener('click'");
    expect(sumber).not.toContain("addEventListener('DOMContentLoaded'");
    expect(sumber).not.toContain("addEventListener('load'");
  });

  test("no HTML is assembled in JavaScript on that page", async () => {
    // Same rule as the search box: every word a reader sees comes from the PO
    // catalogue at build time, and there is no `innerHTML` path from a value
    // that arrived over the network.
    const sumber = await Bun.file(VIEW).text();

    expect(sumber).not.toContain("innerHTML");
    expect(sumber).toContain("textContent");
  });

  test("the subscribe form assembles no HTML either, and locks while sending", async () => {
    const sumber = await Bun.file("src/components/FormBuletin.astro").text();

    expect(sumber).not.toContain("innerHTML");
    // Without the lock, one double-click spends two of five per-IP limiter
    // slots and the second is refused with a sentence a reader cannot tell
    // apart from a failure.
    expect(sumber).toContain("tombol.disabled = true");
  });
});
