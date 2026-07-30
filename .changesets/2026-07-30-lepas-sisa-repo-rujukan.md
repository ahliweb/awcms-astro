---
tipe: perbaikan
dampak: publik
---

# Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca

Template ini diekstrak dari sebuah situs produksi, dan ekstraksinya berhenti di
tengah jalan. Yang tertinggal bukan kode mati yang tidak berbahaya: sebagian
menerbitkan identitas situs lain di setiap halaman, sebagian menampilkan nama
key mentah kepada pembaca, dan **tidak satu pun dari keduanya pernah gagal** —
`bun run build` hijau, `astro check` bersih nol error, `bun test` lulus. Semua
temuan di bawah ditemukan dengan membaca, bukan dengan gerbang.

## Identitas situs lain, tertanam harfiah

- **Nama situs repo rujukan di setiap `<title>`.** `BaseLayout` menambahkan
  "— Lalu Lintas Melayani" ke judul halaman apa pun yang belum memuatnya. Setiap
  situs yang lahir dari template ini menerbitkan nama situs orang lain di
  seluruh hasil pencariannya. Sekarang dari `siteConfig.name`.
- **Emoji instansi dan lencana wilayah di header** (`🚔`, "Kalteng"). Yang
  pertama menyalahi larangan atribut instansi negara di AGENTS.md §Keamanan.
  Keduanya dilepas; sebagai gantinya `SITE_MARK` — opsional, kosong secara
  bawaan.
- **`hreflang="x-default"` dipatok ke `'id'`** alih-alih `defaultLocale`.
- **Peta lima nama tab repo rujukan** (`sim`, `stnk`, `bpkb`, …) di
  `ArtikelLayout`. Tidak satu pun cocok dengan tab template ini, jadi setiap
  judul dan breadcrumb diam-diam jatuh ke `kategori.toUpperCase()`.
- **`wilayahSchema()`** menanamkan "Provinsi Kalimantan Tengah" dan
  `addressRegion` repo rujukan di dalam pembangun JSON-LD. Dihapus, bukan
  digeneralisasi.
- **Bendera Merah Putih untuk setiap locale yang bukan `en`.** Locale ketiga apa
  pun — bahasa apa pun, negara mana pun — otomatis mendapatkannya. Sekarang
  locale tanpa bendera mendapat lencana kode ISO-nya.
- **Tahun mulai hak cipta `2023`**, tahun repo rujukan berdiri.
- CSS: `.badge-kalteng`, `.wilayah-filter-btn` (±50 baris untuk komponen yang
  tidak ada), lencana cakupan wilayah, dan `.content-body table { min-width:
  34rem }` yang menyebut pembungkus penggulung "yang disisipkan rehype plugin" —
  pipeline markdown itu sudah tidak ada, jadi yang tersisa hanyalah tabel yang
  menggulingkan halaman di layar 360px.

## Nama key mentah di layar, di kedua bahasa

Lima kelompok key dipakai komponen tanpa pernah ditulis di katalog mana pun.
Rantai fallback `t()` berujung di nama key, jadi yang tampil kepada pembaca
adalah teks seperti `translation.notice.label` dan `biaya.jenis.pnbp`:

- `translation.notice.label` / `.body` / `.aria` — katalog hanya punya
  `translation.notice`. Terlihat di **setiap artikel yang belum diterjemahkan**,
  yaitu tepat pada pembaca yang paling butuh penjelasannya.
- `tab.articleNo`, `tab.readMoreCta` — terlihat di **setiap kartu artikel di
  setiap halaman indeks tab**.
- `biaya.jenis.*` — terlihat di **setiap baris tabel biaya**.
- `disclaimer.gakkum.*`, `artikel.variasiWilayah` — key hantu untuk kode yang
  tidak pernah bisa tampil di template ini.

Key yang nyata ditambahkan ke kedua katalog; yang hantu dihapus bersama kodenya.
`BiayaTable` sekarang jatuh ke nilai mentah kategorinya, sehingga redaksi bebas
memakai kategori sendiri tanpa lebih dulu menyunting katalog.

**Gerbang barunya:** [`tests/katalog-po.test.mjs`](../tests/katalog-po.test.mjs)
menolak key literal tanpa fallback yang tidak ada di katalog, katalog locale
yang tertinggal, `msgstr` kosong, key yatim, dan key tab yang belum ditulis.
Gerbang inilah yang menemukan `tab.articleNo` dan `tab.readMoreCta` — dua yang
lolos dari pembacaan manual. Parser PO dipindahkan ke `src/lib/po-parse.ts`
supaya bisa diuji: selama ia tinggal di `po.ts` bersama impor `?raw` milik Vite,
tidak satu pun tes bisa menyentuhnya.

