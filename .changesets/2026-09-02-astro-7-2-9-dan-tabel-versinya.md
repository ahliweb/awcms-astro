---
bump: patch
tipe: dependency
dampak: internal
---

# `astro` naik ke 7.2.9, dan tabel versinya ikut — karena gerbangnya menolak yang tidak

Dependabot menaikkan `astro` dari `^7.2.4` ke `^7.2.9` (grup `minor-dan-patch`),
dan PR-nya **merah**: `tests/versi-toolchain.test.mjs` membandingkan kolom "repo
ini" di `docs/awcms-astro/standar-teknis.md` dengan `package.json`, dan Dependabot
tidak bisa menyunting prosa. Itu gerbang yang bekerja persis seperti maksudnya —
ia lahir dari tabel yang terus mengatakan hal yang sudah berhenti benar selama
lima hari — jadi yang dikerjakan di sini adalah separuh yang memang harus
dikerjakan manusia.

- **Kedua cermin tabel diperbarui**, dan bukan sekadar angkanya. Baris `astro`
  dulu berbunyi "cocok persis" dengan `awcms`; sejak bump ini repo ini **lima
  patch di depan**, karena Dependabot menaikkan repo ini sendirian. Selisihnya
  DICATAT alih-alih ditutup dengan menahan patch: rentang patch `astro` tidak
  membawa kontrak lintas-repo, dan menahan sebuah patch supaya sebuah tabel tetap
  berbunyi "cocok" adalah tabel yang menyetir kode.
- **Kolom `awcms` dibaca dari repo itu pada 2 September 2026** dan barisnya kini
  mengatakan kapan ia dibaca. Kolom itu sengaja tidak digerbangi — ia menyebut
  repo lain, dan gerbang yang butuh jaringan gagal karena sebabnya sendiri — jadi
  yang bisa dilakukan adalah menyatakan umurnya.

Diverifikasi di luar CI, yang melewati build integrasi karena repo template tidak
punya sumber konten: `bun run build` penuh terhadap feed tiruan, `bun run check`,
kesembilan gerbang, dan `bun audit --audit-level=low` — nol kerentanan atas 382
paket.
