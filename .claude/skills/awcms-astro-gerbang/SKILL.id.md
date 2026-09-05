---
name: awcms-astro-gerbang
description: Sembilan gerbang awcms-astro (check, test, audit:konten, audit:dokumen, audit:graf, audit:translation, audit:serapan, audit:aset, audit:rilis) — apa yang ditangkap masing-masing, apa yang TIDAK, dan aturan bahwa setiap aturan baru wajib membawa pemeriksanya. Gunakan sebelum PR, saat menambah aturan ke dokumen, atau saat sebuah gerbang merah dan sebabnya tidak jelas.
---

🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SKILL.md)

<!-- i18n-source-hash: sha256:761e3de0ea2be9060be29578e18abd098dee1a510738469e77acf8020d529ba0 -->

# awcms-astro — gerbang

Sembilan perintah, dan tiap satunya menangkap kelas cacat yang **tidak
menggagalkan apa pun** saat terjadi. Itu alasan kesembilannya ada.

```bash
bun run check             # lockfile + astro check      — tanpa build, tanpa jaringan
bun test                  # unit + kontrak + penyaji    — lapis penyaji melewati diri tanpa dist/
bun run audit:konten      # sumber gambar + KELUARAN build
bun run audit:dokumen     # markdown repo ini           — tanpa build, tanpa jaringan
bun run audit:translation # cermin basi + cakupan cermin — tanpa build, tanpa jaringan
bun run audit:graf        # artefak graphify-out/       — melewati diri bila direktorinya tak ada
bun run audit:serapan     # ADR awcms yang belum dibaca — satu-satunya gerbang yang MELIHAT KE LUAR; pemeriksaan 2 dilewati tanpa jaringan
bun run audit:aset        # anggaran byte pembaca       — lapis keluaran melewati diri tanpa dist/client
bun run audit:rilis       # backlog changeset menunggu  — tanpa build, tanpa jaringan
```

## Yang ditangkap masing-masing

