---
tipe: struktur
dampak: internal
---

# Gerbang audit dokumen, dan penahanan yang dipersempit supaya ia bisa mendarat

Changeset sebelumnya menutup indeks ADR yang mendaftarkan enam keputusan yang
tak pernah ada di repo ini, lalu menulis bahwa **gerbangnya** ditahan
[ADR-0021](../docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md).
Gerbang itu mendarat di sini.

## Kenapa penahanannya dipersempit lebih dulu

[ADR-0023](../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md),
aturan pemilik 3 Agustus 2026: pekerjaan yang tidak membutuhkan repo
`ahliweb/awcms` boleh mendarat.

ADR-0021 menahan pengembangan dengan alasan yang masih benar — fitur di atas
kontrak `awcms` yang belum keras ditulis dua kali — tetapi mengasumsikan
**seluruh** sisa backlog menunggu `awcms`. Asumsi itu tidak bertahan satu hari:
butir pertama §Titik lanjut-nya sendiri berbunyi "tidak lagi diblokir `awcms`",
dan cacat indeks ADR tidak menyentuh `awcms` sama sekali.

Ujinya satu pertanyaan: **apakah perubahan ini akan ditulis ulang bila `awcms`
berubah?** Tidak → mendarat; ya → ditahan. Batasnya dinyatakan supaya tidak
melar: "endpoint-nya sudah ada" bukan jawaban "tidak", karena kode yang
memanggil `awcms` bentuknya tetap ditentukan respons `awcms` — dan repo template
ini tidak punya instans untuk membuktikannya.

## Apa yang diperiksa gerbangnya

`bun run audit:dokumen` (`scripts/audit-dokumen.mjs`), di job `check` CI — tanpa
build, tanpa jaringan, tanpa `awcms`:

- **Tautan markdown mati**, diselesaikan dari letak berkas yang memuatnya. Itu
  membuat aturan tautan `.changesets/` ikut terjaga tanpa satu pun pengecualian
  khusus. URL eksternal dan anchor sengaja dilewati, dan alasannya ditulis di
  berkasnya — gerbang yang merah karena situs pihak ketiga sedang mati adalah
  gerbang yang orang belajar mengabaikan.
- **Indeks ADR lengkap DUA ARAH.** Tiap ADR tercatat di tabel, tiap baris
  menunjuk berkas yang ada. Satu arah saja tidak cukup: cacat 3 Agustus
  melanggar keduanya sekaligus.
- **Kolom Status setuju dengan `- **Status:**` di berkas ADR-nya.** Tabel yang
  menulis "Diterima" untuk ADR yang sudah `Superseded` dibaca sebagai keputusan
  yang masih berlaku. Status yang tidak dikenal **dilaporkan**, bukan dilewati
  diam-diam.

## Gerbangnya sendiri dibuktikan dua arah

`tests/audit-dokumen.test.mjs` menjalankan skrip atas pohon fixture sungguhan:
tiap kelas cacat **MERAH** saat cacatnya ada, **HIJAU** saat tidak. Pemeriksa
yang menjawab "bersih" untuk pohon yang cacat mengulang cacat aslinya satu
tingkat lebih tinggi — kali ini dengan tanda centang di sampingnya.

Kasus terakhirnya menjalankan gerbang atas repo ini sendiri, jadi `bun test`
ikut menjaga dokumennya, bukan hanya skripnya.

## Yang ikut berubah

- `bun run release` menjalankannya **sebelum** changeset dilipat — sesudahnya,
  berkas yang tautannya salah sudah tidak ada untuk diperiksa.
- Definition of Done di `AGENTS.md` menambahkan satu butir: menambah ADR berarti
  menambah barisnya di `docs/adr/README.md`.
