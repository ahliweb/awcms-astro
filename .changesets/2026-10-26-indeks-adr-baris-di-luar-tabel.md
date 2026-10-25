---
bump: patch
tipe: perbaikan
dampak: internal
---

# Baris ADR-0053 masuk ke tabel indeks, dan `audit:dokumen` kini menolak baris di luar tabel

PR #145 menambahkan baris ADR-0053 di akhir `docs/adr/README.md` dan cerminnya,
sesudah blockquote penutup, bukan di dalam tabel. Tanpa header, markdown
merender baris itu sebagai teks biasa, jadi pembaca indeks tidak pernah melihat
ADR-0053 di tabel. `audit:dokumen` tetap hijau karena regex-nya mencocokkan baris
di mana pun dalam berkas: berkasnya ada dan barisnya ada, jadi kedua arah lolos.
Cacat ini ditemukan saat graf pengetahuan disegarkan (#139).

- Baris ADR-0053 dipindah ke tempatnya, tepat sesudah ADR-0052, di kedua bahasa.
- `audit:dokumen` menuntut setiap baris ADR berada dalam blok tabel yang memuat
  baris pemisah header. Gerbangnya dibuktikan merah atas indeks lama (baris 95)
  dan hijau atas indeks yang diperbaiki, dengan satu test baru.
- Pembaca situs tidak melihat perubahan apa pun.
