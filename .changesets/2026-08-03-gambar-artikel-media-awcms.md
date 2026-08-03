---
tipe: struktur
dampak: publik
---

# Gambar artikel dari media `awcms` — dan `img-src` yang ditanyakan, bukan disalin

[ADR-0025](../docs/adr/0025-gambar-artikel-dari-media-awcms.md). Butir pertama
§Titik lanjut ADR-0021 — yang paling lama menunggu — selesai.

## Kenapa sekarang, dan dasarnya bukan dari sini

[ADR-0023](../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
menahan pekerjaan yang membutuhkan `awcms` dengan satu batas: *"endpoint-nya
sudah ada" bukan jawaban "tidak"*, karena repo template ini tidak punya instans
untuk membuktikan panggilannya benar.

Dua hal dari `awcms` mengubah dasarnya:

- **Analisis kesiapan** (`awcms` #371), diperiksa ke KODE bukan ke daftar:
  **setiap kontrak konten dan sesi yang benar-benar dipanggil `awcms-astro`
  sudah lengkap** — lima permukaan, semuanya mendarat.
- **Satu celah nyata ditutup di gelombang yang sama** (`awcms` #370):
  `GET /api/v1/media/public-origin`, dibuka **persis untuk repo ini**.

## Yang berubah untuk pembaca situs

Artikel yang punya featured image di `awcms` kini menampilkannya. Sebelumnya
setiap artikel merender blok bertoken, apa pun isi CMS-nya.

Media `awcms` **menang atas seni lokal**, dan itu bukan "remote mengalahkan
lokal" melainkan **spesifik mengalahkan generik**: `featuredMediaId` dipilih
editor untuk artikel itu, `artikel/<tab>/<slug>` kebetulan cocok jalurnya.
Situs yang mau sebaliknya berhenti mengisi featured image — keputusan yang
dibuat di tempat artikelnya tinggal.

## Tiga keputusan yang menentukan bentuknya

- **Sekali per build, hasilnya di `LocalizedArticle`.** Bukan di
  `article-images.ts`: modul itu sinkron dan komponen tidak boleh mengambil
  datanya sendiri. Menaruhnya di sana berarti komponen async atau satu
  permintaan HTTP per kartu — ratusan permintaan untuk data yang satu batch
  sudah pegang. Batch dipecah per 100 id, batas yang `awcms` terapkan dengan
  400, bukan dengan pemotongan diam-diam.
- **Satu id hilang ≠ semua id hilang.** Satu id yang tidak resolve menjadi
  placeholder: `awcms` mengizinkan objek di-purge dan memutuskan rujukan
  menggantung menjadi inert (ADR-0056 §B), jadi menggagalkan build di sini
  berarti situs tidak bisa terbit karena satu gambar dihapus. **Nol dari N
  menggagalkan build** — itu bukan aksi operator melainkan token tanpa
  `media.read`, `awcms` yang lebih tua, atau media yang tak dikonfigurasi;
  ketiganya menerbitkan situs yang setiap artikelnya kehilangan gambar
  sekaligus, bentuk cacat ADR-0018 yang persis sama.
- **`img-src` ditanyakan, tidak disalin.** Build menanyakan asal media ke
  `awcms` lalu menuliskannya untuk penyaji. Menyalin
  `NEWS_MEDIA_R2_PUBLIC_BASE_URL` dengan tangan adalah dua salinan satu nilai
  yang sepakat sampai salah satunya disunting — dengan kegagalan yang tidak
  menyebut sebabnya di mana pun: gambar diblokir diam-diam oleh kebijakan yang
  tampak baik-baik saja.

## Kebijakan tetap dirangkai di satu tempat

`server/penyaji.mjs` masih satu-satunya tempat CSP disusun; berkas yang ditulis
build adalah **data, bukan kebijakan kedua** — aturan ADR-0019 tidak berubah.

Nilainya berakhir di dalam sebuah header, jadi ia diperlakukan sebagai masukan
yang tidak dipercaya: JSON rusak, `configured: false`, skema selain
`http`/`https`, dan nilai bukan-string semuanya dibaca sebagai tidak ada, dan
origin dipangkas lewat `new URL(...).origin` sehingga path maupun spasi tidak
bisa menyelundupkan direktif kedua. Satu nilai cacat membuat browser menolak
**seluruh** kebijakan, bersama tiap direktif lain di dalamnya.

## Satu baris `Dockerfile` yang wajib ikut

Image sebelumnya menyalin `dist/server/penyaji.mjs` saja. Berkas asal media yang
tertinggal di stage build berarti penyaji jatuh ke `img-src 'self'` dan setiap
gambar artikel diblokir browser — pada image yang build-nya hijau, dengan
halaman yang terbit utuh selain gambarnya. Baris `COPY`-nya membawa komentar
yang menyebut akibat itu, karena tidak ada gerbang yang bisa melihatnya.
