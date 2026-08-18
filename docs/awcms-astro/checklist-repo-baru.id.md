🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](checklist-repo-baru.md)

<!-- i18n-source-hash: sha256:5f56c894d694e9e7c0605d1d152aaab6a6ea41cb8091055c2b4d3ecb08e25f1f -->

# Memulai Situs Baru di Atas awcms-astro

Langkah menurunkan repo baru dari standar ini. Urutannya disengaja: kontrak lebih dulu, konten berikutnya, tampilan terakhir.

Prasyarat: baca [`README.md`](README.md) untuk memastikan `awcms-astro` memang pilihan yang tepat, dan [`standar-teknis.md`](standar-teknis.md) untuk aturan yang mengikat.

## 1. Buat repo dari template

`ahliweb/awcms-astro` adalah **template repository** GitHub: tombol **"Use this template"** membuat repo baru berisi seluruh kerangkanya dengan riwayat commit yang bersih. Tidak ada langkah salin-tempel, dan tidak ada berkas yang tertinggal karena seseorang lupa menyalinnya — cara lama, dan cara repo ini sendiri pernah mewarisi indeks ADR milik repo lain.

Yang ikut terbawa dan **harus dikosongkan sebelum commit pertama**, karena isinya riwayat template dan bukan riwayat situs kamu:

- [ ] `.changesets/*.md` — hapus seluruh berkas kecuali `README.md`.
- [ ] `CHANGELOG.md` — kosongkan; ia riwayat rilis template.
- [ ] `docs/adr/00*.md` + tabel di `docs/adr/README.md` — keputusan template ini, bukan keputusan situs kamu. Mulai penomoranmu sendiri dari `0001`; `bun run audit:dokumen` menuntut tabel dan berkasnya cocok dua arah, jadi menghapus satu tanpa yang lain memerahkan CI.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, dan `version` (kembalikan ke `0.1.0`).
- [ ] `graphify-out/` — artefak analisis repo template; hapus, dan tambahkan ke `.gitignore` bila kamu tidak memakai perkakasnya.

Yang **tidak** perlu disentuh: `src/lib/`, `src/layouts/`, `src/components/`, `src/styles/global.css`, `scripts/`, `tests/`, `server/`, `.github/`. Itulah kerangkanya.

## 2. Tetapkan kontrak sebelum menulis satu artikel pun

