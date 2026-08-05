# syntax=docker/dockerfile:1.7
#
# Image produksi awcms-astro — keluaran statis, disajikan proses Bun.
#
# ## Kenapa konten ditarik saat `docker build`, bukan saat container start
#
# Template ini `output: 'static'`. Konten dari awcms masuk ke HTML pada saat
# `astro build` berjalan, dan `astro build` berjalan di stage `build` di bawah.
# Konsekuensinya satu, dan ia sumber kebingungan paling sering pada deploy
# pertama: **variabel awcms wajib tersedia saat BUILD, bukan saat runtime.**
# Container yang sudah jadi tidak pernah menghubungi awcms lagi — ia hanya
# menyajikan berkas. Mengisi variabel ini sebagai runtime environment saja
# menghasilkan build yang gagal (`AWCMS_API_URL is not set`), bukan situs yang
# diam-diam kosong. Itu memang yang diinginkan.
#
# Di Coolify: centang **Build Variable** pada setiap variabel di bawah. Tanpa
# centang itu ia hanya diteruskan ke container yang sudah jadi, dan tidak
# satu pun sampai ke `astro build`.
#
# ## Token dan riwayat image
#
# `AWCMS_API_TOKEN` masuk sebagai `ARG` dan hanya hidup di stage `build`. Stage
# akhir hanya menyalin keluaran build, jadi token tidak ikut ke riwayat image
# yang dijalankan. Ia tetap terbaca di cache builder pada mesin build, jadi
# tetap terbitkan token yang **hanya bisa membaca konten published untuk satu
# tenant** — sesuai `.env.example`. Bila builder mendukung BuildKit secrets,
# `RUN --mount=type=secret` lebih ketat lagi dan bisa dipakai tanpa mengubah
# apa pun di bawah selain baris `RUN`-nya.

# Versi Bun dikunci di tiga BERKAS yang harus bergerak bersama: tag image di
# bawah (dua kali), `packageManager` + `engines.bun` di package.json, dan
# `bun-version` di .github/workflows/ci.yml (dua kali). Menaikkan salah satu
# saja adalah cara paling sunyi untuk membuat build lokal, build CI, dan build
# image berbeda perilaku (ADR-0015).
#
# Sejak 4 Agustus 2026 aturan itu punya pemeriksa: `tests/versi-toolchain.test.mjs`
# membandingkan kelima nilainya. Sebelum itu ia aturan tertulis tanpa gerbang —
# selama sembilan bulan.
#
# ## Kenapa ada digest di belakang tag
#
# Tag bisa dipindahkan; digest tidak (SSDF PS.2). Tetapi saat KEDUANYA ada,
# **digest yang dipatuhi Docker dan tag hanya menjadi komentar** — sehingga
# menaikkan tag tanpa menaikkan digest menghasilkan berkas yang berbunyi 1.3.15
# sambil membangun 1.3.14, tanpa satu pun kegagalan. Gerbang di atas yang
# menutup itu, dan karena itu pin digest tidak boleh mendarat tanpanya.
#
# Menaikkan versi Bun berarti menaikkan tag DAN digest bersama. Digest baru:
#   docker manifest inspect oven/bun:<versi>-alpine   (atau registry API)
FROM oven/bun:1.3.14-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0 AS build
WORKDIR /app

# Lapisan dependency dipisah dari lapisan sumber supaya perubahan konten atau
# komponen tidak membatalkan cache install.
#
# `--frozen-lockfile` bukan hiasan: tanpanya `bun install` boleh MEMPERBARUI
# bun.lock di dalam image, dan build image berhenti membangun versi yang sama
# dengan yang di-review.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG SITE_URL
ARG SITE_NAME
ARG SITE_DESCRIPTION
ARG SITE_MARK
ARG SITE_SOCIAL_IMAGE
ARG SITE_LOCALES
ARG AWCMS_API_URL
ARG AWCMS_API_TOKEN
# Hanya AWCMS_TENANT_ID. Dua variabel rantai lama sengaja TIDAK ada di sini:
# sejak ADR-0018 keduanya DITOLAK build, bukan diabaikan, jadi meneruskannya
# dari platform build hanya memindahkan kegagalan ke tempat yang tidak
# menyebutkan sebabnya. Coolify yang masih menyimpannya sebagai build variable
# harus menghapusnya. Dijaga `tests/kontrak-awcms.test.mjs`.
ARG AWCMS_TENANT_ID

# `src/lib/env.ts` membaca `process.env` sebagai sumber otoritatif saat build,
# jadi ARG perlu dinaikkan ke ENV agar terbaca `astro build`.
ENV SITE_URL=$SITE_URL \
    SITE_NAME=$SITE_NAME \
    SITE_DESCRIPTION=$SITE_DESCRIPTION \
    SITE_MARK=$SITE_MARK \
    SITE_SOCIAL_IMAGE=$SITE_SOCIAL_IMAGE \
    SITE_LOCALES=$SITE_LOCALES \
    AWCMS_API_URL=$AWCMS_API_URL \
    AWCMS_API_TOKEN=$AWCMS_API_TOKEN \
    AWCMS_TENANT_ID=$AWCMS_TENANT_ID

