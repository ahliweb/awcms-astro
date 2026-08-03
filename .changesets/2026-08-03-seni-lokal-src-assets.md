---
tipe: struktur
dampak: publik
---

# Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua

[ADR-0024](../docs/adr/0024-seni-lokal-di-src-assets.md). Butir pertama
§Titik lanjut ADR-0021 punya dua sumber seni; yang **tidak** menyentuh `awcms`
kini bekerja.

## Yang berubah untuk pembaca situs

Sampai sekarang `getArticleImage` mengembalikan `src: undefined` tanpa syarat,
dan ketiga pemanggilnya bahkan tidak membacanya — mereka merender
`.visual-placeholder` apa pun isinya. Sebuah situs yang menaruh ilustrasi di
`src/assets/` tidak akan melihatnya terbit.

Sekarang: berkas di `src/assets/`, konvensi nama relatif tanpa ekstensi —
`hero`, `tab/<tab>`, `artikel/<tab>/<slug>`. Tidak ada registry yang harus ikut
disunting; ekstensi apa pun dari `EKSTENSI_SENI` berlaku, jadi mengganti `.svg`
menjadi `.webp` tidak menyentuh satu baris kode pun.

Berkas yang tidak ada tetap merender placeholder bergaya. Itu keadaan yang
**didukung**, bukan kegagalan — dan template ini tetap membawa nol ilustrasi.

## Tiga keputusan yang perlu disebut

- **`query: "?url"`, bukan `astro:assets`.** Yang terakhir mengembalikan
  `ImageMetadata` alih-alih string — bentuk `ArticleVisual` dan keempat bingkai
  ikut berubah — dan memperlakukan SVG berbeda dari raster, padahal SVG justru
  format yang gerbang repo ini ditulis untuk membaca. Pemotongan tidak hilang
  tanpanya: bingkai memotong di CSS dan `audit:konten` menolak sumber yang bukan
  16∶9 lebih dulu.
- **Tanpa fallback dari artikel ke seni seksinya.** Fallback membuat seluruh
  artikel satu seksi memakai gambar yang sama sambil tampak seperti gambar yang
  dipilih untuknya.
- **Dua berkas bernama sama dengan ekstensi berbeda menggagalkan build.**
  Memilih salah satunya diam-diam berarti menerbitkan seni yang bukan suntingan
  terakhir penulisnya, dan itu tidak terlihat selain dengan membuka setiap
  halaman.

## Yang ikut hidup karenanya

- **Gerbang rasio berhenti kosong.** Ia melaporkan "src/assets/ belum ada —
  dilewati" di setiap run sejak ditulis. Diverifikasi dua arah saat mendarat:
  sumber 16∶9 lolos, sumber 1∶1 memerahkan `audit:konten` sambil menyebut
  pemotongannya.
- **Empat bingkai CSS berhenti menjadi aturan yang tak pernah dipakai.**
  `.feature-hero-img img`, `.card-img-wrapper img`, `.hero-visual-frame img`,
  `.article-hero-frame img` semuanya sudah benar dan tak satu pun pernah diuji
  terhadap `<img>` sungguhan.
- **`alt` seksi kini datang dari katalog PO**, bukan dari slug yang
  dimanusiawikan. Sebelumnya pembaca dengan screen reader mendengar nama seksi
  versi URL — di locale berprefiks, bahkan bukan bahasa yang sedang dibacanya.

## Media `awcms` TETAP ditahan

Sumber kedua — `featuredMediaId` lewat `GET /api/v1/media/objects` — tidak ikut.
Endpointnya ada, tetapi kode yang memanggilnya bentuknya ditentukan respons
`awcms` dan repo template ini tidak punya instans untuk membuktikan panggilannya
benar. Itu persis batas yang
[ADR-0023](../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
nyatakan: "endpoint-nya sudah ada" bukan jawaban "tidak".