- [ ] `src/config/site.ts` — nama, domain, `siteUrl`, daftar locale, navigasi utama beserta urutannya, dan **`urutanSeksi` untuk setiap tab**.
- [ ] **Putuskan: situs ini publik saja, atau publik + admin user?** Bawaannya publik saja (`permukaanAdmin` kosong), dan itu jawaban yang benar untuk hampir semua situs. Bila situsmu butuh permukaan tempat penulis atau peninjau mengerjakan bagiannya sendiri, nyatakan di `permukaanAdmin` — prefiks rute DAN kode peran, keduanya sekaligus. Tiga hal yang akan memerahkan `bun test` bila terlewat ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)): `owner` di daftar peran (admin utama tetap milik `awcms`), prefiks yang menelan permukaan publik (`/`, prefiks locale, atau slug tab), dan rute `prerender = false` yang prefiksnya tidak dinyatakan. Ingat juga biayanya: sesi, CSRF, cache yang wajib dipisah, dan seluruh postur ADR-0019 kini berlaku di jalur yang membawa kredensial.
- [ ] **Bila kamu menyatakannya: periksa bahwa setiap fitur di sana sudah punya pengelolanya di `awcms`.** Aturannya ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) §4, dicerminkan `awcms` ADR-0070 §4): setiap fitur yang dipakai user di permukaan admin situsmu **wajib juga bisa dikelola `owner`** lewat `/admin/*` milik `awcms`. Urutannya karena itu **`awcms` dulu, selalu** — fitur yang mendarat di sini lebih dulu adalah fitur yang untuk sementara tidak bisa dimatikan siapa pun. Butir ini ada di checklist justru karena ia **tidak bisa digerbangi dari repo ini**: katalog permission dan registry layar tinggal di `awcms`, dan repo ini tidak punya instans untuk menanyakannya. Yang bisa digerbangi hanya akibatnya — permukaan `awcms` yang dipanggil build dikeraskan menjadi tepat tiga oleh `tests/kontrak-awcms.test.mjs`, jadi fitur admin user yang butuh permukaan keempat **pasti** memerahkan `bun test` sampai kontraknya disepakati serentak dengan sisi sana (`awcms` ADR-0065). Daftar layar `/admin/*` yang sudah tersedia hari ini ada di [`integrasi-awcms.md`](integrasi-awcms.md).
- [ ] **Situsmu butuh menyimpan sesuatu — kiriman formulir, langganan, keanggotaan?** Itu **kebutuhan backend**, dan tempatnya sebuah **modul di `awcms`** ([ADR-0038](../adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md)), bukan folder di repo situsmu. Bukan formalitas: modul itulah yang membawa RLS, katalog izin, jejak audit, deskriptor retensi, dan deskriptor subjek data — sehingga datanya bisa menjawab "apa yang kalian simpan tentang saya" alih-alih menjadi tabel yang tidak diketahui siapa pun. `tests/tanpa-backend.test.mjs` menolak dependency kelas backend, jalur tulis ke `awcms` dari `src/`/`scripts/`, dan artefak persistensi; ia memeriksa BENTUK, jadi jangan membacanya sebagai izin untuk menyimpan data di tempat lain yang kebetulan lolos.
- [ ] **Situs berita?** Nyatakan seksinya, jangan hanya menamainya. Sebuah tab bernama `news` yang tetap `urutanSeksi: "manual"` akan terurut menurut ABJAD, karena setiap artikel yang tidak dinomori bernilai `urutan` 99 dan pemecah serinya judul. Yang menyalakan perilaku berita ([ADR-0033](../adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)):

      ```ts
      export const tabs = [
        { slug: "news", label: "News", urutanSeksi: "terbaru" }
      ] as const satisfies readonly TabDef[];
      ```

      Satu baris itu mengurutkan seksi dari `publishedAt` menurun, mengganti lencana kartu dari nomor artikel menjadi tanggal, membuat artikelnya memancarkan `NewsArticle` alih-alih `Article`, dan — sejak [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) — **menerbitkan feed Atom** di `/news/feed.xml` beserta `/<locale>/news/feed.xml`, diumumkan halaman seksi dan halaman artikelnya. Kamu tidak perlu menyentuh apa pun untuk mendapatkannya, dan tidak ada cara mematikannya selain mengembalikan seksinya ke `"manual"`. Yang masih harus kamu sediakan sendiri: enam key PO per locale (`home.tab.news.title`/`.desc`, `tab.news.h1`/`.lead`/`.pageTitle`/`.metaDesc` — `bun test` merah tanpa itu), seni seksi berasio 16:9 di `src/assets/` mengikuti konvensi `tab/<tab>`, dan `kategori: "news"` di `contentJson.awcmsAstro` setiap post.

      **Batas yang harus kamu terima sebelum menyalakannya:** indeks seksi merender SELURUH artikelnya dalam satu halaman, dan **feed-nya juga** — paginasi belum ada untuk keduanya, dan alasannya ada di §Yang tidak dibangun pada ADR-0033 dan ADR-0035. Feed membawa ringkasan, bukan isi artikel (ADR-0035 §3), jadi pelanggan mengklik ke situsmu alih-alih membaca di pembacanya. `Content-Type: application/atom+xml` hanya dijamin bila `dist/client` disajikan `server/penyaji.mjs`; di belakang host statis orang lain ia kembali menjadi `application/xml`. Untuk situs berita bervolume tinggi, timbang dulu menyajikan permukaan publik `awcms` sendiri di `/{locale}/blog/{tenantCode}/**`: di sana paginasi, arsip kategori/tag, pencarian, feed, dan sitemap sudah ada, dan terbit langsung tayang tanpa rebuild. Perhatikan bentuknya sebelum mengiklankan sebuah URL: sejak `awcms` ADR-0098 (15 Agustus 2026) locale-nya ADA di dalam path dan `/blog/{tenantCode}/…` telanjang menjawab `307`, jadi alamat yang kaucetak di atas kertas seharusnya yang berprefiks. **Bukan `/news/**` dari `awcms`** — keempat rutenya dihapus di sana pada 8 Agustus 2026 dan kini 301 ke `/blog/{tenantCode}/**` (**kecuali** untuk tenant ber-`legacyTenantRouteEnabled: false`, yang sudah mematikan seluruh permukaan konten publiknya dan karena itu tetap dijawab 404 alih-alih diberi 301 menuju 404 yang pasti (`awcms` ADR-0071 §4 butir 3)); sejak [ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) (pasangannya `awcms` ADR-0071) `/news/` adalah kosakata URL **repo ini**, dan `/blog/` kosakata `awcms`. Satu keluarga rute per repo, dan tidak pernah keduanya di satu repo.
