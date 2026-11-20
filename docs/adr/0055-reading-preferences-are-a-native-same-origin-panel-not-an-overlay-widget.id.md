🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.md)

<!-- i18n-source-hash: sha256:fa8cc007261d1f82b44798154a27fe81b2063035869f2ed179438297cd0a9e34 -->

# ADR-0055 — Preferensi baca adalah panel native satu-origin, bukan widget overlay

- **Status:** Diterima
- **Tanggal:** 18 November 2026
- **Terkait:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.id.md) (CSP ketat, tanpa skrip atau gaya inline), [ADR-0054](0054-html-gets-a-shared-cache-lifetime-and-every-deploy-purges-the-cdn.id.md) (skrip `public/` yang tidak ber-hash memakai aturan cache HTML), [`docs/awcms-astro/ui-ux-design-system.md`](../awcms-astro/ui-ux-design-system.id.md), isu #174

## Konteks

Halaman-halaman template ini menargetkan WCAG di markup-nya sendiri, dan itu
batas bawahnya. Namun pembaca tidak punya cara menyesuaikan tampilan dengan
kebutuhannya selain pengalih terang/gelap dan apa pun yang sudah diminta sistem
operasi. Pembaca dengan penglihatan rendah, disleksia, atau sensitivitas gerak
terlayani lebih baik oleh sedikit pilihan tampilan yang disimpan di perangkatnya
sendiri: ukuran teks, kontras, spasi, penekanan tautan, dan pengurangan gerak.

Ada cara siap pakai untuk mendapatkan tombol seperti itu: menanam widget
"overlay aksesibilitas" pihak ketiga. ADR ini mencatat mengapa repo ini tidak
melakukannya, dan apa yang dibangun sebagai gantinya. Ia menyentuh postur
keamanan (CSP tetap seperti sekarang, dan skrip pihak ketiga ditolak) dan
menambah fitur klien ke setiap halaman publik, sehingga ia butuh ADR menurut
`GOVERNANCE.md`.

### Posisi dalam alur pengembangan

Irisan ini hanya di sisi klien: tidak menyimpan apa pun di server, tidak
menambah tabel dan tidak menambah endpoint. Langkah 5 sampai 8 dari alur 18
langkah (ERD, RBAC dan RLS, spesifikasi domain, kontrak API) karenanya tidak
berlaku. Pemilik meloloskan gerbang 9 untuk irisan ini pada **18 November 2026**,
dan keputusannya dicatat oleh orchestrator. **Uji kegunaan dengan pembaca
sungguhan ditunda ke UAT (langkah 14), sebelum gerbang 15**: panel ini sudah
dibangun dan diperiksa dengan uji otomatis dan aturan di bawah, belum dicoba oleh
pembaca yang membutuhkannya.

## Opsi yang dipertimbangkan

| Opsi | Yang dilakukan | Kekuatan | Kelemahan |
| --- | --- | --- | --- |
| **A. Panel native satu-origin** (dipilih) | Tombol melayang membuka dialog kecil non-modal; setiap pilihan memasang atribut pada `<html>` yang direspons CSS situs sendiri; pilihannya tinggal di `localStorage` | Tanpa kode pihak ketiga, tanpa permintaan, tanpa cookie; CSP ketat tidak tersentuh; setiap piksel dan kata milik kita untuk dijaga aksesibel dan diterjemahkan; jujur tentang apa yang dilakukannya | Kita yang menulis dan merawatnya; setiap preferensi hanya sebaik CSS di belakangnya |
| B. Widget overlay pihak ketiga | Satu tag skrip menambah tombol dan panel yang menulis ulang halaman saat berjalan | Cepat ditambahkan | Lihat di bawah |
| C. Tidak melakukan apa pun | Mengandalkan OS dan browser (zoom, warna paksa, gerak berkurang) | Tak ada yang dibangun atau dirawat | Pembaca yang perangkatnya belum disetel, atau yang berbagi perangkat, tidak terbantu; pengalih yang ada tetap satu-satunya kendali |

Orchestrator memutuskan **A**, dan pemilik meloloskan gerbang 9 untuknya pada 18 November 2026.

### Mengapa bukan B

