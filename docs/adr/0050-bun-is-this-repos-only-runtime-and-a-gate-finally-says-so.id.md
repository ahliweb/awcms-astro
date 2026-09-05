🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.md)

<!-- i18n-source-hash: sha256:55cf55e5583c3841dbf2b1e1e4f9fffc13a794d222047314384e65c9b90f5d11 -->

# ADR-0050 — Bun adalah satu-satunya runtime repo ini, dan akhirnya ada gerbang yang mengatakannya

- **Status:** Diterima
- **Tanggal:** 5 September 2026
- **Terkait:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (runtime Bun, menutup divergence keluarga — keputusan yang digerbangi ADR ini), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (Bun menyajikan hasil build di produksi, bukan nginx), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan yang hanya tertulis adalah aturan yang hanyut — bentuk yang ditutup ulang ADR ini), [ADR-0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) (pin tingkat keluarga dengan gerbangnya sendiri, preseden terdekat untuk dua keputusan mempertahankan di bawah)

## Konteks

### Aturannya sudah benar, dan benar bukan berarti terjaga

Sebuah audit bertanya, terus terang: apakah repo ini bergantung pada runtime
Node.js di mana pun? Jawabannya tidak, dan tidak di setiap tempat yang
berarti:

- setiap entri `scripts` di `package.json` memanggil `bun`;
- `.github/workflows/*.yml` tidak membawa `actions/setup-node`, tidak
  membawa `node-version`, dan tidak membawa langkah `node`/`npm`/`npx`/
  `yarn`/`pnpm` telanjang — hanya `oven-sh/setup-bun`;
- `Dockerfile` dibangun dan dijalankan hanya di atas image `oven/bun:*`, dan
  `CMD`-nya memanggil `bun`;
- `server/penyaji.mjs` dibuka dengan `#!/usr/bin/env bun`.

Tidak satu pun di sini yang hanyut atau kebetulan. Ini persis keadaan yang
sudah dinamai [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) untuk
aturan versi Bun, dan sekali lagi untuk pin TypeScript
([ADR-0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)):
sebuah fakta yang benar hari ini, tidak tertulis sebagai pemeriksa mana pun,
dan karena itu bisa berhenti benar tanpa satu pun perintah berubah merah.
Sebuah langkah `node` yang dilipat ke `ci.yml` "sekadar untuk menjalankan
skrip cepat," image dasar yang ditukar menjadi `node:alpine` generik saat
menyunting Dockerfile, atau skrip postinstall sebuah dependency yang diam-diam
menuntut `npm` — tidak satu pun dari ini menggagalkan `check`, `bun test`,
atau skrip audit mana pun hari ini, karena tidak satu pun dari mereka membaca
`package.json` menurut perintahnya, membaca `Dockerfile` menurut
`FROM`/`CMD`-nya, atau membaca berkas workflow untuk mencari action
toolchain. Kesunyian itu adalah definisi repo ini sendiri tentang cacat yang
layak digerbangi.

### Dua pembedaan yang harus benar, atau gerbangnya tidak jujur soal apa yang dilarangnya

Gerbang yang melarang hal yang salah lebih buruk daripada tidak ada gerbang:
ia mengajarkan editor berikutnya aturan yang salah dengan seluruh otoritas
CI merah di belakangnya. Dua pembedaan harus digambar tepat sebelum satu pun
asersi ditulis.

**1. `node:*` bawaan bukan dependency Node.js di sini.** `node:fs`,
`node:path`, `node:http`, `node:child_process`, `node:crypto`, `node:assert`
dan sisa permukaan yang diimpor `server/penyaji.mjs` serta setiap skrip di
`scripts/` adalah implementasi Bun SENDIRI atas API itu. Tidak ada apa pun
dari mengimpor `node:http` yang meluncurkan proses Node.js; ia menjalankan
stack HTTP Bun sendiri. Keduanya permukaan portabel yang menjadi dasar
penulisan repo ini, dan melarangnya berarti menggerbangi justru modul-modul
yang menjadi fondasi runtime yang hendak dilindungi ADR ini.

**2. `@astrojs/node` dan `compression` di `dependencies` bukan runtime yang
menyelinap kembali — keduanya dijalankan OLEH Bun, dan keduanya dipertahankan
dengan sengaja.**