- [ ] `.env` dari `.env.example` — `AWCMS_API_URL`, `AWCMS_API_TOKEN` (kredensial mesin, ia yang membawa tenant), `AWCMS_TENANT_ID` sebagai asersi. **Terbitkan tokennya di layar `/admin/machine-credentials` milik `awcms`**, kelas **baca**, dua kunci (`blog_content.posts.read` + `media_library.media.read`), atas akun layanan milik tenant situsmu sendiri — bukan aktor terdelegasi seorang partner, yang berhenti membangun begitu kemitraannya disuspend (`awcms` ADR-0093). Plaintextnya muncul sekali; memuat ulang halaman itu menghanguskannya. **Konten tidak tinggal di repo ini**: tidak ada `src/content.config.ts` dan tidak ada frontmatter, karena artikel ditarik dari `awcms` saat build (ADR-0018). Skema yang dulu ditegakkan Zod kini tanggung jawab sisi `awcms` — daftar jaminannya di [`integrasi-awcms.md`](integrasi-awcms.md).
- [ ] `astro.config.mjs` — `site`, `compressHTML: true`, `serialize` sitemap. **Tidak ada pipeline markdown**: konten datang dari `awcms` sebagai blok terstruktur, dan yang merendernya `src/lib/content-blocks.ts`, bukan remark/rehype. Empat setelan lain di berkas itu **jangan disentuh tanpa membaca alasannya**: `output: "static"`, adapter node, `build.inlineStylesheets: "never"`, dan `vite.build.assetsInlineLimit: 0` — dua yang terakhir yang membuat CSP ketat mungkin, dan keduanya gagal secara diam-diam bila dilonggarkan.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, `engines`, dan seluruh skrip.
- [ ] Versi Bun konsisten di **lima nilai**, bukan tiga berkas — `packageManager`, `engines.bun`, `bun-version` di **dua** job CI, dan tag image (identik di kedua stage `Dockerfile`) — ditambah digest yang dipin di sebelah tag itu, sehingga ada enam hal yang bergerak bersama ([ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) §Konsekuensi). Menghitung BERKAS alih-alih NILAI adalah kesalahan yang [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) ditulis untuk mengakhirinya: duplikat kedua di tiap berkas yang paling mungkin tertinggal, dan keduanya tetap hijau sendirian. `tests/versi-toolchain.test.mjs` membandingkan seluruhnya, dan ia juga menolak satu stage dipin ke digest sementara yang lain tidak — saat tag dan digest sama-sama ada, Docker mematuhi digest dan tag hanya menjadi komentar.

Pertanyaan yang menentukan bentuk skema: **kesalahan apa yang paling merugikan pembaca situs ini, dan field mana yang membuat kesalahan itu sulit dilakukan?** Di repo rujukan jawabannya `cakupan` dan `biaya[].jenis` — keduanya memaksa keputusan yang kalau tidak dipaksa akan terlewat.

## 3. i18n

- [ ] Tetapkan locale default dan daftar locale lain di `localeMeta`.
- [ ] Isi `src/locales/<default>/messages.po`. Katalog default adalah acuan; key yang tidak ada di sini akan tampil sebagai nama key mentah.
- [ ] Buat katalog locale lain, boleh hampir kosong — fallback menanganinya.
- [ ] Bila ada bahasa dengan penutur terbatas dan register teknis yang tipis, **tulis batasnya sebagai ADR sejak awal**, bukan setelah terjemahan mesin terlanjur tayang. Contoh: ADR-0004 repo rujukan.

## 4. Konten dan aset

