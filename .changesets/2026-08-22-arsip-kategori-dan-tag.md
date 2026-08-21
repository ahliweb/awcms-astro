---
bump: minor
tipe: konten
dampak: publik
---

# Sebuah artikel akhirnya bisa ditemukan lewat kategori dan tag-nya

Redaksi memfilekan artikel ke sebuah kategori di CMS, `awcms` menyimpannya, dan
pembaca tidak pernah bisa melihatnya. Situs ini tidak punya arsip kategori
maupun arsip tag: sebuah artikel termasuk salah satu tab yang dikonfigurasi di
`src/config/site.ts`, dan tidak ada halaman mana pun yang mengagregasi "semua
yang berada di Politik". Itu butir pertama yang didaftar `awcms` #597.

Dua hal yang menghalanginya diperbaiki di `awcms` lebih dulu — feed build kini
membawa `termIds`, dan daftar term kini bisa ditelusuri sampai habis. Ini paruh
konsumennya.

## Yang mendarat

- `/kategori/{slug}/` dan `/tag/{slug}/`, dengan paginasi `halaman/{nomor}/`,
  di locale bawaan maupun locale berprefiks.
- Halaman artikel MENAUT ke arsipnya. Tanpa itu setiap halaman arsip hanya bisa
  ditemukan lewat sitemap — halaman yang ada, terindeks, dan tidak ditaut satu
  pun halaman yang isinya.
- Permukaan `awcms` kelima, `/api/v1/blog/terms`, lewat gerbang kontrak di
  `tests/kontrak-awcms.test.mjs` dan kedua tabel bertanda di skill integrasi.

## Tiga keputusan yang salahnya senyap

**Arsip dibangun dari term yang DIPAKAI, bukan dari kosakatanya.** `awcms` bisa
menyimpan ribuan tag, dan pada arsip mana pun yang tumbuh bertahun-tahun
sebagian besarnya tidak melekat pada satu pun artikel yang terbit hari ini. Satu
halaman per term dalam kosakata berarti menerbitkan ribuan grid kosong — halaman
tipis bagi perayap, dan tidak ada apa-apa bagi pembaca.

**Kosakata dibaca lewat traversal, tidak pernah lewat list bawaannya.** List itu
`name ASC` dengan `LIMIT` berbatas dan mengembalikan array telanjang: tidak ada
field apa pun di dalamnya yang bisa berkata "masih ada lagi". Kosakata tag di
atas arsip 23.906 artikel akan terpotong di sekitar huruf B, dan situs akan
membangun seratus halaman arsip dari ribuan — hijau, dengan setiap artikel yang
berada di tag berabjad belakang menaut ke halaman yang tak pernah dibangkitkan.

**Arsip diurutkan tanggal, selalu.** Sebuah seksi punya `urutanSeksi` sendiri
karena itu keputusan redaksi; sebuah arsip MELINTASI seksi, dan `urutan` dari
dua seksi berbeda tidak dibandingkan terhadap apa pun. "Artikel 3" di satu seksi
tidak berada sebelum atau sesudah "Artikel 3" di seksi lain.

## Yang sengaja TIDAK dibangun

`channel` dan `topic` (PRD §8.5/§12.4) tidak mendapat arsip di sini. Keduanya
navigasi primer dan label lintas-kanal, dan permukaan pembacanya adalah mega
menu di `awcms` #597 butir 6 — membangkitkan arsip telanjang untuk keduanya
sekarang akan mendahului desain itu. Keduanya dibaca lalu diabaikan secara
eksplisit, bukan tersaring diam-diam oleh sebuah filter yang tampak seperti
detail.

## Segmen yang dipesan

`kategori`, `tag`, dan `halaman` kini ditolak sebagai slug seksi, saat impor
konfigurasi. Sebuah tab bernama `kategori` mendeklarasikan dua halaman berbeda
pada satu URL: Astro membangun keduanya dan satu menang, diam-diam, dengan
setiap gerbang hijau dan satu bagian utuh situs tak terjangkau.

## Penolakan bukan build gagal; kegagalan iya

403 atau 404 memperingatkan dengan menyebut nama permission-nya
(`blog_content.taxonomies.read`) dan membangun tanpa arsip; selain itu melempar.
Bedanya dengan identitas situs layak disebut: **kosakata kosong adalah keadaan
yang sah**, jadi fallback dan jawaban kosong yang jujur menghasilkan halaman
yang sama. Justru itu sebabnya cabang kegagalannya harus tetap terpisah — dengan
`catch` menyeluruh, "CMS Anda mati" dan "redaksi ini tidak memakai kategori"
menjadi peristiwa yang sama.
