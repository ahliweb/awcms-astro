# Memulai Situs Baru di Atas awcms-astro

Langkah menurunkan repo baru dari standar ini. Urutannya disengaja: kontrak lebih dulu, konten berikutnya, tampilan terakhir.

Prasyarat: baca [`README.md`](README.md) untuk memastikan `awcms-astro` memang pilihan yang tepat, dan [`standar-teknis.md`](standar-teknis.md) untuk aturan yang mengikat.

## 1. Salin kerangka

Ambil dari repo rujukan: `src/lib/`, `src/layouts/`, `src/components/` (kecuali komponen khas domain), `src/styles/global.css`, `scripts/`, `.github/`, `.changesets/`, dan seluruh `docs/` kecuali isi domain.

**Jangan bawa:** `src/content/`, `src/data/`, `src/assets/images/`, `src/locales/*/messages.po`, `docs/workflows/` yang khas domain lama.

## 2. Tetapkan kontrak sebelum menulis satu artikel pun

- [ ] `src/config/site.ts` — nama, domain, `siteUrl`, daftar locale, navigasi utama beserta urutannya.
- [ ] `src/content.config.ts` — skema frontmatter. **Ini keputusan yang paling mahal diubah belakangan.** Tentukan sekarang: field apa yang memaksa penulis memutuskan hal penting sejak awal?
- [ ] `src/data/` — data referensi yang tidak boleh diketik ulang di markdown.
- [ ] `astro.config.mjs` — `site`, `compressHTML: true`, pipeline markdown, `serialize` sitemap.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, `engines`, dan seluruh skrip.
- [ ] `.nvmrc` — konsisten dengan `engines`.

Pertanyaan yang menentukan bentuk skema: **kesalahan apa yang paling merugikan pembaca situs ini, dan field mana yang membuat kesalahan itu sulit dilakukan?** Di repo rujukan jawabannya `cakupan` dan `biaya[].jenis` — keduanya memaksa keputusan yang kalau tidak dipaksa akan terlewat.

## 3. i18n

- [ ] Tetapkan locale default dan daftar locale lain di `localeMeta`.
- [ ] Isi `src/locales/<default>/messages.po`. Katalog default adalah acuan; key yang tidak ada di sini akan tampil sebagai nama key mentah.
- [ ] Buat katalog locale lain, boleh hampir kosong — fallback menanganinya.
- [ ] Bila ada bahasa dengan penutur terbatas dan register teknis yang tipis, **tulis batasnya sebagai ADR sejak awal**, bukan setelah terjemahan mesin terlanjur tayang. Contoh: [ADR-0004](../adr/0004-terjemahan-bahasa-daerah-penutur-asli.md).

## 4. Konten dan aset

- [ ] Tulis satu artikel lengkap di locale default sebagai acuan bentuk.
- [ ] Siapkan gambar sumber di `src/assets/images/`.
- [ ] Isi peta `src/lib/article-images.ts` — satu entitas = satu gambar unik.
- [ ] Sesuaikan `scripts/kartu-share.mjs`: nama kartu yang perlu dibangkitkan.
- [ ] `public/og-image.png` 1200×630 sebagai kartu baku.

## 5. Sesuaikan gerbang audit

`scripts/audit-konten.mjs` membawa aturan domain repo rujukan. Sesuaikan:

- [ ] Daftar koleksi dan locale.
- [ ] Aturan khas domain (di repo rujukan: `pajak-daerah` vs `nasional`, minimal tiga FAQ, validitas slug wilayah).
- [ ] Nama kartu share yang wajib ada.
- [ ] Pemeriksaan SEO umumnya bisa dipakai apa adanya.

**Setiap aturan baru di dokumentasi wajib membawa pemeriksanya ke sini.** Ini bagian yang paling sering dilewati, dan konsekuensinya paling lambat terasa.

## 6. Tampilan

- [ ] Sesuaikan design token di `:root` — lihat [`ui-ux-design-system.md`](ui-ux-design-system.md).
- [ ] Pastikan kontras cukup di tema terang **dan** gelap.
- [ ] Uji dari lebar 360px sampai desktop.

Tampilan dikerjakan terakhir karena ia satu-satunya lapisan yang murah diubah.

## 7. Tata kelola

- [ ] `AGENTS.md` — kontrak kerja; ikat seluruh standar dan tunjuk dokumen rincinya.
- [ ] `README.md` — kenapa situs ini ada.
- [ ] `docs/ARCHITECTURE.md` — anatomi repo.
- [ ] `docs/PROJECT_STATE.md` — keadaan dan titik lanjut.
- [ ] `docs/adr/0001-*.md` — keputusan pertama: kenapa statis, kenapa struktur ini.
- [ ] `LICENSE` — periksa cakupannya; kode dan konten sering butuh ketentuan berbeda.
- [ ] `SECURITY.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`.
- [ ] `.github/workflows/ci.yml` dan templat issue/PR.
- [ ] `.claude/skills/` — encode standar domain menjadi prosedur.

## 8. Rilis pertama

```bash
npm install
npm run build
npm run audit          # harus 0 error
npm audit              # harus 0 kerentanan
npm run release -- minor --apply
```

## Kesalahan yang paling sering terjadi

| Kesalahan | Akibatnya |
| --- | --- |
| Menulis banyak artikel sebelum skema final | Migrasi frontmatter manual di puluhan berkas lintas locale |
| Menambah aturan di dokumentasi tanpa pemeriksanya | Aturan dilanggar diam-diam, ketahuan berbulan-bulan kemudian |
| Memakai `<img>` mentah "sementara" | Optimasi terlewat tanpa satu pun peringatan |
| Menaruh string UI langsung di `.astro` | String itu tidak akan pernah bisa diterjemahkan, dan halamannya tetap tampak benar dalam locale default sehingga tidak ada yang menyadarinya |
| Membiarkan `public/` menampung gambar konten | Seluruh gambar lolos dari pipeline optimasi |
| Menunda ADR sampai "nanti" | Alasan keputusan hilang; usulan yang sama muncul lagi enam bulan kemudian |
| Menyalin komponen halaman per locale | Enam salinan yang perlahan menyimpang satu sama lain |
