🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](03-peta-rute-dan-ui.md)

<!-- i18n-source-hash: sha256:3ee00228b7d70be3daeb0ff5f9184f34f687554a0ed8bfb76b943f49fe889317 -->

# 03 — Peta rute, porting UI, dan komponen

> Rencana. Lihat [README](README.md) untuk status.

## 1. Rute publik

| Kelompok        | Rute                                                              | Disposition        | Sumber data                    |
| --------------- | ----------------------------------------------------------------- | ------------------ | ------------------------------ |
| Discovery       | `/`, `/cari`, `/kategori`, `/kategori/[slug]`                     | PORT/REDESIGN/DYNAMIC | direktori + taksonomi `awcms` |
| Merchant        | `/usaha/[slug]`, `/usaha/[slug]/produk`                           | DYNAMIC            | projection published saja      |
| Produk/layanan  | `/produk/[slug]`, `/layanan/[slug]`                               | DYNAMIC            | katalog published              |
| Konten          | `/artikel/**`, `/bantuan/**`                                      | PORT/DYNAMIC       | `blog_content`                 |
| Komersial       | `/harga`, `/untuk-umkm`, `/layanan/website`                       | REDESIGN/DYNAMIC   | paket dari system of record    |
| Affiliate       | `/affiliate`                                                      | REDESIGN           | konten publik                  |
| Legal           | `/privasi`, `/ketentuan`, `/pengaduan`, `/disclosure-affiliate`   | PORT               | konten ber-versi + tanggal berlaku |

Halaman legal wajib menampilkan **versi** dan **tanggal berlaku**, dan versinya
tersimpan — bukan sekadar teks yang bisa berubah tanpa jejak.

## 2. Rute portal penjual

`/penjual/` + `masuk`, `daftar`, `dashboard`, `onboarding`, `usaha`, `katalog`,
`promosi`, `leads`, `analitik`, `paket`, `tagihan`, `verifikasi`, `tim`,
`bantuan`.

`masuk`/`daftar` adalah permukaan publik-tanpa-sesi; sisanya privat.

## 3. Rute portal affiliate

`/affiliate/` + `masuk`, `daftar`, `dashboard`, `tautan`, `kampanye`, `klik`,
`konversi`, `komisi`, `payout`, `pajak`, `profil`, `panduan`, `ketentuan`.

`/affiliate` (tanpa sub-path) tetap landing publik yang di-prerender.

## 4. Yang TIDAK ada di repo ini

Seluruh `/admin/jualanku/**` hidup di `awcms`. Repo ini tidak punya rute, menu,
tautan, maupun komponen ke sana — termasuk tautan "masuk sebagai admin".
Merchant dan affiliate tidak memiliki audience sesi yang bisa membukanya.

## 5. Disposition porting Elementor

| Kode       | Makna                                   | Contoh Jualanku                                |
| ---------- | ---------------------------------------- | ---------------------------------------------- |
| `PORT`     | Tujuan & struktur dipertahankan          | Hero, kartu kategori, kartu usaha              |
| `REDESIGN` | Tujuan tetap, alur diperbaiki            | Dashboard penjual, onboarding                  |
| `DYNAMIC`  | Statis → data `awcms`                    | Listing kategori, katalog, harga               |
| `REMOVE`   | Tidak dibawa                             | Placeholder, lorem ipsum, seksi duplikat, data demo |
| `DEFER`    | Bernilai, bukan MVP                      | Rekomendasi AI, checkout marketplace           |

Inventaris per rute/seksi dibuat sebagai lembar kerja sebelum layar pertama
dikerjakan; setiap baris memuat rute, seksi, disposition, pemilik data, dan
catatan aksesibilitas. Tidak ada markup, kelas CSS, widget, atau plugin WordPress
yang disalin.

## 6. Komponen

Dibangun di atas komponen dan token yang sudah ada di repo ini
([`../ui-ux-design-system.md`](../ui-ux-design-system.md)), ditambah kelompok
portal:

| Kelompok       | Komponen                                                            | Catatan                                            |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| Form           | `FormField`, `FormError`, `SubmitButton`, `CsrfField`                | Bekerja tanpa JS; error terasosiasi ke field       |
| Data           | `DataTable`, `Pagination`, `EmptyState`, `ErrorState`, `LoadingState`| Setiap layar wajib punya ketiga state              |
| Status         | `StatusPill` (verifikasi/payout/moderasi)                            | Selalu label teks, tidak pernah warna saja         |
| Sensitif       | `MaskedText`, `MoneyText`                                            | Masking otoritatif tetap di `awcms`                |
| Navigasi       | `PortalNav`, `Breadcrumb`                                            | Menu portal tidak pernah memuat tautan admin       |
| Umpan balik    | `Toast`, `ConfirmDialog`                                             | Konfirmasi untuk aksi tak-terbalikkan              |

Aturan token tetap: tidak ada gaya sekali pakai; komponen baru memakai token yang
sudah ada di `src/styles/global.css`. Rasio visual tunggal `--ratio-visual`
berlaku untuk seluruh gambar usaha/produk — sumber berasio lain akan **dipotong**
diam-diam, bukan diperkecil.

## 7. Aksesibilitas

Baseline **WCAG 2.2 AA** untuk permukaan Jualanku (naik dari 2.1 AA yang
tertulis di `AGENTS.md`; kenaikan ini diputuskan di
[ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md)).

- Fungsi inti publik bekerja tanpa JavaScript; alur kritis portal (masuk, lihat
  status, kirim form utama) juga.
- Fokus terlihat, navigasi keyboard penuh, skip link, landmark, hierarki heading.
- Target sentuh CTA utama portal minimal 44 CSS px.
- Kontras cukup di tema terang **dan** gelap.
- `prefers-reduced-motion` mematikan animasi dekoratif — bukan mempercepatnya.
- Mobile-first dari 360 px.
- Form: label, hint, asosiasi error, pengumuman status; validasi server tetap
  otoritatif.

## 8. Bahasa

String antarmuka lewat katalog PO seperti seluruh repo ini — tidak pernah
ditulis langsung di komponen. String portal baru masuk ke **seluruh** katalog
locale; key yang belum diterjemahkan jatuh ke locale default, bukan menampilkan
nama key.
