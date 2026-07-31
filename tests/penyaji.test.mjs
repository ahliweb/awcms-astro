/**
 * Gerbang penyajian: aturan yang berpindah dari nginx ke proses Bun (ADR-0016).
 *
 * ADR-0016 menuntut pembuktian, bukan pemindahan saja — dan alasannya ada pada
 * sifat aturan-aturan itu: **semuanya berperilaku benar secara diam-diam
 * ketika hilang.** Situs tanpa `Cache-Control` tetap tayang. Situs tanpa
 * `X-Frame-Options` tetap tayang. Situs yang mengirim HTML dengan cache satu
 * tahun juga tetap tayang — sampai sebuah rebuild yang sukses tidak pernah
 * terlihat oleh pembaca yang sudah pernah membuka halamannya. Tidak satu pun
 * dari keadaan itu menggagalkan build.
 *
 * ## Dua lapis, dan kenapa dipisah begitu
 *
 * 1. **Tanpa `dist/`** — memakai handler tiruan lewat `buatServer()`. Ini yang
 *    menguji aturan milik repo ini sendiri (header keamanan, dua aturan cache,
 *    kompresi), dan ia berjalan di CI repo template yang TIDAK punya sumber
 *    konten sehingga tidak pernah punya hasil build.
 * 2. **Dengan `dist/`** — menjalankan artefak produksi sungguhan
 *    (`dist/server/penyaji.mjs`) dan memeriksa perilaku yang datang dari
 *    adapter: berkas ditemukan, `index.html` direktori, halaman 404, dan
 *    penolakan berkas ber-titik.
 *
 * Lapis kedua DILEWATI bila belum ada hasil build, dan ia mengatakannya —
 * gerbang yang diam saat tidak berjalan adalah gerbang yang tidak ada.
 */
import { test, describe, expect } from "bun:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import {
  CACHE_ASET,
  CACHE_HALAMAN,
  HEADER_KEAMANAN,
  aturanCache,
  buatServer,
  jalurNormal
} from "../server/penyaji.mjs";

/** Menyalakan `buatServer` pada port ephemeral, memanggilnya, lalu menutupnya. */
async function lewatServer(handler, jalur, init = {}) {
  const server = buatServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await fetch(`http://127.0.0.1:${port}${jalur}`, init);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

/** Handler tiruan: satu respons HTML yang cukup besar untuk melewati ambang kompresi. */
const HTML_PANJANG = `<!doctype html><title>uji</title>${"<p>isi</p>".repeat(400)}`;

function handlerTiruan(_req, res) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(HTML_PANJANG);
}

describe("penilaian jalur", () => {
  test("path dinormalkan sebelum dinilai aset atau bukan", () => {
    assert.equal(jalurNormal("/panduan/"), "/panduan/");
    assert.equal(jalurNormal("/panduan/?utm=1"), "/panduan/");
    assert.equal(jalurNormal("/panduan/#bagian"), "/panduan/");
    assert.equal(jalurNormal("/_astro/x.css"), "/_astro/x.css");
  });

  test("aset ber-hash boleh di-cache selamanya", () => {
    assert.equal(aturanCache("/_astro/BaseLayout.abc123.css"), CACHE_ASET);
    assert.equal(aturanCache("/_astro/page.abc123.js?v=1"), CACHE_ASET);
  });

  test("HTML tidak pernah di-cache lama", () => {
    // Ini butir yang paling mahal bila hilang: rebuild lewat webhook yang
    // sukses akan tetap terlihat "belum jalan" bagi pembaca yang sudah pernah
    // membuka halamannya, dan tidak ada yang gagal di mana pun.
    for (const jalur of ["/", "/panduan/", "/en/", "/sitemap-index.xml", "/robots.txt"]) {
      assert.equal(aturanCache(jalur), CACHE_HALAMAN, jalur);
    }
  });

  test("path yang keluar dari /_astro/ TIDAK dianggap aset", () => {
    // `send` menormalkan path sebelum menyajikannya, jadi ketiga permintaan di
    // bawah mengirim `index.html`. Menilai "ini aset" dari prefiks mentah akan
    // menempelkan `immutable` pada halaman depan — satu tahun di cache pembaca
    // dan di cache perantara, untuk berkas yang berubah setiap rebuild.
    assert.equal(aturanCache("/_astro/../index.html"), CACHE_HALAMAN);
    assert.equal(aturanCache("/_astro/%2e%2e/index.html"), CACHE_HALAMAN);
    assert.equal(aturanCache("/_astro/../../etc/passwd"), CACHE_HALAMAN);
  });

  test("URL yang tidak bisa di-decode tidak melempar", () => {
    // Adapter menjawabnya 400; yang penting di sini hanya bahwa penilaian
    // header tidak merobohkan proses sebelum permintaan itu sampai ke sana.
    assert.equal(aturanCache("/%E0%A4%A"), CACHE_HALAMAN);
  });
});

