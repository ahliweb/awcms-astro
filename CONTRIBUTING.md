# Panduan Kontribusi

Terima kasih sudah berniat membantu. Sebelum apa pun, satu hal yang membentuk seluruh aturan di bawah:

**Situs ini memuat tarif resmi, syarat dokumen, dan ancaman denda.** Kesalahan isinya ditanggung pembaca langsung di loket layanan atau di jalan. Karena itu banyak aturan di sini terasa lebih ketat daripada proyek web pada umumnya — dan memang begitu maksudnya.

Kontributor agen AI: baca [`AGENTS.md`](AGENTS.md) lebih dulu. Ia kontrak kerja teknis yang mengikat, bukan ringkasan.

## Yang paling dibutuhkan

| Kontribusi | Kenapa berharga |
| --- | --- |
| **Terjemahan bahasa daerah** | Katalog `nij`/`bjn`/`mhy`/`bkr` masih hampir kosong dan hanya boleh diisi penutur asli. Mulai dari string antarmuka: jumlahnya sedikit, tampil di setiap halaman |
| **Koreksi tarif, syarat, alamat unit** | Ditangani lebih dulu daripada apa pun. Sertakan sumber resminya |
| **Verifikasi data unit layanan** | Sebagian alamat dan jam layanan masih bersumber pengumuman, belum dikonfirmasi langsung ke unit |

## Menyiapkan lingkungan

```bash
bun --version         # >= 1.3.0, sesuai `engines.bun`
bun install
bun run dev           # http://localhost:4321
```

| Perintah | Kegunaan |
| --- | --- |
| `bun run build` | Gerbang lockfile, `astro check`, lalu `astro build` |
| `bun test` | Unit test renderer blok (`bun:test`) |
| `bun run audit` | Aturan konten, katalog PO, gambar, SEO, kartu share, tautan `dist/` |
| `bun run kartu-share` | Paksa bangkitkan ulang kartu share |
| `bun run release <level>` | Rilis bertag (wewenang maintainer) |

`bun run audit` membaca `dist/`, jadi jalankan `bun run build` lebih dulu.

## Alur kontribusi

