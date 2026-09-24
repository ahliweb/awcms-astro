---
bump: minor
tipe: struktur
dampak: internal
---

# Graf pengetahuan mendapat catatan kurasi dan ekspor Obsidian tervalidasi

`awcms-one` sudah lebih dulu membangun lapis navigasi developer di atas
graphify-nya sendiri (`awcms-one#11`): graf hasil generate, catatan kurasi
tulisan tangan, dan ekspor Obsidian di belakang gerbang `audit:graf`.
`awcms#805` yang seharusnya menstandarkan bentuk ini dari sisi backend masih
terbuka dan belum dikerjakan **saat pekerjaan ini dimulai** — tidak ada apa pun
yang kanonik untuk ditiru atau ditunggu; ia baru mendarat di tengah jalan, dan
sejalan, seperti dicatat di bawah — jadi repo ini mengadopsi bentuk
`awcms-one` sekarang, dan
menyimpang darinya di tepat tempat bentuknya tidak cocok di sini: repo ini
tidak punya subtree untuk difederasikan, dan sebuah ekspor penuh graf ini
berjumlah kira-kira 1.500 berkas — jauh lebih besar relatif terhadap apa pun
yang pernah ingin dilacak repo ini ([ADR-0051](../docs/adr/0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md)).

Empat skrip baru (`scripts/knowledge-graph-update.mjs`,
`scripts/knowledge-graph-label.mjs`, `scripts/knowledge-obsidian-export.mjs`,
dan logika murninya di `scripts/lib/obsidian-safety.mjs` +
`scripts/lib/graf-staleness.mjs`) berdiri di belakang empat entri
`package.json`: `knowledge:graph:update`, `knowledge:graph:label`,
`knowledge:obsidian:export`, dan `knowledge:check` — yang terakhir sengaja
sebuah ALIAS untuk `bun run audit:graf`, bukan gerbang kedua yang membaca
artefak yang sama, persis seperti yang diminta isu #113 sendiri. Direktori
baru `knowledge/` terbelah dua: `curated/` (tulisan tangan, terlacak, hanya
Inggris) dan `generated/` (keluaran ekspor, diabaikan git — tidak pernah
terlacak, berbeda dari `awcms-one`, karena preseden `graph.html`/`redesign/`
repo ini sudah menolak artefak selaju itu pada ukuran yang jauh lebih kecil).
`audit:graf` sendiri mendapat dua pemeriksa baru: fail-closed atas apa pun
yang terlacak di bawah `knowledge/generated/` atau jalur `.obsidian/` mana
pun, dan kesegaran konten BERBATAS (`MAX_STALE_FILES = 40`) yang
mereproduksi `ast_hash` graphify sendiri lewat `node:crypto` — tanpa
`graphify` terpasang, karena CI memang tidak memilikinya di `PATH`.

**Temuan yang menambah skrip keempat: `graphify cluster-only` tidak
deterministik di repo ini, terukur bukan sekadar diduga.** Tiga kali
dijalankan berturut-turut atas graf yang byte-nya identik (1.404 node, 2.717
edge), hasilnya 92, lalu 90, lalu 91 komunitas. Karena label kuratif diikat
ke ID komunitas, alur penamaan yang didokumentasikan di hulu — edit
`.graphify_labels.json`, lalu jalankan ulang `cluster-only` untuk
menerapkannya — tidak akan pernah konvergen di sini: setiap jalannya
sekaligus mempartisi ulang graf yang sedang diberi nama, dan itulah mekanisme
persis di balik insiden yang sudah tercatat di repo ini sendiri (60 dari 101
label menempel di komunitas yang salah, di dalam JSON yang sah, dengan semua
gerbang lain hijau). `knowledge:graph:label` memisah tugas itu: `update`
memegang PARTISI (boleh memindah komunitas, karena itu tugasnya) dan `label`
memegang NAMA, diterapkan ke partisi yang sudah ada di disk, tanpa pernah
memanggil `graphify` atau menyentuh `node.community` — fail-closed atas nama
yang hilang, berbentuk nama berkas, placeholder `Community N`, kosong, atau
kembar, dan menulis `.graphify_labels.json.sig` PALING AKHIR supaya jalan
yang ditolak tidak pernah meninggalkan tanda tangan yang mengklaim partisi
sudah dikurasi padahal belum. Keadaan graf saat ini, setelah rebuild dan
sesi penamaan yang menemukan ini: **1.404 node, 2.717 edge, 91 komunitas**,
semua 91 nama berbeda dan diturunkan dari isi (sebelumnya 1.421 / 2.603 / 97;
rebuild-nya sendiri murni kode dan tidak memakan token).

Dua hal lagi yang ditemukan justru saat menjalankan ini sungguhan, bukan saat
merancangnya:

- **Ekspor nyata memerahkan `audit:dokumen`.** Gerbang itu membaca POHON KERJA,
  bukan indeks git, jadi 1.496 catatan hasil ekspor — yang gitignored dan tidak
  pernah masuk riwayat — tetap ia baca, lalu menuntutnya memenuhi aturan
  kutipan ADR: catatan graphify mengutip `ADR-0090`/`ADR-0098` milik `awcms`
  dari isi node yang diindeksnya, tanpa penanda repo-lain. Menuntut keluaran
  mesin menulis prosa repo ini adalah tuntutan yang salah sasaran, jadi
  `knowledge/generated/` kini dikecualikan lewat prefiks JALUR (bukan nama
  direktori — `docs/generated/` mana pun tetap dibaca), dan kedua arah itu
  dibuktikan `tests/audit-dokumen.test.mjs`.
