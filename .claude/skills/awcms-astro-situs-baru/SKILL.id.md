---
name: awcms-astro-situs-baru
description: Menurunkan situs baru dari template awcms-astro lewat "Use this template" — apa yang harus dikosongkan sebelum commit pertama, urutan kontrak → konten → tampilan, dan jebakan yang paling sering terjadi. Gunakan saat memulai repo situs baru dari template ini, atau saat sebuah situs turunan berperilaku seperti template-nya.
---

🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SKILL.md)

<!-- i18n-source-hash: sha256:e936a43de34ed37eed775e0e40e82bf34fd5b4bfbe8f933390ce3d6bcbc6931e -->

# awcms-astro — menurunkan situs baru

`ahliweb/awcms-astro` adalah **template repository** GitHub. Tombol **"Use this
template"** membuat repo baru dengan riwayat commit bersih — bukan fork, jadi
situsnya tidak mewarisi riwayat template.

Prosedur lengkap:
[`docs/awcms-astro/checklist-repo-baru.md`](../../../docs/awcms-astro/checklist-repo-baru.md).
Skill ini memuat yang paling sering salah.

## Yang WAJIB dikosongkan sebelum commit pertama

Semuanya ikut terbawa, dan semuanya adalah riwayat **template**, bukan riwayat
situsmu:

- `.changesets/*.md` — hapus semua kecuali `README.md`.
- `CHANGELOG.md` — kosongkan.
- `docs/adr/00*.md` **dan** tabel di `docs/adr/README.md` — mulai penomoranmu
  sendiri dari `0001`. `bun run audit:dokumen` menuntut keduanya cocok dua arah,
  jadi menghapus satu tanpa yang lain memerahkan CI.
- `package.json` — `name`, `description`, `homepage`, `repository`, `version`.
- `graphify-out/` — artefak analisis repo template.

Yang **tidak** disentuh: `src/lib/`, `src/layouts/`, `src/components/`,
`src/styles/global.css`, `scripts/`, `tests/`, `server/`, `.github/`. Itu
kerangkanya.

## Urutan: kontrak → konten → tampilan

Disengaja. Tampilan terakhir karena ia satu-satunya lapisan yang murah diubah.

