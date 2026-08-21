---
bump: minor
tipe: struktur
dampak: publik
---

# Artikel yang selesai dibaca akhirnya menawarkan sesuatu berikutnya

Sampai perubahan ini sebuah artikel berakhir di disclaimer, dan pembacanya
keluar. Sekarang ia menutup dengan daftar pendek artikel lain di seksinya.

## Judulnya "lainnya di seksi ini", bukan "artikel terkait"

Karena ia memang bukan itu. Keterkaitan yang sebenarnya butuh taksonomi —
`termIds` dikembalikan `awcms`, tetapi tidak ada yang meresolusinya di repo ini
hari ini, dan itu butir tersendiri yang menuntut permukaan `awcms` baru. Judul
"artikel terkait" di atas daftar teman-seksi adalah janji yang dibaca pembaca
dan tidak dipenuhi.

Ketika taksonomi mendarat, blok ini menjadi tempat keterkaitan sungguhan
tinggal, dan judulnya berubah bersama datanya.

## Dua aturan dari SATU deklarasi yang sudah ada

Seksi ber-`urutanSeksi: "terbaru"` menawarkan yang TERBARU: nilainya meluruh,
dan pembaca berita mencari kabar berikutnya. Seksi `"manual"` menawarkan
TETANGGA menurut urutan redaksinya — langkah 4 setelah langkah 3, karena itulah
yang sedang dikerjakan pembacanya. Deklarasi yang sama sudah memutuskan apa yang
ditampilkan kartu dan tipe schema.org apa yang diklaim artikel.

## Nol permintaan tambahan ke `awcms`

Diturunkan dari feed yang sudah ditarik build (`getArticles` dimemoisasi per
build), bukan dari permukaan baru — yang akan menuntut tarian kontrak
lintas-repo demi sebuah daftar tiga tautan.

## Dua kesalahan yang menghasilkan blok yang TAMPAK benar

Menawarkan artikel yang sedang dibuka terlihat seperti daftar yang wajar sampai
seseorang mengkliknya dan tidak ke mana-mana; ia karena itu dibuang menurut
SLUG, bukan menurut posisi.

Menghitung tetangga SETELAH artikelnya dibuang menggeser setiap indeks
sesudahnya satu langkah, sehingga "langkah berikutnya" melompati satu artikel —
pada panduan berurutan itu instruksi yang keliru, bukan sekadar tautan keliru.
Posisi karena itu dihitung terhadap seksi utuh.
