---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Batas konsumen realtime Bun-only didokumentasikan

Menambah [`docs/bun-realtime-client-boundary.md`](../docs/bun-realtime-client-boundary.md) (dengan cerminan Indonesia) dan menautkannya dari README: kontrak calon konsumen SSE/WebSocket Bun untuk situs ini. Ini **usulan dokumentasi**, bukan fitur yang dikirim — repo ini belum punya server WebSocket maupun mesin siaran penyedia, dan antrean pengirim tetap di `awcms`.

Alasannya: keputusan realtime di `awcms` (#1168) sedang disusun, dan tanpa batas tertulis, sebuah rute streaming BFF bisa muncul di sini lebih dulu dengan runtime, tenant, atau kredensial yang salah.

- Pembaca situs tidak melihat perubahan apa pun.
- Pengembang mendapat daftar syarat (Bun yang dipin, bukan Node.js; izin tenant diperiksa server; tiket berumur pendek) sebelum merancang rute streaming.
