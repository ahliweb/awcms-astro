🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0054-html-gets-a-shared-cache-lifetime-and-every-deploy-purges-the-cdn.md)

<!-- i18n-source-hash: sha256:4f3287cbd75530c5e61d15cf1fff3f3e974162824e3cbd41d1d94bdd85d4661b -->

# ADR-0054 — HTML mendapat jendela cache bersama, dan setiap deploy mem-purge CDN

- **Status:** Accepted
- **Tanggal:** 12 November 2026
- **Mengamandemen:** [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.id.md) keputusan 5 dan aturan yang dibawanya dari "Apa yang sebenarnya dikerjakan nginx di sini" butir 3 (HTML `max-age=0, must-revalidate`). Selebihnya ADR-0016 tetap berlaku, termasuk aturan `immutable` untuk `/_astro/`.
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (rute terotentikasi dan BFF tidak pernah boleh di-cache), [ADR-0019](0019-csp-ketat-dikirim-penyaji.id.md), [ADR-0041](0041-locale-stays-at-the-root-and-two-vary-names-are-refused.id.md) (`Vary: Cookie` dan `Vary: Accept-Language` tetap ditolak, dan itulah yang membuat salinan bersama aman), [`docs/deploy-coolify.md`](../deploy-coolify.id.md), isu #168

## Konteks

Situs ini HTML statis yang disajikan Bun di belakang proxy platform. ADR-0016
mengirim setiap respons HTML dengan `Cache-Control: public, max-age=0,
must-revalidate`, dipilih agar rebuild lewat webhook yang sukses langsung
terlihat. Akibatnya CDN di depan situs tidak punya jendela kesegaran untuk
dipakai: setiap tampilan halaman sampai ke origin, padahal halamannya identik
byte per byte untuk semua pembaca. Beban origin sama dengan laju permintaan di
edge, kebalikan dari biaya yang semestinya untuk situs statis.

Alasan awalnya masih berlaku dan menjadi kendala bagi perubahan apa pun: cache
yang hidup lebih lama dari rebuild membuat rebuild yang sukses terlihat seperti
tidak pernah jalan, dan tidak ada yang gagal ketika itu terjadi.

## Opsi yang dipertimbangkan

| Opsi | Yang dilakukan | Kekuatan | Kelemahan |
| --- | --- | --- | --- |
| **A. `s-maxage` plus purge saat deploy** (dipilih) | HTML membawa jendela cache bersama yang pendek; setiap deploy mem-purge CDN begitu build baru tayang | Rebuild tetap cepat (purge) dan CDN menyerap pembacaan; purge yang terlewat dibatasi `s-maxage` pendek | Menambah langkah deploy dan satu kredensial CDN yang harus dipegang |
| B. `s-maxage` pendek tanpa purge | Header sama, tidak ada yang lain | Paling sederhana; tanpa kredensial | Rebuild bisa terlihat belum diterapkan selama `s-maxage` penuh; batas itu satu-satunya kendali |
| C. Pertahankan header sekarang | Tidak berubah | Tidak ada bagian bergerak baru | CDN tidak bisa menyimpan HTML; setiap tampilan mengenai origin |

Pemilik memilih **A** pada 12 November 2026 lewat dialog pilihan baku.

### Analisis trade-off

