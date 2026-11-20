🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](carikbot-conversation-reference.md)

<!-- i18n-source-hash: sha256:9201053da6237c039abadacfa72c068c5fad157f1ef59912492e6b4d590ec44c -->

# Referensi CarikBot — UI Percakapan Aman Netral-Kanal

**Versi dokumen** v1.1.0 | **Tanggal** 2026-11-20 | **Status** Referensi desain F0, riset saja; tidak menyiratkan kode runtime, API yang sudah rilis, atau paritas platform. Setiap disposisi adopsi adalah **usulan** sampai gerbang 9 lolos di repositori ini.
**Changeset** Disegarkan terhadap `main` per 2026-11-20: admin USER dan BFF dinyatakan PLANNED, urutan diselaraskan dengan ADR-0057 (Proposed), CSP dan aksesibilitas dikaitkan ke ADR-0019 dan ADR-0056, status isu hulu dinyatakan, penempatan UAT dinyatakan.

## Rujukan terverifikasi dan batasannya
[Ekosistem CarikBot](https://github.com/CarikBot/ecosystem) menggambarkan pohon interaksi dari mind-map ke JSON, manifes kategori/paket, dan respons generik teks/menu/tombol/formulir. [Spesifikasi API](https://github.com/CarikBot/ecosystem/blob/main/docs/api-structure.md)-nya memuat metadata kanal/pengguna, callback aksi, dan penangan formulir. [Engine Carik](https://github.com/luridarmawan/Carik) menggambarkan SimpleBOT/SimpleAI lama, FastPlaz, dan penangan Pascal. Manifes npm ekosistem menyatakan MIT, tetapi [LICENSE.txt](https://github.com/luridarmawan/Carik/blob/master/LICENSE.txt) engine tidak memberi izin eksplisit untuk memakai ulang kode engine. **Ambil ide arsitektur saja**; jangan mengimpor kode atau mengasumsikan kompatibilitas operasional. Skrip uji ekosistem hanya placeholder, sehingga tidak ada paritas kualitas yang diaudit. Fakta-fakta ini dibaca ulang terhadap repositori hulu pada 2026-11-20 dan masih berlaku; ini snapshot bertanggal, jadi periksa ulang sebelum mengandalkannya kemudian.

## Kontrak kandidat, belum diimplementasikan
- Response.kind: text | choice | typed_form | handoff | status; dapat memuat teks yang disetujui dan padanan aksesibilitasnya.
- Sebuah choice memuat label yang terbaca manusia dan **token transisi opaque, bertanda tangan, berumur pendek**, tidak pernah perintah bot mentah atau URL provider.
- Form digerakkan oleh JSON Schema ber-versi milik server; validasi input juga dilakukan di sisi server; consent dan pembatalan eksplisit.
- Pemeta kapabilitas provider memilih tombol, daftar, tautan, atau fallback teks bernomor, dan tidak pernah menyatakan sebuah provider mendukung suatu elemen berdasarkan antarmuka provider lain.
- Baca/tulis domain HARUS berupa operasi bernama yang terautentikasi lewat API backend kanonis yang sudah ada. UI klien/provider tidak dapat memberi akses, membuat mutasi pembayaran, atau mengirim kampanye sendiri.
- Saran yang dihasilkan AI hanyalah draf tidak tepercaya. Persetujuan manusia / kebijakan risiko-rendah yang disetujui lebih dulu dan otorisasi provider+consent yang segar tetap wajib sebelum pesan keluar apa pun.
- Semua konten di-escape, rendering HTML dibatasi, dan tautan tidak tepercaya divalidasi. Tidak ada POST ke URL callback sembarang/SSRF.
- Tidak ada lintas-tenant, rahasia, kata sandi, SQL mentah, bearer token provider, .env, cookie sesi, atau isi percakapan tanpa masking di log, konteks alat, telemetri, atau tangkapan layar.

~~~json
{
  "version":"1.0.0",
  "response":{"kind":"choice","text":"Apa yang Anda butuhkan?",
     "choices":[{"label":"Dukungan","transition_token":"signed-opaque-ref"}]},
  "fallback":{"kind":"text","text":"Balas 1 untuk Dukungan"},
  "correlation_id":"uuid"
}
~~~

## Kepemilikan, tata kelola, dan status
**Ada:** hanya perilaku yang secara eksplisit hadir di berkas repositori saat ini dan lingkungan uji yang terverifikasi yang dianggap sudah dikirim. **Diusulkan:** kontrak respons dalam referensi ini adalah kandidat, bukan skema OpenAPI yang sudah dipublikasikan. **Eksternal:** Hermes memiliki runtime agent; AWCMS memiliki catatan tenant/kanonis, persetujuan, dan kebijakan pengirim; OMES memiliki jaminan host; aplikasi turunan tidak mengambil kepemilikan kredensial provider atau sistem data bisnis baru.

## Ancaman dan uji negatif yang diwajibkan
| Ancaman | Uji/penerimaan |
|---|---|
| Markup yang disuntikkan, tautan berbahaya | Escape label/respons, blokir navigasi tidak aman atau callback jarak jauh |
| Callback provider palsu / token dipakai ulang | Tolak transisi yang tidak valid/kedaluwarsa/tidak cocok cakupannya |
| Tenant dan akun yang salah | Otorisasi/ABAC/RLS backend yang ada menolak operasi |
| Consent dicabut | Aksi keluar di masa depan ditolak walau draf dibuat sebelumnya |
| Submit form ganda | Kunci idempotensi menghasilkan satu transaksi yang diterima |
| Alur tak berujung/terlalu dalam | Kedalaman, langkah, ukuran, TTL, dan pembatalan maksimum dibatasi |
| Kapabilitas platform tak terduga | Fallback teks yang dapat diakses; tanpa kehilangan data |
| Injeksi alat oleh AI | Draf tidak dapat dieksekusi; allowlist alat dan persetujuan manusia/domain yang eksplisit |
| Gangguan jaringan | Loading/retry/pembatalan aman yang eksplisit, tidak pernah sukses palsu |
| Pencatatan data sensitif | Hanya metadata dan correlation ID; tanpa kebocoran isi pribadi |

## Tujuh+ perjalanan uji
1. FAQ publik -> jawaban yang disetujui; tidak meminta data sensitif.
2. Menu dengan tiga pilihan -> provider mendukung tombol; semua pilihan terpetakan dengan benar.
3. Tombol tidak didukung -> fallback teks bernomor dan pilihan yang dapat diakses.
4. Survei bertipe -> validasi, consent, pembatalan, dan kebijakan draf tersimpan.
5. Pencarian pesanan -> akun tidak berwenang ditolak, pengguna berwenang hanya melihat status miliknya.
6. Handoff -> hanya meneruskan konteks bercakupan yang di-consent, tidak mengirim aksi berhak istimewa.
7. Consent pesan dicabut -> draf ditampilkan secara privat tetapi tidak pernah dikirim.
8. Callback berbahaya -> ditolak sebelum efek samping apa pun.
9. Lanjut di dua perangkat -> revisi dipin dan token basi ditolak.
10. Retry jaringan -> tidak ada mutasi domain ganda.

## Standar desain dan syarat hukum
WCAG 2.2 AA untuk web dan semantik aksesibilitas yang setara pada permukaan native; OWASP ASVS/API Top 10; ISO/IEC 27001, 27002, 27005, 27034, 27701, dan 42001; ISO 20000-1 dan ISO 22301 untuk keamanan/kontinuitas operasional. ISO 27017/27018 bila pemroses PII cloud publik terlibat. ISO/IEC 15408 hanya bila target evaluasi formal terpisah didefinisikan. UU 27/2022 PDP dan PP 71/2019 PSTE berlaku sesuai peran/lingkup hukum; Perpres 95/2018 SPBE dapat berlaku untuk produk pemerintah. Jangan pernah menyimpulkan kepatuhan hukum hanya karena dokumentasi mengutip sebuah standar.

**Gerbang rilis:** standar lintas-portofolio internal mensyaratkan perencanaan pengembangan 18 langkah, Definition of Ready lintas-spesifikasi oleh manusia (langkah 9), isu/PR atomik dan uji terverifikasi, staging, lalu Go/No-Go oleh manusia (langkah 15). UAT (langkah 14) dijalankan di repositori implementasi atau proyek turunan template ini, bukan di template hulu ini (DL-059); gerbang 15 tetap berlaku di sini. Dokumen riset saja tidak mengizinkan deploy produksi.

## Batas khusus: halaman publik Astro dan admin USER yang dinyatakan

**Isu pemilik:** https://github.com/ahliweb/awcms-astro/issues/166. Konteks hulu: https://github.com/ahliweb/awcms-astro/issues/127 (desain UI) dan https://github.com/ahliweb/awcms/issues/1253 (kontrak percakapan dan alur kanonis AWCMS). Keduanya isu riset/desain yang sudah ditutup; menutup isu bukan kontrak yang diterima, jadi periksa OpenAPI AWCMS terkini sebelum mengandalkan apa pun darinya. Astro adalah pengalaman web publik; admin USER dan BFF **diizinkan** oleh ADR-0034 tetapi **PLANNED, belum terimplementasi** (`permukaanAdmin` kosong dan tidak ada rute yang menyetel `prerender = false`; lihat [ui-contract-inventory.id.md](ui-contract-inventory.id.md) §6). Hari ini satu-satunya panggilan saat permintaan adalah tiga panggilan dari peramban (pencarian, beacon kunjungan halaman, buletin), sehingga langkah terautentikasi di bawah hanya berlaku setelah sebuah situs menyatakan admin USER. Admin SYSTEM ada di AWCMS. Tidak ada pengirim provider, engine chatbot, penyimpanan data bisnis, atau agent runtime baru di sini.

### Perjalanan pengguna yang diusulkan
- Situs publik statis menampilkan FAQ terbit yang sudah disanitasi dan titik masuk kontak opsional, menjaga SEO, URL canonical, dan SSG bila sesuai.
- Pengguna memilih layanan. Frontend hanya menampilkan token transisi opaque yang diterbitkan server, bukan teks aksi sembarang.
- Operasi terautentikasi memakai API/BFF resmi yang ada dengan validasi permintaan, proteksi CSRF/Origin bila berlaku, dan kredensial berumur pendek; tidak ada rahasia API di bundle.
- Server mengembalikan respons bertipe dengan kebijakan kedaluwarsa/consent yang eksplisit. Astro meng-escape keluaran dan memeriksa CSP serta aksesibilitas.
- Bila interaksi memerlukan provider atau petugas dukungan, kebijakan backend yang melakukan penugasan/pengiriman; Astro hanya menampilkan status yang berwenang.

### Penerimaan khusus Astro
1. Konten SSG tetap dapat dirayapi; tidak ada penulisan ulang paksa menjadi SPA.
2. Akses admin USER yang terautentikasi tetap dibatasi sesi dan tidak menjadi admin SYSTEM.
3. CSP dan rendering tautan mencegah XSS/navigasi tidak aman dari teks model/pengguna. CSP ketat yang dikirim penyaji ([ADR-0019](adr/0019-csp-ketat-dikirim-penyaji.id.md)) tidak dilonggarkan, dan tidak ada widget overlay atau chat pihak ketiga yang dimuat.
4. Perilaku keyboard, pembaca layar, fokus, galat form, dan responsif seluler diuji. Bukti aksesibilitas adalah gerbang axe di peramban sungguhan tanpa pengecualian dan dengan versi dipin ([ADR-0056](adr/0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md)).
5. Opt-out dan kebijakan retensi ditampilkan saat pengiriman form.
6. Tidak ada bearer token provider, rahasia, atau data kotak masuk privat di HTML yang dirender/payload statis.
7. Kapabilitas backend yang sebenarnya diverifikasi lewat OpenAPI dan uji negatif; endpoint yang tidak dikenal didokumentasikan sebagai direncanakan.
8. Web Push/SSE/WS tidak menggantikan tanda terima pengiriman provider yang sebenarnya.

### Keluaran yang diusulkan
Sebuah wireframe, prototipe renderer UI bertipe minimal (setelah persetujuan), rangkaian kontrak mock, dan matriks uji untuk peramban seluler/desktop. Urutan mengikuti [ADR-0057](adr/0057-awcms-first-orders-ownership-and-contract-not-code-and-three-gates-separate-design-mock-and-release.id.md), yang berstatus **Proposed**, belum keputusan: gerbang A kesiapan desain, gerbang B build terhadap mock yang dihasilkan dari kontrak, gerbang C integrasi dan rilis terhadap backend nyata; mock tidak pernah menggantikan gerbang C. Implementasi penuh ditunda sampai kontrak AWCMS hulu dan DoR disetujui. Tidak ada runtime situs publik yang memanggil Hermes secara langsung.

## Changelog
- v1.1.0 (2026-11-20): Diverifikasi ulang terhadap `main` dan repositori hulu; admin USER dan BFF dinyatakan PLANNED, isu hulu dicatat sudah ditutup (bukan kontrak yang diterima), batas ADR-0019, ADR-0056, dan ADR-0057 ditambahkan, penempatan UAT dinyatakan; tanpa perubahan runtime.
- v1.0.0 (2026-11-10): Lingkup riset, kontrak kandidat, ancaman, penerimaan; tanpa perubahan runtime.
