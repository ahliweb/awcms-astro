# ADR-0030 — Empat aturan yang sudah tertulis akhirnya punya pemeriksa, dan rantai pasok dipin ke SHA

- **Status:** Accepted
- **Tanggal:** 4 Agustus 2026
- **Aturan pemilik:** 4 Agustus 2026 — "analisis seluruh isi repo ini … lalu update semua docs dan skills. setuju lakukan rekomendasi terbaikmu."
- **Terkait:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (celah 6 yang ditutup di sini), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (versi Bun dipin di beberapa tempat), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (permukaan yang dipanggil build), `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) (skill digerbangi terhadap kodenya)

## Konteks

Repo ini punya aturan yang mengikat: **"aturan baru wajib membawa pemeriksanya."**
Pembacaan menyeluruh pada 4 Agustus 2026 menemukan empat aturan yang sudah
tertulis — sebagian sejak berbulan-bulan — dan **tidak satu pun punya pemeriksa.**
Keempatnya berbagi bentuk kegagalan yang sama: tidak ada yang gagal saat
dilanggar.

### 1. Versi Bun: lima nilai, nol gerbang

`AGENTS.md` §Konfigurasi menyatakannya sebagai aturan yang tidak bisa dilanggar:

> Versinya dipin di TIGA tempat yang wajib bergerak bersama … Menaikkan salah
> satu saja membuat build lokal, CI, dan image berbeda perilaku — **diam-diam**.

Kalimat itu menghitung BERKAS. Yang harus sepakat adalah NILAI, dan nilainya
muncul **lima** kali: `packageManager`, `engines.bun`, `bun-version` di dua job
CI, dan tag image di dua stage `Dockerfile`. Duplikat kedua di masing-masing
berkas adalah yang paling mungkin tertinggal — letaknya jauh dari yang pertama,
dan keduanya tetap hijau sendirian.

`grep -rln "packageManager\|bun-version" tests/ scripts/` mengembalikan **nol
baris**.

### 2. Rilis: dua gerbang wajib yang tidak dijalankan perilis

Empat dokumen — `AGENTS.md` §Definition of Done, `CONTRIBUTING.md`, templat PR,
dan `checklist-repo-baru.md` — menuntut `bun test` hijau dan `bun audit` nol
sebelum rilis. `standar-teknis.md` §Keamanan menuliskannya sebagai kata **wajib**,
yang di dokumen itu berarti "pelanggarannya menggagalkan gerbang mutu".

`scripts/rilis.mjs` menjalankan `bun run build`, `audit:konten`, dan
`audit:dokumen`. Ia **tidak** menjalankan `bun test` maupun `bun audit`.

Yang hilang bukan sekadar dua perintah. Dua lapis `bun test` — gerbang penyajian
dan gerbang keluaran CSP — **melewati dirinya tanpa `dist/`**, jadi satu-satunya
tempat keduanya benar-benar bisa berjalan adalah sesudah build; dan sesudah build
adalah persis titik yang dilewati perilis.

### 3. Permukaan `awcms`: dua repo, dua angka

`ahliweb/awcms` menilai kesiapannya sebagian dari daftar permukaan yang
dikonsumsi repo ini. Penilaian repo-nya pada 4 Agustus 2026
(`docs/awcms/repo-assessment-2026-08-04.md` §4) mencatat **enam**, dan menyusun
rencana snapshot kontrak konsumen di atas angka itu.

Repo ini memanggil **tiga**. Diverifikasi ke kode, bukan ke daftar:

| Permukaan | Keadaan |
| --- | --- |
| `GET /api/v1/blog/posts` | dipanggil |
| `GET /api/v1/media/objects` | dipanggil |
| `GET /api/v1/media/public-origin` | dipanggil |
| `GET /api/v1/blog/posts/{id}` | **DIHAPUS ADR-0018** — dulu N+1 per build |
| `GET /api/v1/auth/session` | milik BFF portal yang belum ada |
| `POST /api/v1/access/machine-credentials` | cara MANUSIA menerbitkan token |

Selisihnya bukan sekadar angka. Kontrak konsumen yang membekukan tiga permukaan
yang tidak dikonsumsi akan mengikat repo SANA pada bentuk yang repo SINI tidak
pernah butuh — sambil membuat "kontraknya terjaga" terasa lebih lengkap daripada
kenyataannya. Dan daftar di sisi sini, sampai ADR ini, hanya prosa: ia sudah
pernah salah, dengan `/posts/{id}` bertahan di dokumen berbulan-bulan setelah
panggilannya dihapus.

### 4. Celah 6 ADR-0028: pin rantai pasok

Empat action GitHub dipin ke tag dan image dasar dipin ke tag. Tag bisa
dipindahkan; action berjalan dengan akses ke token workflow dan seluruh isi
checkout.

## Keputusan

### §A — `tests/versi-toolchain.test.mjs`

Lima nilai versi Bun dibandingkan: `packageManager` sebagai rujukan,
`engines.bun` harus MENERIMA-nya (rentang, bukan kesamaan — keduanya menjawab
pertanyaan berbeda), dua `bun-version` CI dan dua tag `Dockerfile` harus sama
persis dengannya. Murni pembacaan berkas: tanpa build, tanpa jaringan.

### §B — Rantai pasok dipin ke SHA dan digest

Keempat action dipin ke SHA commit dengan komentar `# vX.Y.Z` di belakangnya —
bentuk yang Dependabot baca untuk menaikkan pin sekaligus komentarnya, sehingga
baris itu tetap terbaca manusia tanpa berhenti bisa diperbarui mesin. Image dasar
dipin ke digest, tag dipertahankan di depannya.

