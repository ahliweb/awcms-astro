---
bump: minor
tipe: konten
dampak: publik
---

# Menu dan widget yang dikonfigurasi redaksi akhirnya muncul di situs

`awcms` sudah memegang menu navigasi dan widget sejak issue #542, lengkap dengan
layar admin untuk keduanya, dan **tidak ada yang pernah merendernya**. Seorang
editor menambahkan tautan footer, CMS menyimpannya, dan tidak ada pembaca yang
pernah melihatnya. Itu `awcms` #597 butir 6.

## Yang TIDAK dilakukan perubahan ini

Ia tidak mengganti bilah tab, dan itu bukan kelalaian melainkan keputusan
(ADR-0105 di `awcms`). Bilah tab merender labelnya lewat katalog PO; sebuah item
menu `awcms` membawa **satu** label, tanpa varian per-locale. Menjadikan
navigasi utama digerakkan CMS berarti mengembalikan antarmuka primer situs ini
ke satu bahasa — persis cacat yang dicatat komentar `src/config/site.ts`, yang
menyebut navigasi sebagai "satu-satunya bagian antarmuka yang tidak pernah
diterjemahkan, di sebuah template yang seluruh maksudnya multibahasa".

Tab juga menentukan struktur rute, urutan seksi, dan seksi tempat sebuah artikel
berada. Sebuah menu adalah daftar tautan; ia bukan satu pun dari itu.

Jadi menu CMS adalah wilayah **sekunder** di footer, widget dirender di posisi
yang dinyatakannya, dan tenant yang tidak mengonfigurasi keduanya mendapat situs
yang ia punya hari ini.

## Yang dibuang, dan kenapa pembuangannya berbicara

- **Item `page` dibuang.** Template ini tidak punya rute page sama sekali, jadi
  merendernya berarti tautan mati di setiap halaman situs.
- **Target `post` yang tidak terbit dibuang**, dan itu keadaan NORMAL: `awcms`
  sengaja tidak memeriksa `targetId` saat tulis, karena sebuah menu boleh
  menunjuk artikel yang belum terbit.
- **URL non-http ditolak** meski `awcms` seharusnya sudah menolaknya saat tulis
  — baris yang ditulis sebelum validator itu tetaplah baris, dan yang dirender
  di sini adalah `<a href>` di footer setiap halaman.
- **Anak yang induknya terbuang ikut terbuang**, tidak dinaikkan menjadi item
  tingkat atas: itu akan mengubah menu yang disusun editor menjadi menu lain
  yang tampak disengaja.

Setiap pembuangan menyebut **label** itemnya di log build — tempat orang yang
bisa bertindak sedang melihat, tidak seperti tautan mati yang hanya dilihat
pembaca. Sekali per build, bukan sekali per halaman: build verifikasi mencetak
108 salinan pesan yang identik sebelum de-duplikasinya ada, dan itu
menenggelamkan satu-satunya log tempat pesan ini sampai.

## `bodyText` di-escape

Badan widget adalah teks biasa. `awcms` **menolak** markup saat tulis alih-alih
menyanitasinya, jadi merendernya sebagai HTML di sini akan memberikan
kepercayaan yang justru ditolak jalur tulis. Diverifikasi di keluaran build:
`Teks <biasa>` terbit sebagai `Teks &lt;biasa&gt;`.

## Widget nonaktif

`awcms` mengembalikan yang nonaktif dengan sengaja, supaya "dimatikan" dan
"dihapus" bukan jawaban yang sama. Penyaringannya milik situs ini, dan
`isActive` yang bukan boolean diperlakukan **nonaktif**: widget yang muncul
karena field-nya hilang adalah teks yang terbit tanpa ada yang menyalakannya.

## Verifikasi

Diverifikasi end-to-end terhadap stub `awcms` dengan menu bersarang, item
`page`, target `post` yang hilang, dan widget nonaktif. Hasil: 108 halaman,
`audit:konten` penuh hijau (SEO, hreflang, tautan mati, sitemap), item yang
terbuang tidak terbit, tautan `post` membawa prefiks locale-nya, dan peringatan
tercetak satu kali.