- **Privasi.** Skrip vendor berjalan dengan alamat IP dan User-Agent pembaca di
  setiap halaman, dan dapat menyimpan catatan pengaturan aksesibilitas pembaca.
  Itu akan menjadi data tentang disabilitas, dikumpulkan tanpa diminta pembaca.
  Template ini sudah menolak font pihak ketiga dengan alasan yang lebih ringan,
  yaitu membocorkan alamat IP.
- **CSP.** `script-src 'self'` adalah postur yang diperoleh repo ini (ADR-0019).
  Widget butuh origin vendor di `script-src`, lazimnya juga `connect-src` dan
  `style-src`, dan mungkin `'unsafe-inline'`. Masing-masing adalah lubang pada
  kebijakan yang kini tidak punya satu pun.
- **Ia tidak melakukan apa yang diklaimnya.** Overlay yang mencoba memperbaiki
  markup saat berjalan dikritik luas oleh komunitas aksesibilitas dan pengguna
  teknologi bantu; Overlay Fact Sheet publik (overlayfactsheet.com) mencatat kritik
  itu dan ditandatangani banyak profesional aksesibilitas. Overlay juga bisa
  mengganggu pembaca layar yang sudah dipakai pembaca. Aksesibilitas sebuah situs
  datang dari markup-nya sendiri; skrip yang mengklaim sebaliknya adalah posisi
  yang lebih buruk daripada diam.
- **Klaim dan risiko hukum.** Lencana "kepatuhan" sebuah widget adalah klaim yang
  tidak bisa dipertanggungjawabkan repo ini (`CONTRIBUTING.md`: skrip pihak ketiga
  dan pengumpulan data pribadi pembaca dilarang).

## Keputusan

