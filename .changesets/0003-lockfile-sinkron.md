Sinkronkan `package-lock.json` dengan `package.json`, dan pasang gerbang yang
menjaganya tetap sinkron.

Repo ini lahir dari menyalin `web-lalulintasmelayani.com`. `package.json`-nya
ditulis ulang; lockfile-nya tidak. Sampai perubahan ini, `package-lock.json`
masih mengaku bernama `web-lalulintasmelayani.com@1.7.0` dan mendeklarasi dua
dependency yang tidak ada di manifest — `sharp` dan `@astrojs/markdown-remark`.

Yang membuatnya bertahan: **`npm ci` menerima keadaan itu dengan exit 0.** Ia
menolak lockfile yang KURANG, tetapi lockfile yang BERLEBIH lolos tanpa satu
peringatan pun; `npm ls` malah MENCETAK "extraneous" lalu keluar dengan status
0 juga. Jadi setiap CI run dan setiap clone memasang paket yang tidak
dideklarasi siapa pun, sementara seluruh gerbang tetap hijau.

Yang berbahaya bukan `sharp`-nya — ia memang datang dari `astro` sebagai
dependency transitif, jadi tidak ada yang rusak saat deklarasi hantunya
dicabut. Yang berbahaya adalah lockfile berhenti menjadi pernyataan tentang
proyek ini: `npm audit` memeriksa pohon yang salah, dan versi terpasang tidak
lagi bisa dibaca dari manifest.

- Lockfile diregenerasi penuh: 381 entri, identitas `awcms-astro@0.1.0`.
- `scripts/cek-lockfile.mjs` membandingkan identitas dan SELURUH blok dependency
  di entri root lockfile terhadap `package.json`. Murni baca berkas — tanpa
  jaringan, tanpa `node_modules` — sehingga di CI ia berjalan **sebelum**
  `npm ci`, dan kegagalannya terbaca sebagai "lockfile menyimpang" alih-alih
  sebagai kegagalan typecheck yang tidak ada hubungannya. Gerbangnya diuji
  dengan mengembalikan lockfile lama yang asli, bukan dengan pelanggaran yang
  dikarang.
- Regenerasi WAJIB lewat `npm install` penuh. `npm install --package-lock-only`
  menghasilkan lockfile yang kehilangan 94 paket biner opsional lintas platform
  (`@esbuild/*`, `@astrojs/compiler-binding-*`, `fsevents`) — `npm ci` lalu
  gagal di macOS dan Windows sementara Linux tetap hijau. Ini dicatat di
  `AGENTS.md`, di README, dan di kepala skrip gerbangnya.

Terkait: Dependabot `typescript 5.9.3 → 7.0.2` ditutup, bukan digabung.
`@astrojs/check@0.9.10` — rilis terbaru — menyatakan peer
`typescript@"^5.0.0 || ^6.0.0"`, jadi npm menolak pohonnya dengan ERESOLVE
sebelum satu berkas pun di-typecheck. `.github/dependabot.yml` sekarang
mengabaikan `typescript >=7` supaya PR yang sama tidak lahir ulang tiap minggu;
TypeScript 6 sengaja dibiarkan lewat karena masih di dalam peer range.
