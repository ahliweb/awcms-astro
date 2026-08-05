---
tipe: dokumentasi
dampak: internal
---

# Dokumen berhenti menghitung lima saat tabelnya mencatat enam, dan gelombang ADR `awcms` 0065–0068 diserap

Celah 6 (pin rantai pasok ke SHA/digest) ditutup ADR-0030 pada siang 4 Agustus,
tetapi tujuh berkas yang menghitung celah masih berbunyi "lima ditutup, empat
terbuka" — bentuk cacat yang persis diramalkan gerbang skill: prosa menua tanpa
memerahkan apa pun. Kini seluruh hitungan sepakat dengan tabel sumbernya:
**enam ditutup, tiga terbuka** (analisis statik, Core Web Vitals, SBOM).

- Baris A08 (Software & Data Integrity) naik dari "Sebagian" ke "Terpenuhi" —
  pin SHA/digest-nya sudah terpasang dan dijaga `tests/versi-toolchain.test.mjs`;
  yang tersisa dari kategori itu tinggal SBOM (celah 9).
- "Empat gerbang di CI" menjadi lima — `audit:graf` sudah lahir sebelum kalimat
  itu diperbarui.
- Panduan HSTS untuk situs turunan berhenti menyuruh memasang kebijakan di
  proxy: sejak [ADR-0029](../docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)
  penyaji sendiri yang mengirimnya di produksi, dan kebijakan kedua di Traefik
  adalah dua sumber yang saling menimpa.
- Gelombang ADR `awcms` 4 Agustus diserap ke
  [standar-performa-dan-keamanan.md](../docs/awcms-astro/standar-performa-dan-keamanan.md)
  §Hubungan dan skill terkait: ADR-0065 (kontrak konsumen repo ini dibekukan di
  sana — lima path, subset aditif; kritik "membekukan yang tidak dikonsumsi"
  selesai), ADR-0067 (Core Web Vitals masih `Proposed` di sana — menguatkan arah
  lab-saja celah 8), ADR-0068 (pin edisi OWASP kini keputusan ber-ADR dengan
  tanggal tinjau, dan divergence HSTS repo ini tercatat bernama di manifest
  keluarga). Matriks header mencatat selisih baru yang disengaja dua sisi:
  `awcms` kini mengirim COOP/CORP `same-origin` untuk sesi admin-nya; repo ini
  tetap tidak, dengan alasan yang kode `awcms` sendiri nyatakan tidak menular.
- Jebakan "anggaran gambar ada, pemeriksanya belum" di skill situs-baru
  dihapus — pemeriksanya sudah ada sejak 4 Agustus; daftar perintah rilis di dua
  skill kini menyebut `bun run audit:graf`.
