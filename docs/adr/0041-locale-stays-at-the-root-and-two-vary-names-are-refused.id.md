🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md)

<!-- i18n-source-hash: sha256:a02658f3797430f4a711690884f37d2957a8522b7a610d7628fc264985467481 -->

# ADR-0041 — Locale default tetap di AKAR, dan dua nama `Vary` ditolak

- **Status:** Accepted
- **Tanggal:** 18 Agustus 2026
- **Menggantikan:** tidak ada. Menyerap `awcms` ADR-0098 (15 Agustus 2026) dan memberi [ADR-0036](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) pemeriksa yang tidak pernah dimiliki separuh keduanya.

## Konteks

Pada 15 Agustus 2026 `awcms` memindahkan locale permukaan konten publiknya ke
dalam path URL (`awcms` ADR-0098, diimplementasikan pada hari yang sama).
`/blog/{tenantCode}/…` tidak lagi merender apa pun di sana: ia menjawab `307` ke
`/en/blog/{tenantCode}/…` atau `/id/blog/{tenantCode}/…`, `private, no-store`,
dan hanya URL berprefiks yang kanonik sekaligus bisa di-cache.

Alasannya satu kalimat aritmetika, dan ia layak dikutip karena justru itulah
yang menentukan jawaban repo ini — bukan kesimpulan yang dicapainya: `vcl_hash`
di sana meng-hash `(host, url)` dan tidak ada yang lain, sehingga **satu URL
publik yang badannya bervariasi menurut cookie adalah mesin penyilang jawaban** —
pembaca pertama yang meleset dari cache menentukan apa yang dilihat pembaca
kedua, beberapa menit kemudian, pada halaman yang tak satu pun dari mereka bisa
render ulang.

Dua pertanyaan mendarat di sini pada hari yang sama, dan jawabannya berlawanan.
Keduanya dicatat karena yang mahal adalah yang kedua: mekanisme yang membuat
`awcms` ADR-0098 tidak diperlukan di sini adalah properti dari cara repo ini
dibangun, dan properti yang tidak ditulis siapa pun adalah properti yang
dihapus seseorang.

## Keputusan 1 — repo ini TIDAK mengadopsi prefiks itu, dan locale default tetap memegang akar

`/panduan/` tetap `/panduan/`. Setiap locale lain tetap berprefiks
(`/en/panduan/`), persis seperti yang selama ini ditulis `localePath()` di
[`src/config/site.ts`](../../src/config/site.ts).

Kegagalan yang menjadi alasan keberadaan `awcms` ADR-0098 tidak diredam di
sini — ia **secara struktural tidak tersedia**, dengan tiga alasan yang masing-masing bisa
diperiksa:

1. **Tidak ada negosiasi.** Build statis menulis satu berkas per URL. Badan
   `/panduan/` ditentukan saat build dan tidak bisa bervariasi menurut pembaca,
   cookie, atau header, jadi tidak ada yang bisa dikelirukan sebuah cache
   bersama.
2. **Tidak ada keadaan permintaan yang mencapai keputusannya.**
   `server/penyaji.mjs` membaca tepat satu hal dari sebuah permintaan:
   `req.url`. Bukan cookie, bukan `Accept-Language`, bukan sesi. Kunci cache
   `(host, url)` dan badan yang dipilih oleh path karena itu sudah sepakat —
   dan itulah properti yang dibayar `awcms` ADR-0098 dengan sebuah redirect.
3. **URL-nya sudah terindeks.** Mengadopsi prefiks itu berarti menjawab setiap
   URL locale default dengan redirect, ditukar dengan properti yang sudah
   dimiliki repo ini. Menurut kosakata
   [ADR-0040](0040-changeset-menyatakan-bump-semver.md) sendiri itu `major` —
   sebuah URL publik patah — dan ia dibayar untuk nol perolehan.

`x-default` pun tidak perlu berubah, dengan alasan yang layak dinyatakan alih-alih
diandaikan: `awcms` ADR-0098 keputusan 5 menuntut `x-default` menunjuk URL
**berprefiks** milik default tenant justru karena path telanjang di sana adalah
sebuah redirect,
sementara crawler yang mengikuti `x-default` harus mendarat pada dokumen kanonik
yang bisa di-cache. Di sini path telanjang **adalah** dokumen itu, dan
[`BaseLayout.astro`](../../src/layouts/BaseLayout.astro) sudah menunjuk
`x-default` ke sana. Tuntutannya terpenuhi; yang berbeda hanya ejaannya.

