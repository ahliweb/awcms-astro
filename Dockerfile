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

# Versi Bun dikunci di tiga tempat yang harus bergerak bersama: tag image di
# bawah, `packageManager` + `engines.bun` di package.json, dan `bun-version` di
# .github/workflows/ci.yml. Menaikkan salah satu saja adalah cara paling sunyi
# untuk membuat build lokal, build CI, dan build image berbeda perilaku
# (ADR-0015).
FROM oven/bun:1.3.14-alpine AS build
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
RUN bun test

# ---- runtime: Bun non-root, hanya keluaran build ---------------------------
# Sejak ADR-0016 penyajinya adalah proses Bun, bukan nginx. Traefik/Coolify
# tetap memegang TLS dan routing; yang berubah hanya siapa yang membaca berkas
# dari disk. Aturan cache, tiga header keamanan, dan kompresi ikut pindah ke
# `server/penyaji.mjs` dan dijaga `tests/penyaji.test.mjs`.
FROM oven/bun:1.3.14-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

# Yang disalin hanya dua: berkas statis yang disajikan, dan penyaji yang sudah
# dibundel menjadi satu berkas. Bundel itu yang membuat image ini tidak perlu
# `node_modules` sama sekali — pohon dependency `astro` berukuran ratusan
# megabyte dan tidak satu pun barisnya dibutuhkan untuk menyajikan berkas.
# `dist/server/entry.mjs` beserta `chunks/` juga tidak ikut: isinya sudah ada
# di dalam bundel.
COPY --from=build /app/dist/client ./dist/client
COPY --from=build /app/dist/server/penyaji.mjs ./dist/server/penyaji.mjs

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
