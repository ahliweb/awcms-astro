---
bump: patch
tipe: perbaikan
dampak: internal
---

# Lantai dukungan 360px akhirnya punya angka yang jujur dan gerbang yang menjaganya

`.grid-cards` menulis `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`.
Di lantai dukungan 360px yang didokumentasikan repo ini, `.container` (padding
`0 1.25rem` — 20px tiap sisi) menyisakan ruang bersih PERSIS 320px — sebuah track
selebar 320px di ruang 320px pas TANPA sisa sama sekali. `box-sizing: border-box`
menyelamatkannya hari ini, tapi pembulatan sub-piksel atau border/outline/shadow
yang kelak ditambahkan ke `.card` akan mendorong gulir mendatar persis di lebar
yang dijanjikan repo ini untuk didukung, dan tidak ada satu gerbang pun yang akan
memerah karenanya. `.sorotan` di `src/components/views/Home.astro` — sebuah blok
`<style>` komponen, bukan `global.css` — punya cacat yang identik lewat
`minmax(20rem, 1fr)` (20rem = 320px); draf pertama gerbangnya sendiri hanya
membaca `global.css` dan tetap hijau di atasnya, jadi cakupan berkasnya
diperbaiki dulu sebelum PR ini boleh dianggap selesai.

- `src/styles/global.css`: `.grid-cards` kini memakai
  `minmax(min(320px, 100%), 1fr)` — identik hasilnya di setiap lebar di atas
  320px, tapi tidak bisa lagi dipaksa overflow oleh track-nya sendiri.
- `src/components/views/Home.astro`: `.sorotan` kini memakai
  `minmax(min(20rem, 100%), 1fr)` — unit rem dipertahankan, bukan dikonversi
  ke px, karena itulah yang berkas ini pakai di tempat lain.
- `AGENTS.md`, `AGENTS.id.md`, `docs/awcms-astro/ui-ux-design-system.md`, dan
  `.id.md`-nya menulis "kartu 328px … skala 0.41" — aritmetika untuk padding
  1rem yang sudah lama tidak sama dengan padding 1.25rem yang sungguh berlaku
  di `.container`. Angkanya kini 320px dan skala 0.40 (kesimpulannya tidak
  berubah: 22px × 0,40 = 8,8px, tetap di bawah 9px dan praktis tidak terbaca).
- Aturan lantai 360px sebelumnya tidak punya satu pun pemeriksa. Kini ada:
  `tests/lebar-360.test.mjs` membaca padding `.container` dan lantai 360px dari
  `src/styles/global.css`, menurunkan lebar bersihnya dari CSS itu sendiri
  (bukan menulis ulang "320" sebagai angka tetap), lalu menolak
  `minmax(<N>px|rem, …)` atau `width`/`min-width` tetap lain yang mencapai atau
  melebihi lebar itu tanpa jalan keluar `min(…, 100%)`, media query khusus
  layar lebar, `overflow-x` pada dirinya sendiri, atau posisi absolut/fixed di
  luar alur — **diperiksa di `src/styles/global.css` DAN di setiap blok
  `<style>` setiap berkas `.astro` di bawah `src/`** (komponen, layout,
  halaman), bukan hanya `global.css`, supaya kasus kedua di `Home.astro` tidak
  bisa lolos lagi dengan nama lain. Juga menjaga angka kartu/skala di
  `AGENTS.md` tetap sinkron dengan aritmetika CSS yang sebenarnya. Gerbang ini
  statik atas teks CSS: ia tidak bisa membuktikan keamanan render sungguhan
  (pembulatan sub-piksel, metrik font nyata, scrollbar sungguhan) — itu butuh
  pemeriksaan headless-browser `document.documentElement.scrollWidth <= 360`
  atas halaman yang sudah dibangun, terhadap `awcms` backend yang hidup.
- `AGENTS.md`/`.id.md` §Interface, item Definition of Done tentang 360px, dan
  `.claude/skills/awcms-astro-gerbang/SKILL.md`/`.id.md` kini menyebut gerbang
  baru ini dan cakupan berkasnya yang sebenarnya; hitungan `bun test` di
  keenam dokumen yang dijaga `tests/documented-counts.test.mjs` naik dari 39
  ke 40.