- `@astrojs/node` (adapter Astro) memiliki resolusi URL menjadi path berkas.
  Docblock `server/penyaji.mjs` sendiri menyebut persis kenapa itu tetap di
  sana alih-alih ditulis ulang: "setiap baris yang memetakan URL ke berkas
  adalah baris yang bisa keliru menjadi pembacaan berkas arbitrer: `..`,
  path ter-encode ganda, dan symlink adalah kelas cacat yang sudah selesai
  bertahun-tahun lalu di pustaka yang dipakai adapter." Melepas adapter berarti
  membangun ulang resolver itu dari nol, di repo yang postur CSP dan
  header-nya ([ADR-0019](0019-csp-ketat-dikirim-penyaji.md)) sudah
  mengasumsikan resolusi itu benar.
- `compression` menegosiasikan Brotli. Menurut
  `docs/awcms-astro/standar-performa-dan-keamanan.md`, kompresi respons
  memakai pustaka yang sudah matang justru karena ia "bukan hanya gzip:
  `compression` v1.8 menegosiasikan Brotli (RFC 7932) saat peramban
  memintanya, dan Brotli mengalahkan gzip sekitar 15-20% pada HTML." Ia
  menarik `negotiator` (penguraian q-value `Accept-Encoding`) dan
  `compressible` (tabel MIME yang dikurasi) — keduanya masalah
  parsing/data sungguhan yang mestinya ditanggung dan dijaga tetap
  mutakhir sendiri oleh repo ini bila tidak ada keduanya.

Kedua paket berjalan sepenuhnya di dalam proses Bun yang dimulai
`server/penyaji.mjs`. Tidak satu pun yang men-spawn, memanggil shell ke, atau
menuntut biner Node.js di titik mana pun. Melepas salah satunya atas nama ADR
ini justru salah membaca ADR ini.

### Kenapa ini ADR tingkat repo, bukan tambahan `tests/tanpa-backend.test.mjs`

[ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) sudah
menggerbangi KEMAMPUAN paket — driver basis data, klien antrean, apa pun yang
memberi repo ini tempat untuk menulis. ADR ini menggerbangi hal yang berbeda:
SUBSTRAT EKSEKUSI itu sendiri, tidak peduli apa yang dilakukan paket mana
pun. Denylist kemampuan-backend yang menumbuhkan entri "runtime Node.js" akan
mengaburkan dua pertanyaan yang gagal karena alasan berbeda dan diperbaiki
orang yang berbeda — siapa pun yang menambah `pg` butuh jawaban ADR-0038,
siapa pun yang menambah langkah `setup-node` ke CI butuh jawaban ADR ini.

## Keputusan

**`tests/runtime-bun.test.mjs` menggerbangi ketiadaan runtime Node.js, dari
ujung ke ujung, dan berjalan di job `check` CI seperti setiap gerbang lain
yang tidak butuh build dan tidak butuh jaringan.**

Ia menegaskan, masing-masing dalam arah kegagalannya yang sungguhan:

1. Setiap entri `scripts` `package.json` hanya menjalankan perintah
   `bun`/`bunx`, dan tidak menyebut biner runtime Node.js (`node`, `npm`,
   `npx`, `yarn`, `pnpm`) di mana pun dalam baris perintahnya — bukan hanya
   sebagai kata pertama, sehingga argumen yang menyebutnya pun tertangkap.
