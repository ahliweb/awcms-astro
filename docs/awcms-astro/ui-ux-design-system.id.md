🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](ui-ux-design-system.md)

<!-- i18n-source-hash: sha256:bad883749144d514a50debf0eb25e62ed35e979f24b8c13168c08968454304f2 -->

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

### Permukaan gelap tetap

Tiga permukaan berwarna gelap di **kedua** tema: pita utilitas di atas masthead, hero beranda, dan footer. Warnanya datang dari kelompok `--gelap-*` tersendiri di `:root` yang tidak ditimpa blok tema mana pun.

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--gelap-bg` | `#090d16` | Latar footer |
| `--gelap-bg-lembut` | `#0b1220` | Pita utilitas |
| `--gelap-teks` | `#f8fafc` | Teks di permukaan itu |
| `--gelap-teks-lembut` | `#cbd5e1` | Tautan dan teks sekunder di sana |
| `--gelap-teks-redup` | `#94a3b8` | Teks redup di sana |
| `--gelap-garis` / `--gelap-garis-kuat` | `rgba(255,255,255,.13)` / `.32` | Garis pemisah, dan garis saat hover |
| `--gelap-aksen` | `#38bdf8` | Tautan di permukaan itu |
| `--gelap-emerald` / `--gelap-emerald-teks` | `#10b981` / `#052e21` | Ajakan utama dan teks di atasnya |

**Ini bukan sekelompok token yang lupa ditemakan.** Gradien hero repo ini sudah bernilai tetap sejak versi pertama `global.css`, dengan satu alasan: masthead dan footer yang berpindah warna di tengah halaman membuat batas atas dan bawah situs berkedip pada setiap navigasi. Kelompok `--gelap-*` hanya memberi keputusan itu sebuah nama, sehingga pita dan footer berhenti menyalin nilainya satu per satu.

Yang datang bersamanya adalah aturan tanpa kekecualian: **setiap warna yang dipakai di dalam permukaan itu harus datang dari kelompok ini juga.** Separuh permukaan yang dikonversi adalah `--text-primary` — `#0f172a` di tema terang — duduk di atas `#090d16`: ada, lolos setiap gerbang, dan secara harfiah tidak terbaca. Itu bukan hipotesis, itu terjadi dua kali saat redesign ini dikerjakan. Teks dan judul footer sendiri disetel di blok scoped `BaseLayout.astro`; komponen yang hanya pernah dirender **di dalam** footer (`DisclaimerNote` varian `footer`, `FormBuletin`) dikonversi lewat aturan turunan di bawah `footer` dalam `global.css`, supaya "footer ini gelap" tetap satu fakta di satu tempat.

Satu jebakan layak disebut karena ia selamat dari jalan pertama: `.disclaimer-footer` adalah pembungkus dua elemen `<p>`, dan aturan elemen `p { color: var(--text-secondary) }` **menargetkan paragraf itu langsung**, jadi ia menang atas warna apa pun yang diwarisi dari pembungkusnya. Mengonversi pembungkusnya saja tidak mengubah apa pun di layar.

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
| `TabNav` | Navigasi utama, menandai aktif dengan `aria-current` | Urutan dari `siteConfig.tabs`. **Pil, bukan tab bergaris bawah**: garis bawah 3px hanya terbaca sebagai "yang ini sedang dibuka" selama bilahnya punya barisnya sendiri, dan ia kini berbagi baris masthead — tempat garis yang sama berbunyi seperti pemisah. Pil membawa keadaannya di dalam dirinya sendiri, jadi ia benar di kedua posisi, dan `aria-current` tetap yang menyatakannya bagi pembaca layar | Nav |
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

### Bingkai halaman

Setiap halaman dibuka oleh tiga pita, dan pita mana yang memuat sebuah kontrol diputuskan oleh apa yang dilakukannya, bukan oleh berapa ruang yang tersisa.

| Pita | Memuat | Kenapa di situ |
| --- | --- | --- |
| Pita utilitas | Tagline situs, pengalih bahasa, pengalih tema | Tidak satu pun dari ketiganya adalah navigasi isi. Ia sengaja **di luar** `<header>` yang sticky: pita status yang ikut menempel akan memakan 38px layar sepanjang gulir, di situs yang mayoritas pembacanya di ponsel |
| Masthead (sticky) | Nama situs, bilah kanal, tautan pencarian | Satu baris, bukan dua. Baris kedua yang isinya hanya bilah kanal membuat setiap halaman dibuka dengan dua baris kromium sebelum satu kata isi pun — sepertiga lipatan pertama di 360px |
| Footer | Identitas, kanal, tautan situs, kontak, formulir buletin, penafian, pita penutup | Strukturnya tidak berubah; ia kini permukaan gelap tetap (lihat §Permukaan gelap tetap) |

