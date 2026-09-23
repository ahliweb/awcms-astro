🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md)

<!-- i18n-source-hash: sha256:ce0463037681142ceaf9eb6dd45e5f2d5c958ba0ebdb669ea1eff63f9db112f7 -->

# ADR-0051 — Pohon pengetahuan menunjuk ke kode, dan tak memiliki satu pun isinya

- **Status:** Accepted
- **Tanggal:** 24 September 2026
- **Terkait:** [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) (repo ini membaca `awcms`, tak menulis — disiplin yang sama diterapkan ADR ini pada pembacaan basis kode sendiri), [ADR-0039](0039-english-is-the-source-language.md) (aturan cermin yang dikecualikan dari direktori ADR ini), [ADR-0027](0027-penahanan-adr-0021-selesai.md) ("apakah ini akan ditulis ulang jika `awcms` berubah?" — pertanyaan yang dijawab "tidak" oleh ADR ini), `awcms` ADR-0068 (manifes kompatibilitas keluarga yang tak bisa ditulis repo ini, hanya ditunjuk), `awcms-one` [isu #11](https://github.com/ahliweb/awcms-one/issues/11) (prior art yang menjadi rujukan porting alur kerja ini), [isu #113](https://github.com/ahliweb/awcms-astro/issues/113)

## Konteks

### `awcms-one` sudah memecahkan masalah ini sekali

`awcms-one` — repo saudara yang menyematkan `awcms` sebagai `git subtree` di
samping storefront-nya sendiri — membangun alur kerja graf pengetahuan
Graphify atas pohonnya sendiri (`awcms-one#11`): graf yang dihasilkan mesin,
segelintir catatan kuratorial tulisan tangan, ekspor Obsidian, dan gerbang
`audit:graf` yang membaca artefak yang sudah di-commit tanpa perlu `graphify`
terpasang di CI. Itu bekerja, sudah diuji, dan menjadi preseden kerja terdekat
untuk kebutuhan repo ini. Menyalin desainnya mentah-mentah akan salah persis
di titik-titik yang bentuk `awcms-one` sendiri tidak cocok di sini — repo ini
tak punya subtree, tak punya graf kedua untuk difederasikan, dan sudah punya
aturan cermin terjemahan yang berbeda.

### `awcms#805` masih terbuka, dan tak ada yang kanonik untuk ditunggu

Pertanyaan wajar — "bukankah repo backend seharusnya mendefinisikan ini lebih
dulu, supaya kedua repo konvergen ke satu desain?" — punya jawaban konkret:
[`ahliweb/awcms#805`](https://github.com/ahliweb/awcms/issues/805)
mengusulkan persis itu, dan statusnya **terbuka dan belum diimplementasikan**.
Tak ada bentuk graf pengetahuan kanonik di sisi `awcms` untuk disalin,
didivergensikan dengan alasan, atau ditunggu. Repo ini karenanya tidak
memilih berdivergensi dari desain yang sudah dibangun — belum ada desain yang
dibangun sama sekali. Menunggunya berarti menahan pekerjaan ini tanpa batas
waktu terhadap isu tanpa linimasa yang disepakati, persis bentuk yang sudah
ditutup ADR-0027 untuk repo ini secara umum: "apakah ini akan ditulis ulang
jika `awcms` berubah?" dijawab di sini dengan "tidak" — alur kerja ini hanya
membaca pohon repo ini sendiri, dan tak menyentuh apa pun yang akan
diputuskan `awcms#805`.

### Empat titik bentuk repo ini sendiri yang tak cocok dengan desain `awcms-one`

1. **Tak ada subtree, tak ada federasi.** `awcms-one` membangun graf kedua
   atas `apps/cms` dan menggabungkan keduanya sesuai kebutuhan. Repo ini tak
   punya padanan untuk digabungkan — satu graf, atas satu pohon, adalah
   seluruh cakupannya.
2. **Vault Obsidian yang dihasilkan di sini jauh lebih besar relatif terhadap
   apa yang pernah ingin di-commit repo ini.** Ekspor penuh graf repo ini
   sekitar 1520 berkas. Repo ini sudah menolak melacak `graphify-out/graph.html`
   ("salinan yang di-commit membusuk diam-diam, dan ukurannya berlipat di
   setiap beban riwayat rebuild") dan `redesign/` ("repo ini tak melacak
   arsip apa pun") dengan alasan yang berlaku lebih keras lagi pada vault
   1520 berkas.
3. **Repo ini sudah punya aturan cermin terjemahan (ADR-0039) yang tak
   dibawa `awcms-one` dalam bentuk yang sama**, dan pengecualian aturan itu
   sendiri atas `*.id.md` dari graf (untuk menghindari mengindeks konten yang
   sama dua kali) adalah penalaran yang sama yang perlu diterapkan pada
   direktori navigasi pengembang yang dihasilkan mesin itu sendiri.
4. **Teks isu itu sendiri menyebut sebuah gerbang (`knowledge:graph:check`)
   yang akan menduplikasi tugas `audit:graf`**, dan isu itu justru
   menginstruksikan sebaliknya ("integrasikan dengan konvensi `audit:graf`
   yang ada, bukan membuat gerbang yang redundan").

### Deteksi komunitas di sini tak deterministik, dan itu memutus lingkaran penamaan di hulu

Terukur langsung atas graf milik repo ini sendiri, bukan sekadar diduga:
dijalankan tiga kali berturut-turut atas `graph.json` yang byte-nya identik
(1404 node, 2717 edge, tak ada berkas berubah antar-run), `graphify
cluster-only .` menghasilkan **92, lalu 90, lalu 91** komunitas. Lingkaran
penamaan yang didokumentasikan `graphify` di hulu — edit
`.graphify_labels.json`, lalu jalankan ulang `cluster-only` untuk
menerapkannya — mengandaikan partisi yang menjadi dasar sebuah nama dipilih
masih sama dengan partisi yang menerima nama itu. Faktanya tidak: satu run
`cluster-only` sekaligus menerapkan label DAN mengklaster ulang, dan karena
label diikat ke ID komunitas, run yang mengubah pemetaan id-ke-anggota
diam-diam menempelkan ulang setiap nama kuratif ke komunitas yang berbeda.
Itulah mekanisme persis di balik insiden yang sudah tercatat repo ini
sendiri, disebut di atas, yaitu 60 dari 101 label menempel di komunitas yang
salah di dalam JSON yang sah dengan semua gerbang lain hijau — lingkaran
yang seharusnya memperbaiki label yang salah adalah lingkaran yang sama yang
bisa menyebabkannya lagi pada run berikutnya.

## Keputusan

**Repo ini mengadopsi bentuk alur kerja Graphify + Obsidian milik
`awcms-one` — graf yang dihasilkan mesin, catatan kuratorial tulisan tangan,
ekspor Obsidian di balik sinkronisasi daftar-izin yang tervalidasi, dan
gerbang `audit:graf` yang tak perlu `graphify` terpasang — sambil
berdivergensi darinya di empat titik yang desainnya sendiri tak cocok di
sini, dan menyatakan tiap divergensi secara tertulis, bukan diam-diam.**

### 1. `knowledge/generated/` diabaikan git di sini, tak pernah dilacak

Berdivergensi dari `awcms-one`, yang melacak direktori padanannya. Ekspor
penuh sekitar 1520 berkas; preseden repo ini sendiri untuk menolak melacak
artefak graf dengan tingkat perubahan sebanding (`graphify-out/graph.html`)
dan direktori berbentuk arsip apa pun (`redesign/`) berlaku di sini dengan
kekuatan lebih besar, bukan lebih kecil. `audit:graf` mendapat pemeriksaan
gagal-tertutup bahwa tak ada apa pun di bawah `knowledge/generated/` yang
pernah dilacak git.

### 2. Basi konten berbatas diadopsi, dengan batas konkret

`audit:graf` menurunkan ulang hash konten `md5` yang sama yang sudah dicatat
`graphify` sendiri per berkas di field `ast_hash` milik `manifest.json`,
membandingkannya dengan pohon yang saat ini dilacak dan dalam cakupan, dan
gagal begitu drift (berubah + ditambah + dihapus) melewati
`MAX_STALE_FILES = 40`. Diverifikasi langsung terhadap pohon repo ini sendiri
sebelum diadopsi: hash graphify tereproduksi persis di bawah `node:crypto`
tanpa instalasi `graphify`, tanpa Python, dan tanpa jaringan — 195 dari 219
entri manifest cocok pada hari pemeriksaan ini dilakukan, dengan sisa drift
(24 berubah, 4 ditambah, 0 dihapus) jauh di bawah batas.

### 3. Empat skrip `package.json` baru, dan yang keempat bukan yang disebut isu

`knowledge:graph:update`, `knowledge:obsidian:export`, `knowledge:check`
(alias untuk `bun run audit:graf`), dan — ditambahkan begitu ketidak-
determinisan di atas terukur — `knowledge:graph:label`. Ini bukan
`knowledge:graph:check` dari teks isu asli; lihat Ditolak untuk alasan
mengapa itu tetap ditolak. `knowledge:graph:label` mengerjakan tugas yang
berbeda dari ketiga lainnya: ia menerapkan nilai `community_name` kuratif ke
partisi yang terakhir ditulis `knowledge:graph:update`, membaca `graph.json`
dan `graphify-out/.graphify_labels.json` lalu menulis balik ke keduanya plus
`GRAPH_REPORT.md`, tanpa memanggil `graphify` dan tanpa pernah menyentuh
`node.community`. Memisahkannya dari `knowledge:graph:update` adalah yang
membuat pemisahan pada butir berikut mungkin — satu skrip yang mengklaster,
satu skrip kedua yang menamai, sehingga satu run skrip pertama tak pernah
sekaligus, diam-diam, menjadi run skrip kedua.

### 3a. Update memutuskan partisi; label memutuskan nama — tak pernah dalam run yang sama

Lingkaran penamaan di atas tak bisa konvergen selama satu perintah sekaligus
mengklaster ulang dan melabeli ulang. Karena itu `bun run
knowledge:graph:update` memegang **partisi** (ia mengekstrak dan
mengklaster, dan memindah komunitas adalah tugasnya, bukan cacat), dan `bun
run knowledge:graph:label` memegang **nama**, diterapkan ke partisi yang
sudah ada di disk saat ini. Di antara keduanya, seorang manusia membaca
`graphify-out/GRAPH_REPORT.md` terhadap keanggotaan yang dideskripsikannya
dan menulis nama ke `graphify-out/.graphify_labels.json` — urutan yang
membuat sebuah nama kuratif berarti sesuatu, karena ia dipilih terhadap
keanggotaan yang masih ada di sana saat nama itu mendarat.
`knowledge:graph:label` gagal-tertutup: nama yang hilang, berbentuk nama
berkas, placeholder `Community N`, kosong, atau kembar menolak SELURUH run
dan tak menulis apa pun, sehingga penerapan sebagian — sebagian komunitas
dinamai, sebagian mewarisi, tanpa apa pun yang menyatakan mana yang mana —
tak bisa terjadi. Ia menulis `graphify-out/.graphify_labels.json.sig`
(tanda tangan keanggotaan per komunitas, dalam format `graphify` sendiri,
direproduksi dengan `node:crypto`) PALING AKHIR, setelah setiap nama
diterima, sehingga run yang ditolak tak pernah meninggalkan tanda tangan
yang mengklaim sebuah partisi sudah dikurasi padahal belum.

### 4. `knowledge/**` berbahasa Inggris saja, tanpa cermin `.id.md`

Berdivergensi dari setiap dokumen lain di `docs/**` dan setiap berkas
SHOUTING di root, yang tetap memikul persyaratan cermin ADR-0039 tanpa
perubahan. `knowledge/` adalah lapisan navigasi pengembang atas kode, bukan
dokumentasi produk atau proses — kategori yang sama yang sudah dikecualikan
fungsi `isInScope` milik gerbang terjemahan sendiri (cakupannya `docs/**`,
`.claude/skills/**`, `.changesets/README.md`, dan berkas SHOUTING root saja).
Menerjemahkannya akan menciptakan ulang, pada level prosa, persis duplikasi
yang sudah dikecualikan cermin `*.id.md` dari GRAF itu sendiri untuk
dihindari (penalaran `.graphifyignore` sendiri): salinan kedua dari fakta
yang sama yang bisa diam-diam melenceng dari yang pertama sementara gerbang
berbasis hash melaporkannya sebagai masih terkini.

### Penempatan mengikuti konvensi repo ini sendiri, bukan `awcms-one`

Skrip di `scripts/`, logika murni di `scripts/lib/` — tak ada direktori
`tools/` dan tak ada `packages/` di sini, jadi tak ada yang ditempatkan di
salah satunya.

## Konsekuensi

- **Pengembang atau agen mendapat cara lebih cepat berorientasi di basis
  kode ini** tanpa bantuan itu pernah diperlakukan sebagai kebenaran dasar —
  setiap catatan kuratorial dan setiap seksi README yang membuat klaim
  faktual menautkan ke seksi `AGENTS.md`, ADR, atau berkas tes yang benar-
  benar otoritatif, alih-alih menceritakannya ulang.
- **`knowledge/generated/` bisa membesar dan mengecil bebas antar mesin**
  tanpa menyentuh riwayat git repo ini — biaya kebebasan itu adalah clone
  baru tak punya vault yang dihasilkan sampai seseorang menjalankan
  `knowledge:obsidian:export` secara lokal, yang merupakan biaya benar untuk
  konten yang sudah diputuskan repo ini tak layak masuk riwayat karena sifat
  arsip dan rentan basinya.
- **Batas basi adalah angka nyata yang diukur saat ini, bukan angka bulat
  sembarang** — `MAX_STALE_FILES = 40` dipilih berdasarkan drift repo ini
  sendiri saat adopsi (28, jauh di bawah), bukan disalin dari `awcms-one`
  tanpa diperiksa apakah cocok.
- **Lima divergensi repo ini dari desain `awcms-one` (D2/D4/D6/D7 pada
  catatan kerja isu ini sendiri, dilipat menjadi tiga di atas begitu D6 —
  pengawatan berkas ignore — dihitung sebagai konsekuensi D2, bukan pilihan
  desain terpisah) perlu dicatat di `awcms-family-compatibility.yaml` milik
  `awcms` (`awcms` ADR-0068), dan repo ini tak bisa menulis berkas itu
  sendiri.** Yang bisa dilakukan di sini, dan dilakukan ADR ini, adalah
  menyatakan perbedaan dan alasannya secara tertulis, persis jalur yang
  sudah dipakai ADR-0034 untuk divergensi keluarganya sendiri.
- **Jika `awcms#805` mendarat kelak dengan bentuk kanonik berbeda**, alur
  kerja ini ditinjau ulang saat itu, terhadap desain nyata, alih-alih
  diblokir sekarang terhadap desain hipotetis — konsisten dengan jawaban
  ADR-0027 bahwa "butuh instance `awcms` untuk membuktikan panggilannya
  benar" adalah alasan menunggu hanya untuk pekerjaan yang benar-benar
  memanggil `awcms`; alur kerja ini tak melakukan panggilan semacam itu.
- **Yang TIDAK dibuktikan ADR ini:** bahwa graf atau catatan kuratorialnya
  lengkap, bahwa setiap fakta di dalamnya tetap benar seiring kode berubah
  (hanya dibatasi, bukan dihilangkan, oleh gerbang basi), atau bahwa
  kebenaran ekspor spesifik-Obsidian (rendering, backlink, tata letak
  canvas) bekerja di luar apa yang bisa diperiksa aturan klasifikasi berkas
  `scripts/lib/obsidian-safety.mjs` hanya dari path dan ekstensi berkas.

## Ditolak

- **Melacak `knowledge/generated/` di git, menyamai `awcms-one`.** Ditolak
  pada butir 1 §Keputusan di atas: penalaran yang sama yang sudah diterapkan
  repo ini pada `graphify-out/graph.html` dan `redesign/` berlaku di sini
  dengan kekuatan lebih besar, pada direktori yang satu orde besaran lebih
  besar dari keduanya.
- **Menambah gerbang `knowledge:graph:check` terpisah, seperti disebut teks
  isu asli.** Itu akan membaca artefak yang sudah di-commit yang sama yang
  sudah dibaca `audit:graf`, menghasilkan dua gerbang yang bisa berbeda
  pendapat soal fakta yang sama — persis bentuk gerbang redundan yang
  diperingatkan isu itu sendiri. `knowledge:check` adalah alias untuk
  `audit:graf`, bukan pemeriksaan baru.
- **Mengarahkan `graphify export obsidian --dir` langsung ke vault manusia
  milik seorang kontributor.** Ekspor harus mendarat di direktori staging
  lebih dulu dan divalidasi sebelum apa pun disinkronkan — menulis langsung
  ke vault yang hidup akan membiarkan satu ekspor cacat menimpa atau
  merusak catatan yang dirawat manusia dengan tangan, tanpa kesempatan
  membatalkan di tengah jalan.
- **Menerjemahkan `knowledge/` ke Bahasa Indonesia sesuai ADR-0039.**
  Ditolak pada butir 4 §Keputusan: itu di luar cakupan tertulis ADR
  tersebut, dan menerjemahkannya akan memperkenalkan persis risiko
  duplikasi yang coba dihindari alur kerja ini di dalam graf itu sendiri.
- **Menjalankan ulang `graphify cluster-only` untuk menerapkan sebuah nama
  kuratif, seperti yang didokumentasikan `graphify` di hulu.** Ditolak begitu
  terukur, bukan sekadar diasumsikan: tiga kali `cluster-only` dijalankan
  berturut-turut atas graf yang byte-nya identik (1404 node, 2717 edge)
  menghasilkan 92, lalu 90, lalu 91 komunitas, sehingga lingkarannya tak bisa
  konvergen di sini — setiap run yang menerapkan sebuah nama juga mempartisi
  ulang graf yang menjadi dasar nama itu dipilih, dan karena nama diikat ke
  ID komunitas, partisi yang berubah diam-diam menempelkan ulang setiap nama
  ke komunitas yang berbeda. `knowledge:graph:label` menggantikannya justru
  karena ia membaca dan menulis `graph.json` tanpa memanggil `graphify` sama
  sekali, sehingga menerapkan sebuah nama tak pernah bisa menjadi tindakan
  yang membatalkannya sendiri.
- **Menunggu `awcms#805` sebelum mengerjakan apa pun dari ini.** Tak ada
  linimasa yang disepakati untuk isu itu, dan alur kerja ini tak melakukan
  panggilan apa pun ke `awcms` serta tak membaca kontrak `awcms` apa pun —
  penalaran "tunggu kontrak stabil" yang secara sah menahan pekerjaan lain
  di repo ini (ADR-0023, ADR-0027) tak berlaku pada alur kerja yang sama
  sekali tak menyentuh `awcms`.
