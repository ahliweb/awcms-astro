---
bump: minor
tipe: struktur
dampak: publik
---

# Sebuah situs akhirnya bisa menyatakan dirinya sendiri, tanpa menyunting repo ini

Sampai perubahan ini, siapa sebuah situs hanya bisa diubah oleh orang yang bisa
menyunting deployment-nya. Nama, lambang, dan kartu share datang dari `.env`;
tagline dan baris hak cipta dari katalog PO; favicon dari sebuah berkas di
`public/`. Alamat redaksi, email, telepon, WhatsApp, dan tautan profil sosial
tidak punya tempat sama sekali — bukan kosong, **tidak ada** — sehingga
satu-satunya cara menerbitkannya adalah menuliskannya ke dalam template yang
dipakai situs lain.

Itu cacat yang dinamai `awcms` #596: identitas hidup di source frontend, dan
tenant kedua mustahil tanpa fork.

## Satu permintaan, karena `awcms` sudah menggabungkannya

`GET /api/v1/site-profile/composed` (`awcms` ADR-0102) menjawab keduanya
sekaligus: yang dibaca MANUSIA milik modul `site_profile`, yang dibaca PERAYAP
milik `seo_distribution`. Pemisahan itu benar untuk kepemilikan dan salah untuk
konsumen, jadi `awcms` menyusunnya di sisi baca — dan template ini karena itu
tidak pernah belajar bahwa pemisahannya ada.

Yang berubah di halaman: masthead memakai logo dan nama tenant, `<link
rel="icon">` memakai favicon tenant, tagline dan baris hak cipta datang dari
redaksi, footer menumbuhkan kolom kontak dan kolom profil sosial bila — dan
hanya bila — tenant mengisinya, dan simpul `Organization` di setiap halaman
membawa `logo`, `address`, `email`, `telephone`, serta `sameAs` yang sebenarnya.

## Urutan mendaratnya adalah inti kontrak lintas-repo

`awcms` membekukan bentuk responsnya LEBIH DULU, sebagai path **COMMITTED** —
sebuah janji, karena belum ada yang memanggil. Baru setelah itu repo ini mulai
memanggil, dan entri di sana berpindah ke CONSUMED. Definition of Done menuntut
urutan itu, dan urutan sebaliknya berarti build di sini bersandar pada bentuk
yang belum disanggupi repo sebelah. Ini permukaan **keempat**;
`tests/kontrak-awcms.test.mjs` mengeraskan daftarnya dari kode sumber, dua arah
terhadap tabel bertanda di skill integrasi, justru supaya penambahan seperti ini
tidak bisa mendarat diam-diam.

## Dua keputusan yang gagal dalam diam bila salah

**403 dan 404 jatuh ke cadangan; sisanya menggagalkan build.** Keduanya terlihat
sama di log dan menuntut jawaban berlawanan. `403` berarti kredensial build
belum dipegangi `site_profile.profile.read` — nyata dan diharapkan, karena
`awcms` menyemai izin per tenant saat tenant itu dibuat, sehingga tenant lama
diam-diam kehilangan grant-nya. `404` berarti `awcms`-nya lebih tua dari
endpoint-nya. Keduanya adalah "`awcms` bilang tidak", situsnya tetap benar
dengan nilai cadangan, dan peringatannya menyebut izin yang kurang supaya
perbaikannya satu kalimat. Sebuah `500` bukan penolakan: itu CMS yang rusak, dan
membangun terus akan menerbitkan situs yang diam-diam berganti nama menjadi nama
template — yang terlihat persis seperti deploy yang berhasil.

**URL sosial ditolak, bukan disanitasi — dua kali.** `awcms` menolaknya saat
ditulis, dan `lib/awcms/profil.ts` menolaknya lagi saat dibaca. Baris yang
ditulis sebelum validator itu ada tetap sebuah baris, dan nilainya dirender
sebagai `<a href>` di setiap halaman situs.

## Yang sengaja TIDAK dilakukan

Baris hak cipta tenant **mengganti** baris rakitan, tidak menggabunginya:
redaksi yang menulis "© 2019–2026 PT Lentera Kalteng" memaksudkan kata itu, dan
sebuah gabungan akan mencetak tahunnya dua kali dan namanya dua kali. Logo
tenant **mengganti** `SITE_MARK`, tidak menemaninya: keduanya menempati tempat
yang sama, dan situs yang memasang keduanya menyatakan dua identitas di satu
baris.
