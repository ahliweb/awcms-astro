---
name: awcms-astro-integrasi
description: Kontrak integrasi awcms-astro ↔ awcms — tenant dari token mesin, traversal build feed (view=full + cursor), resolusi media + asal media untuk img-src, dan penolakan yang WAJIB ditiru. Gunakan saat menyentuh src/lib/content.ts, src/lib/awcms/**, scripts/asal-media.mjs, atau saat sebuah build menerbitkan situs yang tampak benar tetapi isinya kurang.
---

# awcms-astro — kontrak integrasi dengan `awcms`

Repo ini **mengonsumsi** `awcms`; ia tidak menyajikan API. Seluruh kontraknya
lewat lima permukaan, dan `src/lib/content.ts` adalah satu-satunya tempat
komponen menyentuhnya.

## Aturan yang tidak boleh dilanggar

| Aturan | Yang terjadi bila dilanggar |
| --- | --- |
| Komponen **tidak pernah** mengambil datanya sendiri | Satu permintaan HTTP per kartu yang dirender, atau komponen async |
| Traversal memakai `view=full` **dan** `order=created_at` | Daftar mengembalikan RINGKASAN; `contentJson` `undefined`, badan artikel kosong, seksi kosong, **build tetap hijau** |
| Seluruh halaman disusuri lewat `nextCursor` | Situs terbit dengan artikel hilang — dan yang hilang justru yang terbaru |
| Tenant datang dari **token**, tidak pernah dari header | `awcms` menurunkan tenant dari kredensial mesin dan mengabaikan header yang berbeda |
| Diam-diam memotong data = **kegagalan**, bukan optimasi | Lihat seluruh baris di atas |

## Lima permukaan yang dipakai

```
GET /api/v1/blog/posts?view=full&order=created_at&status=published   traversal build feed
GET /api/v1/blog/posts/{id}                                          hidrasi satu post
GET /api/v1/media/objects?ids=…                                      resolusi media (maks 100 id)
GET /api/v1/media/public-origin                                      asal media untuk img-src
GET /api/v1/auth/session                                             introspeksi sesi (BFF, belum dipakai)
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

## Sebelum menambah permukaan keenam

Uji [ADR-0023](../../../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md):
**apakah perubahan ini ditulis ulang bila `awcms` berubah?** Bila ya, ia butuh
instans `awcms` untuk dibuktikan — dan **"endpoint-nya sudah ada" bukan jawaban
"tidak"**. Repo template ini tidak punya instans; CI-nya mengondisikan build
atas `vars.AWCMS_API_URL` justru karena itu.

## Rujukan

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Konten & awcms
