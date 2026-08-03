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
yang dipakai". Verifikasi ulangnya satu perintah:
`grep -rn "awcmsGet<" src/`.

```
DIPANGGIL HARI INI (3)
GET /api/v1/blog/posts?view=full&order=created_at&status=published   traversal build feed → src/lib/content.ts
GET /api/v1/media/objects?ids=…                                      resolusi media, maks 100 id → src/lib/awcms/media.ts
GET /api/v1/media/public-origin                                      asal media untuk img-src → src/lib/awcms/media.ts

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

## Celah yang diketahui pada lapisan ini

`awcmsGet` **tidak punya batas waktu**. Ketiadaan retry di sana disengaja dan
benar (build yang lambat lalu menerbitkan situs setengah isi lebih buruk daripada
build yang gagal) — tetapi `awcms` yang menggantung menggantungkan build sampai
batas waktu job CI, atau selamanya di mesin lokal, dengan pesan yang tidak
menyebut sebabnya. Ia celah 4 di
[`standar-performa-dan-keamanan.md`](../../../docs/awcms-astro/standar-performa-dan-keamanan.md),
beserta pemeriksa yang harus ikut mendarat: tiruan yang tidak pernah menjawab.

## Rujukan

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/adr/0027-penahanan-adr-0021-selesai.md`](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Sumber data
