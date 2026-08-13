# awcms-astro — Design System

Design token, komponen, dan pola UI standar `awcms-astro`, beserta **pemetaannya ke kosakata design system AWCMS** (`docs/awcms/14_ui_ux_design_system.md` di repo [`ahliweb/awcms`](https://github.com/ahliweb/awcms)).

Pemetaan itu bukan pelengkap. Ia yang membuat perpindahan ke pengelolaan dinamis menjadi pekerjaan mekanis alih-alih penafsiran ulang: satu berkas token diganti, komponennya tidak disentuh.

## Prinsip

Prinsip AWCMS diadaptasi ke konteks situs statis publik. Yang berbeda ditandai.

1. **Terbaca tanpa JavaScript.** Seluruh fungsi inti — navigasi, pengalih bahasa, accordion FAQ, dan seluruh badan artikel — bekerja tanpa JS. Berbeda dari back-office AWCMS yang boleh mengandalkan islands.
2. **State eksplisit.** Setiap halaman punya keadaan terisi, kosong, dan fallback yang terlihat. Situs statis tidak punya loading state, tetapi punya **state fallback terjemahan** yang wajib ditandai ke pembaca.
3. **Aksesibel.** Target WCAG 2.1 AA: kontras cukup di kedua tema, fokus terlihat, navigasi keyboard penuh.
4. **Ringan.** Pembacanya di jaringan yang tidak dapat diandalkan. Anggaran gambar dan JavaScript diperlakukan sebagai batas, bukan saran.
5. **Mobile-first.** Kebalikan dari back-office AWCMS yang desktop-first. Layout dirancang dari 360px ke atas.
6. **Tidak menyamar resmi.** Tidak memakai lambang, logo, atau atribut instansi negara. Batas ini adalah **aturan desain**, bukan sekadar kepatuhan.
7. **Konsisten.** Seluruh halaman memakai token dan komponen yang sama; tidak ada gaya sekali pakai.
8. **Tidak ada gaya di dalam HTML.** Tanpa atribut `style=""`, tanpa blok `<style>` tersisip. Gaya lintas komponen tinggal di `src/styles/global.css`, gaya khas satu komponen di `<style>` scoped miliknya — yang Astro terbitkan sebagai berkas CSS terpisah karena `build.inlineStylesheets` disetel `"never"`. Ini bukan selera: CSP `style-src 'self'` memblokir keduanya, dan halaman kehilangan tata letaknya tanpa satu pun error di build. Dijaga `tests/keluaran-csp.test.mjs`.
9. **Tidak ada skrip di dalam HTML.** Aturan yang sama, konsekuensi yang berbeda: `script-src 'self'` memblokir setiap `<script>` inline, dan yang hilang bukan tata letak melainkan fungsi — tombol salin yang diam, tema yang tidak berganti. Skrip komponen ditulis sebagai `<script>` biasa (dibundel Astro, diterbitkan sebagai berkas karena `vite.build.assetsInlineLimit` disetel `0`); yang harus jalan sebelum paint pertama tinggal di `public/tema.js`. Kebijakannya dikirim penyaji sejak ADR-0019, jadi pelanggaran di sini gagal di produksi, bukan hanya di review.

## Design token

Diimplementasikan sebagai CSS custom properties di `:root` pada `src/styles/global.css`, dengan override tema gelap lewat `:root[data-theme='dark']`.

### Warna

| Token awcms-astro | Terang | Fungsi | Padanan AWCMS |
| --- | --- | --- | --- |
| `--bg-primary` | `#f8fafc` | Latar halaman | `--color-bg` |
| `--bg-surface` | `#ffffff` | Kartu dan panel | `--color-surface` |
| `--bg-subtle` | `#f1f5f9` | Panel sekunder | `--color-surface-2` |
| `--border-color` | `#e2e8f0` | Garis pembatas | `--color-border` |
| `--border-focus` | `#0284c7` | Cincin fokus | `--color-focus` |
| `--text-primary` | `#0f172a` | Teks utama | `--color-text` |
| `--text-secondary` | `#334155` | Teks pendukung | — |
| `--text-muted` | `#64748b` | Teks sekunder | `--color-text-muted` |
| `--accent-primary` | `#0284c7` | Aksi utama, tautan | `--color-primary` |
| `--accent-hover` | `#0369a1` | Keadaan hover | — |
| `--accent-subtle` | `#e0f2fe` | Latar lembut aksen | — |
| `--emerald-primary` | `#059669` | Penanda keberhasilan | `--color-success` |
| `--emerald-subtle` | `#dcfce7` | Latar lembut sukses | — |

### Skala lain

| Kategori | Token | Nilai | Padanan AWCMS |
| --- | --- | --- | --- |
| Font | `--font-sans`, `--font-heading` | `system-ui, -apple-system, …` — `--font-heading` adalah alias `var(--font-sans)`. **Tanpa webfont**: nol `@font-face`, nol origin font | `--font-sans` |
| Radius | `--radius-sm/md/lg/xl` | 6 · 8 · 12 · 16 px | `--radius-sm/md/lg` |
| Shadow | `--shadow-sm/md/lg` | elevasi kartu | `--shadow-sm/md/lg` |
| Lebar | `--max-width` | 1200px | — (kontainer) |
| Breakpoint | 400 · 480 · 640 · 768 · 900 px | media query | `sm/md/lg` |

### Kilau hover

| Token | Nilai tema terang | Nilai tema gelap | Fungsi |
| --- | --- | --- | --- |
| `--kilau-warna` | `rgba(2,132,199,.16)` | `rgba(255,255,255,.10)` | Badan pita cahaya |
| `--kilau-puncak` | `rgba(2,132,199,.34)` | `rgba(255,255,255,.26)` | Puncak pita, di tengah gradien |
| `--kilau-durasi` | `.85s` | sama | Lama satu sapuan |

Di tema terang permukaannya putih, jadi kilau putih tidak akan terlihat — dipakai rona aksen. Komponen yang latar hover-nya **sudah** pekat menimpa kedua token dengan putih: `.share-btn` dan `.chip` di dalam hero. Gradien hero adalah nilai tetap, bukan token, sehingga ia gelap di tema mana pun.

> Kalimat itu sampai 4 Agustus 2026 menyebut `.wilayah-filter-btn` sebagai yang ketiga — permukaan repo rujukan yang **tidak pernah ada di template ini**. Gerbang `bun run audit:dokumen` membandingkan tabel di §Kilau hover dengan penanda di `src/styles/global.css` dan sudah menghapusnya dari sana; ia **tidak** membaca prosa, jadi salinan yang satu ini bertahan satu hari lebih lama. Itu batas gerbangnya, dan disebut supaya tidak dikira lebih luas daripada yang ia periksa.

### Gap terhadap kosakata AWCMS

Token berikut **belum ada** di repo ini. Bukan kelalaian — situs informasi statis tidak punya keadaan yang membutuhkannya. Wajib ditambahkan **sebelum** integrasi dinamis, karena antarmuka pengelolaan pasti memerlukannya:

| Token AWCMS | Untuk apa | Kapan dibutuhkan |
| --- | --- | --- |
| `--color-warning`, `--color-danger`, `--color-info` | Status peringatan, error, informasi | Saat ada form, aksi, atau pesan sistem |
| `--color-*-strong` | Fill solid dengan teks putih di atasnya | Saat ada tombol berisi warna semantik |
| `--font-mono` | Angka, kode, nomor referensi | Saat menampilkan kode bayar atau nomor berkas |
| `--fs-*`, `--sp-*` | Skala tipografi dan spasi bertoken | Saat komponen dibagi lintas repo |
| `--z-*` | Lapis dialog, drawer, toast | Saat ada overlay |
| `--motion-*`, `--ease-*` | Durasi dan easing | Saat ada transisi bertoken |

> **Peringatan kontras.** AWCMS mencatat bahwa token warna polos dengan teks putih di atasnya hanya mencapai 3,19–3,76∶1 pada sebagian kombinasi — di bawah AA. Karena itu keluarga menyediakan varian `-strong`. Repo ini **belum** melakukan audit kontras terukur atas tokennya sendiri. Sebelum token di sini dipakai untuk fill solid, audit itu wajib dijalankan, bukan diasumsikan lolos.

### Theming

```mermaid
flowchart LR
  Sys["prefers-color-scheme"] --> Resolve["public/tema.js — berkas eksternal, sebelum paint"]
  Pref["localStorage 'theme'"] --> Resolve
  Resolve --> Attr["data-theme di <html>"]
  Attr --> Tokens["CSS variables aktif"]
  Tokens --> UI["Seluruh komponen"]
```

Pilihan pengguna di `localStorage` selalu menang; tanpa itu mengikuti preferensi sistem. `data-theme` dipasang **sebelum paint pertama** untuk mencegah kedip. Tanpa JavaScript, tema mengikuti `prefers-color-scheme` lewat media query di CSS — bukan terkunci di terang.

**Ia BUKAN skrip inline, dan bedanya menentukan apakah halamannya hidup.** Sejak [ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md) penyaji mengirim `script-src 'self'` tanpa `'unsafe-inline'`, jadi `<script is:inline>` berisi kode mati di browser pembaca. Skrip ini tinggal di `public/tema.js` dan dimuat `<script src>` **klasik** — bukan bundel Astro, karena bundel Astro selalu `type="module"` dan modul selalu ditunda, sehingga ia tidak bisa berjalan sebelum paint pertama.

Polanya sama dengan AWCMS, satu perbedaan: AWCMS menambahkan fallback ke preferensi tenant dari basis data. Di sini tidak ada tenant, jadi rantainya berhenti di preferensi sistem.

## Komponen

Kolom terakhir menunjukkan padanan yang harus dituju saat integrasi, agar komponen tidak dibangun dua kali dengan nama berbeda.

| Komponen | Peran | Catatan | Padanan AWCMS |
| --- | --- | --- | --- |
| `BaseLayout` | Kerangka halaman: head SEO, hreflang, JSON-LD, skip link, header, footer | Memasang skip link, structured data, dan tombol bagikan untuk **semua** halaman | Layout admin/publik |
| `TabNav` | Navigasi utama, menandai aktif dengan `aria-current` | Urutan dari `siteConfig.tabs` | Nav |
| `Breadcrumb` | Jejak navigasi + JSON-LD `BreadcrumbList` | — | Breadcrumb |
| `LangSwitcher` | Pengalih locale berbasis `<details>` | **Jalan tanpa JavaScript** | i18n switcher |
| `TranslationNotice` | Penanda konten yang jatuh ke locale default | Membawa `lang` yang benar untuk pembaca layar | — (khas awcms-astro) |
| `SyaratList` / `ProcedureSteps` | Render daftar terstruktur dari blok `awcmsAstro` di `contentJson` | Tidak pernah menerima markup mentah | — (khas domain) |
| `BiayaTable` | Tabel data + sumber | Scroll horizontal tanpa membuat `body` ikut scroll | `Table` / `DataGrid` |
| `FaqAccordion` | Accordion `<details>` + JSON-LD `FAQPage` | Tanpa JavaScript | Accordion |
| `DisclaimerNote` | Tiga varian: footer, umum, peringatan | Peringatan kanal resmi wajib di halaman penindakan | `ActionBanner` |
| `ShareButtons` | Bagikan ke kanal sosial + salin tautan | **Tanpa SDK/widget/piksel** | — (khas awcms-astro) |
| `Ilustrasi` | Bingkai gambar bertoken | `src: undefined` adalah keadaan yang DIDUKUNG — ia merender `.visual-placeholder`, bukan bingkai setinggi nol | — (khas awcms-astro) |
| `LangFlag`, `TabNav`, `Breadcrumb`, `TranslationNotice` | Lihat baris di atasnya masing-masing | — | — |

**`UnitLayananTable` dan `WilayahFilter` dihapus dari tabel ini, bukan ditandai "belum dibuat".** Keduanya komponen repo rujukan yang tidak pernah ikut ke template ini, dan `WilayahFilter` bahkan punya baris sendiri di tabel "Tanpa JavaScript" di bawah yang menjanjikan perilaku sebuah komponen yang tidak ada. Sebuah tabel komponen yang mendaftarkan komponen yang tidak ada adalah kelas cacat yang sama dengan `.wilayah-filter-btn` di §Kilau hover — dan keduanya berasal dari repo yang sama.

### Komponen yang belum ada dan akan dibutuhkan

`Button`, `Input`, `FormField`, `Dialog`, `Toast`, `Pagination`, `EmptyState`, `ErrorState`. Seluruhnya baru relevan saat ada antarmuka pengelolaan — bangun mengikuti kontrak AWCMS doc 14, jangan merancang ulang.

## Pola yang mengikat

### Tanpa JavaScript

| Elemen | Tanpa JS |
| --- | --- |
| Navigasi, tautan, breadcrumb | Berfungsi penuh |
| Pengalih bahasa | Terbuka lewat `<details>` |
| Accordion FAQ | Terbuka lewat `<details>` |
| Seluruh badan artikel — syarat, langkah, biaya, dasar hukum | Terender penuh; ia HTML statis, bukan hasil render klien |
| Tema | Mengikuti `prefers-color-scheme` |
| Tombol salin tautan | **Disembunyikan** — tombol yang diam saat diklik lebih buruk daripada tombol yang tidak ada |

### Aksesibilitas

- Skip link ke `#main-content` adalah elemen pertama di dalam `<body>`; teksnya dari katalog PO sehingga ikut berganti bahasa.
- Target sentuh minimal 44px.
- `aria-current` pada navigasi dan pengalih bahasa.
- Status yang berubah diumumkan lewat `role="status"` + `aria-live="polite"`.
- Tabel memakai `th` dengan `scope` benar.
- `prefers-reduced-motion: reduce` dihormati.
- Badan konten yang jatuh ke locale default membawa atribut `lang` yang benar, supaya pembaca layar melafalkannya dengan aturan yang tepat.

Targetnya **WCAG 2.1 AA** untuk permukaan publik dan **WCAG 2.2 AA** untuk setiap permukaan TERAUTENTIKASI bila ia kelak ada — bukan hanya Jualanku ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)), melainkan juga permukaan admin USER yang sebuah situs nyatakan lewat `permukaanAdmin` ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)). Keduanya membawa kontrol, formulir, dan fokus yang berpindah; itu yang menentukan targetnya, bukan nama permukaannya. Dua kriteria 2.2 yang paling mungkin menggigit lebih dulu di antarmuka mana pun yang membawa kontrol: **2.4.11 Focus Not Obscured** dan **2.5.8 Target Size (Minimum)** — yang kedua sudah dipenuhi di sini lewat aturan target sentuh 44px di atas, yang pertama belum pernah diuji karena repo ini belum punya elemen melayang mana pun.

