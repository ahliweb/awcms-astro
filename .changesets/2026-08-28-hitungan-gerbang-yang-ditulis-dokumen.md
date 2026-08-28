---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Empat dokumen menghitung gerbang repo ini, dan tak satu pun dihitung ulang

[`awcms-astro-gerbang/SKILL.md`](../.claude/skills/awcms-astro-gerbang/SKILL.md)
dan [`checklist-repo-baru.md`](../docs/awcms-astro/checklist-repo-baru.md) —
beserta kedua cerminnya — memberi tahu pembaca berapa banyak berkas gerbang yang
dijalankan `bun test`. Keduanya berbunyi **21**. Angka sebenarnya 37. Baris yang
sama juga menjanjikan "tiga meta-tes yang menjalankan ulang ketiga skrip audit",
sementara enam meta-tes menjalankan ulang enam dari tujuh.

Tidak ada yang rusak saat sebuah gerbang ditambahkan, dan itulah seluruh
bentuknya: hitungannya lapuk satu berkas demi satu berkas, tiap penambahan tak
terlihat sendirian, dan kesembilan gerbang hijau sepanjang itu.

Yang membuatnya lebih buruk dari biasa: kalimat yang hanyut itu tinggal di
dokumen yang seluruh subjeknya adalah **pemeriksa mana yang ada**. Pembaca yang
ingin tahu apa yang terjaga diberi sebuah angka, dan angka itu satu-satunya hal
di halaman tersebut yang tidak dijaga siapa pun.

- **`tests/documented-counts.test.mjs` membaca kedua angka itu dari keempat
  dokumen** dan membandingkannya dengan isi `tests/`. Asersinya berjangkar pada
  `` `bun test` `` diikuti angkanya — satu pola untuk kedua bahasa dan kedua
  dokumen.
- **Menuliskan angkanya kembali sebagai KATA ikut merah.** Kegagalannya sengaja
  diarahkan ke sana: hitungan yang tidak bisa dibaca lagi adalah hitungan yang
  berhenti dijaga, dan itu harus berbunyi keras, bukan lolos diam-diam.
- **Cermin yang diperbarui sebelah tertangkap terpisah**, dengan pesan yang
  menyebut pasangan mana yang pincang.
- **Baris "Yang TIDAK ditangkap" ikut dipersempit.** Skill itu menyatakan gerbang
  membaca struktur dan bukan prosa; itu kini punya satu pengecualian yang
  disebutkan, karena sebuah angka adalah satu-satunya klaim dalam kalimat yang
  bisa diselesaikan pemeriksa tanpa memahami kalimatnya. Sebuah dokumen yang
  mendaftar apa yang tidak terjaga harus jujur ke dua arah.
- **ADR-0037 melepas hitungan `.astro`-nya.** Paragraf trade-off-nya mematok "28
  berkas `.astro`"; jumlahnya kini 50. Perlakuannya sama seperti angka versi yang
  baru saja dilepas dari ADR yang sama — argumennya tidak butuh angka itu, dan
  sebuah ADR bertanggal adalah tempat terburuk untuk menyimpan nilai yang
  berubah.
