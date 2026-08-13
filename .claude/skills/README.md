# Skill proyek `awcms-astro`

Skill Claude Code tingkat-proyek. Tiap skill meng-encode standar dari
[`docs/awcms-astro/`](../../docs/awcms-astro/README.md) dan keputusan di
[`docs/adr/`](../../docs/adr/README.md) sehingga coding agent menerapkannya
konsisten. Dipanggil otomatis saat relevan, atau manual lewat `/<nama-skill>`.

> Baca [`AGENTS.md`](../../AGENTS.md) lebih dulu — itu kontrak kerjanya.

## Katalog

| Skill | Kapan dipakai |
| --- | --- |
| [`awcms-astro-integrasi`](awcms-astro-integrasi/SKILL.md) | Menyentuh `src/lib/content.ts`, `src/lib/awcms/`, atau `scripts/asal-media.mjs`; build menerbitkan situs yang tampak benar tetapi isinya kurang |
| [`awcms-astro-gerbang`](awcms-astro-gerbang/SKILL.md) | Sebelum PR; menambah aturan ke dokumen; sebuah gerbang merah dan sebabnya tidak jelas |
| [`awcms-astro-situs-baru`](awcms-astro-situs-baru/SKILL.md) | Memulai repo situs baru dari template ini; situs turunan berperilaku seperti template-nya |
| [`awcms-astro-performa-keamanan`](awcms-astro-performa-keamanan/SKILL.md) | Sebelum rilis atau go-live; menyentuh `server/penyaji.mjs` atau anggaran performa; menjawab pertanyaan kepatuhan |

## Empat skill, bukan lima puluh

`awcms` punya 55 skill karena ia punya 22 modul terdaftar. Repo ini punya satu
tanggung jawab utama — menerbitkan halaman publik dari konten `awcms` — dan
skill yang memerikan sesuatu yang tidak ada di sini lebih berbahaya daripada
skill yang tidak ada: pembacanya menganggapnya berlaku.

Sejak [ADR-0034](../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
repo ini punya peran KEDUA — permukaan admin USER bila sebuah situs
menyatakannya lewat `permukaanAdmin` — dan peran itu **sengaja belum punya
skill**. Alasannya aturan di atas, diterapkan pada dirinya sendiri: hari ini
`permukaanAdmin` kosong di template, tidak ada satu rute admin pun, dan tidak
ada satu baris kode permukaan terautentikasi. Sebuah skill akan memerikan
prosedur atas kode yang belum ada. Bahannya nyata dan sudah mendarat — sebagai
DOKUMEN, di
[`docs/awcms-astro/permukaan-admin-user.md`](../../docs/awcms-astro/permukaan-admin-user.md),
yang memang tempatnya menerangkan apa yang harus dilakukan situs turunan. Bila
kelak sebuah situs benar-benar menyalakannya dan prosedurnya terbukti berulang,
skill kelima lolos batasnya sendiri; hari ini belum.

**Skill baru ditambahkan saat ada prosedur yang benar-benar berulang di repo
ini**, bukan untuk melengkapi katalog. Yang keempat lolos batas itu karena
pemeriksaan performa dan keamanan berulang pada tiap rilis template **dan** pada
tiap go-live situs turunan — dua peristiwa yang jaraknya jauh, yang dijalankan
orang berbeda, dan yang selama ini dijawab dari ingatan.

## Yang ikut tersalin ke situs turunan

Repo ini **template repository** GitHub, jadi seluruh isi direktori ini ikut ke
setiap situs yang menekan "Use this template". Keempatnya ditulis untuk template
— bukan untuk satu domain — sehingga tetap benar di sana. Skill khas domain
sebuah situs ditulis **di repo situs itu**, bukan di sini.

## Aturan yang berlaku untuk skill di direktori ini

Sama dengan aturan dokumen mana pun di repo ini: **skill yang menyatakan sesuatu
yang tidak ada adalah cacat.** `bun run audit:dokumen` memeriksa tautan dan
jalur berkas yang disebutkan di sini persis seperti ia memeriksa `docs/` —
`.claude/` tidak dikecualikan.

Aturan itu adalah ruh `awcms`
[ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md),
yang menggerbangi 55 skill-nya terhadap kode yang dijelaskannya setelah menemukan
empat skill menunjuk berkas yang sudah pindah dan enam skill mengajarkan alur
yang sudah dicabut. Alasannya berlaku persis sama di sini, dan lebih tajam:
**dokumen dibaca manusia yang bisa ragu; skill DIIKUTI.** Arah menuanya pun
berlawanan dengan koreksi biasa — kalimat "ini belum ada di repo ini" mulai
benar, lalu barangnya dibangun, dan kalimat itu menua menjadi kebohongan yang
percaya diri.

Sejak 5 Agustus 2026 aturan 1–3 `awcms` ADR-0062 berlaku penuh di sini:
kutipan `ADR-NNNN` kini ikut diperiksa `bun run audit:dokumen` — yang tidak
resolve ke `docs/adr/` dan tidak ditandai milik repo lain (`awcms`,
"repo rujukan", atau tautan github di paragraf yang sama) adalah pelanggaran.
Pekerjaan itu dicatat [ADR-0028](../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) §E.

**Aturannya EMPAT, dan yang keempat belum punya pemeriksa di sini.** Aturan 4
`awcms` ADR-0062 berbunyi "perintah yang disuruh dijalankan harus ada": sebuah
skill yang menyuruh `bun run <sesuatu>` yang tidak ada di `package.json` adalah
pelanggaran. Tidak satu pun dari keenam gerbang `audit:dokumen` membaca
`package.json`, jadi aturan itu **tidak ditegakkan** di repo ini. Hari ini tidak
ada pelanggarannya — tetapi itu keberuntungan, bukan gerbang, dan menuliskannya
sebagai "berlaku penuh" akan menjadi persis klaim yang
[ADR-0030](../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) ada
untuk melawan.
