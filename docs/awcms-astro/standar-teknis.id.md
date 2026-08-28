🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](standar-teknis.md)

<!-- i18n-source-hash: sha256:91d88238d01a371a49cc4fb93d21253ffded917d1302eed9e1632fa75199976f -->

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

**Selisih versi dengan `awcms`, dinyatakan supaya tidak ditemukan ulang sebagai temuan.** Manifest kompatibilitas keluarga `awcms` mencatat versi yang dipakai **repo itu sendiri**; nilainya bukan kewajiban bagi repo ini, tetapi selisihnya tetap layak diketahui sebelum seseorang menyamakannya "karena rapi":

**Kolom `repo ini` dibaca `tests/versi-toolchain.test.mjs` dan dibandingkan dengan `package.json`.** Kolom `awcms` tidak, dan memang tidak bisa: ia menyebut repo lain, dan gerbang yang butuh jaringan adalah gerbang yang gagal karena sebabnya sendiri. Kolom itu catatan yang ditulis tangan, dan ia bisa basi — yang di sebelahnya tidak bisa.

| Nilai | `awcms` | repo ini | Keadaannya |
| --- | --- | --- | --- |
| Bun | `1.3.14` | `1.3.14` | Cocok persis, dan dijaga `tests/versi-toolchain.test.mjs` atas lima nilai di sini |
| `astro` | `^7.2.4` | `^7.2.4` | Cocok persis sejak Dependabot [#60](https://github.com/ahliweb/awcms-astro/pull/60) menaikkan kedua pin pada 23 Agustus 2026. Sebelum itu repo ini tertinggal satu minor — dan tabel ini terus mengatakannya lima hari setelah itu berhenti benar, dan itulah sebabnya kolom ketiga kini punya pemeriksa |
| `@astrojs/node` | `^11.1.4` | `^11.1.4` | Sama seperti di atas, dinaikkan di pull request yang sama |
| `typescript` | `^7.0.2` | `^6.0.3` | **Sengaja berbeda, dan mengikat.** Pin 6.x di sini adalah syarat hidupnya gerbang `astro check` — lihat [ADR-0037](../adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) |

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

**Di `awcms-astro` sendiri LIMA entri di atas tidak ada, dan itu disengaja.**
Empat pertama — `content/`, `content.config.ts`, `data/`, dan `assets/images/` —
adalah bentuk konten-di-repo. Repo ini menariknya dari `awcms` saat build, jadi
kontrak frontmatter digantikan `src/lib/content.ts` (adapter API →
`LocalizedArticle`) dan data referensi tinggal di CMS. Yang kelima adalah
`docs/workflows/`: perannya dipikul `.claude/skills/`, karena prosedur yang bisa
dijalankan mengalahkan prosedur yang harus dibaca lebih dulu.

Sebagai gantinya ada dua entri yang tidak ada di daftar standar:
`server/penyaji.mjs` (penyaji produksi sejak
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
| `publishedDate`, `updatedDate`, `reviewDueDate` | Umur informasi; `reviewDueDate` yang terlewat adalah utang konten. Dua yang pertama datang dari `awcms` dan **dibaca dari satu baris yang sama** — dilipat menjadi satu nilai, `dateModified` membeku di tanggal terbit selamanya ([ADR-0033](../adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)) |
| `cakupan` / level keberlakuan | Memaksa penulis memutuskan sejauh mana informasi berlaku |
| `sumber` per klaim angka | Setiap nominal terikat ke rujukan yang bisa dicek pembaca |
| `dasarHukum` | Jenis aturan, nomor, tahun, judul — lengkap |

Aturan penulisan yang mengikat:

- Yang belum terverifikasi ditulis `TBD` beserta sumber yang harus dicek. **Jangan menebak, jangan menyalin dari pihak ketiga.**
- Data terstruktur (syarat, langkah, biaya, FAQ) ditulis di frontmatter dan dirender komponen — bukan diketik ulang di badan artikel.
- Field yang wajib identik antar locale: kategori, urutan, level keberlakuan, tag, **angka** pada nominal, dan setiap tanggal yang disebut ISI artikel (tanggal berlaku sebuah aturan, tenggat, masa kedaluwarsa).
- Yang **tidak** wajib identik, dan sengaja: `publishedDate` dan `updatedDate`. Keduanya milik BARIS `awcms` masing-masing locale — terjemahan yang diterbitkan belakangan memang terbit belakangan, dan memaksanya menyalin tanggal post sumber akan menerbitkan klaim yang tidak pernah terjadi.
- Terjemahan tidak mengubah angka, nomor peraturan, tingkat kepastian kalimat, atau peringatan.

## Aset gambar

| Aturan | Wajib |
| --- | --- |
| Berkas sumber di `src/assets/`, bukan `public/` | Ya |
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

**Dua aturan keluarga yang `awcms-astro` sengaja TIDAK ikuti**, dan yang sampai 4 Agustus 2026 masih tertulis di tabel ini sebagai "wajib" sambil dibantah kodenya sendiri:

| Aturan keluarga | Yang berlaku di `awcms-astro` | Kenapa |
| --- | --- | --- |
| Render dengan `<Image>` dari `astro:assets`, tidak pernah `<img>` mentah | `<img>` di atas URL hasil `import.meta.glob` dengan `query: "?url"` | [ADR-0024](../adr/0024-seni-lokal-di-src-assets.md). `astro:assets` mengembalikan `ImageMetadata`, bukan string — ia mengubah bentuk `ArticleVisual` beserta keempat bingkainya, dan memperlakukan SVG berbeda dari raster padahal SVG justru format yang gerbang repo ini ditulis untuk membaca |
| Potongan ditetapkan lewat `width`/`height`, bukan hanya `object-fit` | Satu `--ratio-visual` untuk seluruh situs; bingkai memotong lewat `object-fit: cover` | Potongan tidak hilang karenanya — ia **dicegah**: `bun run audit:konten` menolak sumber yang bukan `--ratio-visual` sebelum ia sempat terbit |

**Biaya yang diterima, dan wajib dibaca sebelum sebuah situs mengisi `src/assets/` dengan foto:** raster tidak di-encode ulang dan **tidak ada `srcset`**, jadi ponsel 360px mengunduh berkas yang sama dengan desktop 1920px. Itu bisa diterima untuk SVG dan untuk gambar artikel yang datang dari media `awcms`; ia berhenti bisa diterima untuk foto raster besar. Anggaran di §Performa adalah tempat pertama kelebihannya terlihat.

**Rasio adalah yang paling mudah terlewat.** Bingkai memakai `object-fit: cover`, jadi sumber berasio lain tidak diperkecil — ia dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9 kehilangan 22% teratas, dan judul gambar hampir selalu ada di sana.

**Dua aturan isi menuntut mata manusia.** Pemeriksa tidak bisa membaca isi gambar. Katakan itu terus terang di dokumentasi: aturan yang tampak terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

## SEO dan share

Wajib di setiap halaman yang boleh diindeks:

- `<title>` unik, `meta description` ≤ 160 karakter dan tidak kosong, tepat satu `<h1>`.
- `canonical` absolut dengan trailing slash konsisten.
- `hreflang` seluruh locale + `x-default`.
- Kartu share, **bila ada**, memasang `og:image:width`, `og:image:height`, `og:image:type`, dan `og:image:alt` yang memerikan gambar **itu** — bukan gambar lain di halaman yang sama. Halaman tanpa kartu tidak memasang tag gambar sama sekali: pratinjau tanpa gambar jatuh ke kartu teks yang rapi, pratinjau dengan gambar rusak tidak jatuh ke mana pun.
- **MIME dan ukuran kartu ikut dari kartunya, bukan dari konstanta.** Konstanta 1200×630 PNG berlaku untuk **satu** hal: `SITE_SOCIAL_IMAGE`, dan hanya karena `.env.example` mengontrakkannya kepada siapa pun yang mengisinya. Kartu per artikel datang dari media `awcms` dan membawa MIME serta ukurannya sendiri — WebP 1600×900, kemungkinan besar ([ADR-0026](../adr/0026-kartu-share-per-artikel-dari-media-awcms.md)). Memakai konstanta situs untuk gambar yang tidak pernah menandatangani kontrak itu menerbitkan tiga klaim yang salah di setiap halaman artikel, dan scraper yang memercayainya akan me-letterbox kartunya atau membuangnya.
- Yang **tetap** benar dari aturan lama: hindari SVG sebagai kartu share. Pengunduh pratinjau sosial bukan browser dan dukungan SVG-nya tidak merata. Yang berubah hanya larangan menyeluruh atas WebP — ia dibantah oleh kartu yang benar-benar diunggah editor.
- `twitter:card` `summary_large_image` bila ada kartu, `summary` bila tidak.
- Satu blok JSON-LD `@graph` berisi identitas situs, ditambah skema khas halaman.
- Sitemap dengan `lastmod` dari tanggal konten, bukan waktu build.
- **Seksi berita** (`urutanSeksi: "terbaru"`) yang berisi artikel menerbitkan feed Atom di `/{tab}/feed.xml`, diumumkan halaman seksi dan halaman artikelnya lewat `<link rel="alternate" type="application/atom+xml">` ber-`title`. Seksi `"manual"` dan seksi berita yang kosong tidak menerbitkan apa pun — alasan keduanya di [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) §1. Feed **keluar dari sitemap**: sitemap mendaftarkan halaman, dan gerbang sitemap melewati setiap `<loc>` `.xml` tanpa suara.
- **Setiap berkas `.xml` yang diterbitkan wajib punya gerbangnya.** Yang bukan `sitemap*.xml` diperlakukan sebagai feed Atom dan dituntut sah; yang bukan keduanya adalah pelanggaran. Ini menutup keadaan yang ADR-0033 catat: berkas `.xml` bernama lain tidak dibaca gerbang mana pun, sementara pemindai halaman hanya mengambil `**/*.html`.

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

Target **hasil**, diukur pada p75 kunjungan nyata — Core Web Vitals:

| Metrik | Ambang | Catatan |
| --- | --- | --- |
| LCP — Largest Contentful Paint | ≤ 2,5 detik | Elemen terbesarnya hampir selalu ilustrasi artikel |
| INP — Interaction to Next Paint | ≤ 200 milidetik | **Menggantikan FID sejak Maret 2024.** Dokumen yang masih menyebut FID basi, bukan sedang memakai alternatif |
| CLS — Cumulative Layout Shift | ≤ 0,1 | Bingkai memesan ruangnya lewat `aspect-ratio: var(--ratio-visual)`; tidak ada webfont yang bisa menggesernya |

**Sejak [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) LCP dan CLS diasersi LAB di CI** — pada tiap PR situs yang punya sumber konten; di repo template langkah itu tidak berjalan. Ketiga batasnya dinyatakan, bukan disembunyikan: lab mengukur halaman, bukan pembaca (p75 kunjungan nyata tetap tidak diukur — RUM ditolak); INP tidak terukur di lab dan diwakili proksinya TBT ≤ 200 ms; dan yang diaudit **sampel** hingga 10 URL kedalaman 4 — batas yang dipilih di `lighthouserc.json`, bukan bawaan lhci yang diam-diam berhenti di 5 URL terdangkal. Ambang dan batas cakupan itu terpaku ke tes lewat `tests/cwv-lab.test.mjs`.

Cara mencapainya — dan ini yang mengikat:

- Tidak ada dependency UI besar; interaktivitas memakai DOM vanilla.
- **Tidak ada webfont.** `--font-sans` adalah `system-ui`: nol permintaan font, nol FOIT/FOUT, nol kontribusi ke CLS. Ia dicatat sebagai keputusan privasi di `src/styles/global.css`; ia juga keputusan performa, dan sebuah situs yang menambahkan font wajib men-self-host-nya di `public/` alih-alih menambah origin ke jalur render kritis.
- Gambar layar pertama `loading="eager"` + `fetchpriority="high"`; sisanya `loading="lazy"`. Keduanya dibutuhkan dan tidak saling menggantikan: `eager` hanya berarti "jangan tunda", sementara prioritas bawaan sebuah `<img>` tetap **Low** sampai layout membuktikan ia di viewport. Ditegakkan `bun run audit:konten` atas keluaran, jadi `<img>` yang tidak lewat `src/components/Ilustrasi.astro` ikut tertangkap.
- **Tema dipasang berkas eksternal `public/tema.js` yang dimuat `<script src>` klasik**, bukan skrip inline. Sejak [ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md) penyaji mengirim `script-src 'self'` tanpa `'unsafe-inline'`, jadi skrip inline bukan "kurang rapi" — ia mati di browser pembaca. Bundel Astro selalu `type="module"` dan modul selalu ditunda, jadi ia bukan pengganti untuk kasus sebelum-paint.
- Kompresi respons bukan hanya gzip: `compression` menegosiasikan **Brotli** (RFC 7932) saat browser memintanya, dan Brotli mengalahkan gzip sekitar 15–20% pada HTML.
- `Cache-Control` dua aturan sesuai RFC 9111: aset ber-hash `immutable` satu tahun, HTML `max-age=0, must-revalidate` sehingga rebuild langsung terlihat pembaca.
- Anggaran yang terbukti di repo rujukan: **beranda ≤ 250 KB gambar, halaman konten ≤ 100 KB.** Sejak 4 Agustus 2026 ia **diukur** `bun run audit:konten` atas `dist/client`, per halaman. Yang ditimbang hanya gambar yang benar-benar diterbitkan build ini — media `awcms` tidak ada di sana, jadi angka ini menjaga seni lokal dan bukan seluruh berat halaman.

## Keamanan

Pemetaan lengkap ke **OWASP Top 10 2021, OWASP ASVS 4.0.3, OWASP Secure Headers Project, ISO/IEC 27001:2022 Annex A, dan NIST SSDF SP 800-218** ada di [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) ([ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md)). Edisi OWASP-nya **disamakan dengan `awcms`**; naik edisi adalah keputusan tingkat keluarga, bukan tingkat repo.

Yang mengikat di sini:

- Tidak ada secret, token, atau kredensial di repo. Kredensial build tinggal di `.env`/platform build, tidak pernah ber-prefiks `PUBLIC_`.
- Tidak ada skrip pihak ketiga, tidak ada pengumpulan data pribadi pembaca. Larangan itu **tidak punya pengecualian "tapi ini untuk keamanan"** — ia yang menolak pelaporan CSP dan RUM.
- Tidak ada jalur HTML mentah dari CMS. Blok konten disusun dari teks ter-escape dan tag tetap.
- Header respons ditentukan di **satu** berkas. Kebijakan kedua — di proxy, di `<meta http-equiv>`, di variabel env — adalah cara paling sunyi berakhir tanpa kebijakan sama sekali.
- `bun audit` wajib nol sebelum rilis.
- Tautan keluar `target="_blank"` wajib `rel="noopener noreferrer"`.

**Kesepuluh celah ADR-0028 kini tertutup** ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) untuk HSTS, [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) untuk pin rantai pasok, [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) untuk SBOM rilis, [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) untuk analisis statik dan Core Web Vitals lab, sisanya tanpa perubahan postur) — masing-masing bersama pemeriksanya, dan barisnya TETAP di tabel dokumen standar. Dua penutupan terakhir membawa syarat kejujuran yang tidak boleh hilang: ringkasan run CodeQL menyatakan `.astro` tidak dianalisis, dan hasil Lighthouse adalah angka LAB — bukan p75 kunjungan nyata, yang tetap tidak diukur karena RUM ditolak.

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
| Audit konten — feed dan setiap `.xml` | `bun run audit:konten` **setelah** `bun run build` | Setiap `.xml` di keluaran yang bukan `sitemap*.xml` wajib berupa feed Atom yang sah: kelengkapan yang Atom wajibkan, `rel="self"` yang berbunyi alamatnya sendiri, IRI absolut, tanggal RFC 3339, urutan terbaru-dulu, `<updated>` feed = entry terbaru (bukan jam build), entry yang menunjuk halaman yang benar-benar terbit, nama key yang bocor, tautan penemuan-otomatis ber-`title`, dan feed yang tidak masuk sitemap. Berkas `.xml` yang bukan feed **dilaporkan sebagai pelanggaran**, bukan dilewati | Ya — sejak [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md); melewati dirinya bila `dist/` belum ada |
| Gerbang atas gerbang konten | `bun test` | `scripts/audit-konten.mjs` sendiri: tiap keluarga dibuktikan MERAH-dan-HIJAU atas pohon fixture, **mutation-proven**. Ia menutup keadaan di mana keluarga keluaran — termasuk kedua gerbang performa — tidak pernah dieksekusi di repo template karena `dist/client` tidak pernah ada di sini | Ya — sejak 6 Agustus 2026 (celah 10 di [standar performa dan keamanan](standar-performa-dan-keamanan.md)) |
| Audit dokumen | `bun run audit:dokumen` | Tautan markdown ke berkas yang tidak ada (diselesaikan dari letak berkasnya, sehingga aturan tautan `.changesets/` ikut terjaga), indeks ADR yang tidak lengkap dua arah, kolom Status yang tidak setuju dengan ADR-nya, daftar permukaan kilau yang menyimpang dari `global.css`, dan kutipan `ADR-NNNN` yang tidak resolve ke berkasnya dan tidak ditandai milik repo lain | Ya |
| Audit terjemahan | `bun run audit:translation` | Cermin `.id.md` yang basi terhadap sumber Inggris yang hash-nya ia catat, cermin yatim yang sumbernya hilang, dokumen tanpa cermin yang tidak ada di buku besar yang hanya boleh menyusut, dan entri buku besar yang cerminnya kini ada | Ya — sejak [ADR-0039](../adr/0039-english-is-the-source-language.md) |
| Audit graf | `bun run audit:graf` | Artefak `graphify-out/` yang terlacak di luar keempat keluaran bersama, laporan yang tidak sepakat dengan `graph.json`, nama komunitas yang tidak dipilih (nama berkas, placeholder, kembar, atau berbeda antar-artefak), dan korpus yang mengabaikan `.graphifyignore` | Ya — sejak 4 Agustus 2026; melewati dirinya bila `graphify-out/` tidak ada |
| Versi toolchain | `bun test` | Lima nilai versi Bun (`packageManager`, `engines.bun`, dua `bun-version` CI, dua tag `Dockerfile`) yang wajib sepakat, plus digest image yang menempel pada tag yang benar | Ya — sejak [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) |
| SBOM | `bun test` | Generator `scripts/sbom.mjs` sinkron dengan `bun.lock` (mutation-proven), dan langkah SBOM di perilis tidak hilang diam-diam. Kesegaran `sbom.cdx.json` di pohon kerja SENGAJA tidak digerbangi — SBOM memerikan rilis, bukan pohon kerja | Ya — sejak [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) |
| Analisis statik | `.github/workflows/codeql.yml` | Kerentanan pada permukaan JS/TS (lib, config, scripts, server, tests) — terjadwal mingguan + pada perubahan. `.astro` TIDAK dianalisis dan ringkasan run menyatakannya; `tests/analisis-statik.test.mjs` menjaga pernyataan itu tidak dihapus | Ya — sejak [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) |
| Core Web Vitals (lab) | Job `build` CI, `treosh/lighthouse-ci-action` | LCP > 2500 ms, CLS > 0,1, TBT > 200 ms (proksi INP) atas **sampel** `dist/client` (hingga 10 URL, kedalaman 4 — dipilih di `lighthouserc.json`) — hanya berjalan bila situs punya sumber konten; ambang DAN batas cakupannya terpaku ke dokumen lewat `tests/cwv-lab.test.mjs` | Ya — sejak [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md); di template tidak berjalan |
| Permukaan `awcms` | `bun test` | Jalur `/api/v1/…` yang benar-benar dipanggil `src/`, dibandingkan dua arah dengan tabel bertanda di skill integrasi | Ya — sejak ADR-0030 |
| **Peran situs** | `bun test` | `owner` di `permukaanAdmin.peran` (apa pun kapitalisasinya), prefiks yang menelan permukaan publik (`/`, prefiks locale, atau slug tab), deklarasi separuh (rute tanpa peran, atau peran tanpa rute), dan setiap rute `prerender = false` yang prefiksnya tidak dinyatakan `permukaanAdmin` maupun BFF Jualanku — dua pemeriksaan terpisah atas KONFIGURASI dan atas KODE, karena keduanya bisa berselisih dan yang menentukan apa yang disajikan adalah kode | Ya — sejak [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) |
| **Kosakata `news`** | `bun test` | Tab ber-slug `news` yang dibiarkan `urutanSeksi: "manual"` — sebuah permukaan yang mengaku berita di alamatnya dan membantahnya di setiap detailnya. Gerbangnya tidak menuntut tab itu ada; `news` bukan kata yang dipesan di sini | Ya — sejak [ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) |
| Audit dependency | `bun audit --audit-level=low` | Kerentanan rantai build. Dijalankan CI **dan** perilis | Ya |
| CI | `.github/workflows/ci.yml` | Seluruhnya yang ada, pada setiap PR | Ya |

