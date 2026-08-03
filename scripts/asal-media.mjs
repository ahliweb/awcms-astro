#!/usr/bin/env bun
/**
 * Menanyakan asal media ke `awcms` dan menuliskannya untuk penyaji.
 *
 * ## Kenapa langkah tersendiri, bukan bagian dari build Astro
 *
 * Yang membutuhkannya bukan halaman melainkan **header**: `img-src` harus
 * menyebut host media, dan header dikirim `server/penyaji.mjs` saat runtime —
 * sesudah build selesai, di proses yang sama sekali lain. Astro tidak punya
 * tempat untuk menaruh nilai itu; berkas ini yang menjadi jembatannya.
 *
 * Ia berjalan SESUDAH `astro build` dan menulis ke `dist/server/`, tempat
 * penyaji sudah tinggal. Image produksi menyalin direktori itu apa adanya, jadi
 * tidak ada langkah tambahan di `Dockerfile`.
 *
 * ## Kenapa ditanyakan, bukan ditulis tangan
 *
 * ADR-0019 §Menyesuaikan menyuruh melebarkan `img-src` di `penyaji.mjs`, dan
 * itu tetap benar untuk origin yang dipilih SITUS. Origin media bukan pilihan
 * situs — ia milik deployment `awcms`, diturunkan dari
 * `NEWS_MEDIA_R2_PUBLIC_BASE_URL` di sana. Menyalinnya ke sini dengan tangan
 * adalah dua salinan satu nilai yang sepakat sampai salah satunya disunting,
 * dan kegagalannya tidak menyebut sebabnya: gambar diblokir diam-diam oleh
 * kebijakan yang tampak baik-baik saja. `awcms` membuka
 * `GET /api/v1/media/public-origin` justru untuk menutup itu.
 *
 * ## Yang TIDAK dilakukannya
 *
 * Ia tidak merangkai kebijakan. `penyaji.mjs` tetap satu-satunya tempat CSP
 * disusun — berkas ini hanya menaruh satu nilai data yang dibacanya. Dua sumber
 * kebijakan yang saling menimpa adalah cara paling sunyi untuk berakhir tanpa
 * kebijakan sama sekali, dan itu tetap aturan ADR-0019.
 *
 * ## Kegagalan
 *
 * Permintaan yang gagal MENGGAGALKAN langkah ini, dan itu disengaja: build yang
 * melanjutkan tanpa origin menerbitkan situs yang setiap gambar artikelnya
 * diblokir browser, tanpa satu pun kesalahan di mana pun. Deployment yang
 * memang tidak menyajikan media publik dijawab `configured: false` — itu
 * keadaan yang sah, dan berkasnya ditulis tanpa origin.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { asalMediaPublik } from "../src/lib/awcms/media.ts";

const TUJUAN = "dist/server/asal-media.json";

const asal = await asalMediaPublik();

mkdirSync("dist/server", { recursive: true });
writeFileSync(TUJUAN, `${JSON.stringify(asal, null, 2)}\n`);

console.log(
  asal.configured
    ? `asal media: ${asal.origin} → ${TUJUAN}`
    : `asal media: deployment ini tidak menyajikan media publik (configured: false) — img-src tidak dilebarkan`
);
