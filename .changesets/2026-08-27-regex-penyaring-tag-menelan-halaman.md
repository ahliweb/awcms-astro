---
bump: patch
tipe: perbaikan
dampak: internal
---

# Tiga regex penyaring tag membuat gerbang lulus atas halaman yang tak pernah ia baca

CodeQL menandai lima temuan `high` di repo ini, dan keduanya kelas yang sama:
sebuah regex yang ditulis untuk mengenali tag HTML, tetapi mengenali lebih
sedikit — atau lebih banyak — daripada yang dikenali browser. Tidak satu pun
dari kelimanya adalah lubang keamanan pada situs yang terbit; semuanya adalah
**gerbang yang berhenti memeriksa tanpa berbunyi**, yang justru kelas yang
seluruh gerbang di repo ini ditulis untuk menangkap.

## `teksLayar` di `audit-konten.mjs`

Sebuah tag penutup boleh membawa apa pun setelah nama tag-nya. `</script >`,
`</script foo=bar>` dan `</script\t\n bar>` semuanya menutup blok skrip bagi
browser. Regex lama menuntut `</script>` persis, jadi ia tidak berhenti di
satu pun dari ketiganya. Akibatnya bercabang, dan keduanya diukur atas fixture
sungguhan alih-alih dikira-kira:

- **Ada skrip kedua di bawahnya** — pencarian lanjut sampai penutup milik skrip
  itu, dan judul serta paragraf di antaranya ikut terbuang sebagai "skrip".
  Halaman uji menyusut dari tiga baris menjadi satu.
- **Tidak ada skrip kedua** — regex tidak cocok sama sekali, dan source
  JavaScript-nya masuk sebagai teks layar.

Sisi sebaliknya sama diamnya: tanpa `\b`, `<scripture>` terbaca sebagai pembuka
`<script`, dan penutup yang dicarinya adalah `</script>` nyata jauh di bawahnya.
Pada fixture uji, seluruh teks halaman lenyap menjadi larik kosong — dan enam
gerbang keluaran yang membacanya melaporkan nol pelanggaran atas halaman yang
tidak pernah mereka lihat.

Perbaikannya sengaja **tidak** ditulis `</script[^>]*>`, bentuk longgar yang
paling menggoda saat mengejar `</script foo=bar>`. Bentuk itu akan menerima
`</scripture>` sebagai penutup, padahal HTML tidak — blok skrip hanya berakhir
pada `</script` yang diikuti spasi-putih, `/`, atau `>`. Spasi-putih diwajibkan
setelah nama tag justru supaya gerbang ini sepakat dengan browser, dan kedua
arahnya diuji.

## Pembuangan komentar di `auditSvg`

Membuang komentar sekali jalan bisa **menyatukan** sisa kiri dan kanannya
menjadi komentar baru yang utuh: pada `<!<!-- x -->-- draf & catatan -->`,
lintasan pertama membuang bagian tengahnya dan yang tersisa membentuk komentar
yang tidak pernah diperiksa lagi. `&` di dalamnya lalu dilaporkan sebagai
pelanggaran pada berkas yang sah — satu tuduhan palsu sebelum, nol sesudah.
Pembuangan kini diulang sampai berhenti berubah.

Satu batas disebut di tempatnya alih-alih didiamkan: komentar **tak
berpenutup** tetap lolos, dan pengulangan tidak menolongnya sama sekali. Berkas
seperti itu bukan XML yang sah, jadi `&`-nya memang layak dilaporkan.

## Tiga asersi di `tests/content-blocks.test.mjs`

`assert.doesNotMatch(html, /<script>/)` lebih sempit daripada klaim yang
dibuatnya. `<SCRIPT>`, `< script`, dan `<script src=…>` semuanya tag skrip bagi
browser dan tak satu pun cocok. Tesnya lulus selama ini karena renderer-nya
memang meng-escape segalanya — jadi celahnya tak terlihat, dan akan tetap tak
terlihat persis pada hari renderer berhenti meng-escape sesuatu.

## Empat tes baru, tiga di antaranya merah tanpa perbaikan ini

Dibuktikan dua arah seperti tetangganya: tiga kasus merah sebelum perbaikan dan
hijau sesudahnya, ditambah satu penjaga arah-hijau yang harus lulus di kedua
sisi — isi `<script>` bukan teks layar, dan gerbang yang mulai melaporkannya
akan dimatikan orang dalam sepekan.

Tidak ada gerbang baru yang ditambahkan untuk kelas ini. CodeQL sudah berjalan
pada setiap PR (`.github/workflows/codeql.yml`), jadi ia sendiri pemeriksa
anti-kambuhnya; gerbang kedua hanya akan menjadi salinan yang bisa menyimpang.