describe("header pada respons sungguhan", () => {
  test("tiga header keamanan ada di setiap respons", async () => {
    // Di nginx ketiganya harus di-include ulang di setiap `location`, dan
    // melupakannya menghasilkan halaman tanpa satu pun header — tanpa
    // peringatan. Di sini mereka dipasang sekali, dan tes ini yang memastikan
    // "sekali" itu benar-benar berlaku untuk semuanya.
    for (const jalur of ["/", "/_astro/x.css", "/tidak-ada/"]) {
      const res = await lewatServer(handlerTiruan, jalur);
      for (const [nama, nilai] of Object.entries(HEADER_KEAMANAN)) {
        assert.equal(res.headers.get(nama.toLowerCase()), nilai, `${jalur} ${nama}`);
      }
    }
  });

  test("HTML must-revalidate, aset immutable", async () => {
    const halaman = await lewatServer(handlerTiruan, "/panduan/");
    assert.equal(halaman.headers.get("cache-control"), CACHE_HALAMAN);

    const aset = await lewatServer(handlerTiruan, "/_astro/BaseLayout.abc123.css");
    assert.equal(aset.headers.get("cache-control"), CACHE_ASET);
  });

  test("header sama pada GET dan HEAD", async () => {
    // Adapter memasang `immutable` dari event `stream` milik `send`, dan event
    // itu tidak pernah terjadi pada HEAD. Perintah verifikasi setelah deploy di
    // docs/deploy-coolify.md memakai `curl -sI` — yaitu HEAD — jadi selisih ini
    // akan membuat header yang benar terbaca salah oleh orang yang memeriksanya.
    const jalur = "/_astro/BaseLayout.abc123.css";
    const get = await lewatServer(handlerTiruan, jalur);
    const head = await lewatServer(handlerTiruan, jalur, { method: "HEAD" });
    assert.equal(head.headers.get("cache-control"), get.headers.get("cache-control"));
  });

  test("respons teks dikompresi saat klien menerimanya", async () => {
    // `gzip on` milik nginx ikut hilang bersama nginx. Tanpa penggantinya
    // setiap halaman dikirim utuh dan tidak ada yang gagal — hanya lebih besar.
    const res = await lewatServer(handlerTiruan, "/panduan/", {
      headers: { "Accept-Encoding": "gzip" }
    });
    assert.equal(res.headers.get("content-encoding"), "gzip");
    assert.match(res.headers.get("vary") ?? "", /accept-encoding/i);
    // Isinya harus tetap utuh setelah didekompresi transport.
    assert.equal(await res.text(), HTML_PANJANG);
  });

  test("klien yang tidak menerima kompresi tetap dilayani", async () => {
    const res = await lewatServer(handlerTiruan, "/panduan/", {
      headers: { "Accept-Encoding": "identity" }
    });
    assert.equal(res.headers.get("content-encoding"), null);
    assert.equal(await res.text(), HTML_PANJANG);
  });
});

// ---------------------------------------------------------------------------
// Lapis kedua: artefak produksi sungguhan. Butuh `bun run build` lebih dulu.
// ---------------------------------------------------------------------------
const ARTEFAK = "dist/server/penyaji.mjs";
const adaArtefak = existsSync(ARTEFAK);

