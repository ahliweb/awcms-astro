🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SUPPORT.md)

<!-- i18n-source-hash: sha256:c8684c2e9fb4fc20ce918875ebeb3f8ce0bc59e5f8ead25d7ef53e99900b4c3e -->

# Dukungan

## Yang BUKAN kanal ini

**Repo ini adalah template, bukan sebuah situs.** Kalau Anda sampai di sini karena sebuah situs yang dibangun dengannya, hubungi pengelola situs itu — repo ini tidak memegang kontennya, tidak memegang datanya, dan tidak dapat mengubah apa pun yang tayang di sana.

Pertanyaan tentang template — cara memulai situs baru, integrasi dengan `awcms`, atau perilaku komponen — silakan lewat GitHub Issues.

Bila Anda menerima pesan mengatasnamakan situs ini yang meminta pembayaran atau data pribadi, itu penipuan.

## Yang bisa dibantu di sini

| Kebutuhan | Jalur |
| --- | --- |
| Template error, tampilan rusak, tautan mati, hasil build salah | Buka issue dengan templat **Laporan bug** |
| Sesuatu ternyata harus disunting di luar `src/config/site.ts` dan `.env` | Buka issue — itu pelanggaran janji utama template ini, dan kami memperlakukannya sebagai bug |
| Ingin membantu menerjemahkan katalog antarmuka | Buka issue, lalu lihat [`CONTRIBUTING.md`](CONTRIBUTING.md#translation) |
| Pertanyaan integrasi dengan `awcms` | Buka issue; kontraknya di [`docs/awcms-astro/integrasi-awcms.md`](docs/awcms-astro/integrasi-awcms.md) |
| Ingin memakai repo ini sebagai titik awal situs lain | Baca [`docs/awcms-astro/`](docs/awcms-astro/README.md) |
| Menemukan kerentanan keamanan | **Jangan buka issue publik.** Ikuti [`SECURITY.md`](SECURITY.md) |

## Prioritas

Ditangani lebih dulu daripada apa pun: cacat yang **tidak menggagalkan build**. Situs yang terlihat berhasil tetapi kehilangan artikel, halaman yang menampilkan nama key sebagai teks pembaca, gambar yang terpotong diam-diam, tag `og:image` yang menunjuk berkas yang tidak ada, dan header cache yang membuat rebuild sukses tidak pernah terlihat pembaca — seluruhnya lolos dari CI hijau, dan seluruhnya ikut ke setiap situs yang lahir dari template ini.

Koreksi konten sebuah situs bukan urusan repo ini: kontennya tinggal di instans `awcms` milik situs tersebut, dan repo ini tidak bisa mengubah apa pun yang tayang di sana.