**Dua aturan gambar tetap manual, dan itu disebut terus terang.** Teks di dalam gambar hanya boleh label topik, dan tidak boleh ada lambang atau atribut instansi negara — termasuk di dalam ilustrasi. Tidak ada pemeriksa yang bisa menilai keduanya. Aturan yang tampak terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

**Yang masih di repo rujukan** dan belum di-port: aturan konten khas domain (tautan antar dokumen, sinkronisasi daftar skill). Sisa backlog ada di [README repo ini](../../README.md#what-does-not-exist-yet-an-explicit-backlog-not-an-oversight).

**Aturan baru wajib membawa pemeriksanya.** Aturan yang hanya tertulis di dokumentasi akan dilanggar cepat atau lambat — itu sebabnya gerbang audit ada (ADR-0008 repo rujukan).

Melonggarkan pemeriksa agar gerbang hijau adalah pelanggaran, bukan perbaikan. Bila sebuah aturan memang salah, ubah aturannya secara sadar beserta alasannya di dokumentasi.

## Versioning

`MAJOR.MINOR.PATCH`, tag git `vX.Y.Z` anotatif. Semver dirancang untuk library ber-API, jadi artinya perlu ditetapkan ulang untuk sebuah situs informasi — ADR-0009 repo rujukan melakukannya, dan [ADR-0040](../adr/0040-changeset-menyatakan-bump-semver.md) memakukan penetapan ulang itu di sini:

| Tingkat | Situsnya |
| ------- | -------- |
| `major` | sebuah URL publik, struktur konten, atau kontrak frontmatter **putus** |
| `minor` | pembaca mendapat sesuatu: artikel, tab, locale, atau fitur baru |
| `patch` | perbaikan yang tidak mengubah bentuk situs |

Setiap perubahan yang memengaruhi konten publik, struktur, dependency, atau deployment ditulis sebagai changeset **pada iterasi yang sama**, dilipat ke `CHANGELOG.md` saat rilis.

**Changeset-lah yang menyatakan tingkatnya, dan rilis menurunkan versinya dari situ.** Masing-masing membawa `bump: major | minor | patch`; versi berikutnya adalah bump terbesar di antara yang menunggu. Tingkatnya karena itu dipilih sambil perubahannya ditulis, oleh penulisnya — bukan saat rilis, dari daftar nama berkas, oleh siapa pun yang menjalankan skripnya. `bun run release` masih menerima sebuah tingkat, dan hanya boleh yang **lebih besar**; yang lebih kecil ditolak, karena itu menerbitkan sesuatu yang putus di balik nomor yang menjanjikan sebaliknya.

String versi diurai ketat: awalan `v`, prerelease atau metadata build, dan angka ber-nol-depan masing-masing ditolak dengan menyebut namanya. Aritmetika yang mendahuluinya tidak menolak apa pun dan menjawab `NaN` — cukup untuk menandai sebuah rilis `v0.2.NaN`, yang tidak terurut di mana pun dan membuat rilis *berikutnya* membaca tag yang salah sebagai yang terbaru. Pemeriksanya `tests/versi-changeset.test.mjs`.

Repo ini masih `0.x`, di mana semver sendiri tidak menjanjikan apa pun soal kompatibilitas. Bidang `bump` mencatat niat sekarang supaya catatannya sudah benar pada hari `1.0.0` membuatnya mengikat.

## Graf pengetahuan (`graphify-out/`)

Repo ini melacak indeks graf pengetahuan hasil [graphify](https://github.com/safishamsi/graphify): `graph.json` (data graf), `GRAPH_REPORT.md` (laporan), `manifest.json` (dasar `--update`), dan `cost.json`. Ia dilacak karena berguna dibaca ulang oleh orang dan agen yang baru masuk repo — bukan artefak build, melainkan peta.

**Hanya keempat berkas itu yang terlacak.** Sisanya punya alasan tertulis di `.gitignore` untuk tinggal di luar riwayat: cache spesifik mesin, berkas ber-titik yang selalu intermediate, salinan bertanggal yang menduplikasi artefak hidup di sebelahnya, dan `graph.html` yang berhenti dipancarkan di atas batas node lalu membusuk diam-diam. Ketiga aturan itu ditulis pada 3 Agustus 2026 dan hidup dua hari tanpa pemeriksa; sejak [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) melarang keadaan itu, `bun run audit:graf` menegakkannya.

### Korpus: apa yang diindeks, dan apa yang sengaja tidak

`.graphifyignore` di akar repo menyempitkan korpus. Sintaksnya sintaks `.gitignore`, dibaca **setelah** `.gitignore`, dan hanya bisa mengecualikan lebih — tidak pernah mengembalikan yang sudah dibuang. Menambah baris di sana selalu aman ke satu arah.

`.changesets/` dikecualikan, dan alasannya struktural, bukan selera. Ia menyumbang **171 dari 971 node** (18% graf) dengan 139 edge yang menunjuk sesama changeset dan hanya 39 yang menyeberang: banyak node, hampir tanpa jembatan — gumpalan terpisah. Ia menaikkan jumlah komunitas dari 90 ke 101 dalam satu rebuild, menurunkan kohesinya, dan mengubur komunitas yang berarti. Ia juga **menceritakan ulang** dokumen yang dirangkumnya, sehingga isi yang sama masuk graf dua kali dengan kata berbeda — terlihat langsung sebagai konsep kunci kembar di laporan. Yang hilang karenanya: tidak ada. Rasional setiap keputusan tinggal di `docs/adr/`, dan itu tetap diindeks.

Sebuah rebuild yang dijalankan tanpa `.graphifyignore` memasukkan kembali apa yang dikecualikan. Gerbangnya menangkap itu.

### Nama komunitas wajib dipilih, bukan diwarisi

graphify menamai komunitas secara otomatis dari **node paling terhubung** di dalamnya (`label_communities_by_hub`). Penamaan itu gratis, deterministik, dan tidak pernah membaca komunitasnya — ia hanya menyalin nama berkas terbesar. Empat aturan mengikat nama yang ikut ter-commit:

1. **Bukan nama berkas.** `client.ts`, `BaseLayout.astro`, `package.json` bukan nama komunitas; itu keluaran penamaan otomatis yang tersedia gratis kapan saja.
2. **Bukan placeholder `Community N`.** Komunitas tanpa nama adalah lubang di peta.
3. **Tidak ada dua komunitas bernama sama.** Nama kembar membuat keduanya tak terbedakan oleh setiap konsumen hilir.
4. **`graph.json` dan `GRAPH_REPORT.md` menyebut nama yang sama** untuk komunitas yang sama.

Aturan ini ditulis karena pelanggarannya sudah terjadi dan tidak terlihat oleh siapa pun. Pada 4 Agustus 2026, **60 dari 101 label menempel pada komunitas yang salah** — warisan clustering lama yang tak pernah divalidasi. Komunitas 6 bernama `content-blocks.ts` sementara isinya seluruhnya dari [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md); komunitas 22 bernama `Kontrak BFF /_portal-api/**` sementara pusatnya `Pedoman Perilaku`; tiga komunitas berbeda sama-sama bernama `BaseLayout.astro`.

Cacatnya tidak terlihat karena artefaknya JSON yang sah di sebelah laporan yang rapi, dan tidak satu pun gerbang lain membaca `graphify-out/`. Nama komunitas bukan hiasan: itu yang dibaca `graphify query` dan siapa pun yang memakai graf ini untuk mencari jalan. **Graf yang salah menamai dirinya sendiri lebih berbahaya daripada tidak ada graf, karena ia menjawab dengan percaya diri.**

Penyebab teknisnya sudah ditutup di hulu, di skill graphify: langkah pelabelan kini menulis `.graphify_labels.json.sig` — tanda tangan keanggotaan tiap komunitas — sehingga run berikutnya bisa tahu komunitas mana yang benar-benar berubah. Tanpa sidecar itu graphify jatuh ke membandingkan **jumlah** komunitas, dan setiap run yang mengubah jumlahnya memindahkan seluruh label ke komunitas yang berbeda.

### Kesegaran: dilaporkan, tidak memerahkan gerbang

`bun run audit:graf` mencetak selisih antara `built_at_commit` dan `HEAD`, dan tidak pernah gagal karenanya. Memerahkannya berarti setiap PR yang menyentuh berkas terindeks wajib membawa rebuild bermegabyte — gerbang semahal itu akan dilonggarkan dalam sebulan, persis yang §Gerbang mutu larang. Yang dijaga gerbang ini adalah **kebenaran internal** artefaknya; kapan ia dibangun ulang tetap keputusan sadar, dan catatannya membuat keputusan itu terlihat.

Bangun ulang dengan `/graphify .` (penuh, melabeli ulang seluruh komunitas) atau `/graphify . --update` (inkremental). `graphify cluster-only` **tidak** melabeli ulang: ia memakai kembali label tersimpan dan menamai ulang komunitas yang berubah dengan nama hub — jadi ia bisa menghijaukan kohesi sambil memerahkan gerbang label.

## Dokumentasi

Wajib ada dan wajib sinkron dengan kode:

| Berkas | Isi | Ada di `awcms-astro`? |
| --- | --- | --- |
| `AGENTS.md` | Kontrak kerja teknis yang mengikat seluruh standar dan menunjuk dokumen rincinya | Ya |
| `README.md` | Kenapa situs ini ada, bentuknya, cara menjalankan | Ya |
| `docs/adr/` | Keputusan beserta alasannya | Ya — indeksnya digerbangi dua arah |
| `.claude/skills/` | Standar di atas, di-encode menjadi prosedur yang bisa dijalankan agen AI | Ya — empat skill |
| `docs/ARCHITECTURE.md` | Anatomi setiap folder dan berkas; apa yang sudah ada vs gap | **Tidak.** Perannya dipikul §Struktur README dan docblock tiap berkas |
| `docs/PROJECT_STATE.md` | Keadaan proyek, utang yang diketahui, titik lanjut | **Tidak.** Perannya dipikul §"Yang belum ada" di README dan §Celah di dokumen standar |
| `docs/workflows/` | Cara mengerjakan tugas berulang | **Tidak.** Perannya dipikul `.claude/skills/` — prosedur yang bisa dijalankan mengalahkan prosedur yang harus dibaca dulu |

**Tiga baris terakhir sengaja berbunyi "tidak", bukan dihapus.** Sampai 4 Agustus 2026 tabel ini menuntut ketiganya "wajib ada" untuk sebuah repo `awcms-astro` sementara repo rujukan standar ini — repo ini sendiri — tidak membawa satu pun. Sebuah situs turunan yang membacanya akan membuat tiga berkas kosong untuk memuaskan daftar, dan berkas kosong yang wajib adalah cara paling cepat sebuah daftar berhenti dibaca. Yang benar bukan menghapus barisnya, melainkan mengatakan **siapa yang memikul perannya di sini**.

Yang ditambahkan sejak: [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) — peta ke standar internasional beserta daftar celahnya ([ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md)).

Dokumentasi yang menyimpang dari kode lebih berbahaya daripada tidak ada dokumentasi: ia dipercaya. Karena itu **memperbarui dokumen adalah bagian dari iterasi yang sama**, bukan pekerjaan susulan.
