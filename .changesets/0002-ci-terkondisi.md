Pisahkan CI menjadi `check` (selalu jalan) dan `build` (butuh sumber konten).

`main` merah sejak commit pertama, dan alasannya struktural: `npm run build`
menarik konten dari awcms sungguhan, sedangkan repo template ini sendiri tidak
punya instans awcms — ia cetakan, bukan situs.

Godaan yang ditolak: memberi build sebuah awcms tiruan supaya selalu hijau. Itu
membuat gerbangnya lulus tanpa pernah membuktikan template ini bisa bicara
dengan sumber kontennya, sehingga kerusakan integrasi baru ditemukan di
produksi.

Yang dilakukan: `astro check` selalu jalan (ia menangkap sebagian besar cara
template ini bisa rusak dan tidak butuh konten sama sekali), sementara build
penuh jalan bila dan hanya bila `vars.AWCMS_API_URL` diisi — yang di sebuah
SITUS nyata selalu terjadi. Kondisinya ditulis ke ringkasan run, supaya "build
tidak jalan" tidak pernah menyamar sebagai "build lulus".
