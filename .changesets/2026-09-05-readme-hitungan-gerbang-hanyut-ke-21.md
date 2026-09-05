---
bump: patch
tipe: struktur
dampak: internal
---

# README dan cerminnya menyebut 21 berkas gerbang selagi `tests/` berisi 39, dan tak satu gerbang pun membacanya

`tests/documented-counts.test.mjs` sudah menggerbangi hitungan berkas gerbang
`bun test` di empat dokumen sejak 28 Agustus 2026 — tapi `README.md` dan
`README.id.md` tidak pernah masuk daftar itu. Baris tabelnya masih berbunyi
**21**, angka yang sama persis dengan defek yang diperbaiki bulan lalu di dua
dokumen lain, hanyut satu berkas demi satu berkas sejak itu sampai selisihnya
mencapai 18. Daftar cakupan di baris yang sama juga ketinggalan: ia belum
menyebut runtime Bun (ADR-0050), versi toolchain, atau meta-tes atas skrip
audit — semuanya ditambahkan setelah baris itu terakhir ditulis.

Persis bentuk yang [ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
peringatkan: benar sekali waktu, tidak tertulis sebagai pemeriksa, dan karena
itu bisa berhenti benar tanpa satu pun perintah berubah merah — kali ini di
dokumen pertama yang dibaca siapa pun yang membuka repo ini.

- Baris `bun test` di kedua README diperbarui ke 39 berkas, dan daftar
  cakupannya diperluas secukupnya agar tetap jujur tanpa jadi enumerasi 39
  butir.
- `tests/documented-counts.test.mjs` diperluas: `README.md`/`README.id.md`
  kini masuk `DOKUMEN` dan pasangan mirrornya, mengikuti pola yang sudah ada
  persis — tidak ada regex atau pesan baru, hanya dua entri lagi yang diikat
  ke hitungan yang sama.
- Tidak ada perubahan perilaku situs; ini murni dokumentasi plus gerbang yang
  sekarang menjaganya.
