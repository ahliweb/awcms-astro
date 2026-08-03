/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-dokumen.mjs`.
 *
 * ## Kenapa gerbang ini butuh tesnya sendiri
 *
 * Ia lahir dari cacat yang bertahan sembilan ADR tanpa terlihat: indeks ADR
 * yang mendaftarkan enam keputusan yang tak pernah ada di repo ini. Sebuah
 * pemeriksa yang menjawab "bersih" untuk pohon yang cacat mengulang cacat itu
 * satu tingkat lebih tinggi — dan kali ini dengan tanda centang di sampingnya,
 * yang lebih buruk daripada tidak ada pemeriksa sama sekali.
 *
 * Jadi tiap gerbang di bawah dibuktikan **dua arah**: MERAH saat cacatnya ada,
 * HIJAU saat tidak. Fixture-nya pohon berkas sungguhan di direktori sementara,
 * bukan string yang di-mock — skripnya membaca disk, jadi yang diuji harus
 * disk.
 *
 * Kasus terakhir menjalankannya atas repo ini sendiri. Itu yang membuat tes ini
 * ikut menjaga dokumen, bukan hanya menjaga skripnya.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SKRIP = "scripts/audit-dokumen.mjs";

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

/** Pohon fixture: `{ "docs/adr/README.md": "isi" }` → direktori sungguhan. */
function pohon(berkas) {
  const akar = mkdtempSync(join(tmpdir(), "audit-dokumen-"));
  sementara.push(akar);

  for (const [jalur, isi] of Object.entries(berkas)) {
    const penuh = join(akar, jalur);
    mkdirSync(join(penuh, ".."), { recursive: true });
    writeFileSync(penuh, isi);
  }

  return akar;
}

function jalankan(akar) {
  const hasil = Bun.spawnSync(["bun", SKRIP, akar]);
  return {
    kode: hasil.exitCode,
    keluaran: hasil.stdout.toString() + hasil.stderr.toString()
  };
}

/** ADR minimal yang sah: baris status yang dibaca gerbang, dan tak lebih. */
function adr(nomor, status = "Accepted") {
  return `# ADR-${nomor} — contoh\n\n- **Status:** ${status}\n`;
}

function indeks(...baris) {
  return `# Architecture Decision Records\n\n| # | Keputusan | Status |\n| --- | --- | --- |\n${baris.join("\n")}\n`;
}

describe("tautan relatif", () => {
  test("tautan ke berkas yang ada lolos", () => {
    const akar = pohon({
      "README.md": "Lihat [AGENTS](AGENTS.md) dan [teknis](docs/teknis.md).",
      "AGENTS.md": "# Agents",
      "docs/teknis.md": "# Teknis"
    });

    expect(jalankan(akar).kode).toBe(0);
  });

  test("tautan ke berkas yang tidak ada MERAH", () => {
    const akar = pohon({ "README.md": "Lihat [hilang](docs/hilang.md)." });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(1);
    expect(keluaran).toContain("tautan-mati");
    expect(keluaran).toContain("docs/hilang.md");
  });

  test("diselesaikan dari letak berkasnya, bukan dari akar repo", () => {
    // Aturan `.changesets/`: tautannya ditulis dari sudut pandang `.changesets/`,
    // jadi `../docs/x.md` benar dan `docs/x.md` justru salah. Dua kasus ini yang
    // membuktikan gerbang ini menegakkan aturan itu tanpa pengecualian khusus.
    const benar = pohon({
      ".changesets/catatan.md": "Lihat [ADR](../docs/adr/0001-x.md).",
      "docs/adr/0001-x.md": "# x"
    });
    expect(jalankan(benar).kode).toBe(0);

    const salah = pohon({
      ".changesets/catatan.md": "Lihat [ADR](docs/adr/0001-x.md).",
      "docs/adr/0001-x.md": "# x"
    });
    expect(jalankan(salah).kode).toBe(1);
  });

  test("URL eksternal, anchor, dan blok kode dilewati", () => {
    const akar = pohon({
      "README.md": [
        "[situs](https://example.com/tidak/ada.md)",
        "[surel](mailto:a@example.com)",
        "[bagian](#gambar)",
        "[berkas ber-anchor](AGENTS.md#gambar)",
        "",
        "```md",
        "[contoh](tidak/pernah/ada.md)",
        "```",
        "",
        "Inline `[juga](tidak/ada.md)` tidak dihitung."
      ].join("\n"),
      "AGENTS.md": "# Agents"
    });

    expect(jalankan(akar).kode).toBe(0);
  });

  test("anchor pada berkas yang TIDAK ada tetap MERAH", () => {
    const akar = pohon({ "README.md": "[x](AGENTS.md#gambar)" });
    expect(jalankan(akar).kode).toBe(1);
  });
});

describe("indeks ADR", () => {
  test("lengkap dua arah lolos", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": adr("0001"),
      "docs/adr/0002-dua.md": adr("0002", "Superseded by ADR-0003"),
      "docs/adr/README.md": indeks(
        "| [0001](0001-satu.md) | Satu | Diterima |",
        "| [0002](0002-dua.md) | Dua | Digantikan ADR-0003 |"
      )
    });

    expect(jalankan(akar).kode).toBe(0);
  });

  test("ADR yang ada tetapi tidak tercatat MERAH — cacat 3 Agustus 2026, arah pertama", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": adr("0001"),
      "docs/adr/0002-dua.md": adr("0002"),
      "docs/adr/README.md": indeks("| [0001](0001-satu.md) | Satu | Diterima |")
    });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(1);
    expect(keluaran).toContain("indeks-adr");
    expect(keluaran).toContain("0002-dua.md");
  });

  test("baris tabel yang berkasnya tak pernah ada MERAH — arah kedua", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": adr("0001"),
      "docs/adr/README.md": indeks(
        "| [0001](0001-satu.md) | Satu | Diterima |",
        "| [0002](0002-tak-pernah-ada.md) | Dua | Diterima |"
      )
    });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(1);
    expect(keluaran).toContain("0002-tak-pernah-ada.md");
  });

  test("status tabel yang tidak setuju dengan status ADR-nya MERAH", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": adr("0001", "Superseded by ADR-0002"),
      "docs/adr/README.md": indeks("| [0001](0001-satu.md) | Satu | Diterima |")
    });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(1);
    expect(keluaran).toContain("status-adr");
  });

  test("status yang tidak dikenal DILAPORKAN, bukan dilewati diam-diam", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": adr("0001", "Sedang dipikirkan"),
      "docs/adr/README.md": indeks("| [0001](0001-satu.md) | Satu | Diterima |")
    });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(1);
    expect(keluaran).toContain("tidak dikenal");
  });

  test("ADR tanpa baris Status MERAH", () => {
    const akar = pohon({
      "docs/adr/0001-satu.md": "# ADR-0001 — contoh\n",
      "docs/adr/README.md": indeks("| [0001](0001-satu.md) | Satu | Diterima |")
    });

    expect(jalankan(akar).kode).toBe(1);
  });

  test("repo tanpa docs/adr/ dilewati dan MENGATAKANNYA", () => {
    const akar = pohon({ "README.md": "# Situs tanpa ADR" });
    const { kode, keluaran } = jalankan(akar);

    expect(kode).toBe(0);
    expect(keluaran).toContain("DILEWATI");
  });
});

test("repo ini sendiri lolos", () => {
  const { kode, keluaran } = jalankan(".");

  expect(keluaran).toContain("audit dokumen");
  expect(kode).toBe(0);
});