| Kriteria | A, dipilih | B | C |
| --- | --- | --- | --- |
| Keamanan | Satu kredensial baru. Dimitigasi: token khusus purge pada satu zona, hanya lewat variabel lingkungan, tidak pernah di-commit | Tanpa kredensial | Tanpa kredensial |
| Performa | CDN melayani hampir semua pembacaan HTML; beban origin turun ke laju miss | Sama, dengan ekor basi lebih panjang | Origin melayani setiap tampilan |
| Kemudahan perawatan | Satu skrip kecil tanpa dependency dan satu hook terdokumentasi | Bagian paling sedikit | Bagian paling sedikit |
| Skalabilitas | Beban origin tidak lagi tumbuh bersama pembaca | Sama | Beban origin tumbuh bersama pembaca |
| Aksesibilitas | Tidak berpengaruh | Tidak berpengaruh | Tidak berpengaruh |
| Dampak SEO | TTFB lebih cepat dan stabil bagi perayap; kesegaran dibatasi purge | Kesegaran hanya dibatasi `s-maxage` | Tidak berubah |
| UI/UX | Pembaca melihat rebuild seketika setelah purge | Rebuild bisa tertunda selama `s-maxage` | Seketika |
| Kompatibilitas | `Cache-Control` baku (RFC 9111) yang dimengerti cache bersama mana pun; `max-age=0` menjaga browser tetap memvalidasi ulang | Sama | Sama |
| Kompleksitas operasional | Langkah pasca-deploy yang tidak boleh menggagalkan deploy; satu set variabel untuk dirawat | Tidak ada | Tidak ada |
| Implikasi jangka panjang | Cocok dengan target kapasitas yang menghendaki rasio hit CDN sangat tinggi untuk halaman publik | Jaminan lebih lemah | Tidak bisa mencapai target itu |

## Keputusan

1. **Respons HTML mengirim `Cache-Control: public, max-age=0, s-maxage=300, must-revalidate`.**
   - `max-age=0` dan `must-revalidate` menjaga perilaku browser ADR-0016: browser
     selalu memvalidasi ulang, jadi pembaca tidak pernah terjebak halaman basi
     karena cache browser.
   - `s-maxage=300` (lima menit) satu-satunya bagian baru. Ia hanya ditujukan
     kepada cache bersama, dan lima menit sengaja konservatif: cukup panjang agar
     CDN menyerap lonjakan, cukup pendek agar deploy yang purge-nya tidak jalan
     tetap dibatasi beberapa menit kebasian.
   - `stale-while-revalidate` **tidak** dipakai. Ia akan memanjangkan ekor basi
     melewati batas yang dinyatakan, dan bisa ditambahkan kelak lewat keputusan
     tersendiri bila laju miss yang terukur memintanya.
   - Nilai yang sama berlaku untuk setiap respons selain `/_astro/` (termasuk
     `/tema.js` yang tak ber-hash dan halaman 404), persis seperti satu aturan
     HTML sebelumnya.
2. **`/_astro/*` tetap `public, max-age=31536000, immutable`.** Nama aset ber-hash
   membuatnya aman selamanya, dan tidak ada yang berubah di sini.
3. **Rute terotentikasi dan BFF tidak pernah boleh di-cache.** Template ini tidak
   menyatakan satu pun (`tests/peran-situs.test.mjs`). Situs yang menambahkannya
   di bawah ADR-0014 atau ADR-0034 harus mengirim sendiri `Cache-Control:
   private, no-store` untuknya; `s-maxage` ADR ini tidak berlaku bagi rute itu.
4. **Setiap deploy mem-purge CDN setelah build baru tayang.** Langkahnya
   [`server/purge-cdn.mjs`](../../server/purge-cdn.mjs), dikirim di image runtime
   sebagai `dist/server/purge-cdn.mjs` dan dijalankan oleh post-deployment
   command platform (`docs/deploy-coolify.md`). Purge dilakukan **per nama host**
   (`purge_cache` Cloudflare dengan `hosts`), bukan seluruh zona, sehingga situs
   lain di zona yang sama tidak tersentuh. Purge per nama host didokumentasikan
   CDN untuk semua tingkat paket, makanya daftar URL dari sitemap tidak
   diperlukan.
5. **Kredensial hanya lewat jalur rahasia.** Skrip membaca `CLOUDFLARE_API_TOKEN`
   dan `CLOUDFLARE_ZONE_ID` dari lingkungan aplikasi yang dideploy, sebagai
   variabel runtime yang ditandai secret di platform. Tidak ada yang ditulis ke
   repo, lapisan image, atau log; token tidak dicetak, termasuk pada dry-run.
   Token harus dibatasi pada **Cache Purge untuk satu zona**.
