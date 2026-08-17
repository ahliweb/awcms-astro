🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0040-changeset-menyatakan-bump-semver.md)

<!-- i18n-source-hash: sha256:0f1e4b6bf55e2276f334278c96f6f6e28efeecd3710122de7c02e787e7e9b4db -->

# ADR-0040 — Sebuah changeset menyatakan bump semver-nya sendiri

- **Status:** Diterima
- **Tanggal:** 17 Agustus 2026
- **Menggantikan:** tidak ada. Mempersempit prosedur rilis [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md), yang seluruh langkah lainnya tetap berlaku.

## Konteks

Versi di sini `MAJOR.MINOR.PATCH`, ditandai `vX.Y.Z`. Bagian itu tidak pernah
dipersoalkan. Yang hilang adalah dari mana angkanya berasal.

Sampai keputusan ini, tingkatnya adalah sebuah argumen: `bun run release patch`.
Yang mengetiknya adalah siapa pun yang menjalankan rilis, pada saat rilis,
memilih satu kata untuk sepuluh perubahan dengan membaca daftar **nama berkas**.
Yang benar-benar tahu apakah sebuah perubahan memutus URL publik adalah
penulisnya, berbulan-bulan sebelumnya, dan formatnya tidak memberi mereka tempat
untuk menuliskannya.

Sementara itu format changeset memang membawa dua bidang — `tipe` dan `dampak` —
dan **tidak ada satu pun yang membacanya.** `scripts/rilis.mjs` membuang seluruh
blok frontmatter dengan satu regex; tidak ada gerbang yang membuka
`.changesets/` untuk apa pun selain tautan mati. Sepuluh changeset telah mengisi
bidang itu dengan setia, dan tidak satu pun pembaca pernah memakainya. Bidang
yang tidak dibaca siapa pun salah sesering ia benar, dan tidak ada yang tahu.

Dua cacat lain duduk di beberapa baris yang sama, dan layak disebut namanya
karena justru itulah yang seharusnya dicegah sebuah model versi:

1. **Aritmetikanya tidak bisa gagal.** `pkg.version.split('.').map(Number)`
   menjawab sesuatu untuk setiap string. Dijalankan atas versi yang benar-benar
   dihinggapi sebuah repo, ia menghasilkan `v0.2.NaN` untuk `0.2.0-rc.1`,
   `v1.0.NaN` untuk `1.0`, dan `vNaN.2.1` untuk `v0.2.0`. Tag bernama
   `v0.2.NaN` tidak terurut di mana pun di bawah `--sort=v:refname`, jadi rilis
   *berikutnya* membaca tag lain sebagai yang terbaru — kerusakannya hidup lebih
   lama daripada run yang menyebabkannya.
2. **Penyaring changeset menunggu membandingkan dengan satu nama persis**
   (`f !== 'README.md'`), sehingga `README.id.md` terhitung sebagai changeset.
   Rilis berikutnya akan melipat README Indonesia milik direktori itu sendiri ke
   `CHANGELOG.md` lalu menghapusnya.

## Keputusan

**Sebuah changeset menyatakan `bump: major | minor | patch` di frontmatter-nya,
dan rilis menurunkan versinya dari bump terbesar di antara yang menunggu.**

- `major` — sebuah URL publik, struktur konten, atau kontrak frontmatter
  **putus**.
- `minor` — pembaca mendapat sesuatu: artikel, tab, locale, atau fitur baru.
- `patch` — perbaikan yang tidak mengubah bentuk situs.

Tiga akibatnya, seluruhnya disengaja:

1. **Penilaian pindah ke saat ia bisa dilakukan.** Seorang penulis yang menilai
   besar satu perubahan sambil menulisnya sedang menjawab pertanyaan yang bisa
   ia jawab. Seorang perilis yang menilai besar sepuluh perubahan dari daftar
   berkas sedang menebak.
