/**
 * Gate over the post-deploy CDN purge (ADR-0054, issue #168).
 *
 * Every test talks to a local fake endpoint started with `Bun.serve`, or to an
 * injected `fetch`. The real Cloudflare API is never called.
 */
import { afterEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  badanPurge,
  bacaKonfigurasi,
  purgeCdn,
  urlPurge
} from "../server/purge-cdn.mjs";

const ZONA = "0123456789abcdef0123456789abcdef";
const TOKEN = "token-uji-rahasia-12345";
const ENV = {
  CLOUDFLARE_API_TOKEN: TOKEN,
  CLOUDFLARE_ZONE_ID: ZONA,
  CDN_PURGE_HOSTS: "contoh.example.com"
};

function pencatat() {
  const baris = [];
  const buat = (tingkat) => (...a) => baris.push(`${tingkat} ${a.join(" ")}`);
  return { info: buat("info"), warn: buat("warn"), error: buat("error"), baris };
}

const tanpaTidur = () => Promise.resolve();
const servers = [];

/** A fake endpoint answering with the given scripted responses, in order. */
function tiruan(jawaban) {
  const diterima = [];
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      diterima.push({
        method: req.method,
        path: new URL(req.url).pathname,
        auth: req.headers.get("authorization"),
        body: await req.json().catch(() => null)
      });
      const j = jawaban[Math.min(diterima.length - 1, jawaban.length - 1)];
      return new Response(JSON.stringify(j.json ?? { success: true, errors: [] }), {
        status: j.status ?? 200,
        headers: { "content-type": "application/json", ...(j.headers ?? {}) }
      });
    }
  });
  servers.push(server);
  return { base: `http://127.0.0.1:${server.port}/client/v4`, diterima };
}

afterEach(() => {
  while (servers.length) servers.pop().stop(true);
});

describe("konfigurasi", () => {
  test("lengkap: host dari CDN_PURGE_HOSTS, dinormalkan dan tanpa duplikat", () => {
    const k = bacaKonfigurasi({ ...ENV, CDN_PURGE_HOSTS: "A.example.com, a.example.com ,b.example.com" });
    assert.deepEqual(k.hosts, ["a.example.com", "b.example.com"]);
  });

  test("tanpa CDN_PURGE_HOSTS memakai host dari SITE_URL", () => {
    const { CDN_PURGE_HOSTS, ...sisa } = ENV;
    const k = bacaKonfigurasi({ ...sisa, SITE_URL: "https://www.contoh.example.com/path" });
    assert.deepEqual(k.hosts, ["www.contoh.example.com"]);
  });

  test("variabel yang hilang disebut namanya", () => {
    const k = bacaKonfigurasi({});
    assert.deepEqual(k.hilang, [
      "CLOUDFLARE_API_TOKEN",
      "CLOUDFLARE_ZONE_ID",
      "CDN_PURGE_HOSTS (or SITE_URL)"
    ]);
  });

  test("zona dan host yang tidak masuk akal ditolak", () => {
    assert.ok(bacaKonfigurasi({ ...ENV, CLOUDFLARE_ZONE_ID: "bukan-zona" }).salah);
    assert.ok(bacaKonfigurasi({ ...ENV, CDN_PURGE_HOSTS: "https://x.example.com/" }).salah);
    assert.ok(bacaKonfigurasi({ ...ENV, CDN_PURGE_HOSTS: "localhost" }).salah);
  });

  test("badan dan URL: per hostname, bukan seluruh zona", () => {
    assert.deepEqual(badanPurge(["a.example.com"]), { hosts: ["a.example.com"] });
    assert.ok(!("purge_everything" in badanPurge(["a.example.com"])));
    assert.equal(
      urlPurge("https://x.test/client/v4/", ZONA),
      `https://x.test/client/v4/zones/${ZONA}/purge_cache`
    );
  });
});

