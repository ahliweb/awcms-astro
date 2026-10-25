---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Graf pengetahuan diekstrak ulang secara semantik, dan staleness `audit:graf` turun ke 0/40 (#139)

#142 membangun ulang graf hanya dari kode, sehingga staleness tertahan di 30/40,
lalu naik lagi ke 33/40 karena PR sesudahnya. Sisanya berkas Markdown dan YAML
yang hanya disegarkan ekstraksi semantik, dan skrip repo ini sengaja tidak
pernah menjalankannya. Kali ini ekstraksi itu dijalankan tangan lewat skill
graphify (`/graphify . --update`) dengan subagen sesi sebagai LLM, sesuai opsi 1
di komentar #139.

- 32 dokumen diekstrak ulang. Setiap berkas dibaca sampai baris terakhirnya,
  termasuk CHANGELOG yang dibagi dua menurut rentang baris. Putaran pertama
  dibuang karena subagennya hanya membaca bagian awal berkas, dan menerimanya
  akan mencap berkas itu "sudah diekstrak" padahal isinya hilang.
- Graf kini 1923 node, 3249 edge, dan 152 komunitas. 36 komunitas yang
  keanggotaannya tidak berubah memakai kembali nama kurasi lama. 116 lainnya
  dinamai baru, lalu diterapkan dengan `bun run knowledge:graph:label`, bukan
  `cluster-only`.
- `audit:graf` menunjukkan staleness 0/40 dan graf dibangun dari HEAD. Tidak ada
  batas, cakupan, atau hash manifest yang disunting tangan.
- Pembaca situs tidak melihat perubahan apa pun.
