---
tipe: struktur
dampak: internal
---

# Gerbang terbesar repo ini akhirnya punya gerbangnya sendiri

`scripts/audit-konten.mjs` adalah skrip gerbang terbesar di sini (879 baris) dan
satu-satunya yang tidak punya tesnya sendiri — `audit-dokumen.mjs` dan
`audit-graf.mjs` masing-masing dijaga sejak hari mereka lahir. Yang membuat
selisih itu mahal bukan jumlah barisnya melainkan **kapan** barisnya berjalan:
seluruh keluarga keluaran berada di belakang `if (existsSync("dist/client"))`,
dan `dist/client` lahir dari build yang butuh sumber konten `awcms` yang tidak
dimiliki repo template. Akibatnya ~330 baris pemeriksa — SEO, hreflang, aset
yang dijanjikan metadata, tautan mati, sitemap, nama key bocor, dan **kedua
gerbang performa ADR-0028** — tidak pernah dieksekusi satu kali pun di repo
tempat ia ditulis.

Itu bukan soal kelengkapan. Celah 2 dan 3 di tabel
[`standar-performa-dan-keamanan.md`](../docs/awcms-astro/standar-performa-dan-keamanan.md)
berbunyi **DITUTUP** dan menyebut kedua fungsi itu sebagai pemeriksanya; satu
regex yang berhenti cocok akan membuat keduanya diam-diam berhenti memeriksa apa
pun, dan tidak ada satu gerbang pun di repo ini yang akan merah. Keadaan yang
persis dilarang ADR-0032 — gerbang yang tidak bisa dibuktikan di tempat ia
ditulis akan membusuk — dan kali ini yang membusuk adalah pemeriksa dari tabel
celah itu sendiri. Ia masuk tabel sebagai **celah 10**, sesuai aturan tabel itu:
temuan baru mendapat nomor, bukan menggantikan baris lama.

- `tests/audit-konten.test.mjs`: 53 kasus atas pohon fixture sungguhan di
  direktori sementara. Skripnya dijalankan **apa adanya** lewat `cwd` fixture —
  tanpa argumen akar, tanpa bendera uji, karena mode yang hanya hidup di tes
  adalah jalur kode yang tidak pernah dipakai situs mana pun.
- Tiap keluarga dibuktikan **dua arah**, dan arah kedua yang menahan biaya
  terbesar: pemeriksa yang memerahkan segalanya lulus uji "ia menangkap cacat
  ini" tanpa berguna sama sekali. Pengecualian yang disengaja ikut diuji —
  judul kembar antar locale, halaman `noindex` tanpa canonical, rasio yang
  TIDAK dituntut di `public/`, dan berkas yang sama dipakai dua kali dihitung
  satu unduhan — supaya tidak dihapus orang berikutnya yang membacanya sebagai
  kelalaian.
- **Mutation-proven.** Tiga belas mutasi dijalankan terhadap skripnya, satu per
  satu, dan **sebelas memerahkan tes yang berbeda**: mencabut tuntutan
  `fetchpriority`, menyamakan anggaran halaman konten dengan anggaran beranda,
  mencabut dedup `src`, mencabut resiprositas hreflang, berhenti melaporkan
  judul kembar, mengabaikan namespace katalog, memperlakukan dimensi yang tak
  terbaca sebagai lulus, mencabut pengecualian rasio `public/`, mencabut
  masing-masing dari dua cabang penelusuran gambar JSON-LD, berhenti memeriksa
  `<loc>` sitemap, dan menghapus catatan "DILEWATI".
- **Dua mutasi selamat, dan keduanya menemukan sesuatu yang nyata.** Yang
  pertama lubang di tes — cabang `image` JSON-LD tidak pernah diuji karena
  kasusnya kebetulan lewat cabang `ImageObject.url`; kini keduanya punya
  kasusnya sendiri. Yang kedua bukan lubang melainkan penyaring
  `mailto:|tel:|data:|javascript:` yang **tidak bisa dimutasi dari luar**:
  `internal()` sudah menolak skema itu lebih dulu. Itu ditulis di tesnya
  sebagai catatan kejujuran alih-alih dihitung sebagai cakupan.

Batas yang ikut dinyatakan: fixture bukan situs. Yang dibuktikan adalah logika
gerbangnya, bukan bahwa `astro build` sungguhan memancarkan bentuk yang sama —
itu hanya bisa dibuktikan sebuah SITUS, di mana `bun run audit:konten` setelah
build memang berjalan pada tiap PR.
