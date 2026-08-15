🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)

<!-- i18n-source-hash: sha256:f9971d7f3e958dfa60af0023639f9ca0106ce463a5a03bee5acaa3dad0f87d7f -->

# ADR-0036 — `/news/` adalah kosakata repo ini, dan sebuah tab yang memikulnya

- **Status:** Accepted
- **Tanggal:** 8 Agustus 2026
- **Aturan pemilik:** 8 Agustus 2026 — "update aturan bahwa `/news/` hanya berfungsi di repo ahliweb/awcms-astro untuk halaman publik dan halaman admin user", lalu "sedangkan `/blog/` hanya dipakai di repo ahliweb/awcms", lalu "semua menggunakan modul blog."
- **Terkait:** [ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) (seksi berita: `urutanSeksi: "terbaru"`), [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) (publik sebagai fungsi utama, admin USER bila dinyatakan), [ADR-0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) (feed Atom per seksi berita), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (traversal konten dari `awcms`), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (setiap aturan wajib membawa pemeriksanya), `awcms` [ADR-0071](https://github.com/ahliweb/awcms/blob/main/docs/adr/0071-kosakata-url-publik-dibelah-blog-di-sini-news-di-awcms-astro.md) (pasangan keputusan ini), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md) (di-supersede ADR-0071 itu)

## Konteks

[ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
lahir dari pertanyaan yang sangat spesifik: **apakah template ini siap mengelola
situs berita di prefix `/news/`?** Jawabannya waktu itu — prefiksnya siap,
modelnya tidak — dan ADR itu memperbaiki modelnya. [ADR-0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md)
kemudian memberi setiap seksi berita feed Atom-nya sendiri.

Yang tidak pernah dijawab: **siapa yang berhak memakai prefiks itu.** `awcms`
[ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md)
mendaratkan keluarga rute `/news/**`-nya sendiri di sana pada 3 Agustus 2026 —
empat rute, host-resolved, dari modul `blog_content` yang sama yang mengisi repo
ini. Jadi selama lima hari kedua repo boleh melayani berita publik, di alamat
yang sama, dari sumber konten yang sama.

Itu bukan konflik teknis: keduanya bekerja. Ia konflik **kosakata**, dan
bentuknya adalah pertanyaan yang harus dijawab ulang setiap kali sebuah
deployment dibangun — berita situs ini disajikan dari mana? Pertanyaan yang
dijawab per-deployment adalah pertanyaan yang dijawab berbeda-beda.

## Keputusan

**`/news/` adalah kosakata URL repo ini, dan `/blog/` adalah kosakata `awcms`.**
Satu keluarga rute per repo, dan tidak pernah keduanya di satu repo. `awcms`
[ADR-0071](https://github.com/ahliweb/awcms/blob/main/docs/adr/0071-kosakata-url-publik-dibelah-blog-di-sini-news-di-awcms-astro.md)
adalah pasangan keputusan ini dan men-supersede ADR-0059 di sana.

### 1. Bentuknya sebuah tab, bukan keluarga rute baru

Sebuah situs yang menerbitkan berita menamai tabnya `news` dan menyatakan
`urutanSeksi: "terbaru"` di `src/config/site.ts`. Ia langsung mendapat, tanpa
satu baris kode baru:

| Rute              | Berkas                        | Dari                     |
| ----------------- | ----------------------------- | ------------------------ |
| `/news`           | `src/pages/[tab]/index.astro` | mesin tab yang sudah ada |
| `/news/{slug}`    | `src/pages/[tab]/[...slug].astro` | mesin tab yang sudah ada |
| `/news/feed.xml`  | `src/pages/[tab]/feed.xml.ts` | ADR-0035                 |

...beserta padanan ber-locale di `/{lang}/news/**`. `urutanSeksi: "terbaru"`
adalah yang membuatnya benar-benar seksi berita: urutan dari `publishedAt`
alih-alih `urutan` editor, kartu yang menampilkan tanggal alih-alih nomor
artikel, dan `NewsArticle` alih-alih `Article` (ADR-0033).

### 2. `news` TETAP bukan kata yang dipesan

Ini selisih yang disengaja dengan bentuk `awcms` ADR-0059, yang §Konsekuensi-nya
menyatakan "`/news` menjadi kata yang dipesan pada host mana pun".

Di sini tidak. `news` adalah **slug tab yang dipilih situs**. Sebuah situs
panduan yang tidak punya berita tidak punya `/news`, tidak perlu mematikannya,
dan tidak perlu menjelaskan kenapa. Template ini sendiri mengirimkan tiga tab —
`panduan`, `layanan`, `informasi` — dan **nol** di antaranya berita.

Keputusan ini tidak mewajibkan satu pun situs punya `/news`. Ia menyatakan bahwa
situs yang punya, punya di sini.

### 3. Yang dibelah adalah URL, bukan kepemilikan konten

Repo ini tidak punya basis data dan tidak menyimpan satu pun artikel. Ia membaca
`GET /api/v1/blog/posts` dari `awcms` (ADR-0018, dibekukan `awcms` ADR-0065) dan
membangun halamannya statis. Modulnya sama, layar pengelolanya sama
(`/admin/blog*` di sana), izinnya sama.

Karena itu keputusan ini tidak melanggar `awcms` ADR-0070 §4 ("tidak ada
kemampuan yang hanya ada di sana"): tidak ada kemampuan yang **pindah** ke sini.
Yang pindah adalah rendering halamannya.

### 4. Untuk halaman publik DAN admin USER

Prefiks `/news/` melayani keduanya, dalam pengertian [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md):
halamannya publik sebagai fungsi utama, dan sebuah situs yang menyatakan
`permukaanAdmin` boleh memberi USER-nya permukaan untuk mengerjakan bagiannya
sendiri atas konten itu — menulis, mengajukan tinjauan, mengelola profilnya.
Peran `owner` tetap **ditolak gerbang** di sini, dan template ini tetap
menyatakan nol permukaan terautentikasi.

Yang TIDAK berubah: permukaan admin USER apa pun tetap tunduk pada ADR-0034 —
ia tidak ada sampai sebuah situs menyatakannya, dan ADR ini tidak
menyatakannya untuk siapa pun.

### 5. Taksonomi `category`/`tag` sengaja TIDAK ikut

`awcms` ADR-0059 punya `/news/category/{slug}` dan `/news/tag/{slug}`. Repo ini
tidak, dan tidak mendapatkannya di sini.

Alasannya bukan kelalaian: repo ini **belum punya taksonomi sama sekali** —
tidak ada model kategori maupun tag di `src/lib/content.ts`, dan seksi ditentukan
oleh tab, bukan oleh term. Menambahkan dua rute arsip berarti memutuskan lebih
dulu apa itu kategori di sini, bagaimana ia dipetakan dari `awcms`, dan apa yang
terjadi pada artikel yang kategorinya menamai tab yang sudah dihapus —
pertanyaan yang `urutanSeksiTab` sudah harus jawab hari ini dengan fallback
`"manual"`.

Itu keputusan tersendiri. Dinyatakan **terbuka**, bukan ditolak: sebuah situs
yang benar-benar membutuhkannya membawanya lewat ADR-nya sendiri.

### 6. Aturannya membawa pemeriksanya (ADR-0030)

Aturan "sebuah tab bernama `news` adalah seksi berita" bisa dilanggar secara
diam-diam dengan satu kata: menamai tab `news` lalu membiarkannya `"manual"`.
Hasilnya `/news` yang mengurutkan berita menurut nomor yang diketik editor,
dengan kartu tanpa tanggal dan `Article` alih-alih `NewsArticle` — sebuah
permukaan yang mengaku berita di alamatnya dan membantahnya di setiap detailnya.

`tests/kosakata-news.test.mjs` menolak konfigurasi itu: bila `tabs` memuat slug
`news`, `urutanSeksi`-nya wajib `"terbaru"`. Gerbangnya tidak menuntut tab itu
ada — template ini tidak punya, dan §2 baru saja menyatakan itu benar.

## Konsekuensi

- Pertanyaan "berita situs ini disajikan dari mana" punya satu jawaban yang bisa
  dibaca dari alamatnya, di kedua repo, dan jawabannya sama pada setiap
  deployment.
- Situs berita yang dibangun di atas template ini memakai mesin yang memang
  ditulis untuk berita — `urutanSeksi` (ADR-0033) dan feed per-seksi (ADR-0035) —
  alih-alih empat rute di `awcms` yang tidak punya keduanya.
- **Nol perubahan kode.** Mesin tabnya sudah ada, feed-nya sudah ada, dan
  template ini tetap mengirimkan tiga tab non-berita. Yang mendarat aturannya dan
  pemeriksanya.
- `awcms` masih menyajikan `/news/**`-nya saat ADR ini ditulis. Penghapusannya
  dijadwalkan ADR-0071 §4 di sana dan digerbangi di sana; repo ini tidak bisa
  menegakkannya dan tidak berpura-pura bisa.
- Sebuah situs yang butuh arsip kategori/tag di `/news/` belum terlayani (§5).
  Itu dinyatakan, bukan disembunyikan di balik "sudah siap".

## Alternatif yang dipertimbangkan

- **Keluarga rute `/news/**` fisik**, meniru bentuk `awcms` ADR-0059 — ditolak.
  Ia menjadikan `news` kata yang dipesan di **setiap** situs turunan, termasuk
  yang tidak punya berita, dan menduplikasi mesin tab yang sudah melayani bentuk
  yang sama. Paritas rute bukan tujuan; melayani situs berita adalah tujuan.
- **Membiarkan kedua repo melayani `/news/**`**, dibedakan per-deployment —
  ditolak, dan ini yang memicu ADR ini. Keputusan yang dijawab per-deployment
  adalah keputusan yang tidak pernah diambil.
- **Mengambil `/blog/` juga** — ditolak. `awcms` butuh permukaan konten publik
  yang bisa berdiri sendiri: sebuah deployment `awcms` tunggal harus tetap bisa
  menerbitkan tanpa repo ini terpasang di depannya.
- **Mewajibkan template mengirimkan tab `news`** — ditolak. Itu menjadikan setiap
  situs turunan situs berita secara bawaan, kebalikan dari ADR-0034 yang justru
  menuntut permukaan dinyatakan alih-alih diwarisi.
