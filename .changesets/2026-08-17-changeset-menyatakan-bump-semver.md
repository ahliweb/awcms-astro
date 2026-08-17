---
bump: patch
tipe: struktur
dampak: internal
---

# Changeset menyatakan bump-nya sendiri, dan tag `v0.2.NaN` berhenti mungkin

Versi berhenti menjadi kata yang diketik saat rilis dan menjadi akibat dari isi
rilisnya ([ADR-0040](../docs/adr/0040-changeset-menyatakan-bump-semver.md)).
Setiap changeset kini membawa `bump: major | minor | patch`, dan
[`scripts/rilis.mjs`](../scripts/rilis.mjs) mengambil yang **terbesar** di antara
yang menunggu.

- **Dua bidang yang tidak pernah dibaca siapa pun kini divalidasi.** `tipe` dan
  `dampak` sudah didokumentasikan sejak lama dan diisi sepuluh changeset dengan
  setia — sementara `rilis.mjs` membuang seluruh blok frontmatter dengan satu
  regex dan tidak ada gerbang yang pernah membukanya. Bidang yang tidak dibaca
  salah sesering ia benar, dan tidak ada yang tahu.
- **`v0.2.NaN` adalah tag yang benar-benar bisa dibuat sebelum ini.**
  `pkg.version.split('.').map(Number)` menjawab sesuatu untuk setiap string:
  `0.2.0-rc.1` → `v0.2.NaN`, `1.0` → `v1.0.NaN`, `v0.2.0` → `vNaN.2.1`.
  Ketiganya dijalankan, bukan dibayangkan. Tag semacam itu tidak terurut di mana
  pun di bawah `--sort=v:refname`, jadi rilis BERIKUTNYA membaca tag lain sebagai
  yang terbaru — kerusakannya hidup lebih lama daripada run yang membuatnya.
  [`scripts/lib/semver.mjs`](../scripts/lib/semver.mjs) kini menolak awalan `v`,
  prerelease, metadata build, dan angka ber-nol-depan dengan menyebut namanya.
- **`README.id.md` terhitung sebagai changeset menunggu.** Penyaringnya
  membandingkan dengan satu nama persis (`f !== 'README.md'`), sehingga rilis
  berikutnya akan melipat README Indonesia milik direktori itu sendiri ke
  `CHANGELOG.md` lalu MENGHAPUS berkasnya. Kini setiap `README*` ditolak.
- **Tingkat yang disebut manusia hanya boleh naik.** Perilis yang tahu rilisnya
  lebih besar daripada yang diakui changeset-nya boleh mengatakannya; yang lebih
  kecil ditolak beserta daftar changeset yang menuntut lebih.
- **Pemeriksanya** [`tests/versi-changeset.test.mjs`](../tests/versi-changeset.test.mjs)
  — dua belas asersi, termasuk bahwa kosakata yang diterima gerbang masih sama
  dengan kosakata yang diajarkan [`README`](README.md)-nya. Saat keduanya
  berpisah, kontributor yang mengikuti README-lah yang dirugikan, dan tidak ada
  hal lain yang akan menyadarinya.

Rilis pertama yang memakainya menurunkan `patch` dari sebelas changeset yang
menunggu: `0.2.0 → 0.2.1`.
