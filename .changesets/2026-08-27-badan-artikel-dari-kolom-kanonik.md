---
bump: minor
tipe: konten
dampak: publik
---

# Tebal, miring, dan tautan dalam kalimat akhirnya sampai ke pembaca

`awcms` menjadikan Portable Text badan kanonik pada 19 Agustus 2026 (ADR-0100)
dan mengapalkannya di v10.0.0. Union enam-tipe yang lama bertahan di sana
sebagai `content_json.blocks` — proyeksi TURUNAN yang sengaja dipertahankan
supaya repo ini tidak menjadi kosong pada hari cutover.

Proyeksi itu **lossy secara konstruksi**: kosakata lama tidak punya mark, jadi
setiap tebal, miring, potongan kode, dan tautan di dalam kalimat merata menjadi
teks polos saat menyeberang. Dan proyeksi itulah yang dirender situs ini sampai
sekarang.

Artinya sederhana dan tidak enak dibaca: **setiap artikel yang pernah
diterbitkan situs ini adalah prosa tanpa format, dan tidak ada editor yang bisa
mengubahnya.** Sebuah berita yang tidak bisa menautkan peraturan yang
dibahasnya, atau menegaskan satu angka yang penting, terbit lebih buruk daripada
bahan yang menjadi sumbernya.

## Yang berubah

`src/lib/portable-text.ts` membaca `bodyPortableText` dan merendernya. Aturan
yang tidak melonggar sedikit pun: **tidak ada tipe node HTML mentah**, dan setiap
string sampai ke keluaran lewat `escapeHtml` dan tag tetap.

Dua hal dibawa apa adanya alih-alih diturunkan ulang:

- **`href` diperiksa dengan mem-PARSE, bukan mencocokkan pola.** Regex atas
  string mentah adalah cara `java\nscript:` dan `JaVaScRiPt:` lolos; `URL`
  menormalkan keduanya. Lima bentuk berbahaya diuji, dan kata-katanya tetap
  terbit — yang hilang tautannya, bukan kalimatnya.
- **`underline` BUKAN dekorator.** Span bergaris bawah yang bukan tautan adalah
  cacat kegunaan, dan menyediakannya menjamin ia dipakai untuk penegasan.

## Daftar: wadah yang tidak dibawa formatnya

Portable Text memodelkan daftar sebagai rentetan blok DATAR yang masing-masing
membawa `listItem` dan `level` — tidak ada node wadah. Merakit ulang `<ul>`
adalah tugas konsumen, dan salah merakitnya menghasilkan satu `<ul>` per butir:
HTML yang sah, tampak nyaris benar, dan dibacakan pembaca layar sebagai "daftar
berisi satu butir" sekali per baris.

Bersarangnya diuji atas byte-nya, bukan atas kemiripannya. Versi pertama
implementasi ini menempelkan rentetan bersarang sebagai SAUDARA alih-alih ke
DALAM butir di atasnya — render-nya nyaris identik dan tak terlihat oleh
teknologi bantu. Tesnya menangkapnya.

## Galeri dan video

Keduanya didelegasikan ke `content-blocks.ts` sehingga dua format badan tidak
bisa menyimpang menjadi dua jawaban berbeda. `videoNews` tetap **tautan, bukan
sematan** ([ADR-0046](../docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md)).

Id galeri kini juga dikumpulkan dari badan kanonik. Mengumpulkannya hanya dari
proyeksi akan menyelesaikan setiap galeri milik baris yang belum di-backfill dan
tidak satu pun milik baris yang sudah — situs yang galerinya bekerja sampai hari
kontennya dimigrasikan.

## Jatuhan yang punya syarat penghapusan

`bodyPortableText` tiba ABSEN dari awcms yang mendahului ADR-0100, dan KOSONG
dari baris yang belum disentuh `blog:portable-text:backfill`. Keduanya mengambil
cabang proyeksi.

Syarat menghapus jatuhan itu ditulis, bukan diserahkan pada penilaian: setiap
baris tenant sudah di-backfill DAN deployment-nya awcms v10.0.0 atau lebih baru.

**Syarat ADR-0100 §5 kini TERPENUHI** — `awcms` boleh menghapus compatibility
WRITER-nya. Kedua penghapusan itu bukan peristiwa yang sama dan tidak boleh
dilakukan bersamaan.
