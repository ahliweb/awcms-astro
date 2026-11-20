🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0057-awcms-first-orders-ownership-and-contract-not-code-and-three-gates-separate-design-mock-and-release.md)

<!-- i18n-source-hash: sha256:31cec538768e94d1000562eee7a63e593b4359e3bfc7901ec8dd29a4027eeb4f -->

<!-- i18n-source-hash: sha256:placeholder -->

# ADR-0057 — "`awcms` lebih dulu" mengurutkan kepemilikan dan kontrak, bukan kode, dan tiga gerbang memisahkan desain, build dengan mock, dan rilis

- **Status:** Diusulkan (Proposed)
- **Tanggal:** 20 November 2026
- **Menjernihkan, tanpa mengubah norma:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md) §4 ("`awcms` lebih dulu, selalu") dan [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.id.md) §1 (kebutuhan backend menjadi MODUL di `awcms`). Tidak ada dari keduanya yang ditulis ulang; masing-masing mempertahankan teksnya.
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.id.md) (rute on-demand yang dinyatakan, dan BFF), [ADR-0020](0020-layar-admin-kembali-ke-awcms.id.md), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (aturan tertulis wajib membawa pemeriksanya), [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md) (`awcms` tiruan adalah fixture markup, bukan mock kontrak), `awcms` [ADR-0065](https://github.com/ahliweb/awcms/blob/main/docs/adr/0065-awcms-astro-consumer-contract-is-frozen.md) (kontrak konsumen yang dibekukan), `awcms` [ADR-0156](https://github.com/ahliweb/awcms/blob/main/docs/adr/0156-adopt-development-flow-v2-validated-ux-before-data-model-frontend-backend-integration-per-slice.md) (alur v2: frontend, lalu backend, lalu integrasi, per irisan), isu #186

**Hanya dokumen dan tata kelola.** ADR ini tidak menambah kode, rute, dependency, endpoint, basis data, atau perubahan gerbang. Ia mencatat bagaimana dua kalimat yang sudah diterima dibaca bersama. **Ia berstatus Proposed dengan sengaja:** ia tidak memindahkan norma, tetapi menetapkan penafsiran yang bergantung pada `awcms` ADR-0156 maupun ADR-0034/0038 repo ini, sehingga perlu ditinjau di kedua sisi sebelum Accepted (lihat §Perlu keputusan).

## Konteks

Dua teks yang sudah diterima bisa dibaca saling berlawanan.

- ADR-0034 §4 dan `AGENTS.md` menyatakan urutan kerja adalah "**`awcms` lebih dulu, selalu**", karena fitur yang mendarat di sini lebih dulu adalah fitur yang untuk sementara tidak bisa dimatikan siapa pun. ADR-0038 menyatakan kebutuhan backend adalah modul di `awcms`, bukan folder di sini.
- Aturan alur kerja 6 di `AGENTS.md`, yang mengadopsi alur v2 (`awcms` ADR-0156), menyatakan langkah 11 berjalan per irisan: 11.1 frontend di sini (terhadap kontrak `awcms` dan mock yang dihasilkan darinya), lalu 11.2 backend sebagai PR di `awcms`, lalu 11.3 integrasi.

Dibaca harfiah dan terpisah, yang pertama bisa berarti "tidak ada satu baris pun di sini sebelum handler di-merge di `awcms`", dan yang kedua bisa berarti "bangun layarnya sekarang, backend menyusul". Diterapkan bersamaan oleh dua orang yang masing-masing hanya membaca teksnya sendiri, yang pertama memblokir yang kedua dan yang kedua merilis layar tanpa apa pun di belakangnya. Keduanya bukan maksud teks-teks itu:

- Kerugian yang disebut ADR-0034 §4 ("fitur yang tidak bisa dimatikan siapa pun") mensyaratkan fitur itu **sampai ke pengguna**. Pekerjaan di branch terhadap mock tidak sampai ke siapa pun.
- Alur v2 tidak pernah mengizinkan frontend dirilis sendirian. Langkah 11.3 menukar mock dengan backend nyata dan menjalankan uji kontrak di kedua sisi, dan `awcms` ADR-0156 §3 menyatakan otorisasi tetap ditegakkan di backend dan basis data.

Jadi keduanya kompatibel dalam **kepemilikan** dan hanya ambigu dalam **urutan**. ADR ini menamai urutannya.

## Keputusan

### 1. "`awcms` lebih dulu" menyangkut tiga hal, dalam urutan ini

Ia dibaca sebagai: **(a)** kebutuhan dan pemilik backend-nya disebut, **(b)** kontrak disepakati di `awcms`, **(c)** kapabilitasnya dapat dikelola `owner` lewat `/admin/*` milik `awcms` (ADR-0034 §4 butir 4) — dan (c) harus benar **paling lambat pada rilis di sini yang memaparkan fitur itu**, bukan sebelum baris pertama ditulis.

Ia **tidak** dibaca sebagai syarat bahwa handler sudah di-merge di `awcms` sebelum branch frontend boleh dimulai, dan **tidak** dibaca sebagai izin merilis frontend yang tidak punya backend nyata.

### 2. Tiga gerbang yang berbeda

| Gerbang | Pertanyaan yang dijawab | Yang harus ada | Yang diizinkan |
| --- | --- | --- | --- |
| **A. Kesiapan desain** | Adakah sesuatu yang nyata untuk digambar terhadapnya? | Kebutuhan backend dan pemiliknya disebut: modul `awcms` yang sudah ada, atau modul yang sudah lewat admission `awcms` ADR-0012, atau "tanpa backend: pembacaan saat build". Operasi kontrak yang dibutuhkan layar, disepakati di `awcms` (langkah 8 alur v2 dan gerbang 9 di sana). Setiap state layar punya sumber data di kontrak itu. Izin yang dituntut operasi disebut. Cara `owner` mengelola kapabilitasnya disebut. | Pekerjaan frontend boleh dimulai. **Tidak ada ERD, skema, atau handler yang dituntut gerbang ini.** |
| **B. Build terhadap mock** | Apakah layar berfungsi di setiap state? | Mock yang **dihasilkan dari kontrak yang disepakati**, tidak pernah ditulis tangan agar cocok dengan layar. Layar dijalankan di semua state (kosong, memuat, galat, tanpa izin, backend tidak tersedia saat build). | Implementasi dan review frontend (langkah 11.1 dan 12 alur v2). |
| **C. Kesiapan integrasi dan rilis** | Apakah yang nyata bekerja, dan bisakah owner menjalankannya? | Kapabilitas ada di `awcms` (sudah di-merge, dan tersedia di lingkungan tempat situs di-build). Layar pengelolaan `owner` ada di sana. Uji kontrak lolos di kedua sisi, dan `tests/kontrak-awcms.test.mjs` diperbarui bersama `awcms` bila permukaan baru dipanggil (ADR-0038 §Konsekuensi). Pemeriksaan ujung-ke-ujung terhadap backend nyata, **bukan** tiruan. Mock tidak ada di jalur yang dikirim. | Rilis yang memuat fitur itu (langkah 11.3 alur v2, gerbang 15). |

Mock, server tiruan, atau uji hijau berbasis mock tidak pernah menggantikan gerbang C. Tiruan milik repo ini (`e2e/awcms-tiruan.mjs`) adalah fixture markup, dan header-nya menyatakannya; ia bukan mock kontrak dan juga tidak memenuhi gerbang B, karena ditulis tangan.

### 3. Pagar yang berlaku di setiap gerbang

- **Otorisasi tidak pernah ditegakkan hanya di sini.** Layar menggambar tombol; RBAC/ABAC default-deny dan RLS milik `awcms` yang memutuskan. Mock boleh mengembalikan jawaban "tanpa izin" agar state itu bisa dibangun; ia tidak pernah memutuskannya.
- **Mock tidak menyimpan data milik repo ini.** Ia berada di luar jalur kode yang dikirim (tes, e2e, skrip pengembangan), tidak menulis apa pun, dan tidak ada build produksi yang jatuh kembali kepadanya. Cadangan yang menyajikan konten saat `awcms` tidak terjangkau adalah kepemilikan data dengan nama lain (ADR-0038 §2).
- **Tidak ada basis data, backend lokal, endpoint sendiri, atau SSR publik yang diperkenalkan** dengan mengikuti urutan ini. `tests/tanpa-backend.test.mjs` dan `tests/peran-situs.test.mjs` berlaku tanpa perubahan.
- **Celah yang ditemukan di B kembali ke kontrak**, bukan menjadi penyesuaian diam-diam pada layar atau mock (alur v2 §3).

### 4. Apa itu `awcms-astro`, dinyatakan ulang (tanpa perubahan)

Konsumen saat-build untuk situs statis publik, dan, hanya bila situs menyatakan `permukaanAdmin`, permukaan admin USER serta BFF ADR-0014 yang merangkai panggilan `awcms`. Ia bukan system of record, tidak memiliki basis data maupun penulisan domain, dan admin SYSTEM tetap milik `awcms` sendiri.

## Ditolak

- **"Frontend dulu, kontrak belakangan."** Ia mengulang apa yang hendak dicegah alur v2 dari arah sebaliknya: layar yang sumber datanya tebakan, baru ketahuan saat integrasi.
- **"Handler harus sudah di-merge di `awcms` sebelum branch frontend apa pun dimulai."** Ia membuat dua repo saling menunggu dan tidak menambah keamanan, sebab keamanannya ada di gerbang C.
- **"Build yang hijau dengan mock siap dirilis."** Gerbang C ada karena tidak ada apa pun dalam mock yang membuktikan backend, katalog izin, atau layar `owner` itu ada.
- **"Data mock di-commit di `src/` agar situs tetap bisa di-build tanpa `awcms`."** Itu konten milik repo ini, dan hal pertama yang bertahan pada hari `awcms` tidak terjangkau.
- **Membiarkannya tidak tertulis.** Dua kalimat yang saling berlawanan tetap ambigu sampai seseorang membayar harga ambiguitasnya.

## Konsekuensi

- Aturan alur kerja 6 di `AGENTS.md`, [`permukaan-admin-user.md`](../awcms-astro/permukaan-admin-user.id.md) §7, dan [`checklist-repo-baru.md`](../awcms-astro/checklist-repo-baru.id.md) §2 menyatakan tiga gerbang dan menunjuk ke sini, dan cermin Indonesianya mengatakan hal yang sama.
- `tests/tanpa-backend.test.mjs` mendapat satu pemeriksaan bahwa `AGENTS.md` dan cerminnya tetap menyatakan mock tidak pernah menggantikan gerbang rilis (ADR-0030: aturan tertulis membawa pemeriksanya). Seperti berkas itu lainnya, ia memeriksa bentuk, dan tidak bisa menilai apakah sebuah PR menghormati urutannya; itu tetap penilaian reviewer.
- **Tidak digerbangi, dan ditulis agar tidak dikira terjaga:** bahwa mock dihasilkan dari kontrak; bahwa mock tetap di luar kode yang dikirim; bahwa pemeriksaan backend-nyata gerbang C dijalankan terhadap instance nyata. Yang pertama terhambat perkakas yang oleh `awcms` ADR-0156 sendiri dicatat sebagai celah (belum ada generator dari OpenAPI), yang ketiga karena repo template ini tidak punya instance `awcms`. Reviewer yang memikulnya.
- Tidak ada perubahan teks ADR-0034 atau ADR-0038. Pembacanya menemukan keputusan ini lewat indeks ADR dan kontrak kerja.

## Perlu keputusan

Tingkat pemilik, tidak diputuskan di sini:

1. **Menerima ADR ini, atau mengamandemen ADR-0034 §4 di tempat.** Disarankan: menerima ADR ini. Amandemen di tempat menulis ulang keputusan yang sudah Accepted untuk menyelesaikan ambiguitas yang tidak pernah berupa konflik.
2. **Bolehkah frontend tahap-mock di-merge ke `main` sebelum gerbang C?** Disarankan: ya, hanya bila fitur itu inert di template secara bawaan (tidak ada yang dinyatakan di `permukaanAdmin`, tidak ada permukaan baru yang dipanggil build), sehingga `main` tetap bisa dirilis; bila tidak, tahan di branch sampai C. Alternatifnya, tanpa merge sebelum C, membuat `main` lebih sederhana dengan harga branch berumur panjang.
3. **Kalimat yang sepadan di sisi `awcms`** (ADR-0156 repo itu adalah tempat "per irisan" dimiliki). Repo ini tidak bisa menulisnya.

## Hubungan dengan `awcms`

Keputusan ini **tidak** menciptakan divergence dari kontrak keluarga, sehingga tidak ada entri yang perlu diminta di manifest keluarga (`awcms` ADR-0068). Ia membaca `awcms` ADR-0156 dan tidak menyatakan ulang alurnya; bila keduanya bisa berbeda, `awcms` ADR-0156 menang untuk alur dan ADR-0038 untuk alamat.
