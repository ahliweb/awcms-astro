/**
 * Gerbang atas beacon kunjungan — `src/lib/beacon.ts` dan komponennya
 * (`awcms` #597 butir 9, ADR-0044).
 *
 * Dua hal dijaga di sini, dan keduanya gagal di tempat yang tidak punya
 * penonton:
 *
 *   1. **Muatan yang hanya bisa ditolak.** `awcms` menjawab `400` untuk
 *      `tenantCode` atau `path` di luar batasnya, dan responsnya tidak terlihat
 *      pembaca maupun operator situs ini. Sebuah muatan yang salah bentuk karena
 *      itu menghasilkan satu permintaan per kunjungan yang tidak mencatat apa
 *      pun, selamanya, sementara dasbor di sana membaca nol.
 *   2. **Kontrak lintas-origin yang KEBALIKAN dari kotak pencarian.** Pencarian
 *      tidak boleh membawa header; beacon ini harus membawa satu. Menyamakan
 *      keduanya — ke arah mana pun — mematikan salah satunya di peramban.
 *
 * Yang menjaga "tanpa kredensial" TIDAK ada di sini melainkan di
 * `tests/tanpa-backend.test.mjs`, bersama pengecualian yang mengizinkan berkas
 * ini mem-POST sama sekali. Keduanya satu keputusan, jadi keduanya dibaca dalam
 * satu tempat.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  JALUR_BEACON,
  PANJANG_JALUR_MAKS,
  PANJANG_KODE_TENANT_MAKS,
  TIPE_ISI_BEACON,
  alamatBeacon,
  muatanBeacon
} from "../src/lib/beacon.ts";

const ASAL = "https://cms.contoh.test";

describe("muatanBeacon", () => {
  test("muatan sah membawa kode tenant dan jalur", () => {
    assert.deepEqual(muatanBeacon({ tenantCode: "lentera", path: "/informasi/banjir/" }), {
      tenantCode: "lentera",
      path: "/informasi/banjir/"
    });
  });

  test("referrer ikut hanya bila ada", () => {
    // Kosong BUKAN string kosong yang dikirim: `awcms` menyimpan DOMAIN-nya, dan
    // domain dari string kosong adalah baris yang mengaku tahu sesuatu yang
    // tidak diketahuinya.
    assert.equal("referrer" in muatanBeacon({ tenantCode: "t", path: "/" }), false);
    assert.equal(
      "referrer" in muatanBeacon({ tenantCode: "t", path: "/", referrer: "   " }),
      false
    );
    assert.equal(
      muatanBeacon({ tenantCode: "t", path: "/", referrer: "https://cari.test/x" }).referrer,
      "https://cari.test/x"
    );
  });

  test("muatan yang hanya bisa ditolak TIDAK dikirim", () => {
    // Ditolak di sini alih-alih dibiarkan menjadi `400` di sana. Responsnya
    // tidak terlihat siapa pun, jadi permintaan yang hanya bisa gagal adalah
    // permintaan yang tidak akan pernah ketahuan — satu round trip per
    // kunjungan halaman, mencatat nol.
    assert.equal(muatanBeacon({ tenantCode: "", path: "/" }), null);
    assert.equal(muatanBeacon({ tenantCode: "   ", path: "/" }), null);
    assert.equal(
      muatanBeacon({ tenantCode: "a".repeat(PANJANG_KODE_TENANT_MAKS + 1), path: "/" }),
      null
    );
    assert.equal(muatanBeacon({ tenantCode: "t", path: "informasi/" }), null);
    assert.equal(muatanBeacon({ tenantCode: "t", path: "" }), null);
    assert.equal(
      muatanBeacon({ tenantCode: "t", path: `/${"a".repeat(PANJANG_JALUR_MAKS)}` }),
      null
    );
  });

  test("batasnya sama persis dengan yang divalidasi awcms", () => {
    // Batas yang lebih longgar di sini mengirim permintaan yang ditolak di
    // sana; yang lebih ketat membuang kunjungan yang sebenarnya sah. Keduanya
    // diam.
    assert.equal(PANJANG_KODE_TENANT_MAKS, 128);
    assert.equal(PANJANG_JALUR_MAKS, 2048);
    assert.ok(muatanBeacon({ tenantCode: "a".repeat(PANJANG_KODE_TENANT_MAKS), path: "/" }));
    assert.ok(
      muatanBeacon({ tenantCode: "t", path: `/${"a".repeat(PANJANG_JALUR_MAKS - 1)}` })
    );
  });
});

describe("alamatBeacon", () => {
  test("jalur tersusun di ORIGIN yang diberikan", () => {
    const url = new URL(alamatBeacon(ASAL));
    assert.equal(url.origin, ASAL);
    assert.equal(url.pathname, JALUR_BEACON);
  });
});

describe("komponen beacon — kontrak yang KEBALIKAN dari kotak pencarian", () => {
  const isi = readFileSync("src/components/BeaconKunjungan.astro", "utf8");

  test("membawa `content-type: application/json`, dan itu bukan hiasan", () => {
    // `security.checkOrigin` di `awcms` menolak POST lintas-origin yang tipe
    // isinya mirip form, dan `fetch` tanpa tipe isi jatuh ke penolakan yang
    // sama. Hanya `application/json` yang lolos — dan `awcms` #637 memasang
    // handler `OPTIONS` justru untuk preflight yang ditimbulkannya.
    assert.equal(TIPE_ISI_BEACON, "application/json");
    assert.ok(isi.includes("TIPE_ISI_BEACON"));
    assert.ok(isi.includes("'content-type'"));
  });

  test("jalurnya dibangun lewat `src/lib/beacon.ts`, bukan dirangkai di komponen", () => {
    // Sama seperti kotak pencarian: satu berkas yang memegang jalurnya adalah
    // yang membuat daftar permukaan di `tests/kontrak-awcms.test.mjs` tetap
    // benar.
    assert.equal(/["'`]\/api\/v1\//.test(isi.replace(/\/\*[\s\S]*?\*\//g, "")), false);
    assert.ok(isi.includes("alamatBeacon"));
  });

  test("skripnya INERT tanpa deklarasi — ia berhenti sebelum menyentuh apa pun", () => {
    // Astro membundel `<script>` berdasarkan IMPOR, bukan berdasarkan render,
    // jadi bundel ini ikut terbit di setiap situs termasuk yang tidak
    // menyatakan apa pun. Yang membuatnya tidak berbahaya adalah satu penjaga:
    // tanpa simpul `[data-beacon]`, skripnya tidak pernah sampai ke `fetch`.
    // Membalik penjaga itu menjadi tanpa syarat lolos typecheck dan mengirim
    // permintaan dari setiap situs turunan.
    const skrip = isi.slice(isi.indexOf("<script>"));
    assert.ok(skrip.includes("if (simpul) {"), "skrip tidak dijaga oleh keberadaan simpulnya");
    assert.ok(
      skrip.indexOf("querySelector") < skrip.indexOf("fetch"),
      "`fetch` mendahului penjaga simpulnya"
    );
  });

  test("dirender hanya bila situs MENYATAKAN beacon-nya", () => {
    // Tanpa deklarasi tidak ada simpul yang dipancarkan, jadi tidak ada
    // permintaan yang dibuat — bukan permintaan yang diabaikan di sisi server.
    // Yang tetap terbit adalah bundel skripnya, dan tes di atas yang menjaga
    // bundel itu inert.
    assert.ok(isi.includes("beaconKunjungan &&"));
  });
});
