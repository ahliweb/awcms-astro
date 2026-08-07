/**
 * Pemformatan tanggal yang dibaca manusia, di satu tempat.
 *
 * Ia diangkat ke sini saat seksi berita mendarat (ADR-0033), bukan karena
 * duplikasinya panjang — `toLocaleDateString` dengan tiga opsi hanya tiga baris
 * — melainkan karena tempat KEDUA yang memformat tanggal adalah tempat pertama
 * yang bisa menyimpang tanpa ada yang melihatnya. Halaman artikel sudah
 * memformat tanggal sejak lama; kartu di indeks seksi berita sekarang ikut.
 * Dua salinan yang sepakat hari ini akan berbeda pada hari seseorang menambah
 * nama hari di salah satunya, dan tidak ada gerbang yang membandingkan dua
 * halaman yang berbeda.
 *
 * Yang TIDAK dilakukan di sini: memilih zona waktu. `toLocaleDateString`
 * memakai zona mesin yang membangun, dan itu memang yang diinginkan — keluaran
 * statis dibangun sekali oleh satu mesin, jadi tanggalnya konsisten di seluruh
 * situs. Memaksanya ke UTC akan menggeser tanggal terbit sore hari di WIB ke
 * hari sebelumnya bagi setiap pembaca.
 */
import { localeHtmlLang, type Locale } from "../config/site";

const OPSI: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric"
};

/** Tanggal dalam bahasa pembaca, mis. "7 Agustus 2026" / "7 August 2026". */
export function tanggalPanjang(locale: Locale, nilai: Date): string {
  return nilai.toLocaleDateString(localeHtmlLang[locale], OPSI);
}

/**
 * Nilai untuk atribut `datetime` sebuah `<time>`.
 *
 * Tanggal saja (`YYYY-MM-DD`), bukan ISO penuh, karena yang ditampilkan di
 * sebelahnya juga tanggal saja — atribut `datetime` yang membawa jam sementara
 * teksnya tidak adalah dua ketelitian berbeda untuk satu klaim. Klaim yang
 * berketelitian penuh tetap ada di JSON-LD dan di `article:published_time`,
 * tempat mesin membacanya.
 *
 * Diturunkan dari komponen tanggal LOKAL, bukan dari `toISOString()`, supaya ia
 * tidak pernah berselisih satu hari dengan teks di sebelahnya — yang persis
 * terjadi pada tanggal terbit sore hari di zona berselisih positif dari UTC.
 */
/**
 * Apakah artikel ini benar-benar pernah diubah SESUDAH terbit.
 *
 * Perbandingannya KETAT dan atas nilai mentah, dan keduanya bersandar pada satu
 * fakta di `awcms` yang diperiksa ke kodenya: kedua jalur terbit menulis
 * `published_at` dan `updated_at` dalam SATU pernyataan dengan nilai yang sama
 * — transisi manual memakai `now()` yang stabil sepanjang transaksi, pekerjaan
 * publikasi terjadwal memakai satu nilai `now` yang sama untuk keduanya. Jadi
 * artikel yang baru terbit membawa dua stempel yang PERSIS sama, bukan yang
 * berselisih beberapa milidetik.
 *
 * Itu yang membuat `>` cukup, dan yang membuat pembandingan pada tingkat
 * tanggal salah: menyamakan seluruh hari akan menyembunyikan koreksi yang
 * dilakukan di hari yang sama dengan penerbitan — justru koreksi yang paling
 * sering terjadi, dan yang paling layak dilaporkan pada situs berita.
 */
export function pernahDiubahSetelahTerbit(terbit: Date, diubah: Date): boolean {
  return diubah.getTime() > terbit.getTime();
}

export function tanggalMesin(nilai: Date): string {
  const bulan = String(nilai.getMonth() + 1).padStart(2, "0");
  const hari = String(nilai.getDate()).padStart(2, "0");
  return `${nilai.getFullYear()}-${bulan}-${hari}`;
}
