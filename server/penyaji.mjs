#!/usr/bin/env bun
/**
 * Penyaji produksi: proses Bun yang menyajikan keluaran build, di belakang
 * Traefik/Coolify (ADR-0016).
 *
 * ## Kenapa berkas ini ada, dan kenapa isinya sesedikit ini
 *
 * ADR-0016 melepas nginx dari stack dan menyerahkan penyajian ke Bun. Yang
 * TIDAK ikut berpindah adalah cara berkas dicari: penerjemahan URL menjadi
 * path berkas tetap dikerjakan adapter `@astrojs/node` (lewat `send`), bukan
 * oleh kode di sini. Alasannya keamanan, bukan kenyamanan — setiap baris yang
 * memetakan URL ke berkas adalah baris yang bisa keliru menjadi pembacaan
 * berkas arbitrer: `..`, path ter-encode ganda, dan symlink adalah kelas cacat
 * yang sudah selesai bertahun-tahun lalu di pustaka yang dipakai adapter.
 *
 * Yang dikerjakan berkas ini hanya tiga hal yang tidak dikerjakan adapter:
 *
 *   1. lima header keamanan — tiga yang dulu ada di
 *      `ops/nginx-header-keamanan.conf`, ditambah Content-Security-Policy dan
 *      Permissions-Policy (ADR-0019). Kelimanya bernilai sama dengan `awcms`;
 *      JUMLAHNYA tidak — `awcms` mengirim `Strict-Transport-Security` di
 *      produksi dan berkas ini tidak mengirimkannya di lingkungan mana pun.
 *      Itu celah yang diketahui, bernomor 1 di
 *      `docs/awcms-astro/standar-performa-dan-keamanan.md`, dan menutupnya
 *      butuh ADR karena ia mengubah postur keamanan. Jangan menambahkannya
 *      tanpa gerbang yang membuktikan ia TIDAK dikirim di luar produksi: HSTS
 *      di localhost mengunci `bun run serve` di browser pengembang selama
 *      setahun, dan tidak ada cara membatalkannya dari sisi situs;
 *   2. `Cache-Control` yang eksplisit untuk HTML dan untuk aset ber-hash;
 *   3. kompresi respons, yang dulu dilakukan `gzip on` di nginx.
 *
 * ## Kenapa `Cache-Control` aset ditulis ulang di sini padahal adapter punya
 *
 * Adapter memasang `immutable` untuk `/_astro/` dari event `stream` milik
 * `send` — dan event itu **tidak pernah terjadi pada permintaan HEAD**, karena
 * `send` menjawab HEAD sebelum membuka berkasnya. Akibatnya `curl -I` (HEAD)
 * melaporkan `public, max-age=0` sementara GET yang sama melaporkan
 * `immutable`. Itu bukan sekadar aneh: perintah verifikasi setelah deploy di
 * `docs/deploy-coolify.md` memakai `curl -sI`, jadi header yang benar akan
 * terbaca salah oleh orang yang memeriksanya. Menetapkannya lebih dulu di sini
 * membuat GET dan HEAD menjawab hal yang sama; nilai yang dipasang adapter
 * kemudian identik, jadi keduanya tidak bisa berselisih.
 *
 * ## Kenapa HTML tidak boleh di-cache lama
 *
 * Seluruh premis rebuild lewat webhook adalah konten baru tayang cepat. Cache
 * HTML satu jam membatalkannya tanpa ada yang menyadarinya — situs terlihat
 * "belum ter-rebuild" padahal rebuild-nya sukses. Sebaliknya aset `/_astro/`
 * ber-hash pada namanya, jadi ia aman di-cache selamanya dan itulah
 * satu-satunya cara rebuild tidak memaksa pembaca mengunduh ulang seluruh CSS.
 */
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { posix } from "node:path";

import compression from "compression";

/** Prefiks aset ber-hash Astro (`build.assets`, baku `_astro`). */
const PREFIKS_ASET = "/_astro/";

export const CACHE_ASET = "public, max-age=31536000, immutable";
export const CACHE_HALAMAN = "public, max-age=0, must-revalidate";

