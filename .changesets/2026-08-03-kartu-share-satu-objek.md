---
tipe: perbaikan
dampak: publik
---

# `og:image:alt` berhenti memerikan gambar yang lain

Halaman seksi memasang `og:image` **kartu situs** dengan `og:image:alt` yang
memerikan **hero seksinya**. Halaman artikel melakukan hal yang sama dengan alt
hero artikelnya. Dua tag, dua gambar berbeda, satu kartu yang benar-benar
dibagikan.

Yang menanggungnya pembaca dengan pembaca layar di lini masa sosial: mereka
mendengar deskripsi gambar yang **tidak sedang ditampilkan** kepada mereka. Dan
tidak ada satu pun gerbang yang bisa melihatnya — kedua tag ada, keduanya
terisi, dan keduanya masuk akal dibaca sendiri-sendiri.

## Diperbaiki dengan membuatnya tidak bisa ditulis

`ogImage`, `ogImageAlt`, `ogImageType`, `ogImageWidth`, `ogImageHeight` menjadi
**satu** prop `shareCard` bertipe `KartuShare`. Selama `src` dan `alt` adalah
dua nilai terpisah, keduanya bisa datang dari dua gambar berbeda; digabung, itu
berhenti bisa terjadi.

`BaseLayout` yang jatuh ke kartu situs saat halaman tidak membawa kartunya
sendiri — beserta alt kartu situs, bukan alt gambar lain yang kebetulan ada di
halaman itu. Lima prop menjadi satu, dan satu kelas cacat hilang bersamanya.

## Yang tidak berubah

Halaman tanpa kartu mana pun tetap tidak memasang tag gambar sama sekali, dan
`twitter:card` tetap turun ke `summary` alih-alih menjanjikan kartu besar yang
tidak ada.
