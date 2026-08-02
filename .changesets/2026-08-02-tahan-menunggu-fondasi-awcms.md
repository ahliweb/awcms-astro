---
tipe: dokumentasi
dampak: internal
---

# Pengembangan repo ini ditahan sampai fondasi `awcms` selesai

Aturan pemilik 2 Agustus 2026, dicatat sebagai
[ADR-0021](../docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md).

Yang **masih** mendarat selama penahanan, dan hanya ini: patch keamanan, bump
dependency, dan koreksi dokumen yang berhenti benar karena `awcms` berubah.
Selebihnya — fitur, refactor, gerbang baru, dokumen baru — ditahan.

## Kenapa, dan kenapa bukan karena kekurangan pekerjaan

Empat perubahan mendarat hari ini dan menutup seluruh yang bisa diselesaikan
tanpa `awcms` bergerak lebih dulu. Sisa backlog **semuanya** menunggu `awcms`,
dan itu bukan kebetulan: ADR-0020 baru saja memindahkan seluruh layar admin ke
sana, `awcms` ADR-0047 membekukan `awcms-mini`/`awcms-micro` sehingga fitur
fondasi dirintis langsung di `awcms`, dan gelombang layar admin di sana sedang
berjalan. Pusat gravitasi pekerjaan keluarga ini ada di `awcms`; repo ini
konsumen kontraknya.

Biaya mengembangkan paralel spesifik, bukan sekadar "kurang fokus": **fitur yang
dibangun di atas kontrak yang belum stabil ditulis dua kali.** Repo ini sudah
membayarnya sekali — adapter kontennya ditulis untuk daftar ringkasan, lalu
ditulis ulang saat `awcms` mengirimkan build feed (ADR-0018), dan versi
pertamanya menerbitkan situs yang setiap artikelnya kosong dengan build hijau.

## Kenapa keamanan dan dependency dikecualikan

Repo ini punya image produksi yang berjalan. Kerentanan tidak ikut membeku
bersama pengembangannya. Dan Dependabot tetap membuka PR selama penahanan —
membiarkannya menumpuk berarti mencabut penahanan ke sebuah tumpukan bump
berbulan-bulan yang dinilai sekaligus, persis keadaan yang paling mungkin
menyelundupkan perubahan perilaku tanpa ada yang membacanya.

## Kapan dicabut

Saat pemilik menyatakan pengembangan dasar `awcms` selesai. Dua indikator yang
bisa diperiksa hari ini, keduanya di `PROJECT_STATE.md` milik `awcms`: setiap
modul punya layar (kini **7 dari 21** masih tanpa layar, turun dari 13), dan §4
"yang belum" habis. Keduanya indikator, bukan gerbang otomatis.

## Titik lanjut

ADR-0021 §Titik lanjut mencatat apa yang menunggu beserta alasannya — ditulis
sekarang selagi konteksnya segar, karena daftar yang direkonstruksi dari
`git log` berbulan-bulan kemudian selalu kehilangan alasannya. Yang terpenting:
gambar artikel **tidak lagi diblokir `awcms`** dan tinggal dua keputusan di repo
ini.

## Dokumen yang ikut dikoreksi

Tabel "Yang paling dibutuhkan" di `CONTRIBUTING.md` masih meminta tiga gerbang
yang hari ini sudah ada, dan pelepasan gaya inline yang sudah selesai. Keduanya
diganti dengan yang benar-benar berharga sekarang: positif palsu dari gerbang
yang sudah jalan, dan komponen baru yang diam-diam mengembalikan skrip inline ke
HTML.
