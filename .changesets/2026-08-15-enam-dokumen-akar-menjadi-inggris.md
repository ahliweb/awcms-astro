---
tipe: dokumentasi
dampak: internal
---

# Enam dokumen akar menjadi Inggris, dan sebuah anchor yang tidak dijaga siapa pun

Fase ketiga [ADR-0039](../docs/adr/0039-english-is-the-source-language.md):
[`CONTRIBUTING.md`](../CONTRIBUTING.md), [`SECURITY.md`](../SECURITY.md),
[`GOVERNANCE.md`](../GOVERNANCE.md), [`SUPPORT.md`](../SUPPORT.md),
[`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md), dan
[`.changesets/README.md`](README.md). Buku besar tunggu menyusut 43 → 37.

- **Tautan ber-anchor menyeberangi terjemahan tanpa satu pun gerbang di
  belakangnya.** `SUPPORT.md` menunjuk `CONTRIBUTING.md#terjemahan` dan
  `CONTRIBUTING.md` menunjuk `GOVERNANCE.md#kapan-sebuah-perubahan-butuh-adr`;
  menerjemahkan sebuah heading memindahkan anchor-nya, dan `audit:dokumen`
  sengaja tidak memeriksa anchor (menebak slugifikasi heading GitHub). Keduanya
  diperbaiki ke anchor Inggrisnya. Ini kelas cacat yang hanya bisa ditemukan
  dengan membacanya — sama seperti fase sebelumnya, gerbangnya tidak akan
  memberi tahu.
- **Definition of Done di `CONTRIBUTING.md` tertinggal satu gerbang.** Ia
  menyebut tiga audit sementara [`AGENTS.md`](../AGENTS.md) — daftar yang
  mengikat, dan yang dirujuk berkas ini sendiri — sudah menyebut empat sejak
  `audit:translation` mendarat. Klaim "menjalankan kelimanya" juga diganti
  dengan menyebut keenam perintah perilis satu per satu, berikut yang ketujuh
  yang hanya dijalankan CI. Angka yang tidak menyebut isinya adalah angka yang
  menua tanpa ketahuan.
- **§Terjemahan sekarang menyebut kedua arah.** Berkas itu mengatur terjemahan
  katalog PO — antarmuka, locale bawaan `id` — sementara ADR-0039 mengatur
  terjemahan DOKUMEN dengan arah yang berlawanan. Satu berkas yang memuat kata
  "terjemahan" dua kali dengan dua arah yang berbeda adalah tempat paling wajar
  seseorang salah membaca yang mana.
- **Status ADR yang ditolak ditulis `Rejected`, bukan `Ditolak`.** Kosakata
  status di `docs/adr/` seluruhnya Inggris (`Accepted`, `Superseded by`), dan
  nilai yang belum pernah dipakai satu ADR pun lebih baik ikut ke sana
  sekarang daripada dipertahankan sendirian.
