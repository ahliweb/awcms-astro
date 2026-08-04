---
tingkat: minor
tanggal: 2026-08-04
---

# Graf pengetahuan yang salah menamai 60 dari 101 komunitasnya, dan gerbang yang akhirnya membacanya

`graphify-out/` dilacak repo ini. Ia bukan artefak build melainkan **peta** —
yang dibaca orang dan agen yang baru masuk. Sampai hari ini tidak ada satu pun
gerbang yang pernah membukanya.

Yang ditemukan saat pertama kali dibaca: **60 dari 101 label komunitas menempel
pada komunitas yang salah.**

- Komunitas 6 bernama `content-blocks.ts`; isinya seluruhnya dari
  [`standar-performa-dan-keamanan.md`](../docs/awcms-astro/standar-performa-dan-keamanan.md).
- Komunitas 22 bernama `Kontrak BFF /_portal-api/**`; pusatnya `Pedoman Perilaku`.
- Tiga komunitas berbeda sama-sama bernama `BaseLayout.astro`.
- 22 dari 87 label yang tampil di laporan adalah nama berkas mentah.

Cacatnya tidak terlihat karena tidak ada yang bisa melihatnya: artefaknya JSON
yang sah, laporannya rapi, dan kelima gerbang lain hijau — karena tidak satu pun
dari mereka membaca `graphify-out/`. Nama komunitas bukan hiasan; itu yang
dibaca `graphify query` dan siapa pun yang memakai graf ini untuk mencari jalan.
Graf yang salah menamai dirinya sendiri lebih berbahaya daripada tidak ada graf,
karena ia menjawab dengan percaya diri.

## Kenapa label bisa berpindah tanpa ada yang tahu

graphify menamai komunitas otomatis dari **node paling terhubung** di dalamnya.
Penamaan itu deterministik, gratis, dan tidak pernah membaca komunitasnya — ia
menyalin nama berkas terbesar.

Pustakanya punya penjaga untuk ini: sebuah sidecar berisi tanda tangan
keanggotaan tiap komunitas, supaya run berikutnya bisa tahu komunitas mana yang
benar-benar berubah. **Langkah pelabelan tidak pernah menulisnya.** Tanpa
sidecar itu graphify jatuh ke membandingkan *jumlah* komunitas — dan ketika
korpus tumbuh dari 90 ke 101 komunitas, seluruh label dipindahkan ke komunitas
yang berbeda sekaligus.

Penyebabnya ditutup di hulu, di skill graphify itu sendiri: langkah pelabelan
kini menulis sidecar tanda tangan, menolak label yang kembar atau tidak lengkap
sebelum apa pun ditulis, dan menulis ulang `graph.json` dengan label final —
sebelumnya `graph.json` dan `GRAPH_REPORT.md` bisa menyebut nama yang berbeda
untuk komunitas yang sama, dan `graph.json` adalah yang dibaca konsumen.

## `.changesets/` keluar dari korpus

18% graf adalah prosa rilis: **171 dari 971 node**, dengan 139 edge yang menunjuk
sesama changeset dan hanya 39 yang menyeberang. Banyak node, hampir tanpa
jembatan — gumpalan terpisah yang menaikkan jumlah komunitas, menurunkan
kohesinya, dan mengubur komunitas yang berarti.

Ia juga **menceritakan ulang** dokumen yang dirangkumnya, sehingga isi yang sama
masuk graf dua kali dengan kata berbeda. Itu terlihat langsung sebagai konsep
kunci kembar di laporan: "Deploy dan rebuild lewat webhook (Coolify)", "ADR-0014
— Rendering campuran dan BFF portal Jualanku", dan "Postur performa dan keamanan
punya nama, dan celahnya punya nomor" masing-masing muncul dua kali.

`.graphifyignore` baru mengeluarkannya. Yang hilang: tidak ada — rasional setiap
keputusan tinggal di `docs/adr/`, dan itu tetap diindeks.

Hasil bangun ulang: **971 → 768 node, 101 → 57 komunitas**, dan setiap satunya
bernama bahasa manusia yang dipilih, bukan diwarisi.

## Gerbang kelima: `bun run audit:graf`

ADR-0030 melarang aturan tertulis tanpa pemeriksa. Tiga aturan graphify
ber-alasan sudah hidup di `.gitignore` sejak 3 Agustus tanpa satu pun. Sekarang
mereka punya, bersama aturan penamaan yang baru:

1. **Hanya empat artefak bersama yang terlacak** — `graph.json`,
   `GRAPH_REPORT.md`, `manifest.json`, `cost.json`. Cache, berkas ber-titik,
   salinan bertanggal, dan `graph.html` masing-masing punya alasan tertulis
   untuk tinggal di luar riwayat, dan sekarang punya penegaknya.
2. **Laporan dan graf berasal dari run yang sama** — jumlah node, edge, dan
   komunitas harus sepakat. Bila tidak, salah satunya basi dan pembaca tidak
   punya cara tahu yang mana.
3. **Setiap komunitas punya nama yang dipilih** — bukan nama berkas, bukan
   placeholder, tidak kembar, dan sama di `graph.json` maupun `GRAPH_REPORT.md`.
4. **Yang dikecualikan tetap dikecualikan** — rebuild yang lupa `.graphifyignore`
   ketahuan.

Kesegaran **dilaporkan, tidak memerahkan gerbang**: memerahkannya berarti tiap
PR yang menyentuh berkas terindeks wajib membawa rebuild bermegabyte, dan
gerbang semahal itu akan dilonggarkan dalam sebulan — persis yang §Gerbang mutu
larang.

`tests/audit-graf.test.mjs` membuktikan tiap gerbang **dua arah** — merah saat
cacatnya ada, hijau saat tidak — atas pohon fixture sungguhan, termasuk repo git
sungguhan untuk gerbang yang memang bertanya kepada git. Kasus terakhirnya
menjalankan gerbang atas repo ini sendiri.

## Berkas yang berubah

- **Baru:** `.graphifyignore`, `scripts/audit-graf.mjs`, `tests/audit-graf.test.mjs`
- **Standar:** `docs/awcms-astro/standar-teknis.md` — §Graf pengetahuan baru, dan
  baris gerbang kelima di §Gerbang mutu
- **Rantai gerbang:** `package.json`, `.github/workflows/ci.yml`,
  `scripts/rilis.mjs`
- **Dokumen yang akan berbohong bila tidak ikut:** `AGENTS.md`,
  `CONTRIBUTING.md`, `README.md`, `.github/PULL_REQUEST_TEMPLATE.md`,
  `docs/awcms-astro/README.md` ("empat perintah" → lima),
  `docs/awcms-astro/checklist-repo-baru.md`,
  `.claude/skills/awcms-astro-gerbang/SKILL.md`
- **Indeks:** `graphify-out/` dibangun ulang

Situs turunan yang menghapus `graphify-out/` mendapat gerbang yang **melewati
dirinya dan mengatakannya** — keadaan sah, bukan kelalaian.
