---
bump: minor
tipe: struktur
dampak: internal
---

# Dua belas keputusan `awcms` hanyut tanpa terserap, dan sekarang ada yang memeriksanya

`audit:dokumen` bertanya apakah kutipan `ADR-NNNN` **resolve** — apakah
keputusan yang disebut memang ada. Pertanyaan yang mahal adalah kebalikannya:
**adakah keputusan di `awcms` yang tidak dikutip apa pun di sini?**

Tidak ada gerbang yang bisa menanyakannya, dan jawabannya hanyut selama dua
belas keputusan. `awcms` menerima ADR-0100 sampai ADR-0116 dalam sembilan hari;
repo ini mengutip lima.

Dua yang terlewat menyebut repo ini secara langsung:

- **ADR-0100 §5** menyebut sebuah pull request DI REPO INI sebagai syarat
  `awcms` menghapus compatibility writer yang masih ia pikul.
- **ADR-0114** memutar-ulang 67 aturan redirect terhadap server hasil build repo
  ini: 404 pada setiap satunya, nol header `Location`.

Kelas cacatnya persis yang hendak diakhiri ADR-0030 — aturan yang hanya tertulis
adalah aturan yang hanyut. Tabel serapan dirawat dengan tangan, sementara tabel
permukaan beberapa baris di atasnya sudah digerbangi sejak hari ia lahir.

## Buku besar dengan tiga vonis

Setiap ADR `awcms` dari lantainya ke atas kini punya barisnya sendiri — lantai
itu `awcms` ADR-0049, dan ada 68 vonis sampai `awcms` ADR-0116, nol bervonis
`belum`. Vonis tengahnya yang paling penting
— `diperiksa` berarti dibaca, tidak menyentuh jalur build statis, dan alasannya
ditulis. **Kesenyapan harus bisa dibedakan dari kelalaian.**

Lantainya di situ karena di situlah hubungannya bermula. Di bawahnya, ADR
`awcms` 0000–0048 adalah fondasi platform yang mendahului konsumen ini dan repo ini belum
memeriksanya secara sistematis — itu dinyatakan, bukan disiratkan oleh
ketiadaannya.

## `bun run audit:serapan`

Tiga pemeriksaan, dan yang ketiga adalah satu-satunya gerbang di repo ini yang
melihat ke luar:

1. **Cakupan** — tidak boleh ada nomor bolong antara lantai dan puncak.
2. **Buku besar hanya boleh MENYUSUT** — plafon `belum` boleh turun, tidak boleh
   naik, dan plafon yang tertinggal di angka lama juga memerah karena ia berhenti
   menjaga apa pun.
3. **Kesegaran** — daftar `docs/adr/` milik `ahliweb/awcms` diambil lewat API
   GitHub, dan nomor yang ada di sana tanpa vonis di sini memerahkan gerbang.
   Inilah satu-satunya pemeriksaan yang bisa menangkap "`awcms` menerbitkan
   ADR-0117 dan tidak ada yang melihatnya".

Pemeriksaan ketiga **DILEWATI dan mengatakannya** bila jaringan tidak ada.
Gerbang yang memerah karena GitHub mati akan dimatikan orang dalam sepekan;
gerbang yang menghijau diam-diam karena jaringan mati lebih buruk, karena ia
berbohong ke arah yang nyaman.

Empat belas tes, dibuktikan dua arah, termasuk terhadap server HTTP lokal
sungguhan — bukan terhadap fungsi yang di-mock, karena yang bisa rusak adalah
bentuk respons dan penyaringan cermin `.id.md`, dan tidak satu pun dari keduanya
terlihat oleh mock.

## Dua divergensi yang akhirnya punya namanya

- **[ADR-0046](../docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md)** —
  `awcms` ADR-0110 memberi operatornya sebuah origin `frame-src`; repo ini
  menolak embed video pada setiap deployment tanpa saklar, karena operator situs
  turunan adalah organisasi pemilik domainnya dan flag itu akan tiba sudah
  terpasang di repo yang mereka salin. Perbedaannya sebelumnya tidak tercatat di
  mana pun, dan perbedaan yang tidak dicatat terbaca sebagai satu sisi yang belum
  sempat mengerjakannya.
- **ADR-0037** kini menyebut `awcms` ADR-0112, yang menyandarkan divergensi
  `astro-files-not-type-checked` pada pin TypeScript 6 repo ini — kutipannya
  selama ini hanya berjalan satu arah, dan sebuah pin yang tidak tahu ia
  disandari adalah pin yang dinaikkan orang yang sedang merapikan daftar
  dependency.
