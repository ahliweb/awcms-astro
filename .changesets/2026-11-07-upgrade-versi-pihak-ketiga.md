---
bump: patch
tipe: dependency
dampak: internal
---

# Penyegaran versi pihak ketiga dalam major yang sama

Tanpa kenaikan major dan tanpa pra-rilis.

- `astro` `^7.4.2` -> `^7.4.7`, `@astrojs/node` `^11.1.9` -> `^11.1.11`; `bun.lock` diregenerasi Bun 1.4.4. Ini menggantikan PR Dependabot yang hanya sampai 7.4.4.
- `github/codeql-action` v4.39.1 -> v4.39.3 (pin SHA).
- Bun tetap 1.4.4 (sudah terbaru, digest `Dockerfile` tidak berubah). `typescript` tetap ditahan di 6.x (ADR-0037); 7.x adalah kandidat major.
- Dua `overrides` baru, `@emnapi/core` dan `@emnapi/runtime` dipin `1.11.3`: setelah naik, Bun me-resolve `@emnapi/runtime` ke `2.0.0-beta.2` (pra-rilis, dari rentang peer di bawah `@astrojs/check`) dan `astro check` jatuh. Pin ini mengembalikan versi stabil yang sudah dipakai sebelumnya.
