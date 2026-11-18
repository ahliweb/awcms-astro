---
bump: minor
tipe: struktur
dampak: publik
---

# Panel preferensi baca di setiap halaman publik (ADR-0055)

Setiap halaman kini punya tombol melayang "Pengaturan aksesibilitas" yang membuka
dialog kecil non-modal: ukuran teks (normal, besar, sangat besar) dan enam
sakelar, yaitu kontras tinggi, monokrom, teks ramah disleksia, garis bawah semua
tautan, sorot tautan, dan kurangi gerakan, ditambah "Reset ke standar". Pilihan
disimpan di `localStorage` (kunci `awcms-a11y`) pada perangkat pembaca dan tidak
dikirim ke mana pun; panel bukan overlay pihak ketiga, tidak menulis ulang konten,
dan tidak mengklaim halaman memenuhi suatu standar.

- Pembaca: tombolnya muncul hanya bila JavaScript jalan. Tanpa nilai tersimpan,
  kontras tinggi dan kurangi gerakan mengikuti `prefers-contrast: more` dan
  `prefers-reduced-motion: reduce`; pembaca boleh menimpanya di panel. Kontras
  tinggi tidak diterapkan di bawah `forced-colors: active`.
- Situs turunan: skrip awal klasik baru `public/aksesibilitas.js` (dimuat
  setelah `tema.js`), bundel panel, dan `src/styles/aksesibilitas.css`. CSP tidak
  berubah. Fitur gerak baru wajib berhenti di bawah `data-a11y-motion="reduce"`
  dan mendengarkan event `awcms-a11y-change`.
- Anggaran aset `audit:aset` naik karena panel ada di setiap halaman: skrip
  13.000 → 18.500 B dan total 40.000 → 53.700 B per halaman (terukur, tertulis di
  `scripts/audit-aset.mjs`). Blok `prefers-reduced-motion` di `global.css` kini
  hanya berlaku selama `data-a11y-ready` belum ada.
- Tiga tata letak diubah agar teks sangat besar tidak membuat halaman tergulir ke
  samping di 360 px: kisi prinsip di beranda, daftar tombol bagikan, dan lencana
  hijau pada kontras tinggi.
- Belum dikerjakan, dicatat sebagai tindak lanjut: uji browser Playwright dan axe,
  serta uji kegunaan dengan pembaca sungguhan pada UAT.
- Dokumen: ADR-0055 dan mirror Indonesia, indeks ADR, desain UI, standar teknis,
  standar performa dan keamanan, README, deploy-coolify, dan AGENTS diperbarui.
