---
name: awcms-astro-gerbang
description: Empat gerbang awcms-astro (check, test, audit:konten, audit:dokumen) — apa yang ditangkap masing-masing, apa yang TIDAK, dan aturan bahwa setiap aturan baru wajib membawa pemeriksanya. Gunakan sebelum PR, saat menambah aturan ke dokumen, atau saat sebuah gerbang merah dan sebabnya tidak jelas.
---

# awcms-astro — gerbang

Empat perintah, dan tiap satunya menangkap kelas cacat yang **tidak
menggagalkan apa pun** saat terjadi. Itu alasan keempatnya ada.

```bash
bun run check           # lockfile + astro check    — tanpa build, tanpa jaringan
bun test                # unit + kontrak + penyaji  — lapis penyaji melewati diri tanpa dist/
bun run audit:konten    # sumber gambar + KELUARAN build
bun run audit:dokumen   # markdown repo ini         — tanpa build, tanpa jaringan
```

## Yang ditangkap masing-masing

| Gerbang | Kelas cacat |
| --- | --- |
| `check` | Tipe, props, impor putus, lockfile milik proyek lain |
| `bun test` | Paritas katalog PO, kontrak `awcms` (traversal, media, kartu), header + cache penyaji, CSP atas keluaran |
| `audit:konten` | Rasio gambar terhadap `--ratio-visual`, format dibaca dari ISI berkas, judul/canonical/hreflang, aset yang dijanjikan metadata, tautan mati, sitemap, nama key bocor ke layar |
| `audit:dokumen` | Tautan markdown mati, indeks ADR lengkap dua arah, status ADR setuju dengan berkasnya, daftar permukaan kilau, jalur berkas yang disebut dokumen |

## Yang TIDAK ditangkap — dan disebut supaya tidak dikira terjaga

- **Dua aturan gambar** di `AGENTS.md` (teks dalam gambar hanya label topik;
  tanpa lambang instansi negara) — tidak bisa diperiksa mesin, selamanya manual.
- **Gerbang keluaran `audit:konten`** melewati dirinya tanpa `dist/`, dan
  **mengatakannya**. Di repo template itu normal; di sebuah SITUS itu berarti
  gerbangnya tidak berjalan.
- **Lapis penyaji `bun test`** melewati dirinya tanpa `dist/`, dengan alasan
  yang sama.
- **URL eksternal dan anchor** di `audit:dokumen` — yang pertama butuh jaringan
  (gerbang yang merah karena situs pihak ketiga mati akan diabaikan orang), yang
  kedua berarti menebak slugifikasi heading GitHub.

## Aturan yang mengikat: aturan baru wajib membawa pemeriksanya

Repo ini sudah menemukan **lima** dokumen yang menyatakan sesuatu yang tidak ada,
dan tak satu pun memerahkan apa pun:

1. Indeks ADR mendaftarkan enam keputusan yang tak pernah ada di sini.
2. `getArticleImage` mengembalikan `undefined` tanpa syarat dan tiga pemanggilnya
   tak pernah membacanya.
3. Tabel permukaan kilau mendaftarkan `.wilayah-filter-btn` yang tak pernah ada —
   di dokumen yang **meramalkan sendiri** ia akan menyimpang.
4. Checklist repo baru menyuruh menyiapkan lima jalur yang tidak ada.
5. `og:image:alt` memerikan gambar yang berbeda dari `og:image`.

Tiga di antaranya kini digerbangi `audit:dokumen`. **Menulis aturan tanpa
pemeriksanya adalah menambah calon nomor enam.**

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
- **Pengecualian wajib menyebut MILIK SIAPA.** `JALUR_DIKECUALIKAN` memuat jalur
  milik `awcms` dan repo rujukan; "belum dibuat" bukan alasan yang sah — itu
  justru yang gerbang ini cari.

## Definition of Done

Ada di [`AGENTS.md`](../../../AGENTS.md) §Definition of Done. Yang paling sering
terlewat: `bun run audit:konten` **setelah** build (bukan sebelum), dan menambah
ADR berarti menambah barisnya di
[`docs/adr/README.md`](../../../docs/adr/README.md).
