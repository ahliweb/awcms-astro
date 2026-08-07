---
tipe: struktur
dampak: internal
---

# Publik sebagai fungsi utama; admin USER hanya bila dinyatakan

`AGENTS.md` berbunyi mutlak sejak ADR-0020: "Repo ini tidak memikul layar
admin." Kalimat itu menjawab pertanyaan yang salah. Yang benar-benar diputuskan
ADR-0020 adalah bahwa layar admin **sistem** — modul, peran, tenant, jejak
audit — dibangun di `awcms`, dan alasan itu masih berlaku. Yang tidak pernah
ditanyakannya: apakah seorang **pengguna** situs boleh mengerjakan bagiannya
sendiri di situs itu. Seorang penulis yang mengarang artikel bukan operator
platform, dan tidak satu pun alasan ADR-0020 berlaku padanya.

Alasan lengkapnya di
[ADR-0034](../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md).

- **Fungsi utama repo ini tetap halaman publik**, dan sekarang itu keadaan yang
  ditegakkan alih-alih kalimat. Template menyatakan nol permukaan
  terautentikasi, dan `bun test` merah bila ada rute yang menyelinap keluar dari
  `output: 'static'` tanpa dinyatakan.
- **Selain itu**, sebuah situs boleh menyatakan permukaan admin untuk **user** —
  penulis, peninjau, kontributor — lewat `permukaanAdmin` di
  `src/config/site.ts`. Kosong berarti publik saja, dan itu bawaannya.
- **Admin utama tidak pernah di sini.** `owner` ditolak gerbang, apa pun
  kapitalisasinya; layar yang mengelola sistem tetap di `/admin/*` milik
  `awcms`.
- **Permukaan admin duduk di SEBELAH halaman publik, tidak menggantikannya.**
  Prefiks `/`, prefiks locale, dan slug tab ditolak — ketiganya menaruh bagian
  publik di belakang login sambil tetap membangun hijau.
- **Menyatakannya tidak memindahkan satu izin pun.** RBAC/ABAC default-deny
  `awcms` tetap yang memutuskan; deklarasi di sini menggambar tombol.
- **Tidak ada fitur yang hanya ada di sini.** Setiap fitur yang dipakai user
  wajib juga bisa dikelola `owner` di `awcms` — aturan yang berlawanan arah
  dengan larangan `owner` dan justru melengkapinya: yang satu menjaga owner tak
  bisa MASUK, yang lain menjaga tak ada yang LEPAS. Urutan kerjanya karena itu
  `awcms` dulu, selalu.
- **Template ini memang dimaksudkan tumbuh menjadi banyak variasi**, dan yang
  bervariasi adalah bentuk permukaannya — bukan kumpulan kemampuannya.
- **Satu `awcms`, banyak situs.** Sebuah instans `awcms` boleh memiliki banyak
  repo situs sekaligus; semuanya merujuk `awcms` yang sama sebagai backend dan
  sebagai admin utama. Konsekuensinya ditulis sebagai aturan: jangan menulis
  kode yang mengandaikan situs ini satu-satunya, dan kemampuan yang dipakai
  lebih dari satu situs tinggal di `awcms` sekali — bukan disalin per situs.

Yang hanya terasa saat mengembangkan:

- `tests/peran-situs.test.mjs` menegakkan seluruh aturan di atas atas KODE,
  bukan atas dokumen — termasuk memindai `src/pages/**` untuk `prerender =
  false` dan menuntut prefiksnya dinyatakan, serta menuntut `AGENTS.md` sendiri
  menyebut deklarasi dan peran yang dilarang.
- Tidak ada kode permukaan admin yang mendarat. Yang mendarat aturannya,
  deklarasinya, dan gerbangnya; implementasinya masih ditahan uji ADR-0023
  persis seperti BFF Jualanku, karena ia memanggil `awcms` di setiap permintaan
  runtime.
- Selisih dengan `awcms` ADR-0051 ("seluruh layar admin dibangun di `awcms`")
  dinyatakan terus terang di ADR-0034 §Hubungan, beserta catatan bahwa ia
  pantas dicatat sebagai divergence keluarga di sisi `awcms` — yang tidak bisa
  ditulis dari repo ini.