Kontras token warna di repo ini **belum pernah diaudit terukur** (lihat peringatan di §Gap terhadap kosakata AWCMS). Itu satu-satunya butir WCAG di dokumen ini yang tidak bisa dijawab "sudah" — dan ia ditulis begitu alih-alih dibiarkan tampak terjaga.

### Kilau hover — standar interaksi

Setiap tombol dan setiap tautan yang dibungkus card atau area khusus mendapat satu sapuan cahaya yang bergerak **dari pojok kiri atas ke pojok kanan bawah** saat hover maupun fokus keyboard. Sapuan berjalan sekali per interaksi, tidak berulang dan tidak berdenyut.

Daftar permukaan adalah kontrak, bukan kumpulan kebetulan. Ia ditulis satu kali di `src/styles/global.css` di antara penanda `kilau:permukaan:mulai` dan `kilau:permukaan:selesai`. **`bun run audit:dokumen` kini membandingkannya dengan tabel di bawah, dua arah.**

Sebelum gerbang itu ada, paragraf ini berbunyi "pemeriksa itu belum ada, jadi kesesuaiannya dijaga mata pembaca kode — dan itu berarti ia akan menyimpang". Ia memang sudah menyimpang: tabel ini mendaftarkan `.wilayah-filter-btn`, tombol filter wilayah milik repo rujukan yang **tidak pernah ada di template ini** — tidak di CSS, tidak di satu komponen pun. Sebuah baris yang menjanjikan permukaan berkilau pada tombol yang tidak ada tidak akan pernah terlihat salah oleh siapa pun yang membaca dokumennya saja.