1. **`src/config/site.ts`** — nama, `siteUrl`, daftar locale, tab beserta
   urutannya, `urutanSeksi` setiap tab, **dan `permukaanAdmin`**. Locale yang
   ditambahkan di sini WAJIB punya katalog PO-nya.

   **Situs ini publik saja, kecuali kamu menyatakan sebaliknya.**
   `permukaanAdmin` kosong adalah bawaannya, dan ia konstanta di berkas INI —
   bukan variabel lingkungan. (Mencarinya di `.env` adalah cara paling cepat
   berhenti di tengah bootstrap; ia tidak ada di sana, dan tidak akan pernah:
   keputusan publik-vs-publik+admin setara dengan tab dan locale, jadi tempatnya
   di kontrak.) Sebuah situs boleh membawa permukaan admin untuk **user**
   (penulis, peninjau) di SEBELAH halaman publiknya — bukan menggantikannya,
   jadi prefiksnya tidak boleh `/`, prefiks locale, atau slug tab. `owner`
   ditolak gerbang: admin utama tetap di `/admin/*` milik `awcms` (ADR-0034).
   Menyatakannya tidak memindahkan satu izin pun — yang memutuskan tetap
   `awcms` — dan setiap fitur di sana wajib **juga** bisa dikelola `owner` di
   sana. Bentuk, prasyarat, dan biayanya:
   [`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md).

   **Situs berita:** menamai tab `news` TIDAK cukup, dan sejak
   [ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
   itu **bukan lagi jebakan senyap**: tab ber-slug `news` yang dibiarkan
   `urutanSeksi: "manual"` memerahkan `bun test` lewat
   `tests/kosakata-news.test.mjs`, begitu pula dua tab ber-slug `news`. Yang
   **tetap** senyap adalah seksi berita ber-slug LAIN — `berita`, `kabar`,
   `press` — karena aturannya soal ALAMAT, bukan isi: `/news/` adalah kosakata
   URL repo ini, dan gerbangnya menjaga alamat itu tidak berbohong. Tanpa
   `urutanSeksi: "terbaru"` seksi terurut menurut abjad — setiap artikel yang
   tidak dinomori bernilai `urutan` 99 dan pemecah serinya judul, jadi berita
   terbaru terkubur. Satu kata itu juga yang mengganti lencana kartu menjadi
   tanggal, membuat artikelnya memancarkan `NewsArticle` (ADR-0033), dan
   menerbitkan **feed Atom** di `/news/feed.xml` per locale, diumumkan halaman
   seksi dan halaman artikelnya (ADR-0035). Feed-nya tidak bisa dimatikan
   terpisah — ia bagian dari "seksi ini seksi berita". Yang belum ada dan harus
   kamu terima lebih dulu: paginasi, untuk halaman MAUPUN feed — indeks seksi
   dan feed-nya sama-sama memuat seluruh artikel seksi itu.
2. **`.env`** dari `.env.example` — `AWCMS_API_URL`, `AWCMS_API_TOKEN`
   (kredensial mesin; ia yang membawa tenant, ber-scope **dua** kunci:
   `blog_content.posts.read` dan `media_library.media.read`), `AWCMS_TENANT_ID`
   sebagai **asersi** yang menggagalkan build saat tidak cocok.

3. **Konten** ditulis di panel admin `awcms`, **bukan** di repo ini. Tidak ada
   `src/content.config.ts` dan tidak ada frontmatter (ADR-0018).
4. **Ilustrasi** di `src/assets/`: `hero`, `tab/<tab>`, `artikel/<tab>/<slug>`,
   tanpa ekstensi. Tidak ada peta yang harus diisi (ADR-0024). Media `awcms`
   menang atasnya bila artikelnya punya `featuredMediaId`.
5. **Tampilan** — token di `:root`, kontras terang **dan** gelap, 360px ke atas.

## Jebakan yang paling sering terjadi

| Jebakan | Akibat |
| --- | --- |
| `SITE_SOCIAL_IMAGE` menunjuk berkas yang belum ada | Pratinjau rusak di setiap halaman, **tanpa satu pun kegagalan build**. Kosong adalah keadaan yang DIDUKUNG |
| Rasio gambar bukan `--ratio-visual` | Bingkai memakai `object-fit: cover` → sumber DIPOTONG diam-diam, bukan diperkecil. `audit:konten` menolaknya |
| `AWCMS_TENANT_CODE` diisi | Variabel itu **ditolak**, bukan diabaikan (ADR-0018) |
| `AWCMS_TENANT_ID` dikosongkan | Sah, tetapi tidak memeriksa apa pun — token tenant lain akan membangun situs penuh berisi artikel milik orang lain, dengan build hijau |
| String antarmuka ditulis harfiah di `.astro` | Ia tidak pernah diterjemahkan; gerbang katalog PO menangkap key yang hilang, bukan literal yang tak pernah jadi key |
| Lupa `bun run audit:konten` **setelah** build | Sembilan keluarga gerbang keluaran, ditambah dua gerbang anggaran performa, melewati dirinya dan mengatakannya — di sebuah SITUS itu berarti tidak berjalan |
| Men-deploy tanpa `NODE_ENV=production` | `Strict-Transport-Security` **diam-diam tidak terkirim**, dan tidak ada yang mengatakannya (ADR-0029). `Dockerfile` menyetelnya; deployment yang tidak lewat image itu harus menyetelnya sendiri |
| Menambahkan `includeSubDomains` tanpa memeriksa subdomain | Setiap subdomain organisasi menjadi HTTPS-saja selama setahun, di browser setiap pengunjung — dan yang menanggung akibatnya layanan lain, bukan situs ini |
| Mengisi `src/assets/` dengan foto raster besar | Tidak ada `srcset` (ADR-0024): ponsel 360px mengunduh berkas yang sama dengan desktop 1920px. Anggaran gambar (beranda ≤ 250 KB, halaman konten ≤ 100 KB) **diukur** `bun run audit:konten` atas `dist/client` sejak 4 Agustus 2026 — jadi kelebihannya merah setelah build, bukan tidak terlihat |
| Membuat `docs/ARCHITECTURE.md` dan `docs/PROJECT_STATE.md` kosong "karena checklist minta" | Berkas kosong yang wajib adalah cara paling cepat sebuah checklist berhenti dibaca. Keduanya OPSIONAL; template ini sengaja tidak membawanya |

## Sebelum rilis pertama

```bash
bun install
bun run build          # check + astro build + bundel penyaji + asal media
bun test               # setelah build, lapis penyaji ikut jalan
bun run audit:konten   # setelah build, gerbang keluaran ikut jalan
bun run audit:dokumen  # tidak butuh build
bun run audit:translation  # tidak butuh build
bun run audit:graf     # artefak graphify-out/; melewati diri bila dihapus
bun run serve          # periksa header & cache seperti yang dilihat pembaca
bun audit              # 0 kerentanan
bun run release minor --apply
```

`bun audit` (kerentanan dependency) dan `bun run audit:konten` (isi situs)
adalah dua hal berbeda; namanya sengaja tidak dibuat mirip.
