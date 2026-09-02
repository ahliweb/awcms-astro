---
bump: minor
tipe: struktur
dampak: publik
---

# Beranda akhirnya menunjukkan isinya, dan gerbang aset menemukan gaya yang salah alamat

Sampai hari ini, seorang pembaca yang mendarat di beranda tidak bisa melihat
**satu judul artikel pun**. Yang ada di sana adalah hero, tiga kartu kanal, dan
tiga baris prinsip penyusunan — ketiganya tentang situs, tidak satu pun berisi
apa yang ditulis situs itu. Untuk sampai ke sebuah artikel, pembaca harus lebih
dulu menebak kanal mana yang memuatnya.

Redesign ini menata ulang beranda dan kromium yang membingkai setiap halaman,
mengikuti rancangan yang dikerjakan bersama pemilik repo.

## Yang dilihat pembaca

- **Panel "terbaru" di dalam hero** — tiga artikel terbaru lintas kanal, dengan
  nama kanal dan tanggal terbitnya. Ia hilang seluruhnya pada situs yang belum
  punya artikel, dan hero-nya menjadi satu kolom.
- **Pita statistik** — jumlah kanal, jumlah artikel, dan tanggal tinjauan
  termuda di situs. Ia hanya muncul bila ada artikel; sel tanggalnya dilepas
  bila tanggalnya tidak ada.
- **Blok sorotan** — artikel paling baru, dengan gambarnya sendiri, dan baris
  "diperbarui" yang hanya tampil bila artikelnya benar-benar disunting setelah
  terbit ([ADR-0033](../docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)).
- **Sorotan dan panel tidak pernah menampilkan artikel yang sama.** Sorotan
  mengambil yang pertama, panel mengambil tiga berikutnya — dari satu daftar,
  dengan **pemutus seri pada slug**, karena dua artikel yang terbit pada detik
  yang sama akan bertukar tempat antar-build tanpa ada yang berubah.
- **Pita utilitas** di atas masthead memuat tagline, pengalih bahasa, dan
  pengalih tema. Ketiganya bukan navigasi isi, dan memindahkannya ke sana yang
  mengosongkan ruang bagi bilah kanal untuk naik ke baris masthead — sehingga
  halaman tidak lagi dibuka dengan dua baris kromium sebelum satu kata isi pun.
- **Bilah kanal menjadi pil, bukan tab bergaris bawah**, karena garis bawah
  hanya terbaca sebagai "yang ini sedang dibuka" selama bilahnya punya baris
  sendiri.
- **Pencarian berbentuk kotak cari** — kaca pembesar, bidang redam — tetapi
  tetap sebuah **tautan** ke `/cari/`. Bentuknya yang dicari mata; `<input>`-nya
  ditolak karena kotak yang menelan ketikan lalu diam tanpa JavaScript lebih
  buruk daripada tidak ada kotak.
- **Footer menjadi permukaan gelap tetap**, bersama pita utilitas dan hero.
  Ketiganya kini memakai kelompok token `--gelap-*` yang tidak ditimpa blok tema
  mana pun.

## Yang tidak ikut, dan kenapa

**Angka "Skor Lighthouse 100" dari rancangan.** Tidak ada apa pun di build ini
yang mengukurnya, jadi ia akan menjadi klaim yang dicetak setiap halaman dan
diperiksa tidak seorang pun — kelas cacat yang sama dengan `og:image` yang
menunjuk kartu yang tidak pernah dibangkitkan siapa pun, yang sudah pernah
ditolak repo ini. Tiga angka yang tersisa dihitung dari feed yang membangun
halaman itu juga.

**Pita buletin di badan beranda.** Formulirnya tetap di footer, tempat
[ADR-0049](../docs/adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)
menaruhnya: ia ada di setiap halaman tanpa pernah menyela apa yang sedang dibaca
seseorang.

## Dua cacat yang ditemukan sambil jalan