/**
 * Content-Security-Policy situs publik.
 *
 * ## Kenapa ia baru bisa ada sekarang
 *
 * Kebijakan ini bukan setelan yang bisa dipasang lebih awal: `script-src
 * 'self'` memblokir setiap `<script>` inline, dan sampai keluaran build masih
 * membawa pengalih tema serta skrip tombol salin di dalam HTML-nya, memasang
 * header ini berarti mematikan keduanya. Yang membuka jalannya ada dua:
 * `public/tema.js` menjadi berkas tersendiri, dan
 * `vite.build.assetsInlineLimit: 0` menghentikan Astro menyisipkan bundel kecil
 * ke dalam halaman. `tests/keluaran-csp.test.mjs` menjaga keduanya tetap
 * begitu — tanpa gerbang itu, kebijakan di sini akan merusak halaman pada
 * perubahan komponen yang tampak tidak berbahaya.
 *
 * ## Yang TIDAK diblokirnya, supaya tidak dikira lebih dari yang ia lakukan
 *
 * JSON-LD (`<script type="application/ld+json">`) tetap inline di setiap
 * halaman dan itu bukan celah: tipe yang bukan MIME JavaScript membuat browser
 * berhenti sebelum langkah mana pun yang mengeksekusi, sehingga blok itu adalah
 * data, bukan skrip. Isinya tetap dirangkai `JSON.stringify` dari nilai yang
 * sudah tertutup kontrak — CSP bukan yang menjaganya.
 *
 * ## Menyesuaikannya di sebuah situs
 *
 * `img-src` sudah dilonggarkan untuk **satu** hal, dan hanya lewat satu jalur:
 * origin media `awcms`, yang `scripts/asal-media.mjs` tanyakan ke
 * `GET /api/v1/media/public-origin` saat build lalu tulis ke
 * `dist/server/asal-media.json` (ADR-0025). Nilai itu milik deployment `awcms`,
 * bukan pilihan situs ini — menuliskannya dengan tangan di sini berarti dua
 * salinan satu nilai yang sepakat sampai salah satunya disunting, dan
 * kegagalannya tidak menyebut sebabnya di mana pun: gambar diblokir diam-diam
 * oleh kebijakan yang tampak baik-baik saja.
 *
 * Origin LAIN — CDN, host gambar pihak ketiga — tetap ditambahkan di berkas
 * ini dengan tangan, lalu `tests/penyaji.test.mjs` diperbarui. Yang tidak boleh
 * berubah: kebijakan tetap dirangkai **di sini saja**. Berkas JSON itu data,
 * bukan kebijakan kedua. Dua sumber kebijakan yang saling menimpa adalah cara
 * paling sunyi untuk berakhir tanpa kebijakan sama sekali.
 *
 * `frame-ancestors 'none'` sengaja tumpang tindih dengan `X-Frame-Options`:
 * yang pertama yang dipatuhi browser modern, yang kedua masih dibaca perantara
 * lama. `upgrade-insecure-requests` TIDAK dipasang — TLS diterminasi Traefik,
 * dan direktif itu hanya akan menyulitkan `bun run serve` di localhost tanpa
 * menambah apa pun di produksi.
 */
/**
 * Origin media yang ditulis build, atau `undefined`.
 *
 * Dibaca dari letak berkas ini sendiri, bukan dari cwd: penyaji dijalankan
 * `bun dist/server/penyaji.mjs` dari akar repo di pengembangan dan dari `/app`
 * di dalam image, dan jalur relatif-cwd akan benar di satu tempat saja.
 *
 * Berkas yang tidak ada bukan kesalahan — build tanpa `awcms` (atau deployment
 * yang memang tidak menyajikan media publik) menghasilkan situs yang tidak
 * merujuk satu gambar media pun, dan `img-src 'self'` justru kebijakan yang
 * benar untuknya. Yang TIDAK boleh terjadi adalah nilai rusak yang lolos:
 * apa pun selain origin http(s) yang bisa di-parse diperlakukan sebagai tidak
 * ada, karena satu nilai cacat di dalam header membuat browser menolak SELURUH
 * kebijakan — bersama setiap direktif lain di dalamnya.
 */