6. **Kredensial yang hilang menurunkan fungsi, tidak menggagalkan.** Bila ada
   variabel yang hilang, skrip mencatat satu peringatan yang menyebut namanya,
   menyatakan bahwa `s-maxage` membatasi kebasian, dan exit `0`. Kegagalan API
   setelah percobaan ulang terbatas mencatat galat dan juga exit `0`, karena
   situs sudah tayang dan deploy tidak boleh ditandai gagal karena petunjuk
   cache. `--strict` exit `1` sebagai gantinya, untuk pipeline yang menginginkan
   kegagalannya. `--dry-run` mencetak permintaan tanpa mengirimnya.
7. **Galat dan batas laju ditangani, tidak diabaikan.** HTTP `429` menghormati
   `Retry-After` (dibatasi); `5xx` dan galat jaringan dicoba ulang dengan jeda
   eksponensial; `4xx` lainnya (token salah, zona salah, izin kurang) berhenti
   seketika dengan pesan dari CDN sendiri, karena percobaan ulang tidak bisa
   memperbaikinya. Paling banyak tiga percobaan.

## Konsekuensi

- **Rebuild terlihat cepat**: seketika setelah purge yang berjalan, dan paling
  lama lima menit pada kasus terburuk ketika purge tidak berjalan.
- **CDN harus dikonfigurasi agar menyimpan HTML.** CDN tidak menyimpan HTML secara
  bawaan. Operator situs menambahkan aturan cache yang menjadikan HTML layak
  di-cache dan mengikuti `Cache-Control` origin. Itu konfigurasi akun CDN dan di
  luar lingkup repo ini (isu #168); `docs/deploy-coolify.md` menjelaskan cara
  memverifikasinya dari header respons.
- **Token berada di kontainer runtime.** Langkah purge berjalan di dalam
  kontainer, jadi kredensialnya ada di lingkungan kontainer itu. Proses yang
  melayani pembaca (`server/penyaji.mjs`) tidak pernah membacanya, dan sebuah tes
  menjaga hal itu, tetapi keterpaparannya nyata; itulah sebabnya token hanya
  untuk purge dan terbatas pada satu zona.
- **404 yang ter-cache mungkin terjadi hingga `s-maxage`.** Header dipasang
  sebelum berkas dicari, jadi 404 pun membawanya. Purge saat deploy
  membersihkannya; kasus terburuknya halaman baru tampil 404 dari CDN kurang dari
  lima menit bila purge tidak berjalan.
- **Cakupan nama host dinyatakan operator.** `CDN_PURGE_HOSTS` (atau host dari
  `SITE_URL`) menyebut apa yang di-purge. Nilai yang salah tidak mem-purge apa pun
  dan mengatakannya.
- **Aturan satu baris di ADR-0016, standar performa, dan `docs/deploy-coolify.md`
  berubah bersama ADR ini.** Masing-masing kini menyatakan dua aturan HTML untuk
  dua pembaca: browser dan cache bersama.

## Verifikasi

`tests/penyaji.test.mjs` membuktikan nilai header (jendela cache bersama dan
batasnya untuk HTML, validasi ulang browser dipertahankan, `/_astro/` immutable
dan bebas `s-maxage`, paritas GET/HEAD). `tests/purge-cdn.test.mjs` membuktikan
langkah purge terhadap endpoint tiruan lokal: bentuk permintaan, cakupan nama
host, dry-run tidak mengirim apa pun, kredensial hilang memberi peringatan dan
keluar bersih, `429` dan `5xx` dicoba ulang, `4xx` berhenti, dan token tidak
pernah muncul di keluaran. API Cloudflare sungguhan tidak dipanggil oleh tes
mana pun.
