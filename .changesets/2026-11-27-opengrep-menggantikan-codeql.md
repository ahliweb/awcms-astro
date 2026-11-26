---
bump: patch
tipe: dependency
dampak: internal
---

# OpenGrep menggantikan CodeQL sebagai analisis statik

Workflow CodeQL dicabut karena ketentuan lisensinya (standar lintas-portofolio internal, DL-098); `.github/workflows/keamanan.yml` menambah gitleaks atas rentang commit dan OpenGrep v2.1.0 (biner dipin SHA256, aturan `opengrep-rules` tersalin pada commit terpin, baseline yang hanya menyusut). Gerbang gagal hanya pada temuan ERROR baru. Alasan dan batasnya ada di ADR-0059.

- Check wajib `Analyze (javascript-typescript)` diganti `keamanan / sast-rahasia-dependensi`; penggantian di ruleset adalah tindakan pemilik.
- Batas `.astro` tidak dianalisis tetap dinyatakan di ringkasan run.
- Tidak ada perubahan keluaran situs atau dependensi runtime.
