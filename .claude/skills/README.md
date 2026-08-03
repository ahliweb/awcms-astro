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

## Tiga skill, bukan lima puluh

`awcms` punya 54 skill karena ia punya 21 modul domain. Repo ini punya satu
tanggung jawab — menerbitkan situs statis dari konten `awcms` — dan skill yang
memerikan sesuatu yang tidak ada di sini lebih berbahaya daripada skill yang
tidak ada: pembacanya menganggapnya berlaku.

**Skill baru ditambahkan saat ada prosedur yang benar-benar berulang di repo
ini**, bukan untuk melengkapi katalog.

## Yang ikut tersalin ke situs turunan

Repo ini **template repository** GitHub, jadi seluruh isi direktori ini ikut ke
setiap situs yang menekan "Use this template". Ketiganya ditulis untuk template
— bukan untuk satu domain — sehingga tetap benar di sana. Skill khas domain
sebuah situs ditulis **di repo situs itu**, bukan di sini.

## Aturan yang berlaku untuk skill di direktori ini

Sama dengan aturan dokumen mana pun di repo ini: **skill yang menyatakan sesuatu
yang tidak ada adalah cacat.** `bun run audit:dokumen` memeriksa tautan dan
jalur berkas yang disebutkan di sini persis seperti ia memeriksa `docs/` —
`.claude/` tidak dikecualikan.
