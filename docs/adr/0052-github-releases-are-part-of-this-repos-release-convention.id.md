🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0052-github-releases-are-part-of-this-repos-release-convention.md)

<!-- i18n-source-hash: sha256:1847300c4390eee42366cab71310271104d42c525c29883e7ce37fb9539d0246 -->

# ADR-0052 — GitHub Releases adalah bagian dari konvensi rilis repo ini

- **Status:** Accepted
- **Tanggal:** 24 September 2026
- **Menggantikan:** satu butir alternatif ditolak dari [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.id.md) — "SBOM sebagai aset GitHub Release" — bukan ADR itu secara keseluruhan. Keputusan SBOM ADR-0031 (CycloneDX diturunkan dari `bun.lock`, ditulis sebelum commit rilis) tetap utuh dan Statusnya tetap `Accepted`.
- **Terkait:** [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.id.md) (klaim yang dikoreksi ADR ini), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (aturan tertulis mendapat pemeriksanya — aturan yang diterapkan ADR ini pada dirinya sendiri), [ADR-0048](0048-a-release-is-cut-when-the-backlog-crosses-a-bound.id.md) (batas backlog — separuh lain `audit:rilis`), [ADR-0040](0040-changeset-menyatakan-bump-semver.id.md) (changeset menyatakan bump sendiri — versi yang dihitung `rilis.mjs` sebelum mencetak perintah Release), `awcms` ADR-0119 (`--latest` harus ditulis eksplisit, bukan diwarisi dari bawaan tanggal-dan-versi `gh` — pelajaran yang sudah diserap repo ini dan kini dijalankan)

## Konteks

### Klaim tertulis

Daftar alternatif ditolak milik [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.id.md)
sendiri menyatakan, soal melampirkan SBOM sebagai aset Release: "rilis repo
ini adalah tag git beranotasi, **bukan** objek GitHub Release; menambah jalur
publikasi kedua untuk satu berkas berarti dua tempat yang bisa berbeda
pendapat." Entri `CHANGELOG.md` v0.5.x yang menyerap `awcms` ADR-0119
mengulang klaim yang sama dengan kata lebih tegas — "`bun run release` hanya
membuat tag git — repo ini tidak menerbitkan GitHub Release" — dan menambahkan
agar dibaca ulang "begitu repo ini punya alur rilisnya sendiri."

### Klaim itu salah, dan sudah salah sejak lama

Tujuh GitHub Release sudah ada saat ini: `v0.2.0` sampai `v0.6.0`. Ketujuhnya
dibuat **dengan tangan**, oleh manusia yang menjalankan `gh release create`
setelah mendorong tag — tak pernah oleh `scripts/rilis.mjs`, yang sejauh ini
hanya mencetak `git push && git push origin <tag>` lalu berhenti di situ.
Pada satu titik daftar Release sempat tertinggal **tiga versi** di belakang
tag-nya sebelum ada yang menyadari, pada repo yang setiap gerbang lainnya
tetap hijau sepanjang waktu itu, karena tak ada gerbang yang membaca
`.changesets/`, `git ls-remote`, atau API GitHub Releases untuk urusan apa
pun terkait Release sama sekali.

### Ini bentuk "tampak terjaga padahal tidak", dibalik arahnya

`AGENTS.md` menyebut bentuk ini berulang kali — sebuah aturan yang terbaca
mapan padahal tak ada yang memeriksa ia hanyut diam-diam. Setiap contoh
sebelumnya di repo ini adalah aturan yang belum punya praktik di
belakangnya (hitungan yang hanyut, konvensi tanpa gerbang). Yang ini
membalik arahnya — **praktik** — tujuh Release, dibuat sengaja dan berulang
oleh maintainer repo ini sendiri — sudah membatalkan **keputusan tertulis**
tujuh kali lipat, dan keputusan tertulis itu terus terbaca sebagai berlaku
karena tak ada yang membandingkannya dengan apa yang sungguh terjadi di
GitHub. Keputusan yang terbaca mapan padahal praktik sudah bergerak maju
tujuh kali bukan keputusan yang sekadar terlupakan; itu keputusan yang diam-
diam dikalahkan suara oleh setiap rilis sejak `v0.2.0`, tanpa ada yang
mencatat suara itu.

### Keputusan pemilik repo

GitHub Release **memang** bagian dari konvensi rilis repo ini, bukan
pemanis opsional yang ditambahkan manusia saat kebetulan ingat. Sesuai
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) — "aturan
tertulis mendapat pemeriksanya" — konvensi ini kini membawa pemeriksanya
sendiri, bukan tetap menjadi kalimat yang harus diingat seseorang untuk
dibaca ulang.

## Keputusan

### `scripts/rilis.mjs` mencetak perintah `gh release create`; ia tak menjalankannya

Perilis menulis catatan rilis yang sudah dilipat ke berkas temp
(`os.tmpdir()`, bukan jalur repo — ini bukan artefak rilis seperti SBOM
sudah menjadi, dan tak ada alasan isinya ikut ter-commit atau bertahan
lebih lama dari run ini) dan mencetak perintah siap-pakai `gh release
create <tag> --verify-tag --latest --title "<tag> — <judul>" --notes-file
<jalur>` sebagai langkah berikutnya, di KEDUA cabang (`--commit` dan tanpa
`--commit`), sesudah baris `git push`. `--latest` ditulis eksplisit —
pelajaran `awcms` ADR-0119 yang sudah dicatat dan diparkir repo ini, dan
inilah momen menjalankannya, bukan sekadar mengutipnya lagi.

### `scripts/audit-rilis.mjs` mendapat pemeriksaan keempat: setiap tag remote punya Release yang cocok

