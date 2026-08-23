🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0044-what-a-page-view-may-cost-a-reader.md)

<!-- i18n-source-hash: sha256:8d52f109d17699e15fd4d279454c89a6c0520831e60dce8f75abc30b8f43286f -->

# ADR-0044 — Berapa harga satu kunjungan halaman bagi pembacanya

- **Status:** Diterima — pemilik repo memilih Opsi B pada 23 Agustus 2026
- **Tanggal:** 23 Agustus 2026
- **Menggantikan:** tidak ada. Menjawab `awcms` #597 butir 9, yang tabel status issue itu sendiri catat sebagai *"terhalang ADR privasi di `awcms-astro`, yang merupakan keputusan pemilik repo, bukan sebuah tugas"*.

## Konteks

`awcms` punya modul visitor-analytics dan endpoint ingest anonim,
`POST /api/v1/analytics/collect`. Jalur lintas-origin-nya dibuka di #637/#638
justru supaya situs statis di domainnya sendiri bisa menjangkaunya: preflight
CORS dijawab untuk origin yang merupakan domain aktif sebuah tenant, origin yang
diizinkan digemakan apa adanya dan tidak pernah `*`, `Vary: Origin` terkirim di
setiap respons termasuk penolakan, dan endpoint-nya ber-rate-limit per-IP serta
selalu menjawab `202`.

**Tidak ada apa pun di repo ini yang memanggilnya, dan alasannya tetap tak
terpanggil bukan karena belum sempat.** Dua kalimat di sini mengatakan sesuatu
tentangnya, dan keduanya ditulis sebagai PROPERTI, bukan sebagai kelalaian:

- `AGENTS.md` §Keamanan: *"Tidak mengumpulkan data pribadi pembaca. Tanpa form,
  tanpa analitik yang mengikat identitas."*
- `docs/awcms-astro/standar-performa-dan-keamanan.md`, tentang Core Web Vitals:
  p75 kunjungan NYATA *"masih belum terukur karena RUM ditolak"*.

Jadi ini bukan pekerjaan menyambung kabel. Ini pertanyaan apakah janji template
ini kepada pembacanya berubah, dan itu milik sebuah ADR sebelum menjadi milik
sebuah `fetch`.

## Apa yang benar-benar disimpan endpoint itu, dibaca alih-alih diasumsikan

Dibaca dari collector `awcms` sendiri, bukan dari dokumentasinya:

| Yang disimpan | Bentuknya |
| --- | --- |
| Kunci pengunjung | **sha256, ber-salt per tenant** — kunci mentahnya tidak pernah disimpan |
| Alamat IP | **sha256, ber-salt per tenant** — dan, terpisah, alamat MENTAHnya bila tenant menyalakan `rawIpEnabled` |
| User agent | **sha256**, plus triplet browser/OS/jenis-perangkat hasil parsing |
| Referrer | **hanya domainnya**, bukan URL penuh |
| Path | disanitasi |
| Geo | negara / wilayah / kota / zona waktu |

Dua dari baris itu yang menentukan ADR ini, dan hanya satu yang tentang hashing.

**Kunci pengunjung adalah pengenal PERSISTEN di perangkat PEMBACA**, bukan hash
dari sesuatu yang sudah ia kirim. Ia sebuah cookie (`awcms_visitor_key`, 30 hari
secara bawaan) yang ada supaya dua kunjungan halaman bisa dikenali sebagai orang
yang sama. Meng-hash-nya di sisi server melindungi basis datanya; itu tidak
mengubah apa cookie itu.

**`rawIpEnabled` menyimpan alamatnya sendiri.** Ia per-tenant dan mati secara
bawaan di sana, dan repo ini tidak bisa melihat nilainya.

## Keputusan yang sebenarnya terbuka, dan ia lebih kecil daripada "analitik: ya atau tidak"

Karena `fetch` lintas-origin **tanpa** `credentials: "include"` tidak mengirim
maupun menyimpan cookie, repo ini sudah memegang sakelarnya — tanpa satu pun
perubahan di `awcms`:

- **Opsi A — `credentials: "include"`.** Cookie `awcms_visitor_key` disimpan di
  perangkat pembaca sebagai **cookie pihak ketiga**, dipasang dari origin lain,
  bertahan 30 hari. Hitungan pengunjung unik bekerja. Inilah yang membuat `awcms`
  #637 memasang `SameSite=None`.