export function asalMediaTerkonfigurasi(
  berkas = new URL("./asal-media.json", import.meta.url).pathname
) {
  if (!existsSync(berkas)) return undefined;

  let isi;
  try {
    isi = JSON.parse(readFileSync(berkas, "utf8"));
  } catch {
    return undefined;
  }

  if (isi?.configured !== true || typeof isi.origin !== "string") return undefined;

  let parsed;
  try {
    parsed = new URL(isi.origin);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;

  // `origin` dari URL yang di-parse, bukan string aslinya: itu yang membuang
  // path, query, dan spasi yang bisa menyelundupkan direktif kedua ke header.
  return parsed.origin;
}

const ASAL_MEDIA = asalMediaTerkonfigurasi();

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  ASAL_MEDIA ? `img-src 'self' ${ASAL_MEDIA}` : "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  // `'none'`, bukan `'self'`: situs statis tidak pernah memakai `<base>`, dan
  // `'self'` masih mengizinkan sebuah `<base href>` yang disuntikkan menggeser
  // resolusi SETIAP tautan relatif di halaman. Nilai ini menyamai postur
  // `awcms` (`BASE_CSP_DIRECTIVES` di `src/lib/security/security-headers.ts`).
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ");

/**
 * Kemampuan browser yang dimatikan untuk seluruh permukaan ini.
 *
 * Disamakan dengan header yang sudah dikirim `awcms`. Situs dari template ini
 * tidak punya form, tidak mengumpulkan data pribadi pembaca, dan tidak memuat
 * satu pun skrip pihak ketiga — jadi keempat kemampuan di bawah tidak dipakai
 * siapa pun, dan menyatakannya membuat sebuah skrip yang suatu saat lolos tidak
 * bisa meminta kamera atau lokasi pembaca hanya karena ia berhasil berjalan.
 */
export const PERMISSIONS_POLICY =
  "geolocation=(), camera=(), microphone=(), payment=()";

/**
 * Header yang dulu tinggal di `ops/nginx-header-keamanan.conf`, ditambah CSP dan
 * Permissions-Policy.
 *
 * Di nginx ketiganya harus di-`include` ulang di setiap `location`, karena
 * `add_header` dibuang seluruhnya begitu sebuah `location` punya `add_header`
 * sendiri. Di sini jebakan itu tidak ada: header dipasang sekali, sebelum
 * handler apa pun menyentuh respons.
 */
export const HEADER_KEAMANAN = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": CSP,
  "Permissions-Policy": PERMISSIONS_POLICY
};

/**
 * Path permintaan, dinormalkan persis seperti adapter menormalkannya sebelum
 * menyerahkannya ke `send`.
 *
 * Ini bukan kerapian: tanpa normalisasi, `/_astro/../index.html` terbaca
 * sebagai aset dan halaman depan akan dikirim dengan `immutable` — satu tahun
 * di cache pembaca dan di cache perantara, untuk berkas yang berubah setiap
 * rebuild. Yang menyajikan berkasnya tetap adapter; yang disamakan di sini
 * hanya penilaian "ini aset atau bukan".
 *
 * @param {string} url `req.url` apa adanya.
 * @returns {string}
 */
export function jalurNormal(url) {
  const tanpaFragmen = url.includes("#") ? url.slice(0, url.indexOf("#")) : url;
  const [path] = tanpaFragmen.split("?");

  let dekode = path;
  try {
    dekode = decodeURI(path);
  } catch {
    // URL yang tidak bisa di-decode dijawab 400 oleh adapter; di sini cukup
    // diperlakukan sebagai bukan-aset.
  }

  return posix.normalize(dekode.startsWith("/") ? dekode : `/${dekode}`);
}

/** @param {string} url @returns {string} */
export function aturanCache(url) {
  return jalurNormal(url).startsWith(PREFIKS_ASET) ? CACHE_ASET : CACHE_HALAMAN;
}