Membaca `git ls-remote --tags origin` dan API GitHub Releases publik tanpa
otentikasi untuk slug repo yang dikonfigurasi, membandingkan keduanya, dan
melaporkan tag mana pun yang ada di remote tanpa Release yang membawa
namanya. Ia gagal **tertutup**: tanpa remote git, tanpa jaringan, atau
respons non-`ok` adalah sebuah `note()` yang mengatakan pemeriksaan tidak
berjalan — tak pernah lulus diam-diam, dan tak pernah diperlakukan sebagai
pelanggaran. Ini bentuk yang sama dengan pemeriksaan 2 `audit-serapan.mjs`,
dengan alasan yang sama — runner tanpa jaringan keluar adalah lingkungan
normal, bukan kegagalan yang layak memerahkan build.

Perbandingannya sendiri hidup di `scripts/lib/tag-rilis.mjs` sebagai dua
fungsi murni, `tagRilisSah` (pola tag `vX.Y.Z` yang ketat) dan
`tagTanpaRilis` (tag remote dikurangi nama Release), dicakup enam belas tes
di `tests/tag-rilis.test.mjs` yang tak butuh jaringan — pemisahan yang sama
yang sudah ditarik `scripts/lib/git.mjs` antara batas shell dan logika yang
memberinya makan.

**Tak ada floor yang ditambahkan.** Ketujuh tag yang sudah ada sekarang
sudah punya Release yang cocok pada saat pemeriksaan ini ditulis,
diverifikasi dengan `gh release list` terhadap `git ls-remote --tags
origin` sebelum kodenya mendarat — jadi gerbangnya lahir **hijau**, bukan
kuning dengan batas yang harus diingat seseorang untuk diturunkan nanti.
Sebuah floor hanya akan jadi tempat bagi kesenjangan masa depan untuk
bersembunyi di bawahnya; repo ini sudah sekali menyaksikan sebuah konvensi
hanyut diam-diam, dan tidak sedang membangun tempat kedua untuk kegagalan
yang sama bersembunyi.

## Konsekuensi

- Kesenjangan antara apa yang **dikatakan** repo ini soal Release dan apa
  yang **dilakukannya** tertutup, dan tertutup dengan pemeriksa, bukan
  dengan kalimat.
- `bun run audit:rilis` kini mencetak, pada repo yang sehat: "rilis GitHub:
  7 tag diperiksa terhadap 7 GitHub Release, semua cocok."
- Tag masa depan yang didorong tanpa Release-nya memerahkan `audit:rilis`
  pada kali berikutnya siapa pun menjalankannya — memberi tahu, bukan
  memblokir, karena `main` tak membawa pemeriksaan wajib — alih-alih tetap
  tak terlihat sampai seorang manusia kebetulan membandingkan dua daftar
  dengan mata lagi.
- `docs/awcms-astro/standar-teknis.md` dan tabel gerbang kualitasnya kini
  mendeskripsikan bentuk empat-bagian sesungguhnya dari `audit:rilis` dan
  alur rilis sesungguhnya (tag → push → `gh release create`, dicetak bukan
  dijalankan), alih-alih cerita hanya-tag yang diceritakan alternatif
  ditolak ADR-0031.
- ADR-0031 sendiri tidak ditulis ulang. Keputusan SBOM-nya — CycloneDX dari
  `bun.lock`, ditulis sebelum commit rilis, deterministik, tanpa dependency
  baru — tak terdampak sama sekali oleh semua di atas dan tetap berstatus
  `Accepted`; hanya satu kalimat yang mengklaim repo ini tak menerbitkan
  GitHub Release yang digantikan, dengan penunjuk yang ditinggalkan pada
  butir itu.

## Ditolak

- **Membuat `rilis.mjs` menjalankan `gh release create` sendiri.** Ditolak
  dengan alasan yang sudah diberikan komentar perilis sendiri untuk tidak
  mendorong: skrip ini sengaja tak pernah mendorong commit atau tag apa pun
  (lihat komentar §Prasyarat-nya), dan `--verify-tag` menolak tag yang
  belum ada di remote. Menjalankan perintah di sini berarti entah mendorong
  demi memenuhi `--verify-tag` — melewati batas yang sengaja dipegang
  perilis — atau memanggil perintah yang pasti gagal terhadap tag yang
  belum ada. Mencetak perintahnya sebagai langkah manual berikutnya
  menjaga batas yang sama yang sudah dipegang `git push`.
- **Sebuah floor pada tag mana yang diperiksa gerbang** (misalnya, "hanya
  tag dari `v0.7.0` ke atas"). Ditolak: setiap tag yang pernah didorong
  repo ini sudah patuh, jadi sebuah floor tak akan menutup kesenjangan
  nyata — ia hanya akan menciptakan pita di bawahnya tempat hanyut masa
  depan bisa bersembunyi tak terlihat, persis bentuk kegagalan yang ADR ini
  ada untuk menutupnya, bukan mereproduksinya dalam bentuk baru.
- **Melampirkan SBOM sebagai aset Release.** Tetap ditolak. Penalaran
  ADR-0031 — jalur publikasi kedua untuk satu berkas berarti dua tempat
  yang bisa berbeda pendapat — bertahan utuh melewati ADR ini:
  `sbom.cdx.json` sudah ikut di dalam tag, bisa diverifikasi terhadap
  `bun.lock` di sebelahnya, dan menambah salinan aset-Release hanya akan
  menciptakan salinan kedua yang bisa hanyut dari yang pertama tanpa ada
  yang membaca selisihnya. ADR ini mengoreksi klaim soal **apakah Release
  ada**, bukan penalaran soal **apa yang layak dilampirkan padanya**.
