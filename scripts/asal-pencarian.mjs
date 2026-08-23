#!/usr/bin/env bun
/**
 * Menuliskan asal `awcms` yang boleh dihubungi kotak pencarian, untuk penyaji.
 *
 * ## Kenapa berkas kedua di sebelah `asal-media.mjs`
 *
 * Bentuknya sama dan alasannya sama — sebuah nilai yang dibutuhkan HEADER, bukan
 * halaman, dan header dikirim `server/penyaji.mjs` di proses yang lain — tetapi
 * nilainya berbeda dan sumbernya berbeda. Origin media milik deployment `awcms`
 * dan ditanyakan kepadanya; origin API adalah `AWCMS_API_URL`, yang justru
 * dipegang build ini. Menyatukan keduanya ke satu berkas akan membuat satu
 * kegagalan (deployment tanpa media publik) memutuskan nasib yang lain
 * (`connect-src` kotak pencarian), dan keduanya tidak berhubungan.
 *
 * ## Kenapa tidak ditanyakan ke `awcms`
 *
 * Tidak ada yang perlu ditanyakan. Berbeda dari origin media — yang diturunkan
 * `awcms` dari konfigurasi R2-nya sendiri dan tidak bisa ditebak dari sini —
 * origin pencarian ADALAH alamat API yang build ini sudah panggil tujuh kali.
 * Sebuah permintaan hanya untuk mendapat kembali nilai yang sudah ada di tangan
 * adalah permintaan yang bisa gagal tanpa menambah kebenaran apa pun.
 *
 * ## Kenapa langkahnya tetap ada meski nilainya "sudah diketahui"
 *
 * Karena yang membacanya tidak bisa melihatnya. `penyaji.mjs` berjalan dari
 * `dist/`, kemungkinan di image yang sama sekali lain, tanpa `.env` build.
 * Membiarkannya membaca `process.env.AWCMS_API_URL` sendiri berarti dua sumber
 * untuk satu nilai — dan yang gagal saat keduanya menyimpang adalah `fetch` di
 * peramban pembaca, diblokir oleh kebijakan yang tampak baik-baik saja.
 *
 * `src/lib/pencarian.ts` yang memutuskan bentuk nilainya (origin saja, http(s)
 * saja), jadi yang ditulis ke sini sudah melewati pemeriksaan yang sama dengan
 * yang dipakai halaman — bukan pemeriksaan kedua yang bisa berbeda pendapat.
 */
import { mkdirSync, writeFileSync } from "node:fs";

import { asalPencarian } from "../src/lib/pencarian.ts";

const TUJUAN = "dist/server/asal-pencarian.json";

const origin = asalPencarian(process.env.AWCMS_API_URL);
const isi = origin ? { configured: true, origin } : { configured: false, origin: null };

mkdirSync("dist/server", { recursive: true });
writeFileSync(TUJUAN, `${JSON.stringify(isi, null, 2)}\n`);

console.log(
  isi.configured
    ? `asal pencarian: ${isi.origin} → ${TUJUAN}`
    : `asal pencarian: AWCMS_API_URL tidak terbaca sebagai origin http(s) — kotak pencarian tidak diterbitkan dan connect-src tidak dilebarkan`
);
