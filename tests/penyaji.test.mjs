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
import { test, describe, expect, afterEach } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  CACHE_ASET,
  CACHE_HALAMAN,
  CSP,
  HEADER_KEAMANAN,
  PERMISSIONS_POLICY,
  asalMediaTerkonfigurasi,
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
  test("lima header keamanan ada di setiap respons", async () => {
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

  test("CSP tidak melonggarkan dirinya sendiri", async () => {
    // Sebuah CSP yang ada tetapi memuat `'unsafe-inline'` pada script-src
    // adalah keadaan terburuk dari keduanya: header terlihat di `curl -I`,
    // laporan kepatuhan menyebutnya terpasang, dan justru serangan yang paling
    // ingin dicegahnya tetap lewat. Karena itu yang diuji bukan kehadirannya
    // (sudah dijamin tes di atas) melainkan isinya.
    const res = await lewatServer(handlerTiruan, "/");
    const kebijakan = res.headers.get("content-security-policy") ?? "";

    assert.equal(kebijakan, CSP);
    assert.match(kebijakan, /(^|;\s*)default-src 'self'(;|$)/);
    assert.match(kebijakan, /(^|;\s*)script-src 'self'(;|$)/);
    assert.match(kebijakan, /(^|;\s*)object-src 'none'(;|$)/);
    assert.match(kebijakan, /(^|;\s*)frame-ancestors 'none'(;|$)/);
    assert.doesNotMatch(kebijakan, /unsafe-inline|unsafe-eval/);

    // `base-uri 'self'` masih mengizinkan `<base href="/apa-pun/">` yang
    // menggeser resolusi SETIAP tautan relatif di halaman. Situs statis tidak
    // pernah memakai `<base>`, jadi `'none'` — dan ini juga nilai yang dipakai
    // `awcms`, sehingga kedua permukaan keluarga ini tidak berselisih.
    assert.match(kebijakan, /(^|;\s*)base-uri 'none'(;|$)/);
  });

  test("Permissions-Policy mematikan kemampuan yang tidak dipakai siapa pun", async () => {
    // Situs dari template ini tidak punya form, tidak mengumpulkan data pribadi
    // pembaca, dan tidak memuat skrip pihak ketiga. Menyatakannya membuat skrip
    // yang suatu saat lolos tetap tidak bisa meminta kamera atau lokasi.
    const res = await lewatServer(handlerTiruan, "/");
    const nilai = res.headers.get("permissions-policy") ?? "";

    assert.equal(nilai, PERMISSIONS_POLICY);
    for (const kemampuan of ["geolocation", "camera", "microphone", "payment"]) {
      assert.match(nilai, new RegExp(`${kemampuan}=\\(\\)`), kemampuan);
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
    assert.equal(beranda.headers.get("content-security-policy"), CSP);

    // `/tema.js` tinggal di `public/`, bukan di `/_astro/`, jadi ia sengaja
    // TIDAK immutable: namanya tidak ber-hash, dan cache setahun berarti
    // pengalih tema yang diperbaiki tidak pernah sampai ke pembaca lama.
    const tema = await fetch(`http://127.0.0.1:${port}/tema.js`);
    assert.equal(tema.status, 200);
    assert.equal(tema.headers.get("cache-control"), CACHE_HALAMAN);

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

// ---------------------------------------------------------------------------
// Asal media → `img-src`.
//
// Nilai ini datang dari build (`scripts/asal-media.mjs`, ADR-0025), bukan dari
// berkas ini, dan ia berakhir DI DALAM sebuah header. Satu nilai cacat yang
// lolos membuat browser menolak SELURUH kebijakan — bersama `script-src`,
// `object-src`, dan setiap direktif lain yang ada di dalamnya. Karena itu tiap
// bentuk masukan yang tidak sah diuji satu per satu, bukan diringkas.
// ---------------------------------------------------------------------------

describe("asal media dari build", () => {
  /** @type {string[]} */
  const sementara = [];

  afterEach(() => {
    while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
  });

  function berkas(isi) {
    const dir = mkdtempSync(join(tmpdir(), "asal-media-"));
    sementara.push(dir);
    const jalur = join(dir, "asal-media.json");
    writeFileSync(jalur, typeof isi === "string" ? isi : JSON.stringify(isi));
    return jalur;
  }

  test("origin yang sah dipakai", () => {
    assert.equal(
      asalMediaTerkonfigurasi(
        berkas({ configured: true, origin: "https://media.contoh.test", baseUrl: "https://media.contoh.test/news" })
      ),
      "https://media.contoh.test"
    );
  });

  test("berkas yang tidak ada BUKAN kesalahan", () => {
    // Build tanpa awcms tidak merujuk satu gambar media pun, dan `img-src
    // 'self'` justru kebijakan yang benar untuknya.
    assert.equal(asalMediaTerkonfigurasi(join(tmpdir(), "tidak-ada-sama-sekali.json")), undefined);
  });

  test("configured: false diperlakukan sebagai tidak ada", () => {
    assert.equal(
      asalMediaTerkonfigurasi(berkas({ configured: false, origin: null, baseUrl: null })),
      undefined
    );
  });

  test("JSON rusak tidak melempar dan tidak melebarkan apa pun", () => {
    assert.equal(asalMediaTerkonfigurasi(berkas("{ bukan json")), undefined);
  });

  test("skema selain http/https ditolak", () => {
    // `data:` di dalam `img-src` membuka kembali persis permukaan injeksi yang
    // kebijakan ketat ini ada untuk menutupnya.
    for (const origin of ["data:image/png;base64,AAAA", "file:///etc/passwd", "ftp://media.test"]) {
      assert.equal(asalMediaTerkonfigurasi(berkas({ configured: true, origin, baseUrl: origin })), undefined);
    }
  });

  test("nilai yang membawa direktif kedua dipangkas menjadi origin saja", () => {
    // Ini yang membuat `new URL(...).origin` dipakai alih-alih string aslinya:
    // tanpa itu, sebuah nilai berspasi menyelundupkan direktif ke dalam header.
    assert.equal(
      asalMediaTerkonfigurasi(
        berkas({
          configured: true,
          origin: "https://media.contoh.test/news; script-src *",
          baseUrl: "x"
        })
      ),
      "https://media.contoh.test"
    );
  });

  test("origin tanpa string ditolak", () => {
    assert.equal(asalMediaTerkonfigurasi(berkas({ configured: true, origin: null })), undefined);
    assert.equal(asalMediaTerkonfigurasi(berkas({ configured: true, origin: 42 })), undefined);
  });

  test("CSP repo template ini tetap `img-src 'self'`", () => {
    // Template ini tidak membawa `dist/server/asal-media.json`, jadi kebijakan
    // bawaannya harus tetap yang paling ketat. Gerbang ini yang menangkap
    // sebuah berkas yang tanpa sengaja ikut ter-commit.
    assert.match(CSP, /img-src 'self'(;|$)/);
  });
});
