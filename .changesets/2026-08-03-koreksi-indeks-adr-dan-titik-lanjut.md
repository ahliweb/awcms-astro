---
tipe: dokumentasi
dampak: internal
---

# Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah

Tiga dokumen berhenti benar, dan [ADR-0021](../docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md)
menyebut kelas ini cacat, bukan pekerjaan baru — jadi ia mendarat selama
penahanan. Tak ada satu baris kode pun yang berubah.

## Indeks ADR mendaftarkan enam keputusan yang tak pernah ada di sini

[`docs/adr/README.md`](../docs/adr/README.md) memuat tabel repo rujukan sejak
hari ia mendarat (commit `52baf90`, bersama ADR-0014/0015). Keenam berkas yang
ditautkannya **tidak pernah ada di repo ini** — `git log --diff-filter=A --
docs/adr/` membuktikannya, tidak ada penghapusan mana pun — sementara sembilan
ADR yang benar-benar mendarat (0014–0022) tak satu pun tercatat.

Satu barisnya membantah kode: "Satu bahasa, tanpa mesin i18n", padahal repo ini
menyajikan dua locale lewat katalog PO. Indeks yang salah lebih buruk daripada
tidak ada indeks — ia dibaca sebagai daftar keputusan yang berlaku.

Tidak ada gerbang yang bisa menangkapnya: `bun run audit:konten` memeriksa
tautan mati pada **keluaran build**, dan markdown tidak ikut dibangun.
Gerbangnya sendiri ditahan ADR-0021 dan dicatat sebagai butir pertama saat
penahanan dicabut.

## Titik lanjut "filter locale" berbalik arah, bukan sekadar usang

`awcms` [#346](https://github.com/ahliweb/awcms/pull/346) mendarat pada hari
yang sama dengan ADR-0021 dan menutup sisinya: `?locale=` cocok-persis, absen
berarti seluruh locale, kosong dibalas 400.

Yang penting bukan itu, melainkan alasan butirnya yang **salah**: ia menulis
"berlebih untuk situs satu bahasa", padahal template ini menyajikan dua locale
dan memasangkannya lewat `translationGroupId`. Memakai `?locale=id` membuang
setiap baris `en` tanpa satu pun gerbang merah — `assertTranslationsArePairable`
menangkap terjemahan yang tiba tanpa grup, bukan terjemahan yang tidak pernah
ditarik. Hasilnya build hijau yang menerbitkan `/en/**` sebagai bahasa Indonesia
berpenanda "belum diterjemahkan": bentuk kegagalan yang sama persis dengan
ADR-0018 (`view=full` diabaikan → setiap artikel kosong, build hijau).

Butirnya kini menyatakan filter itu hanya bernilai untuk deployment satu-locale,
dan bahwa dua locale berarti dua traversal — bukan satu yang lebih ramping.

## Indikator pencabutan penahanan: satu dari dua terpenuhi

Kriteria 1 ADR-0021 (setiap modul `awcms` punya layar) **sudah nol** —
diverifikasi dengan `grep -L 'navigation:' src/modules/*/module.ts` di `awcms`,
ke kode dan bukan ke tabel `PROJECT_STATE.md` yang sudah pernah basi tanpa ada
yang merah. Kriteria 2 (§4 "yang belum" habis) **belum**: business-scope
resolver base masih NO-OP, rute konten host-based masih follow-up, dan
`newsletter`/`social-publishing`/pustaka komponen Wave 0/Wave 3 belum diserap.

Penahanan **tetap berlaku** — yang mencabutnya pernyataan pemilik, bukan skor
indikator.