<!-- kilau:permukaan:mulai -->
| Permukaan | Dipakai untuk |
| --- | --- |
| `.kilau` | Class umum; komponen baru cukup menambahkannya |
| `.card` | Kartu artikel dan kartu wilayah, seluruhnya berupa `<a>` |
| `.chip` | CTA hero, filter, pengalih tema, pemicu pengalih bahasa |
| `.share-btn` | Tombol berbagi dan tombol salin tautan |
| `.lang-switcher-menu a` | Tautan bahasa di dalam menu |
<!-- kilau:permukaan:selesai -->

Tiga hal yang membuatnya aman, dan ketiganya wajib ikut saat permukaan baru ditambahkan:

| Aturan | Bila dilanggar |
| --- | --- |
| `overflow: hidden` pada host | Pita cahaya menonjol keluar dari sudut membulat |
| `pointer-events: none` pada lapisan sapuan | Lapisan menutupi seluruh host dan menelan klik — fatal pada kartu yang seluruhnya `<a>` |
| Dimatikan penuh saat `prefers-reduced-motion` | Animasi yang hanya dipercepat menjadi 0,01 md tetap berkedip, dan kedipan lebih mengganggu daripada gerakan |

Yang terakhir sengaja tidak menumpang aturan `*` global di blok `prefers-reduced-motion` — aturan itu memangkas durasi, bukan meniadakan animasi. Sapuan dimatikan lewat `content: none` sehingga pseudo-element-nya tidak pernah dibuat.

