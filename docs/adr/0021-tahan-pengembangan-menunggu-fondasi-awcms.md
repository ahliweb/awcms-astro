# ADR-0021 — Pengembangan repo ini ditahan sampai fondasi `awcms` selesai

- **Status:** Accepted
- **Tanggal:** 2 Agustus 2026
- **Aturan pemilik:** 2 Agustus 2026 — "pengembangan lanjutan repo ini menanti pengembangan **dasar** pada repo `ahliweb/awcms` selesai dulu, baru lanjut pengembangan dari repo ini."
- **Terkait:** [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (layar admin kembali ke `awcms` — keputusan yang memindahkan pusat gravitasi pekerjaan ke sana), `awcms` [ADR-0047](https://github.com/ahliweb/awcms/blob/main/docs/adr/0047-mini-micro-frozen-foundation-built-here.md) (pembekuan `awcms-mini`/`awcms-micro`), `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)

## Konteks

Empat perubahan mendarat di repo ini pada 2 Agustus 2026 dan menutup seluruh
pekerjaan yang bisa diselesaikan tanpa `awcms` bergerak lebih dulu: CSP ketat
yang benar-benar dikirim (ADR-0019), gerbang audit konten atas keluaran build,
penyelarasan CI dengan ADR-0018, dan penyelarasan peran repo dengan `awcms`
ADR-0051 (ADR-0020).

Yang tersisa di backlog **semuanya menunggu `awcms`**, dan itu bukan kebetulan.
ADR-0020 baru saja memindahkan seluruh layar admin ke `awcms`; `awcms` ADR-0047
membekukan `awcms-mini`/`awcms-micro` sehingga fitur fondasi dirintis langsung di
`awcms`; dan audit permukaan admin `awcms` menemukan 13 dari 21 modul tanpa satu
pun layar, yang kini sedang dikerjakan bergelombang. Pusat gravitasi pekerjaan
keluarga ini ada di `awcms`, dan repo ini adalah **konsumen** kontraknya.

Mengembangkan repo ini secara paralel karena itu punya biaya yang spesifik,
bukan sekadar "kurang fokus": **setiap fitur yang dibangun di atas kontrak yang
belum stabil harus ditulis dua kali.** Repo ini sudah membayarnya sekali —
adapter kontennya ditulis untuk daftar ringkasan, lalu ditulis ulang saat `awcms`
mengirimkan build feed (ADR-0018), dan versi pertamanya menerbitkan situs yang
setiap artikelnya kosong dengan build hijau.

## Keputusan

**Pengembangan repo ini ditahan sampai pengembangan DASAR `awcms` selesai.**

Ini penahanan, bukan pembekuan permanen, dan bukan pula pernyataan bahwa repo ini
selesai — backlog-nya masih ada dan tercatat di [`README.md`](../../README.md).

### Yang MASIH boleh mendarat

Dua kelas, dan keduanya sempit:

1. **Patch keamanan.** Repo ini punya image produksi yang berjalan di belakang
   Traefik. Kerentanan tidak ikut membeku bersama pengembangannya, dan
   menahannya berbulan-bulan menukar risiko yang nyata dengan kerapian jadwal.
2. **Bump dependency.** Dependabot sudah aktif (`bun` mingguan,
   `github-actions` bulanan) dan akan terus membuka PR selama penahanan.
   Membiarkannya menumpuk berarti mencabut penahanan ke sebuah tumpukan bump
   berbulan-bulan yang harus dinilai sekaligus — persis keadaan yang paling
   mungkin menyelundupkan perubahan perilaku tanpa ada yang membacanya.

Keduanya tetap tunduk pada seluruh gerbang yang ada: `bun run build`,
`bun test`, `bun run audit:konten`, dan changeset bila perilakunya berubah.

### Yang DITAHAN

Semua selain dua butir di atas: fitur, refactor, penambahan gerbang, dan
perubahan dokumentasi yang bukan koreksi.

**Satu pengecualian yang perlu dinyatakan terus terang:** dokumen yang *berhenti
benar* karena `awcms` berubah adalah cacat, bukan pekerjaan baru. Kalau `awcms`
mengubah sebuah kontrak dan `AGENTS.md` di sini menjadi menyesatkan, koreksinya
mendarat — itu justru yang dilindungi penahanan ini. Yang ditahan adalah
menumbuhkan dokumen, bukan menjaga yang ada tetap jujur. Repo ini sudah
menemukan dua contohnya dalam satu hari (peran admin, dan endpoint media yang
sudah ada), dan keduanya tidak akan terlihat oleh siapa pun yang membaca
dokumennya saja.

### Kapan penahanan ini dicabut

Saat pemilik menyatakan pengembangan dasar `awcms` selesai. Sinyal yang paling
mendekati dan bisa diperiksa hari ini ada dua, keduanya di
[`docs/PROJECT_STATE.md`](https://github.com/ahliweb/awcms/blob/main/docs/PROJECT_STATE.md)
milik `awcms`:

- **Setiap modul punya layar.** ~~Tabel §Layar admin mencatat "**7 dari 21
  modul** masih tanpa layar" (turun dari 13 saat ADR-0051 ditulis).~~ Nol adalah
  penandanya, dan `tests/admin-navigation-registry.test.ts` di sana yang
  menegakkannya.

  **Indikator ini SUDAH TERPENUHI, 3 Agustus 2026.** `grep -L 'navigation:'
  src/modules/*/module.ts` di `awcms` mengembalikan **nol** baris — diperiksa ke
  kode, bukan ke tabelnya, karena tabel itu sendiri pernah basi tanpa ada yang
  merah. Tujuh yang tersisa ditutup lewat `/admin/reporting`, `/admin/approvals`,
  `/admin/domain-events`, `/admin/sync`, `/admin/blog`, `/admin/media`
  (ADR-0056), dan `/admin/idn-regions`; `/admin/blog-pages` (ADR-0057) menyusul
  di atasnya.

- **§4 "yang belum" habis** — seam yang menunggu penyedia, rute publik
  host-resolved, dan sisa penyerapan `awcms-micro`.

  **BELUM, per 3 Agustus 2026.** Ketiganya masih terbuka di §4: business-scope
  resolver base tetap NO-OP fail-closed, rute konten host-based `/blog/{slug}`
  masih follow-up, dan `newsletter` + `social-publishing` + pustaka komponen
  Wave 0 + trajektori Wave 3 belum diserap. Satu dari dua indikator terpenuhi
  bukan pencabutan — dan yang mencabut tetap pernyataan pemilik, bukan skor
  indikator.

Kriteria itu **indikator, bukan gerbang otomatis**: yang mencabut penahanan
tetap pernyataan pemilik. Ditulis di sini supaya "sudah selesai belum?" punya
sesuatu yang bisa dilihat alih-alih ditebak.

## Titik lanjut — yang menunggu saat penahanan dicabut

Ditulis sekarang, selagi konteksnya masih segar. Daftar yang direkonstruksi
berbulan-bulan kemudian dari `git log` selalu kehilangan alasannya.

1. **Gambar artikel.** Tidak lagi diblokir `awcms` —
   `GET /api/v1/media/objects?ids=…` sudah ada dan feed build sudah membawa
   `featuredMediaId`. Dua keputusan tersisa di sini: di mana gambar hasil
   resolusi tinggal (`LocalizedArticle`, di-resolve sekali per build di
   `content.ts` — bukan di modul sinkron yang dipanggil komponen), dan apa yang
   diizinkan `img-src` (host media ber-origin lain, jadi CSP ADR-0019
   memblokirnya sampai origin itu dinyatakan). Rinciannya di
   [`src/lib/article-images.ts`](../../src/lib/article-images.ts).
2. **Filter locale di feed `awcms`.** ~~Masih belum ada — diperiksa langsung di
   `blog-post-list-query.ts` pada 2 Agustus 2026. Build menarik SELURUH locale
   lalu memasangkannya di sini; benar, tetapi berlebih untuk situs satu bahasa.~~

   **Koreksi, 3 Agustus 2026 — butir ini berhenti benar dalam hitungan jam.**
   `awcms` [#346](https://github.com/ahliweb/awcms/pull/346) mendarat pada hari
   yang sama dan menyebut butir ini di badan commit-nya: `?locale=` kini ada di
   ketiga cabang daftar (`view=full` termasuk), cocok-persis, absen berarti
   seluruh locale, kosong dibalas 400.

   Dan alasan butir ini **salah**, bukan cuma usang. "Berlebih untuk situs satu
   bahasa" memerikan repo lain: template ini menyajikan dua locale (`id` + `en`,
   `src/config/site.ts`) dan memasangkannya lewat `translationGroupId`. Memakai
   `?locale=id` di sini membuang setiap baris `en` **tanpa satu pun gerbang
   merah** — `assertTranslationsArePairable` menangkap terjemahan yang tiba
   tanpa grup, bukan terjemahan yang tidak pernah ikut ditarik. Hasilnya build
   hijau yang menerbitkan setiap halaman `/en/**` sebagai bahasa Indonesia
   berpenanda "belum diterjemahkan": bentuk kegagalan yang sama persis dengan
   ADR-0018 (`view=full` yang diabaikan → setiap artikel kosong, build hijau),
   dan `AGENTS.md` sudah menyebutnya kegagalan, bukan optimasi.

   Jadi yang menunggu pencabutan penahanan bukan "pasang `?locale=`", melainkan
   keputusan yang lebih kecil: **deployment satu-locale** boleh mengirimnya, dan
   itu berarti satu traversal per locale (parameternya menerima satu nilai),
   bukan satu traversal yang lebih ramping.
3. **Kartu share per halaman.** Butuh pembangkit yang terikat seni domain;
   `SITE_SOCIAL_IMAGE` (satu kartu, opsional) tetap keadaan yang didukung.
4. **BFF portal Jualanku (ADR-0014).** Dua kontrak yang dulu memblokirnya sudah
   mendarat di `awcms` (ADR-0049/0050); prasyarat sisanya di
   [`04-kesiapan.md`](../awcms-astro/jualanku/04-kesiapan.md).

## Konsekuensi

- **Kontrak `awcms` mengeras lebih dulu, lalu dikonsumsi sekali.** Ini
  keuntungan utamanya, dan repo ini sudah membayar harga dari kebalikannya.
- **Backlog tidak hilang, ia menunggu** — dan titik lanjut di atas yang membuat
  penundaan ini murah untuk dicabut.
- **Dependabot tetap berjalan**, jadi penahanan ini tidak menghasilkan repo yang
  tertinggal dari rantai build-nya sendiri.
- **Risiko yang diterima:** "pengembangan dasar selesai" tidak punya definisi
  formal, jadi penahanan ini bisa berlangsung lebih lama daripada yang
  dimaksudkan tanpa ada yang menyadarinya. Dua indikator di atas yang memberinya
  sesuatu untuk diperiksa; kalau keduanya sudah nol dan penahanan masih berlaku,
  itu pertanyaan yang layak diajukan, bukan keadaan yang dibiarkan.