- [ ] Tulis satu artikel lengkap di locale default **lewat panel admin `awcms`** sebagai acuan bentuk, lalu build dan lihat hasilnya. Konten tidak ditulis di repo ini.
- [ ] **Tetapkan satu rasio gambar untuk seluruh situs**, lalu pakai rasio itu di setiap bingkai **dan** setiap sumber. Bingkai memakai `object-fit: cover`; sumber berasio lain dipotong diam-diam, bukan diperkecil. Nilainya `--ratio-visual` di `src/styles/global.css`, dan `bun run audit:konten` menegakkannya atas tiap berkas di `src/assets/`.
- [ ] Taruh ilustrasi di `src/assets/` mengikuti konvensi nama — `hero`, `tab/<tab>`, `artikel/<tab>/<slug>`, tanpa ekstensi ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)). **Tidak ada peta yang harus diisi**: `src/lib/article-images.ts` menyelesaikannya lewat `import.meta.glob`, dan berkas yang tidak ada merender placeholder bergaya.
- [ ] Kartu share: **opsional, dan defaultnya tidak ada.** `awcms-astro` tidak
      membawa pembangkit kartu (`scripts/kartu-share.mjs` hanya ada di repo
      rujukan). Bila situs ini punya satu kartu baku, taruh berkasnya di
      `public/` lalu tunjuk dengan `SITE_SOCIAL_IMAGE`; bila tidak, biarkan
      variabelnya kosong dan halaman tidak memasang tag gambar sama sekali.
      **Jangan mengisinya dengan berkas yang belum ada** — itu menerbitkan
      pratinjau rusak di setiap halaman tanpa satu pun kegagalan build, dan
      persis itu yang pernah terjadi di template ini.

Bila ilustrasi dibangkitkan sendiri, **jangan biarkan konfigurasinya menyisipkan markup mentah**. Escape seluruh teks di satu tempat. Pintu markup mentah terlihat praktis dan hanya butuh sekali dipakai untuk meloloskan `&` telanjang yang membuat browser gagal merender tanpa satu pun pesan error.

## 5. Gerbang audit

Wajib tetap hijau:

- [ ] `bun run check` — gerbang lockfile lalu `astro check`.
- [ ] `bun test` — 21 berkas gerbang. Yang paling sering memerahkan situs baru:
      katalog PO (`tests/katalog-po.test.mjs` — key yang dipakai kode tetapi tak
      ada di katalog, katalog locale yang tertinggal, `msgstr` kosong, key tab
      yang belum ditulis untuk locale mana pun), **peran situs**
      (`tests/peran-situs.test.mjs` — `permukaanAdmin` dan setiap rute
      `prerender = false`), **kosakata `news`** (`tests/kosakata-news.test.mjs` —
      tab ber-slug `news` wajib `urutanSeksi: "terbaru"`), kontrak `awcms`
      (`tests/kontrak-awcms.test.mjs`), **tanpa backend**
      (`tests/tanpa-backend.test.mjs` — dependency kelas backend, jalur tulis ke
      `awcms`, artefak persistensi), feed Atom (`tests/feed.test.mjs`), dan
      renderer blok (`tests/content-blocks.test.mjs`). Ketiga skrip audit ikut
      dijalankan ulang dari dalam `bun test`, jadi ia tidak pernah bisa hijau
      saat salah satunya merah.
- [ ] `bun run audit:konten` — gerbang gambar (rasio, format dari isi berkas,
      XML SVG, ukuran teks).
- [ ] `bun run build && bun run audit:konten` — **jalankan lagi setelah build.**
      Gerbang keluaran (judul, deskripsi, canonical, hreflang, aset yang
      dijanjikan metadata, tautan mati, sitemap, nama key yang bocor ke layar)
      melewati dirinya bila `dist/` belum ada, dan mengatakannya. Di repo
      template itu normal; di SITUS ini, itu berarti gerbangnya tidak berjalan.
- [ ] `bun run audit:dokumen` — tautan markdown mati dan indeks ADR. Tidak butuh
      build maupun jaringan. Situs yang menghapus `docs/adr/` mendapat gerbang
      indeks yang **melewati dirinya dan mengatakannya**; yang mempertahankannya
      terikat aturan yang sama dengan template: tiap ADR tercatat, tiap baris
      menunjuk berkas yang ada, dan kolom Status setuju dengan ADR-nya.
