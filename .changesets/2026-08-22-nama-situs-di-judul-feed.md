---
bump: patch
tipe: perbaikan
dampak: publik
---

# Masthead memakai nama tenant, judul feed masih memakai nama `.env` — dan tidak ada gerbang yang bisa melihatnya

Ditemukan tepat setelah identitas situs mendarat (`awcms` #596): `BaseLayout`
sudah memasang nama tenant di masthead, `<title>`, dan `og:site_name`,
sementara **judul feed** — `isiFeed`, tautan penemuan-otomatis di halaman seksi,
dan tautan yang sama di halaman artikel — masih merakit namanya dari
`siteConfig.name`, yaitu `SITE_NAME` di `.env`.

## Kenapa ia tidak terlihat

Kedua nama itu ADA, dan keduanya masuk akal dibaca sendiri. Tidak ada tipe yang
salah, tidak ada tag yang hilang, tidak ada permintaan yang gagal. Yang salah
hanya bahwa dua permukaan menamai situs yang sama dengan dua nama berbeda — dan
yang kedua muncul di daftar langganan pembaca feed, tempat yang justru paling
jarang dibuka ulang setelah dilanggan sekali.

Ini bentuk cacat yang sama persis dengan yang sudah ditulis aturannya di repo
ini untuk `shareCard` dan `feed`: dua nilai yang seharusnya datang dari satu
sumber, dikirim terpisah, lalu diam-diam datang dari sumber yang berbeda.

## Gerbangnya membaca SUMBER, bukan keluaran

`tests/identitas-situs.test.mjs` menolak `siteConfig.name` di setiap berkas yang
menamai situs, dan menuntutnya tetap ada di `src/lib/identitas.ts` — satu-satunya
tempat urutan jatuhnya boleh tinggal. Ia tidak bisa membaca `dist/`: build penuh
butuh awcms yang hidup dan dilewati di repo template ini, sehingga asersi atas
keluaran tidak akan pernah berjalan di sini.
