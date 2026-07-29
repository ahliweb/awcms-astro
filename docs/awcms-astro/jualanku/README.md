# Jualanku.info — blueprint experience layer

> **Status: RENCANA.** Belum ada adapter, belum ada rute `/penjual/**`,
> `/affiliate/**`, maupun `/_portal-api/**` di repo ini. `astro.config.mjs` masih
> `output: "static"` tanpa adapter, dan itu memang keadaan yang benar sampai
> prasyarat di bawah tertutup. Sumber kebenaran tetap kode + `bun run build`.

Folder ini merancang sisi experience dari porting Jualanku.info. Keputusannya
tercatat di [ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md);
sisi platform (domain, otorisasi, data, API) dirancang di repo
[`ahliweb/awcms`](https://github.com/ahliweb/awcms/blob/main/docs/awcms/jualanku/README.md).

## Peta dokumen

| Berkas                                                | Isi                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [01-arsitektur-experience.md](01-arsitektur-experience.md) | Matriks rendering, adapter, struktur direktori, perubahan deployment, jalur rollback. |
| [02-kontrak-bff.md](02-kontrak-bff.md)                | Endpoint `_portal-api`, sesi, CSRF, tenant, cache, error, batas keras BFF.                |
| [03-peta-rute-dan-ui.md](03-peta-rute-dan-ui.md)      | Inventaris rute publik/portal, disposition Elementor, komponen, token, aksesibilitas.      |
| [04-kesiapan.md](04-kesiapan.md)                      | Prasyarat P0, proof-of-concept, checklist acceptance, dan yang sengaja ditunda.            |

## Pembagian tanggung jawab (ringkas)

| Milik repo ini                                    | Milik `awcms`                                            |
| ------------------------------------------------- | -------------------------------------------------------- |
| HTML, komponen, token, state UI, aksesibilitas    | Aturan bisnis, validasi invariant, transisi status        |
| Sesi portal (cookie), CSRF, Origin check          | Sesi kanonik, rotasi, revokasi, MFA/step-up               |
| Penurunan tenant dari host                        | Penegakan tenant (RLS) dan otorisasi                      |
| View model, masking presentasi                    | Masking otoritatif, projection per-purpose, audit         |
| Cache publik & header privat                      | Decision log, idempotency, ledger                         |

Aturan tunggal yang menentukan: **kalau sebuah cek hanya ada di repo ini, cek itu
tidak ada.**
