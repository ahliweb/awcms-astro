---
tipe: perbaikan
dampak: publik
---

# Gerbang di dalam image berhenti menggagalkan setiap build

`RUN bun test` di `Dockerfile` menjalankan SELURUH suite di dalam image. Sebagian
besar suite itu membaca metadata repo yang `.dockerignore` kecualikan dengan
sengaja — `.git/`, `.github/`, `.claude/`, `docs/`, `*.md` — dan `audit-graf`
memanggil biner `git` yang tidak ada di `oven/bun:*-alpine`.

Akibatnya bukan gerbang yang ketat, melainkan gerbang yang mustahil: **image
produksi tidak pernah sekali pun berhasil dibangun.** Kegagalannya sunyi bagi
repo, karena di CI berkas-berkas itu ada dan suite-nya hijau; ia hanya terlihat
oleh yang mencoba men-deploy, sebagai kegagalan build yang menyebut `git` —
sesuatu yang tidak pernah ditulis siapa pun sebagai dependency runtime.

Ditemukan saat men-deploy template ini ke server Coolify rujukan
(`ahliweb/serv-dinkesdocker`), tempat dua aplikasi untuk repo ini terdaftar sejak
29 Juli 2026 dan tidak pernah sekali pun menghasilkan container.

- Yang berjalan di dalam image sekarang hanya gerbang artefak: `penyaji`,
  `keluaran-csp`, `content-blocks`, `seni-lokal`. Semuanya menguji berkas yang
  memang akan disajikan, yang justru alasan langkah ini ada.
- `kontrak-awcms` tetap gerbang CI meski sebagian besar isinya artefak: dua
  tesnya membaca `.github/workflows/ci.yml` dan `.claude/skills/`.
- `AWCMS_*` dilepas khusus untuk langkah tes. Stage `build` menaikkan ARG
  menjadi ENV untuk seluruh stage, sehingga nilai build yang sungguhan bocor ke
  tes yang menyetir env-nya sendiri — 22 dari 31 tes `kontrak-awcms` merah
  karenanya, dan merahnya tidak menyebut env sama sekali.
- `.env.example` dan `docs/deploy-coolify.md` diperbaiki: kredensial mesin butuh
  `media_library.media.read` di samping `blog_content.posts.read`. Tanpa itu
  `build:asal-media` — langkah terakhir `bun run build` — dijawab 403 dan build
  gagal SETELAH seluruh halaman selesai dirender, yang terbaca seperti deployment
  rusak alih-alih izin yang kurang.

Diverifikasi dengan `docker build` penuh terhadap instans awcms sungguhan: 63
tes lolos, 0 gagal, `audit:konten` bersih, container menyajikan seluruh halaman,
dan token build tetap tidak ada di `docker history` maupun di dalam image.
