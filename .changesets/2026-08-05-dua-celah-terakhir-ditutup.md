---
tipe: struktur
dampak: internal
---

# Dua celah terakhir ADR-0028 ditutup — kesembilannya kini punya pemeriksa

Celah 7 (analisis statik) dan 8 (Core Web Vitals) ditutup
[ADR-0032](../docs/adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md),
persis dalam bentuk yang tabel celahnya sendiri resepkan — masing-masing
dengan syarat kejujuran yang dijaga tes:

- **CodeQL terjadwal** atas permukaan JS/TS, action dipin SHA. Langkah
  `Nyatakan cakupan` menulis ke ringkasan run berapa berkas dianalisis dan
  berapa `.astro` TIDAK — dihitung `find` saat run, bukan ditulis tangan.
  `tests/analisis-statik.test.mjs` menjaga langkah itu (dan pin-nya) tidak
  hilang diam-diam.
- **Lighthouse CI di job `build`**, terkondisi sumber konten seperti gerbang
  keluaran lain: di template tidak berjalan, di setiap SITUS berjalan pada
  tiap PR. LCP ≤ 2500 ms dan CLS ≤ 0,1 level `error`; INP tidak terukur di
  lab, jadi TBT ≤ 200 ms dipakai sebagai proksi dan disebut proksi.
  `tests/cwv-lab.test.mjs` memaku ambang `lighthouserc.json` ke angka dokumen
  standar — melonggarkannya menuntut mengubah tes, yang terlihat di review.
- Yang TIDAK berubah: RUM tetap ditolak, "memenuhi Core Web Vitals" tetap
  tidak boleh ditulis dari hasil lab, dan baris celah yang tertutup tetap di
  tabel [standar-performa-dan-keamanan.md](../docs/awcms-astro/standar-performa-dan-keamanan.md).
