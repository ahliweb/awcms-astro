---
bump: patch
tipe: struktur
dampak: internal
---

# Gerbang `tests/runtime-bun.test.mjs`: tanpa Node.js runtime, dan itu kini diperiksa

Sebuah audit menemukan aturan "Bun adalah satu-satunya runtime repo ini"
sudah benar di setiap tempat yang berarti — `scripts` di `package.json`,
`.github/workflows/*.yml`, `Dockerfile`, dan shebang `server/penyaji.mjs` —
tetapi tidak ada satu pun pemeriksa yang membuktikannya atau mencegahnya
merosot. Persis bentuk yang diperingatkan
[ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md): benar
hari ini, tidak tertulis sebagai pemeriksa, dan karena itu bisa berhenti
benar tanpa satu pun perintah berubah merah.

[ADR-0050](../docs/adr/0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.md)
mencatat keputusannya dan `tests/runtime-bun.test.mjs` menggerbanginya:
tidak ada `node`/`npm`/`npx`/`yarn`/`pnpm` di `scripts`, tidak ada
`engines.node`, tidak ada lockfile/version-file package manager lain di
akar repo, tidak ada `actions/setup-node` atau `node-version:` di workflow
mana pun, `Dockerfile` hanya membangun dan berjalan di atas `oven/bun`, dan
setiap shebang di `scripts/`/`server/` menyebut `bun`. Dua hal dinyatakan
sebagai keputusan mempertahankan yang disengaja, bukan kealpaan: bawaan
`node:*` (implementasi Bun sendiri, bukan dependency Node.js) dan
`@astrojs/node`/`compression` di `dependencies` (keduanya dijalankan OLEH
Bun — resolusi path URL, negosiasi Brotli).

- Tidak ada perubahan perilaku situs; ini murni gerbang CI baru plus
  dokumentasi yang memperbarui hitungan `bun test` dari 38 menjadi 39
  berkas gerbang.
- Terasa saat mengembangkan: sebuah langkah `node`/`npm`/`npx` yang tanpa
  sengaja ditambahkan ke `package.json` scripts atau ke sebuah workflow kini
  gagal `bun test` alih-alih lolos diam-diam.
