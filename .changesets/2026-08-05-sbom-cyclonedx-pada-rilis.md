---
tipe: struktur
dampak: internal
---

# Celah 9 ditutup: setiap tag rilis membawa SBOM CycloneDX yang bisa diverifikasi

Konsumen hilir kini bisa menjawab "apakah rilis vX.Y.Z terdampak advisory X"
dari tag-nya, tanpa membangun ulang pohon dependency
([ADR-0031](../docs/adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md);
NIST SSDF PS.2, celah 9 ADR-0028).

- `scripts/sbom.mjs` menurunkan CycloneDX 1.5 dari `bun.lock` — tanpa
  dependency baru, karena menambah dependency pada langkah yang tugasnya
  menginventarisasi dependency adalah ironi rantai pasok yang nyata.
- Deterministik: tanpa timestamp, komponen terurut — regenerasi pada tag yang
  sama menghasilkan byte identik, jadi SBOM sebuah tag bisa diverifikasi,
  bukan hanya dipercaya.
- `scripts/rilis.mjs` menulisnya sebelum commit rilis; `tests/sbom.test.mjs`
  menjaga generatornya benar (mutation-proven, termasuk entri lockfile tak
  dikenal yang DITOLAK alih-alih dilewati) dan langkah perilisnya tidak bisa
  hilang diam-diam.
- Kesegaran `sbom.cdx.json` di pohon kerja SENGAJA tidak digerbangi: SBOM
  memerikan rilis, dan gerbang yang menuntut sinkron terus-menerus akan
  memerahkan setiap PR bump dependency sampai dilonggarkan.
