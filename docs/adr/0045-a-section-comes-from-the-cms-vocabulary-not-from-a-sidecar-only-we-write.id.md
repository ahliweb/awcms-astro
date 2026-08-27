🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md)

<!-- i18n-source-hash: sha256:29ad035ef70a0fb8c6362212fd2337470483f510936e1fd22d8cc2c6c4bec258 -->

# ADR-0045 — Seksi datang dari kosakata CMS, bukan dari sidecar yang hanya kita yang menulisnya

- **Status:** Diterima
- **Tanggal:** 27 Agustus 2026
- **Menggantikan:** tidak ada. Mempersempit aturan penempatan yang lahir bersama [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.id.md), yang memperkenalkan `contentJson.awcmsAstro` sebagai sidecar terstruktur repo ini.
- **Terkait:** `awcms` ADR-0100 §4 (amplop bertahan justru KARENA sidecar ini tinggal di dalamnya), `awcms` ADR-0104 (build membaca taksonomi), `awcms` ADR-0115 §2–4 (importer legacy menyatakan seksinya), `ahliweb/awcms#739` (jalur tulis yang memusnahkan sidecar), Isu #73

## Konteks

### Situs tidak menerbitkan satu pun tulisan editor, dan tidak ada yang mengatakannya

Seksi sebuah artikel ditentukan oleh satu ekspresi di `src/lib/content.ts`:

```ts
readBlock(post).kategori === tab
```

`readBlock` membaca `contentJson.awcmsAstro`. Kunci itu **sidecar milik repo ini
sendiri**. Menyisir `ahliweb/awcms` untuk kunci itu hanya menemukan importer
legacy dan beberapa komentar tentang pelestarian amplop — tidak ada field untuk
itu di `admin/blog.astro`, dan tidak ada badan permintaan dari layar itu yang
membawanya. Satu-satunya penulisnya di seluruh CMS adalah
`bun run blog:legacy:import --section-map`, sebuah CLI migrasi sekali jalan
(`awcms` ADR-0115 §2).

Jadi untuk artikel yang ditulis dengan cara biasa — seorang editor, di CMS,
menekan Terbitkan — `readBlock(post).kategori` bernilai `undefined`,
perbandingannya menjadi `undefined === tab` untuk setiap tab yang dikonfigurasi,
dan post itu tersaring keluar dari himpunan halaman. **Tidak ada halaman
artikel, tidak ada entri indeks seksi, tidak ada entri arsip, tidak ada error.**
Build hijau dan situsnya kosong.

Untuk sebuah template yang seluruh premisnya "awcms adalah backend konten", jalur
authoring bawaannya tidak menghasilkan apa pun.

### Tidak satu pun dari kedua repo bisa melihatnya

Bagian ini layak dicatat, karena cacatnya lebih tua daripada hari seseorang
menyadarinya.

- **Di sini:** `buatPost` di `tests/kontrak-awcms.test.mjs` menulis
  `contentJson: { awcmsAstro: { … kategori: "panduan" } }` pada **setiap** baris
  fixture. Satu-satunya bentuk yang gagal di produksi adalah satu-satunya bentuk
  yang tidak bisa dihasilkan double-nya.
- **Di sana:** `/blog/{code}/{slug}` merender dari `body_portable_text`, jadi
  post yang terdampak tampak sempurna di permukaan publik `awcms` sendiri.
  PROJECT_STATE `awcms` mencatat temuan yang sama dari sisinya pada 26 Agustus
  2026, setelah importer-nya menghasilkan 25.029 artikel untuk sebuah repo yang
  tidak akan membangun satu halaman pun bagi mereka.

Sebuah gerbang di sisi mana pun harus menghasilkan input yang tidak dimiliki
fixture kedua sisi. Itu anak tangga di atas "apakah pemanggilnya dipanggil" dan
"apakah pemanggilnya ada di jalur permintaan": **apakah repo yang MELAYANI ini
membaca field yang ditulis penulisnya?**

### Klasifikasi yang BISA disetel editor ternyata sudah dibaca

`/api/v1/blog/terms` sudah menjadi permukaan yang dikonsumsi sejak `awcms`
ADR-0104, dan `src/lib/awcms/taksonomi.ts` sudah menelusurinya setiap build —
untuk merender arsip kategori dan tag. `termIds` artikelnya sendiri sudah ikut
menumpang `?view=full`.

Jadi situs ini membaca klasifikasi nyata dari editor, memakainya untuk membangun
arsip, lalu menentukan seksi artikelnya dari kunci yang tidak bisa dijangkau
editor.

## Keputusan

**Seksi diselesaikan dari taksonomi tenant, dengan sidecar dipertahankan sebagai
penimpa yang eksplisit.**

### 1. Tiap tab menyatakan slug term yang menempatkan artikel di dalamnya

`TabDef` bertambah `termSlugs: readonly string[]`, ditulis pada **setiap** tab.
Menulisnya di setiap entri bukan pemborosan dan mengikuti preseden yang sudah
ditetapkan `urutanSeksi` di berkas itu: array `as const` yang heterogen membuat
tipe elemennya menjadi union, dan `tab.termSlugs` menjadi properti yang tidak ada
pada sebagian anggotanya. `astro check` merah.

