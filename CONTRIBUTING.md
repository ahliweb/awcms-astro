# Panduan Kontribusi

Terima kasih sudah berniat membantu. Sebelum apa pun, satu hal yang membentuk seluruh aturan di bawah:

**Repo ini adalah template, bukan sebuah situs.** Yang dikirimkan bukan artikel, melainkan cetakan yang dipakai situs-situs lain. Cacat di sini tidak muncul sekali — ia ikut ke setiap situs yang lahir dari template ini, dan sebagian besar cacat yang paling mahal di sini tidak menggagalkan build apa pun: identitas satu situs yang tertanam di kode, key katalog yang tampil sebagai teks pembaca, gambar yang terpotong diam-diam, tag `og:image` yang menunjuk berkas yang tidak pernah ada. Karena itu banyak aturan di sini terasa lebih ketat daripada proyek web pada umumnya.

Situs yang dibangun dari template ini menambahkan aturan kontennya sendiri — verifikasi tarif, dasar hukum, data unit layanan — dan aturan itu ditegakkan di sisi `awcms` tempat kontennya tinggal, bukan di sini.

> **Penahanan pengembangan sudah SELESAI** sejak 4 Agustus 2026
> ([ADR-0027](docs/adr/0027-penahanan-adr-0021-selesai.md)); repo ini dan
> [`ahliweb/awcms`](https://github.com/ahliweb/awcms) sama-sama dikembangkan.
> Yang menggantikannya satu pertanyaan yang tetap berlaku:
> **apakah perubahan ini akan ditulis ulang bila `awcms` berubah?** Bila ya, ia
> butuh instans `awcms` untuk membuktikan panggilannya benar sebelum mendarat —
> dan "endpoint-nya sudah ada" bukan jawaban "tidak"
> ([ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)).
> Repo template ini tidak punya instans, jadi kontribusi yang menyentuh
> pengambilan konten paling berguna bila datang dari sebuah situs nyata.

Kontributor agen AI: baca [`AGENTS.md`](AGENTS.md) lebih dulu. Ia kontrak kerja teknis yang mengikat, bukan ringkasan.

## Yang paling dibutuhkan

| Kontribusi | Kenapa berharga |
| --- | --- |
| **Laporan dari gerbang yang sudah ada** | Ketiga gerbang yang dulu didaftar di sini — audit metadata SEO, tautan mati di `dist/`, pemeriksa rasio gambar — kini ada di [`scripts/audit-konten.mjs`](scripts/audit-konten.mjs). Yang berharga sekarang kebalikannya: **positif palsu** yang ia laporkan di situs nyata, dan kelas cacat yang ia lewatkan |
| **Menjaga keluaran bersih dari gaya dan skrip inline** | Sudah selesai (ADR-0018/0019) dan dijaga [`tests/keluaran-csp.test.mjs`](tests/keluaran-csp.test.mjs); penyaji kini benar-benar mengirim CSP ketat. Yang berharga: komponen baru yang diam-diam mengembalikannya — Astro menyisipkan bundel kecil ke HTML berdasarkan UKURAN, jadi kepatuhan bisa hilang tanpa ada aturan yang diubah |
| **Terjemahan katalog antarmuka** | `src/locales/<locale>/messages.po`. Jumlah stringnya sedikit dan seluruhnya tampil di setiap halaman |
| **Laporan dari situs nyata** | Apa yang ternyata perlu disunting di luar `src/config/site.ts` dan `.env` — setiap temuan seperti itu adalah pelanggaran janji utama template ini |

## Menyiapkan lingkungan

```bash
bun --version         # >= 1.3.0, sesuai `engines.bun`
cp .env.example .env  # isi AWCMS_API_URL, token, dan tenant
bun install
bun run dev           # http://localhost:4321
```

| Perintah | Kegunaan |
| --- | --- |
| `bun run dev` | Server pengembangan Astro (HMR) |
| `bun run check` | Gerbang lockfile lalu `astro check` |
| `bun run check:lockfile` | Hanya gerbang lockfile — murni baca berkas, tanpa jaringan |
| `bun test` | Renderer blok, gerbang katalog PO, dan gerbang penyajian |
| `bun run build` | `check` → `astro build` → bundel penyaji |
| `bun run serve` | Menjalankan penyaji produksi atas hasil build (`preview` dan `start` adalah aliasnya) |
| `bun audit` | Kerentanan rantai dependency |
| `bun run release <level>` | Rilis bertag (wewenang maintainer) |

`bun run dev` **bukan** penyaji produksi: ia tidak mengirim header keamanan maupun aturan cache di [`server/penyaji.mjs`](server/penyaji.mjs). Untuk melihat persis yang dilihat pembaca, jalankan `bun run build && bun run serve`.

`bun run build` menarik konten dari sebuah instans `awcms` sungguhan. Repo template ini tidak punya satu pun, jadi build penuh hanya bisa dijalankan bila Anda mengarahkannya ke instans Anda sendiri — itu juga sebabnya job `build` di CI dikondisikan pada terisinya `vars.AWCMS_API_URL`. Perubahan yang tidak menyentuh pengambilan konten tetap bisa divalidasi penuh dengan `bun run check` dan `bun test`.

## Alur kontribusi

1. **Mulai dari issue** yang jelas scope-nya. Bila perubahan menyentuh standar dasar, tulis [ADR](docs/adr/README.md) lebih dulu — daftar pemicunya di [`GOVERNANCE.md`](GOVERNANCE.md#kapan-sebuah-perubahan-butuh-adr).
2. **Buat branch dari `main` sebelum menyentuh berkas apa pun.** Jangan commit langsung ke `main`.
3. **Satu iterasi = satu scope atomic.** Selesaikan dan validasi sebelum pindah. Jangan menumpuk beberapa perubahan tak-berkaitan di satu branch.
4. **Sebelum menulis nilai apa pun yang khas satu situs, tanyakan apa yang terjadi bila situs berikutnya memakainya.** Nama, lambang, wilayah, dan daftar tab adalah input — bukan konstanta.
5. **Perbarui dokumentasi** bila perilaku, workflow, struktur, atau konfigurasi berubah — pada iterasi yang sama. Di repo ini dokumentasi adalah bagian dari produk.
6. **Tulis changeset** di [`.changesets/`](.changesets/README.md) pada iterasi yang sama, bukan dirapel di akhir.
7. **Jalankan `bun run build` dan `bun test`**; keduanya harus bersih.
8. **Buka Pull Request** dengan `Closes #<issue>`. Merge setelah review dan CI hijau, lalu hapus branch-nya.

### Penamaan branch

`feat/<slug>`, `fix/<slug>`, `docs/<topik>`, `chore/<slug>`, `terjemahan/<locale>-<slug>`.

### Konvensi commit

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <ringkasan>`.

| Type | Untuk |
| --- | --- |
| `feat` | Kemampuan baru yang terlihat pemakai template atau pembaca situs |
| `fix` | Perbaikan perilaku yang salah |
| `terjemahan` | Pengisian atau penyuntingan katalog locale |
| `docs` | Dokumentasi, ADR, skill |
| `chore` | Dependency, konfigurasi, perkakas |
| `refactor` | Perubahan bentuk kode tanpa perubahan perilaku |
| `style` | Tampilan dan CSS |

Scope contoh: `konten`, `i18n`, `seo`, `share`, `gambar`, `deploy`, `runtime`, `lockfile`, `rilis`.

Badan commit menjelaskan **kenapa**, bukan mengulang diff.

## Aturan yang tidak bisa ditawar

Rincian lengkap dan alasan tiap butir ada di [`AGENTS.md`](AGENTS.md). Yang paling sering dilanggar tanpa disadari — semuanya karena pelanggarannya **tidak pernah gagal**:

- **Hanya `src/lib/awcms/client.ts` yang boleh menghubungi awcms.** Komponen menerima data lewat props.
- **Tidak ada jalur HTML mentah dari CMS.** Blok konten disusun dari teks ter-escape dan tag tetap; `set:html` hanya menerima keluaran `renderContentBlocks`.
- **Token build tidak pernah ber-prefix `PUBLIC_`.** Astro menyisipkan variabel ber-prefix itu ke keluaran klien.
- **Identitas satu situs tidak boleh masuk kode.** Tempatnya `src/config/site.ts` dan `.env`.
- **String antarmuka lewat katalog PO**, termasuk label yang datang dari konfigurasi. Key yang dirangkai dari konfigurasi atau data redaksi wajib dipanggil dengan argumen fallback yang layak dibaca — ujung rantai `t()` adalah NAMA KEY, dan nama key di layar bukan halaman terbaca.
- **Setiap fungsi inti bekerja tanpa JavaScript**, dan aksesibilitas WCAG 2.1 AA adalah batas, bukan target.
- **Jangan mengiklankan aset yang tidak diterbitkan build ini.** `og:image` dan `ImageObject` adalah klaim; klaim yang menunjuk 404 lebih buruk daripada tag yang tidak ada.
- Dilarang: skrip pihak ketiga, pengumpulan data pribadi pembaca, lambang atau logo instansi negara (termasuk di dalam ilustrasi), dan dokumen atau antarmuka aplikasi pemerintah yang direkayasa.

## Terjemahan

Katalog antarmuka ada di `src/locales/<locale>/messages.po`. Locale yang tersedia ditentukan `localeMeta` di `src/config/site.ts`; template ini membawa `id` dan `en`.

Dua aturan yang dijaga `tests/katalog-po.test.mjs` dan mudah dilanggar:

- **Key baru masuk ke SELURUH katalog locale.** Katalog yang tertinggal tidak pernah gagal sendiri — ia jatuh ke locale default dan tampak baik-baik saja sampai seseorang membaca halamannya dalam bahasa itu.
- **`msgstr` kosong sama dengan key yang tidak ada**, tetapi terlihat sudah diterjemahkan saat katalognya dibaca manusia.

Sebuah situs boleh menetapkan syarat lebih ketat untuk bahasa tertentu — misalnya mewajibkan penutur asli untuk bahasa dengan register teknis yang tipis. Tulis syarat itu sebagai ADR di repo situsnya sejak awal, bukan setelah terjemahan mesin terlanjur tayang.

Yang tidak boleh berubah saat menerjemahkan: angka, nomor peraturan, tingkat kepastian kalimat, dan peringatan resmi.

## Definition of Done

Daftar lengkap dan mengikat ada di [`AGENTS.md`](AGENTS.md#definition-of-done). Ringkasnya, sebuah pekerjaan selesai bila **seluruhnya** terpenuhi:

- [ ] Scope atomic terpenuhi; tidak ada perubahan menumpang yang tak berkaitan.
- [ ] `bun run build` bersih, termasuk `astro check`.
- [ ] `bun test` hijau — termasuk gerbang katalog PO, penyajian, permukaan
      `awcms`, dan versi toolchain.
- [ ] `bun run audit:konten`, `bun run audit:dokumen`, dan `bun run audit:graf`
      hijau. Yang terakhir menjaga `graphify-out/` — artefak yang ikut terlacak,
      jadi ikut terbaca sebagai peta oleh yang datang sesudahmu.
- [ ] `bun audit` melaporkan **0 kerentanan**.

`bun run release <tingkat> --apply` menjalankan kelimanya dalam urutan yang
berarti; ia bukan pengganti menjalankannya saat mengerjakan PR, tetapi ia yang
memastikan tidak ada rilis yang melewatkannya.
- [ ] Halaman baru bekerja dengan JavaScript dimatikan.
- [ ] String antarmuka baru masuk ke seluruh katalog locale; key dinamis punya fallback yang layak dibaca.
- [ ] Locale default dan locale berprefiks menghasilkan jumlah halaman yang sama.
- [ ] Tidak ada identitas satu situs yang tertanam di kode.
- [ ] Variabel env baru terdokumentasi di `.env.example`, beserta konsekuensi salah isi.
- [ ] Tampilan layak pakai dari lebar 360px sampai desktop, di kedua tema.
- [ ] Gambar baru berasio `--ratio-visual`, ekstensinya sesuai isi berkas, tanpa lambang instansi maupun data tiruan.
- [ ] Dokumentasi yang menjelaskan perilaku yang berubah ikut diperbarui.
- [ ] Changeset ditulis bila perubahan memengaruhi keluaran publik, struktur, dependency, atau deployment.

## Melaporkan masalah

- Kerentanan keamanan: [`SECURITY.md`](SECURITY.md) — **jangan** buka issue publik.
- Bug dan pertanyaan: [`SUPPORT.md`](SUPPORT.md).
- Perilaku kontributor: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