- [ ] `bun run audit:translation` — cermin basi dan cakupan cermin. Ia juga tidak
      butuh build. Situs yang hanya memakai satu bahasa tidak punya yang perlu
      dicerminkan dan buku besarnya kosong; yang mempertahankan keduanya terikat
      aturan yang sama dengan template
      ([ADR-0039](../adr/0039-english-is-the-source-language.md)): Inggris di
      jalur telanjang adalah sumbernya, dan `<nama>.id.md` mencatat hash dari apa
      yang ia terjemahkan.
- [ ] `bun run audit:graf` — artefak `graphify-out/`. Situs yang menghapus
      direktori itu (lihat daftar di atas) mendapat gerbang yang **melewati
      dirinya dan mengatakannya**; yang mempertahankannya terikat aturan yang
      sama dengan template, termasuk bahwa nama tiap komunitas harus dipilih,
      bukan diwarisi dari penamaan otomatis graphify.

**Menaruh seni:** berkas di `src/assets/`, konvensi nama `hero`, `tab/<tab>`,
`artikel/<tab>/<slug>` tanpa ekstensi — tidak ada registry yang harus ikut
disunting. Berkas yang tidak ada merender placeholder bergaya, dan itu keadaan
yang **didukung**. Rinciannya di
[ADR-0024](../adr/0024-seni-lokal-di-src-assets.md).

Dua aturan gambar tidak punya pemeriksa dan tidak akan pernah punya: **teks di
dalam gambar hanya label topik**, dan **tanpa lambang atau atribut instansi
negara**. Keduanya dinilai manusia, setiap kali seni baru masuk.

**Setiap aturan baru di dokumentasi wajib membawa pemeriksanya ke sini.** Ini bagian yang paling sering dilewati, dan konsekuensinya paling lambat terasa.

## 6. Tampilan

- [ ] Sesuaikan design token di `:root` — lihat [`ui-ux-design-system.md`](ui-ux-design-system.md).
- [ ] Pastikan kontras cukup di tema terang **dan** gelap.
- [ ] Uji dari lebar 360px sampai desktop — termasuk **membaca teks di dalam gambar** pada lebar tersempit.
- [ ] Umpan balik hover juga aktif pada `:focus-visible`; matikan animasi dekoratif sepenuhnya saat `prefers-reduced-motion`, bukan sekadar dipercepat.

Tampilan dikerjakan terakhir karena ia satu-satunya lapisan yang murah diubah.

## 7. Tata kelola

- [ ] `AGENTS.md` — kontrak kerja; ikat seluruh standar dan tunjuk dokumen rincinya.
- [ ] `README.md` — kenapa situs ini ada.
- [ ] `docs/adr/0001-*.md` — keputusan pertama: kenapa statis, kenapa struktur ini.
- [ ] **Opsional, dan template ini sengaja tidak membawanya:** `docs/ARCHITECTURE.md` (anatomi repo) dan `docs/PROJECT_STATE.md` (keadaan dan titik lanjut). Di template, perannya dipikul §Struktur README, docblock tiap berkas, dan §"Yang belum ada". Buat keduanya bila situsmu tumbuh melampaui itu — **jangan** membuatnya kosong untuk memuaskan daftar ini. Berkas kosong yang wajib adalah cara paling cepat sebuah checklist berhenti dibaca.
- [ ] `LICENSE` — periksa cakupannya; kode dan konten sering butuh ketentuan berbeda.
- [ ] `SECURITY.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`.
- [ ] `.github/workflows/ci.yml` dan templat issue/PR.
- [ ] `.claude/skills/` — template membawa **empat** skill yang berlaku untuk
      setiap situs turunan (integrasi `awcms`, gerbang, menurunkan situs baru,
      dan performa/keamanan). Biarkan keempatnya; **tambahkan** skill khas
      domainmu di sampingnya, jangan menggantinya. Skill yang memerikan sesuatu
      yang tidak ada di repomu adalah cacat, dan `bun run audit:dokumen`
      memeriksa jalur yang disebutnya — `.claude/` tidak dikecualikan.
- [ ] **Pastikan deployment-mu menyetel `NODE_ENV=production`.**
      `Strict-Transport-Security` dikirim penyaji hanya di balik gerbang itu
      ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)),
      dan deployment yang tidak menyetelnya **tidak mendapat HSTS tanpa satu pun
      yang mengatakannya**. `Dockerfile` menyetelnya; jalur deploy lain harus
      menyetelnya sendiri.

      **Jangan** menambahkannya lagi di Traefik: dua sumber kebijakan yang
      saling menimpa adalah cara paling sunyi berakhir tanpa kebijakan sama
      sekali, dan itu persis yang sudah terjadi sekali di sini — selama dua bulan
      semua orang mengira HSTS dipasang di sana.