- **Nama situs menempel di tepi kiri layar pada 360px.** `.header-top` menulis
  `padding: 0.85rem 0` — sebuah *shorthand* — di elemen yang juga membawa
  `.container`, sehingga padding samping containernya menjadi nol. Di layar
  lebar hal itu tidak terlihat sama sekali, karena container sudah mentok
  `--max-width` dan margin otomatisnya yang memberi jarak. Diukur, bukan
  ditaksir dari tangkapan layar: `.brand-logo` berada di `x=0`.
- **Penafian di footer tidak terbaca.** `.disclaimer-footer` adalah pembungkus
  dua `<p>`, dan aturan elemen `p { color: var(--text-secondary) }` menargetkan
  paragraf itu langsung — jadi ia menang atas warna yang diwarisi dari
  pembungkusnya, dan penafiannya tampil `#334155` di atas `#090d16`.

## Gerbang aset menemukan gaya yang salah alamat

`bun run audit:aset` merah lebih dulu, dan yang ditunjuknya bukan beranda:
halaman `/cari/` melewati plafon 36.000 B karena **gaya hero** yang duduk di
`src/styles/global.css` sementara `Home.astro` satu-satunya pemakainya. Setiap
pembaca setiap halaman artikel, halaman seksi, dan halaman pencarian mengunduhnya
tanpa pernah merendernya. Memindahkan bloknya ke `<style>` komponennya
memulangkan **1.853 B ke setiap halaman**, bukan hanya ke yang merah.

- **Plafon total naik 36.000 → 40.000 B**, sebagai pengukuran dan bukan
  kelonggaran: beranda kini halaman terberat pada 38.136 B, dan kelebihannya
  adalah permukaan yang benar-benar baru. Ruang 1.864 B di atasnya sengaja
  sempit — plafon yang dinaikkan dengan kelegaan besar berhenti menangkap akresi
  berikutnya.
- **Yang TIDAK dikerjakan ditulis di dalam skrip gerbangnya**, supaya ia tidak
  diam-diam menjadi keadaan normal: `BaseLayout.css` masih 22.577 B dan masih
  mengirim gaya badan artikel, tabel biaya, dan akordeon ke setiap halaman yang
  tidak punya satu pun di antaranya.
- `docs/awcms-astro/standar-performa-dan-keamanan.md` baris 11 mencatat
  pengukuran barunya, dan `tests/audit-aset.test.mjs` ikut membuktikan plafon
  yang baru — bukan hanya yang lama diubah angkanya.

## Katalog dan dokumen

Dua belas string antarmuka baru masuk **kedua** katalog PO. `home.cta` berubah
bunyi dari "Mulai dari panduan" menjadi "Baca kanal": kartu kanal dulu
menyambungnya dengan nama kanal HURUF BESAR, sehingga kartu Panduan berbunyi
"Mulai dari panduan PANDUAN".

`docs/awcms-astro/ui-ux-design-system.md` mendapat empat seksi baru — permukaan
gelap tetap, bingkai halaman, permukaan beranda, dan tempat tinggal gaya sebuah
komponen — beserta cerminnya.

Empat dokumen lain diperbaiki karena redesign ini membuat kalimatnya TIDAK BENAR,
bukan sekadar kurang lengkap:

- **`AGENTS.md` §Gambar** berbunyi "setiap pemanggil merender
  `.visual-placeholder`". Hero beranda kini tidak, dan kekecualian itu ditulis
  beserta alasannya supaya ia tidak menyebar lewat peniruan ke bingkai yang
  memang menahan tata letak.
- **`checklist-repo-baru.md` dan skill `awcms-astro-situs-baru`** menjanjikan
  placeholder untuk setiap nama seni yang berkasnya tidak ada, termasuk `hero`.
- **`AGENTS.md` §Antarmuka** mendapat dua pelajaran yang ditemukan gerbang:
  `global.css` dimuat setiap halaman sehingga aturan milik satu komponen adalah
  byte yang dibayar semua halaman lain, dan shorthand `padding` pada elemen
  ber-`.container` menghapus padding sampingnya tanpa terlihat di layar desktop.
- **`standar-teknis.md` dan skill `awcms-astro-performa-keamanan`** menyebutkan
  anggaran gambar tetapi tidak pernah menyebutkan plafon byte skrip dan
  stylesheet sama sekali; keduanya kini menyebutnya berikut angkanya.
