---
bump: patch
tipe: dependency
dampak: internal
---

# Menutup advisory audit: tambalan lokal picomatch dan @astrojs/node 11.1.13

`picomatch` `<=4.0.7` rentan ReDoS lewat extglob berulang dan belum ada rilis
perbaikan. Kedua salinan (4.0.7 dan 2.3.2) ditambal lokal lewat
`patchedDependencies` agar extglob selalu mati; dijaga
`tests/picomatch-local-patch.test.mjs`.

- Langkah audit dependensi CI mengabaikan hanya advisory ini
  (`--ignore GHSA-fc5q-39xc-vjpf`); pemilik unggul, tinjau paling lambat
  2026-12-18. Dicatat di `docs/awcms-astro/standar-performa-dan-keamanan.md`.
- `@astrojs/node` dinaikkan `^11.1.11` -> `^11.1.13` (patch dalam major) untuk menutup
  GHSA-r3h5-4585-7x3w (moderate, `<=11.1.11`); membawa `@astrojs/internal-helpers`
  0.13.2. Tabel versi di `docs/awcms-astro/standar-teknis.md` (+ `.id.md`) diperbarui.
- Tidak mengubah keluaran situs.