| Gerbang | Kelas cacat |
| --- | --- |
| `check` | Tipe, props, impor putus, lockfile milik proyek lain |
| `bun test` | 40 berkas. Paritas katalog PO; kontrak `awcms` (traversal, media, kartu) dan **permukaan yang dipanggil build**; **PERAN repo** (`tests/peran-situs.test.mjs`, ADR-0034); **TANPA backend** (`tests/tanpa-backend.test.mjs`, ADR-0038 — dependency kelas backend, jalur tulis, artefak persistensi); **TANPA runtime Node.js** (`tests/runtime-bun.test.mjs`, ADR-0050 — scripts package.json, CI, Dockerfile, shebang, dengan bawaan `node:*` dan keputusan mempertahankan `@astrojs/node`/`compression` dinyatakan sengaja); **kosakata `news`** (`tests/kosakata-news.test.mjs`, ADR-0036); feed Atom (`tests/feed.test.mjs`, ADR-0035); dua tanggal terpisah (`tests/tanggal.test.mjs`, ADR-0033); header + cache penyaji; CSP atas keluaran; **versi toolchain** termasuk pin TypeScript (ADR-0037); SBOM; CWV lab; analisis statik; schema; seni lokal; renderer blok; rilis terkondisi; logika pemeriksa terjemahan (`tests/docs-i18n-checks.test.mjs`, ADR-0039); **lantai lebar 360px** (`tests/lebar-360.test.mjs` — padding `.container` sendiri menurunkan lebar bersih pada lantai itu, dan tidak ada `minmax(…)` angka tetap atau `width`/`min-width` tetap di `src/styles/global.css` yang boleh mencapainya tanpa jalan keluar `min(…, 100%)`, media query khusus layar lebar, atau `overflow-x` pada dirinya sendiri; lahir dari `.grid-cards` yang duduk persis di lebar itu dengan sisa nol — gerbang statik atas teks CSS, jadi tidak bisa membuktikan keamanan render sungguhan seperti pemeriksaan `scrollWidth` headless-browser atas halaman yang sudah dibangun); plus 6 meta-tes yang menjalankan ulang enam dari tujuh skrip audit atas repo ini DAN atas pohon fixture (`audit:translation` yang ketujuh; logikanya digerbangi `tests/docs-i18n-checks.test.mjs`). **Kedua hitungan di baris ini diperiksa terhadap repo oleh `tests/documented-counts.test.mjs`.** Keduanya berbunyi 21 dan tiga sampai 28 Agustus 2026, hanyut satu berkas demi satu berkas seiring gerbang bertambah — dan itulah sebabnya keduanya digerbangi, bukan sekadar dikoreksi |
| `audit:konten` | Rasio gambar terhadap `--ratio-visual`, format dibaca dari ISI berkas, judul/canonical/hreflang, aset yang dijanjikan metadata, tautan mati, sitemap, **setiap `.xml` di keluaran** (feed Atom sah, atau pelanggaran), nama key bocor ke layar |
| `audit:dokumen` | Tautan markdown mati, indeks ADR lengkap dua arah, status ADR setuju dengan berkasnya, daftar permukaan kilau, jalur berkas yang disebut dokumen, **kutipan `ADR-NNNN` yang resolve ke berkasnya** |
| `audit:translation` | Cermin basi (sebuah `.id.md` yang hash tercatatnya tidak lagi cocok dengan sumber Inggrisnya), cermin yatim yang sumbernya hilang, dokumen tanpa cermin yang tidak ada di buku besar yang hanya boleh menyusut, dan entri buku besar yang cerminnya kini ada (ADR-0039) |
| `audit:graf` | Artefak `graphify-out/` terlacak di luar keempat keluaran bersama, laporan yang tidak sepakat dengan `graph.json`, **nama komunitas yang tidak dipilih** (nama berkas, placeholder, kembar, atau berbeda antar-artefak), korpus yang mengabaikan `.graphifyignore` |
| `audit:serapan` | Sebuah ADR `awcms` tanpa vonis di buku besar serapan, nomor yang bolong antara lantai yang dinyatakan dan nomor tertinggi yang didaftarkan, jumlah `belum` di atas plafonnya, dan — satu-satunya pemeriksaan yang MELIHAT KE LUAR di repo ini — keputusan yang terbit di `ahliweb/awcms` yang belum dibaca siapa pun di sini |
| `audit:aset` | Sebuah `<script>` sumber atau berkas `public/**` di atas plafon sumber, dan — bila `dist/client` ada — byte yang benar-benar ditarik satu halaman, disebut per berkas (ADR-0044; `awcms` ADR-0101 separuh keluarga lainnya). **Baca pelanggarannya sebagai pertanyaan tentang aturan itu ada di BERKAS mana sebelum memperlakukannya sebagai plafon yang harus dinaikkan**: pada 2 September 2026 ia memerahkan `/cari/` atas CSS hero yang duduk di `src/styles/global.css` sementara satu komponen memakainya, dan memindahkan blok itu memulangkan 1.853 B ke setiap halaman. Plafonnya sendiri adalah pengukuran berikut ruang di atasnya, dicatat di dalam skripnya di sebelah angkanya |
| `audit:rilis` | Backlog changeset menunggu di atas 12 berkas atau lebih tua dari 14 hari, dan changeset yang namanya tidak membawa tanggal `YYYY-MM-DD-` yang bisa dipakai — termasuk tanggal yang tidak ada di kalender dan tanggal lebih dari sehari di depan ([ADR-0048](../../../docs/adr/0048-a-release-is-cut-when-the-backlog-crosses-a-bound.id.md)) |

## Yang TIDAK ditangkap — dan disebut supaya tidak dikira terjaga

- **Dua aturan gambar** di `AGENTS.md` (teks dalam gambar hanya label topik;
  tanpa lambang instansi negara) — tidak bisa diperiksa mesin, selamanya manual.
- **Gerbang keluaran `audit:konten`** melewati dirinya tanpa `dist/`, dan
  **mengatakannya**. Di repo template itu normal; di sebuah SITUS itu berarti
  gerbangnya tidak berjalan. Sejak 6 Agustus 2026 yang dilewati hanyalah
  **jalannya atas situs sungguhan**: logika tiap keluarga sudah dibuktikan
  `tests/audit-konten.test.mjs` atas pohon fixture, jadi skripnya tidak bisa
  lagi berhenti memeriksa diam-diam di repo yang tidak pernah membangun.
- **Lapis penyaji `bun test`** melewati dirinya tanpa `dist/`, dengan alasan
  yang sama.
- **URL eksternal dan anchor** di `audit:dokumen` — yang pertama butuh jaringan
  (gerbang yang merah karena situs pihak ketiga mati akan diabaikan orang), yang
  kedua berarti menebak slugifikasi heading GitHub.
