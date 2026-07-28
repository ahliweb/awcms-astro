---
tipe: struktur
dampak: publik
---

# Rasio gambar tunggal, aturan isi ilustrasi, dan skrip rilis yang bisa dijalankan

Menyerap empat perubahan repo rujukan `web-lalulintasmelayani.com` yang terjadi
setelah template ini diekstraksi (`v1.8.0` dan `v1.8.1`), lalu menutup dua hal
yang membuat sebagiannya tidak bisa dipakai di sini.

## Satu rasio untuk bingkai maupun sumber

Seluruh bingkai gambar memakai `object-fit: cover`, jadi sumber berasio lain
tidak diperkecil — ia **dipotong**, diam-diam, di setiap ukuran layar. Sumber
1∶1 pada bingkai 16∶9 kehilangan 22% teratas dan 22% terbawah, dan judul gambar
hampir selalu ada di sana. Di repo rujukan itu berlaku pada sebelas banner
sekaligus dan tidak ada satu pun build yang gagal karenanya.

Rasionya kini satu token, `--ratio-visual`, dan `.hero-visual-frame`,
`.feature-hero-img`, `.card-img-wrapper`, serta bingkai kepala artikel memakainya
alih-alih tinggi tetap masing-masing.

## Blok pengganti ilustrasi akhirnya punya gaya

`getArticleImage()` mengembalikan `src: undefined` selama template ini belum
dipasangi seni, dan dokumentasinya menyebut itu keadaan yang didukung: setiap
pemanggil merender blok bertoken. Blok itu tidak pernah ada. `.visual-placeholder`
dirender di empat tempat tanpa satu pun aturan gaya, sehingga tingginya nol dan
bingkai yang seharusnya menahan tata letak ikut hilang.

Bingkai kepala artikel juga berpindah dari `style=""` inline ke
`.article-hero-frame` — satu atribut gaya inline lebih sedikit menjelang CSP
ketat.

## Aturan isi ilustrasi

Tanpa lambang atau atribut instansi negara, tanpa dokumen dan antarmuka aplikasi
pemerintah yang direkayasa, dan teks di dalam gambar hanya label topik. Angka di
dalam gambar tidak bisa membawa sumber dan dasar hukumnya, sehingga ia lolos dari
aturan yang menjaga seluruh angka lain — dan ia tidak ikut diperbarui saat
tarifnya berubah. Dua aturan terakhir **tidak bisa** diperiksa mesin, dan itu
dinyatakan terus terang alih-alih dibiarkan tampak terjaga.

Ambang keterbacaan ikut ditetapkan: teks terkecil di dalam SVG minimal 22px pada
kanvas 800px, karena pada kartu 328px kanvas itu tampil pada skala 0,41.

## Skrip rilis

Tautan relatif di changeset ditulis dari sudut pandang `.changesets/`, sementara
`CHANGELOG.md` tinggal di akar repo. Menyalinnya apa adanya membuat setiap tautan
meleset satu tingkat, dan cacatnya baru terlihat di CI — gerbang audit berjalan
**sebelum** changeset dilipat, jadi berkas yang rusak belum ada saat audit
melihatnya. Skrip rilis kini menulis ulang jalurnya saat melipat.

Dua hal yang membuat `npm run release -- <level> --apply` mustahil dijalankan di
repo ini juga ditutup: ia memanggil `npm run audit` yang belum ada di template
(kini hanya dipanggil bila skripnya terdefinisi), dan membaca `CHANGELOG.md`
yang belum ada (kini berkasnya ada, dan sisipan pertama tidak lagi bergantung
pada adanya heading versi sebelumnya).

## Dokumentasi

`docs/awcms-astro/standar-teknis.md`, `checklist-repo-baru.md`, dan
`ui-ux-design-system.md` disamakan kembali dengan repo rujukan — ketiganya
dokumen standar keluarga dan tidak boleh menyimpang. `.changesets/README.md`
menyusul bentuk penuhnya.