Sapuan ini murni CSS. Ia tidak menambah satu byte JavaScript pun dan tidak berpengaruh pada halaman tanpa JS.

### Responsif

Mobile-first dari 360px. Kartu memakai `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`.

**Tabel di badan artikel menggulir sendiri, bukan lewat pembungkus.** Versi sebelumnya paragraf ini menyebut `.table-responsive` "yang disisipkan rehype plugin"; pipeline markdown itu tidak ada lagi di repo ini, dan yang tersisa dari resep itu adalah tabel `min-width: 34rem` tanpa pembungkus penggulung — persis penyebab gulir mendatar di 360px. `src/styles/global.css` karena itu memakai `display: block` + `overflow-x: auto` langsung pada `.content-body table`, tanpa `min-width`. (`renderContentBlocks()` sendiri belum memancarkan tabel sama sekali — `awcms` tidak punya tipe blok tabel — jadi aturan itu menunggu tipe itu ada.)

### Gambar

**Di `awcms-astro` ini `<img>` biasa, bukan `<Image>` dari `astro:assets`** — dan itu keputusan, bukan kelalaian ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)). Seni lokal di-resolve `import.meta.glob` dengan `query: "?url"` menjadi URL string; `astro:assets` mengembalikan `ImageMetadata`, yang mengubah bentuk `ArticleVisual` dan keempat bingkai sekaligus, serta memperlakukan SVG berbeda dari raster — padahal SVG justru format yang gerbang repo ini ditulis untuk membaca. Konsekuensi yang diterima: raster tidak di-encode ulang dan tidak ada `srcset`.

