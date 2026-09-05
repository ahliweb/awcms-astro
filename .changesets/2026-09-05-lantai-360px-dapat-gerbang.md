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
memerah karenanya.

- `src/styles/global.css`: `.grid-cards` kini memakai
  `minmax(min(320px, 100%), 1fr)` — identik hasilnya di setiap lebar di atas
  320px, tapi tidak bisa lagi dipaksa overflow oleh track-nya sendiri.
- `AGENTS.md`, `AGENTS.id.md`, `docs/awcms-astro/ui-ux-design-system.md`, dan
  `.id.md`-nya menulis "kartu 328px … skala 0.41" — aritmetika untuk padding
  1rem yang sudah lama tidak sama dengan padding 1.25rem yang sungguh berlaku
  di `.container`. Angkanya kini 320px dan skala 0.40 (kesimpulannya tidak
  berubah: 22px × 0,40 = 8,8px, tetap di bawah 9px dan praktis tidak terbaca).
- Aturan lantai 360px sebelumnya tidak punya satu pun pemeriksa. Kini ada:
  `tests/lebar-360.test.mjs` membaca padding `.container` dan lantai 360px,
  menurunkan lebar bersihnya dari CSS itu sendiri (bukan menulis ulang "320"
  sebagai angka tetap), dan menolak `minmax(<N>px|rem, …)` atau
  `width`/`min-width` tetap lain di `src/styles/global.css` yang mencapai atau
  melebihi lebar itu tanpa jalan keluar `min(…, 100%)`, media query khusus
  layar lebar, atau `overflow-x` pada dirinya sendiri — juga menjaga angka
  kartu/skala di `AGENTS.md` tetap sinkron dengan aritmetika CSS yang
  sebenarnya. Gerbang ini statik atas teks CSS: ia tidak bisa membuktikan
  keamanan render sungguhan (pembulatan sub-piksel, metrik font nyata,
  scrollbar sungguhan) — itu butuh pemeriksaan headless-browser
  `document.documentElement.scrollWidth <= 360` atas halaman yang sudah
  dibangun, terhadap `awcms` backend yang hidup.
- `AGENTS.md`/`.id.md` §Interface, item Definition of Done tentang 360px, dan
  `.claude/skills/awcms-astro-gerbang/SKILL.md`/`.id.md` kini menyebut gerbang
  baru ini; hitungan `bun test` di keenam dokumen yang dijaga
  `tests/documented-counts.test.mjs` naik dari 39 ke 40.
