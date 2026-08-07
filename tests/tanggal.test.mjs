/**
 * Gerbang pemformatan dan perbandingan tanggal.
 *
 * Ketiga fungsi di `src/lib/tanggal.ts` kecil, dan itu justru alasannya diuji:
 * masing-masing membawa satu keputusan yang alasannya ditulis di komentar dan
 * tidak bisa dilihat siapa pun dari keluarannya.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import {
  pernahDiubahSetelahTerbit,
  tanggalMesin,
  tanggalPanjang
} from "../src/lib/tanggal.ts";

describe("pernahDiubahSetelahTerbit", () => {
  test("artikel yang baru terbit TIDAK dianggap pernah diubah", () => {
    // Kedua jalur terbit awcms menulis `published_at` dan `updated_at` dalam
    // satu pernyataan dengan nilai yang sama, jadi keadaan ini bukan teori — ia
    // keadaan SETIAP artikel pada menit pertamanya. Perbandingan yang tidak
    // ketat akan memasang "Diperbarui" pada semuanya, seketika.
    const t = new Date("2026-08-01T02:00:00.000Z");
    assert.equal(pernahDiubahSetelahTerbit(t, new Date(t)), false);
  });

  test("koreksi di HARI YANG SAMA tetap terhitung", () => {
    // Ini yang hilang bila perbandingannya dilakukan pada tingkat tanggal, dan
    // di situs berita justru koreksi jenis inilah yang paling sering terjadi.
    const terbit = new Date("2026-08-01T02:00:00.000Z");
    const diubah = new Date("2026-08-01T09:30:00.000Z");
    assert.equal(pernahDiubahSetelahTerbit(terbit, diubah), true);
  });

  test("stempel ubah yang MENDAHULUI terbit tidak dilaporkan sebagai perubahan", () => {
    const terbit = new Date("2026-08-05T00:00:00.000Z");
    const diubah = new Date("2026-07-10T00:00:00.000Z");
    assert.equal(pernahDiubahSetelahTerbit(terbit, diubah), false);
  });
});

describe("tanggalMesin", () => {
  test("mengikuti komponen tanggal LOKAL, bukan hasil toISOString", () => {
    // Bedanya baru terlihat pada zona berselisih positif dari UTC: sebuah
    // artikel yang terbit pukul 20.00 WIB ber-`toISOString()` tanggal 13.00 UTC
    // hari yang SAMA — tetapi pukul 23.00 WIB sudah menjadi hari SEBELUMNYA di
    // UTC. Bila atribut `datetime` diturunkan dari UTC sementara teks di
    // sebelahnya diturunkan dari waktu lokal, keduanya berselisih satu hari
    // tanpa ada yang bisa melihatnya di layar.
    //
    // Diuji terhadap komponen lokal `Date` itu sendiri supaya tidak bergantung
    // pada zona waktu mesin yang menjalankan tes.
    for (const iso of [
      "2026-08-07T16:00:00.000Z",
      "2026-01-01T00:30:00.000Z",
      "2026-12-31T23:45:00.000Z"
    ]) {
      const d = new Date(iso);
      const diharapkan = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
      ].join("-");

      assert.equal(tanggalMesin(d), diharapkan, iso);
    }
  });

  test("bulan dan hari selalu dua digit", () => {
    assert.match(tanggalMesin(new Date(2026, 0, 5)), /^\d{4}-01-05$/);
  });
});

describe("tanggalPanjang", () => {
  test("mengikuti bahasa pembaca", () => {
    const d = new Date(2026, 7, 7);
    assert.notEqual(tanggalPanjang("id", d), tanggalPanjang("en", d));
  });

  test("menyebut hari yang sama dengan tanggalMesin", () => {
    // Keduanya muncul berdampingan di satu elemen `<time>`; berselisih hari
    // berarti atribut mesin dan teks manusia menyatakan dua hal berbeda.
    const d = new Date("2026-08-07T16:00:00.000Z");
    assert.ok(tanggalPanjang("id", d).includes(String(d.getDate())));
    assert.equal(tanggalMesin(d).endsWith(String(d.getDate()).padStart(2, "0")), true);
  });
});