describe("purgeCdn terhadap endpoint tiruan", () => {
  test("berhasil: satu POST ber-token dengan badan hosts", async () => {
    const { base, diterima } = tiruan([{}]);
    const log = pencatat();
    const hasil = await purgeCdn({ env: ENV, base, log, tidur: tanpaTidur });

    assert.equal(hasil.status, "purged");
    assert.equal(diterima.length, 1);
    assert.equal(diterima[0].method, "POST");
    assert.equal(diterima[0].path, `/client/v4/zones/${ZONA}/purge_cache`);
    assert.equal(diterima[0].auth, `Bearer ${TOKEN}`);
    assert.deepEqual(diterima[0].body, { hosts: ["contoh.example.com"] });
  });

  test("--dry-run tidak mengirim apa pun dan tidak mencetak token", async () => {
    const { base, diterima } = tiruan([{}]);
    const log = pencatat();
    const hasil = await purgeCdn({ env: ENV, base, log, dryRun: true });

    assert.equal(hasil.status, "dry-run");
    assert.equal(diterima.length, 0);
    assert.ok(log.baris.some((b) => b.includes("contoh.example.com")));
    assert.ok(!log.baris.join("\n").includes(TOKEN));
  });

  test("kredensial hilang: peringatan, tidak ada permintaan, tidak gagal", async () => {
    const { base, diterima } = tiruan([{}]);
    const log = pencatat();
    const hasil = await purgeCdn({
      env: { CDN_PURGE_HOSTS: "contoh.example.com" },
      base,
      log
    });

    assert.equal(hasil.status, "skipped");
    assert.equal(diterima.length, 0);
    assert.ok(log.baris[0].startsWith("warn "));
    assert.match(log.baris[0], /CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID/);
    assert.match(log.baris[0], /s-maxage/);
  });

  test("429 menghormati Retry-After lalu berhasil", async () => {
    const { base, diterima } = tiruan([
      { status: 429, headers: { "retry-after": "2" }, json: { success: false, errors: [{ code: 971, message: "rate limited" }] } },
      {}
    ]);
    const tunggu = [];
    const hasil = await purgeCdn({
      env: ENV,
      base,
      log: pencatat(),
      tidur: async (ms) => tunggu.push(ms)
    });

    assert.equal(hasil.status, "purged");
    assert.equal(diterima.length, 2);
    assert.deepEqual(tunggu, [2000]);
  });

  test("Retry-After dibatasi supaya deploy tidak menggantung", async () => {
    const { base } = tiruan([
      { status: 429, headers: { "retry-after": "86400" }, json: { success: false } },
      {}
    ]);
    const tunggu = [];
    await purgeCdn({ env: ENV, base, log: pencatat(), tidur: async (ms) => tunggu.push(ms) });
    assert.ok(tunggu[0] <= 30_000);
  });

  test("5xx dicoba ulang paling banyak tiga kali, lalu gagal tanpa melempar", async () => {
    const { base, diterima } = tiruan([{ status: 503, json: { success: false } }]);
    const log = pencatat();
    const hasil = await purgeCdn({ env: ENV, base, log, tidur: tanpaTidur });

    assert.equal(hasil.status, "failed");
    assert.equal(diterima.length, 3);
    assert.ok(log.baris.at(-1).startsWith("error "));
  });

  test("4xx (token salah) berhenti segera dengan pesan CDN, tanpa mencetak token", async () => {
    const { base, diterima } = tiruan([
      { status: 403, json: { success: false, errors: [{ code: 10000, message: "Authentication error" }] } }
    ]);
    const log = pencatat();
    const hasil = await purgeCdn({ env: ENV, base, log, tidur: tanpaTidur });

    assert.equal(hasil.status, "failed");
    assert.equal(diterima.length, 1);
    assert.match(log.baris.join("\n"), /10000: Authentication error/);
    assert.ok(!log.baris.join("\n").includes(TOKEN));
  });

  test("galat jaringan dicoba ulang, dan pesan tidak memuat token", async () => {
    let n = 0;
    const fetchFn = async () => {
      n++;
      throw new Error(`gagal menyambung memakai ${TOKEN}`);
    };
    const log = pencatat();
    const hasil = await purgeCdn({ env: ENV, fetchFn, log, tidur: tanpaTidur });

    assert.equal(hasil.status, "failed");
    assert.equal(n, 3);
    assert.ok(!log.baris.join("\n").includes(TOKEN));
  });
});

describe("batas keamanan berkas", () => {
  const isi = readFileSync("server/purge-cdn.mjs", "utf8");

  test("tidak mengimpor apa pun dan tidak menyentuh awcms", () => {
    assert.doesNotMatch(isi, /^import\s/m);
    assert.doesNotMatch(isi, /AWCMS_/);
  });

  test("tidak pernah meminta purge seluruh zona", () => {
    assert.doesNotMatch(isi.replace(/\/\*[\s\S]*?\*\//g, ""), /purge_everything/);
  });
});