**Ini divergence keluarga dan perlu dicatat sebagai divergence.** Menurut `awcms`
ADR-0068 tempatnya di `awcms-family-compatibility.yaml` repo itu — repo ini tidak
bisa menulis entri tersebut sendiri, dan karena itu menyatakannya di sini,
mengikuti preseden
[ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Hubungan. Yang ditinjau pada tanggal itu bukan apakah kedua repo mengeja URL
dengan cara yang sama, melainkan apakah premis di atas masih berlaku: bahwa tidak
ada apa pun di jalur penyajian repo ini yang membaca header permintaan.

## Keputusan 2 — `Vary: Cookie` dan `Vary: Accept-Language` DITOLAK

Keputusan 1 menghapus mekanismenya. Ia tidak menghapus godaannya, dan godaan itu
punya bentuk yang gamblang: cara membuat situs ini memilih bahasa pembacanya
tanpa rebuild adalah menegosiasikan `Accept-Language` di `server/penyaji.mjs`
lalu menyatakan variasinya dengan sebuah `Vary`. Setiap respons yang dikirim
penyaji ini `public` (`CACHE_HALAMAN`), jadi Traefik, sebuah CDN, atau proxy
perusahaan boleh menyimpan satu salinan dan membagikannya kepada semua orang.

Kedua nama itu gagal dengan cara berbeda, dan keduanya gagal diam-diam:

- **`Cookie`** memasukkan header pembawa kredensial ke dalam kunci cache. Jumlah
  objek lalu berlipat menurut banyaknya string cookie yang BERBEDA, bukan
  menurut banyaknya locale, sehingga hit rate runtuh mendekati nol — lebih buruk
  daripada tidak punya cache, karena origin kini juga membayar setiap meleset
  milik cache itu.
- **`Accept-Language`** tampak seperti alat yang tepat. Ia tidak bisa melihat
  pilihan eksplisit, jadi pembaca yang mengeklik Bahasa Indonesia terus mendapat
  Inggris sementara sakelarnya berperilaku persis seperti spesifikasinya.
  `awcms` menolaknya justru karena itu, setelah mengirim, merusak, dan
  memperbaiki pengalih bahasanya sendiri dua kali.

Kata-kata `awcms` dipertahankan persis: nama-nama itu **DITOLAK, bukan
dibuang**. Membuangnya berarti meng-cache badan yang penulisnya baru saja
menyatakan bervariasi — cacat yang sama, dicapai dengan sopan.

`Vary: Accept-Encoding`, yang dipasang `compression`, tidak tersentuh dan memang
benar: ia menamai enkoding TRANSPOR, bukan badan yang berbeda.

## Pemeriksanya ([ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md))

[`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs), tiga asersi,
masing-masing dibuktikan merah oleh mutasinya sendiri dan hijau lagi
sesudahnya:

| Asersi | Mutasi yang membuktikannya |
| --- | --- |
| Respons sungguhan tidak menyebut satu pun, pada permintaan yang menawarkan `Cookie` sekaligus `Accept-Language` | Handler yang memasang `Vary: Accept-Language` — merah pada asersi ini saja, dan itulah yang menunjukkan ia tidak bergantung pada pemeriksaan sumber di bawah |
| `server/penyaji.mjs` tidak menulis `Vary` miliknya sendiri | `res.setHeader("Vary", "Cookie")` di `pasangHeader` — merah pada asersi ini dan pada asersi di atasnya |
| Daftar terlarangnya tepat dua nama | Mempersempit `VARY_DILARANG` menjadi satu nama |

Asersi tengah sengaja **lebih ketat daripada aturan yang dijaganya**, dan tesnya
menyatakan itu alih-alih menyamarkannya: ia menolak setiap `Vary` yang ditulis
dari berkas tersebut, bukan hanya dua nama terlarang. `Accept-Encoding` sudah
datang dengan benar dari `compression`, jadi berkas itu tidak punya alasan sah
untuk menulis satu pun — dan gerbang yang harus mengurai nilai header untuk
menilainya justru gerbang yang salah menilai. Nilai ketiga yang memang
dibutuhkan adalah sebuah ADR, dan dari sanalah kedua nama ini datang.

Aturannya sendiri tinggal di `server/penyaji.mjs` sebagai `VARY_DILARANG`, di
sebelah kode yang dibatasinya, dengan penalaran yang sama seperti
`PERAN_DILARANG` di `src/config/site.ts`: konstanta yang dibaca gerbang tidak
bisa menyimpang dari docblock di sebelahnya.

## Yang mendarat bersamanya: separuh ADR-0036 yang tidak dibaca apa pun

ADR-0036 membelah kosakata URL publik ke **dua** arah — `/news/` milik repo ini,
`/blog/` milik `awcms` — dan [`AGENTS.md`](../../AGENTS.md) menulis separuh
kedua sebagai perintah: "Jangan bangun `/blog/**` di sini". Hanya separuh
pertama yang digerbangi.
[`tests/kosakata-news.test.mjs`](../../tests/kosakata-news.test.mjs) memeriksa
bahwa tab bernama `news` menyatakan `urutanSeksi: "terbaru"`, dan tidak ada
apa pun yang membaca kalimat satunya. Itu persis bentuk yang dicatat skill
gerbang lima kali: aturan yang benar, ditulis dengan tegas, dan tak diperiksa.

`awcms` ADR-0098-lah yang mengubahnya dari celah laten menjadi celah hidup. URL
publik kanoniknya kini `/{locale}/blog/{tenantCode}/…`, yang huruf per huruf
sama dengan bentuk yang dihasilkan `src/pages/[lang]/[tab]/…` di sini. Sebuah tab
ber-slug `blog` akan menerbitkan `/id/blog/…` dan `/en/blog/…` dari repo ini —
bukan kemiripan dengan kosakata repo sebelah melainkan tabrakan dengannya, pada
build yang tetap hijau dan situs yang tampak benar.

Berkas yang sama kini menolak tiga bentuk, masing-masing dibuktikan merah dengan
memutasi **repo ini** alih-alih hanya sebuah fixture: tab yang mengklaim slug
`blog`, entri `permukaanAdmin.prefiks` di bawah `/blog`, dan berkas rute yang
menuliskan segmen itu secara harfiah. Asersi keempat memeriksa bahwa pemindaian
rutenya benar-benar membaca sesuatu, sehingga pemeriksaannya tidak bisa lolos
karena tidak menemukan apa pun.

Aturannya soal alamat, bukan soal katanya: `/blog-panduan/` adalah URL milik repo
ini sendiri dan tidak bertabrakan dengan apa pun.

## Yang SENGAJA tidak diputuskan

- **Tidak diputuskan: apakah situs turunan boleh memberi prefiks pada locale
  defaultnya.** Boleh, lewat ADR-nya sendiri di reponya sendiri. Yang ditolak
  adalah melakukannya *di sini*, dengan menyalin keluarganya, di sebuah template
  yang URL-nya diwarisi setiap situs turunan.
- **Tidak diadopsi: lapisan redirect di `server/penyaji.mjs`.** Alasan ketiga
  Keputusan 1 adalah URL-nya sudah benar; menambahkan redirect untuk
  membuktikannya berarti membayar ongkosnya tanpa perubahannya.
- **Tidak diubah: permukaan `awcms` sendiri.** Situs yang melayani pembacanya
  dari `/blog/{tenantCode}/**` di sana kini mendapat URL kanonik berprefiks
  locale dan redirect dua lompatan dari tautan `/news/**` yang dipensiunkan
  (`301` ke path telanjang, lalu `307` ke yang berprefiks). Itu keputusan repo
  itu, dan diambil dengan benar; yang dilakukan ADR ini terhadapnya adalah
  memastikan dokumen di sini berhenti memerikan bentuk yang lama.
- **Tidak digerbangi: entri divergence-nya sendiri.** Apakah
  `awcms-family-compatibility.yaml` benar-benar bertambah satu baris adalah fakta
  tentang repo lain, dan repo template ini tidak punya instance untuk ditanyai.
  Itu pemeriksaan manusia saat review, dan mengaku sebaliknya adalah klaim yang
  tidak bisa dipertanggungjawabkan siapa pun.
