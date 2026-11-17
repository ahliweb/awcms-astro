---
bump: patch
tipe: dependency
dampak: internal
---

# Tambalan lokal picomatch untuk GHSA-fc5q-39xc-vjpf

`picomatch` `<=4.0.7` rentan ReDoS lewat extglob berulang dan belum ada rilis
perbaikan. Kedua salinan (4.0.7 dan 2.3.2) ditambal lokal lewat
`patchedDependencies` agar extglob selalu mati; dijaga
`tests/picomatch-local-patch.test.mjs`.

- Langkah audit dependensi CI mengabaikan hanya advisory ini
  (`--ignore GHSA-fc5q-39xc-vjpf`); pemilik unggul, tinjau paling lambat
  2026-12-18. Dicatat di `docs/awcms-astro/standar-performa-dan-keamanan.md`.
- Tidak mengubah keluaran situs.
