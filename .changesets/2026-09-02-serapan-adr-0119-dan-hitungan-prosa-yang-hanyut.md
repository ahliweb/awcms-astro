---
bump: patch
tipe: dokumentasi
dampak: internal
---

# ADR-0119 `awcms` mendapat vonisnya, dan satu hitungan dalam prosa berhenti dihitung dari ingatan

`bun run audit:serapan` merah sejak `awcms` menerbitkan ADR-0119 pada 28 Agustus
2026: sebuah keputusan di repo itu yang belum dibaca siapa pun di sini. Itu
persis satu-satunya pemeriksaan yang MENGHADAP KELUAR di repo ini, dan
kegunaannya habis kalau ia dibiarkan merah.

- **ADR-0119 milik `awcms` divonis `diperiksa`.** Ia memutuskan bahwa lencana
  *GitHub Release* dipilih dengan `--latest` eksplisit alih-alih diwarisi dari
  bawaan tanggal-dan-versi milik `gh` — "latest" KEDUA di alur kerja yang sama,
  yang ADR-0117 `awcms` hanya perbaiki separuhnya, dan yang benar-benar mundur ke
  versi empat rilis terlampaui saat run yang terparkir akhirnya disetujui. Di sini tidak ada
  yang berubah: `bun run release` membuat **tag git saja** — repo ini tidak
  menerbitkan GitHub Release, tidak membangun image, dan tidak menggerakkan
  `:latest` apa pun. Barisnya tetap ditulis karena kesenyapan dan
  ketidakrelevanan terbaca sama, dan ia menyebutkan kapan harus dibaca ulang:
  saat repo ini punya alur rilis sendiri.

- **Ringkasan buku besar berhenti mengutip jumlah persisnya.** Cermin Indonesia
  skill integrasi berbunyi "68 ADR bervonis" sementara gerbangnya menghitung 70 —
  hanyut tanpa ada yang melihat, karena tidak satu pun pemeriksa membaca kalimat
  itu. Ia tidak sekadar dikoreksi menjadi angka baru yang akan hanyut lagi:
  angkanya dilepas, dan pembacanya diarahkan ke keluaran `bun run audit:serapan`,
  yang mencetak cakupan, lantai, dan puncaknya setiap kali ia berjalan. Sebuah
  angka yang dihitung mengalahkan angka yang diingat
  ([ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).