- **Opsi B — `fetch` biasa.** `Set-Cookie`-nya dibuang peramban. Tidak ada apa
  pun yang persisten ditaruh di perangkat pembaca, dan tidak ada permintaan yang
  bisa dikaitkan dengan permintaan lain. Kunjungan halaman terhitung; setiap satu
  di antaranya tampak seperti kunjungan pertama.
- **Opsi C — tidak memanggil apa pun.** Status quo. Kedua kalimat yang dikutip di
  atas tetap benar secara harfiah dan situsnya tidak punya angka trafiknya
  sendiri.

## Keputusan — Opsi B, dan ia bukan posisi kompromi

**Sebuah situs boleh memanggil beacon-nya, hanya bila ia menyatakannya, dan
selalu tanpa kredensial.**

1. **Tanpa cookie, sama sekali.** Panggilannya `fetch` biasa; tidak ada yang
   disimpan di perangkat pembaca, jadi *"tanpa analitik yang mengikat identitas"*
   selamat melewati perubahan ini kata demi kata alih-alih ditafsirkan ulang.
   Yang dilepas adalah hitungan pengunjung unik, dan biayanya pantas disebut:
   "12.000 kunjungan" berhenti bisa diubah menjadi "berapa orang". Untuk situs
   informasi publik, itu yang lebih kecil di antara dua kehilangan.
2. **Tanpa banner persetujuan, karena tidak ada yang perlu disetujui.** Inilah
   konsekuensi yang membuat Opsi B layak dipilih di atas A, bukan sekadar
   detailnya. Di bawah Opsi A situs itu berutang kepada pembacanya sebuah
   pemberitahuan cookie, pilihan yang tersimpan, dan jalan untuk menariknya
   kembali — sebuah mekanisme, di setiap halaman, yang melindungi pembaca dari
   sesuatu yang situs itu sendiri pilih lakukan. Di bawah B, pemberitahuan yang
   jujur adalah satu kalimat di halaman privasi, dan ia benar tanpa mesin apa pun.
3. **Situs yang MENYATAKANNYA; template mengirimkannya dalam keadaan mati.**
   Kosong secara bawaan di `src/config/site.ts`, bentuk yang sama dengan
   `permukaanAdmin` (ADR-0034). Template yang diam-diam melaporkan trafik setiap
   situs turunannya ke `awcms` mana pun yang ditunjuknya adalah template yang
   memutuskan sesuatu atas nama orang lain.
4. **Pernyataannya harus ditolak bila `rawIpEnabled` menyala** — dan repo ini
   **tidak bisa memeriksanya**, yang dinyatakan alih-alih digerbangi. Operator
   situs dan operator `awcms` sering orang yang sama; ketika bukan, orang yang
   menyalakan ini di sini tidak bisa melihat apa yang dinyalakan orang lain di
   sana. Itu ditulis di `.env.example` dan di teks halaman privasinya sendiri,
   tempat orang yang bisa bertindak membacanya.
5. **Yang boleh dikirim persis yang dibutuhkan endpoint itu dan tidak lebih.**
   Tanpa field tambahan, tanpa pengenal yang dipasok klien, tanpa `sendBeacon`
   (yang `awcms` #637 dokumentasikan terblokir `checkOrigin` — panggilannya harus
   `fetch` ber-`application/json`). Sebuah field di masa depan adalah perubahan
   pada ADR ini, bukan perubahan pada sebuah payload.

## Yang sengaja TIDAK diputuskan di sini

- **Apakah RUM kembali.** Penolakan yang tercatat di dokumen standar tetap
  berlaku. Beacon kunjungan halaman dan beacon performa mengumpulkan hal berbeda
  dan menjawab pertanyaan berbeda; membuka yang kedua di punggung yang pertama
  adalah cara sebuah lingkup tumbuh tanpa keputusan.
- **Apa pun tentang permukaan terautentikasi.** Situs yang menyalakan
  `permukaanAdmin` punya sesi, dan setiap premis di atas berubah bersamanya.

## Konsekuensi bila diterima

- `src/config/site.ts` bertambah satu pernyataan, mati secara bawaan, dengan
  gerbang di lingkungan `tests/peran-situs.test.mjs` yang menolak pernyataan
  separuh — bentuk yang sama dengan yang sudah dimiliki `permukaanAdmin`.
