# ADR-0025 — Gambar artikel dari media `awcms`: di-resolve sekali per build, dan `img-src` yang DITANYAKAN

- **Status:** Accepted
- **Tanggal:** 3 Agustus 2026
- **Aturan pemilik:** 3 Agustus 2026 — "cek repo `ahliweb/awcms`, lalu lanjutkan yang bisa dilakukan atas dasar kesiapan repo `awcms` tersebut."
- **Menutup:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) §Titik lanjut butir 1
- **Terkait:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (kontrak build), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (`img-src`), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (uji "ditulis ulang bila `awcms` berubah?"), [ADR-0024](0024-seni-lokal-di-src-assets.md) (seni lokal), `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md), `awcms` [ADR-0056](https://github.com/ahliweb/awcms/blob/main/docs/adr/0056-media-library-admin-surface.md)

## Konteks

ADR-0023 menahan pekerjaan yang **membutuhkan** `awcms` dengan satu batas yang
dinyatakan terus terang: *"endpoint-nya sudah ada" bukan jawaban "tidak"*, karena
kode yang memanggil `awcms` bentuknya ditentukan respons `awcms`, dan repo
template ini tidak punya instans untuk membuktikan panggilannya benar.

Dua hal mengubah dasar itu pada 3 Agustus 2026, dan keduanya datang dari
`awcms`, bukan dari sini:

1. **Analisis kesiapan `awcms` untuk repo ini** (`awcms` #371). Ia memeriksa ke
   KODE, bukan ke daftar, dan menyimpulkan: **setiap kontrak konten dan sesi
   yang benar-benar dipanggil `awcms-astro` sudah lengkap** — traversal post
   (`view=full`/cursor/`locale`), resolusi objek media, introspeksi sesi,
   kredensial mesin, dan post tunggal. Yang menahan repo ini bukan kontrak yang
   hilang.
2. **Satu celah nyata ditutup di gelombang yang sama** (`awcms` #370):
   `GET /api/v1/media/public-origin`, dibuka **persis untuk repo ini**, karena
   `img-src` harus menyebut host media pada kebijakan yang ditulis SEBELUM satu
   objek pun diambil.

Butir pertama §Titik lanjut ADR-0021 mencatat dua keputusan yang tersisa di sini,
dan keduanya masih persis itu: **di mana gambar hasil resolusi tinggal**, dan
**apa yang diizinkan `img-src`**. ADR ini menjawab keduanya.

## Keputusan

### 1. Resolusi sekali per build, hasilnya di `LocalizedArticle`

`content.ts` mengumpulkan seluruh `featuredMediaId` dari feed, menyelesaikannya
dalam batch ke `GET /api/v1/media/objects?ids=…`, dan menaruh hasilnya di
`LocalizedArticle.gambar`.

**Bukan di `article-images.ts`**, dan itu keputusan ADR-0021 yang dipertahankan:
modul itu sinkron dan komponen tidak boleh mengambil datanya sendiri
(`AGENTS.md`). Menaruhnya di sana berarti komponen async, atau satu permintaan
HTTP per kartu yang dirender — untuk situs 300 artikel dua locale, ratusan
permintaan untuk data yang satu batch sudah pegang.

Batch dipecah per **100 id**, batas yang `awcms` terapkan. Melampauinya dijawab
400, bukan dipotong — jadi situs ke-101 artikel bergambar akan gagal build alih
alih diam-diam kehilangan sisanya.

### 2. Media `awcms` menang atas seni lokal

Urutannya bukan "remote mengalahkan lokal" melainkan **spesifik mengalahkan
generik**: `featuredMediaId` adalah pilihan yang dibuat editor untuk artikel
ITU di CMS, sementara `artikel/<tab>/<slug>` adalah berkas yang kebetulan
diletakkan situs pada jalur yang cocok. Menghormati berkas saat keduanya ada
berarti menimpa keputusan redaksi tanpa satu pun tanda di halaman.

Situs yang menginginkan sebaliknya tidak butuh saklar: ia berhenti mengisi
featured image di `awcms`. Itu keputusan yang dibuat di tempat artikelnya
tinggal.

### 3. Satu id hilang ≠ semua id hilang

| Keadaan | Perlakuan | Alasan |
| --- | --- | --- |
| Satu id tidak resolve | Placeholder, build lanjut | `awcms` mengizinkan objek di-purge dan memutuskan rujukan yang menggantung menjadi **inert, bukan penghalang** (ADR-0056 §B). Menggagalkan build di sini berarti repo ini memveto keputusan itu — situs tidak bisa terbit karena satu gambar dihapus. |
| NOL dari N id resolve | **Build gagal** | Ini bukan aksi operator. Ia adalah token build tanpa `media_library.media.read`, `awcms` yang lebih tua dari endpoint-nya, atau media yang tidak dikonfigurasi. Ketiganya menerbitkan situs yang SETIAP artikelnya kehilangan gambar sekaligus — bentuk cacat ADR-0018 yang persis sama. |

### 4. `img-src` DITANYAKAN, tidak disalin

`scripts/asal-media.mjs` menanyakan `GET /api/v1/media/public-origin` saat build
dan menulis `dist/server/asal-media.json`; `server/penyaji.mjs` membacanya saat
start dan melebarkan `img-src` dengan origin itu.

ADR-0019 §Menyesuaikan menyuruh melebarkan `img-src` **di berkas penyaji**, dan
itu tetap berlaku untuk origin yang dipilih SITUS (CDN, host pihak ketiga).
Origin media bukan pilihan situs — ia milik deployment `awcms`, diturunkan dari
`NEWS_MEDIA_R2_PUBLIC_BASE_URL` di sana. Menuliskannya dengan tangan adalah dua
salinan satu nilai yang sepakat sampai salah satunya disunting, dan kegagalannya
tidak menyebut sebabnya di mana pun: **gambar diblokir diam-diam oleh kebijakan
yang tampak baik-baik saja.** `awcms` membuka endpoint itu justru untuk menutup
ini.

Yang **tidak** berubah: kebijakan tetap dirangkai di `penyaji.mjs` saja. Berkas
JSON itu **data, bukan kebijakan kedua**. Dua sumber kebijakan yang saling
menimpa adalah cara paling sunyi untuk berakhir tanpa kebijakan sama sekali, dan
itu tetap aturan ADR-0019.

Nilai yang dibaca dari berkas itu berakhir **di dalam sebuah header**, jadi ia
diperlakukan sebagai masukan yang tidak dipercaya: JSON rusak, `configured:
false`, skema selain `http`/`https`, dan nilai bukan-string semuanya
diperlakukan sebagai tidak ada, dan origin dipangkas lewat `new URL(...).origin`
sehingga path maupun spasi tidak bisa menyelundupkan direktif kedua. Satu nilai
cacat membuat browser menolak SELURUH kebijakan — bersama `script-src`,
`object-src`, dan setiap direktif lain di dalamnya.

## Konsekuensi

- **Butir pertama §Titik lanjut ADR-0021 selesai.** Yang tersisa di daftar itu
  tinggal kartu share (butuh pembangkit, ADR sendiri) dan BFF portal.
- **`Dockerfile` menyalin satu berkas lagi**, dan ketiadaannya tidak
  menggagalkan apa pun — persis kelas cacat yang ADR ini ada untuk menutupnya.
  Baris `COPY`-nya membawa komentar yang menyebut akibatnya.
- **Deployment tanpa media publik tetap sah.** `configured: false` adalah
  keadaan, bukan kesalahan (`awcms` memilih 200 alih-alih 404 justru supaya
  build tidak gagal di deployment yang valid), dan `img-src 'self'` adalah
  kebijakan yang benar untuknya.
- **Uji ADR-0023 tetap berlaku untuk sisanya.** Yang mendarat di sini bukan
  pelonggaran uji itu, melainkan pemenuhannya: kontraknya lengkap, dan
  `awcms` sendiri yang memverifikasinya ke kode di #371. BFF portal — yang
  memanggil `awcms` di setiap permintaan runtime, bukan sekali per build — tetap
  ditahan.
- **Risiko yang diterima:** gambar diverifikasi lewat kontrak tiruan, bukan
  terhadap instans `awcms` sungguhan, karena repo template ini tidak punya satu.
  Tiruannya meniru penolakan yang nyata (`unresolved` dilaporkan, batas 100 id),
  dan gerbang nol-dari-N adalah yang menangkap perbedaan bila tiruan itu ternyata
  lebih longgar daripada aslinya. Sebuah SITUS menjalankan build yang sama
  terhadap `awcms` sungguhan di CI-nya.

## Alternatif yang dipertimbangkan

- **Membaca origin dari `publicUrl` yang dikembalikan** — ditolak, dan alasannya
  milik `awcms`: kebijakan ditulis sebelum objek pertama diambil, jadi build
  yang kebetulan tidak memuat gambar akan menghasilkan kebijakan tanpa `img-src`
  sama sekali dan merusak build berikutnya.
- **Menyalin `NEWS_MEDIA_R2_PUBLIC_BASE_URL` ke `.env` repo ini** — ditolak; dua
  salinan satu nilai, dengan kegagalan yang tidak menyebut sebabnya. Ini yang
  `awcms` #370 hapus.
- **Melebarkan `img-src` lewat env var penyaji** — ditolak oleh ADR-0019, dan
  alasannya masih berlaku: kebijakan yang bisa diubah dari luar berkasnya adalah
  kebijakan yang bisa dikosongkan tanpa satu pun diff.
- **Menggagalkan build pada id mana pun yang hilang** — ditolak; lihat tabel §3.
- **Menaruh resolusi di `article-images.ts` dengan cache modul** — ditolak: ia
  membuat komponen menunggu I/O dan memindahkan pengambilan data ke lapisan
  presentasi, dua aturan `AGENTS.md` sekaligus.