- **Apa yang DIMUAT sebuah cermin.** `audit:translation` menjaga cermin tetap
  SEUSIA sumbernya: hash yang cocok membuktikan ia diterjemahkan ulang saat
  sumbernya terakhir berubah, bukan bahwa ia menyatakan hal yang sama. Jebakan
  serumpunnya ada di sisi sebaliknya, dan sudah pernah terjadi — sebuah gerbang
  yang membaca dokumen mencari sebuah frasa membaca SALAH SATU dari dua berkas.
  Pada 15 Agustus 2026 `tests/peran-situs.test.mjs` tetap hijau atas `AGENTS.md`
  yang sudah diterjemahkan, bukan karena prosanya masih menyatakan bawaan
  publik, melainkan karena sebuah nama berkas di dalam tautan kebetulan memuat
  kata yang ia cari. Gerbang yang membaca prosa wajib menyebut berkas **yang
  mana**, dan menyebutnya dalam bahasa berkas itu.
- **PROSA.** Keenam gerbang `audit:dokumen` membaca STRUKTUR — tautan, tabel
  indeks dua arah, kolom status, blok bertanda, span kode, dan kutipan
  `ADR-NNNN`. Tidak satu pun membaca kalimat. Sebuah kalimat biasa yang
  menyatakan sesuatu yang tidak ada lolos seluruhnya, dan itu bukan hipotesis: gerbang
  permukaan kilau menghapus `.wilayah-filter-btn` dari tabel bertanda pada 3
  Agustus 2026, dan **salinannya di paragraf tiga puluh baris di atas tabel itu
  bertahan sampai 4 Agustus**. Nama yang sama, dokumen yang sama, gerbang yang
  dibuat khusus untuknya.
- **Kolom "Keadaan" di `docs/awcms-astro/standar-performa-dan-keamanan.md`.**
  Sebuah baris bisa berbunyi "Terpenuhi" setelah kontrolnya dicabut, dan tidak
  ada yang akan merah. Itu biaya yang ADR-0028 nyatakan menerimanya.
- **Prosa di dalam skill maupun docs.** Sama seperti di atas: gerbang membaca
  struktur — dengan **satu pengecualian yang disengaja**, ditambahkan 28 Agustus
  2026. `tests/documented-counts.test.mjs` membaca dua ANGKA dari baris
  `bun test` di atas dan membandingkannya dengan isi `tests/` yang sebenarnya.
  Sebuah angka adalah satu-satunya jenis klaim yang bisa dibuat sebuah kalimat
  dan bisa diselesaikan pemeriksa tanpa memahami kalimatnya, dan kedua angka itu
  sudah hanyut menjadi 21 dan tiga sementara seluruh gerbang tetap hijau. Ia
  tidak membaca sisa barisnya, dan tidak mengatakan apa pun tentang benar
  tidaknya kalimat di sekitar angka itu.
- **Kesegaran graf, dan mutu nama komunitas di luar bentuknya.** `audit:graf`
  MELAPORKAN selisih `built_at_commit` ke `HEAD` tanpa pernah memerahkannya —
  memerahkannya berarti tiap PR yang menyentuh berkas terindeks wajib membawa
  rebuild bermegabyte, dan gerbang semahal itu akan dilonggarkan dalam sebulan.
  Ia juga bisa membuktikan sebuah label BUKAN nama berkas, tetapi tidak bisa
  menilai apakah namanya baik untuk komunitasnya. Penamaan tetap pekerjaan
  pembaca; yang dijaga hanya bahwa pekerjaan itu benar-benar dilakukan.
- **Paragraf penanda kutipan ADR.** Sejak 5 Agustus 2026 kutipan `ADR-NNNN`
  DIPERIKSA resolve ke `docs/adr/NNNN-*.md` (aturan 2 `awcms`
  [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md)),
  dan kutipan milik repo lain dilewati bila paragrafnya memuat penanda —
  `awcms`, "repo rujukan", atau tautan github. Yang TIDAK bisa dinilai gerbang:
  apakah penandanya jujur. Kutipan `awcms` yang nomornya kelak kembar dengan
  ADR lokal akan diterima lewat jalur resolusi lokal, dan kutipan lokal yang
  salah ketik DI DEKAT kata `awcms` akan lolos sebagai milik tetangga. Bila itu
  terjadi, bentuk penulisannya yang diperbaiki — bukan gerbangnya dilonggarkan.
- **Apakah sebuah rilis sedang berjalan.** `audit:rilis` membaca `.changesets/`
  dan tidak lebih, jadi ia tetap merah sepanjang umur sebuah pull request rilis
  dan baru menghijau saat PR itu mendarat dan changeset-nya terlipat. Ia juga
  tidak bisa menilai apakah entrinya layak dirilis — besar sebuah rilis datang
  dari `bump` (ADR-0040), dan apakah prosa di bawahnya bagus bukan gerbang siapa
  pun.

