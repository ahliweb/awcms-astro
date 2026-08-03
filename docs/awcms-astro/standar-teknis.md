# awcms-astro — Standar Teknis

Aturan teknis yang mengikat setiap repo `awcms-astro`. Ditulis agar bisa dipakai repo lain tanpa membawa isi domain repo rujukan.

Kata **wajib** di dokumen ini berarti pelanggarannya menggagalkan gerbang mutu, bukan sekadar tidak dianjurkan.

## Stack

| Aspek | Keputusan | Alasan |
| --- | --- | --- |
| Framework | Astro 7, `output: 'static'` | Nol JavaScript pengiriman default; halaman tetap terbaca penuh tanpa JS |
| Runtime | Bun `>=1.3.0`, ditegakkan `engines.bun` + `packageManager` | Satu runtime untuk seluruh keluarga AWCMS (ADR-0015); `bun.lock` satu-satunya lockfile |
| Framework UI | **Tidak ada** | Interaktivitas ditulis DOM vanilla. Tidak ada React/Vue/Svelte |
| Styling | Satu berkas CSS global + design token | Tanpa framework CSS; token di `:root`, tema gelap lewat `data-theme` |
| Konten | **Ditarik dari `awcms` saat build** (ADR-0018); standar keluarga menyebut markdown per koleksi per locale | Kontraknya `LocalizedArticle` di `src/lib/content.ts`, bukan frontmatter |
| i18n | Katalog PO + `t(locale, key)` | Bisa disunting penutur asli tanpa risiko merusak sintaks |
| Sitemap | `@astrojs/sitemap` dengan `serialize` | `lastmod` dari tanggal konten, bukan waktu build |
| Gambar | `<img>` di atas URL hasil `import.meta.glob` (ADR-0024); standar keluarga menyebut `astro:assets` | Satu bentuk untuk SVG maupun raster; pemotongan dijaga bingkai CSS + gerbang rasio |

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

**Di `awcms-astro` sendiri empat entri di atas tidak ada, dan itu disengaja:**
`content/`, `content.config.ts`, `data/`, dan `assets/images/` adalah bentuk
konten-di-repo. Repo ini menariknya dari `awcms` saat build, jadi kontrak
frontmatter digantikan `src/lib/content.ts` (adapter API → `LocalizedArticle`)
dan data referensi tinggal di CMS. Sebagai gantinya ada dua entri yang tidak ada
di daftar standar: `server/penyaji.mjs` (penyaji produksi sejak
[ADR-0016](../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)) dan
`tests/` (gerbang yang berjalan lewat `bun test`).

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

**Di `awcms-astro` konten tidak tinggal di repo.** Ia ditarik dari `awcms` saat build (ADR-0018), jadi kontraknya adalah `LocalizedArticle` di `src/lib/content.ts` — bukan frontmatter, dan tidak ada `content.config.ts` di sini. Yang di bawah ini adalah standar KELUARGA untuk situs yang kontennya markdown-di-repo; ia tetap ditulis karena skema itu yang harus dipenuhi sisi `awcms` agar situs seperti ini punya jaminan yang sama.

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
| **Rasio sumber sama dengan rasio bingkainya** | Ya |
| **Format dibaca dari isi berkas, bukan ekstensinya** | Ya |
| **Teks di dalam gambar hanya label topik** — tanpa nominal, tanggal, identitas, dokumen tiruan, atau antarmuka aplikasi | Ya |
| **Tanpa lambang, logo, atau atribut instansi negara di dalam ilustrasi** | Ya |
| Teks terkecil di dalam SVG tetap terbaca pada lebar kartu tersempit | Ya |
| Sumber di-commit apa adanya, tidak dikompresi manual | Ya |
| `public/` hanya untuk berkas yang butuh URL tetap | Ya |

Empat aturan bertanda tebal lahir dari cacat nyata dan bukan kehati-hatian teoretis; rinciannya di ADR-0013 repo rujukan.

**Rasio adalah yang paling mudah terlewat.** Bingkai memakai `object-fit: cover`, jadi sumber berasio lain tidak diperkecil — ia dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9 kehilangan 22% teratas, dan judul gambar hampir selalu ada di sana.

