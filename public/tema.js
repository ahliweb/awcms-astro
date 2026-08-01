/*
 * Pengalih tema — satu-satunya JavaScript di situs ini yang harus jalan SEBELUM
 * halaman terlukis.
 *
 * ## Kenapa ia berkas tersendiri, bukan `<script is:inline>` di BaseLayout
 *
 * Skrip inline diblokir `script-src 'self'` tanpa `'unsafe-inline'`, dan
 * `'unsafe-inline'` membatalkan hampir seluruh gunanya script-src. Selama kode
 * ini tinggal di dalam HTML, CSP situs ini tidak bisa ketat — bukan karena ada
 * yang berbahaya di sini, melainkan karena browser tidak bisa membedakan skrip
 * ini dari skrip yang disuntikkan orang lain ke dalam halaman yang sama.
 *
 * ## Kenapa ia dimuat dengan `<script src>` biasa, bukan modul
 *
 * Astro membundel `<script>` biasa menjadi `<script type="module">`, dan modul
 * SELALU ditunda sampai dokumen selesai diurai. Penundaan itu persis yang tidak
 * boleh terjadi di sini: `data-theme` dipasang setelah halaman terlukis berarti
 * pembaca yang memilih tema gelap melihat kedipan putih di setiap perpindahan
 * halaman. Skrip klasik tanpa `defer`/`async` di dalam `<head>` menahan
 * pengecatan sampai ia selesai — itulah yang dibutuhkan, dan itu sebabnya
 * berkas ini tinggal di `public/` alih-alih diimpor sebagai modul.
 *
 * Konsekuensinya: berkas ini TIDAK ber-hash pada namanya, jadi ia disajikan
 * dengan `Cache-Control: must-revalidate` seperti HTML (lihat
 * `server/penyaji.mjs`) — berubah setelah rebuild tanpa perlu menunggu cache
 * pembaca kedaluwarsa. Jangan memindahkannya ke `/_astro/`.
 *
 * Tanpa JavaScript sama sekali, `data-theme` tidak pernah terpasang dan tema
 * mengikuti `prefers-color-scheme` lewat media query di `global.css`. Itu
 * keadaan yang didukung, bukan kegagalan.
 */
(function () {
  var root = document.documentElement;

  // Penanda "JS hidup" untuk gaya yang hanya masuk akal saat skrip jalan.
  // Belum ada satu pun aturan di `global.css` yang memakainya; ia disediakan
  // untuk situs turunan, dan disebutkan di sini supaya tidak dikira mati.
  root.classList.add('has-js');

  function temaAwal() {
    try {
      var tersimpan = localStorage.getItem('theme');
      if (tersimpan === 'light' || tersimpan === 'dark') return tersimpan;
    } catch (e) {
      /* localStorage diblokir: pilihan pembaca tidak bisa dibaca, lanjut ke sistem */
    }

    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  root.dataset.theme = temaAwal();

  function pasangTombol() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (tombol) {
      tombol.addEventListener('click', function () {
        var berikutnya = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = berikutnya;
        try {
          localStorage.setItem('theme', berikutnya);
        } catch (e) {
          /* localStorage diblokir: tema tetap berganti untuk sesi ini */
        }
      });
    });
  }

  // Berkas ini dieksekusi di dalam `<head>`, jadi tombolnya belum ada saat
  // baris ini berjalan. Cabang kedua menjaga berkas ini tetap benar bila suatu
  // saat ia dimuat setelah dokumen selesai diurai.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pasangTombol);
  } else {
    pasangTombol();
  }
})();
