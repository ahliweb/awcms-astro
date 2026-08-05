# Kebijakan Keamanan

## Melaporkan kerentanan

**Jangan membuka issue publik untuk kerentanan yang bisa dieksploitasi.**

Laporkan lewat [GitHub Security Advisory](https://github.com/ahliweb/awcms-astro/security/advisories/new) (jalur privat). Sertakan langkah reproduksi, dampak yang Anda perkirakan, dan versi/commit yang diuji.

Kami menargetkan tanggapan awal dalam **3 hari kerja** dan perbaikan untuk kerentanan yang dikonfirmasi dalam **14 hari kerja**, tergantung tingkat keparahannya.

## Permukaan serangan repo ini

Keluarannya **statis** (`output: 'static'`): tidak ada basis data, tidak ada autentikasi, dan tidak ada form yang mengirim data ke mana pun. Kelas kerentanan yang biasanya dominan — injeksi SQL, kebocoran sesi, kontrol akses per-pengguna — tidak berlaku di sini.

**"Tanpa runtime server" BUKAN bagian dari klaim itu, dan pernah keliru ditulis begitu di sini.** Sejak [ADR-0016](docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) keluaran build disajikan sebuah proses Bun ([`server/penyaji.mjs`](server/penyaji.mjs)) di belakang Traefik. Proses itu adalah permukaan, dan ia yang memegang seluruh header respons — jadi ia justru bagian yang paling pantas diperiksa, bukan bagian yang tidak ada.

Yang tetap relevan:

| Area | Risiko |
| --- | --- |
| Dependency | Kerentanan transitif pada rantai build. Dijaga `bun audit --audit-level=low` di CI; wajib nol sebelum rilis |
| Konten dari CMS | Badan artikel datang dari `awcms` sebagai **blok terstruktur**, bukan HTML atau markdown. [`src/lib/content-blocks.ts`](src/lib/content-blocks.ts) menyusun tiap elemen dari teks ter-escape dan tag tetap, jadi tidak ada jalur markup mentah — menambahkan tipe blok `html`/`raw`/`embed` membatalkan seluruh jaminan itu |
| Penyaji | Header keamanan, CSP, dan aturan cache. Satu-satunya pemilik: `server/penyaji.mjs`; kebijakan kedua di Traefik atau `<meta http-equiv>` adalah cara paling sunyi berakhir tanpa kebijakan sama sekali |
| Kredensial build | `AWCMS_API_TOKEN` adalah kredensial mesin baca-saja yang membawa tenant-nya. Ia tidak pernah ber-prefiks `PUBLIC_` dan karena itu tidak pernah masuk keluaran; ia **tetap** terbaca di cache builder pada mesin build |
| Tautan keluar | Tautan `target="_blank"` wajib `rel="noopener noreferrer"` |
| Aset | SVG di `src/assets/` dapat merujuk sumber daya eksternal; `img-src` di CSP yang membatasinya saat halaman dirender |
| Pipeline rilis | Skrip build dan rilis punya akses tulis ke repo |

## Kontrol, dan celahnya

Pemetaan lengkap ke **OWASP Top 10 2021, OWASP ASVS 4.0.3, OWASP Secure Headers Project, ISO/IEC 27001:2022 Annex A, dan NIST SSDF SP 800-218** ada di [`docs/awcms-astro/standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md) ([ADR-0028](docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)).

Dokumen itu memuat **daftar celah**, dan daftar itu sengaja publik: tujuh ditutup, **dua masih terbuka** — analisis statik dan pengukuran Core Web Vitals.

Keduanya keadaan yang sudah diketahui dan tercatat: melaporkannya lagi tidak menambah informasi. Melaporkan **akibat konkret**-nya pada sebuah deployment nyata, menambah.

Satu batas yang perlu diketahui pelapor: `Strict-Transport-Security` dikirim **hanya saat `NODE_ENV=production`**. Sebuah deployment yang tidak menyetelnya tidak mendapat HSTS dan tidak ada yang mengatakannya — itu diterima sadar di [ADR-0029](docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md), dan `Dockerfile` menyetelnya.

## Aturan yang mengikat

- **Tidak ada secret, token, atau kredensial** di kode, commit, issue, atau dokumentasi. Repo ini tidak membutuhkan satu pun untuk berjalan.
- **Tidak ada skrip, SDK, widget, atau piksel pihak ketiga** — termasuk tombol berbagi resmi milik penyedia sosial. Berbagi memakai tautan `GET` biasa sehingga tidak ada data pembaca yang terkirim sebelum ia sendiri mengeklik.
- **Tidak ada pengumpulan data pribadi pembaca** (NIK, nomor rangka, nomor mesin, nomor polisi, foto dokumen) lewat form apa pun.
- **Tidak ada analytics yang melacak individu.**
- `bun audit` wajib melaporkan nol kerentanan sebelum rilis.

## Bukan kerentanan keamanan

Hal berikut penting, tetapi bukan laporan keamanan — pakai issue biasa:

- Informasi tarif, syarat, atau alamat yang keliru. Ini **koreksi konten**, dan diprioritaskan lewat jalur di [`SUPPORT.md`](SUPPORT.md).
- Situs pihak ketiga yang meniru situs ini. Laporkan ke penyedia hosting-nya; kami tidak punya kendali di sana.
