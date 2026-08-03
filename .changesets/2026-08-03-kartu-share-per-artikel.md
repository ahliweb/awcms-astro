---
tipe: struktur
dampak: publik
---

# Kartu share per artikel — dan tiga klaim yang berhenti berbohong

[ADR-0026](../docs/adr/0026-kartu-share-per-artikel-dari-media-awcms.md).

Butir backlog tertua repo ini selalu punya alasan yang sama: template ini tidak
membawa pembangkit kartu. Alasan itu benar untuk kartu yang **dibangkitkan**, dan
tidak pernah benar untuk kartu yang **diunggah** — `awcms` sudah menyimpan tepat
itu di `seoImageMediaId`, override eksplisit yang spesifikasinya sendiri sebut
mengalahkan `featuredMediaId`.

## Yang berubah untuk pembaca

Tautan artikel yang dibagikan ke WhatsApp, Facebook, atau X kini menampilkan
kartu milik artikel itu, bukan satu kartu situs untuk semuanya. Urutannya
`seoImageMediaId ?? featuredMediaId` — **persis** yang
`seo-facts-port-adapter.ts` di `awcms` selesaikan, karena situs yang kartunya
berbeda dari permukaan SEO CMS-nya sendiri adalah dua jawaban untuk satu
pertanyaan, dan hanya satu yang terlihat editor.

Gambar di badan artikel TIDAK ikut berpindah: yang `awcms` prioritaskan hanya
permukaan pratinjau.

## Cacat yang sebenarnya ditutup

`BaseLayout` memasang `og:image:type` `image/png` dengan `og:image:width` 1200
dan `og:image:height` 630 untuk gambar **apa pun**, dan `schema.ts` menulis
`ImageObject` dengan konstanta yang sama.

Itu benar untuk `SITE_SOCIAL_IMAGE` — `.env.example` menyatakan kontraknya
kepada siapa pun yang mengisinya. Untuk objek media `awcms` ia salah **tiga
kali sekaligus**: berkasnya WebP 1600×900 pada umumnya. Akibatnya bukan kartu
yang jelek melainkan kartu yang **berbohong kepada mesin** — pengunduh pratinjau
yang memercayai angka itu melebarkan ke kotak yang salah atau menolak kartunya,
dan tidak ada satu pun kegagalan di build. Bentuknya identik dengan cacat yang
melahirkan `social-image.ts`: `og:image` menunjuk berkas 404 dengan build tetap
hijau.

MIME dan ukuran kini mengikuti gambarnya; konstanta kartu situs menjadi
**bawaan**, bukan kebenaran universal.

## Tiga keadaan, semuanya tetap didukung

| Punya | Yang terbit |
| --- | --- |
| `seoImageMediaId` / `featuredMediaId` | Kartu artikel, dengan MIME dan ukurannya sendiri |
| Hanya `SITE_SOCIAL_IMAGE` | Kartu situs, `image/png` 1200×630 |
| Tidak keduanya | Tanpa tag gambar sama sekali |

Keadaan ketiga yang paling penting dipertahankan: pratinjau tanpa gambar jatuh
ke kartu teks yang rapi; pratinjau dengan gambar rusak tidak jatuh ke mana pun.

## Nol permintaan tambahan

Kedua id masuk batch media yang sama (ADR-0025) dan dideduplikasi — artikel yang
memakai satu gambar untuk dua permukaan tetap satu id, dan tesnya membuktikan
permintaannya tetap satu.
