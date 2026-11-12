---
bump: patch
tipe: perbaikan
dampak: internal
---

# Rebuild memicu deploy Coolify dengan POST

Coolify v4 versi baru menjawab `GET /api/v1/deploy` dengan "This endpoint has
changed to a POST request." tanpa memicu apa pun, sehingga workflow `Rebuild`
pada situs yang mengisi `COOLIFY_API_URL` dan `COOLIFY_APP_UUID` gagal dan konten
baru tidak pernah ter-build. Workflow kini memakai `POST`; `uuid` tetap di query
string.

- `docs/deploy-coolify.md` dan `.id.md` menyebut metodenya dan diagramnya diperbarui.
- Rujukan ke catatan server privat dihapus dari workflow dan dokumen publik ini.
