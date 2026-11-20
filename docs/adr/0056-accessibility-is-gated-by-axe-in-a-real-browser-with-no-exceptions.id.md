🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.md)

<!-- i18n-source-hash: sha256:16bbb1cd43292abdbc52bac92eddb2ac9e5897befb0ee1f5a01e1fe4c79d9470 -->

# ADR-0056 — Aksesibilitas dijaga axe di peramban sungguhan, tanpa pengecualian

- **Status:** Diterima
- **Tanggal:** 19 November 2026
- **Terkait:** [ADR-0055](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.id.md) (panel yang tindak lanjut 1-nya ditutup di sini), [ADR-0019](0019-csp-ketat-dikirim-penyaji.id.md) (CSP ketat tempat gerbang ini berjalan), [ADR-0053](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.id.md) (`Check` adalah status wajib), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (aturan tertulis mendapat pemeriksanya), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.id.md) (Bun, satu deklarasi `bun-version` per job), isu #179

## Konteks

Repo ini menyatakan halaman publiknya memenuhi WCAG 2.2 AA pada markup-nya
sendiri (ADR-0055; batas minimum dinaikkan dari 2.1 AA pada perubahan isu #179).
Sampai ADR ini, **tidak ada yang memeriksa klaim itu pada setiap perubahan.**

Dua hal membuatnya terlihat:

- Isu #179 menemukan lima cacat yang sudah tayang sebelum panel preferensi baca
  ada. Ditemukan dengan menjalankan axe-core di peramban **sekali, manual, dari
  luar repo**, dan perbaikannya hanya bisa dijaga secara statis
  (`tests/aksesibilitas-halaman.test.mjs` menghitung kontras token dan menelusuri
  markup). Pemeriksaan statis membuktikan cacat yang ditulis untuknya tidak
  kembali; ia tidak bisa menemukan cacat berikutnya.
- Tindak lanjut 1 ADR-0055 mencatat celah yang sama: penanganan fokus, axe dengan
  panel terbuka, dan luapan mendatar di 360 px diverifikasi sekali secara manual
  dan "tidak bisa diulang dari repo".

Kontras warna adalah kasus paling jelas. Ia sifat gaya **terhitung** dari halaman
yang **dirender** (kaskade, tema, palet preferensi baca, animasi yang tertangkap
di tengah jalan), sehingga tidak bisa dibaca dari teks CSS. Repo yang
aksesibilitasnya bergantung pada kontras, dan satu-satunya pemeriksaan
kontrasnya adalah aritmetika atas dua token, sedang menjaga aritmetikanya.

### Posisi dalam alur pengembangan

Ini perkakas langkah 11 untuk halaman publik yang sudah ada (gerbang uji dan
koreksi yang dipaksakannya), bukan layar baru: tanpa model data, kontrak, atau
endpoint baru, sehingga langkah 5 sampai 8 tidak berlaku. Pemilik memutuskan
menambahkan gerbang ini pada **19 November 2026** (dialog keputusan, opsi
"tambahkan"). Keputusan dicatat oleh orchestrator.

## Opsi yang dipertimbangkan

| Opsi | Yang dilakukan | Kekuatan | Kelemahan |
| --- | --- | --- | --- |
| **A. axe-core di Chromium lewat Playwright, di CI, atas build produksi dan `awcms` tiruan** (dipilih) | Membangun situs, menyajikannya dengan server asli (CSP asli), memuat tiap halaman di peramban sungguhan, menjalankan axe | Melihat kontras terhitung, DOM yang dirender, hasil pencarian yang dibangun di peramban, setiap mode preferensi baca; bisa diulang; jalan di repo template | Peramban di CI (sekitar satu menit tambahan); backend tiruan yang harus dirawat |
| B. Hanya pemeriksaan statis (keadaan sekarang) | Aritmetika token dan penelusuran markup | Tanpa peramban, cepat | Tidak melihat gaya terhitung, markup yang dirender klien, atau interaksi; hanya menemukan apa yang ditulis untuk ditemukan |
| C. axe di atas `happy-dom`/`jsdom` | Menjalankan axe di DOM simulasi | Tanpa peramban | Keduanya tidak mengimplementasikan tata letak dan kaskade seperti peramban, sehingga `color-contrast` dilewati atau salah; hijau di sini adalah jaminan semu |
| D. Kategori aksesibilitas Lighthouse | Sudah jalan di job `build` (ADR-0032) | Tanpa alat baru | Hanya jalan bila situs punya sumber konten; melaporkan **skor** berbobot, dan skor di bawah 100 bukan kegagalan; menjalankan sebagian aturan axe |
| E. Audit manual sebelum tiap rilis | Orang dengan teknologi bantu | Menemukan yang tak terlihat axe | Tidak bisa diulang per perubahan; ini pelengkap dan tetap ditunda ke UAT (ADR-0055), bukan pengganti |

Orchestrator memutuskan **A**, dan pemilik memilih menambahkannya pada 19 November 2026.

## Keputusan

1. **Gerbangnya adalah axe-core, di Chromium sungguhan, atas build produksi yang
   disajikan `server/penyaji.mjs`** (sehingga CSP ADR-0019 berlaku persis seperti
   di produksi). `bun run test:a11y` melakukan semuanya: menyalakan `awcms`
   tiruan, membangun, menyalakan server, menjalankan Playwright, dan hanya
   menghentikan proses yang ia nyalakan sendiri. Port diambil dari OS, sehingga
   host bersama yang sibuk tidak pernah bertabrakan.
2. **Himpunan aturannya adalah lima tag WCAG:** `wcag2a`, `wcag2aa`, `wcag21a`,
   `wcag21aa`, `wcag22aa`. Aturan best-practice dan `wcag2aaa` tidak masuk gerbang.
3. **Kegagalan adalah pelanggaran apa pun, dengan dampak apa pun.** Tanpa
   pengecualian, tanpa `disableRules`, tanpa `exclude()`, tanpa berkas baseline,
   tanpa daftar "masalah yang diketahui". Temuan nyata diperbaiki di kode. Bila
   sebuah temuan sungguh di luar kendali repo ini, itu dilaporkan dan diputuskan
   dalam ADR; ia tidak ditambahkan ke daftar di dalam tes. Run pertama menemukan
   cacat nyata, dan semuanya diperbaiki (di bawah).
4. **Yang diuji** (45 kasus, terang dan gelap bila berlaku):
   - **Halaman**, locale bawaan dan Inggris: beranda, beranda berbahasa Inggris,
     daftar tab, artikel (tabel biaya, langkah, FAQ, dasar hukum, isi kaya,
     tautan kategori dan tag), artikel yang sama dalam bahasa Inggris, arsip
     kategori, arsip tag, halaman pencarian kosong, halaman pencarian **dengan
     hasil dan facet** (dibangun di peramban dari awcms tiruan), halaman privasi,
     halaman peta situs. Menu footer, widget header dan footer, dan formulir
     buletin dirender oleh fixture, sehingga ada di setiap halaman.
   - **Beranda dengan setiap mode preferensi baca sendirian** (ADR-0055): teks
     besar, teks sangat besar, kontras tinggi, monokrom, ramah disleksia, garis
     bawah tautan, sorot tautan, kurangi gerakan, dan semuanya sekaligus. Setiap
     mode dipasang lewat kunci `localStorage` `awcms-a11y`, dan kasus lebih dulu
     menegaskan atribut `data-a11y-*` yang sesuai ada di `<html>`, sehingga mode
     yang tak pernah berlaku tidak bisa lolos tanpa makna.
   - **Artikel, pencarian dengan hasil, dan beranda di 360 px dengan setiap
     preferensi aktif,** yang juga menegaskan tidak ada gulir mendatar.
   - **Panel itu sendiri terbuka,** dengan bawaan dan dengan semua preferensi aktif.
5. **`awcms` tiruan (`e2e/awcms-tiruan.mjs`) baca-saja dan tetap.** Ia ada supaya
   gerbang bisa jalan di repo template, yang tidak punya instans `awcms` (alasan
   job `build` dikondisikan pada `vars.AWCMS_API_URL`). Ia menjawab permintaan yang
   dibuat build dan halaman pencarian dengan korpus kecil yang dipilih untuk
   menaruh setiap jenis markup di depan axe. **Ia membuktikan markup-nya
   aksesibel, bukan bahwa template ini bisa berbicara dengan `awcms`**: klaim itu
   tetap milik job `build` bersyarat dan `tests/kontrak-awcms.test.mjs`.
6. **Ia tinggal di job `check`, bukan di job baru dan bukan di `build`.** `build`
   tidak jalan di repo template; job baru akan menambah deklarasi `bun-version`
   ketiga yang menurut ADR-0015 dan `tests/versi-toolchain.test.mjs` harus
   bergerak bersama; dan `Check` sudah menjadi status wajib di `main` (ADR-0053),
   sehingga gerbang ini menahan merge tanpa perubahan ruleset yang tidak bisa
   diverifikasi gerbang mana pun. Chromium dipasang dengan
   `bunx --bun playwright install --with-deps chromium` dan unduhannya di-cache
   menurut lockfile. Jejak hanya diunggah bila gagal.
7. **Ia tetap di luar `bun test`.** Spesifikasinya `e2e/*.axe.mjs`, bukan
   `*.test.*` atau `*.spec.*`: `bun test` memungut kedua pola itu secara rekursif
   dan akan menjalankan spesifikasi Playwright di runner-nya sendiri. `e2e/` di
   luar `tests/`, sehingga hitungan berkas gerbang yang dikutip dokumen
   (`tests/documented-counts.test.mjs`) tidak berubah.
8. **Versi dipin, dan alasannya.** `@playwright/test` **1.65.0** dan
   `@axe-core/playwright` **4.14.0** (axe-core 4.14), persis, di
   `devDependencies`. Keduanya rilis terbaru yang usianya sudah paling sedikit dua
   minggu pada 19 November 2026 (1.65.0 terbit 5 November; 1.65.1 pada 13
   November terlalu baru; `@axe-core/playwright` 4.14.0 pada 15 Oktober). Repo ini
   tidak mengambil rilis sebelum matang, supaya regresi di rilis baru ditemukan
   orang lain lebih dulu.
9. **Rilis axe baru boleh memerahkan gerbang.** axe menambah dan memperketat
   aturan antarversi. Itulah gunanya gerbang, dan jawabannya memperbaiki markup,
   bukan memin axe selamanya; versinya hanya bergerak lewat perubahan yang sengaja.
10. **Gerbang menyebut apa yang tak bisa dilihatnya.** axe hanya menemukan bagian
    WCAG yang bisa diotomasi. Run hijau berarti "tidak ada pelanggaran yang bisa
    diotomasi di bawah tag ini pada halaman ini", tidak pernah "aksesibel" atau
    "patuh", dan tidak ada yang di repo ini mengklaim sebaliknya (ini juga menjaga
    aturan ADR-0055 bahwa panel bukan klaim kepatuhan).

### Analisis trade-off

| Kriteria | A, dipilih | B (statis saja) | C (jsdom) | D (Lighthouse) |
| --- | --- | --- | --- | --- |
| Keamanan | Dependensi dev dan peramban di CI, dari registry dan CDN Playwright; tanpa kode runtime, tanpa origin baru di produksi; tiruan terikat ke `127.0.0.1` | Tetap | Dependensi dev | Sudah ada |
| Performa | Tanpa efek pada halaman; menambah sekitar satu menit ke `Check` | Tidak ada | Kecil | Sudah dibayar |
| Kemudahan perawatan | Fixture yang harus sejalan dengan bentuk `awcms` yang dibaca build; kasus gagal menyebut aturan, simpul, dan URL bantuan | Murah, tetapi tiap aturan ditulis tangan | Murah | Hanya konfigurasi |
| Skalabilitas | Kasus adalah data (daftar halaman dan daftar mode); halaman baru satu baris | Satu pemeriksa per cacat | Seperti A, tanpa peramban | URL sampel |
| Aksesibilitas | Menemukan cacat gaya terhitung dan DOM yang dirender, dengan mode panel yang asli | Hanya cacat yang sudah diketahui | Melewatkan kontras | Parsial, berskor |
| Dampak SEO | Tidak langsung; perbaikannya menghapus cacat kontras, penamaan, dan urutan judul yang juga memengaruhi kegunaan | Tidak ada | Tidak ada | Tidak ada |
| UI/UX | Memaksa perubahan terlihat pada warna tautan (lihat Konsekuensi); tanpa perubahan tata letak | Tidak ada | Tidak ada | Tidak ada |
| Kompatibilitas | Hanya Chromium; Firefox dan WebKit tidak tercakup | Tidak berlaku | Tidak berlaku | Chromium |
| Kompleksitas operasional | Satu skrip, satu konfigurasi, satu fixture lagi; pemasangan Chromium di CI | Tidak ada | Sedikit | Tidak ada |
| Implikasi jangka panjang | Klaim 2.2 AA diperiksa per perubahan; aturan axe baru bisa memerahkannya | Klaim membusuk diam-diam | Jaminan semu | Skor yang menyembunyikan kegagalan |

## Konsekuensi

- **Run pertama menemukan cacat nyata pada markup dan gaya template sendiri, dan
  semuanya diperbaiki dalam perubahan ini** (tidak ada yang dikecualikan):
  - **Warna tautan (`1.4.3`, `1.4.1`).** Warna tautan dasar `--accent-primary`
    (`#0284c7`) 3,91:1 di atas latar halaman, sehingga setiap tautan biasa di teks
    isi, tautan kategori dan tag, dan pil tab aktif (3,56:1) gagal. Tautan kini
    memakai `--accent-hover` (5,67:1; lebih terang, sehingga lebih tinggi, di tema
    gelap). Tautan di dalam isi artikel diberi garis bawah, karena
    `link-in-text-block` menuntut pembedaan lebih dari warna. **Ini perubahan
    terlihat bagi setiap situs turunan template** yang belum menimpa warna tautan.
  - **Lencana emerald (`1.4.3`).** Putih di atas `#059669` 3,76:1 (2,53:1 di tema
    gelap). Lencana kini `#047857` dengan teks putih (5,48:1) di kedua tema.
  - **Blok buletin di footer (`1.4.3`).** Teks ajakan `#334155` di atas `#090d16`
    (1,87:1) dan label isian `#64748b` (4,08:1): gaya scoped komponen tidak
    menjangkau, dan lebih spesifik daripada, aturan footer. Keduanya kini memakai
    warna footer. Hanya situs yang menyalakan buletin yang melihatnya.
  - **Chip facet pencarian (`aria-allowed-attr`).** Chip adalah tautan dan
    membawa `aria-pressed`, yang oleh ARIA hanya sah pada tombol. Yang terpilih
    kini membawa `aria-current="true"`, dan warnanya memakai `--accent-hover`.
  - **Daerah gulir tabel biaya (`scrollable-region-focusable`).** Di 360 px dengan
    teks sangat besar tabel menggulir ke samping dan papan ketik tidak bisa
    menjangkaunya. Pembungkusnya kini daerah yang bisa difokus dan bernama.
  - **Mode sorot tautan.** Tautan yang labelnya ada di elemen anak (baris
    "Terbaru") mempertahankan teks terang anak-anaknya di atas isian kuning
    (1,16:1). Anak-anaknya kini mengikuti warna tautan.
  - **Tes itu sendiri.** Pudar-masuk yang diukur di tengah jalan melaporkan kontras
    yang tak dilihat pembaca lebih dari sekejap, dan membuat hasil bergantung pada
    kecepatan mesin. Gerbang menunggu font dan setiap animasi terhingga selesai
    sebelum menjalankan axe.
- **Warna tautan dasar bergeser untuk semua orang.** Ini perbaikan paling sedikit
  mengganggu yang menjangkau akar masalah alih-alih menimpa tiap tempat, tetapi
  situs turunan dengan palet sendiri perlu memastikan aksennya sendiri masih
  mencapai 4,5:1 terhadap latarnya; gerbang berjalan atas kontennya sendiri dan
  akan mengatakannya.
- **`Check` jadi lebih lama.** Terukur sekitar satu menit (pemasangan Chromium,
  build kedua, 45 kasus); angkanya dicatat di pull request, bukan di sini, karena
  kecepatan runner bergeser.
- **Situs turunan menjalankan gerbang atas awcms tiruan, bukan kontennya sendiri.**
  Ia bisa menambah halaman ke daftar di `e2e/a11y.axe.mjs`, tetapi build yang
  diujinya adalah milik tiruan. Menjalankan axe atas halaman nyata situs turunan
  butuh sumber konten, yang hanya dimiliki situs itu, dan merupakan keputusannya sendiri.
- **Hanya Chromium.** Perbedaan pohon aksesibilitas di mesin lain tidak terlihat.

## Tindak lanjut

1. **Uji kegunaan dengan pembaca nyata di UAT (langkah 14),** tidak berubah dari
   ADR-0055: axe tidak menggantikan pembaca yang memakai preferensi ini atau
   teknologi bantu.
2. **Perilaku fokus panel sebagai asersi** (Esc dan klik di luar mengembalikan
   fokus, ketahanan tiap sakelar setelah muat ulang) diuji manual dan oleh
   `tests/aksesibilitas.test.mjs` di tingkat logika; menambahkannya ke gerbang ini
   adalah kasus berikutnya yang murah, tidak dilakukan di sini karena ADR ini
   adalah gerbang axe.
3. **Mesin lain** (Firefox, WebKit) bila basis pembaca menunjukkan itu penting.

## Verifikasi

`bun run test:a11y` menjalankan 45 kasus dan keluar bukan-nol pada pelanggaran
apa pun. Dijalankan tanpa perbaikan dalam perubahan ini, gerbang gagal pada 39
dari 45 kasus, yang menjadi bukti ia bisa gagal. Gerbang unit tetap hijau:
`tests/aksesibilitas-halaman.test.mjs` dan `tests/aksesibilitas.test.mjs` tetap
membuktikan yang mereka buktikan, dan `tests/documented-counts.test.mjs` tidak
terpengaruh karena `e2e/` di luar `tests/`.

## Amandemen (2026-11-19: uji kegunaan pindah ke repo implementasi)

Keputusan pemilik **2026-11-19**: repo upstream (`awcms`, `awcms-astro`, `awcms-one`) tidak menjalankan UAT; UAT (langkah 14 alur pengembangan) dijalankan di repo implementasi atau proyek turunan, selaras dengan standar lintas-portofolio internal.

Catatan opsi E bahwa audit manual "tetap ditunda ke UAT (ADR-0055)" dan tindak lanjut 1 ("uji kegunaan dengan pembaca nyata di UAT") **diganti** oleh ini: keduanya bukan prasyarat gerbang 15 di repo ini; keduanya milik UAT tiap situs turunan yang mengadopsi template. Gerbang yang diputuskan di sini tidak berubah.
