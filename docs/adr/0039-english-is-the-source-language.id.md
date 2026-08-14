🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0039-english-is-the-source-language.md)

<!-- i18n-source-hash: sha256:1fed7310c79945f82ce866b490aab2f0c9d3df8d29ace2e8081f8c773a3640fb -->

# ADR-0039 — Inggris adalah bahasa sumber; Indonesia adalah cerminnya

- **Status:** Accepted
- **Tanggal:** 15 Agustus 2026
- **Terkait:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan tertulis wajib membawa pemeriksanya), [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (postur diikat ke standar yang disebut namanya), `awcms` [ADR-0097](https://github.com/ahliweb/awcms/blob/main/docs/adr/0097-english-is-the-source-language.md) (mekanisme yang diadopsi di sini), `awcms` [ADR-0023](https://github.com/ahliweb/awcms/blob/main/docs/adr/0023-bilingual-docs-indonesian-source-english-default.md) (gerbang kebasian, dan arah yang kelak dibalik)

## Konteks

Setiap dokumen di repo ini berbahasa Indonesia, dan setiap satu di antaranya
duduk di jalur telanjang. Itu tidak pernah menjadi keputusan — ia sekadar tempat
repo ini bermula, dan ia bertahan sementara pembacanya berganti di bawahnya.

Dua hal membuatnya pantas diubah sekarang.

**Pembacanya bukan lagi hanya penulisnya.** `.claude/skills/**` adalah instruksi
operasional yang dibaca agen pengkode, bukan hanya manusia, dan sebuah skill
yang salah dibaca menghasilkan pekerjaan yang salah — bukan sekadar kebingungan.
Hal yang sama berlaku bagi [`AGENTS.md`](../../AGENTS.md), yang merupakan hal
pertama yang dimuat seorang agen dan berisi 815 baris kontrak yang mengikat.

**Keluarganya sudah memilih.** Repo `awcms` — backend konten repo ini sekaligus
system of record keluarga — mengadopsi pola ini di ADR-0023 miliknya dan
membalik arahnya di ADR-0097 setelah mendapati 253 dari 260 dokumennya adalah
prosa Indonesia yang duduk di jalur yang konvensinya sendiri janjikan berbahasa
Inggris. Itu kekeliruan yang bisa repo ini tolak, alih-alih temukan sendiri.

Arahnya adalah bagian yang perlu dijaga hati-hati. Menyimpan sumber dalam bahasa
yang lebih sedikit pembacanya berarti salinan yang benar-benar orang buka adalah
salinan yang dibiarkan menyimpang — karena penanda kebasian mau tak mau tinggal
di sisi yang dibangkitkan.

## Keputusan

1. **Inggris di jalur telanjang `<nama>.md` adalah sumber yang berwenang.** Ia
   ditulis dan disunting tangan, dan itulah yang didapat pembaca atau agen
   secara bawaan. Indonesia di `<nama>.id.md` adalah cerminnya.

2. **Penanda kebasian tinggal di cermin.**
   `<!-- i18n-source-hash: sha256:<hex> -->` berada di `<nama>.id.md` dan
   mencatat hash `<nama>.md`. Gerbangnya MENDETEKSI penyimpangan; ia tidak
   menerjemahkan, dan tidak ada panggilan API terjemahan dari CI. Penerjemahan
   dilakukan tangan pada perubahan yang sama dengan yang membuat cerminnya basi.

3. **Cakupannya setiap dokumen, bukan sebuah pintu depan.** `docs/**`,
   `.claude/skills/**`, `.changesets/README.md`, dan dokumen akar berhuruf besar
   — termasuk `AGENTS.md`. Regex cakupan `awcms` melewatkan `AGENTS.md` miliknya
   sendiri; itu lubang, bukan keputusan, dan ia tidak ikut disalin. Di luar
   cakupan: `CHANGELOG.md` (catatan hanya-tambah tentang apa yang dikatakan pada
   saat dikatakan), changeset satuan (dilipat ke changelog lalu dihapus saat
   rilis, sehingga cerminnya akan hidup lebih lama satu rilis daripada
   sumbernya), dan `graphify-out/**` (dibangkitkan). Predikatnya `isInScope` di
   [`scripts/lib/docs-i18n-checks.mjs`](../../scripts/lib/docs-i18n-checks.mjs),
   dan ia diuji alih-alih ditanam di dalam panggilan git — ADR-0030 berlaku atas
   CAKUPAN sebuah gerbang sama seperti atas gerbangnya.

4. **Migrasinya buku besar yang hanya boleh menyusut, bukan niat.**
   `DOCS_AWAITING_MIRROR` di
   [`scripts/check-docs-translation.mjs`](../../scripts/check-docs-translation.mjs)
   menyebut seluruh 52 dokumen yang tertunggak. Entri dicabut seiring dokumennya
   diterjemahkan; gerbangnya menolak entri yang cerminnya sudah ada, sehingga
   buku besar itu tidak bisa melebih-lebihkan utangnya, dan tidak ada yang boleh
   ditambahkan padanya. **Dokumen yang ditulis setelah ADR ini ditulis dalam
   bahasa Inggris dan dicerminkan pada perubahan yang sama** — ADR ini yang
   pertama, dan ia sengaja tidak ada di buku besar itu.

5. **Cakupan dan kekinian adalah dua pemeriksaan terpisah.** "Apakah cermin ini
   masih seusia sumbernya?" dan "dokumen mana yang belum punya cermin sama
   sekali?" adalah dua pertanyaan berbeda. Dokumen tanpa cermin tidak punya
   pasangan untuk menjadi basi, jadi menggabungkan keduanya akan menghasilkan
   gerbang yang hijau sementara sebagian besar korpusnya belum diterjemahkan.

6. **Tinjauan manusia untuk dokumen yang mengikat.** Gerbangnya membuktikan
   sebuah cermin tidak basi; ia tidak bisa membuktikan cermin itu setia. Pada
   sebuah ADR, atau pada bagian `docs/awcms-astro/` yang menyatakan kebijakan
   yang mengikat, selisih antara "wajib" dan "boleh" memindahkan sebuah
   keputusan — jadi terjemahannya ditinjau manusia sebelum di-merge.

7. **Kode berbahasa Inggris, dan ia tidak dicerminkan.** Komentar, nama, dan
   pesan gerbang berbahasa tunggal. Kode yang ditulis setelah ADR ini ditulis
   dalam bahasa Inggris; nama dan komentar Indonesia yang sudah ada di `src/`,
   `scripts/`, `server/`, dan `tests/` dikonversi terpisah dan tidak diatur buku
   besar di atas. Itu sebabnya
   [`scripts/check-docs-translation.mjs`](../../scripts/check-docs-translation.mjs)
   bernama `audit:translation` sementara ketiga saudaranya tidak — menamainya
   `terjemahan` akan menambah entri keempat pada utang yang ADR yang sama ini
   jadwalkan untuk dilunasi.

## Tiga gerbang yang harus bergerak lebih dulu

ADR ini tidak bisa mendarat sendirian, karena berkas `.id.md` pertama di pohon
akan memerahkan [`scripts/audit-dokumen.mjs`](../../scripts/audit-dokumen.mjs)
dengan alasan yang sama sekali bukan cacat. Ketiganya diperbaiki dalam perubahan
yang membawa ADR ini, masing-masing dengan tes yang membuktikannya MERAH tanpa
perbaikan itu:

1. **Cermin bukan ADR.** Penyaring berkas ADR mencocokkan `^\d{4}-.+\.md$`, dan
   `0038-x.id.md` cocok dengannya. Setiap cermin akan dituntut punya barisnya
   sendiri di indeks ADR, jadi gerbangnya akan memerah pada terjemahan pertama
   alih-alih pada kekeliruan pertama.

2. **Penanda milik repo lain adalah literal berbahasa Indonesia.** Kutipan ADR
   repo lain dimaafkan bila paragrafnya menyebut `awcms`, sebuah tautan github,
   atau frasa "repo rujukan". Dokumen yang diterjemahkan menulis "reference
   repo" — dan tanpa bentuk Inggrisnya ikut diterima, seluruh 325 kutipan yang
   kini dimaafkan di repo ini akan berubah menjadi pelanggaran sekaligus. Itu
   tidak akan terbaca sebagai cacat bahasa; ia akan terbaca sebagai gerbang yang
   benci terjemahan, dan gerbangnya yang akan dilonggarkan.

3. **Cermin yatim tidak boleh memasok nomor ADR.** Sebuah cermin `0042-x.id.md`
   yang sumbernya `0042-x.md` sudah hilang akan membuat setiap kutipan nomor itu
   resolve ke keputusan yang tidak lagi dimiliki repo ini. Cermin yatim ditangkap
   `audit:translation`; yang penting di sini adalah ia tidak bisa diam-diam
   menambal lubang yang gerbang itu ada untuk menemukannya.

   (Sengaja ditulis tanpa bentuk kutipan literalnya — mengejakan nomornya di
   sini justru menjadi rujukan ke keputusan yang tidak ada, dan gerbang ini akan
   menolak ADR yang memerikannya. Ia sudah menolak yang satu ini sekali.)

Perubahan keempat bukan perbaikan melainkan perluasan: gerbang indeks ADR kini
ikut membaca cermin Indonesia indeks itu, bila ada. Hash terjemahan menjaga
sebuah cermin tetap SEUSIA sumbernya; ia tidak menjaganya tetap BENAR terhadap
isi `docs/adr/`. Cermin indeks yang tertinggal satu keputusan akan lolos dengan
hash yang cocok. Karena alasan yang sama kolom status kini menerima kedua bahasa
— pertanyaan gerbang ini adalah apakah tabelnya setuju dengan berkas ADR-nya,
bukan tabel itu berbahasa apa, dan bahasa adalah pertanyaan `audit:translation`.

## Konsekuensi

- **Positif:** berkas yang dibuka setiap pembaca dan setiap agen secara bawaan
  adalah berkas yang berwenang, jadi salinan yang menyimpang adalah salinan yang
  lebih sedikit dibaca orang. Migrasinya terhitung alih-alih menjadi cita-cita,
  dan hitungannya hanya boleh turun.

- **Trade-off, dan ini yang sebenarnya:** setiap perubahan dokumentasi kini
  berbiaya dua tulisan, karena cerminnya wajib diterjemahkan ulang pada
  perubahan yang sama atau CI gagal. Atas 52 dokumen itu pajak permanen, dan ia
  diterima dengan sadar.

- **Trade-off:** penulis repo ini menulis dalam bahasa Indonesia. Menjadikan
  Inggris berwenang meminta mereka menulis dalam bahasa kedua, atau
  menerjemahkan draf mereka sendiri ke depan. Itu ongkos dari membuat salinan
  bawaan menjadi salinan yang berwenang, dan itu sebabnya keputusan 6
  dipertahankan alih-alih dilonggarkan.

- **Netral:** 52 dokumen tetap berbahasa Indonesia di jalur telanjangnya sampai
  entri buku besarnya dicabut. Selama migrasi, konvensinya benar atas sebagian
  yang tumbuh alih-alih atas segalanya — bedanya dari tidak melakukan apa pun
  adalah bahwa ia kini terhitung.

- **Netral:** `*.id.md` dikecualikan dari graf pengetahuan di `.graphifyignore`.
  Sebuah cermin menceritakan ulang sumbernya kata demi kata, jadi mengindeks
  keduanya akan memasukkan setiap konsep dua kali dan menghasilkan dua komunitas
  bertetangga yang akan diberi nama sama oleh pemberi nama otomatis — yang sudah
  ditolak `bun run audit:graf`.

## Ditolak

- **Menerjemahkan semuanya dalam satu perubahan** — ditolak. 8.700 baris tanpa
  jalur tinjauan bertahap, atas korpus yang sebuah ADR salah terjemah di
  dalamnya memindahkan keputusan yang mengikat. Repo `awcms` menolak pilihan
  yang sama dengan alasan yang sama.

- **Mempertahankan Indonesia sebagai sumber dan membangkitkan Inggris** —
  ditolak, dan inilah pilihan yang repo ini akan hanyut ke dalamnya. Penandanya
  lalu tinggal di sisi yang dibangkitkan, yang membuat salinan yang dilihat
  sebagian besar pembaca dan seluruh agen menjadi salinan yang boleh basi. Repo
  `awcms` menjalankannya begitu lalu membalikkannya.

- **Satu berkas dengan seksi per bahasa** — ditolak: setiap berkas menjadi dua
  kali panjangnya, diff berhenti terbaca per bahasa, dan pemeriksaan kebasian
  berbasis hash tidak punya apa pun yang bersih untuk di-hash.

- **Pohon `docs/en/**` sejajar** — ditolak: `README.md` akar wajib tinggal
  persis di jalur itu agar GitHub merendernya, jadi skema direktori tidak bisa
  menutupi satu dokumen dengan pembaca terbanyak.
