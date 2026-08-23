🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0042-a-byline-is-the-first-per-person-data-this-template-publishes.md)

<!-- i18n-source-hash: sha256:22373a14df507d52f048a55468ecd890512ec99fe1f7c1e7a0edd36776ce18c0 -->

# ADR-0042 — Byline adalah data per-orang PERTAMA yang diterbitkan template ini, dan yang berubah adalah sebuah kewajiban, bukan sebuah aturan

- **Status:** Diterima
- **Tanggal:** 23 Agustus 2026
- **Menggantikan:** tidak ada. Mengonsumsi `awcms` ADR-0109 dan menyempitkan satu kalimat yang dinyatakan tiga dokumen di repo ini sebagai sebuah properti.

## Konteks

`awcms` ADR-0109 (Issue #597 butir 4 di sana) menambahkan `authorByline` pada
baris post. Ia OPT-IN: penulisnya sendiri yang mengisinya lewat
`PATCH /api/v1/auth/profile`, `NULL` adalah keadaan setiap baris yang sudah ada
sebelum ADR itu, dan `NULL` berarti artikelnya tetap beratribusi tingkat
organisasi. Ia sengaja **bukan** nama tampilan akun penulis — menerbitkan nama
itu karena seseorang menekan Terbitkan adalah permukaan PII yang ditolak dibuka
`awcms` Issue #649.

Ia tiba lewat `GET /api/v1/blog/posts?view=full`, yang **sudah** dipanggil build
ini. Jadi mengonsumsinya tidak menambah satu pun permukaan pada daftar yang
dikeraskan [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs),
dan gerbang itu tidak berubah warna. Itulah yang membuat keputusan ini murah
diterapkan — dan justru karena itu ia perlu dituliskan: perubahan yang tidak
bisa dilihat gerbang mana pun adalah perubahan yang tidak dipaksa dibaca siapa
pun.

**Tiga dokumen di repo ini menyatakan, sebagai sebuah properti, bahwa template
ini menerbitkan nol data per-orang.** Ketiganya menyebut dua bukti yang sama:
`author` JSON-LD adalah `Organization`, dan `<author>` feed adalah nama situs.
Dua di antaranya melanjutkan dengan apa yang akan berlaku bila itu berubah —
*"situs yang menambah byline, avatar, atau komentar mengambil kewajibannya, dan
jalur penghapusannya berakhir di sebuah rebuild"* — dan kalimat itulah yang
ditindaklanjuti ADR ini.

## Keputusan 1 — byline dirender, pada ketiga permukaan yang menyebut penulis

Halaman artikel (`✍️ Ditulis oleh …`), `author` JSON-LD, dan entry artikel itu
di feed Atom. Bukan satu atau dua di antaranya.

Feed yang mengkredit organisasi sementara halamannya mengkredit seseorang adalah
dua jawaban atas satu pertanyaan, dan pelanggan feed hanya melihat salah
satunya. Ketiga permukaan itu karena itu disuapi **satu field pada satu baris** —
`LocalizedArticle.authorByline` — alih-alih masing-masing memutuskan sendiri.

## Keputusan 2 — yang tidak ada tetap tidak ada, dan tidak diganti apa pun

`NULL`, field yang hilang (sebuah `awcms` yang mendahului ADR-0109), dan nilai
yang hanya berisi spasi, ketiganya tiba di renderer sebagai `undefined`, dan
`undefined` merender **tidak ada baris byline sama sekali** — bukan baris yang
membawa nama penerbit.

Inilah separuh keputusan yang memikul beban. Penulis yang tidak pernah memilih
byline sudah membuat sebuah pilihan, dan template yang mengisi kekosongan itu
dengan nama organisasi akan mencetak baris atribusi yang terbaca sebagai nama
seseorang. Feed Atom mendapatkannya gratis dan itu pantas disebut: RFC 4287
§4.2.1 menyatakan `<author>` tingkat feed berlaku bagi setiap entry yang tidak
punya sendiri, jadi entry tanpa byline sudah beratribusi organisasi tanpa satu
byte pun ditulis untuknya.

## Keputusan 3 — simpul `Person` membawa NAMA dan tidak membawa apa pun lagi

Tanpa `@id`, tanpa `url`, tanpa `sameAs` di JSON-LD; tanpa `<uri>`, tanpa
`<email>` di feed. Kedua format punya tempat untuk semuanya.

Byline adalah kredit atas satu tulisan. Sebuah pengenal atau tautan profil
mengubahnya menjadi identitas yang bisa diikuti lintas artikel dan lintas
situs — sesuatu yang tidak diminta siapa pun dengan mengisi satu kolom nama.
Menambahkannya kelak adalah beberapa karakter yang akan lolos setiap gerbang
lain, jadi penolakannya ditegaskan di
[`tests/schema.test.mjs`](../../tests/schema.test.mjs) dan
[`tests/feed.test.mjs`](../../tests/feed.test.mjs), bukan dibiarkan sebagai
prosa.

## Keputusan 4 — byline dibaca dari baris TERJEMAHAN, bukan dari baris sumber

Ini berbeda dari `termIds`, `urutan`, dan `kategori`, yang sengaja dibaca
[`src/lib/content.ts`](../../src/lib/content.ts) dari post sumber supaya
penerjemah yang membiarkan klasifikasinya kosong tidak bisa menjatuhkan sebuah
artikel keluar dari arsip satu bahasa saja.

Kepenulisan bukan klasifikasi. Terjemahan sering ditulis orang lain, dan
mengambil nama penulis sumber untuknya mengkredit seseorang atas teks yang tidak
ia tulis. `publishedDate`, `updatedDate`, dan gambar utama dibaca dari baris yang
sama karena alasan yang sama.

Artikel **fallback** — yang ditampilkan di locale yang tidak punya
terjemahannya — adalah post sumber yang ditampilkan di tempat lain, jadi ia
membawa byline penulis sumber. Itu bukan pengecualian terhadap keputusan ini;
itu aturan yang sama sampai pada jawaban yang sama.

## Keputusan 5 — properti "nol data per-orang" DIPENSIUNKAN, dan kewajiban di baliknya kini hidup

Ketiga dokumen yang menyatakannya dikoreksi alih-alih dibiarkan berdiri diam,
karena dokumen yang memerikan properti yang tidak lagi dimiliki kode mengirim
pembaca berikutnya mencari sebuah cacat, bukan membaca sebuah keputusan.

Yang menggantikannya adalah kewajiban yang sudah dieja dokumen-dokumen itu
sendiri:

- **Situs statis memegang SALINAN.** Penghapusan atau anonimisasi yang dijalankan
  di `awcms` tidak menyentuh berkas yang sudah terbit sampai build berikutnya,
  dan salinan yang sudah tersebar bisa hidup lebih lama lagi (cache CDN, riwayat
  git `dist/` bila sebuah situs meng-commit keluarannya).
- **Jadi jalur penghapusan repo ini berakhir di sebuah REBUILD**, dan situs yang
  menerbitkan byline harus bisa memicunya. Ini dinyatakan, bukan digerbangi:
  tidak ada apa pun di repo ini yang bisa mengamati sebuah penghapusan di
  `awcms`.
- **Lingkupnya dibatasi oleh opt-in itu.** Satu-satunya data per-orang yang bisa
  diterbitkan template ini adalah nama yang seseorang pilih untuk diterbitkan,
  pada artikel yang ia tulis. Tanpa alamat surel, tanpa pengenal, tanpa avatar,
  tanpa URL profil — Keputusan 3 yang menjaga daftar itu tidak bertambah tanpa
  sengaja.

### Yang TIDAK berubah

*"Tidak mengumpulkan data pribadi pembaca"* di `AGENTS.md` §Keamanan tidak
tersentuh dan merupakan aturan yang berbeda. Yang itu tentang orang-orang yang
**membaca** situs ini — tanpa form, tanpa analitik yang mengikat identitas, tanpa
skrip pihak ketiga. Byline adalah data tentang orang yang **menulis** artikelnya,
diterbitkan atas permintaannya sendiri. Membaca keduanya sebagai satu aturan akan
melarang sesuatu yang tidak dikeberatkan siapa pun atau mengizinkan sesuatu yang
dilakukan semua orang.

## Konsekuensi

- Satu kunci PO di setiap katalog locale (`artikel.penulis`), dipanggil dengan
  katalog sebagai satu-satunya sumber labelnya.
- `tests/schema.test.mjs` mendapat cabang `Person`/`Organization` dan assertion
  "nama dan tidak lebih"; tes yang berbunyi *"author selalu ada, dan ia
  ORGANISASI"* **diganti namanya** alih-alih dihapus, supaya ia berhenti terbaca
  sebagai larangan atas perilaku yang justru sengaja ditambahkan.
- `tests/kontrak-awcms.test.mjs` mendapat lima kasus adapter — termasuk kasus
  terjemahan-vs-sumber, dibuktikan lewat mutasi, karena membalik baris itu lolos
  typecheck dan lolos setiap gerbang lain.
- Tidak ada permukaan `awcms` baru, jadi daftar permukaan yang dikeraskan tidak
  berubah. Ini pantas dibaca ulang sebelum field berikutnya datang: daftar itu
  menjaga **endpoint mana** yang dipanggil, dan tidak mengatakan apa pun tentang
  apa yang dikembalikan endpoint itu. Respons yang bertambah field adalah
  perubahan yang bisa dikonsumsi repo ini dalam diam.
