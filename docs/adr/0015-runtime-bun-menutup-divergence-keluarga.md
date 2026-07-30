# ADR-0015 — Runtime Bun: menutup divergence runtime dari keluarga AWCMS

- **Status:** Accepted
- **Tanggal:** 2026-07-29
- **Pengambil keputusan:** pemilik repo (@ahliweb), atas arahan langsung untuk
  menyeragamkan runtime kedua repo
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) — butir 3-nya
  **diganti** oleh ADR ini; `ahliweb/awcms` ADR-0002 (Bun-only runtime & tooling)
  dan [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md);
  [`docs/awcms-astro/README.md`](../awcms-astro/README.md) §"Divergence yang
  disengaja dari keluarga".

## Konteks

Keluarga AWCMS bersifat **Bun-only**: `awcms`, `awcms-mini`, dan `awcms-micro`
memakai Bun sebagai runtime **dan** package manager, dengan versi dipin di
`packageManager`, `engines.bun`, dan `bun-version` pada CI.

Repo ini menyimpang: Node 22 + npm, `package-lock.json`, `.nvmrc`, dan
`actions/setup-node` di CI. Divergence itu dulu punya alasan yang bisa
dipertahankan — keluarannya statis murni, tidak ada runtime server, dan Node/npm
menurunkan hambatan bagi kontributor konten yang bukan pengembang.

Dua hal mengubah nilai alasan itu:

1. **ADR-0014 memasukkan runtime server ke repo ini.** Portal Jualanku
   membutuhkan rute on-demand dan BFF, jadi premis "tidak ada runtime yang
   dijalankan" berhenti berlaku untuk deployment itu. ADR-0014 sendiri memilih
   menahan runtime di Node/npm agar risiko rendering dan risiko runtime tidak
   bercampur — pilihan yang benar sebagai urutan kerja, bukan sebagai tujuan.
2. **Dua runtime di satu keluarga punya biaya yang terus berjalan.** Setiap
   dokumen, gerbang, image, dan skrip harus menjawab "yang mana?"; setiap
   kontributor yang berpindah repo mengganti perkakas; dan lockfile npm membawa
   kelas cacatnya sendiri — `npm ci` menerima lockfile yang BERLEBIH dengan exit
   0, yang persis pernah terjadi di repo ini dan melahirkan
   `scripts/cek-lockfile.mjs`.

## Keputusan

**Repo ini memakai Bun sebagai runtime dan package manager, sejak sekarang, dan
tidak menunggu portal.** Konkretnya:

1. `package.json` menyatakan `"packageManager": "bun@1.3.14"` dan
   `"engines": { "bun": ">=1.3.0" }`. `engines.node`/`engines.npm` dihapus.
2. Seluruh script dijalankan Bun; bin Astro dipanggil `bun --bun astro …`
   mengikuti pola `awcms`.
3. `package-lock.json` dan `.nvmrc` **dihapus**; `bun.lock` menjadi satu-satunya
   lockfile dan wajib di-commit.
4. `scripts/cek-lockfile.mjs` ditulis ulang untuk `bun.lock` dan tetap berjalan
   **sebelum** install di CI. Ia mempertahankan dua pemeriksaan yang
   `bun install --frozen-lockfile` tidak berikan: identitas lockfile
   (`workspaces[""].name` — cacat "lockfile milik repo lain" yang nyata pernah
   terjadi) dan pesan kegagalan yang menunjuk sebabnya sebelum jaringan
   disentuh.
5. Unit test memakai `bun:test` (`bun test`), menggantikan
   `node --experimental-strip-types --test`. Bun menjalankan TypeScript langsung,
   jadi flag eksperimental itu tidak lagi diperlukan.
6. CI memakai `oven-sh/setup-bun` dengan versi dipin, cache
   `~/.bun/install/cache`, `bun install --frozen-lockfile`, `bun test`, dan
   `bun audit --audit-level=low`.
