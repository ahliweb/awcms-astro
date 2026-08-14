---
tipe: dokumentasi
dampak: internal
---

# Inggris menjadi bahasa sumber dokumen, dan tiga gerbang bergerak lebih dulu

Repo ini mengadopsi format dwibahasa keluarga AWCMS
([ADR-0039](../docs/adr/0039-english-is-the-source-language.md), mengikuti
`awcms` ADR-0097): **Inggris di jalur telanjang `<nama>.md` adalah sumber yang
berwenang, Indonesia di `<nama>.id.md` adalah cerminnya**, dan cerminnya memikul
`<!-- i18n-source-hash: sha256:... -->` yang mencatat hash sumbernya. Gerbangnya
MENDETEKSI penyimpangan; ia tidak pernah menerjemahkan, dan tidak ada panggilan
API terjemahan dari CI.

Yang mendarat sekarang mekanismenya, bukan terjemahannya. Nol prosa berubah:
seluruh 52 dokumen dalam cakupan masuk ke buku besar `DOCS_AWAITING_MIRROR` yang
**hanya boleh menyusut**, dan ADR-0039 sendiri adalah pasangan pertama —
ditulis Inggris, dicerminkan pada perubahan yang sama, sengaja tidak ada di buku
besar itu.

- Gerbang baru `bun run audit:translation`
  ([`scripts/check-docs-translation.mjs`](../scripts/check-docs-translation.mjs),
  logika murni di
  [`scripts/lib/docs-i18n-checks.mjs`](../scripts/lib/docs-i18n-checks.mjs)),
  berjalan di job `check` CI di sebelah `audit:dokumen`. Ia menjawab **dua**
  pertanyaan yang sengaja dipisah: apakah sebuah cermin masih seusia sumbernya,
  dan dokumen mana yang belum punya cermin sama sekali — digabung, ia akan hijau
  sementara sebagian besar korpus belum diterjemahkan.
- `bun run docs:i18n:stamp` menulis spanduk pemilih bahasa di kedua sisi dan
  menaruh penandanya di cermin. Idempoten, dan ia menghormati frontmatter YAML
  milik berkas skill — spanduk yang mendarat di atas `---` akan diam-diam
  membatalkan frontmatter itu, dan skill-nya kehilangan `name`/`description`
  yang menentukan kapan ia dipilih.
- Tiga cacat di [`scripts/audit-dokumen.mjs`](../scripts/audit-dokumen.mjs)
  ditutup lebih dulu, karena berkas `.id.md` pertama akan memerahkannya dengan
  alasan yang bukan cacat: cermin dihitung sebagai ADR tersendiri dan dituntut
  masuk indeks; penanda "milik repo lain" hanya mengenal frasa Indonesia,
  sehingga 325 kutipan yang kini dimaafkan akan melanggar sekaligus begitu
  sebuah dokumen menulis "reference repo"; dan cermin yatim memasok nomor ADR
  yang berkasnya tidak ada. Masing-masing dibuktikan MERAH tanpa perbaikannya di
  [`tests/audit-dokumen.test.mjs`](../tests/audit-dokumen.test.mjs).
- Gerbang indeks ADR kini ikut membaca cermin indeksnya bila ada, dan kolom
  status menerima kedua bahasa. Hash terjemahan menjaga cermin tetap SEUSIA
  sumbernya, bukan tetap BENAR terhadap isi `docs/adr/`.
- `*.id.md` dikecualikan dari graf pengetahuan. Sebuah cermin menceritakan ulang
  sumbernya kata demi kata; mengindeks keduanya memasukkan setiap konsep dua
  kali dan menghasilkan dua komunitas bertetangga yang akan diberi nama sama —
  yang sudah ditolak `bun run audit:graf`. Karena ia pola glob, gerbang itu
  melaporkannya sebagai **tidak ditegakkan** alih-alih berpura-pura menjaganya.
