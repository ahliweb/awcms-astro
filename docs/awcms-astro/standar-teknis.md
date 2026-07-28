# awcms-astro — Standar Teknis

Aturan teknis yang mengikat setiap repo `awcms-astro`. Ditulis agar bisa dipakai repo lain tanpa membawa isi domain repo rujukan.

Kata **wajib** di dokumen ini berarti pelanggarannya menggagalkan gerbang mutu, bukan sekadar tidak dianjurkan.

## Stack

| Aspek | Keputusan | Alasan |
| --- | --- | --- |
| Framework | Astro 7, `output: 'static'` | Nol JavaScript pengiriman default; halaman tetap terbaca penuh tanpa JS |
| Runtime | Node.js `>=22.12.0`, npm `>=10.9.0`, ditegakkan `engines` | Syarat Astro 7; menurunkan hambatan kontributor konten |
| Framework UI | **Tidak ada** | Interaktivitas ditulis DOM vanilla. Tidak ada React/Vue/Svelte |
| Styling | Satu berkas CSS global + design token | Tanpa framework CSS; token di `:root`, tema gelap lewat `data-theme` |
| Konten | Content Layer API, markdown per koleksi per locale | Kontrak frontmatter tervalidasi saat build |
| i18n | Katalog PO + `t(locale, key)` | Bisa disunting penutur asli tanpa risiko merusak sintaks |
| Sitemap | `@astrojs/sitemap` dengan `serialize` | `lastmod` dari tanggal konten, bukan waktu build |
| Gambar | `astro:assets` | Dipotong dan dikonversi seukuran tampilan saat build |

**Dilarang:** framework UI, framework CSS, library animasi, SDK/widget/piksel pihak ketiga, dan analytics yang melacak individu.

## Struktur wajib

```
src/
├── assets/images/        # gambar sumber — di src/, bukan public/, agar dioptimasi
├── components/           # komponen render; views/ berisi badan halaman lintas locale
├── config/site.ts        # kontrak situs: locale, navigasi, helper URL
├── content/<koleksi>/<locale>/*.md
├── content.config.ts     # kontrak frontmatter
├── data/                 # sumber tunggal data referensi
├── layouts/              # BaseLayout (head, SEO, share) + layout konten
├── lib/                  # akses data & metadata; tidak pernah dipanggil dari markdown
├── locales/<locale>/messages.po
├── pages/                # route tipis: getStaticPaths + satu komponen view
└── styles/global.css
scripts/                  # gerbang otomatis
docs/{adr,workflows,awcms-astro}/
.changesets/
.claude/skills/
```

Aturan arahnya satu arah: **konten tidak tahu tentang komponen, komponen tidak mengambil datanya sendiri.**

- Komponen menerima data lewat props. Dilarang memanggil `getCollection` di dalam komponen presentasi.
- Berkas di `src/pages/` adalah pembungkus tipis. Badan halaman ditulis sekali di `src/components/views/` dan dipakai ulang seluruh locale.
- Data referensi (wilayah, kategori, unit) punya **satu sumber** di `src/data/` dan tidak pernah diketik ulang di markdown.

## Internasionalisasi

| Aturan | Wajib |
| --- | --- |
| Locale default di root (`/artikel/`); locale lain berawalan kodenya (`/en/artikel/`) | Ya |
| Locale non-default dibangun dari satu subpohon `src/pages/[lang]/`, bukan folder per bahasa | Ya |
| Kumpulan slug ditentukan locale default; slug tidak diterjemahkan | Ya |
| Konten yang belum diterjemahkan jatuh ke locale default disertai penanda yang terlihat pembaca | Ya |
| String antarmuka hanya dari katalog PO, tidak pernah literal di `.astro` | Ya |
| Key yang hilang di locale lain jatuh ke katalog default; nama key mentah tidak boleh tampil | Ya |
| `hreflang` lengkap seluruh locale + `x-default` di setiap halaman yang boleh diindeks | Ya |
| Key mati dihapus dari seluruh katalog | Ya |

Rantai fallback membuat pelanggaran "belum diterjemahkan" tidak merusak situs — dan justru karena itu, **cakupan terjemahan wajib dilaporkan gerbang audit** agar tetap terlihat.

## Konten

Kontrak frontmatter ada di `src/content.config.ts` dan merupakan **satu-satunya acuan**. Mengubahnya adalah perubahan MAJOR.

Yang wajib ada pada skema repo yang menyajikan informasi terikat aturan:

| Field | Fungsi |
| --- | --- |
| `title`, `description` (maks. 160 karakter) | Metadata halaman |
| `updatedDate`, `reviewDueDate` | Umur informasi; `reviewDueDate` yang terlewat adalah utang konten |
| `cakupan` / level keberlakuan | Memaksa penulis memutuskan sejauh mana informasi berlaku |
| `sumber` per klaim angka | Setiap nominal terikat ke rujukan yang bisa dicek pembaca |
| `dasarHukum` | Jenis aturan, nomor, tahun, judul — lengkap |

Aturan penulisan yang mengikat:

- Yang belum terverifikasi ditulis `TBD` beserta sumber yang harus dicek. **Jangan menebak, jangan menyalin dari pihak ketiga.**
- Data terstruktur (syarat, langkah, biaya, FAQ) ditulis di frontmatter dan dirender komponen — bukan diketik ulang di badan artikel.
- Field yang wajib identik antar locale: kategori, urutan, tanggal, level keberlakuan, tag, dan **angka** pada nominal.
- Terjemahan tidak mengubah angka, nomor peraturan, tingkat kepastian kalimat, atau peringatan.

## Aset gambar

