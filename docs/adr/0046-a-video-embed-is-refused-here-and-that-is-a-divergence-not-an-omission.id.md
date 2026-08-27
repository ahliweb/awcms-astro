🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md)

<!-- i18n-source-hash: sha256:9f21aefa21d697a978e65fe3d9f9c316576e77895f152d6c1c63347f833d5ce7 -->

# ADR-0046 — Embed video ditolak di sini, dan itu divergensi, bukan kelalaian

- **Status:** Diterima
- **Tanggal:** 27 Agustus 2026
- **Terkait:** `awcms` ADR-0110 (origin embed video adalah keputusan OPERATOR), `awcms` ADR-0069 / ADR-0070 (dua divergensi yang sudah dicatat atas permintaan tertulis repo ini), `AGENTS.md` §Keamanan, [ADR-0019](0019-csp-ketat-dikirim-penyaji.id.md), Isu #76

## Konteks

`src/lib/content-blocks.ts` merender blok `video_news` sebagai **tautan**, tidak
pernah sebagai pemutar tersemat. Itu sudah benar sejak tipe blok ini
diimplementasikan, dan alasannya tertulis di dalam berkasnya:

> Pemutar tersemat adalah permukaan pihak ketiga yang MELIHAT pembaca sebelum
> pembaca memilih menonton apa pun, dan itu persis yang hendak dicegah aturan
> tanpa-pihak-ketiga repo ini.

Pada 23 Agustus 2026 `awcms` menerima ADR-0110-nya: operator yang menyetel
`BLOG_VIDEO_EMBED_ENABLED=true` menambahkan tepat satu origin —
`https://www.youtube-nocookie.com` — ke `frame-src`, dan tidak ada yang lain. Itu
keputusan yang cermat, dan ADR ini tidak membantahnya. Origin-nya tidak
diturunkan dari data tenant (satu tenant yang menyalakan video akan membukanya
bagi setiap tenant di deployment itu), ia melebarkan `frame-src` saja dan tidak
pernah `script-src`, dan `frame-ancestors 'none'` tidak disentuh.

**Jadi kedua repo kini melakukan hal berbeda atas tipe blok yang sama, dan tidak
ada apa pun di mana pun yang mengatakannya.** Tidak di indeks ADR repo ini, tidak
di milik `awcms`, dan tidak di `awcms-family-compatibility.yaml` — berkas yang
justru dipelihara keluarga ini supaya perbedaan yang disengaja tidak bisa
disalahbaca sebagai hanyutan.

Kesenyapan itulah masalahnya. Perbedaan yang tidak dicatat siapa pun terbaca,
oleh orang berikutnya, sebagai satu sisi yang belum sempat mengerjakannya — dan
"perbaikan" yang jelas adalah menyalin saudaranya. Di sini itu berarti
mengapalkan iframe ke dalam template yang CSP-nya ditulis atas premis bahwa ia
tidak melakukannya.

## Keputusan

**Repo ini MENOLAK embed video, pada setiap deployment, tanpa saklar. Penolakan
itu dicatat sebagai divergensi keluarga yang disengaja.**

Tiga bagian:

1. **`video_news` dirender sebagai tautan.** Perilaku tidak berubah, kini dengan
   keputusan di belakangnya alih-alih sebuah komentar.
2. **Tidak ada `BLOG_VIDEO_EMBED_ENABLED` di sini, dan menambahkannya DITOLAK.**
   Bukan karena flag itu dirancang buruk — ia dirancang baik — melainkan karena
   kedua repo bukan jenis benda yang sama. `awcms` adalah SATU deployment yang
   operatornya mengonfigurasinya. Repo ini TEMPLATE: operator situs turunan
   adalah organisasi pemilik domainnya, dan flag itu akan tiba sudah terpasang
   di repo yang mereka salin alih-alih sebagai pilihan yang mereka buat.
   Asimetri yang sama sudah menghasilkan divergensi `hsts-include-subdomains`.
3. **`ahliweb/awcms` diminta mencatatnya** di `intentionalDivergences`, seperti
   ADR-0069 dan ADR-0070 dicatat atas permintaan tertulis repo ini. Repo ini
   tidak bisa menulis berkas itu, dan ADR-0034 §Hubungan-nya sudah menetapkan
   bahwa meminta adalah mekanismenya.

## Konsekuensi

- `frame-src` tetap absen dari CSP repo ini, dan `tests/keluaran-csp.test.mjs`
  tetap menegaskan kebijakan yang ditegaskannya hari ini.
- Pembaca yang menginginkan videonya mendapat tautan dan sampai ke YouTube
  **setelah memilih**. Biayanya nyata dan diterima: embed berkonversi lebih baik,
  dan satu klik lebih sedikit adalah manfaat sungguhan bagi sebuah redaksi.
- Editor yang menaruh blok `video_news` mendapat tautan berlabel yang bekerja
  alih-alih bingkai rusak — yang persis akan terjadi bila blok itu merender
  iframe terhadap kebijakan yang memblokirnya.
- Manifest keluarga bertambah satu entri yang menjelaskan repo ini, setelah
  `awcms` mencatatnya. Sampai saat itu divergensinya tercatat DI SINI dan hanya
  di sini, dan itu dinyatakan alih-alih dibiarkan tampak lengkap.

## Ditolak

- **Menyalin `BLOG_VIDEO_EMBED_ENABLED`.** Lihat keputusan 2. Flag yang
  bawaannya mati tetap flag yang akan dinyalakan seseorang tanpa membaca kenapa
  ia ada, dan pembaca yang browser-nya lalu dilihat pihak ketiga bukan orang yang
  menyalakannya.
- **Menyemat hanya untuk `youtube-nocookie.com`.** Nama domainnya janji tentang
  cookie, bukan tentang permintaannya: origin itu tetap melihat alamat IP,
  `User-Agent`, dan `Referer` yang menyebut artikelnya, sebelum pembaca menekan
  putar.
- **Membiarkannya tak terdokumentasi karena perilakunya tidak berubah.** Itu
  justru keadaan yang hendak diakhiri ADR ini. Dua belas keputusan `awcms`
  hanyut tanpa terserap karena "tidak perlu perubahan" dan "tidak ada yang
  melihat" menghasilkan kesenyapan yang sama.