Bawaan yang jelas — slug tab adalah slug term-nya — tetap **ditulis**, karena
kasus yang menarik justru saat keduanya berbeda: situs yang seksinya `berita`
sementara editornya mengarsipkan di bawah `berita-daerah` dan `berita-kota` punya
tempat untuk menyatakannya, alih-alih disuruh mengganti nama kategori di CMS.

### 2. Sidecar menang bila ia ada

Bukan demi kompatibilitas ke belakang. `awcms` ADR-0115 §4 **MENOLAK** mengimpor
baris yang tak bisa ditempatkan `--section-map`-nya, dan itu menjadikan sidecar
sebuah instruksi yang disengaja dari satu-satunya alat yang menulisnya.
Membiarkan taksonomi menimpanya akan mendaratkan sebuah migrasi di tempat yang
bukan pilihan operatornya.

Sidecar yang menyebut tab yang tidak dikonfigurasi **bukan** kejatuhan diam-diam
ke taksonomi. Ia dilaporkan sebagai tak tertempatkan, karena artinya sebuah tab
diganti nama atau dihapus dan masih ada yang menunjuk nama lamanya.

### 3. Seri diputus oleh urutan deklarasi, dan itu dinyatakan alih-alih diserahkan pada hash map

Artikel yang diarsipkan di bawah dua kategori yang keduanya memetakan ke tab
mendarat di tab yang lebih dulu muncul di `tabs`. Suatu aturan harus dipilih;
tanpa itu, isi sebuah seksi berpindah-pindah antar build yang tidak mengubah apa
pun.

### 4. Penempatan dihitung SEKALI per build, dan post yang tak tertempatkan dilaporkan

Dua hasil, sengaja dibedakan sebagai dua peristiwa:

- **Sebagian post tak tertempatkan** → masing-masing disebut namanya di keluaran
  build, dan build lanjut. Menggagalkan di sini akan membuat satu kategori salah
  ketik menghentikan seluruh redaksi menerbitkan.
- **SETIAP post tak tertempatkan, dari N > 0** → build **GAGAL**. Ini bukan
  kesalahan tingkat artikel: ini `termSlugs` yang menyebut kosakata yang tidak
  dipakai tenant ini, kredensial build tanpa `blog_content.taxonomies.read`, atau
  tab yang diganti nama sementara `site.ts` tidak. Ketiganya menerbitkan situs
  kosong dari build hijau, yang persis cacat yang hendak diakhiri ADR ini.

Bentuknya sama dengan aturan media yang sudah diterapkan ADR-0025 — satu id
hilang adalah tindakan operator, nol dari N bukan — dan diterapkan di sini dengan
alasan yang sama.

### 5. Kosakata KOSONG tetap keadaan yang sah

`taksonomi.ts` memperingatkan lalu mengembalikan `[]` untuk 403 atau 404, karena
"CMS Anda mati" dan "redaksi ini tidak memakai kategori" tidak boleh menjadi
peristiwa yang sama. Situs yang menempatkan setiap artikelnya lewat sidecar tetap
terbangun persis seperti sebelum ADR ini.

## Konsekuensi

- Artikel yang ditulis di layar admin awcms, diarsipkan di bawah kategori yang
  dipetakan, membangun halamannya, entri indeks seksinya, dan entri arsipnya.
- `entry.data.kategori` kini membawa tab yang **ditempatkan**, bukan string
  mentah sidecar. Membaca sidecar di sana akan memberi artikel yang ditempatkan
  taksonomi sebuah seksi kosong: breadcrumb-nya tidak menyebut apa pun, dan
  `urutanSeksiTab("")` menjawab `"manual"`, sehingga seksi berita diam-diam
  merender sebagai seksi rujukan.
- `getArticles` menambah satu permintaan berbatas per build (kosakatanya), bukan
  satu per tab dan bukan satu per post. Diasersi PER ENDPOINT di suite kontrak,
  karena hitungan total permintaan adalah angka yang naik satu setiap kali
  seseorang menambah permintaan dan berhenti menjaga apa pun.
- **`buatPost` mendapat varian tanpa sidecar**, dan suite-nya menegaskan varian
  itu terbit. Tanpa itu ADR ini akan menjadi perubahan yang tidak bisa dibuktikan
  apa pun.
- Respons `/blog/terms` yang cacat — `200` tanpa larik `terms` — kini gagal
  dengan pesan yang menyebut endpoint-nya, alih-alih `Spread syntax requires
  ...iterable not be null or undefined` yang dilempar dari dalam adapter.

## Ditolak

- **Membuang sidecar sepenuhnya.** Ia kontrak lintas repo yang tertulis (`awcms`
  ADR-0115 §2) dan punya penulis yang hidup. Menghapusnya akan merusak jalur
  impor legacy yang masih dikapalkan keluarga ini.
- **Jatuh ke taksonomi saat sidecar menyebut tab yang tidak dikenal.** Mengubah
  tab yang diganti nama menjadi pengarsipan ulang diam-diam — sebuah keputusan
  konten yang dibuat oleh bug.
- **Menggagalkan build atas SEMBARANG post yang tak tertempatkan.** Satu salah
  ketik seorang editor akan menghentikan setiap artikel lain terbit.
- **Hanya memperingatkan, tidak pernah menggagalkan.** Peringatan di log CI tidak
  dibaca siapa pun pada hari sebuah situs menerbitkan nol artikel. Kasus nol-dari-N
  harus menghentikan build, atau ADR ini hanya membuat kegagalannya lebih senyap.