- **CodeQL menolak escape separuh jalan di `knowledge:graph:label`.** Nama
  komunitas masuk `GRAPH_REPORT.md` di dalam heading berkutip, dan versi
  pertama meng-escape `"` tanpa meng-escape `\` — persis
  `js/incomplete-sanitization`. Alih-alih melengkapi escape-nya, nama yang
  memuat `"` atau `\` sekarang DITOLAK di tahap validasi: tidak ada komunitas
  di repo ini yang pernah butuh salah satunya, jadi tidak ada yang hilang, dan
  tidak ada escape tangan yang bisa jadi separuh jalan lagi.

**Temuan susulan: `awcms#805` mendarat, dan sejalan dengan desain ini.** Isu
yang tadinya terbuka dan tanpa linimasa itu tertutup sebagai selesai pada
2026-09-23T22:25:59Z, lewat PR #819 milik `awcms` dan tercatat sebagai `awcms`
ADR-0124. Kedua desain konvergen secara independen — vault `knowledge/`
khusus, catatan kuratorial di samping ekspor sekali pakai, sinkronisasi
daftar-izin gagal-tertutup dari direktori staging terisolasi — dan `awcms`
ternyata juga tidak melacak vault generate-nya sendiri (`.gitignore`-nya
mengecualikan `knowledge/generated/*`, hanya melacak satu README). Jadi tak
melacak `knowledge/generated/` di sini SEJALAN dengan `awcms`, bukan
divergensi darinya — divergensinya cuma dari `awcms-one`, yang tetap
melacak direktori padanannya. Satu divergensi nyata dari `awcms` bertahan:
`awcms` menerjemahkan pohon pengetahuannya ke Bahasa Indonesia, repo ini
tidak, karena situs turunan repo ini akan menulis ulang catatan kuratorialnya
sendiri dan penerjemahan akan menggandakan beban itu per situs. `ADR-0051`
dan `knowledge/README.md` diperbarui dengan temuan ini.

Satu gagasan `awcms` ADR-0124 juga diadopsi apa adanya: `knowledge/generated/`
tetap membawa SATU berkas terlacak, READMEnya sendiri, supaya direktori itu
tidak terbaca hilang atau kosong di klon yang baru. `audit:graf` mengizinkan
tepat jalur itu — dicocokkan PERSIS, bukan sebagai pola, karena graphify
memancarkan satu catatan per node dan sebuah node berlabel `README.md` akan
menjadi `knowledge/generated/graphify/README.md` yang pola berbasis nama akan
lewatkan. Keduanya dibuktikan `tests/audit-graf.test.mjs`.

Tinjauan adversarial atas kode baru ini menemukan empat cacat lagi, dan
keempatnya diperbaiki sebelum mendarat — dicatat karena tiga di antaranya adalah
kelas cacat yang lolos dari setiap gerbang:

- **`knowledge:graph:label` merusak format angka artefak terlacak.** Versi
  pertamanya mem-`JSON.parse` lalu `JSON.stringify` seluruh `graph.json`.
  JavaScript tidak membedakan int dan float, jadi setiap float bulat yang
  ditulis graphify jadi gepeng: `"confidence_score": 1.0` menjadi `1` pada
  **5.372 baris**, dan akan berbalik lagi pada run graphify berikutnya — persis
  derau permanen yang docblock-nya sendiri klaim dicegah. Sekarang ia menyunting
  `graph.json` sebagai TEKS dan hanya mengganti isi ruas `"community_name"`,
  jadi setiap byte lain tinggal sebagaimana graphify menulisnya. Jumlah ruas itu
  DIPERIKSA terhadap jumlah node dan ditolak bila tak cocok, dan kerusakan yang
  sudah ter-commit diperbaiki.
- **Gerbang kebasian bisa hijau tanpa mengukur apa pun.** Himpunan kandidatnya
  diturunkan dari ekstensi yang sudah tercatat di `manifest.json`, jadi manifest
  kosong menghasilkan kandidat kosong, total 0, dan CATATAN BERSIH betapa pun
  jauh pohon sudah hanyut. Keduanya sekarang ditolak eksplisit: gerbang yang
  melaporkan nol hanyut karena tidak mengukur apa pun lebih buruk daripada tidak
  ada gerbang, karena ia dipercaya.
- **`.canvas` berada di luar batas tabrakan.** Himpunan nama kuratorial hanya
  mengumpulkan `.md`, padahal `.canvas` ikut disinkron dan graphify memang
  memancarkan `graph.canvas` — jadi sebuah `knowledge/curated/x.canvas` tulisan
  tangan bisa ditimpa oleh mekanisme yang justru dibangun untuk mencegahnya.
- **Ekspor tanpa keluaran mengosongkan vault dengan pesan "OK".** Bila graphify
  keluar 0 tanpa menulis berkas, langkah pembersih menghapus seluruh vault lalu
  menyalin balik nol berkas. Sekarang ditolak SEBELUM pembersih berjalan.

- Tidak ada perubahan yang terlihat pembaca situs; ini murni perkakas
  developer/agen dan gerbang CI baru.
- Terasa saat mengembangkan: `bun test` naik dari 40 menjadi 44 berkas
  gerbang (43 sebelum skrip label ini, lalu +1 untuk
  `tests/knowledge-graph-label.test.mjs`); enam dokumen (README, README.id,
  `checklist-repo-baru` + cermin, dan `SKILL.md` gerbang + cermin) sekarang
  menyebut 44, dan `tests/documented-counts.test.mjs` menegakkan itu di
  keenamnya sekaligus. Situs turunan mewarisi perkakas ini apa adanya;
  catatan kuratnya sendiri yang perlu ditulis ulang, dan `graphify-out/` yang
  tidak ada (sehingga `knowledge/` kosong) tetap keadaan sah.
