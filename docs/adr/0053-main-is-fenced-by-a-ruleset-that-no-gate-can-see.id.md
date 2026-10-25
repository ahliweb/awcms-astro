🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.md)

<!-- i18n-source-hash: sha256:00d65dd622bae73e56a78f3dc4ce99bef7c76ffe9f0778189ad83afbaefd4202 -->

# ADR-0053 — `main` dipagari ruleset repositori, dan tak ada gerbang di repo ini yang bisa melihatnya

- **Status:** Accepted
- **Tanggal:** 26 Oktober 2026
- **Terkait:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (aturan tertulis mendapat pemeriksanya — aturan yang hanya separuh bisa dipenuhi ADR ini, dan ia mengatakannya), [ADR-0052](0052-github-releases-are-part-of-this-repos-release-convention.id.md) (rilis dipotong dari commit hasil merge di `main`; `audit:rilis` memeriksa Release, bukan commit), isu #137

## Konteks

### Aturan tertulis tanpa apa pun di belakangnya

`AGENTS.md` sudah berbunyi "buat branch dari `main`, jangan commit langsung ke
`main`", dan `docs/awcms-astro/standar-performa-dan-keamanan.md` berbunyi "PS.1
— Terpenuhi: branch protection + review" selama berbulan-bulan. Pada 24 Oktober
2026 audit baca-saja (isu #137) menemukan keduanya tidak benar untuk
repositorinya sendiri:

| Pemeriksaan | Hasil |
| --- | --- |
| `GET /repos/ahliweb/awcms-astro/branches/main` → `protected` | `false` |
| `GET /repos/ahliweb/awcms-astro/rulesets` | `[]` |
| `GET /repos/ahliweb/awcms-astro/rules/branches/main` | `[]` (pemilik adalah akun User, jadi tak ada ruleset organisasi yang bisa berlaku) |
| `delete_branch_on_merge` | `false` — sepuluh branch yang sudah di-merge masih ada di remote |

Kebiasaan itu bertahan karena satu-satunya maintainer menjaganya. Tak ada yang
menolak alternatifnya. Itu bentuk yang disebut `AGENTS.md` di tempat lain —
aturan yang terbaca terjaga padahal tak ada yang menjaganya — dan baris SSDF
adalah contoh paling jelas: ia mengklaim sebuah kontrol dengan namanya.

## Keputusan

### Ruleset repositori `main-protection`, aktif dan tanpa bypass actor

Diterapkan dan diverifikasi pada 26 Oktober 2026 (ruleset id `25837340`,
enforcement `active`, target branch bawaan, **tanpa bypass actor — admin
termasuk**):

| Aturan | Pengaturan |
| --- | --- |
| `deletion` | `main` tidak bisa dihapus |
| `non_fast_forward` | force push diblokir |
| `pull_request` | pull request wajib; approval wajib **0**; merge, squash, dan rebase semuanya diizinkan |
| `required_status_checks` | ketat (branch harus mutakhir); konteks `Check` dan `Build` (dari `.github/workflows/ci.yml`) serta `Analyze (javascript-typescript)` (dari `codeql.yml`), masing-masing dipaku ke integrasi `github-actions` (id 15368) |

Pengaturan repositori `delete_branch_on_merge` bernilai `true`, jadi branch yang
sudah di-merge hilang sendiri.

### Mengapa approval wajib 0

Pemilik adalah akun GitHub **User** dengan satu maintainer, dan GitHub tidak
mengizinkan siapa pun menyetujui pull request-nya sendiri. Nilai `1` akan
memaksa setiap merge lewat bypass; bypass actor lalu membuka kembali push
langsung yang justru hendak ditutup ruleset ini. Pagarnya karena itu adalah
**kewajiban pull request, pemeriksaan wajib, dan ketiadaan bypass** — bukan
sepasang mata kedua. ADR ini tidak mengklaim review manusia yang tak bisa
disediakan susunan ini; SSDF `PW.7` ("Review kode") dinyatakan ulang sesuai itu
di dokumen standar. Bila maintainer kedua ada, menaikkan approval ke 1 adalah
perubahan lewat ADR baru, bukan suntingan diam-diam.

### Mengapa persis ketiga konteks itu

Itulah pemeriksaan yang ada, berjalan di setiap `pull_request` tanpa filter
path, dan lulus andal. Mewajibkan pemeriksaan yang kadang tidak melapor membuat
pull request menunggu selamanya; mewajibkan yang difilter path melakukan hal
yang sama untuk setiap perubahan di luar filter.

- **`Build` hijau di sini tidak berarti build integrasi berjalan.** `Build`
  selalu melapor, tetapi melewati langkah integrasinya saat `vars.AWCMS_API_URL`
  kosong, yaitu keadaan repo template ini. Situs turunan yang mengisi variabel
  itu mendapat build sungguhan dengan nama konteks yang sama.
- `Picu deploy Coolify` (`rebuild.yml`) bukan pemeriksaan pull request dan tidak
  diwajibkan.

### Verifikasi (26 Oktober 2026)

Push fast-forward langsung dan force push ke `main` sama-sama ditolak dengan
`GH013: Repository rule violations`; menghapus `main` ditolak;
`GET /repos/ahliweb/awcms-astro/rules/branches/main` mengembalikan `deletion`,
`non_fast_forward`, `pull_request`, dan `required_status_checks`. Tag rilis
dipotong dari commit rilis hasil merge di `main` (`v0.6.2` berada di `acfb507`,
commit hasil merge PR #143).

Sebuah pull request uji (#144) dengan tes yang sengaja gagal juga dibuka:
`Check` gagal, `mergeStateStatus` bernilai `BLOCKED`, dan `gh pr merge` ditolak
dengan "the base branch policy prohibits the merge". PR itu ditutup dan
branch-nya dihapus. API ruleset melaporkan `current_user_can_bypass: "never"`,
jadi administrator pun tidak bisa menimpanya.

**`Build` bukan pagar yang berdiri sendiri.** `Build` memiliki `needs: Check`,
sehingga saat `Check` gagal, `Build` dilaporkan *skipped*, dan GitHub
menganggap pemeriksaan wajib yang di-skip sebagai terpenuhi. Pada kasus itu
pemblokiran merge datang dari `Check` sendiri, bukan dari `Build`. Mewajibkan
`Build` tetap berarti ketika `Check` lulus dan `Build` gagal; ia tidak boleh
dibaca sebagai garis pertahanan kedua terhadap kegagalan yang sudah ditangkap
`Check`.

## Yang TIDAK dicakup — dinyatakan, bukan disiratkan

- **Tag tidak dilindungi.** Ini ruleset branch; tak ada ruleset yang mencakup
  tag. Maintainer tetap bisa mendorong tag. `audit:rilis` memeriksa bahwa setiap
  tag remote punya GitHub Release
  ([ADR-0052](0052-github-releases-are-part-of-this-repos-release-convention.id.md));
  ia tidak memeriksa bahwa tag menunjuk commit yang sudah ditinjau.
- **Tak ada gerbang di repo ini yang bisa mendeteksi ruleset dicabut.** Ia hidup
  di pengaturan GitHub, bukan di berkas yang dibaca `bun test` atau skrip
  `audit:*`. [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) meminta
  pemeriksa untuk setiap aturan; aturan ini tidak punya, dan menuliskannya
  sebagai "digerbangi" adalah cacat persis yang hendak dicegah ADR itu. Ia
  **diverifikasi manual**, bukan digerbangi mesin:

  ```bash
  gh api repos/ahliweb/awcms-astro/rules/branches/main --jq '[.[].type]'
  # diharapkan: deletion, non_fast_forward, pull_request, required_status_checks
  ```

  Jalankan sebelum rilis dan setelah perubahan apa pun pada pengaturan
  repositori. Kolom "Keadaan" pada baris SSDF juga tak bisa digerbangi mesin.
- **Nol approval adalah kontrol yang lebih lemah daripada review.** Ia mencegah
  push tanpa tinjauan dan build merah mencapai `main`; ia tidak mencegah
  maintainer me-merge perubahan salahnya sendiri dengan pemeriksaan hijau.

## Konsekuensi

- Commit langsung ke `main` ditolak platform, bukan hanya oleh kebiasaan;
  dokumen kontribusi menjelaskan jalur sebenarnya (pull request, tiga
  pemeriksaan, branch mutakhir, branch dihapus saat merge).
- Pemeriksaan yang diganti nama atau dihapus di workflow membuat ruleset
  menunggu konteks yang tak pernah melapor, dan setiap pull request tertahan
  sampai ruleset disunting. Situs turunan harus memeriksa ulang nama
  konteksnya sendiri saat menerapkan ruleset setara
  ([`checklist-repo-baru.md`](../awcms-astro/checklist-repo-baru.id.md)).
- Prosedur rilis tidak berubah: commit versi lewat pull request seperti yang
  lain, dan tag dipotong sesudahnya dari commit hasil merge.

## Alternatif yang ditolak

- **Approval wajib = 1 dengan pemilik sebagai bypass actor.** Setiap merge akan
  memakai bypass, dan bypass actor juga bisa push langsung — ruleset terbaca
  ketat padahal tidak membatasi apa pun.
- **Mewajibkan lebih banyak konteks** (pemicu Coolify, atau job berfilter path).
  Keduanya bukan pemeriksaan pull request yang andal melapor.
- **Gerbang yang memanggil API rules.** Ia butuh kredensial di CI yang bisa
  membaca ruleset repositori dan harus gagal tertutup saat offline; itu tak
  sepadan untuk pemeriksaan manual satu perintah selama maintainernya satu.