1. **Mulai dari issue** yang jelas scope-nya. Bila perubahan menyentuh standar dasar, tulis [ADR](docs/adr/README.md) lebih dulu — daftar pemicunya di [`GOVERNANCE.md`](GOVERNANCE.md#kapan-sebuah-perubahan-butuh-adr).
2. **Buat branch dari `main` sebelum menyentuh berkas apa pun.** Jangan commit langsung ke `main`.
3. **Satu iterasi = satu scope atomic.** Selesaikan dan validasi sebelum pindah. Jangan menumpuk beberapa perubahan tak-berkaitan di satu branch.
4. **Ubah konten dulu, komponen belakangan.** Konten adalah produknya; komponen hanya alat render.
5. **Verifikasi setiap klaim** biaya, denda, tenggat, alamat unit, dan rujukan hukum ke sumber resmi sebelum menuliskannya.
6. **Perbarui `updatedDate` dan `reviewDueDate`** pada setiap perubahan substantif.
7. **Perbarui dokumentasi** bila workflow, struktur, atau konfigurasi berubah — pada iterasi yang sama.
8. **Tulis changeset** di [`.changesets/`](.changesets/README.md) pada iterasi yang sama, bukan dirapel di akhir.
9. **Jalankan `bun run build`, `bun test`, dan `bun run audit`**; ketiganya harus bersih.
10. **Buka Pull Request** dengan `Closes #<issue>`. Merge setelah review dan CI hijau, lalu hapus branch-nya.

### Penamaan branch

`feature/<issue>-<slug>`, `fix/<issue>-<slug>`, `konten/<slug>`, `terjemahan/<locale>-<slug>`, `docs/<topik>`.

### Konvensi commit

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <ringkasan>`.

| Type | Untuk |
| --- | --- |
| `feat` | Kemampuan baru yang terlihat pembaca |
| `fix` | Perbaikan perilaku yang salah |
| `konten` | Artikel baru, koreksi isi, pembaruan tarif atau data unit |
| `terjemahan` | Pengisian atau penyuntingan locale |
| `docs` | Dokumentasi, ADR, skill |
| `chore` | Dependency, konfigurasi, perkakas |
| `refactor` | Perubahan bentuk kode tanpa perubahan perilaku |
| `style` | Tampilan dan CSS |

Scope contoh: `sim`, `stnk`, `bpkb`, `pengawalan`, `gakkum`, `wilayah`, `i18n`, `seo`, `share`, `gambar`, `audit`, `rilis`.

Badan commit menjelaskan **kenapa**, bukan mengulang diff.

## Aturan konten yang tidak bisa ditawar

Rincian lengkapnya di [`AGENTS.md`](AGENTS.md). Yang paling sering dilanggar:

- **Setiap nominal wajib punya `biaya[].sumber` dan `dasarHukum` lengkap** — jenis aturan, nomor, tahun, judul.
- **Denda ditulis sebagai ancaman maksimum menurut undang-undang**, bukan nominal yang pasti dibayar.
- **Yang belum terverifikasi ditulis `TBD`** beserta sumber yang harus dicek. Jangan menebak, jangan menyalin dari situs pihak ketiga.
- **Minimal tiga item `faq`** untuk artikel panduan.
- **Prosedur ditulis di `langkah[]`**, bukan sebagai daftar bernomor di badan artikel.
- Dilarang: lambang atau logo instansi negara, tautan jasa calo, pengumpulan data pribadi pembaca, konten yang membantu menghindari penindakan hukum, dan skrip pihak ketiga apa pun.

## Terjemahan

Bahasa Inggris terbuka untuk siapa saja.

**Empat bahasa daerah — Dayak Ngaju, Banjar, Ma'anyan, Bakumpai — wajib dikerjakan atau disunting penutur asli.** Keluaran terjemahan mesin tidak boleh tayang sebagai hasil akhir. Alasannya di [ADR-0004](docs/adr/0004-terjemahan-bahasa-daerah-penutur-asli.md); panduan teknisnya di [`docs/workflows/penerjemahan-bahasa-daerah.md`](docs/workflows/penerjemahan-bahasa-daerah.md).

Yang tidak boleh berubah saat menerjemahkan: angka, nomor peraturan, tingkat kepastian kalimat, dan peringatan resmi.

## Definition of Done

Sebuah pekerjaan selesai bila **seluruhnya** terpenuhi:

- [ ] Scope atomic terpenuhi; tidak ada perubahan menumpang yang tak berkaitan.
- [ ] Klaim biaya, denda, dasar hukum, dan data unit layanan sudah diverifikasi ke sumber resmi.
- [ ] `cakupan` artikel sesuai level keberlakuan informasinya.
- [ ] `updatedDate` dan `reviewDueDate` diperbarui pada perubahan substantif.
- [ ] `bun run build` sukses tanpa error `astro check`.
- [ ] `bun test` hijau.
- [ ] `bun run audit` melaporkan **0 error**.
- [ ] `bun audit` melaporkan **0 kerentanan**.
- [ ] Tidak ada secret yang terekspos.
- [ ] Tampilan layak pakai dari lebar 360px sampai desktop.
- [ ] Metadata SEO, kartu share, dan structured data tidak rusak.
- [ ] Teks antarmuka baru masuk katalog PO, termasuk `alt`, `aria-label`, `title`, dan `placeholder`.
- [ ] Gambar baru berasio sama dengan bingkainya, tanpa lambang instansi, dan teksnya hanya label topik.
- [ ] Teks di dalam gambar terbaca pada lebar 360px.
- [ ] Disclaimer independensi dan peringatan kanal resmi tetap tampil di seluruh locale.
- [ ] Dokumentasi diperbarui bila workflow, struktur, atau konfigurasi berubah.
- [ ] Changeset ditulis bila perubahan memengaruhi konten publik, struktur, dependency, atau deployment.

## Melaporkan masalah

- Kerentanan keamanan: [`SECURITY.md`](SECURITY.md) — **jangan** buka issue publik.
- Koreksi konten, bug, pertanyaan: [`SUPPORT.md`](SUPPORT.md).
- Perilaku kontributor: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