Bilah kanal berbagi baris masthead sampai ruang tersisa kurang dari 20rem, lalu turun ke baris sendiri. Di bawah 720px ia juga mengambil `order: 1`, sehingga barisnya terbaca **nama situs · pencarian** dan bilah kanal berada di bawahnya — bukan bilah kanal mengambil seluruh baris kedua dan mendorong pencarian ke baris ketiga.

`order` itu satu-satunya tempat di repo ini yang urutan visual dan urutan DOM-nya berbeda, dan pertukarannya dinyatakan alih-alih dibiarkan ditemukan: fokus keyboard tetap berjalan nama → kanal → pencarian sementara mata membaca nama → pencarian → kanal. Satu elemen berpindah, dan ia berpindah ke tepat di bawah kedua lainnya — bukan ke seberang halaman — dan itu yang menjaganya tetap di dalam WCAG 2.4.3. Elemen keempat di baris itu bukan tambahan gratis; ia keputusan untuk membaca ulang paragraf ini.

Kontrol pencarian adalah **tautan yang berbentuk kotak cari** — kaca pembesar, bidang redam, lebar tetap — dan bukan `<input>`. Bentuknya yang dicari mata pembaca di kepala halaman; perilakunya ditolak dengan alasan di §Tanpa JavaScript, karena kotak yang menelan ketikan lalu tidak melakukan apa pun lebih buruk daripada tidak ada kotak.

### Permukaan beranda

Beranda hasil redesign membawa dua permukaan yang menampilkan isi sungguhan situs, yang tidak dimiliki versi sebelumnya: pembaca yang mendarat di sana tidak bisa melihat satu judul artikel pun tanpa lebih dulu menebak kanal mana yang harus dibuka.

| Permukaan | Yang ditampilkan | Di mana ia berhenti |
| --- | --- | --- |
| Panel terbaru, di dalam hero | Tiga artikel terbaru lintas kanal — nama kanal, tanggal, judul | Hanya dirender bila ada artikel untuk didaftar. Hero menjadi satu kolom bila tidak |
| Pita statistik | Jumlah kanal, jumlah artikel, `updatedDate` termuda di situs | Hanya dirender bila situs punya sedikitnya satu artikel. Sel tanggal dilepas bila tidak ada tanggalnya |
| Sorotan | Satu artikel paling baru, dengan gambarnya sendiri, keterangannya, dan baris "diperbarui" hanya bila ia benar-benar disunting setelah terbit ([ADR-0033](../adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.id.md)) | Hanya dirender bila ada artikel |

Keduanya membaca satu daftar yang sama dan tidak pernah menampilkan artikel yang sama dua kali: sorotan mengambil yang pertama, panel mengambil tiga berikutnya. Urutannya punya **pemutus seri pada slug**, karena dua artikel yang terbit pada detik yang sama akan bertukar tempat antar-build — keluaran statis yang berbeda tanpa ada yang berubah.

**Pita itu hanya memuat angka yang bisa dihitung build ini.** Rancangan yang dikerjakan ulang di sini memuat yang keempat: "Skor Lighthouse 100". Ia tidak ada di sini. Tidak ada apa pun di build yang mengukurnya, jadi ia akan menjadi klaim yang dicetak setiap halaman dan diperiksa tidak seorang pun — kelas cacat yang sama dengan `og:image` yang menunjuk kartu yang tidak pernah dibangkitkan siapa pun, yang sudah pernah ditolak repo ini.

Hero beranda adalah satu-satunya bingkai di repo ini yang **tidak merender placeholder** saat seninya tidak ada. Di tempat lain bingkai kosong menahan tata letak yang tanpanya akan runtuh; di sini panel di bawahnya sudah membawa artikel terbaru, jadi yang ditahan bingkai kosong bukan tata letaknya melainkan perhatian pembaca — sebuah persegi bergaris selebar panel, di lipatan pertama, tepat di atas satu-satunya isi sungguhan yang dibawa beranda. Konvensi penamaan `hero` di bawah `src/assets/` tetap berlaku, dan seninya tetap ditampilkan pada situs yang memasangnya.

### Di mana gaya sebuah komponen tinggal, dan apa yang menegakkannya

`src/styles/global.css` untuk yang dipakai lebih dari satu komponen; gaya milik satu komponen tinggal di `<style>` scoped-nya. Itu sudah menjadi aturan di §Prinsip, dan `bun run audit:aset` yang mengubahnya menjadi sesuatu yang bergigi.

Hero berada di `global.css` sementara `Home.astro` satu-satunya pemakainya. Setiap pembaca setiap halaman artikel, halaman seksi, dan halaman pencarian karena itu mengunduh gaya hero yang halamannya tidak pernah render — dan penambahan lapisan kisi serta rona redesign ini mendorong `/cari/` melewati plafon 36.000 B per halaman atas nama sebuah elemen yang tidak ada di sana. Memindahkan bloknya memulangkan 1.853 B ke **setiap** halaman, bukan hanya ke yang merah.

