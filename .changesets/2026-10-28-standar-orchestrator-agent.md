---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Standar orchestrator dan agent untuk pekerjaan multi-agent

Menambahkan bagian "Orchestrator & agent (AI models)" ke `AGENTS.md` (dan
cerminnya `AGENTS.id.md`) serta dua subagen Claude Code di `.claude/agents/`:
`pelaksana-kompleks` (Sonnet, `medium`) dan `pelaksana-sederhana` (Haiku, `low`).
Standarnya dipelihara sebagai standar lintas-portofolio internal pemilik; repo ini
hanya menunjuk ke sana, tanpa menyalin harga atau lini model.

- Hanya memengaruhi cara agen AI membagi kerja saat mengembangkan repo ini.
- Tidak mengubah keluaran situs, dependensi, atau deployment.