## Klaim yang menunjuk berkas yang tidak ada

`socialImage()` mengembalikan `/social/<slug>.png` untuk setiap halaman dan
menyebut `scripts/kartu-share.mjs` sebagai pembangkitnya. Skrip itu tidak pernah
ikut ke repo ini — README sendiri mendaftarkannya di "Yang belum ada". Akibatnya
setiap halaman memasang `og:image`, `twitter:image`, dan `ImageObject` JSON-LD
berukuran 1200×630 yang menunjuk 404: **pratinjau sosial rusak di seluruh
situs**, tanpa satu pun kegagalan build.

Sekarang satu kartu opsional lewat `SITE_SOCIAL_IMAGE`, dan halaman tanpa kartu
melepas seluruh tag gambar — termasuk menurunkan `twitter:card` ke `summary`,
karena `summary_large_image` menjanjikan gambar besar. Pratinjau tanpa gambar
jatuh ke kartu teks yang rapi; pratinjau dengan gambar rusak tidak jatuh ke mana
pun.

## Cacat perilaku

- **Urutan artikel bisa berbeda antar bahasa.** `urutan` dan `kategori` dibaca
  dari post TERJEMAHAN, bukan dari post sumber. Terjemahan yang field
  `urutan`-nya kosong jatuh ke `99` dan menggeser seluruh bagian bahasa itu —
  halamannya semua ada, urutannya lain, dan tidak ada yang gagal. Ini melanggar
  Rule 3 di `src/lib/content.ts` sendiri. Keduanya kini dari post sumber.
- **Baris "Ditinjau ulang sebelum" tampil tanpa nilai** pada artikel tanpa
  `reviewDueDate` — sebuah janji tinjauan yang tidak pernah dibuat siapa pun.
- **`prefers-reduced-motion` hanya memangkas durasi animasi menjadi 0,01 md**,
  resep yang dilarang eksplisit oleh AGENTS.md §Antarmuka. Animasi 0,01 md tidak
  hilang, ia berkedip — dan kedipan mendadak persis kelas rangsang yang ingin
  dihindari pengguna yang mematikan gerakan. Sekarang `animation: none`.
- **Navigasi utama tidak pernah diterjemahkan.** `TabNav` merender nilai HURUF
  BESAR dari `src/config/site.ts`, sehingga permukaan paling terlihat di situs
  justru satu-satunya yang tidak ikut berganti bahasa.
- **Gambar dari CMS bisa menggulingkan halaman.** Empat kelas yang dipancarkan
  `content-blocks.ts` (`.galeri`, `.galeri-item`, `.video-berita`,
  `.blok-tak-tersedia`) tidak punya satu pun aturan gaya; satu gambar 2000px
  cukup untuk memaksa gulir mendatar di layar 360px, target dukungan terkecil
  repo ini.
- **Penanda terjemahan menyebut bahasa yang salah** — ia menampilkan nama
  bahasa yang sedang dibaca ("belum tersedia dalam English (English)") alih-alih
  bahasa sumbernya, dan memasang `lang="id"` harfiah pada kotak yang isinya
  justru bahasa pembaca, sehingga pembaca layar melafalkan kalimat Inggris
  dengan fonem Indonesia.
- **`entry: any` di `ArtikelLayout`** menyembunyikan empat field yang tidak
  pernah ada di kontrak `LocalizedArticle` (`variasiWilayah`, `unitPelaksana`,
  `tags`, dan `tags` lagi di `articleMeta`). Menggantinya dengan tipe kontraknya
  menemukan seluruhnya dalam satu kali typecheck.

## Konfigurasi

Dua variabel baru, keduanya opsional dan keduanya kosong secara bawaan —
terdokumentasi di `.env.example`, diteruskan lewat `Dockerfile` dan
`.github/workflows/ci.yml`:

- `SITE_MARK` — glif di depan nama situs di header.
- `SITE_SOCIAL_IMAGE` — satu kartu share untuk seluruh situs.

`graphify-out/` ditambahkan ke `.dockerignore`: artefak analisis bermegabyte
yang ikut ke build context dan membatalkan cache lapisan sumber image setiap
rebuild.
