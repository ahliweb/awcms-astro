🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](ui-contract-inventory.md)

<!-- i18n-source-hash: sha256:f3e7f595d3d310ebb090770701dd06df5f03e454ecaa6affa75065f48541ea56 -->

# Inventaris UI, data, dan kontrak konsumen situs SSG

**Laporan riset, 20 November 2026** · isu [#187](https://github.com/ahliweb/awcms-astro/issues/187). Hanya dokumentasi: tidak ada perubahan runtime, rute, dependency, endpoint, atau basis data, dan laporan ini tidak membuka isu implementasi apa pun (isu implementasi menunggu gerbang 9 dulu, di `awcms` untuk kontrak dan di sini untuk layar).

**Pertanyaan.** Untuk setiap layar yang benar-benar dirender repo ini: data apa yang ditampilkan, operasi kontrak `awcms` mana yang menyuplainya, aturan izin dan tenant apa yang berlaku, dan tes mana yang akan merah bila itu berhenti benar? Di mana celah dan drift-nya?

**Jawaban singkat.**

- Setiap rute adalah halaman **statis saat build**, kecuali tiga panggilan dari peramban pembaca (pencarian, beacon kunjungan, buletin). **Tidak ada admin USER dan tidak ada kode BFF**: `permukaanAdmin` kosong dan tidak ada rute yang menyetel `prerender = false`. Keduanya PLANNED, bukan terimplementasi (§6).
- Sumber memanggil **tiga belas** operasi `awcms`. Ketiga belasnya ada di OpenAPI publik `awcms` pada SHA di bawah, dengan metode HTTP yang dipakai repo ini. Tidak ada field respons wajib yang dibaca repo ini yang hilang dari spesifikasi (§4).
- Tes kontrak **tidak membaca dokumen OpenAPI**. Ia mensimulasikan `awcms` dengan `fetch` tiruan yang ditulis tangan, sehingga field yang diganti nama atau dihapus di hulu tidak memerahkan apa pun di sini (§4, G-01).
- Cakupan kuat untuk traversal, tenant, predikat terbit, urutan, media, dan taksonomi, dan **tipis untuk status kegagalan selain beberapa yang dikhususkan** (§7, G-02 sampai G-04).
- Tiga pernyataan dokumentasi sudah basi (§8, D-01 sampai D-03).
- **Tidak dijalankan pada putaran ini:** integrasi terhadap `awcms` nyata (repo ini tidak punya instance dan job `Build` di CI dilewati tanpa `AWCMS_API_URL`) dan gerbang axe di peramban (revisi Chromium tidak ada secara lokal). Keduanya dinyatakan, tidak diasumsikan (§2).

## 1. Sumber dan metode

| Butir | Nilai |
| --- | --- |
| `awcms-astro` | `main` pada `02c71f7fadd2fbb887baed5cada73238f4de4fee` (19 November 2026, merge #185) |
| `awcms` | `main` pada `765e52c7aca35e91a57ed24fc04a035176a32c95` (19 November 2026) |
| Spesifikasi yang dibaca | `openapi/awcms-public-api.openapi.yaml` di `awcms` pada SHA itu, `info.version` `0.1.0`, diurai dengan pemuat YAML dan dibandingkan field demi field dengan kode konsumen |
| Kelas bukti | **VERIFIED**: path sumber ditambah tes yang akan gagal, atau perintah yang dijalankan di sini beserta hasilnya. **ASSUMED**: dinyatakan komentar, dokumen, atau ADR, tidak diperiksa oleh kode, tes, atau eksekusi. **PLANNED**: didokumentasikan sebagai rencana, belum ada kode. **DEFERRED**: ditunda secara eksplisit oleh keputusan tercatat |

Semua di bawah diklasifikasikan dengan keempat kata itu. Baris VERIFIED menyebut buktinya; baris tanpa tes menyatakannya.

## 2. Yang dijalankan, dan yang tidak

| Perintah | Hasil |
| --- | --- |
| `bun test` pada baseline | 978 tes di 48 berkas: 960 lolos, 18 dilewati, 0 gagal. Ke-18 yang dilewati berasal dari tiga blok `describe.skipIf` yang butuh keluaran build (blok itu berjalan, dan lolos, setelah build tiruan di bawah): `tests/keluaran-csp.test.mjs`, `tests/aksesibilitas.test.mjs` ("build output carries the panel") dan `tests/penyaji.test.mjs` ("artefak produksi menyajikan hasil build") |
| `bun run check` (lockfile + `astro check`) | 0 error, 0 peringatan, 6 petunjuk |
| `bun run test:a11y` | Build terhadap server tiruan **berhasil** (`e2e/awcms-tiruan.mjs`, 28 berkas HTML). Eksekusi Playwright **gagal dimulai**: Chromium revisi 1254 tidak terpasang di mesin ini (yang ada 1248 dan 1255). **Tidak ada hasil axe yang diperoleh**, sehingga §7 melaporkan daftar halaman axe seperti terbaca di `e2e/a11y.axe.mjs`, bukan sebagai lolos |
| `awcms` nyata | **Tidak tersedia.** Repo template ini tidak punya instance; job `Build` di CI hanya jalan bila `vars.AWCMS_API_URL` terisi dan dilewati pada eksekusi baseline. Tidak ada klaim di bawah yang bergantung pada instance nyata yang menjawab |

## 3. Layar dan rute

Statis berarti dirender sekali saat build dari `getStaticPaths` dan lapisan data; peramban pembaca memanggil `awcms` hanya di tempat yang disebut §5. `[lang]` adalah setiap locale berprefiks (`en` hari ini); `id` adalah bawaan dan tanpa prefiks.

| Rute | Menampilkan | Operasi kontrak | Izin / tenant | Status | Bukti |
| --- | --- | --- | --- | --- | --- |
| `/` dan `/{lang}/` | artikel utama seksi, identitas situs, menu dan widget footer | posts, media objects, site-profile, menus, widgets | izin baca di bawah; tenant dari token mesin | VERIFIED | `src/components/views/Home.astro` lewat `getArticles` di `src/lib/content.ts`; `tests/kontrak-awcms.test.mjs`, `tests/identitas-situs.test.mjs`, `tests/menu-widget.test.mjs` |
| `/{tab}/` dan `/{lang}/{tab}/`, `…/halaman/{n}/` | kartu artikel satu seksi, halaman berbatas, tautan feed | posts (seksi dari term atau sidecar), media objects | `blog_content.posts.read`, `media_library.media.read` | VERIFIED | `src/components/views/TabIndex.astro`, `src/pages/[tab]/halaman/[nomor].astro`; `tests/paginasi.test.mjs` (halaman 2..N, kanonik ke dirinya), `tests/kontrak-awcms.test.mjs` ("urutan seksi") |
| `/{tab}/{slug}/` dan `/{lang}/{tab}/{slug}/` | artikel: judul, badan, byline, tanggal, gambar, kategori dan tag, terkait, kartu share | posts (`view=full`), media objects, terms | sama | VERIFIED | `src/layouts/ArtikelLayout.astro`, `src/lib/content.ts`; `tests/kontrak-awcms.test.mjs` ("badan artikel datang dari kolom kanonik", "byline penulis", "gambar artikel dari media awcms", "kartu share per artikel") |
| `/{tab}/feed.xml`, `/{lang}/{tab}/feed.xml` | feed Atom sebuah seksi | posts, media objects | sama | VERIFIED, **mati secara bawaan** (template menerbitkan nol feed) | `src/lib/feed-seksi.ts`; `tests/feed.test.mjs`, `tests/kontrak-awcms.test.mjs` ("template ini menerbitkan NOL feed") |
| `/kategori/{slug}/`, `/tag/{slug}/` (+ `halaman/{n}/`, + `[lang]`) | arsip taksonomi term yang dipakai | terms, posts (`termIds`) | `blog_content.taxonomies.read` | VERIFIED | `src/lib/arsip-taksonomi.ts`; `tests/arsip-taksonomi.test.mjs` |
| `/cari/`, `/{lang}/cari/` | form pencarian, hasil, facet | search query dan suggest, dipanggil dari peramban pembaca (§5) | anonim; `awcms` menentukan tenant dari permintaan, repo ini tidak mengirim header tenant | VERIFIED markup dan bentuk panggilan, **bukan** state runtime | `src/components/views/HalamanCari.astro`; `tests/kotak-cari.test.mjs`, `tests/pencarian.test.mjs` |
| `/privasi/`, `/{lang}/privasi/` | pernyataan privasi, pengungkapan beacon | tidak ada | tidak ada | VERIFIED | `src/components/views/HalamanPrivasi.astro`; tidak ada tes yang menjalankan halamannya sendiri (`tests/beacon.test.mjs` mencakup beacon, dan `e2e/a11y.axe.mjs` mendaftar halamannya) |
| `/sitemap/`, `sitemap-index.xml`, `robots.txt` | sitemap HTML dan XML | posts (hanya daftar) | sama dengan posts | VERIFIED | `src/components/views/SitemapView.astro`, `src/pages/robots.txt.ts`, `astro.config.mjs`; `bun run audit:konten` (butuh build, tidak dijalankan di sini) |
| `/newsletter/confirm/`, `/newsletter/unsubscribe/` | halaman token; mengirim token saat klik | newsletter confirm dan unsubscribe (§5) | anonim; `awcms` menentukan tenant dari permintaan | VERIFIED, **dibangun walau buletin mati** (lalu menampilkan kalimat netral) | `src/components/views/HalamanTokenBuletin.astro`; `tests/newsletter.test.mjs` ("the token page sends nothing until a human acts") |
| `/404`, `/{lang}/404` | tidak ditemukan | tidak ada | tidak ada | VERIFIED | `src/components/views/NotFound.astro` |
| Setiap halaman: header, footer, pengalih bahasa, panel preferensi baca | identitas, menu, widget; panel hanya lokal | site-profile, menus, widgets, media objects | `site_profile.profile.read`, `blog_content.menus.read`, `blog_content.widgets.read` | VERIFIED | `src/layouts/BaseLayout.astro`; `src/components/PanelAksesibilitas.astro` hanya memakai kunci `localStorage` `awcms-a11y` (`tests/aksesibilitas.test.mjs`) |

**Mode render.** `astro.config.mjs` menyetel `output: "static"` dan memasang adapter Node hanya untuk menyajikan build. Tidak ada berkas di `src/pages/` yang menyetel `prerender`. VERIFIED oleh `tests/peran-situs.test.mjs` ("template ini tidak punya satu pun rute on-demand", "tidak ada rute `prerender = false` yang tidak dideklarasikan").

## 4. Operasi: spesifikasi, konsumen, drift

Ketiga belas operasi ditemukan di spesifikasi pada SHA `awcms` di atas. "Gerbang" adalah izin yang disebut teks spesifikasi; tenant berasal dari token mesin untuk yang berjalan saat build (`tests/kontrak-awcms.test.mjs`, "tenant diturunkan dari token").

| Operasi (metode) | Konsumen | Gerbang spesifikasi | Field yang ditawarkan spesifikasi tetapi diabaikan repo ini | Status |
| --- | --- | --- | --- | --- |
| `/api/v1/blog/posts` (GET) | `src/lib/content.ts` | `blog_content.posts.read` | `seoTitle`, `scheduledAt`, `unpublishAt`, `institutionIds`, `regionCode`, `redirectCapture`, `autoInternalTagLinksDisabled` | VERIFIED; `seoTitle` dibaca sejak #195, lihat G-05 |
| `/api/v1/media/objects` (GET) | `src/lib/awcms/media.ts` | `media_library.media.read` | `creditLine`, `sourceName`, `copyrightStatus`, `sizeBytes` (tipe konsumen menyimpan enam field: id, URL publik, teks alt, tipe MIME, lebar, tinggi) | VERIFIED |
| `/api/v1/media/public-origin` (GET) | `src/lib/awcms/media.ts`, `scripts/asal-media.mjs` | `media_library.media.read` | tidak ada | VERIFIED |
| `/api/v1/site-profile/composed` (GET) | `src/lib/awcms/profil.ts` | `site_profile.profile.read` | `updatedAt` | VERIFIED |
| `/api/v1/blog/terms` (GET) | `src/lib/awcms/taksonomi.ts` | `blog_content.taxonomies.read` | `parentId`, `description` | VERIFIED |
| `/api/v1/blog/menus` (GET) | `src/lib/awcms/navigasi.ts` | `blog_content.menus.read` | `itemsTruncated` | VERIFIED, lihat G-06 |
| `/api/v1/blog/widgets` (GET) | `src/lib/awcms/navigasi.ts` | `blog_content.widgets.read` | tidak ada | VERIFIED |
| `/api/v1/site-search/query` (GET) | `src/lib/pencarian.ts`, `HalamanCari.astro` | anonim (429 terdokumentasi) | `reason` (`empty`, `too_short`, `too_long`) | VERIFIED, lihat G-07 |
| `/api/v1/site-search/suggest` (GET) | sama | anonim | tidak ada | VERIFIED |
| `/api/v1/analytics/collect` (POST) | `src/lib/beacon.ts`, `src/components/BeaconKunjungan.astro` | anonim (202, 400, 413) | tidak ada | VERIFIED |
| `/api/v1/newsletter/subscribe` (POST) | `src/lib/newsletter.ts` | anonim (200, 400, 429) | tidak ada | VERIFIED |
| `/api/v1/newsletter/confirm` (POST) | sama | anonim | tidak ada | VERIFIED |
| `/api/v1/newsletter/unsubscribe` (POST) | sama | anonim | tidak ada | VERIFIED |

**Arti "VERIFIED" untuk tabel ini.** Operasinya ada di hulu dengan metode itu, dan nama field konsumen cocok dengan spesifikasi. Ia **tidak** berarti ada tes yang membandingkannya: lihat G-01. Himpunan path yang dipanggil sumber dijaga dua arah terhadap tabel bertanda di `.claude/skills/awcms-astro-integrasi/SKILL.md` oleh `tests/kontrak-awcms.test.mjs` ("kode sumber memanggil tepat tiga belas permukaan" dan tes tabelnya).

**Penulisan.** Dua POST keluar dari peramban pembaca (beacon dan buletin), keduanya anonim, tanpa kredensial, ke endpoint publik; `tests/tanpa-backend.test.mjs` mengizinkan tepat kedua berkas itu memancarkan `method` selain GET dan menegaskan tidak ada kredensial yang ikut. Kelas token build sendiri baca-saja. `AGENTS.md` mengatakan "repo ini membaca `awcms`; ia tidak menulis" tentang **build**, dan itu benar.

## 5. Panggilan peramban pembaca (runtime)

| Panggilan | State yang dimiliki UI | Diuji bagaimana |
| --- | --- | --- |
| Search query dan suggest | mulai, mencari, hasil, kosong, galat; "muat lagi" lewat `nextCursor` | markup dan bentuk panggilan lewat teks sumber (`tests/kotak-cari.test.mjs`: tanpa argumen kedua `fetch`, tanpa `credentials`, tanpa jalur HTML mentah, setiap `<template>` ada, `<noscript>` menyebut yang dibutuhkan); logika URL dan snippet oleh `tests/pencarian.test.mjs`. **Tidak ada tes yang menjalankan state-nya di peramban.** Kode `429` menampilkan teks galat yang sama dengan kegagalan lain |
| Beacon kunjungan | tidak ada yang terlihat, memang disengaja | `tests/beacon.test.mjs`: batas muatan sama dengan `awcms`, `content-type: application/json` ada, inert tanpa deklarasi |
| Buletin subscribe, confirm, unsubscribe | diterima (netral), tak valid, terlalu sering, gagal, mengirim | `tests/newsletter.test.mjs`: 400, 429, 5xx, 200 tak terurai, dan preflight terblokir masing-masing punya hasilnya sendiri; token dikirim saat klik, tidak pernah saat dimuat |

## 6. Permukaan terautentikasi: admin USER dan BFF

| Permukaan | Status | Bukti |
| --- | --- | --- |
| Admin USER lewat `permukaanAdmin` | **PLANNED.** Dinyatakan boleh oleh ADR-0034, **tanpa kode**. `permukaanAdmin.prefiks` dan `.peran` adalah larik kosong di `src/config/site.ts` | `tests/peran-situs.test.mjs` ("template ini TIDAK menyatakan satu pun permukaan admin") |
| BFF portal marketplace (`/penjual/**`, `/affiliate/**`, `/_portal-api/**`) | **PLANNED**, tertahan di balik prasyarat `docs/awcms-astro/portal-bff/04-kesiapan.md`. Fase roadmap F3, status di tabel roadmap, kriteria keluar masih "diusulkan pemilik" | tidak ada string `_portal-api` atau BFF di `src/`, `server/`; `docs/roadmap.md` |
| Klien lead publik, consent, dan real-time | **PLANNED** oleh `docs/crm-public-ux-contract.md` dan `docs/bun-realtime-client-boundary.md`, bertanda "dokumen usulan" di sana | dokumen-dokumen itu; tidak diulang di sini |

Tidak ada layar di §3 yang merupakan layar admin USER atau BFF, dan tidak ada baris yang mengklaim sebaliknya. Pembacaan ADR-0057 (Diterima 2026-11-20; ia Proposed pada SHA baseline) mempertahankan aturan yang sama: rilis permukaan semacam itu butuh kapabilitas nyata di `awcms`.

## 7. Inventaris tes

### 7.1 Tercakup

| Area | Berkas | Yang dibuktikan |
| --- | --- | --- |
| Tenant | `tests/kontrak-awcms.test.mjs` | tenant diturunkan dari token; `AWCMS_TENANT_ID` yang berbeda menggagalkan build; variabel lama ditolak |
| Traversal | sama | traversal cursor melewati satu halaman; draft dan non-publik tidak pernah terbit; `view=full` yang diabaikan `awcms` menggagalkan build; `awcms` yang diam menggagalkan build (`TIMEOUT`); batas waktu yang tak terbaca ditolak (`CONFIG_INVALID`); cursor yang tidak maju melempar; korpus 25.029 artikel muat |
| Predikat terbit dan urutan | sama | tanpa `publishedAt`, tanggal jauh di masa depan, dan tanggal yang tak terurai; nol post yang bisa terbit menggagalkan build; urutan seksi menurut urutan redaksi atau tanggal |
| Media | sama | id yang hilang menjadi placeholder; semua id hilang menggagalkan build; lebih dari 100 id dipecah; di-resolve sekali per build |
| Taksonomi | sama, `tests/arsip-taksonomi.test.mjs` | term tertempatkan atau disebut namanya bila tidak; nol dari N tertempatkan menggagalkan build; kosakata kosong bukan kegagalan; respons tanpa `terms` gagal dengan menyebut endpoint |
| Identitas | `tests/identitas-situs.test.mjs` | 403 dan 404 jatuh ke cadangan dan build berlanjut; id media yang tidak resolve tidak merender apa pun |
| Navigasi | `tests/menu-widget.test.mjs` | resolusi item, sarang, payload cacat menjadi daftar kosong, `bodyText` dirender sebagai teks |
| Paginasi, feed | `tests/paginasi.test.mjs`, `tests/feed.test.mjs` | halaman berbatas, kanonik ke dirinya, feed berbatas |
| Peran | `tests/peran-situs.test.mjs`, `tests/tanpa-backend.test.mjs` | nol permukaan admin; tidak ada rute on-demand yang tak dideklarasikan; tidak ada dependency backend, `method` non-GET, atau artefak persistensi |
| Keluaran | `tests/keluaran-csp.test.mjs`, `tests/penyaji.test.mjs`, `bun run audit:konten` | butuh build; dilewati di sini tanpanya |
| Aksesibilitas | `tests/aksesibilitas.test.mjs`, `tests/aksesibilitas-halaman.test.mjs`; `e2e/a11y.axe.mjs` di CI | gerbang statis; halaman axe: beranda (id, en), daftar seksi, artikel (id, en), kategori, tag, pencarian kosong, pencarian dengan hasil, privasi, sitemap, di tema terang dan gelap, ditambah mode panel dan 360 px |

### 7.2 Kosong atau tipis

| Jalur | State | Catatan |
| --- | --- | --- |
| Build terhadap `awcms` nyata | **kosong** di repo ini | dilewati tanpa `AWCMS_API_URL` |
| Kontrak terhadap dokumen OpenAPI | **kosong** | tidak ada tes yang membaca spesifikasi (G-01) |
| `AwcmsApiError` untuk `401`, `403` pada posts, `5xx`, badan non-JSON, koneksi ditolak (`UNREACHABLE`), `AWCMS_API_URL` tidak disetel (`CONFIG_MISSING`) | **kosong**; hanya `TIMEOUT` dan `CONFIG_INVALID` yang dijalankan | `src/lib/awcms/client.ts` (G-02) |
| Fallback `403`/`404` untuk menu, widget, dan terms | **tipis**: terms hanya ditegaskan lewat teks sumber (`tests/arsip-taksonomi.test.mjs`, "403 dan 404 saja yang jatuh ke fallback"), menu dan widget tak punya tes perilaku; identitas berupa tes perilaku | G-03 |
| State runtime pencarian (galat, `429`, `reason`) di peramban | **kosong** | G-04 |
| axe untuk halaman token, 404, halaman berpaginasi, `/en/cari/` | **kosong**, tidak ada di daftar halaman `e2e/a11y.axe.mjs` | G-08 |
| Tes tenant negatif untuk panggilan pembaca | tidak berlaku di sini | tenant adalah keputusan `awcms` dari permintaan (tidak diuji di repo ini) |

## 8. Drift dan celah

| ID | Temuan | Kelas | Bukti | Pemilik perbaikan |
| --- | --- | --- | --- | --- |
| G-01 | Tidak ada tes yang membandingkan fixture konsumen dengan skema OpenAPI; field hulu yang diganti nama atau dihapus tak terlihat sampai build nyata | celah | §4, §7.2 | **Diputuskan 2026-11-20 (pemilik):** snapshot berada di sisi `awcms` sebagai opsi C′, yaitu generator di repo-nya dan paket fixture terpatok yang diterbitkan untuk konsumen (ADR `awcms` untuk C′, issue awcms#1379; belum ada nomor ADR). Repo ini mengonsumsi paket itu; implementasinya isu backlog [#194](https://github.com/ahliweb/awcms-astro/issues/194), menunggu gerbang 9 dan paket tersebut |
| G-02 | Status kegagalan `awcmsGet` selain timeout dan konfigurasi salah tidak diuji | celah | `src/lib/awcms/client.ts` | di sini |
| G-03 | Fallback `403`/`404` untuk menu dan widget tidak diuji, terms hanya lewat teks sumber | celah | `src/lib/awcms/navigasi.ts`, `src/lib/awcms/taksonomi.ts` | di sini |
| G-04 | Galat dan `429` pencarian tampak sama bagi pembaca, dan `reason` tidak dibaca, sehingga "kueri terlalu pendek" terbaca "tidak ada hasil" | drift, rendah | `src/components/views/HalamanCari.astro` | di sini; kontrak sudah mendefinisikan keduanya |
| G-05 | `seoTitle` tidak pernah dibaca: `<title>` artikel adalah judulnya, sebuah tanda pipa, dan nama seksi, jadi judul SEO yang diisi editor tidak berpengaruh. Field post lain yang tak terpakai (`scheduledAt`, `unpublishAt`) adalah urusan sisi server | drift | `src/layouts/ArtikelLayout.astro` (`pageTitle`), spesifikasi `seoTitle` | **Diputuskan 2026-11-20 (pemilik): dikonsumsi.** `seoTitle` tidak kosong dari API menjadi `<title>` artikel; kosong atau tidak ada kembali ke judul plus seksi. Diimplementasikan oleh [#195](https://github.com/ahliweb/awcms-astro/pull/195) (menutup #193), di-merge 2026-11-20 |
| G-06 | `itemsTruncated` pada menu tidak dibaca; menu lama di atas 200 item hanya merender 200 pertama tanpa sinyal | drift, rendah | `src/lib/awcms/navigasi.ts` | di sini |
| G-07 | `awcms` tiruan ditulis tangan dan mencakup sembilan permintaan yang dibuat build dan halaman pencarian; ia membuktikan markup, bukan kontrak (header-nya menyatakan itu) | batas yang diketahui | `e2e/awcms-tiruan.mjs` | tidak ada; dicatat agar tak dikira mock |
| G-08 | Daftar halaman axe tidak memuat halaman token, 404, halaman berpaginasi, dan `/en/cari/` | celah | `e2e/a11y.axe.mjs` | di sini |

Dokumentasi basi, ditemukan saat membaca dan **tidak** diperbaiki di laporan ini (dokumen milik isunya sendiri agar tidak bentrok dengan pekerjaan dokumentasi yang terbuka):

| ID | Pernyataan | Kenyataan |
| --- | --- | --- |
| D-01 | `AGENTS.md`, `docs/awcms-astro/permukaan-admin-user.md` (dan cermin) menyebut gerbang mengeraskan permukaan yang dipanggil build menjadi "tepat tiga" | `tests/kontrak-awcms.test.mjs` mengeraskan **tiga belas** |
| D-02 | Komentar di atas pengecualian kedua di `tests/tanpa-backend.test.mjs` menyebut `newsletterAktif` di-hard-code `false` | `src/config/site.ts` menurunkannya dari `SITE_NEWSLETTER` dan asal pencarian; tes tetap menegaskan nilainya false di template |
| D-03 | Butir `docs/awcms-astro/checklist-repo-baru.md` tentang permukaan `awcms` menyebut "tepat tiga" | sama dengan D-01 |

## 9. Rencana tes yang disarankan, kesiapan, dan risiko

Kandidat backlog, masing-masing S atau M dan tidak tumpang tindih; tidak ada yang dibuka sebagai isu oleh laporan ini (isu implementasi menunggu gerbang 9):

| Kandidat | Ukuran | Menutup | Perlu dulu |
| --- | --- | --- | --- |
| Tes status kegagalan klien (`401`, `403`, `5xx`, non-JSON, `UNREACHABLE`, `CONFIG_MISSING`) | S | G-02 | tidak ada |
| Tes perilaku fallback `403`/`404` untuk menu, widget, terms | S | G-03 | tidak ada |
| Tes state pencarian di setelan Playwright yang ada, dengan teks `429` tersendiri dan penanganan `reason` | M | G-04 | keputusan UX untuk teks `429` dan `reason` |
| ~~Terapkan `seoTitle`~~ (selesai, #195) dan putuskan `itemsTruncated` | S masing-masing | G-05, G-06 | keputusan hanya untuk `itemsTruncated` |
| Daftar halaman axe diperluas | S | G-08 | rute tiruan untuk halaman yang kurang |
| Pemeriksaan kontrak terhadap OpenAPI | M | G-01 | Diputuskan: paket fixture terpatok dari `awcms` (opsi C′, ADR-0167 `awcms`, issue awcms#1379), backlog [#194](https://github.com/ahliweb/awcms-astro/issues/194); menunggu gerbang 9 dan paketnya; jangan menyalin kode hulu ke sini |
| Perbaiki D-01 sampai D-03 | S | D-01..03 | setelah PR #188 mendarat, agar tidak menyunting baris yang sama |

**Definition of ready untuk layar baru di sini:** sumber datanya adalah operasi bernama di spesifikasi; izinnya yang disebut spesifikasi; ia menyatakan apa yang ditampilkan untuk kosong, galat, dan tak tersedia saat build; ia menyebut tesnya; dan ia konsumen kapabilitas `awcms` yang sudah ada atau yang kontraknya disepakati di hulu.

**Risiko keamanan dan privasi yang terlihat, tidak ada yang butuh perubahan runtime oleh laporan ini:** token build baca-saja dan panggilan beacon serta buletin anonim (terverifikasi); beacon butuh kode tenant yang tidak bisa diperiksa build untuk `rawIpEnabled` (dinyatakan di `src/config/site.ts`); salinan statis memegang data yang kelak bisa dihapus `awcms` (dinyatakan di baris `awcms` ADR-0094 pada `.claude/skills/awcms-astro-integrasi/SKILL.md`); panggilan peramban pembaca gagal di peramban orang asing, bukan di build (G-04, G-07).

**Penempatan.** Perubahan backend generik ke `awcms`; UI konsumen ke sini. Non-duplikasi diperiksa dengan membaca bahwa tidak ada berkas `src/` yang menyimpan data, tidak ada panggilan non-GET yang membawa token build, dan setiap kapabilitas yang disebut berada di hulu.

## Rujukan

- [`tests/kontrak-awcms.test.mjs`](../tests/kontrak-awcms.test.mjs), [`tests/tanpa-backend.test.mjs`](../tests/tanpa-backend.test.mjs), [`tests/peran-situs.test.mjs`](../tests/peran-situs.test.mjs)
- [ADR-0014](adr/0014-rendering-campuran-dan-bff-portal.id.md), [ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md), [ADR-0038](adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.id.md), [ADR-0043](adr/0043-the-readers-browser-calls-awcms-and-nothing-else-changes.id.md), [ADR-0049](adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.id.md)
- [`docs/awcms-astro/integrasi-awcms.md`](awcms-astro/integrasi-awcms.id.md), [`docs/roadmap.md`](roadmap.id.md)
- `awcms` ADR-0156 (alur v2: inventaris data per layar dan mock yang dihasilkan), `awcms` ADR-0065 (kontrak konsumen yang dibekukan)

## Changelog

### 2026-11-20 - v1.1.1

- G-05 ditandai sudah diimplementasikan oleh #195 (`seoTitle` dikonsumsi, di-merge 2026-11-20); baris tindak lanjut dan baris endpoint diperbarui. Temuan v1.0.0 tidak berubah. Keputusan C′ kini ADR-0167 `awcms` (Diterima 2026-11-20).

### 2026-11-20 - v1.1.0

- Mencatat keputusan pemilik 20 November 2026: G-01 (snapshot di sisi `awcms`, opsi C′; repo ini mengonsumsi paket fixture terpatok, backlog #194), G-05 (`seoTitle` dikonsumsi, #193), dan ADR-0057 Diterima. Temuan dan bukti v1.0.0 tidak berubah.

### 2026-11-20 - v1.0.0

- Laporan pertama, dari isu #187, pada SHA di §1.