2. **Sebuah tingkat masih boleh disebut di baris perintah, dan hanya boleh yang
   LEBIH BESAR.** Perilis yang tahu rilisnya lebih besar daripada yang diakui
   changeset-nya boleh mengatakannya, dan tidak ada skrip yang bisa mengambil
   penilaian itu untuknya. Yang lebih kecil ditolak: itu menerbitkan sesuatu
   yang putus di balik nomor yang menjanjikan tidak ada yang putus.
3. **String versi diurai dengan ketat, atau tidak sama sekali.** Awalan `v`,
   prerelease dan metadata build, serta angka ber-nol-depan ditolak dengan
   menyebut namanya. *Sintaks* prerelease tanpa *kebijakan* prerelease
   menghasilkan tag yang tidak bisa diurutkan oleh sisa toolchain, dan repo ini
   tidak punya kebijakan itu: tidak ada tingkat prerelease dan `CHANGELOG.md`
   tidak punya bentuk bagian untuknya. Menambahkannya nanti adalah keputusan
   dengan pemeriksanya sendiri, bukan regex yang dilonggarkan.

## Pemeriksanya ([ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md))

`tests/versi-changeset.test.mjs`. Ia membuktikan setiap changeset menunggu
membawa `bump` yang sah; bahwa modelnya menolak kedelapan string versi yang
sebelumnya menghasilkan `NaN` diam-diam; bahwa sebuah bump me-reset bidang di
bawahnya (`1.4.7` minor adalah `1.5.0`, bukan `1.5.7`); bahwa bump terbesar yang
menang dan tingkat tak dikenal melempar alih-alih dilewati; dan bahwa
`package.json`, `CHANGELOG.md`, serta kosakata yang didokumentasikan di
[`.changesets/README.md`](../../.changesets/README.md) masih sepakat.

Yang terakhir itu asersi yang paling awet. Gerbangnya menerima kosakata tetap
dan README mengajarkan satu kosakata; saat keduanya berpisah, kontributor yang
mengikuti README-lah yang dirugikan, dan tidak ada hal lain yang akan
menyadarinya.

`scripts/rilis.mjs` menjalankan validator yang sama sendiri, alih-alih
memercayai gerbangnya. Gerbang menangkap changeset cacat saat sebuah PR
berjalan; rilis menangkap yang ditulis *sesudah* gerbang terakhir berjalan — dan
pada saat itu kesalahannya sedang dipakai menghitung sebuah versi.

## Yang sengaja TIDAK diputuskan

- **Tidak diadopsi: sebuah perkakas.** Changeset di sini tetap markdown tulisan
  tangan yang dilipat skrip milik repo ini sendiri. Nilai formatnya ada pada
  prosanya, dan prosanya ditulis orang yang memahami perubahannya.
- **Tidak diubah: `tipe` dan `dampak`.** Keduanya tetap ada, kini divalidasi
  alih-alih diabaikan. Mereka menjawab *jenis apa* dan *siapa yang melihat*;
  `bump` menjawab *berapa biayanya*, pertanyaan ketiga dan satu-satunya yang
  menentukan versi.
- **Tidak diubah: kosakata Indonesianya.** `AGENTS.md` §Language mengatur
  kode — pengidentifikasi, komentar, pesan gerbang. Keduanya konten, di berkas
  yang ditulis dan dibaca manusia, dan menamainya ulang akan menulis ulang
  sepuluh changeset dan kedua README tanpa keuntungan bagi pembaca mana pun.
  `bump` adalah bidang baru dan memakai kata semver sendiri, jadi ia tidak butuh
  terjemahan ke arah mana pun.
- **Tidak diselesaikan: `0.x`.** Semver tidak menjanjikan apa pun soal
  kompatibilitas di bawah `1.0.0`, dan di situlah repo ini masih berada. `bump`
  mencatat niat sekarang supaya catatannya sudah benar pada hari `1.0.0` membuat
  niat itu mengikat. Kapan `1.0.0` dinyatakan adalah keputusan terpisah dan
  tidak diambil di sini.
