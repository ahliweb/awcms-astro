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

- [ ] `src/config/site.ts` — nama, domain, `siteUrl`, daftar locale, navigasi utama beserta urutannya.
- [ ] `.env` dari `.env.example` — `AWCMS_API_URL`, `AWCMS_API_TOKEN` (kredensial mesin, ia yang membawa tenant), `AWCMS_TENANT_ID` sebagai asersi. **Konten tidak tinggal di repo ini**: tidak ada `src/content.config.ts` dan tidak ada frontmatter, karena artikel ditarik dari `awcms` saat build (ADR-0018). Skema yang dulu ditegakkan Zod kini tanggung jawab sisi `awcms` — daftar jaminannya di [`integrasi-awcms.md`](integrasi-awcms.md).
- [ ] `astro.config.mjs` — `site`, `compressHTML: true`, `serialize` sitemap. **Tidak ada pipeline markdown**: konten datang dari `awcms` sebagai blok terstruktur, dan yang merendernya `src/lib/content-blocks.ts`, bukan remark/rehype. Empat setelan lain di berkas itu **jangan disentuh tanpa membaca alasannya**: `output: "static"`, adapter node, `build.inlineStylesheets: "never"`, dan `vite.build.assetsInlineLimit: 0` — dua yang terakhir yang membuat CSP ketat mungkin, dan keduanya gagal secara diam-diam bila dilonggarkan.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, `engines`, dan seluruh skrip.
- [ ] Versi Bun konsisten di tiga tempat: `packageManager` + `engines.bun`, `bun-version` di CI, dan tag image di `Dockerfile`.

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
- [ ] `bun test` — renderer blok (`tests/content-blocks.test.mjs`) dan gerbang
      katalog PO (`tests/katalog-po.test.mjs`). Yang kedua menolak key yang
      dipakai kode tetapi tidak ada di katalog, katalog locale yang tertinggal,
      `msgstr` kosong, dan key tab yang belum ditulis untuk locale mana pun.
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
- [ ] **Jawab celah 1 di
      [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md):**
      `Strict-Transport-Security` belum dikirim template ini. Sampai ia dikirim,
      pasang HSTS di proxy situsmu **dan catat di ADR bahwa kamu memasangnya di
      sana** — supaya penggantimu kelak tidak memasang kebijakan kedua yang
      menimpa kebijakan pertama.

## 8. Rilis pertama

```bash
bun install
bun run build          # gerbang lockfile + astro check + astro build + bundel penyaji
bun test               # harus hijau; setelah build, lapis penyajian ikut jalan
bun run audit:konten   # setelah build, agar gerbang keluarannya ikut jalan
bun run audit:dokumen  # tautan markdown & indeks ADR; tidak butuh build
bun run serve          # periksa header dan cache seperti yang dilihat pembaca
bun audit              # harus 0 kerentanan
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
| Mengisi `src/assets/` dengan foto raster besar | Tidak ada `srcset` ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)), jadi ponsel 360px mengunduh berkas yang sama dengan desktop 1920px. Anggaran gambar di [`standar-teknis.md`](standar-teknis.md#performa) adalah tempat pertama kelebihannya terlihat — dan anggaran itu **belum punya pemeriksa** |
| Rasio sumber gambar berbeda dari rasio bingkainya | Gambar tetap tampil, hanya isinya yang terpotong — tidak ada yang menyadarinya sampai ada yang membaca teks di dalamnya |
| Memercayai ekstensi berkas gambar | Berkas `.png` yang isinya JPEG berjalan normal sampai ada perkakas yang membacanya menurut namanya |
| Menaruh nominal atau data di dalam gambar | Ia lolos dari aturan yang menjaga angka lain, dan tidak ikut diperbarui saat angkanya berubah |
| Menulis tautan relatif di changeset tanpa menyesuaikannya saat dilipat | Tautan meleset satu tingkat, dan gerbang tidak melihatnya karena berjalan sebelum pelipatan |
| Menunda ADR sampai "nanti" | Alasan keputusan hilang; usulan yang sama muncul lagi enam bulan kemudian |
| Menyalin komponen halaman per locale | Enam salinan yang perlahan menyimpang satu sama lain |
