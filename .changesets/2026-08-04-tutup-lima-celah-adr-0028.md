---
tingkat: minor
tanggal: 2026-08-04
---

# Lima dari sembilan celah ADR-0028 ditutup, masing-masing bersama pemeriksanya

[ADR-0028](../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) mencatat
sembilan celah dan sengaja tidak menutup satu pun — menutupnya diam-diam bersama
ADR yang menamainya akan membuat pekerjaan itu tidak bisa dibedakan dari
pekerjaan yang mengklaim lebih dari yang dilakukannya. Ini penutupannya, dan
tiap satunya membawa gerbang yang membuktikannya.

## Celah 1 — `Strict-Transport-Security`, digerbangi produksi

[ADR-0029](../docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md).
Permintaan **pertama** seorang pembaca — `contoh.go.id` diketik tanpa skema —
berhenti bisa dibajak setelah kunjungan pertamanya.

Dua keputusan di dalamnya yang tidak terbaca dari diff-nya:

**Gerbang produksinya bukan kerapian.** HSTS tidak bisa dibatalkan dari sisi
situs, dan ia berlaku untuk HOST — bukan untuk situs. `bun run serve`
menjalankan berkas yang sama dengan produksi, jadi sekali ia mengirim HSTS di
`localhost`, **setiap proyek lain** yang dikembangkan pemilik mesin di
`http://localhost:<port>` ikut terkunci selama setahun, tanpa cara mencabutnya
selain menyunting internal browser. Asersi yang menjaganya karena itu terbalik
arah: yang diuji adalah HSTS **TIDAK** dikirim di luar produksi.

**`includeSubDomains` sengaja tidak ikut, berbeda dari `awcms`.** `awcms` satu
deployment yang operatornya tahu persis subdomainnya. Template ini berjalan di
domain milik organisasi yang hampir pasti punya layanan lain di subdomain lain,
dan direktif itu memaksa semuanya HTTPS-saja selama setahun — yang menanggung
akibatnya layanan lain, yang pemiliknya tidak ikut memutuskan.

## Celah 5 — `Server` dan `X-Powered-By`

Dihapus `pasangHeader`, bukan sekadar diasersi: **"tidak dikirim hari ini" dan
"tidak akan dikirim" adalah dua hal berbeda**, dan sebuah middleware yang
ditambahkan kelak bisa memasangnya tanpa siapa pun memutuskannya.

## Celah 4 — batas waktu `awcmsGet`

`AbortSignal.timeout`, bawaan 30 detik, diubah lewat `AWCMS_API_TIMEOUT_MS`.

Ia **tidak** bertabrakan dengan aturan "tanpa retry", dan bedanya perlu
dipegang: tanpa-retry memutuskan apa yang terjadi saat `awcms` menjawab buruk;
batas waktu memutuskan apa yang terjadi saat ia **tidak pernah menjawab sama
sekali** — bentuk kegagalan paling umum dari basis data yang kehabisan koneksi.
`fetch` tidak punya batas waktu bawaan, jadi sebelum ini build menggantung
sampai batas job CI membunuhnya, dengan pesan yang menyebut nama job alih-alih
`awcms`.

Batasnya longgar dan itu disengaja: `view=full` membawa `contentJson` utuh, dan
menyetelnya ke nilai "jalur permintaan sehat" mengubah build lambat menjadi
build gagal. Nilai yang cacat **ditolak**, termasuk `0` — yang terlihat seperti
"tanpa batas" dan justru mengembalikan gantungan yang gerbang ini cegah.

## Celah 2 — `fetchpriority="high"`

`standar-teknis.md` mewajibkannya sejak dokumen itu ditulis; `Ilustrasi.astro`
hanya memasang `loading="eager"`. Aturan tertulis berbulan-bulan tanpa
pemeriksa, lalu dilanggar tanpa satu pun yang merah.

Keduanya dibutuhkan dan tidak saling menggantikan: `eager` hanya berarti "jangan
tunda", sementara prioritas bawaan sebuah `<img>` tetap **Low** sampai layout
membuktikan ia di viewport — jadi elemen LCP mengantre di belakang setiap gambar
lain yang ditemukan lebih dulu, dan halamannya tetap terbit dengan benar. Yang
berubah hanya angka yang tidak dilihat siapa pun di dalam build.

## Celah 3 — anggaran gambar, diukur untuk pertama kalinya

250 KB beranda / 100 KB halaman konten sudah tertulis sejak dibawa dari repo
rujukan dan **tidak pernah diukur satu kali pun**. Datanya selama ini sudah ada
di tangan `audit:konten`.

Yang ditimbang hanya gambar yang benar-benar **diterbitkan build ini** — media
`awcms` tidak ada di `dist/client`, jadi gerbang ini menjaga seni lokal dan
bukan seluruh berat halaman. Batas itu disebut di skripnya alih-alih dibiarkan
tampak lebih luas.

## Cara gerbangnya dibuktikan

Kelima asersi baru pada `bun test` **mutation-proven**: tiap satunya dijalankan
dengan kontrolnya dicabut dan terbukti MERAH, lalu hijau lagi setelah dipulihkan.
Yang paling meyakinkan: melepas `AbortSignal.timeout` membuat tesnya
**menggantung sampai batas waktu**, persis cacat yang ia tutup.

Dua gerbang keluaran baru butuh `dist/client`, jadi keduanya dibuktikan atas
pohon fixture sungguhan — merah saat cacatnya ada, hijau saat tidak, dengan
beranda 150 KB LOLOS dan halaman konten 150 KB DITOLAK, membuktikan kedua
anggaran benar-benar dibedakan.

## Empat celah TETAP terbuka, dengan sadar

Pin action/image ke SHA (6), analisis statik (7), pengukuran Core Web Vitals (8),
dan SBOM rilis (9). Tiga di antaranya menyentuh rantai pasok dan menuntut
keputusan tooling yang lebih baik diambil sekali untuk kedua repo keluarga.
Celah 8 butuh Chrome di CI dan hanya berjalan pada situs yang punya sumber
konten — ia **tidak bisa dibuktikan di repo template ini**, dan gerbang yang
tidak bisa dibuktikan di tempat ia ditulis adalah gerbang yang akan membusuk.

Baris yang **tertutup** tetap di tabel dokumen standar. Dihapus, celahnya akan
diusulkan lagi sebagai temuan baru enam bulan kemudian, dan pemeriksanya akan
dilonggarkan oleh orang yang tidak tahu kenapa ia ada.

## Variabel env baru

`AWCMS_API_TIMEOUT_MS` — opsional, terdokumentasi di `.env.example` beserta
konsekuensi salah isi, termasuk kenapa `0` ditolak.
