# 04 — Kesiapan, proof-of-concept, dan checklist

> Rencana. Lihat [README](README.md) untuk status.

## 1. Prasyarat sebelum layar produksi (P0)

| #   | Prasyarat                                                                     | Bukti selesai                                                        |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | [ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md) diterima      | ADR ber-status `Accepted` — **selesai**                               |
| 2   | ADR-0045 di `awcms` diterima                                                  | ADR di repo `awcms` — **selesai**                                     |
| 3   | Endpoint introspeksi sesi ada di `awcms` + terdokumentasi OpenAPI             | Kontrak + test di repo `awcms`                                        |
| 4   | Proof-of-concept adapter + satu rute on-demand + BFF                          | Login → sesi → baca profil lewat `awcms` privat, di branch terpisah   |
| 5   | Konfigurasi deployment portal (image, proxy, healthcheck, variabel runtime)   | Deploy staging berhasil                                               |
| 6   | Jalur rollback statis terdokumentasi **dan dicoba**                            | Build statis penuh hijau di CI + langkah rollback tertulis            |
| 7   | Inventaris porting Elementor per rute/seksi                                   | Lembar `PORT/REDESIGN/DYNAMIC/REMOVE/DEFER`                           |

Butir 3 adalah dependensi keras: tanpa kontrak sesi, PoC hanya bisa memalsukan
sesi, dan PoC yang memalsukan bagian tersulitnya tidak membuktikan apa pun.

## 2. Cakupan proof-of-concept

Yang harus dibuktikan, tidak lebih:

1. Adapter terpasang, `output: "static"` tetap, satu rute ditandai
   `prerender = false` dan benar-benar dirender saat request.
2. Build **tidak** menghasilkan berkas statis untuk rute itu.
3. BFF menukar cookie portal menjadi kredensial `awcms` server-side; token tidak
   pernah muncul di HTML maupun di penyimpanan browser.
4. Tenant diturunkan dari host; header tenant yang dikirim klien diabaikan.
5. Mutasi tanpa token CSRF ditolak; dengan Origin asing ditolak.
6. Logout mencabut sesi di `awcms`, dan token lama benar-benar tidak bisa dipakai.
7. Respons portal membawa `private, no-store` dan `noindex`.
8. `awcms` dapat diakses **hanya** dari jaringan privat pada lingkungan uji.

Bila salah satu tidak bisa dibuktikan, portal tidak lanjut — itulah gunanya PoC.

## 3. Checklist acceptance

**Arsitektur** — ADR disetujui · adapter terpasang · matriks rendering diuji ·
`awcms` origin privat · rollback statis terdokumentasi & dicoba.

**Identity & akses** — tanpa token di storage browser · cookie
HttpOnly/Secure/SameSite · CSRF + Origin check · tenant server-derived · rotasi
sesi · logout mencabut upstream · test negatif ada dan pernah merah.

**Rendering & cache** — nol berkas statis untuk rute privat · nol rute privat di
sitemap · `private, no-store` pada portal · aset publik ber-hash `immutable`.

**UI/UX** — token desain · state empty/error/loading di setiap layar · alur
keyboard · WCAG 2.2 AA · 360 px · tanpa placeholder · copy & klaim disetujui ·
string baru masuk seluruh katalog locale.

**Operasi** — healthcheck tidak menular gagal dari `awcms` · log ber-correlation
ID · halaman error jujur saat `awcms` mati · variabel runtime tidak masuk riwayat
image.

**Konten** — tanpa data pribadi pembaca di halaman publik · tanpa skrip pihak
ketiga · tanpa HTML mentah dari CMS · gambar berasio `--ratio-visual`.

## 4. Yang sengaja ditunda

- **Migrasi runtime ke Bun** — ADR tersendiri, setelah portal stabil.
- **Rendering seluruh situs on-demand** — ditolak, bukan ditunda.
- **Halaman admin internal di repo ini** — tetap milik `awcms`, selamanya.
- **Checkout/marketplace** — di luar MVP.
- **Personalisasi halaman publik** — akan menghapus kemampuan cache publik; butuh
  keputusan tersendiri.
