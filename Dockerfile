# syntax=docker/dockerfile:1.7
#
# Image produksi awcms-astro — keluaran statis murni di belakang nginx.
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
# akhir `FROM nginx` hanya menyalin `dist/`, jadi token tidak ikut ke riwayat
# image yang dijalankan. Ia tetap terbaca di cache builder pada mesin build,
# jadi tetap terbitkan token yang **hanya bisa membaca konten published untuk
# satu tenant** — sesuai `.env.example`. Bila builder mendukung BuildKit
# secrets, `RUN --mount=type=secret` lebih ketat lagi dan bisa dipakai tanpa
# mengubah apa pun di bawah selain baris `RUN`-nya.

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
ARG AWCMS_TENANT_CODE
ARG AWCMS_TENANT_ID
ARG AWCMS_DEFAULT_TENANT_CODE

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
    AWCMS_TENANT_CODE=$AWCMS_TENANT_CODE \
    AWCMS_TENANT_ID=$AWCMS_TENANT_ID \
    AWCMS_DEFAULT_TENANT_CODE=$AWCMS_DEFAULT_TENANT_CODE

# `bun run build` sudah mencakup gerbang lockfile dan `astro check`. Menjalankan
# `astro build` langsung di sini akan melewatinya, dan deploy adalah tempat
# terakhir yang pantas melewati gerbang.
RUN bun run build

# ---- runtime: nginx non-root, hanya berkas statis --------------------------
# Varian unprivileged berjalan sebagai UID 101 dan mendengarkan di 8080. Tidak
# ada alasan image yang hanya menyajikan berkas statis berjalan sebagai root.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY ops/nginx-situs.conf /etc/nginx/conf.d/default.conf
COPY ops/nginx-header-keamanan.conf /etc/nginx/snippets/header-keamanan.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Berbeda dari awcms-micro dan SIMFAR di server Dinkes, healthcheck bawaan
# Coolify AMAN diaktifkan untuk image ini: busybox `wget` ada di dalam alpine,
# dan nginx statis tidak punya padanan `ALLOWED_HOSTS` yang menolak permintaan
# ber-`Host: localhost`. Lihat docs/deploy-coolify.md.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
