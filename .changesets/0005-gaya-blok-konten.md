Beri gaya pada kelas blok konten yang lahir di #6.

Kelas `galeri`, `galeri-item`, `video-berita`, dan `blok-tak-tersedia` sengaja
dibiarkan tanpa gaya saat renderer bloknya mendarat, karena #4 sedang menetapkan
standar rasio gambar dan menebak rasionya lebih dulu berarti memotong gambar di
setiap ukuran layar — diam-diam, persis kegagalan yang #4 tulis untuk dicegah.
Sekarang #4 sudah mendarat, jadi galeri memakai `--ratio-visual` seperti setiap
bingkai lain di berkas ini.

Semuanya memakai token yang sudah ada; tidak ada nilai lepas.

`blok-tak-tersedia` sengaja TERLIHAT, bukan disamarkan. Ia menandai lubang di
halaman — gambar yang butuh resolusi media, atau tipe blok yang belum dikenali
renderer — supaya ketahuan saat review, bukan saat dibaca pembaca. Kalau suatu
hari ia terasa mengganggu, jawabannya menutup lubangnya, bukan memudarkan
penandanya.