- [ ] **Putuskan `includeSubDomains` secara sadar, atau jangan sentuh.**
      Template ini sengaja mengirim `max-age=31536000` saja. Menambahkannya
      memaksa **setiap subdomain** organisasimu menjadi HTTPS-saja selama
      setahun, di browser setiap orang yang pernah membuka situs ini — dan yang
      menanggung akibatnya layanan lain, yang pemiliknya tidak ikut memutuskan.
      Tambahkan hanya bila kamu sudah memeriksa bahwa semuanya HTTPS, di
      `server/penyaji.mjs`, lalu perbarui `tests/penyaji.test.mjs`.

## 8. Rilis pertama

```bash
bun install
bun run build          # lockfile + astro check + astro build + bundel penyaji + asal media
bun test               # harus hijau; setelah build, lapis penyajian ikut jalan
bun run audit:konten   # setelah build, agar gerbang keluarannya ikut jalan
bun run audit:dokumen     # tautan markdown & indeks ADR; tidak butuh build
bun run audit:translation # cermin basi & cakupan cermin; tidak butuh build
bun run audit:graf        # artefak graphify-out/; melewati diri bila dihapus
bun run serve             # periksa header dan cache seperti yang dilihat pembaca
bun audit                 # harus 0 kerentanan
bun run release minor --apply
```

Urutannya bukan selera: `bun run audit:konten` membaca `dist/client`, dan tanpa hasil build ia melewati gerbang keluarannya sendiri sambil mengatakannya. `scripts/rilis.mjs` menjalankan keduanya dalam urutan yang sama, tanpa syarat.

`bun audit` (kerentanan dependency) dan `bun run audit:konten` (isi situs) adalah dua hal yang berbeda; namanya sengaja tidak dibuat mirip.

## Kesalahan yang paling sering terjadi

| Kesalahan | Akibatnya |
| --- | --- |
| Menulis banyak artikel sebelum skema final | Migrasi frontmatter manual di puluhan berkas lintas locale |
| Menambah aturan di dokumentasi tanpa pemeriksanya | Aturan dilanggar diam-diam, ketahuan berbulan-bulan kemudian |
| Menaruh string UI langsung di `.astro` | String itu tidak akan pernah bisa diterjemahkan, dan halamannya tetap tampak benar dalam locale default sehingga tidak ada yang menyadarinya |
| Membiarkan `public/` menampung gambar konten | Ia lolos dari `bun run audit:konten`: gerbang rasio, format-dari-isi-berkas, dan ukuran teks SVG hanya membaca `src/assets/`. `public/` sengaja dikecualikan karena favicon wajib bujur sangkar dan kartu share punya ukuran bakunya sendiri — jadi menaruh ilustrasi di sana berarti menerbitkannya tanpa satu pun pemeriksa |
| Mengisi `src/assets/` dengan foto raster besar | Tidak ada `srcset` ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)), jadi ponsel 360px mengunduh berkas yang sama dengan desktop 1920px. Anggaran gambar di [`standar-teknis.md`](standar-teknis.md#performance) adalah tempat pertama kelebihannya terlihat |
| Rasio sumber gambar berbeda dari rasio bingkainya | Gambar tetap tampil, hanya isinya yang terpotong — tidak ada yang menyadarinya sampai ada yang membaca teks di dalamnya |
| Memercayai ekstensi berkas gambar | Berkas `.png` yang isinya JPEG berjalan normal sampai ada perkakas yang membacanya menurut namanya |
| Menaruh nominal atau data di dalam gambar | Ia lolos dari aturan yang menjaga angka lain, dan tidak ikut diperbarui saat angkanya berubah |
| Menulis tautan relatif di changeset tanpa menyesuaikannya saat dilipat | Tautan meleset satu tingkat, dan gerbang tidak melihatnya karena berjalan sebelum pelipatan |
| Menunda ADR sampai "nanti" | Alasan keputusan hilang; usulan yang sama muncul lagi enam bulan kemudian |
| Menyalin komponen halaman per locale | Enam salinan yang perlahan menyimpang satu sama lain |
