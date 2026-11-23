---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Nama klien dan pihak ketiga dinetralkan di kode, tes, dan dokumen hidup

Fixture tes, komentar kode, dokumen hidup, dan mock desain tidak lagi memuat nama klien, wilayah klien, atau host deploy; diganti nilai generik. Dua baris CHANGELOG yang merujuk repo pedoman internal pemilik dan satu host deploy diredaksi. Alasannya: repo ini publik dan template, jadi contohnya tidak boleh mengidentifikasi pihak tertentu.

- Hanya fixture, komentar, dan teks dokumentasi yang berubah; tidak ada perubahan perilaku, keluaran situs, atau dependensi.