1. **Panel ini adalah preferensi tampilan pengguna, bukan overlay.** Ia tidak
   pernah menulis ulang konten, tidak pernah menyuntikkan ARIA, tidak pernah
   menyatakan halaman memenuhi suatu standar, dan tidak pernah memuat kode pihak
   ketiga. Halaman harus memenuhi WCAG lewat markup-nya sendiri; panel ini
   pelengkap. Teksnya hanya menyatakan di mana pengaturan disimpan ("Tersimpan
   hanya di perangkat ini, tidak dikirim ke server") dan tidak membuat klaim hukum.
2. **Tanpa pelacakan, tanpa server.** Preferensi hanya tinggal di `localStorage`
   pengunjung, dengan kunci `awcms-a11y`. Tidak ada yang dikirim ke mana pun, dan
   tidak ada event analitik yang dipancarkan.
3. **Kontrak penyimpanan.** Nilainya JSON
   `{"v":1,"text":"normal"|"large"|"x-large","contrast":bool,"mono":bool,"dyslexia":bool,"underline":bool,"highlight":bool,"motion":bool}`
   (`motion: true` berarti kurangi gerak). Seluruh objek ditulis setelah setiap
   perubahan. JSON tidak valid, versi salah, kunci hilang, atau nilai tak dikenal
   diperlakukan sebagai "tidak ada preferensi tersimpan", tidak pernah sebagai
   objek yang separuh valid. Setiap baca dan tulis ada di dalam `try/catch`,
   karena sebagian browser melempar galat hanya karena menyentuh `localStorage`.
   **Reset** menghapus kunci dan atributnya.
4. **Kontrak DOM.** Setiap preferensi adalah atribut pada `<html>`:
   `data-a11y-text="large|x-large"`, `data-a11y-contrast`, `data-a11y-mono`,
   `data-a11y-dyslexia`, `data-a11y-underline`, `data-a11y-highlight`, dan
   `data-a11y-motion="reduce"`. Atribut yang tidak ada berarti fiturnya mati, dan
   setiap aturan di `src/styles/aksesibilitas.css` dicakup di bawah salah satunya,
   sehingga tidak ada yang berubah bagi pembaca yang tidak pernah membuka panel.
   `src/lib/aksesibilitas.ts` memegang logika murninya; efeknya:
   - **Ukuran teks:** 120 % dan 140 % pada akar, sehingga setiap `rem` mengikuti.
     Semua ukuran font di repo ini `rem`, dan itu yang membuatnya bekerja tanpa
     menyentuh komponen.
   - **Kontras tinggi:** token warna diganti palet dengan teks 7:1 atau lebih
     (WCAG 1.4.6): nyaris hitam di atas putih pada skema terang, putih di atas
     nyaris hitam pada skema gelap; garis tepi pekat pada kotak dan isian; gradien
     dan hiasan hero menjadi latar pekat. Ia bekerja bersama `data-theme`. Ia
     **tidak diterapkan di bawah `forced-colors: active`**: pembaca meminta palet
     milik sistem, dan palet situs di atasnya adalah pertarungan yang justru ingin
     dicegah media query itu.
   - **Monokrom:** `filter: grayscale(1)` pada `<html>`, tidak pernah pada
     `<body>` atau pembungkus, karena filter pada elemen lain menjadikannya
     containing block bagi turunannya yang `position: fixed` dan tombol melayang
     akan ikut tergulir. Sebuah tes menolak `filter` di tempat lain pada
     stylesheet.
   - **Teks ramah disleksia:** tumpukan font sans sistem polos dengan nilai spasi
     teks WCAG 1.4.12 (tinggi baris 1,5, spasi huruf 0,12 em, spasi kata 0,16 em,
     spasi paragraf 2 em) dan tanpa teks rata kanan-kiri. **Tidak ada "font
     disleksia" yang dibundel.** Studi terkontrol yang membandingkannya dengan
     font sans biasa (Wery dan Diliberto, Annals of Dyslexia, terbit daring 2016)
     tidak menemukan manfaat baca; menawarkan yang terdokumentasi membantu (spasi,
     huruf polos) dan tidak lebih menjaga panel ini jujur.
   - **Garis bawah semua tautan** dan **sorot tautan** (kuning `#ffeb3b` dengan
     `#111`, di atas 7:1, dengan cincin fokus yang terlihat).
   - **Kurangi gerak:** animasi dan transisi dimatikan, bukan dipercepat.
5. **Preferensi OS adalah bawaannya, dan pembaca boleh menimpanya.** Tanpa nilai
   tersimpan, pengurangan gerak mengikuti `prefers-reduced-motion: reduce` dan
   kontras tinggi mengikuti `prefers-contrast: more`. Pilihan tersimpan menang,
   termasuk "mati" untuk sesuatu yang diminta OS: pembaca yang menyalakan lagi
   gerak di panel memang bermaksud begitu. Agar itu mungkin tanpa dua sumber
   kebenaran, `public/aksesibilitas.js` menandai `<html data-a11y-ready>` begitu ia
   jalan, dan media query CSS berlaku **hanya selama penanda itu belum ada**: tanpa
   JavaScript, atau skripnya diblokir. Ini mengubah satu aturan yang ada: blok
   `prefers-reduced-motion` di `global.css` kini dicakup ke
   `:root:not([data-a11y-ready])`.
6. **Peningkatan progresif.** Tanpa JavaScript halaman tetap sepenuhnya bisa
   dipakai; tombol dirender `hidden` dan hanya skrip yang menampilkannya, sehingga
   tidak pernah ada kontrol yang tidak berbuat apa-apa; media query OS tetap
   berlaku lewat CSS.
7. **Dua skrip, satu kontrak.** Atributnya harus ada sebelum paint pertama, jadi
   separuh awalnya adalah `public/aksesibilitas.js`, `<script src>` klasik yang
   memblokir di `<head>` setelah `public/tema.js`, dengan pola dan alasan yang
   sama seperti tema (skrip inline diblokir CSP, bundel Astro terlalu terlambat).
   Ia tidak bisa mengimpor modul, jadi ia membawa salinan tulisan tangan dari aturan
   parse dan atributnya; `tests/aksesibilitas.test.mjs` menjalankannya dan modul
   terhadap fixture yang sama lalu membandingkan atributnya, sehingga salinan tidak
   bisa menyimpang tanpa ketahuan. Separuh panelnya adalah modul ter-bundel di
   `PanelAksesibilitas.astro` yang menampilkan tombol, memasang kontrol, menulis
   penyimpanan, memperbarui atribut secara langsung, dan memancarkan
   `document.dispatchEvent(new CustomEvent("awcms-a11y-change", {detail}))` agar
   ticker, carousel, atau putar-otomatis yang ditambahkan kelak bisa bereaksi.
   Template ini belum punya satu pun.
8. **Panelnya sendiri harus aksesibel.** Tombol melayang dipasang tetap di
   inline-start bawah, minimal 44 kali 44 px CSS, dengan ikon dan teks tersembunyi
   secara visual, `aria-label`, `aria-expanded` dan `aria-controls`, dan
   disembunyikan saat cetak. Panelnya `role="dialog"` non-modal yang dinamai oleh
   judulnya (bukan `aria-modal`), ditambatkan di atas tombol dengan gulir internal;
   ia menutup pada Esc, tombol tutup, dan klik di luar; fokus pindah ke judulnya
   saat dibuka dan kembali ke tombol pada Esc atau tombol tutup. Ukuran teks adalah
   tiga radio native yang ditata sebagai segmen; keenam sakelar adalah
   `button[role=switch][aria-checked]` dengan label dan deskripsi yang
   dihubungkan lewat `aria-labelledby` dan `aria-describedby`. Target setinggi
   minimal 44 px, dan panel memakai token situs sendiri sehingga mengikuti tema
   terang dan gelap serta kontras tinggi.
9. **Hanya satu origin; CSP tidak berubah.** Tanpa skrip inline, tanpa
   `style=""` inline, tanpa `'unsafe-inline'`, tanpa origin baru.
   `tests/keluaran-csp.test.mjs` tetap penjaganya.
10. **Anggaran byte bergeser, dan pergeserannya adalah pengukuran.** Panel
    menambah dua skrip dan gayanya ke setiap halaman. `scripts/audit-aset.mjs`
    kini mengizinkan 18.500 B skrip dan 53.700 B total per halaman (dari 13.000
    dan 40.000), dan mendaftarkan `aksesibilitas.js` di registri `public/`-nya.
    Alasan dan angkanya ditulis di samping tiap konstanta.

### Analisis trade-off

| Kriteria | A, dipilih | B (overlay pihak ketiga) | C (tidak ada) |
| --- | --- | --- | --- |
| Keamanan | Tanpa origin baru, tanpa permintaan baru; CSP tidak berubah | Origin vendor baru dan CSP yang dilonggarkan | Tidak berubah |
| Privasi | Pengaturan tidak pernah meninggalkan perangkat | Vendor melihat pembaca dan mungkin pengaturannya | Tidak berubah |
| Performa | Sekitar 5,7 KB skrip dan 8,0 KB CSS ditambahkan ke setiap halaman (gzip hanya sebagian); tanpa CLS, tombolnya tetap | Bundel vendor dan permintaannya di setiap halaman | Tidak ada |
| Keterawatan | Kita yang merawat; logika murni diuji unit dan salinan awalnya diuji paritas | Dikendalikan vendor; berubah tanpa tinjauan | Tidak ada |
| Skalabilitas | Hanya berkas statis; tanpa beban origin | Ketersediaan vendor menjadi ketersediaan kita | Tidak ada |
| Aksesibilitas | Manfaat nyata bagi pembaca yang disasar; panelnya sendiri dirancang terhadap kriteria WCAG 2.2 AA; dicoba sekali secara manual di browser, tidak otomatis | Klaim yang tak bisa dipenuhi; bisa mengganggu teknologi bantu | Pembaca tanpa perangkat yang disetel tidak mendapat apa-apa |
| Dampak SEO | Tidak ada: tidak menulis ulang konten dan tidak menambah pihak ketiga yang memblokir | Bobot pihak ketiga tambahan bisa merugikan vitals | Tidak ada |
| UI/UX | Satu kendali konsisten dengan tampilan dan bahasa situs sendiri (id dan en) | Tampilan dan bahasa asing | Tidak ada |
| Kompatibilitas | Atribut CSS biasa, `localStorage`, `matchMedia`; turun ke bawaan OS | Bergantung pada vendor | Tidak berlaku |
| Kompleksitas operasional | Satu gerbang dan satu berkas `public/` lagi, keduanya terdokumentasi | Kontrak dan perpanjangan dengan vendor | Tidak ada |
| Implikasi jangka panjang | Panel yang bisa diperluas situs turunan; event-nya membuat fitur gerak berikutnya bisa patuh | Terkunci dan klaim yang harus dibela terus | Tekanan kembali setiap kali ada yang memintanya |

## Konsekuensi

- **Setiap halaman publik mendapat tombolnya.** Ia dirender `BaseLayout.astro`,
  sehingga `ArtikelLayout.astro` dan setiap halaman lain memilikinya tanpa
  perubahan per halaman.
- **Aturan gerak berkurang dari OS kini punya mode kedua.** Begitu skrip awal
  jalan, atribut menjadi satu-satunya sumber kebenaran dan pembaca bisa mematikan
  preferensi bawaan OS. Blok `prefers-reduced-motion` di `global.css` hanya
  berlaku tanpa penanda itu, dan membawa catatan yang menyatakannya.
- **Atribut kurangi gerak menyetel `transition: none`, aturan OS yang ada
  menyetel `transition-duration: 0.01ms`.** Komentar yang ada di `global.css`
  berargumen bahwa menolkan transisi menghilangkan umpan balik fokus dan hover;
  keadaan akhirnya tetap diterapkan seketika, jadi umpan baliknya tidak hilang,
  tetapi kedua aturan tidak identik dan pembaca yang mendapat aturan atribut
  (siapa pun yang skripnya jalan) mendapat yang lebih ketat.
- **Biaya yang kini dicerminkan anggaran.** Sekitar 13,7 KB lebih banyak per
  halaman sebelum kompresi, 1,5 KB di antaranya CSS ter-gzip. Opsi lanjutan yang
  tidak diambil di sini: memuat skrip dan gaya panel hanya saat pembaca pertama
  kali membukanya; ia menurunkan biaya muat pertama tetapi tidak byte yang akhirnya
  diambil, dan butuh penanganan status memuat untuk fokus, sehingga ia dicatat dan
  tidak dipakai untuk memenuhi gerbang.
- **Paletnya ditulis dua kali.** CSS tidak bisa berbagi satu aturan antara
  selektor atribut dan media query; salinan media itu ada hanya untuk kasus tanpa
  skrip dan skrip diblokir. Satu sudut sengaja dibiarkan: tema gelap yang dipilih
  pada OS terang dengan skrip awal diblokir mendapat palet kontras tinggi terang.
- **`filter: grayscale` tidak gratis.** Ia membuat elemen akar digambar ulang
  dengan cara berbeda di sebagian browser; ia opt-in dan mati secara bawaan.
- **Tidak diuji di browser oleh repo ini.** Repo ini tidak punya Playwright atau
  axe, sehingga gerbang di atas tidak bisa melihat perpindahan fokus, Esc, klik di
  luar, hasil axe dengan panel terbuka, atau gulir di 360 px. Sebelum perubahan
  ini dibuka, semuanya dicoba **sekali, secara manual**, dengan Chromium dan
  axe-core yang dijalankan dari luar repo terhadap build produksi yang disajikan
  `server/penyaji.mjs` (sehingga CSP sungguhan berlaku) dan `awcms` tiruan: panel
  terbuka, Esc, tombol tutup, dan klik di luar menutupnya dengan fokus kembali
  seperti ditetapkan, setiap sakelar memasang atributnya dan bertahan setelah muat
  ulang, reset menghapus kunci dan atribut, bawaan OS berlaku dan bisa ditimpa,
  tombol tetap melayang saat monokrom menyala, tidak ada pelanggaran CSP, axe tidak
  melaporkan apa pun pada simpul panel mana pun saat panel terbuka (terang dan
  gelap, dengan dan tanpa kontras tinggi), dan tidak ada gulir horizontal di 360 px
  dengan teks sangat besar dan semua preferensi menyala. Percobaan itu tidak bisa
  diulang dari repo, dan itulah gunanya tindak lanjut di bawah. Ia juga menemukan,
  dan perubahan ini memperbaiki, tiga cacat yang sudah ada yang disingkapkan
  preferensi baru; lihat butir berikut.
- **Tiga tata letak yang sudah ada diubah agar teks lebih besar tidak meluap.** Di
  lantai 360 px dengan teks sangat besar, halaman tergulir ke samping karena
  `.prinsip-grid` di beranda (`minmax(15rem, 1fr)` adalah 336 px pada 140 %, lebih
  lebar daripada lebar bersih 320 px), karena `.share-list` di bawah 480 px (`1fr`
  telanjang tidak bisa menyusut di bawah isinya), dan pada kontras tinggi karena
  `.badge--emerald` menaruh teks putih di atas isian yang oleh palet gelap menjadi
  terang. Kini mereka memakai `minmax(min(15rem, 100%), 1fr)`,
  `repeat(auto-fit, minmax(min(8rem, 100%), 1fr))` (dua kolom pada ukuran bawaan,
  satu bila teks lebih besar tidak muat dua), dan isian gelap di
  `aksesibilitas.css`. Tata letak yang membawa konten nyata dari situs turunan
  (tabel, kata panjang) tidak dicoba.

## Tindak lanjut

1. **Menambah Playwright dan axe** (*selesai 19 November 2026 untuk bagian axe, oleh
   [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md):
   axe berjalan di peramban sungguhan pada setiap perubahan, dengan panel terbuka
   dan setiap mode menyala, dan di 360 px; perpindahan fokus dan ketahanan setelah
   muat ulang belum diotomasi*) untuk mencakup: membuka panel di halaman publik,
   menyalakan tiap preferensi, memastikan atribut dan ketahanannya setelah muat
   ulang, Esc mengembalikan fokus, axe tidak menemukan pelanggaran serius atau
   kritis dengan panel terbuka dan dengan kontras menyala, dan tidak ada gulir
   horizontal di 360 px dengan teks sangat besar. Ini di luar scope di sini karena
   menambah kerangka uji.
2. **Uji kegunaan dengan pembaca sungguhan pada UAT (langkah 14)**, sebelum gerbang
   15, bersama pembaca yang memakai preferensi ini.
3. **Pertimbangkan memuat panel secara malas**, seperti dijelaskan di atas, bila
   biaya terukurnya penting bagi sebuah situs.

## Verifikasi

`tests/aksesibilitas.test.mjs` membuktikan, tanpa browser:

- kontrak penyimpanan: objek valid pulang-pergi, dan JSON tidak valid, versi
  salah, sakelar hilang atau bukan boolean, ukuran teks tak dikenal, serta
  penyimpanan yang melempar galat semuanya "tidak ada preferensi tersimpan" dan
  tidak pernah melempar;
- resolusi bawaan OS, dan bahwa objek tersimpan menang atas OS;
- atribut yang dihasilkan tiap preferensi, dan bahwa reset mempertahankan penanda
  siap;
- **paritas**: `public/aksesibilitas.js` yang dijalankan di sandbox menghasilkan
  atribut yang sama dengan modul untuk setiap kombinasi nilai tersimpan dan
  pengaturan OS, termasuk penyimpanan terblokir dan `matchMedia` yang tidak ada;
- stylesheet: setiap atribut punya aturan yang dicakup di bawahnya, `filter` hanya
  muncul pada `html[data-a11y-mono]`, palet kontras tinggi hanya ada di dalam
  query `forced-colors: none`, tombol `position: fixed`, dan ia dimuat setelah
  `global.css`;
- keluaran build (bila `dist/client` ada): skrip awal adalah berkas di setiap
  halaman, tombol dan panel dirender `hidden` dengan ARIA-nya, panel adalah dialog
  non-modal, dan skrip panel adalah bundel satu-origin.

`tests/keluaran-csp.test.mjs` terus membuktikan bahwa keluaran tidak punya skrip,
gaya, atau `style=""` inline. `tests/audit-aset.test.mjs` membuktikan anggaran
baru dan entri registri.

## Amandemen (2026-11-19: uji kegunaan pindah ke repo implementasi)

Keputusan pemilik **2026-11-19**: repo upstream (`awcms`, `awcms-astro`, `awcms-one`) tidak menjalankan UAT; UAT (langkah 14 alur pengembangan) dijalankan di repo implementasi atau proyek turunan, selaras dengan standar lintas-portofolio internal.

Pernyataan di atas yang menunda uji kegunaan dengan pembaca sungguhan ke UAT sebelum gerbang 15 (catatan gerbang dan tindak lanjut 2) **diganti** oleh ini: uji kegunaan panel dengan pembaca sungguhan, termasuk pengguna teknologi bantu, **bukan prasyarat gerbang 15 di repo ini**. Itu tanggung jawab tiap situs turunan template ini yang mengadopsi panel, dalam UAT-nya sendiri. Keputusannya sendiri (panel native satu-origin, bukan widget overlay) tidak berubah.
