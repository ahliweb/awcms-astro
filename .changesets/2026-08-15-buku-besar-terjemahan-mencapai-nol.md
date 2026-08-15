---
tipe: dokumentasi
dampak: internal
---

# Buku besar terjemahan mencapai NOL, dan gerbang permukaan kilau berhenti membaca separuh

Fase kelima dan terakhir [ADR-0039](../docs/adr/0039-english-is-the-source-language.md):
dua belas dokumen terakhir — enam di [`docs/awcms-astro/`](../docs/awcms-astro/README.md),
lima di [`jualanku/`](../docs/awcms-astro/jualanku/README.md), dan
[`deploy-coolify.md`](../docs/deploy-coolify.md) — kini berbahasa Inggris di
jalur telanjangnya. **`DOCS_AWAITING_MIRROR` kosong**: 53 cermin, nol utang.
Migrasi 52 dokumen yang ADR-0039 jadwalkan selesai dalam lima commit.

- **Gerbang permukaan kilau membaca SATU berkas, dan tabelnya baru saja punya
  cermin.** `scripts/audit-dokumen.mjs` membandingkan tabel bertanda di
  [`ui-ux-design-system.md`](../docs/awcms-astro/ui-ux-design-system.md) dengan
  `src/styles/global.css` dua arah — tetapi hanya di sumbernya. Ia kini membaca
  keduanya, dan dibuktikan dengan mutasi: satu baris dihapus dari cermin → tepat
  satu pelanggaran. Ini kejadian KEDUA dari kelas cacat yang sama dalam lima
  fase (yang pertama tabel permukaan `awcms` di skill integrasi), dan keduanya
  punya bentuk identik: sebuah tabel yang digerbangi terhadap kode, dengan
  cerminnya tidak ikut digerbangi.
- **Kepala tabelnya adalah literal yang dilewati gerbang**, jadi menerjemahkannya
  saja sudah cukup untuk memerahkan berkas yang benar: `permukaanDokumen()`
  melewati kolom bernama `Permukaan`, dan `Surface` akan terbaca sebagai
  selector. Kini keduanya dilewati — pola yang sama dengan kolom status ADR yang
  menerima dua bahasa sejak fase pertama.
- **Tiga klaim yang menua diperbaiki**, seluruhnya di
  [`checklist-repo-baru.md`](../docs/awcms-astro/checklist-repo-baru.md): versi
  Bun disebut konsisten di "tiga tempat" — menghitung BERKAS, kesalahan yang
  [ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) ditulis
  untuk mengakhirinya dan yang sudah diperbaiki di `AGENTS.md` tetapi tidak di
  sini; `bun test` disebut 20 berkas padahal 21; dan anggaran gambar disebut
  "belum punya pemeriksa" padahal ia diukur `audit:konten` sejak 4 Agustus 2026.
- **`audit:translation` masuk ke tiga daftar gerbang** yang sebelumnya menyebut
  lima: checklist repo baru, tabel gerbang mutu
  [`standar-teknis.md`](../docs/awcms-astro/standar-teknis.md), dan blok rilis
  pertama.
- **Sembilan tautan ber-anchor diperbarui** karena heading yang diterjemahkan
  memindahkan anchor-nya, dan `audit:dokumen` sengaja tidak memeriksa anchor —
  `#aksesibilitas` → `#accessibility`, `#performa` → `#performance`,
  `#stack` → `#the-stack`, `#kapan-memilih-awcms-astro` →
  `#when-to-choose-awcms-astro`. Sama seperti fase ketiga: hanya membacanya yang
  menemukan ini.

**Yang tetap perlu mata manusia:** ADR-0039 §6 menuntut tinjauan atas ADR dan
atas bagian `docs/awcms-astro/` yang menyatakan kebijakan mengikat. Gerbang
membuktikan cermin tidak basi; ia tidak bisa membuktikan terjemahannya setia,
dan selisih "wajib" versus "boleh" memindahkan sebuah keputusan.
