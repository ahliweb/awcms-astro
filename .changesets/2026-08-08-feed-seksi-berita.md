---
tipe: fitur
dampak: publik
---

# Seksi berita bisa dilanggan, dan setiap `.xml` di keluaran akhirnya punya gerbangnya

[ADR-0033](../docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
menunda feed dan menuliskan alasannya sebagai temuan alih-alih sebagai biaya:
**satu-satunya `.xml` yang dibaca gerbang mana pun adalah `sitemap*.xml`**, dan
bahkan gerbang itu melewati setiap `<loc>` berakhiran `.xml` tanpa suara —
pemindai halaman hanya mengambil `**/*.html`. Sebuah feed yang menunjuk artikel
yang sudah dicabut, memuat nama key PO mentah sebagai judul, membawa URL relatif
(ilegal di Atom maupun RSS), atau mengaku diperbarui pada jam build akan lolos
kelima gerbang repo ini dengan build hijau.

Alasan lengkapnya di
[ADR-0035](../docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md).
Yang mendarat lebih dulu adalah keluarga gerbangnya; feed-nya menumpang di
atasnya.

- **Sebuah tab yang menyatakan dirinya `urutanSeksi: "terbaru"` menerbitkan feed
  Atom** di `/{tab}/feed.xml`, dan di `/{lang}/{tab}/feed.xml` untuk tiap locale
  berprefiks. Tidak ada yang perlu disunting selain deklarasi tab itu.
- **Seksi `"manual"` tidak menerbitkan feed**, dan itu bukan penghematan: langkah
  1 sebuah panduan akan terdorong ke setiap pelanggan setiap kali panduannya
  disunting, dan halaman berumur tiga tahun akan sampai sebagai kabar hari ini.
- **Seksi berita yang KOSONG juga tidak.** Atom mewajibkan `<updated>` pada
  feed, dan satu-satunya nilai yang tersedia untuk seksi kosong adalah jam build
  — angka yang repo ini sudah tolak untuk `lastmod` sitemap dengan alasan yang
  sama. Halaman seksinya juga tidak memasang tautan ke berkas yang tidak ada.
- **Atom 1.0, bukan RSS 2.0.** RSS nyaris tidak mewajibkan apa pun — judul,
  tanggal, `guid` semuanya opsional dan tautan boleh relatif — sehingga feed yang
  rusak tetap "valid" dan gerbang atasnya hanya bisa memeriksa hal-hal yang
  kebetulan ada. Setiap tuntutan gerbang di bawah adalah tuntutan yang sudah ada
  di spesifikasi Atom; tidak satu pun dikarang repo ini.
- **Feed membawa ringkasan, bukan isi artikel.** Mengirim `bodyHtml` penuh berarti
  menerbitkan markup ke permukaan yang tidak dilewati CSP mana pun dan tidak
  dibaca gerbang aset mana pun. Konsekuensinya dinyatakan: pelanggan membaca
  ringkasan lalu mengklik.
- **Halaman seksi DAN halaman artikel mengumumkan feed-nya** lewat
  `<link rel="alternate" type="application/atom+xml">` — yang terakhir karena di
  sanalah seorang pembaca paling mungkin memutuskan untuk berlangganan.
- **Feed keluar dari sitemap.** Sitemap mendaftarkan halaman; feed adalah
  representasi kedua dari halaman seksi yang sudah terdaftar sendiri. Dan
  gerbang sitemap melewati setiap `<loc>` `.xml` tanpa suara, jadi entri yang
  salah tidak akan terlihat di sana.
- **`Content-Type: application/atom+xml` dipasang `server/penyaji.mjs`.** ADR-0033
  menulis bahwa ini "tidak bisa disiasati" karena build statis membuang header
  endpoint. Bagian itu benar; yang tidak lengkap adalah bahwa lapisan yang
  membuangnya justru lapisan yang kita miliki (ADR-0016). Batasnya tetap
  dinyatakan: situs yang menaruh `dist/client` di belakang host statis orang lain
  kembali mendapat `application/xml` dari host itu.

**Template ini tidak berubah perilakunya.** Ketiga tabnya tetap `"manual"`, jadi
nol berkas feed lahir dan nol tautan penemuan-otomatis dipasang. Yang mendarat
kemampuannya, dan gerbangnya.

Yang hanya terasa saat mengembangkan:

- **`audit:konten` memindai `**\/*.xml`, bukan `**\/feed.xml`.** Yang ditemukan
  ADR-0033 bukan "feed tidak diperiksa" melainkan "berkas `.xml` bernama lain
  tidak dibaca siapa pun" — gerbang yang hanya mencari `feed.xml` akan mengulangi
  celah itu pada nama berikutnya. Setiap `.xml` yang bukan sitemap kini wajib
  berupa feed Atom yang sah, atau dilaporkan sebagai berkas yang tidak dibaca
  gerbang mana pun. Menerbitkan `opensearch.xml` sekarang menuntut keputusan
  sadar dan gerbangnya sendiri.
- **Gerbangnya dibuktikan di tempat ia tidak bisa berjalan.** Template menyatakan
  nol seksi berita, jadi gerbang feed tidak akan pernah menemukan berkas untuk
  diperiksa di sini — beban yang sama dengan celah 10. Tiga berkas menjawabnya
  dari tiga sisi: `tests/feed.test.mjs` (pembangunnya, murni),
  `tests/audit-konten.test.mjs` (gerbangnya atas pohon fixture, dua arah,
  **16 mutasi dijalankan satu per satu dan 16 memerahkan tes yang berbeda**), dan
  `tests/kontrak-awcms.test.mjs` (**sambungannya** — pembangun dan pemeriksa yang
  keduanya benar tidak menjamin apa pun bila perekatnya mengirim kolom yang
  salah; kedua rute ikut dipanggil langsung, karena `getStaticPaths` dan `GET`
  hanya berjalan saat build menemukan seksi berita).
- Tanggal feed diperiksa berbentuk **RFC 3339**, bukan "apa pun yang `new Date`
  terima". Selisihnya nyata: `2026-08-01` sah di JavaScript, melanggar Atom, dan
  entry-nya dibuang sebagian pembaca tanpa satu pesan pun.
- `src/lib/tanggal.ts` kehilangan satu docblock yang tergeser saat ADR-0033
  mendarat — penjelasan `tanggalMesin` menempel pada
  `pernahDiubahSetelahTerbit`. Dikembalikan ke fungsinya.

**Yang belum ada, dan sengaja:** feed situs-lebar, paginasi feed, RSS/JSON Feed
di samping Atom, dan `<content>` penuh. Alasan masing-masing di §"Yang TIDAK
dibangun" ADR-0035 — dua di antaranya penolakan, bukan penundaan.
