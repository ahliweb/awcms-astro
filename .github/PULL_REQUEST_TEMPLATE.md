## Ringkasan

<!-- Apa yang berubah dan KENAPA. Bagian "kenapa" yang paling bernilai; "apa" bisa dibaca dari diff. -->

Closes #

## Jenis perubahan

- [ ] Konten (artikel, koreksi tarif/syarat/data unit)
- [ ] Terjemahan
- [ ] Fitur atau perbaikan kode
- [ ] Dokumentasi / ADR / skill
- [ ] Dependency atau perkakas

## Verifikasi konten

<!-- Wajib bila menyentuh nominal, denda, syarat, dasar hukum, atau data unit layanan. -->

- [ ] Setiap nominal punya `biaya[].sumber` dan `dasarHukum` lengkap
- [ ] PNBP pusat dan pajak daerah Kalteng dipisah lewat `biaya[].jenis`
- [ ] `cakupan` sesuai level keberlakuan informasinya
- [ ] Denda ditulis sebagai ancaman maksimum menurut undang-undang
- [ ] `updatedDate` dan `reviewDueDate` diperbarui

Sumber resmi yang dipakai:

<!-- Tautan atau nomor peraturan. Kosongkan bila PR ini tidak menyentuh konten. -->

## Definition of Done

- [ ] `npm run build` sukses tanpa error `astro check`
- [ ] `npm run audit` melaporkan 0 error
- [ ] `npm audit` melaporkan 0 kerentanan
- [ ] Tampilan layak pakai dari 360px sampai desktop
- [ ] Dokumentasi diperbarui bila workflow/struktur/konfigurasi berubah
- [ ] Changeset ditulis di `.changesets/`
- [ ] ADR ditulis bila menyentuh standar dasar

## Catatan untuk reviewer

<!-- Bagian yang perlu perhatian khusus, atau keputusan yang masih terbuka. -->