| Aturan | Wajib |
| --- | --- |
| Berkas sumber di `src/assets/`, bukan `public/` | Ya |
| Render dengan `<Image>` dari `astro:assets`, tidak pernah `<img>` mentah | Ya |
| Potongan ditetapkan lewat `width`/`height`, bukan hanya `object-fit` | Ya |
| Satu entitas konten = satu gambar unik, dipetakan terpusat dari slug | Ya |
| SVG wajib XML valid; `&` telanjang membuat browser diam-diam gagal merender | Ya |
| Sumber di-commit beresolusi penuh, tidak dikompresi manual | Ya |
| `public/` hanya untuk berkas yang butuh URL tetap | Ya |

## SEO dan share

Wajib di setiap halaman yang boleh diindeks:

- `<title>` unik, `meta description` ≤ 160 karakter dan tidak kosong, tepat satu `<h1>`.
- `canonical` absolut dengan trailing slash konsisten.
- `hreflang` seluruh locale + `x-default`.
- Kartu share **PNG** dengan `og:image:width`, `og:image:height`, dan `og:image:alt` terisi. **Bukan SVG dan bukan WebP** — pengunduh pratinjau sosial bukan browser dan dukungannya tidak merata.
- `twitter:card` `summary_large_image`.
- Satu blok JSON-LD `@graph` berisi identitas situs, ditambah skema khas halaman.
- Sitemap dengan `lastmod` dari tanggal konten, bukan waktu build.

Halaman 404 dikecualikan: `noindex, follow`, tanpa canonical dan hreflang, tanpa tombol bagikan.

## Aksesibilitas

Target WCAG 2.1 AA. Yang mengikat:

- Skip link ke konten utama adalah elemen pertama di dalam `<body>`, teksnya dari katalog PO.
- Navigasi dapat dioperasikan penuh dengan keyboard; item aktif ditandai `aria-current`.
- Kontras cukup pada tema terang dan gelap.
- `prefers-reduced-motion: reduce` dihormati.
- Tabel data memakai `th` dengan `scope` benar dan dapat di-scroll horizontal tanpa membuat `body` ikut scroll.
- **Kontrol yang bergantung pada JavaScript disembunyikan bila API-nya tidak tersedia.** Tombol yang diam saat diklik lebih buruk daripada tombol yang tidak ada.
- Fungsi inti tetap bekerja tanpa JavaScript.

## Performa

- Tidak ada dependency UI besar; interaktivitas memakai DOM vanilla.
- Gambar layar pertama `loading="eager"` + `fetchpriority="high"`; sisanya `loading="lazy"`.
- Tema dipasang skrip inline sebelum paint untuk mencegah kedip.
- Anggaran yang terbukti di repo rujukan: **beranda ≤ 250 KB gambar, halaman konten ≤ 100 KB.**

## Keamanan

- Tidak ada secret, token, atau kredensial di repo. Repo statis tidak membutuhkannya.
- Tidak ada skrip pihak ketiga, tidak ada pengumpulan data pribadi pembaca.
- `npm audit` wajib nol sebelum rilis.
- Tautan keluar `target="_blank"` wajib `rel="noopener noreferrer"`.

## Gerbang mutu

Empat gerbang, seluruhnya wajib hijau sebelum pekerjaan dinyatakan selesai:

| Gerbang | Perintah | Menangkap |
| --- | --- | --- |
| Type check | `astro check` (di dalam `npm run build`) | Kesalahan tipe dan props |
| Audit konten | `npm run audit` | Aturan konten, katalog PO, gambar, SEO, share, tautan mati, tautan antar dokumen dan sinkronisasi daftar skill, **key mentah yang bocor ke halaman, serta manifes paket dan versi lock** |
| Audit dependency | `npm audit` | Kerentanan rantai build |
| CI | `.github/workflows/ci.yml` | Ketiganya, pada setiap PR |

**Aturan baru wajib membawa pemeriksanya.** Aturan yang hanya tertulis di dokumentasi akan dilanggar cepat atau lambat — itu sebabnya gerbang audit ada ([ADR-0008](../adr/0008-audit-konten-sebagai-gerbang-rilis.md)).

Melonggarkan pemeriksa agar gerbang hijau adalah pelanggaran, bukan perbaikan. Bila sebuah aturan memang salah, ubah aturannya secara sadar beserta alasannya di dokumentasi.

## Versioning

`MAJOR.MINOR.PATCH`, tag git `vX.Y.Z` anotatif. Arti tiap tingkat untuk situs informasi didefinisikan di [ADR-0009](../adr/0009-versioning-semver-dan-changeset.md) — semver dirancang untuk library ber-API, jadi artinya perlu ditetapkan ulang.

Setiap perubahan yang memengaruhi konten publik, struktur, dependency, atau deployment ditulis sebagai changeset **pada iterasi yang sama**, dilipat ke `CHANGELOG.md` saat rilis.

## Dokumentasi

Wajib ada dan wajib sinkron dengan kode:

| Berkas | Isi |
| --- | --- |
| `AGENTS.md` | Kontrak kerja teknis yang mengikat seluruh standar dan menunjuk dokumen rincinya |
| `README.md` | Kenapa situs ini ada, bentuknya, cara menjalankan |
| `docs/ARCHITECTURE.md` | Anatomi setiap folder dan berkas; apa yang sudah ada vs gap |
| `docs/PROJECT_STATE.md` | Keadaan proyek, utang yang diketahui, titik lanjut |
| `docs/adr/` | Keputusan beserta alasannya |
| `docs/workflows/` | Cara mengerjakan tugas berulang |
| `.claude/skills/` | Standar di atas, di-encode menjadi prosedur yang bisa dijalankan agen AI |

Dokumentasi yang menyimpang dari kode lebih berbahaya daripada tidak ada dokumentasi: ia dipercaya. Karena itu **memperbarui dokumen adalah bagian dari iterasi yang sama**, bukan pekerjaan susulan.