**Pin digest tidak boleh mendarat tanpa §A, dan itu bukan urutan yang bebas
dipilih.** Saat tag dan digest sama-sama ada, **digest yang dipatuhi Docker dan
tag hanya menjadi komentar** — sehingga menaikkan tag tanpa menaikkan digest
menghasilkan `Dockerfile` yang berbunyi `1.3.15` sambil membangun `1.3.14`, tanpa
satu pun kegagalan. Pin digest karena itu MENAMBAH satu kelas cacat diam yang
hanya §A tutup. Gerbang itu memeriksanya secara khusus: bila satu stage dipin ke
digest, keduanya harus, dan digestnya harus identik.

### §C — Perilis menjalankan gerbang yang dokumennya tuntut

`scripts/rilis.mjs` menjalankan `bun test` dan `bun audit --audit-level=low`,
keduanya **sesudah** build. `--audit-level=low` menyamai CI: ambang yang lebih
longgar di perilis akan meloloskan advisory yang PR-nya sendiri tolak, dan
selisih itu hanya terlihat oleh orang yang membandingkan dua berkas.

### §D — Daftar permukaan `awcms` diekstrak dari kode, dibandingkan dua arah

`tests/kontrak-awcms.test.mjs` mengekstrak jalur `/api/v1/…` dari string literal
di `src/` — **setelah membuang komentar**, karena berkas di sini memerikan
permukaan yang tidak dipanggil jauh lebih sering daripada memanggilnya — lalu
membandingkannya dengan tabel bertanda di
[`awcms-astro-integrasi`](../../.claude/skills/awcms-astro-integrasi/SKILL.md).

Dua arah, dan keduanya sudah pernah terjadi: permukaan baru yang tidak dicatat,
dan baris yang tertinggal setelah permukaannya dihapus. Angka tiga juga ditulis
eksplisit, supaya permukaan keempat memerahkan gerbang meskipun penulisnya ingat
memperbarui skill — dua pemeriksaan yang bisa salah bersama bukan dua
pemeriksaan.

## Konsekuensi

**Yang didapat.** Empat aturan berhenti bergantung pada ingatan. Celah 6
ADR-0028 tertutup. `awcms` mendapat sumber yang bisa dipercaya untuk kontrak
konsumennya — daftar yang merah bila salah, alih-alih prosa yang sudah pernah
keliru.

**Yang dibayar.** Menaikkan versi Bun kini menyentuh enam nilai, bukan lima:
tag, digest, dan empat lainnya. Itu memang lebih banyak pekerjaan — dan
gerbangnya yang membuat pekerjaan itu tidak bisa setengah selesai. Menaikkan
action juga tidak lagi cukup dengan mengganti `v7` menjadi `v8`; Dependabot yang
mengerjakannya, dan tanpa Dependabot ia menjadi pekerjaan tangan yang nyata.

**Yang TIDAK dilakukan.** `graphify-out/` **tetap dilacak.** Rekomendasi
sebelumnya di sesi yang sama adalah meng-`gitignore`-nya karena hook menulisinya
pada setiap perpindahan branch; membaca `.gitignore` membatalkan rekomendasi itu.
Berkas itu sudah memuat tiga aturan graphify ber-alasan yang sengaja **menyisakan**
keluaran bersama (`graph.json`, `manifest.json`, `GRAPH_REPORT.md`) tetap
terlacak, sementara intermediate, snapshot bertanggal, dan `graph.html` dibuang.
Itu keputusan yang sudah dipertimbangkan; churn-nya gesekan, bukan cacat.

## Alternatif yang dipertimbangkan

- **Memin action ke tag mayor saja** (`@v7`) dan mengandalkan Dependabot.
  Ditolak: Dependabot menjaga versi tetap BARU, bukan tetap SAMA. Yang dijaga
  pin SHA adalah jendela antara sebuah tag dipindahkan dan seseorang
  menyadarinya.
- **Memin digest tanpa gerbang versi.** Ditolak dengan alasan §B: ia menukar
  satu kelas cacat dengan kelas cacat lain yang lebih sunyi.
- **Memperluas daftar permukaan menjadi enam agar cocok dengan `awcms`.**
  Ditolak: daftar ini menyatakan apa yang repo ini PANGGIL, dan tiga di antaranya
  tidak dipanggil. Menyamakan angka dengan menambah baris yang salah adalah
  membuat dua dokumen sepakat pada hal yang keliru.
- **Menjalankan `bun test` sebelum build di perilis.** Ditolak: dua lapisnya
  melewati diri tanpa `dist/`, jadi ia akan hijau tanpa menjalankan apa pun yang
  penting — bentuk paling murni dari gerbang yang tampak terjaga.