- `connect-src` harus menyebut origin `awcms`. ADR-0043 sudah menaruhnya di sana
  untuk pencarian, lewat `dist/server/asal-pencarian.json`; beacon-nya tidak
  menambah origin dan tidak menambah mekanisme kedua.
- Sebuah gerbang harus menegaskan panggilannya TIDAK membawa `credentials`, di
  berkas yang sama dan karena alasan yang sama gerbang milik kotak pencarian
  menegaskannya (ADR-0043): kegagalan kebalikannya tidak terlihat — ia bekerja,
  dan biayanya jatuh pada pembaca.
- `AGENTS.md` §Keamanan mempertahankan kalimatnya tanpa berubah, dan mendapat
  satu klausa yang menyebut ADR ini sebagai yang membuatnya tetap benar.
- Halaman privasi menjadi sesuatu yang dikirimkan template, bukan sesuatu yang
  sebuah situs disuruh menulisnya sendiri.

## Amandemen — 23 Agustus 2026, ditulis saat mengimplementasikannya

Dua hal yang tidak diperkirakan dokumen ini, dicatat di sini alih-alih ditemukan
pembaca berikutnya.

**1. Ini satu-satunya permintaan di repo ini yang HARUS membawa header, dan ia
kebalikan dari aturan yang diikuti kotak pencarian.** ADR-0043 menetapkan bahwa
panggilan menghadap-pembaca tidak membawa header tambahan, karena `awcms` sengaja
tidak menyajikan handler `OPTIONS` di belakang pencarian. Beacon membalikkannya:
`security.checkOrigin` di sana menolak POST lintas-origin yang tipe isinya mirip
form, dan `fetch` tanpa tipe isi jatuh ke penolakan yang sama — hanya
`application/json` yang lolos, yang menjadikannya permintaan ber-preflight, dan
`awcms` #637 memasang handler `OPTIONS` justru untuk itu. `navigator.sendBeacon`
karena itu tidak bisa dipakai: ia mengirim `text/plain`, salah satu tipe yang
ditolak.

Menyeragamkan keduanya, ke arah mana pun, mematikan salah satunya di peramban
pembaca dan tidak di log mana pun.

**2. Gerbang "repo ini membaca `awcms`, ia tidak menulis" harus diamandemen, dan
amandemennya MEMBELI dua jaminan alih-alih membuka lubang.**
`tests/tanpa-backend.test.mjs` menolak `fetch` ber-`method` selain `GET`, dan
pesannya sendiri sudah mengantisipasi kasus ini. Pengecualiannya SATU BERKAS —
`src/components/BeaconKunjungan.astro` — bukan sebuah pola, dan aturan yang
dilonggarkannya bukan aturan yang dijaganya: gerbang itu ada supaya kredensial
mesin baca-saja milik build tidak diam-diam menumbuhkan aksi tulis, dan panggilan
ini tidak menyentuhnya sama sekali. Ia berjalan di peramban pembaca, anonim,
tanpa kredensial jenis apa pun, ke endpoint ingest publik yang selalu menjawab
`202` dan memiliki barisnya sendiri. Ia tidak menulis satu pun data yang dimiliki
situs ini.

Di sebelah pengecualian itu berdiri dua asersi baru yang sebelumnya tidak ada:
berkas beacon tidak boleh membawa **`credentials`** maupun **header otorisasi**,
dan pengecualiannya harus menamai berkas yang ADA dan benar-benar mem-POST —
sebuah pengecualian basi adalah pengecualian yang diam-diam berhenti
mengecualikan sambil membuat gerbangnya terbaca lebih ketat daripada kenyataannya.

**3. Daftar permukaan naik dari sembilan menjadi sepuluh.**
`/api/v1/analytics/collect` dibekukan di kontrak konsumen `awcms` seperti yang
lain.

## Bila pemilik lebih memilih Opsi A

Itu pilihan yang bisa dipertahankan dan dokumen ini tidak ditulis untuk
menutupnya, jadi apa yang akan dituntutnya SECARA TAMBAHAN didaftar alih-alih
dibiarkan ditemukan: pemberitahuan cookie di setiap halaman, pilihan yang
tersimpan dan bisa ditarik, pilihan itu dihormati SEBELUM beacon pertama alih-alih
sesudahnya, halaman privasi yang menyebut cookie-nya, umurnya, dan tujuannya,
serta `AGENTS.md` §Keamanan diubah dalam perubahan yang sama — karena di bawah
Opsi A kalimat itu tidak lagi benar.
