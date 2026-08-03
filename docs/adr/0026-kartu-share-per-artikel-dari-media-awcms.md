# ADR-0026 — Kartu share per artikel dari media `awcms`, dengan metadata yang ikut berpindah

- **Status:** Accepted
- **Tanggal:** 3 Agustus 2026
- **Memperluas:** [ADR-0025](0025-gambar-artikel-dari-media-awcms.md) — sumber dan mekanisme resolusinya sama; ADR ini menambah permukaan kedua yang memakainya.
- **Terkait:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md), `awcms` [ADR-0056](https://github.com/ahliweb/awcms/blob/main/docs/adr/0056-media-library-admin-surface.md)

## Konteks

"Kartu share per halaman" adalah butir backlog tertua repo ini, dan alasannya
selalu sama: template ini tidak membawa pembangkit kartu, dan yang ada di repo
rujukan terikat pada seni serta data domainnya.

Alasan itu benar untuk kartu yang **dibangkitkan**. Ia tidak pernah benar untuk
kartu yang **diunggah** — dan `awcms` sudah menyimpan tepat itu:
`seoImageMediaId`, yang spesifikasinya sendiri sebut sebagai override eksplisit
*"use this image for social/SEO preview"* yang **mengalahkan** `featuredMediaId`.
ADR-0025 sudah membangun batch resolusi media, jadi permukaan kedua ini tidak
menambah satu pun permintaan baru.

Yang menahannya bukan pembangkit, melainkan sesuatu yang lebih kecil dan lebih
berbahaya: **halaman ini mendeklarasikan ukuran dan MIME kartunya sebagai
konstanta.**

## Keputusan

**Artikel memakai kartu share-nya sendiri bila `awcms` punya satu, dan metadata
kartu itu ikut berpindah bersama URL-nya.**

### 1. Urutannya milik `awcms`, bukan milik repo ini

`seoImageMediaId ?? featuredMediaId` — persis yang
`seo-facts-port-adapter.ts` di `awcms` selesaikan. Menyusun urutan sendiri di
sini berarti situs dan permukaan SEO CMS-nya menjawab satu pertanyaan dengan dua
jawaban, dan hanya satu dari keduanya yang terlihat editor.

Yang **tidak** ikut berpindah: gambar di badan artikel tetap `featuredMediaId`.
Yang `awcms` prioritaskan hanya permukaan pratinjau.

### 2. MIME dan ukuran ikut, dan itu inti ADR ini

`BaseLayout` memasang `og:image:type` `image/png` dengan `og:image:width` 1200
dan `og:image:height` 630 untuk gambar APA PUN, dan `schema.ts` menuliskan
`ImageObject` dengan konstanta yang sama.

Itu benar untuk `SITE_SOCIAL_IMAGE` — `.env.example` menyatakan kontraknya
kepada siapa pun yang mengisinya. Untuk objek media `awcms` ia salah tiga kali
sekaligus: berkasnya WebP 1600×900 pada umumnya. Konsekuensinya bukan kartu yang
jelek melainkan **kartu yang berbohong kepada mesin** — pengunduh pratinjau yang
memercayai angka itu melebarkan ke kotak yang salah atau menolak kartunya, dan
tidak ada satu pun kegagalan di build. Bentuknya identik dengan cacat yang
`social-image.ts` sendiri lahir untuk mengakhirinya: `og:image` yang menunjuk
berkas 404 dengan build tetap hijau.

Jadi `ogImageType`/`ogImageWidth`/`ogImageHeight` menjadi masukan yang mengikuti
gambarnya, dengan konstanta kartu situs sebagai **bawaan**, bukan sebagai
kebenaran universal. `ImageObject` JSON-LD mengikuti aturan yang sama.

### 3. Tiga keadaan, semuanya didukung

| Punya | Yang terbit |
| --- | --- |
| `seoImageMediaId` atau `featuredMediaId` | Kartu artikel, dengan MIME dan ukurannya sendiri |
| Tidak, tetapi `SITE_SOCIAL_IMAGE` diisi | Kartu situs, `image/png` 1200×630 |
| Tidak keduanya | **Tanpa tag gambar sama sekali** — pratinjau jatuh ke kartu teks yang rapi |

Keadaan ketiga tetap yang paling penting untuk dipertahankan: pratinjau tanpa
gambar jatuh ke sesuatu; pratinjau dengan gambar rusak tidak jatuh ke mana pun.

## Konsekuensi

- **Butir backlog "kartu share per halaman" menyempit ke kartu yang
  DIBANGKITKAN.** Yang diunggah editor sudah bekerja, tanpa dependency baru dan
  tanpa seni domain.
- **Nol permintaan tambahan.** Kedua id masuk batch yang sama dan dideduplikasi;
  artikel yang memakai satu gambar untuk dua permukaan tetap satu id.
- **Ukuran kartu tidak lagi dijamin 1200×630.** Sebuah objek media berasio
  16∶9 adalah kartu yang sah tetapi bukan kartu yang optimal; yang ADR ini
  jamin adalah **angka yang terbit itu benar**, bukan bahwa angkanya ideal.
  Menormalkannya butuh pembangkit — dan itu tetap butir backlog dengan ADR-nya
  sendiri.
- **Risiko yang diterima:** `og:image:type` kini berasal dari `mimeType` yang
  `awcms` simpan. `awcms` men-sniff MIME dari bytes saat finalize upload
  (bukan dari ekstensi), jadi nilai itu lebih dapat dipercaya daripada konstanta
  yang digantikannya — tetapi ia tetap nilai dari sistem lain, dan repo ini
  tidak memverifikasinya ulang.

## Alternatif yang dipertimbangkan

- **Memakai `featuredMediaId` saja** — ditolak: `seoImageMediaId` ada persis
  supaya editor bisa memilih kartu yang berbeda dari ilustrasi artikel, dan
  mengabaikannya membuat kontrol itu tidak berpengaruh apa pun tanpa satu pun
  tanda di CMS.
- **Mempertahankan konstanta 1200×630 untuk kartu artikel** — ditolak; lihat §2.
  Ini bukan penyederhanaan melainkan tiga klaim palsu di setiap halaman artikel.
- **Menghilangkan `og:image:width`/`height` sepenuhnya** — ditolak: keduanya
  membuat sebagian pengunduh merender kartu tanpa menunggu gambarnya diunduh.
  Menghapusnya menukar satu masalah nyata dengan masalah nyata lain, sementara
  mengirimkan nilai yang benar tidak menukar apa pun.
- **Membangkitkan kartu 1200×630 dari gambar artikel saat build** — ditolak
  untuk sekarang: ia menambah encoder gambar sebagai dependency runtime build,
  dan itu keputusan yang pantas berdiri sendiri.