**Dua aturan isi menuntut mata manusia.** Pemeriksa tidak bisa membaca isi gambar. Katakan itu terus terang di dokumentasi: aturan yang tampak terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

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
- `prefers-reduced-motion: reduce` dihormati. Animasi dekoratif **dimatikan**, bukan dipercepat — aturan `*` global hanya memangkas durasi, dan animasi 0,01 md tetap berkedip.
- Umpan balik hover juga aktif pada `:focus-visible`, sehingga pengguna keyboard tidak mendapat versi yang lebih miskin.
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
- `bun audit` wajib nol sebelum rilis.
- Tautan keluar `target="_blank"` wajib `rel="noopener noreferrer"`.

## Gerbang mutu

Gerbang standar ini, seluruhnya wajib hijau sebelum pekerjaan dinyatakan selesai:

| Gerbang | Perintah | Menangkap | Ada di `awcms-astro`? |
| --- | --- | --- | --- |
| Lockfile | `bun run check:lockfile` | Lockfile milik proyek lain, dependency yang tidak dideklarasi | Ya |
| Type check | `astro check` (di dalam `bun run build`) | Kesalahan tipe dan props | Ya |
| Katalog PO | `bun test` | Paritas katalog antar locale, `msgstr` kosong, key yang dipakai kode tetapi tidak pernah ditulis | Ya |
| Penyajian | `bun test` | Header keamanan termasuk CSP dan Permissions-Policy, aturan cache HTML vs aset, kompresi, halaman 404 | Ya |
| Keluaran CSP | `bun test` **setelah** `bun run build` | Gaya dan skrip inline di HTML, sumber lintas-origin, JS yang ikut hilang | Ya — melewati dirinya bila `dist/` belum ada |
| Audit konten — gambar | `bun run audit:konten` | Rasio terhadap `--ratio-visual`, format dibaca dari isi berkas, XML SVG, ukuran teks terkecil di SVG | Ya |
| Audit konten — keluaran | `bun run audit:konten` **setelah** `bun run build` | Judul/deskripsi/canonical, hreflang pincang, aset yang dijanjikan metadata tetapi tidak diterbitkan, tautan mati, sitemap, nama key yang bocor ke layar | Ya — melewati dirinya bila `dist/` belum ada |
| Audit dokumen | `bun run audit:dokumen` | Tautan markdown ke berkas yang tidak ada (diselesaikan dari letak berkasnya, sehingga aturan tautan `.changesets/` ikut terjaga), indeks ADR yang tidak lengkap dua arah, kolom Status yang tidak setuju dengan ADR-nya, daftar permukaan kilau yang menyimpang dari `global.css` | Ya |
| Audit dependency | `bun audit` | Kerentanan rantai build | Ya |
| CI | `.github/workflows/ci.yml` | Seluruhnya yang ada, pada setiap PR | Ya |

**Dua aturan gambar tetap manual, dan itu disebut terus terang.** Teks di dalam gambar hanya boleh label topik, dan tidak boleh ada lambang atau atribut instansi negara — termasuk di dalam ilustrasi. Tidak ada pemeriksa yang bisa menilai keduanya. Aturan yang tampak terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

**Yang masih di repo rujukan** dan belum di-port: aturan konten khas domain (tautan antar dokumen, sinkronisasi daftar skill). Sisa backlog ada di [README repo ini](../../README.md#yang-belum-ada-backlog-eksplisit-bukan-kelalaian).

**Aturan baru wajib membawa pemeriksanya.** Aturan yang hanya tertulis di dokumentasi akan dilanggar cepat atau lambat — itu sebabnya gerbang audit ada (ADR-0008 repo rujukan).

Melonggarkan pemeriksa agar gerbang hijau adalah pelanggaran, bukan perbaikan. Bila sebuah aturan memang salah, ubah aturannya secara sadar beserta alasannya di dokumentasi.

## Versioning

`MAJOR.MINOR.PATCH`, tag git `vX.Y.Z` anotatif. Arti tiap tingkat untuk situs informasi didefinisikan di ADR-0009 repo rujukan — semver dirancang untuk library ber-API, jadi artinya perlu ditetapkan ulang.

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