## Aturan yang mengikat: aturan baru wajib membawa pemeriksanya

Repo ini sudah menemukan **sebelas** dokumen yang menyatakan sesuatu yang tidak
ada, dan tak satu pun memerahkan apa pun:

1. Indeks ADR mendaftarkan enam keputusan yang tak pernah ada di sini.
2. `getArticleImage` mengembalikan `undefined` tanpa syarat dan tiga pemanggilnya
   tak pernah membacanya.
3. Tabel permukaan kilau mendaftarkan `.wilayah-filter-btn` yang tak pernah ada —
   di dokumen yang **meramalkan sendiri** ia akan menyimpang.
4. Checklist repo baru menyuruh menyiapkan lima jalur yang tidak ada.
5. `og:image:alt` memerikan gambar yang berbeda dari `og:image`.

Enam berikutnya ditemukan 4 Agustus 2026, seluruhnya dalam satu pembacaan
([ADR-0028](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)):

6. **PROSA yang sama dengan nomor 3.** `.wilayah-filter-btn` masih disebut di
   paragraf tiga puluh baris di atas tabel yang gerbangnya sudah bersihkan.
7. `integrasi-awcms.md` berbunyi "Adapter belum ada" sementara 120 baris di
   bawahnya berbunyi "perpindahan itu sudah terjadi". Dua kalimat, satu berkas,
   saling membantah — dan yang salah adalah yang dibaca lebih dulu.
8. `standar-teknis.md` mewajibkan `<Image>` dari `astro:assets` dan melarang
   `<img>` mentah, sementara ADR-0024 memutuskan sebaliknya **dan tabel di
   berkas yang sama** menuliskan keputusan itu.
9. `standar-teknis.md` mewajibkan kartu share PNG dan melarang WebP, sementara
   ADR-0026 membuat kartu artikel membawa MIME-nya sendiri dari media `awcms`.
10. `standar-teknis.md` dan `ui-ux-design-system.md` menyebut tema dipasang
    "skrip inline sebelum paint" — yang sejak ADR-0019 justru **mati** di
    browser pembaca.
11. `standar-teknis.md` mewajibkan tiga dokumen yang repo rujukan standar itu —
    repo ini sendiri — tidak membawa satu pun.

Empat kelas kini digerbangi `audit:dokumen`. Sisanya prosa, dan prosa tidak bisa
digerbangi. **Menulis aturan tanpa pemeriksanya adalah menambah calon nomor dua
belas.**

### Lima aturan yang tertulis TANPA pemeriksa — empat ditemukan 4 Agustus 2026, yang kelima 14 Agustus

Bentuk yang berbeda dari sebelas di atas, dan lebih sunyi: bukan dokumen yang
menyatakan sesuatu yang tidak ada, melainkan **aturan yang benar dan tidak
pernah diperiksa siapa pun**. Keempat yang pertama kini digerbangi
([ADR-0030](../../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)),
dan yang kelima oleh
[ADR-0038](../../../docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md):

| Aturan, dan sejak kapan tertulis | Yang menemukannya | Pemeriksanya sekarang |
| --- | --- | --- |
| Versi Bun sama di **lima** nilai (`AGENTS.md` menghitung tiga BERKAS) | `grep -rln "packageManager\|bun-version" tests/ scripts/` → nol | `tests/versi-toolchain.test.mjs` |
| `bun test` + `bun audit` wajib sebelum rilis (**empat** dokumen menuntutnya) | Membaca `scripts/rilis.mjs` sampai habis | Perilis menjalankan keduanya, **sesudah** build |
| Daftar permukaan `awcms` yang dipanggil build | `awcms` mencatat enam, kode memanggil tiga | `tests/kontrak-awcms.test.mjs`, dua arah terhadap tabel bertanda di skill integrasi |
| Pin rantai pasok ke SHA/digest (celah 6 ADR-0028) | Sudah tercatat, belum dikerjakan | Pin + gerbang versi yang menjaganya |
| "`awcms` adalah backend, repo ini tidak menyimpan apa pun" (tertulis sejak ADR-0020, dalam bentuk negatif di enam berkas) | Ditanyakan dari luar: ke mana sebuah kebutuhan backend PERGI? Tidak satu berkas pun menjawabnya, dan tidak satu gerbang pun membaca `package.json` menurut kelas paketnya | `tests/tanpa-backend.test.mjs` ([ADR-0038](../../../docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md)) |

