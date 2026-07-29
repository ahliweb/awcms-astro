# Kebijakan Keamanan

## Melaporkan kerentanan

**Jangan membuka issue publik untuk kerentanan yang bisa dieksploitasi.**

Laporkan lewat [GitHub Security Advisory](https://github.com/ahliweb/awcms-astro/security/advisories/new) (jalur privat). Sertakan langkah reproduksi, dampak yang Anda perkirakan, dan versi/commit yang diuji.

Kami menargetkan tanggapan awal dalam **3 hari kerja** dan perbaikan untuk kerentanan yang dikonfirmasi dalam **14 hari kerja**, tergantung tingkat keparahannya.

## Permukaan serangan repo ini

Situs ini **statis murni** (`output: 'static'`): tidak ada basis data, tidak ada runtime server, tidak ada autentikasi, dan tidak ada form yang mengirim data ke mana pun. Kelas kerentanan yang biasanya dominan — injeksi SQL, kebocoran sesi, kontrol akses — tidak berlaku di sini.

Yang tetap relevan:

| Area | Risiko |
| --- | --- |
| Dependency | Kerentanan transitif pada rantai build. Dijaga `bun audit`; wajib nol sebelum rilis |
| Konten | Markdown dirender sebagai HTML. Markup mentah di badan artikel dapat menyisipkan skrip |
| Tautan keluar | Tautan ke kanal resmi wajib `rel="noopener noreferrer"` bila `target="_blank"` |
| Aset | SVG yang dirasterisasi saat build dapat merujuk sumber daya eksternal |
| Pipeline rilis | Skrip build dan rilis punya akses tulis ke repo |

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
