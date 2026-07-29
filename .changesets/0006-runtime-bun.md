Pindahkan runtime dan package manager repo ini ke Bun, menutup satu-satunya
divergence runtime yang tersisa dari keluarga AWCMS ([ADR-0015](../docs/adr/0015-runtime-bun-menutup-divergence-keluarga.md)).

Sebelum ini repo memakai Node 22 + npm sementara `awcms`, `awcms-mini`, dan
`awcms-micro` memakai Bun. Alasan aslinya masuk akal — keluarannya statis murni,
jadi tidak ada runtime server, dan Node/npm menurunkan hambatan kontributor
konten. Dua hal membatalkannya: [ADR-0014](../docs/adr/0014-rendering-campuran-dan-bff-portal.md)
memasukkan runtime server ke repo ini untuk portal Jualanku, dan menjalankan dua
runtime dalam satu keluarga membuat setiap dokumen, gerbang, dan image harus
menjawab "yang mana".

Yang berubah:

- `package.json` — `packageManager: bun@1.3.14`, `engines.bun >= 1.3.0`,
  `engines.node`/`engines.npm` dihapus, seluruh script lewat `bun`/`bun --bun astro`.
- `package-lock.json` dan `.nvmrc` **dihapus**; `bun.lock` menjadi satu-satunya
  lockfile.
- `scripts/cek-lockfile.mjs` ditulis ulang untuk `bun.lock`. Ia tetap berjalan
  sebelum install, dan tetap memeriksa dua hal yang tidak diberikan
  `bun install --frozen-lockfile`: identitas lockfile (`workspaces[""].name` —
  cacat "lockfile milik repo lain" yang nyata pernah terjadi di sini) dan pesan
  gagal yang menunjuk sebabnya sebelum jaringan disentuh. Kedua cabangnya
  dibuktikan gagal pada mutasi nyata, bukan diasumsikan.
- Unit test pindah ke `bun:test` (`bun test`); flag
  `node --experimental-strip-types` tidak lagi diperlukan karena Bun menjalankan
  TypeScript langsung.
- CI memakai `oven-sh/setup-bun` dengan versi dipin, cache
  `~/.bun/install/cache`, `bun install --frozen-lockfile`, `bun test`, dan
  `bun audit`.
- `Dockerfile` membangun dari `oven/bun:1.3.14-alpine`; stage runtime tetap
  nginx unprivileged.
- Dependabot memakai `package-ecosystem: bun`.
- Script rilis berhenti menyinkronkan versi ke lockfile: `bun.lock` tidak
  merekam versi proyek sama sekali, jadi satu kelas cacat hilang dengan
  sendirinya.

Satu jebakan yang tertangkap saat migrasi dan sekarang menjadi aturan di
`AGENTS.md`: script passthrough `"astro": "bun --bun astro"` **dihapus**.
`bun run` menyelesaikan nama ke script `package.json` sebelum
`node_modules/.bin`, sehingga `bun --bun astro check` memanggil script `astro`
yang memanggil dirinya sendiri — rekursi tak terbatas yang mati dengan
`E2BIG: Argument list too long`, pesan yang tidak menyebut sebabnya sama sekali.

Yang **tidak** berubah: `astro.config.mjs`, komponen, kontrak konten, dan
seluruh aturan produk. Migrasi ini menyentuh perkakas, bukan produk.
