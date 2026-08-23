---
bump: minor
tipe: konten
dampak: publik
---

# Seorang penulis yang memilih punya byline akhirnya terbaca namanya

`awcms` ADR-0109 menambahkan `authorByline` pada baris post — sebuah nama yang
penulisnya sendiri isi lewat `PATCH /api/v1/auth/profile`, bukan nama akunnya.
Field itu menumpang `GET /api/v1/blog/posts?view=full`, yang **sudah** disusuri
build ini setiap kali, dan sampai perubahan ini tidak ada yang membacanya. Itu
`awcms` #597 butir 4.

Karena tidak ada permukaan baru yang dipanggil, gerbang permukaan di
`tests/kontrak-awcms.test.mjs` tidak berubah warna sedikit pun. Itu yang membuat
perubahan ini murah — dan itu juga yang membuatnya butuh
[ADR-0042](../docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md):
perubahan yang tidak bisa dilihat gerbang mana pun adalah perubahan yang tidak
dipaksa dibaca siapa pun.

## Ketiga permukaan, bukan satu

Halaman artikel (`✍️ Ditulis oleh …`), `author` JSON-LD, dan entry artikel itu di
feed Atom. Feed yang mengkredit organisasi sementara halamannya mengkredit
seseorang adalah dua jawaban atas satu pertanyaan, dan pelanggan feed hanya
melihat salah satunya.

## Yang tidak ada tetap tidak ada

`NULL` — keadaan setiap baris yang terbit sebelum ADR itu — merender **tanpa
baris byline sama sekali**, bukan baris yang membawa nama penerbit di
belakangnya. Penulis yang tidak memilih byline sudah membuat sebuah pilihan, dan
mengisi kekosongan itu dengan nama organisasi akan mencetak atribusi yang
terbaca sebagai nama seseorang. `awcms` yang mendahului ADR-0109 tidak mengirim
field-nya sama sekali, dan situsnya tetap terbangun.

Di feed, ketiadaan itu bahkan tidak perlu ditulis: Atom (RFC 4287 §4.2.1)
menetapkan `<author>` tingkat feed berlaku bagi setiap entry yang tidak punya
sendiri.

## Nama, dan tidak lebih

Tanpa `@id`, `url`, atau `sameAs` di JSON-LD; tanpa `<uri>` atau `<email>` di
feed. Kedua format punya tempat untuk semuanya, dan menambahkannya kelak adalah
beberapa karakter yang akan lolos setiap gerbang lain — jadi penolakannya
ditegaskan di `tests/schema.test.mjs` dan `tests/feed.test.mjs`.

Byline adalah kredit atas satu tulisan. Pengenal atau tautan profil mengubahnya
menjadi identitas yang bisa diikuti lintas artikel dan lintas situs, sesuatu yang
tidak diminta siapa pun dengan mengisi satu kolom nama.

## Baris terjemahan, bukan baris sumber

Berbeda dari `termIds`/`urutan`/`kategori`, yang sengaja dibaca dari post sumber
supaya penerjemah yang membiarkan klasifikasinya kosong tidak menjatuhkan artikel
keluar dari arsip satu bahasa saja. Kepenulisan bukan klasifikasi: terjemahan
sering ditulis orang lain, dan mengambil nama penulis sumber untuknya mengkredit
seseorang atas teks yang tidak ia tulis.

Membalik baris itu lolos typecheck dan lolos setiap gerbang lain, jadi ia
dibuktikan lewat mutasi: mengubah `post` menjadi `source` memerahkan tepat satu
tes, dan tes itu ditulis lebih dulu untuk memastikannya bisa merah.

## Satu klaim yang berhenti benar, di tiga dokumen

`docs/awcms-astro/standar-performa-dan-keamanan.md` dan kedua berkas skill
integrasi menyatakan, sebagai sebuah properti, bahwa template ini menerbitkan
**nol data per-orang**. Dua di antaranya melanjutkan dengan apa yang akan berlaku
bila itu berubah: *"situs yang menambah byline … mengambil kewajibannya, dan
jalur penghapusannya berakhir di sebuah rebuild"*.

Kewajiban itu kini hidup, dan ketiga dokumen dikoreksi alih-alih dibiarkan
berdiri. Sebuah dokumen yang memerikan properti yang tidak lagi dimiliki kode
mengirim pembaca berikutnya mencari cacat, bukan membaca keputusan — kelas
kegagalan yang sudah berulang di keluarga repo ini.

Yang **tidak** berubah: `AGENTS.md` §Keamanan tentang tidak mengumpulkan data
pribadi **pembaca**. Itu aturan yang berbeda, dan byline adalah data tentang
orang yang menulis artikelnya, diterbitkan atas permintaannya sendiri.