if (!adaArtefak) {
  console.log(
    `[penyaji] Uji integrasi DILEWATI: ${ARTEFAK} belum ada.\n` +
      "          Ia lahir dari `bun run build`, yang butuh sumber konten awcms.\n" +
      "          Di repo template ini itu normal; di sebuah SITUS, jalankan\n" +
      "          `bun test` lagi setelah build agar lapis ini benar-benar jalan."
  );
}

describe.skipIf(!adaArtefak)("artefak produksi menyajikan hasil build", () => {
  /** @type {{ proc: import("bun").Subprocess, port: number }} */
  let jalan;

  async function nyalakan() {
    // Port 0 tidak bisa dipakai: prosesnya yang memilih port, dan tes perlu
    // tahu nomornya. Port tinggi tetap yang jarang bertabrakan sudah cukup.
    const port = 43917;
    const proc = Bun.spawn(["bun", ARTEFAK], {
      env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
      stdout: "pipe",
      stderr: "pipe"
    });

    for (let i = 0; i < 100; i += 1) {
      try {
        await fetch(`http://127.0.0.1:${port}/`);
        return { proc, port };
      } catch {
        await Bun.sleep(50);
      }
    }

    proc.kill();
    throw new Error("penyaji tidak pernah menjawab dalam 5 detik");
  }

  test("aturan cache dan header berlaku pada berkas sungguhan", async () => {
    jalan ??= await nyalakan();
    const { port } = jalan;

    const beranda = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(beranda.status, 200);
    assert.equal(beranda.headers.get("cache-control"), CACHE_HALAMAN);
    assert.equal(beranda.headers.get("x-frame-options"), "DENY");

    // `build.format: 'directory'` — `/panduan/` adalah `/panduan/index.html`.
    // Tanpa penyelesaian ini SETIAP halaman 404, jadi ia diuji terpisah dari
    // beranda: beranda bisa saja bekerja lewat `index` bawaan.
    const seksi = await fetch(`http://127.0.0.1:${port}/panduan/`);
    assert.equal(seksi.status, 200);
    expect(await seksi.text()).toContain("</html>");

    const daftarAset = [...new Bun.Glob("*.css").scanSync("dist/client/_astro")];
    assert.ok(daftarAset.length > 0, "build tidak menghasilkan satu pun aset CSS");
    const aset = await fetch(`http://127.0.0.1:${port}/_astro/${daftarAset[0]}`);
    assert.equal(aset.status, 200);
    assert.equal(aset.headers.get("cache-control"), CACHE_ASET);
  });

  test("halaman 404, berkas ber-titik, dan traversal", async () => {
    jalan ??= await nyalakan();
    const { port } = jalan;

    const hilang = await fetch(`http://127.0.0.1:${port}/tidak-ada-sama-sekali/`);
    assert.equal(hilang.status, 404);
    // Bukan 404 kosong: halaman 404 hasil build yang dikirim.
    expect(await hilang.text()).toContain("</html>");

    for (const jalur of ["/.env", "/.git/config"]) {
      const res = await fetch(`http://127.0.0.1:${port}${jalur}`);
      assert.equal(res.status, 404, jalur);
    }

    // Keluar dari root tidak boleh menyajikan apa pun dari mesin.
    const keluar = await fetch(`http://127.0.0.1:${port}/_astro/../../package.json`);
    assert.ok(keluar.status === 404 || keluar.status === 403, `status ${keluar.status}`);
  });

  test("proses berhenti pada SIGTERM", async () => {
    // Container dihentikan dengan SIGTERM. Proses yang mengabaikannya membuat
    // setiap deploy membayar tenggang paksa Docker.
    jalan ??= await nyalakan();
    jalan.proc.kill("SIGTERM");
    const kode = await Promise.race([
      jalan.proc.exited,
      Bun.sleep(5000).then(() => "tidak berhenti")
    ]);
    jalan = undefined;
    assert.notEqual(kode, "tidak berhenti");
  });
});