**Pelajarannya bukan "tulis lebih banyak gerbang".** Ketiga yang pertama sudah
punya kalimat yang tegas, sebagian dengan kata **wajib**, dan ketegasan itulah
yang membuat semua orang mengira ada yang memeriksanya. Saat menambah aturan,
pertanyaan yang menentukan bukan "apakah ini benar" melainkan **"perintah apa
yang berubah merah bila ini dilanggar?"** Bila jawabannya tidak ada, aturan itu
belum mendarat — ia baru ditulis.

### Yang membuat nomor 7–11 mungkin, dan cara menghindarinya

Kelimanya punya bentuk yang sama: sebuah kalimat yang **benar saat ditulis**,
lalu sebuah ADR mengubah kodenya, lalu kalimatnya tidak ikut. Ia tidak pernah
salah ketik — ia menua.

Yang menangkapnya bukan gerbang melainkan kebiasaan: **saat sebuah ADR
mendarat, grep nama benda yang ia ubah di seluruh markdown.** ADR-0024 mengubah
cara gambar dirender; `grep -rn "astro:assets" docs/` akan menemukan nomor 8
dalam satu detik pada hari ADR itu ditulis.

## Menambah pemeriksa ke `audit:konten`

Skripnya **tidak** menerima akar sebagai argumen — ia membaca direktori kerja.
`tests/audit-konten.test.mjs` karena itu menjalankannya dengan `cwd` sebuah
pohon fixture, bukan dengan bendera uji: sebuah mode yang hanya hidup di tes
adalah jalur kode yang tidak pernah dipakai situs mana pun.

Fixture minimalnya tiga berkas — `src/config/site.ts` (locale),
`src/styles/global.css` (`--ratio-visual`), dan satu halaman di
`dist/client/` — karena skripnya membaca ketiganya sebelum gerbang apa pun
jalan. Menambah gerbang berarti menambah **dua** kasus: merah saat cacatnya
ada, hijau saat tidak. Lalu buktikan tesnya bukan hiasan: mutasi barisnya di
skrip dan pastikan tepat kasus itu yang merah. Dua kali cara itu menemukan
lubang di tes yang sudah hijau — cabang `image` JSON-LD yang tidak pernah
diuji, dan satu penyaring skema yang ternyata tidak bisa dimutasi sama sekali.

**Sebuah keluarga yang tidak akan pernah menemukan berkas di sini tetap wajib
dibuktikan di sini.** Keluarga feed (ADR-0035) memindai `**/*.xml` di keluaran,
dan template menyatakan nol seksi berita — jadi ia tidak akan pernah menemukan
satu berkas pun, bahkan seandainya repo ini punya sumber konten. Pohon fixture
adalah satu-satunya tempat ia berjalan, dan mutasinya adalah satu-satunya bukti
bahwa ia masih memeriksa sesuatu (16 mutasi, 16 tes berbeda merah). Pola yang
sama berlaku untuk keluarga berikutnya yang bergantung pada konfigurasi yang
tidak dipakai template.

## Menambah pemeriksa ke `audit:dokumen`

Skripnya menerima akar sebagai argumen (`bun scripts/audit-dokumen.mjs <akar>`),
dan itu yang membuat `tests/audit-dokumen.test.mjs` bisa membuktikan tiap
gerbang **dua arah**: MERAH saat cacatnya ada, HIJAU saat tidak, atas pohon
fixture sungguhan.

Dua jebakan yang sudah ditemukan:

- **Pemeriksa yang hanya benar untuk repo INI tidak boleh tinggal di skrip.**
  Draf pertama pemeriksaan "pengecualian yang membusuk" ditaruh di skrip dan
  membuat 10 dari 25 tes merah — bukti langsung ia berhenti benar di luar repo
  ini, yaitu keadaan setiap situs turunan template ini. Ia pindah ke tesnya.
  (Angka 10-dari-25 itu **historis**, dari hari kejadiannya; berkas tesnya kini
  32 tes. Ia tidak disegarkan karena yang diceritakan peristiwanya, bukan
  keadaan hari ini.)
- **Pengecualian wajib menyebut MILIK SIAPA.** `JALUR_DIKECUALIKAN` memuat jalur
  milik `awcms` dan repo rujukan; "belum dibuat" bukan alasan yang sah — itu
  justru yang gerbang ini cari.

## Definition of Done

Ada di [`AGENTS.md`](../../../AGENTS.md) §Definition of Done. Yang paling sering
terlewat: `bun run audit:konten` **setelah** build (bukan sebelum), dan menambah
ADR berarti menambah barisnya di
[`docs/adr/README.md`](../../../docs/adr/README.md).
