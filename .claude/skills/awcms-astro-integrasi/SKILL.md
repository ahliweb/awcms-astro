---
name: awcms-astro-integrasi
description: Kontrak integrasi awcms-astro ↔ awcms — tenant dari token mesin, traversal build feed (view=full + cursor), resolusi media + asal media untuk img-src, dan penolakan yang WAJIB ditiru. Gunakan saat menyentuh src/lib/content.ts, src/lib/awcms/**, scripts/asal-media.mjs, atau saat sebuah build menerbitkan situs yang tampak benar tetapi isinya kurang.
---

# awcms-astro — kontrak integrasi dengan `awcms`

Repo ini **mengonsumsi** `awcms`; ia tidak menyajikan API. `src/lib/awcms/client.ts`
adalah satu-satunya berkas yang menghubungi `awcms`, dan `src/lib/content.ts`
satu-satunya tempat komponen menyentuh hasilnya.

## Aturan yang tidak boleh dilanggar

| Aturan | Yang terjadi bila dilanggar |
| --- | --- |
| Komponen **tidak pernah** mengambil datanya sendiri | Satu permintaan HTTP per kartu yang dirender, atau komponen async |
| Traversal memakai `view=full` **dan** `order=created_at` | Daftar mengembalikan RINGKASAN; `contentJson` `undefined`, badan artikel kosong, seksi kosong, **build tetap hijau** |
| Seluruh halaman disusuri lewat `nextCursor` | Situs terbit dengan artikel hilang — dan yang hilang justru yang terbaru |
| Tenant datang dari **token**, tidak pernah dari header | `awcms` menurunkan tenant dari kredensial mesin dan mengabaikan header yang berbeda |
| Diam-diam memotong data = **kegagalan**, bukan optimasi | Lihat seluruh baris di atas |

## Permukaan — TIGA yang dipanggil, dua yang tidak

Bedanya penting, dan pernah salah ditulis di berkas ini sebagai "lima permukaan
yang dipakai". Penilaian `awcms` 4 Agustus 2026 sempat mencatat ENAM; ADR-0065
di sana meluruskannya pada hari yang sama: kontrak konsumen kini **dibekukan di
sisi `awcms`** dengan daftar yang diturunkan dari mem-grep repo ini — tiga path
yang dipanggil build dipisah dari dua yang baru dijanjikan ADR
(`/auth/session`, `/access/machine-credentials`), dan `GET /blog/posts/{id}`
yang dihapus ADR-0018 tidak ikut dibekukan. Perubahan non-aditif pada bentuk
respons kini merah di CI `awcms` lebih dulu; regenerasi fixture di sana berarti
berkas ini dan adapternya wajib diperbarui dalam napas yang sama.

Daftar di bawah karena itu **digerbangi**, bukan ditulis tangan:
`tests/kontrak-awcms.test.mjs` mengekstrak jalur `/api/v1/…` dari kode sumber
`src/` dan menolak bila daftar ini menyimpang darinya, dua arah. Ia yang membuat
permukaan keempat tidak bisa mendarat tanpa berkas ini ikut berubah.

<!-- permukaan:dipanggil:mulai -->
| Permukaan yang benar-benar dipanggil build | Dipanggil dari |
| --- | --- |
| `/api/v1/blog/posts` | `src/lib/content.ts` — traversal build feed, `view=full` + `order=created_at` + cursor |
| `/api/v1/media/objects` | `src/lib/awcms/media.ts` — resolusi media, maks 100 id per permintaan |
| `/api/v1/media/public-origin` | `src/lib/awcms/media.ts` — asal media untuk `img-src` |
<!-- permukaan:dipanggil:selesai -->

```
TIDAK DIPANGGIL (2)
GET /api/v1/blog/posts/{id}    hidrasi satu post — DIHAPUS oleh ADR-0018.
                               Ia dulu N+1: satu permintaan per post, per build,
                               ke endpoint admin, pada setiap publish. Build feed
                               menggantikannya. Jangan menghidupkannya kembali
                               "untuk satu field yang kurang" — field itu ada di
                               `view=full`.
GET /api/v1/auth/session       introspeksi sesi — milik BFF portal, yang belum ada.
                               `awcms` menolak kredensial mesin di sini dengan 401
                               yang sama seperti token tak dikenal (anti-oracle,
                               ADR-0049), jadi ia BUKAN cara memeriksa token build.
```

## Penolakan `awcms` yang WAJIB ditiru di tiruan tes

Tes yang tiruannya lebih longgar daripada `awcms` asli akan hijau untuk kode
yang gagal di produksi. `tests/kontrak-awcms.test.mjs` meniru ketiganya:

- `view=full` tanpa `order=created_at` → **400**, bukan diabaikan.
- Tanpa `view=full` → daftar memberi **ringkasan**, bukan baris penuh.
- `ids` lebih dari 100 → **400**, bukan dipotong diam-diam.
- Id media yang tak resolve dilaporkan di `unresolved`, **tidak dibuang**.

## Gambar dan kartu share

Diresolusi **sekali per build** di `src/lib/content.ts`, hasilnya di
`LocalizedArticle.gambar` dan `LocalizedArticle.kartuShare` (ADR-0025/0026).

- Urutan kartu share `seoImageMediaId ?? featuredMediaId` — **milik `awcms`**,
  jangan disusun ulang di sini.
- Media `awcms` menang atas seni lokal `src/assets/` — spesifik mengalahkan
  generik (ADR-0024/0025).
- **Satu id hilang** → placeholder, build lanjut. **Nol dari N** → build gagal;
  itu token tanpa `media.read`, `awcms` lebih tua, atau media tak dikonfigurasi.
- Kartu membawa MIME dan ukurannya **sendiri**. Konstanta 1200×630 hanya berlaku
  untuk `SITE_SOCIAL_IMAGE`, dan hanya karena `.env.example` mengontrakkannya.

## `img-src` ditanyakan, tidak disalin

`scripts/asal-media.mjs` menanyakan asal media saat build dan menulis
`dist/server/asal-media.json`; `server/penyaji.mjs` membacanya dan melebarkan
`img-src`. **Jangan** menyalin `NEWS_MEDIA_R2_PUBLIC_BASE_URL` ke sini — dua
salinan satu nilai yang sepakat sampai salah satunya disunting, dengan kegagalan
yang tak menyebut sebabnya: gambar diblokir diam-diam oleh kebijakan yang tampak
baik-baik saja.

`Dockerfile` **wajib** menyalin berkas itu. Tanpa itu penyaji jatuh ke
`img-src 'self'` dan setiap gambar artikel diblokir, pada image yang build-nya
hijau.

## Sebelum menambah permukaan keempat

Uji [ADR-0023](../../../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md):
**apakah perubahan ini ditulis ulang bila `awcms` berubah?** Bila ya, ia butuh
instans `awcms` untuk dibuktikan — dan **"endpoint-nya sudah ada" bukan jawaban
"tidak"**. Repo template ini tidak punya instans; CI-nya mengondisikan build
atas `vars.AWCMS_API_URL` justru karena itu.

Uji itu **tidak** ikut dicabut saat penahanan ADR-0021 selesai
([ADR-0027](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)). Premisnya
yang berubah, batasnya tidak.

## Keputusan `awcms` yang mengubah apa yang benar di sini

Periksa ini saat `awcms` merilis ADR baru — bukan setiap kali, tetapi setiap kali
sebuah ADR menyentuh konten publik, media, atau kredensial.

| `awcms` | Akibatnya di sini |
| --- | --- |
| ADR-0049/0050 — kredensial mesin + serah-terima sesi BFF | **Sudah diserap.** Tenant dari token, tanpa header tenant |
| ADR-0056 §B — objek media boleh di-purge, rujukannya jadi inert | **Sudah diserap.** Satu id hilang → placeholder; NOL dari N → build gagal |
| ADR-0059 — rute konten publik host-resolved `/news/**` | **Bukan pekerjaan kode.** `awcms` kini bisa menyajikan konten publiknya sendiri di domain tenant. Yang dipilih di sini tetap **nol panggilan ke CMS saat pembaca meminta halaman**, bukan bentuk URL-nya |
| ADR-0061 — permukaan host-resolved boleh di-cache di tepi | Tidak berlaku: situs ini tidak lewat Varnish, dan tidak punya cabang 404 yang membedakan tenant |
| ADR-0062 — skill digerbangi terhadap kodenya | **Sebagian.** `bun run audit:dokumen` memeriksa jalur berkas yang disebut berkas ini. Yang belum: kutipan `ADR-NNNN` belum diperiksa resolve ke berkasnya |
| ADR-0065 — kontrak konsumen `awcms-astro` dibekukan | **Batas dijaga dua arah.** Tabel bertanda di atas digerbangi di sini (ADR-0030); bentuk respons kelima path-nya dibekukan di sana (subset aditif, closure `$ref`). Saat fixture di sana di-regenerate, adapter di sini ikut berubah — serentak |

## Batas waktu: ada, dan TIDAK sama dengan retry

`awcmsGet` memasang `AbortSignal.timeout` — bawaan 30 detik, diubah lewat
`AWCMS_API_TIMEOUT_MS`. Ia tidak bertabrakan dengan aturan "tanpa retry" di atas,
dan bedanya perlu dipegang: **tanpa-retry memutuskan apa yang terjadi saat
`awcms` menjawab buruk; batas waktu memutuskan apa yang terjadi saat ia tidak
pernah menjawab sama sekali.** Keduanya berakhir sama — build gagal, nol berkas
terbit.

Yang dijaganya bukan kelambatan melainkan **kesenyapan**: koneksi yang diterima
lalu tidak pernah dijawab, bentuk kegagalan paling umum dari basis data yang
kehabisan koneksi. `fetch` tidak punya batas waktu bawaan, jadi sebelum ini build
menggantung sampai batas job CI membunuhnya — dengan pesan yang menyebut nama
job, bukan `awcms`.

Dua hal yang jangan diubah tanpa membaca alasannya:

- **Batasnya longgar (30 detik), dan itu disengaja.** `view=full` membawa
  `contentJson` utuh; tenant besar di basis data dingin bisa sah-sah saja lambat.
  Menyetelnya ke nilai "jalur permintaan sehat" mengubah build lambat menjadi
  build gagal — kebalikan dari gunanya.
- **Nilai yang cacat DITOLAK, termasuk `0`.** `0` terlihat seperti "tanpa batas"
  dan justru mengembalikan gantungan yang gerbang ini ada untuk mencegah.

## Rujukan

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/adr/0027-penahanan-adr-0021-selesai.md`](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Sumber data