7. ~~Image produksi dibangun dari `oven/bun:1.3.14-alpine`; stage runtime tetap
   nginx unprivileged selama keluarannya statis.~~
   **DIAMANDEMEN [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
   (31 Juli 2026):** nginx dilepas dari stack; Bun yang menyajikan keluaran build
   di belakang Traefik/Coolify. Syarat "selama keluarannya statis" karena itu
   tidak lagi relevan, dan pengecualian yang melemahkan klaim Bun-only repo ini
   hilang bersamanya.
8. Dependabot memakai `package-ecosystem: bun` (pola yang sudah dipakai `awcms`).
9. **Versi Bun dipin di tiga tempat yang wajib bergerak bersama**: tag image
   Docker, `packageManager` + `engines.bun`, dan `bun-version` di CI.
10. **Tidak ada script bernama sama dengan biner yang dipanggilnya.** Script
    passthrough `"astro": "bun --bun astro"` dihapus. `bun run` menyelesaikan
    nama ke script `package.json` **lebih dulu** daripada ke `node_modules/.bin`,
    jadi `bun --bun astro check` di dalam script `check` memanggil script
    `astro` — yang memanggil dirinya sendiri, rekursif, sampai proses mati
    dengan `E2BIG: Argument list too long`. Ini tertangkap saat migrasi, dan
    pesan errornya sama sekali tidak menunjuk sebabnya. Untuk perintah Astro
    sekali pakai: `bunx astro <perintah>`.

Butir 3 pada ADR-0014 ("runtime tetap Node/npm sampai ada ADR migrasi runtime
tersendiri") **digantikan oleh ADR ini** — ini adalah ADR tersendiri yang
dimaksud, dan ia diputuskan lebih awal dari yang diperkirakan ADR-0014.

## Konsekuensi

**Positif**

- Satu runtime untuk seluruh keluarga: perkakas, dokumen, gerbang, dan
  pengetahuan kontributor berpindah repo tanpa terjemahan.
- Lockfile npm — beserta kelas cacat "berlebih tapi hijau" — hilang. `bun.lock`
  juga tidak menyimpan versi proyek, sehingga skrip rilis tidak perlu lagi
  menyinkronkan versi ke lockfile.
- `bun install` jauh lebih cepat di CI dan di mesin kontributor, dan build image
  kehilangan satu lapisan lambat.
- Rute on-demand dan BFF (ADR-0014) nanti berjalan di runtime yang sama dengan
  `awcms`, sehingga perilaku `fetch`, header, dan streaming tidak berbeda antar
  lapisan.

**Negatif / trade-off**

- Kontributor konten yang hanya punya Node harus memasang Bun. Ini biaya nyata,
  dan alasan asli divergence ini; ia diterima demi keseragaman keluarga.
- `bun install` **tidak** menolak peer-dependency mismatch seperti npm — ia
  memperingatkan lalu memasang. Pin `typescript` di `.github/dependabot.yml`
  karena itu menjadi lebih penting, bukan kurang: tanpa ia, TypeScript 7 akan
  terpasang mulus dan gagal belakangan di `astro check`.
- Bun bukan Node: sebuah dependency yang mengandalkan API Node yang belum
  lengkap di Bun akan gagal di sini lebih dulu daripada di ekosistem umum.
  Mitigasinya adalah `astro check` + unit test di CI, dan pin versi Bun yang
  eksplisit sehingga kegagalan bisa direproduksi.
- Riwayat `npm audit` berpindah ke `bun audit`; keduanya membaca basis data
  advisory yang sama tetapi keluarannya tidak identik.

**Netral**

- `astro.config.mjs`, komponen, dan seluruh kontrak konten tidak berubah satu
  baris pun. Migrasi ini menyentuh perkakas, bukan produk.
- Situs yang sudah memakai template ini tetap bisa dibangun dengan Node bila
  mereka memilih tidak ikut — tetapi mereka kehilangan kesamaan gerbang dengan
  template, dan itu keputusan mereka untuk dicatat sendiri.

## Alternatif yang dipertimbangkan

- **Tetap Node/npm sampai portal mendarat** (posisi ADR-0014 §3). Menunda satu
  perubahan perkakas dengan biaya menjalankan dua runtime keluarga lebih lama,
  dan memaksa setiap dokumen migrasi ditulis dua kali.
- **Bun sebagai package manager saja, Node sebagai runtime.** Kombinasi ini
  bekerja, tetapi menyisakan pertanyaan "yang mana" di setiap gerbang dan tidak
  menghapus satu pun biaya dokumentasi.
- **Menunggu Astro punya adapter Bun first-party.** Tidak relevan untuk keluaran
  statis, dan `awcms` sudah membuktikan pola `@astrojs/node` di atas Bun berjalan
  di produksi — ia mencatat pengecualiannya secara eksplisit di
  `astro.config.mjs`.