Pemotongan tidak hilang karenanya. Bingkai memotong lewat `object-fit: cover` di CSS, dan `bun run audit:konten` menolak sumber yang bukan `--ratio-visual` sebelum ia sempat terbit — jadi yang terpotong sudah dicegah, bukan sekadar tidak diunduh. Gambar besar di atas lipatan dimuat `eager`, sisanya `lazy`; keduanya ditetapkan satu kali di [`Ilustrasi.astro`](../../src/components/Ilustrasi.astro), bukan di setiap pemanggil.

**Satu rasio untuk seluruh situs, dipakai bingkai maupun sumber.** Di repo ini 16∶9. Bingkai memakai `object-fit: cover`, jadi sumber berasio lain tidak diperkecil — ia dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9 kehilangan 22% teratas, dan judul gambar hampir selalu ada di sana.

Teks di dalam gambar ikut menyusut bersama gambarnya. Pada kartu selebar 328px — viewport 360px — kanvas 800px tampil pada skala 0,41: teks 12px menjadi 5px. Tetapkan ambang tipografi dari lebar kartu tersempit, bukan dari tampilan di layar desktop.

Isi gambar tunduk pada ADR-0013 repo rujukan: tanpa lambang instansi, tanpa data tiruan, teks hanya label topik.

## Jalur adopsi token saat integrasi

```mermaid
flowchart TD
  Now["Token awcms-astro<br/>--bg-surface, --text-primary, …"] --> Alias["Tahap 1: alias<br/>--color-surface: var(--bg-surface)"]
  Alias --> Add["Tahap 2: lengkapi gap<br/>warning/danger/info, -strong, mono, fs, sp, z"]
  Add --> Audit["Tahap 3: audit kontras terukur<br/>seluruh kombinasi fill + teks"]
  Audit --> Swap["Tahap 4: komponen pakai nama AWCMS<br/>alias dihapus"]
```

Urutannya penting: **alias lebih dulu, penggantian nama terakhir.** Mengganti nama token sebelum gap-nya lengkap akan meninggalkan komponen yang merujuk token yang belum ada, dan CSS gagal secara diam-diam — tidak ada pesan error, hanya warna yang salah.
