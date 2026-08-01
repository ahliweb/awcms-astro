---
tipe: perbaikan
dampak: internal
---

# Satu traversal menggantikan N+1: adapter memakai `view=full`

`awcms` menutup gap yang ADR-0018 catat beberapa jam sebelumnya:
`GET /api/v1/blog/posts?view=full&order=created_at` kini mengembalikan baris
penuh — `contentJson`, `excerpt`, `metaDescription`, `canonicalUrl`, dan
`translationGroupId` — dengan cursor keyset yang sama.

Adapter karena itu berhenti mengambil ulang setiap post lewat
`/api/v1/blog/posts/{id}`. Sebuah situs 500 artikel turun dari ~511 permintaan
per rebuild menjadi 11, dan rebuild dipicu setiap kali redaksi menekan
*publish*.

Yang ikut berubah:

- Ukuran halaman turun ke **50** — batas yang awcms terapkan untuk `view=full`
  karena barisnya membawa `contentJson`.
- Gerbang `translationGroupId` **tetap ada dan tidak berubah satu baris pun**.
  Ia ditulis sebagai assertion atas DATA, bukan pemeriksaan versi awcms, jadi ia
  berhenti menggagalkan situs multi-locale dengan sendirinya begitu field-nya
  benar-benar dikembalikan — dan tetap menjaga keadaan sebaliknya.
- Dua tes baru: satu menegaskan **tidak ada lagi permintaan per-post** (kalau ia
  kembali, ia kembali diam-diam), satu menegaskan adapter benar-benar mengirim
  `view=full` **dan** `order=created_at` — dua parameter yang membedakan "situs
  terbit" dari "situs kosong".
