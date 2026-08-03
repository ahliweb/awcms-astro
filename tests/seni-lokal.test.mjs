/**
 * Gerbang seni lokal — pemetaan `src/assets/` menjadi ilustrasi halaman.
 *
 * ## Kenapa logikanya diuji di sini dan bukan lewat build
 *
 * `bun run build` di repo template ini menarik konten dari `awcms` sungguhan,
 * jadi ia tidak berjalan tanpa instans — dan sebuah aturan yang hanya bisa
 * dibuktikan di situs orang lain adalah aturan yang tidak dijaga di sini.
 * `src/lib/seni-lokal.ts` karena itu memisahkan seluruh logikanya dari
 * `import.meta.glob`, dan berkas ini menguji logika itu langsung.
 *
 * ## Gerbang yang paling penting ada di kasus terakhir
 *
 * Daftar ekstensi hidup di DUA tempat yang tidak saling impor: konstanta
 * `EKSTENSI_SENI` (dipakai `import.meta.glob`, yang menuntut pola literal) dan
 * `EKSTENSI_GAMBAR` di `scripts/audit-konten.mjs` (dipakai gerbang rasio).
 * Menyimpang, keduanya menghasilkan cacat yang tidak memerahkan apa pun:
 * ekstensi yang diserap tetapi tidak diperiksa menerbitkan seni berasio salah,
 * dan ekstensi yang diperiksa tetapi tidak diserap membuat berkas yang lulus
 * audit tidak pernah muncul di halaman.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import {
  EKSTENSI_SENI,
  cariSeni,
  indeksSeni,
  manusiawi
} from "../src/lib/seni-lokal.ts";

const AWALAN = "../assets/";

describe("indeksSeni", () => {
  test("membuang awalan dan ekstensi", () => {
    const indeks = indeksSeni(
      {
        "../assets/hero.svg": "/_astro/hero.abc.svg",
        "../assets/tab/pajak.webp": "/_astro/pajak.def.webp",
        "../assets/artikel/pajak/pbb-2026.png": "/_astro/pbb.ghi.png"
      },
      AWALAN
    );

    expect([...indeks.keys()].sort()).toEqual([
      "artikel/pajak/pbb-2026",
      "hero",
      "tab/pajak"
    ]);
    expect(indeks.get("hero")).toBe("/_astro/hero.abc.svg");
  });

  test("nama sama dengan ekstensi berbeda adalah ERROR, bukan pilihan diam-diam", () => {
    expect(() =>
      indeksSeni(
        {
          "../assets/hero.svg": "/_astro/hero.abc.svg",
          "../assets/hero.png": "/_astro/hero.def.png"
        },
        AWALAN
      )
    ).toThrow(/hero\.svg.*hero\.png|hero\.png.*hero\.svg/s);
  });

  test("peta kosong sah — template ini memang tidak membawa ilustrasi", () => {
    expect(indeksSeni({}, AWALAN).size).toBe(0);
  });

  test("titik di nama berkas tidak dikira ekstensi ganda", () => {
    const indeks = indeksSeni(
      { "../assets/tab/pajak.v2.svg": "/_astro/x.svg" },
      AWALAN
    );

    expect(indeks.has("tab/pajak.v2")).toBe(true);
  });
});

describe("cariSeni", () => {
  const indeks = indeksSeni(
    { "../assets/tab/pajak.svg": "/_astro/pajak.abc.svg" },
    AWALAN
  );

  test("mengembalikan URL saat kuncinya ada", () => {
    expect(cariSeni(indeks, "tab/pajak")).toBe("/_astro/pajak.abc.svg");
  });

  test("undefined saat tidak ada — keadaan yang DIDUKUNG", () => {
    expect(cariSeni(indeks, "artikel/pajak/tidak-ada")).toBeUndefined();
  });

  test("kandidat pertama yang cocok yang dipakai", () => {
    expect(cariSeni(indeks, "tidak/ada", "tab/pajak")).toBe(
      "/_astro/pajak.abc.svg"
    );
  });
});

describe("manusiawi", () => {
  test("slug menjadi teks yang layak dibaca", () => {
    expect(manusiawi("pbb-2026-tarif")).toBe("Pbb 2026 Tarif");
  });

  test("satu kata tetap benar", () => {
    expect(manusiawi("pajak")).toBe("Pajak");
  });
});

describe("dua daftar ekstensi tidak boleh menyimpang", () => {
  /** `const EKSTENSI_GAMBAR = ["png", …];` di skrip audit. */
  function ekstensiAudit() {
    const isi = readFileSync("scripts/audit-konten.mjs", "utf8");
    const cocok = isi.match(/const EKSTENSI_GAMBAR = \[([^\]]+)\]/);

    // Bukan `?? []`: gagal membaca daftarnya berarti gerbang ini berhenti
    // memeriksa apa pun sambil tetap hijau.
    if (!cocok) throw new Error("EKSTENSI_GAMBAR tidak ditemukan di scripts/audit-konten.mjs");

    return cocok[1]
      .split(",")
      .map((bagian) => bagian.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }

  /** Pola literal di `import.meta.glob` — Vite menuntutnya literal. */
  function ekstensiGlob() {
    const isi = readFileSync("src/lib/article-images.ts", "utf8");
    const cocok = isi.match(/import\.meta\.glob\(\s*"[^"]*\{([^}]+)\}"/);

    if (!cocok) throw new Error("pola import.meta.glob tidak ditemukan di src/lib/article-images.ts");

    return cocok[1].split(",").map((bagian) => bagian.trim());
  }

  test("konstanta, pola glob, dan gerbang audit menyebut ekstensi yang sama", () => {
    const konstanta = [...EKSTENSI_SENI].sort();

    expect(ekstensiGlob().sort()).toEqual(konstanta);
    expect(ekstensiAudit().sort()).toEqual(konstanta);
  });
});