# `bun run build` sudah mencakup gerbang lockfile, `astro check`, dan
# pembungkusan penyaji menjadi satu berkas. Menjalankan `astro build` langsung
# di sini akan melewati ketiganya, dan deploy adalah tempat terakhir yang
# pantas melewati gerbang.
RUN bun run build

# Gerbang penyajian dijalankan di sini, bukan hanya di CI: di CI repo template
# lapis integrasinya DILEWATI karena tidak ada sumber konten, sehingga image
# adalah tempat pertama yang benar-benar punya hasil build untuk diuji. Aturan
# cache dan header karena itu terbukti pada artefak yang persis akan berjalan.
# Hanya gerbang yang menguji ARTEFAK HASIL BUILD yang berjalan di sini. Sisa
# tests/ membaca metadata repo yang justru DIKECUALIKAN .dockerignore dengan
# sengaja (.git/, .github/, .claude/, docs/, *.md), dan `audit-graf` memanggil
# biner `git` yang tidak dibawa image ini. Gerbang-gerbang itu hanya bisa hijau
# di CI, tempat repo-nya utuh.
#
# Menjalankan seluruh suite di sini bukan gerbang yang ketat — ia gerbang yang
# MUSTAHIL: `RUN bun test` menggagalkan SETIAP build image sejak baris ini ada,
# jadi image produksi tidak pernah sekali pun terbentuk. Kegagalannya sunyi bagi
# repo (CI hijau, karena di CI berkasnya ada) dan hanya terlihat oleh yang
# mencoba men-deploy.
#
# `kontrak-awcms.test.mjs` sengaja TIDAK ikut meski sebagian besar isinya
# artefak: dua tesnya membaca .github/workflows/ci.yml dan
# .claude/skills/awcms-astro-integrasi/SKILL.md. Ia tetap gerbang CI.
#
# AWCMS_* dilepas untuk langkah ini karena tes-tes ini menyetir env-nya sendiri;
# nilai build yang sungguhan bocor ke dalamnya menggagalkan tes yang seharusnya
# hijau.
RUN env -u AWCMS_API_URL -u AWCMS_API_TOKEN -u AWCMS_TENANT_ID \
    bun test tests/penyaji.test.mjs tests/keluaran-csp.test.mjs \
             tests/content-blocks.test.mjs tests/seni-lokal.test.mjs

# Alasan yang sama, kelas cacat yang berbeda: gerbang keluaran audit konten
# (SEO, hreflang, aset yang dijanjikan metadata, tautan mati, sitemap, nama key
# yang bocor ke layar) butuh `dist/client`, dan di CI repo template `dist/`
# tidak pernah ada. Di sini ia ada, dan yang diperiksa adalah berkas yang persis
# akan disajikan.
RUN bun run audit:konten

# ---- runtime: Bun non-root, hanya keluaran build ---------------------------
# Sejak ADR-0016 penyajinya adalah proses Bun, bukan nginx. Traefik/Coolify
# tetap memegang TLS dan routing; yang berubah hanya siapa yang membaca berkas
# dari disk. Aturan cache, lima header keamanan — termasuk CSP ketat dan
# Permissions-Policy sejak ADR-0019 — dan kompresi ikut pindah ke
# `server/penyaji.mjs` dan dijaga
# `tests/penyaji.test.mjs`.
FROM oven/bun:1.3.14-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0 AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

# Yang disalin hanya tiga: berkas statis yang disajikan, penyaji yang sudah
# dibundel menjadi satu berkas, dan asal media yang build tanyakan ke awcms.
# Bundel itu yang membuat image ini tidak perlu `node_modules` sama sekali —
# pohon dependency `astro` berukuran ratusan megabyte dan tidak satu pun
# barisnya dibutuhkan untuk menyajikan berkas. `dist/server/entry.mjs` beserta
# `chunks/` juga tidak ikut: isinya sudah ada di dalam bundel.
COPY --from=build /app/dist/client ./dist/client
COPY --from=build /app/dist/server/penyaji.mjs ./dist/server/penyaji.mjs

# Baris ini WAJIB ikut, dan ketiadaannya tidak menggagalkan apa pun (ADR-0025).
# `asal-media.json` yang tertinggal di stage build berarti penyaji jatuh ke
# `img-src 'self'`, dan setiap gambar artikel dari host media awcms diblokir
# browser — pada image yang build-nya hijau, dengan halaman yang terbit utuh
# selain gambarnya. Berkas ini selalu ada setelah `bun run build` sukses:
# deployment tanpa media publik tetap menuliskannya dengan `configured: false`.
COPY --from=build /app/dist/server/asal-media.json ./dist/server/asal-media.json

# Image bun sudah membawa pengguna non-root `bun`. Tidak ada alasan proses yang
# hanya membaca berkas berjalan sebagai root.
USER bun

EXPOSE 8080

# Berbeda dari awcms-micro dan SIMFAR di server Dinkes, healthcheck bawaan
# Coolify AMAN diaktifkan untuk image ini: busybox `wget` ada di dalam alpine,
# dan penyaji ini tidak punya padanan `ALLOWED_HOSTS` yang menolak permintaan
# ber-`Host: localhost`. Lihat docs/deploy-coolify.md.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["bun", "dist/server/penyaji.mjs"]