Gerbang yang sama lalu mencatat apa yang masih salah dan tidak diperbaiki di sini: `BaseLayout.css` berukuran 22.577 B dan masih membawa gaya badan artikel (`.content-body`, `.galeri`, `.video-berita`), tabel biaya, dan akordeon ke setiap halaman yang tidak punya satu pun di antaranya. Itu pekerjaan tersendiri, dengan risikonya sendiri pada badan artikel, dan ia disebut di `scripts/audit-aset.mjs` supaya ia tidak diam-diam menjadi keadaan normal.

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

Mobile-first dari 360px. `padding: 0 1.25rem` milik `.container` sendiri menyisakan lebar bersih persis 320px pada lantai itu. Kartu memakai `grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr))` — `min(320px, 100%)`, bukan `320px` telanjang, karena track yang dipatok ke angka sama dengan ruang tempatnya duduk punya sisa nol: `box-sizing: border-box` menutupinya hari ini, tapi pembulatan sub-piksel atau border yang kelak ditambahkan ke `.card` tidak akan. Bagaimana masthead menata ulang dirinya pada lebar itu ada di §Bingkai halaman. `tests/lebar-360.test.mjs` membaca aritmetika yang sama ini dari CSS dan menolak track atau lebar tetap lain (angka tetap atau rem) yang mencapai lantai ini tanpa jalan keluar yang sama — baik di `global.css` maupun di blok `<style>` komponen/layout/halaman mana pun, itulah yang juga menangkap `.sorotan` di `Home.astro` melakukan hal identik lewat `minmax(20rem, 1fr)`. Ia gerbang statik atas teks CSS, bukan bukti render sungguhan; itu butuh pemeriksaan headless-browser atas halaman yang sudah dibangun.

**Shorthand `padding` pada elemen yang juga membawa `.container` diam-diam menghapus padding samping containernya**, dan kegagalannya tidak terlihat di layar desktop. `.header-top` menulis `padding: 0.85rem 0` selama berbulan-bulan: pada lebar berapa pun di atas `--max-width`, container sudah masuk ke dalam oleh margin otomatisnya sendiri, jadi tidak ada yang tampak salah; di 360px, tempat container selebar layar, nama situs duduk **menempel di tepi kiri kaca** — diukur di `x=0`, bukan ditaksir dari tangkapan layar. Kini ia `padding-block`. Periksa elemen lain mana pun yang membawa `.container` bersama kelasnya sendiri.

**Tabel di badan artikel menggulir sendiri, bukan lewat pembungkus.** Versi sebelumnya paragraf ini menyebut `.table-responsive` "yang disisipkan rehype plugin"; pipeline markdown itu tidak ada lagi di repo ini, dan yang tersisa dari resep itu adalah tabel `min-width: 34rem` tanpa pembungkus penggulung — persis penyebab gulir mendatar di 360px. `src/styles/global.css` karena itu memakai `display: block` + `overflow-x: auto` langsung pada `.content-body table`, tanpa `min-width`. (`renderContentBlocks()` sendiri belum memancarkan tabel sama sekali — `awcms` tidak punya tipe blok tabel — jadi aturan itu menunggu tipe itu ada.)

### Gambar

**Di `awcms-astro` ini `<img>` biasa, bukan `<Image>` dari `astro:assets`** — dan itu keputusan, bukan kelalaian ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)). Seni lokal di-resolve `import.meta.glob` dengan `query: "?url"` menjadi URL string; `astro:assets` mengembalikan `ImageMetadata`, yang mengubah bentuk `ArticleVisual` dan keempat bingkai sekaligus, serta memperlakukan SVG berbeda dari raster — padahal SVG justru format yang gerbang repo ini ditulis untuk membaca. Konsekuensi yang diterima: raster tidak di-encode ulang dan tidak ada `srcset`.

Pemotongan tidak hilang karenanya. Bingkai memotong lewat `object-fit: cover` di CSS, dan `bun run audit:konten` menolak sumber yang bukan `--ratio-visual` sebelum ia sempat terbit — jadi yang terpotong sudah dicegah, bukan sekadar tidak diunduh. Gambar besar di atas lipatan dimuat `eager`, sisanya `lazy`; keduanya ditetapkan satu kali di [`Ilustrasi.astro`](../../src/components/Ilustrasi.astro), bukan di setiap pemanggil.

**Satu rasio untuk seluruh situs, dipakai bingkai maupun sumber.** Di repo ini 16∶9. Bingkai memakai `object-fit: cover`, jadi sumber berasio lain tidak diperkecil — ia dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9 kehilangan 22% teratas, dan judul gambar hampir selalu ada di sana.

Teks di dalam gambar ikut menyusut bersama gambarnya. Pada kartu selebar 320px — viewport 360px — kanvas 800px tampil pada skala 0,40: teks 12px menjadi 4,8px. Tetapkan ambang tipografi dari lebar kartu tersempit, bukan dari tampilan di layar desktop.

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