/**
 * Memasang header pada respons SEBELUM handler menyentuhnya.
 *
 * Urutannya penting dan mudah terbalik: `send` hanya memasang
 * `Cache-Control`-nya sendiri bila belum ada, jadi nilai yang ditetapkan di
 * sini menang. Jalur SSR (404) memakai `res.writeHead(status, headers)`, yang
 * menggabungkan — bukan membuang — header yang sudah dipasang `setHeader`.
 *
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 */
export function pasangHeader(req, res) {
  for (const [nama, nilai] of Object.entries(HEADER_KEAMANAN)) {
    res.setHeader(nama, nilai);
  }
  res.setHeader("Cache-Control", aturanCache(req.url ?? "/"));
}

/**
 * Server HTTP yang membungkus sebuah handler.
 *
 * `handler` diinjeksikan agar perilaku header dan kompresi di berkas ini bisa
 * diuji tanpa `dist/` — repo template ini tidak punya sumber konten, jadi
 * `bun test` di CI-nya berjalan tanpa hasil build. Lihat `tests/penyaji.test.mjs`.
 *
 * @param {(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => unknown} handlerAplikasi
 */
export function buatServer(handlerAplikasi) {
  // Kompresi dulu dikerjakan `gzip on` di nginx. Ia dipakai dari pustaka yang
  // sudah matang, bukan ditulis ulang: negosiasi `Accept-Encoding`, pembuangan
  // `Content-Length`, dan `Vary` adalah tiga tempat yang salahnya menghasilkan
  // respons rusak, bukan respons besar.
  const kompresi = compression();

  return http.createServer((req, res) => {
    pasangHeader(req, res);
    kompresi(req, res, () => handlerAplikasi(req, res));
  });
}

/**
 * `HOST` baku `0.0.0.0` karena tempat berkas ini dijalankan adalah container di
 * belakang Traefik: proses yang hanya mendengarkan `localhost` di dalam
 * container tidak bisa dihubungi siapa pun, dan kegagalannya terbaca sebagai
 * healthcheck yang gagal tanpa sebab. Port 8080 dipertahankan dari image nginx
 * sebelumnya supaya konfigurasi Coolify yang sudah ada tidak perlu berubah.
 */
export async function jalankan() {
  /**
   * Autostart adapter dimatikan SEBELUM entry-nya dievaluasi.
   *
   * `dist/server/entry.mjs` menyalakan servernya sendiri saat diimpor kecuali
   * variabel ini terisi. Server itu menyajikan berkas yang sama tetapi tanpa
   * satu pun header di berkas ini — dan karena ia memakai `PORT` yang sama,
   * keadaan itu tidak menyamar sebagai sukses: `listen` di bawah gagal
   * EADDRINUSE.
   *
   * Impornya sengaja di dalam fungsi, bukan di puncak berkas: `dist/` adalah
   * hasil build, dan repo template ini tidak punya sumber konten sehingga
   * `bun test` di CI-nya berjalan tanpa hasil build sama sekali. Impor puncak
   * akan membuat seluruh berkas ini — termasuk aturan header yang justru
   * paling perlu diuji — tidak bisa diimpor tes mana pun.
   */
  process.env.ASTRO_NODE_AUTOSTART = "disabled";
  const { handler } = await import("../dist/server/entry.mjs");

  const port = Number(process.env.PORT ?? 8080);
  const host = process.env.HOST ?? "0.0.0.0";
  const server = buatServer(handler);

  server.listen(port, host, () => {
    console.log(`awcms-astro disajikan Bun di http://${host}:${port}`);
  });

  // Container dihentikan dengan SIGTERM. Tanpa penanganan ini prosesnya
  // dibunuh paksa setelah tenggang Docker habis, dan setiap deploy membayar
  // jeda itu.
  for (const sinyal of ["SIGTERM", "SIGINT"]) {
    process.on(sinyal, () => {
      server.close(() => process.exit(0));
    });
  }

  return server;
}

if (import.meta.main) jalankan();