2. `package.json` tidak membawa `engines.node`.
3. Tidak ada `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `.nvmrc`,
   atau `.node-version` di akar repo — masing-masing adalah regresinya
   sendiri, bukti bahwa package manager atau version manager Node.js lain
   pernah dijalankan atas repo ini.
4. Setiap `.github/workflows/*.yml` tidak membawa `actions/setup-node`,
   tidak membawa kunci `node-version:`, dan tidak membawa langkah yang
   perintahnya dibuka biner runtime Node.js.
5. Setiap baris `FROM` di `Dockerfile` merujuk image `oven/bun`, dan setiap
   `CMD`/`ENTRYPOINT` — bentuk exec maupun bentuk shell — memanggil `bun`.
6. Setiap shebang di bawah `scripts/` dan `server/` berbunyi
   `#!/usr/bin/env bun`. Skrip tanpa shebang sama sekali berada di luar
   aturan ini — ia hanya pernah dipanggil sebagai `bun scripts/x.mjs`, dan
   hanya berkas yang MENYATAKAN interpreter yang bisa menyatakan yang salah.

Dan, supaya kedua keputusan mempertahankan itu diperiksa dari sisi
sebaliknya dan bukan sekadar dibiarkan begitu saja secara kebetulan:

7. `@astrojs/node` dan `compression` tetap terdaftar di `dependencies`.
   Ketiadaannya gagal dengan lantang, menyebut ADR ini, alih-alih lolos diam-
   diam sebagai "satu hal lagi yang tidak perlu diperiksa."

Tidak satu pun dari ketujuhnya pernah memeriksa pernyataan impor atau membaca
daftar dependency untuk nama `node:*` — kedua pembedaan di atas dijaga benar
dengan tidak pernah menulis asersi yang bisa menangkap keduanya, bukan dengan
pengecualian yang mengeluarkannya kembali belakangan.

## Konsekuensi

- **Runtime Node.js yang menyelinap kembali ke repo ini kini gagal di
  gerbang saat itu juga mendarat**, di PR yang sama, alih-alih bertahan
  sampai seseorang mencoba membangun situs turunan dan menemukan kebutuhan
  `npm` yang tidak dijelaskan.
- **Kedua keputusan mempertahankan itu terdokumentasi sebagai keputusan,
  bukan kealpaan.** Sebelum ADR ini, "kenapa `compression` masih ada"
  jawabannya tersebar di satu komentar kode dan satu dokumen standar; sesudah
  ini, keberadaan kedua paket ditegaskan, dan ketiadaannya menunjuk ke sini.
- **Yang TIDAK dibuktikan gerbang ini:** setiap asersi di atas adalah
  pembacaan statis atas berkas yang sudah terlacak di repo ini. Ia tidak bisa
  melihat sebuah dependency transitif yang men-spawn biner `node` saat runtime
  dari dalam `postinstall`-nya sendiri atau tooling bawaannya sendiri —
  membuktikan itu berarti menjalankan pohon dependency, bukan membacanya, dan
  gerbang repo ini berjalan tanpa build dan tanpa jaringan di mana pun bisa.
  Ia juga tidak berkata apa-apa soal seorang maintainer yang menjalankan
  `npm install` dengan tangan di mesinnya sendiri, di luar CI, atas berkas
  yang tidak pernah di-commit. Yang ditutupnya adalah kelas yang sudah
  dialami repo ini di tempat lain: aturan tertulis tanpa apa pun yang berubah
  merah saat ia dilanggar.

## Ditolak

- **Membiarkannya sebagai fakta yang dinyatakan di `AGENTS.md` tanpa
  pemeriksa.** Itu status quo yang digantikan ADR ini, dan itu persis bentuk
  yang diperingatkan ADR-0030: benar hari ini, sunyi besok.
- **Melarang impor `node:*`.** Keduanya implementasi Bun sendiri atas
  permukaan API itu, bukan dependency Node.js; gerbang yang menandainya
  akan salah soal apa yang sebenarnya dilindunginya, dan mendorong kode repo
  ini sendiri menjauh dari API portabel yang justru benar menjadi dasar
  penulisannya.
- **Melarang `@astrojs/node` dan `compression`, atau mensyaratkan keduanya
  di belakang pengecualian daftar-izin.** Keduanya berjalan sepenuhnya di
  bawah Bun dan keduanya menutup kelas cacat sungguhan (pembacaan berkas
  arbitrer lewat resolusi URL; negosiasi Brotli dan kemutakhiran tabel MIME)
  yang mestinya ditulis ulang dan dijaga tangan oleh repo ini bila tidak ada
  keduanya. Daftar pengecualian "karena keduanya baik-baik saja" terbaca
  seperti tempelan belakangan atas aturan yang melarang keduanya secara
  bawaan; mencatatnya sebagai keputusan, diperiksa dari sisi mempertahankan,
  justru mengatakan keduanya tidak pernah menjadi sasaran aturan ini sejak
  awal.
- **Menggabungkan ini ke `tests/tanpa-backend.test.mjs`.** Gerbang itu
  menjawab pertanyaan yang berbeda — kemampuan paket, bukan substrat
  eksekusi — dan menjawabnya menurut KELAS, bukan menurut nama. Melipat
  "tanpa runtime Node.js" ke dalamnya akan membuat satu gerbang menjawab dua
  pertanyaan yang tak berhubungan, dan pembaca yang mencoba mencari kenapa
  PR-nya merah harus menyingkirkan yang salah lebih dulu.
- **Probe runtime — benar-benar men-spawn proses atau memeriksa container
  yang berjalan untuk membuktikan tidak ada biner `node`.** Gerbang repo ini
  berjalan tanpa build dan tanpa jaringan di mana pun bisa; probe semacam itu
  menambah keduanya, untuk kelas cacat (berkas yang sudah ter-commit ke repo
  ini) yang sudah tertangkap pembacaan statis. Kelas yang tidak bisa
  ditangkapnya — dependency yang diam-diam memanggil shell ke `node` saat
  runtime — dinyatakan sebagai batas di atas alih-alih dikejar dengan gerbang
  yang lebih berat.
