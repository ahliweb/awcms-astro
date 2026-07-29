# 01 — Arsitektur experience layer

> Rencana. Lihat [README](README.md) untuk status.

## 1. Matriks rendering

| Rute                                   | Rendering                | Cache                          | Sesi              |
| -------------------------------------- | ------------------------ | ------------------------------ | ----------------- |
| `/`                                    | Prerender                | Public, revalidate saat deploy | —                 |
| `/kategori`, `/kategori/[slug]`        | Prerender + rebuild      | Public, invalidasi ber-tag     | —                 |
| `/usaha/[slug]`, `/usaha/[slug]/produk`| Prerender + rebuild      | Public                         | —                 |
| `/produk/[slug]`, `/layanan/[slug]`    | Prerender + rebuild      | Public                         | —                 |
| `/artikel/**`, `/bantuan/**`           | Prerender (fetch build)  | Public                         | —                 |
| `/harga`, `/untuk-umkm`                | Prerender                | Public                         | —                 |
| `/privasi`, `/ketentuan`, `/pengaduan`, `/disclosure-affiliate` | Prerender | Public   | —                 |
| `/cari`                                | On-demand (atau statis + API publik ber-TTL) | Public, TTL pendek | — |
| `/affiliate` (landing)                 | Prerender                | Public                         | —                 |
| `/penjual/masuk`, `/penjual/daftar`    | On-demand                | `no-store`                     | Belum ada         |
| `/penjual/**` lainnya                  | On-demand                | `private, no-store`            | Merchant          |
| `/affiliate/masuk`, `/affiliate/daftar`| On-demand                | `no-store`                     | Belum ada         |
| `/affiliate/**` lainnya                | On-demand                | `private, no-store`            | Affiliate         |
| `/_portal-api/**`                      | Server endpoint          | `no-store`                     | Sesi + CSRF       |

Rute on-demand ditandai `export const prerender = false`. Semua yang tidak
ditandai tetap prerender — default yang aman: sebuah rute privat yang lupa
ditandai akan gagal saat build (butuh sesi yang tidak ada), bukan diam-diam
menerbitkan halaman privat sebagai berkas statis.

**Uji ini wajib ada:** setelah build, tidak boleh ada berkas HTML statis untuk
path `/penjual/**` maupun `/affiliate/**` (kecuali landing), dan sitemap tidak
boleh memuat satu pun rute privat.

## 2. Perubahan konfigurasi

```
astro.config.mjs
  + adapter server (Node standalone)
    output: "static"   ← TIDAK berubah
```

Dengan adapter terpasang, `output: "static"` tetap menjadi default dan rute
on-demand di-opt-out satu per satu. Ini yang dimaksud "static-by-default dengan
rute on-demand"; tidak ada nilai `output: 'hybrid'` di Astro modern.

Komentar panjang di `astro.config.mjs` yang menjelaskan kenapa `output: 'static'`
adalah premis template **tetap dipertahankan**, ditambah rujukan ke
[ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md) supaya pembaca
berikutnya tahu batas mana yang sudah diputuskan dan mana yang belum.

## 3. Struktur direktori yang direncanakan

```
src/
  pages/
    penjual/            # rute on-demand (prerender = false)
    affiliate/          # landing prerender; sisanya on-demand
    _portal-api/        # server endpoints (BFF)
  lib/
    awcms/
      client.ts         # SUDAH ADA — tetap satu-satunya penghubung ke awcms
      portal.ts         # panggilan saat request (sesi, mutasi portal)
      session.ts        # cookie portal ↔ token awcms, rotasi, logout
      csrf.ts           # token + verifikasi Origin/Referer
    view-models/        # bentuk data untuk komponen portal
  components/
    portal/             # komponen khusus portal (form, tabel, status)
  middleware.ts         # header keamanan + cache policy per permukaan
```

Aturan `AGENTS.md` yang tetap berlaku dan mengikat kode baru:

- **`src/lib/awcms/*` adalah satu-satunya yang menghubungi `awcms`.** Komponen
  menerima data lewat props; ia tidak pernah mengambil datanya sendiri.
- **Tidak ada jalur HTML mentah dari CMS.** `set:html` hanya menerima keluaran
  renderer blok terkontrol.
- **Token tidak pernah ber-prefix `PUBLIC_`.** Variabel ber-prefix itu masuk ke
  bundel klien; token di bundel klien adalah token yang diterbitkan ke setiap
  pengunjung.
- **Baca env lewat `src/lib/env.ts`**, bukan `import.meta.env` langsung.
- **Token desain, bukan nilai lepas.**

## 4. Perbedaan build-time vs request-time

Hari ini seluruh data ditarik saat `docker build` (lihat komentar di
`Dockerfile`). Setelah portal aktif, ada dua kelas variabel dan membedakannya
adalah sumber kebingungan deploy paling sering:

| Kelas                | Contoh                                            | Kapan dibutuhkan | Catatan                                     |
| -------------------- | ------------------------------------------------- | ---------------- | ------------------------------------------- |
| Build-time           | `SITE_URL`, `AWCMS_API_URL`, token baca konten     | saat `astro build` | Di Coolify wajib dicentang **Build Variable** |
| Runtime (baru)       | URL internal `awcms`, secret sesi/CSRF, kredensial layanan | saat container jalan | **Tidak boleh** ikut ke riwayat image |

Token baca-konten build-time hanya boleh membaca konten **published** untuk satu
tenant. Kredensial runtime portal adalah identitas yang berbeda, dengan
kewenangan berbeda, dan tidak pernah dipakai saat build.

Setiap variabel baru wajib masuk `.env.example` beserta konsekuensi salah isi —
bukan sekadar namanya. Itu ditambahkan **bersama kode yang membacanya**, bukan
sekarang.

## 5. Perubahan deployment

| Aspek       | Sekarang                                   | Setelah portal aktif                                                        |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Image       | `node` build → `nginx-unprivileged` statis | Stage runtime menjalankan keluaran adapter (proses Node), nginx/Traefik di depan |
| Port        | 8080 (nginx)                               | Port aplikasi + reverse proxy                                                |
| Healthcheck | `wget` ke `/`                              | Endpoint kesehatan yang tidak menyentuh `awcms` (agar tidak menular gagal)   |
| Nginx       | `try_files` ke berkas                      | Berkas statis + proxy ke aplikasi untuk rute on-demand                       |
| Rebuild     | Webhook Coolify → rebuild penuh            | Tetap, untuk konten publik; portal tidak butuh rebuild                       |
| Jaringan    | Publik → nginx                             | Publik → proxy → app; app → `awcms` lewat jaringan privat                    |

`awcms` dipindahkan ke origin privat/terbatas pada perubahan yang sama. Portal
yang sudah jalan sementara `awcms` masih publik memberi keuntungan keamanan nol.

## 6. Jalur rollback

Rollback **bukan** "revert commit lalu berdoa". Yang harus tetap benar:

1. Build statis penuh (tanpa rute on-demand) tetap bisa dihasilkan dan
   di-deploy — diuji di CI, bukan diasumsikan.
2. Selama portal belum diumumkan, konfigurasi deployment lama tetap disimpan dan
   bisa dipakai kembali dalam satu langkah.
3. Bila portal dimatikan, rute `/penjual/**` dan `/affiliate/**` mengembalikan
   halaman "sementara tidak tersedia" yang jujur — bukan 404 yang membuat
   pengguna mengira akunnya hilang.
