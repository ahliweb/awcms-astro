Template awal `awcms-astro`, diekstraksi dari `web-lalulintasmelayani.com`.

Yang dibawa: seluruh lapisan render — komponen tanpa JavaScript, design token,
standar interaksi kilau hover, katalog PO, JSON-LD, dan pola `views/` yang
membuat satu badan halaman melayani semua locale.

Yang diganti: sumber datanya. `src/lib/content.ts` dulu membaca markdown lewat
`getCollection`; sekarang ia memanggil awcms dan tetap menghasilkan bentuk
`LocalizedArticle` yang sama persis. Tidak ada satu komponen pun yang berubah
karena itu — yang justru membuktikan aturan "komponen tidak pernah mengambil
datanya sendiri" memang berlaku, bukan sekadar tertulis.

Yang dibuang: seluruh konten dan data khas Kalimantan Tengah, empat katalog
bahasa daerah, sistem gambar artikel yang terikat 30 SVG buatan tangan, dan
gerbang audit konten yang aturannya khas domain.

Yang diperbaiki dibanding asalnya: `@import` Google Fonts dihapus (ia mengirim
IP setiap pembaca ke pihak ketiga sebelum pembaca melakukan apa pun), dan blok
konten dirender dari struktur ter-escape sehingga tidak ada jalur HTML mentah
dari CMS sama sekali.
