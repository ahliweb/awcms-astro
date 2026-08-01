/**
 * Gerbang kontrak terhadap awcms.
 *
 * Dua kelas cacat yang diuji di sini sama-sama **tidak menggagalkan apa pun**
 * saat terjadi, dan itulah sebabnya keduanya butuh tes alih-alih review:
 *
 *   1. **Token tenant lain terpasang di situs ini.** Build tetap hijau dan
 *      situs terisi penuh — dengan artikel milik tenant lain, di domain ini.
 *      Rantai resolusi lama tidak bisa melihatnya sama sekali: ia memilih
 *      tenant dari konfigurasi, sementara yang menentukan isi respons adalah
 *      token.
 *   2. **Halaman berhenti di batas satu permintaan.** Situs terbit dengan
 *      sebagian artikel hilang, tanpa satu pun error, dan yang hilang justru
 *      yang paling baru.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe, beforeEach, afterEach } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { resolveTenant, TenantNotConfiguredError } from "../src/lib/awcms/tenant.ts";

const TENANT_UUID = "3f2b1c0d-4e5f-6071-8293-a4b5c6d7e8f9";
const TENANT_HEX = "3f2b1c0d4e5f60718293a4b5c6d7e8f9";
const RAHASIA = "cPI7PnFNbwACjb7UhqEhl8huKM7Lw9FY40yuj4AQYa4";
const TOKEN = `awcmsm_${TENANT_HEX}_${RAHASIA}`;

describe("tenant diturunkan dari token", () => {
  test("token mesin menentukan tenant tanpa variabel lain", () => {
    const hasil = resolveTenant({ AWCMS_API_TOKEN: TOKEN });
    assert.equal(hasil.tenantId, TENANT_UUID);
    assert.equal(hasil.asserted, false);
  });

  test("AWCMS_TENANT_ID yang cocok menandai hasil sebagai terverifikasi", () => {
    const hasil = resolveTenant({
      AWCMS_API_TOKEN: TOKEN,
      AWCMS_TENANT_ID: TENANT_UUID.toUpperCase()
    });
    assert.equal(hasil.tenantId, TENANT_UUID);
    assert.equal(hasil.asserted, true);
  });

  test("AWCMS_TENANT_ID yang berbeda MENGGAGALKAN build", () => {
    // Inilah alasan berkas itu berhenti menjadi rantai dan menjadi assertion.
    // Tanpa tes ini, satu-satunya yang menjaganya adalah kalimat di komentar.
    assert.throws(
      () =>
        resolveTenant({
          AWCMS_API_TOKEN: TOKEN,
          AWCMS_TENANT_ID: "11111111-2222-4333-8444-555555555555"
        }),
      (error) =>
        error instanceof TenantNotConfiguredError &&
        /Tenant mismatch/.test(error.message)
    );
  });

  test("token yang hilang, bukan-mesin, atau cacat ditolak masing-masing dengan sebabnya", () => {
    assert.throws(
      () => resolveTenant({}),
      (e) => /AWCMS_API_TOKEN is not set/.test(e.message)
    );

    // Token sesi manusia: bentuknya sah sebagai bearer, tetapi ia mati sendiri
    // pada reset password atau step-up MFA — kegagalan yang datang berbulan
    // kemudian, di build yang tidak mengubah apa pun.
    assert.throws(
      () => resolveTenant({ AWCMS_API_TOKEN: "sesi-manusia-yang-terlihat-sah" }),
      (e) => /not a machine credential/.test(e.message)
    );

    assert.throws(
      () => resolveTenant({ AWCMS_API_TOKEN: `awcmsm_${TENANT_HEX}_pendek` }),
      (e) => /malformed/.test(e.message)
    );
  });

  test("variabel rantai lama ditolak, bukan diabaikan", () => {
    // Diabaikan diam-diam adalah keadaan terburuk: operator memasang
    // AWCMS_TENANT_CODE=produksi, mendapat isi tenant staging, dan tidak ada
    // apa pun di build yang menyebut mana dari keduanya yang dipercaya.
    for (const nama of ["AWCMS_TENANT_CODE", "AWCMS_DEFAULT_TENANT_CODE"]) {
      assert.throws(
        () => resolveTenant({ AWCMS_API_TOKEN: TOKEN, [nama]: "produksi" }),
        (e) => new RegExp(`${nama}.*no longer decide`).test(e.message),
        `${nama} seharusnya ditolak`
      );
    }
  });

  test("tempat build TIDAK meneruskan variabel yang sudah ditolak", () => {
    // Pasangan wajib dari tes di atas, dan kelas cacat yang berbeda.
    //
    // Menolak sebuah variabel hanya bermanfaat bila tidak ada yang mengirimkan
    // variabel itu. Sepanjang `ci.yml` dan `Dockerfile` masih meneruskan
    // `AWCMS_TENANT_CODE` dari repository/build variable — nilai yang
    // dokumentasi versi sebelumnya justru menyuruh mengisinya — sebuah situs
    // yang belum membersihkan konfigurasinya mendapat build yang GAGAL di CI,
    // dengan pesan yang tidak menyebut langkah mana yang mengirimkannya. Itu
    // bukan gerbang yang bekerja; itu gerbang yang menembak pemakainya sendiri.
    //
    // Arah sebaliknya ikut dijaga di sini: `AWCMS_TENANT_ID` HARUS diteruskan.
    // Ia assertion yang menangkap token tenant lain, dan tanpa baris itu ia
    // tidak pernah berjalan di dua tempat yang benar-benar membangun situs.
    const berkas = [".github/workflows/ci.yml", "Dockerfile"];

    for (const jalur of berkas) {
      const isi = readFileSync(jalur, "utf8");

      for (const pensiun of ["AWCMS_TENANT_CODE", "AWCMS_DEFAULT_TENANT_CODE"]) {
        // Komentar boleh menyebut namanya — justru di sanalah alasannya
        // ditulis. Yang dilarang adalah baris yang benar-benar meneruskannya.
        const meneruskan = isi
          .split("\n")
          .filter((baris) => !baris.trim().startsWith("#"))
          .some((baris) => baris.includes(pensiun));

        assert.equal(meneruskan, false, `${jalur} masih meneruskan ${pensiun}`);
      }

      assert.ok(
        isi.includes("AWCMS_TENANT_ID"),
        `${jalur} tidak meneruskan AWCMS_TENANT_ID, jadi assertion tenant tidak pernah jalan di sana`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Traversal daftar + hidrasi, dengan `fetch` ditiru.
// ---------------------------------------------------------------------------

const fetchAsli = globalThis.fetch;

/** Membangun satu post penuh; `ringkas()` memangkasnya seperti awcms memangkasnya. */
function buatPost(index, { locale = "id", status = "published", visibility = "public", grup } = {}) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    title: `Artikel ${index}`,
    slug: `artikel-${index}`,
    excerpt: null,
    contentJson: { awcmsAstro: { schemaVersion: 1, urutan: index, kategori: "panduan" } },
    status,
    visibility,
    metaDescription: `Meta ${index}`,
    canonicalUrl: null,
    locale,
    ...(grup === undefined ? {} : { translationGroupId: grup }),
    publishedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
    createdAt: `2026-07-01T00:00:${String(index).padStart(2, "0")}.000Z`
  };
}

function ringkas(post) {
  const { id, title, slug, status, visibility, locale, publishedAt, updatedAt, createdAt } = post;
  return { id, title, slug, status, visibility, locale, publishedAt, updatedAt, createdAt };
}

/**
 * `fetch` tiruan yang meniru kontrak awcms.
 *
 * Dua hal ditiru dengan sengaja, karena keduanya adalah PENOLAKAN di sisi awcms
 * dan diam-diam berperilaku salah bila ditiru longgar:
 *
 *   - tanpa `view=full`, daftar memberi RINGKASAN — tanpa `contentJson`,
 *     tanpa `metaDescription`, tanpa `translationGroupId`. Adapter yang lupa
 *     memintanya akan membangun situs kosong tanpa satu pun error, jadi tiruan
 *     ini menolak memberi baris penuh kecuali diminta;
 *   - `view=full` tanpa `order=created_at` dijawab 400.
 *
 * `jejak` mencatat setiap permintaan supaya tes bisa membuktikan tidak ada
 * lagi satu permintaan per post (N+1 yang dulu ada).
 */
function pasangFetchTiruan(posts, { ukuranHalaman = 100, jejak = [] } = {}) {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    jejak.push(url.pathname + url.search);

    const detail = url.pathname.match(/^\/api\/v1\/blog\/posts\/(.+)$/);
    if (detail) {
      const post = posts.find((p) => p.id === detail[1]);
      return Response.json({ success: true, data: { ...post, termIds: [] } });
    }

    const view = url.searchParams.get("view") ?? "summary";

    if (view === "full" && url.searchParams.get("order") !== "created_at") {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "view=full requires order=created_at"
          }
        },
        { status: 400 }
      );
    }

    const cursor = url.searchParams.get("cursor");
    const mulai = cursor ? Number(atob(cursor)) : 0;
    const irisan = posts.slice(mulai, mulai + ukuranHalaman);
    const nextCursor =
      irisan.length === ukuranHalaman && mulai + ukuranHalaman < posts.length
        ? btoa(String(mulai + ukuranHalaman))
        : null;

    return Response.json({
      success: true,
      data: {
        posts: view === "full" ? irisan : irisan.map(ringkas),
        nextCursor
      }
    });
  };

  return jejak;
}

describe("traversal build feed", () => {
  let getArticles;
  let resetContentCacheForTests;

  beforeEach(async () => {
    process.env.AWCMS_API_URL = "http://awcms.uji";
    process.env.AWCMS_API_TOKEN = TOKEN;
    delete process.env.AWCMS_TENANT_CODE;
    delete process.env.AWCMS_DEFAULT_TENANT_CODE;

    ({ getArticles, resetContentCacheForTests } = await import("../src/lib/content.ts"));
    resetContentCacheForTests();
  });

  afterEach(() => {
    globalThis.fetch = fetchAsli;
  });

  test("melewati batas satu halaman tanpa kehilangan satu artikel pun", async () => {
    // 250 post, halaman 100: sebuah build yang berhenti di halaman pertama
    // menerbitkan 100 artikel dan tidak melaporkan apa pun tentang 150 sisanya.
    const posts = Array.from({ length: 250 }, (_, i) => buatPost(i));
    pasangFetchTiruan(posts);

    const artikel = await getArticles("panduan", "id");
    assert.equal(artikel.length, 250);
  });

  test("draft dan post non-publik tidak pernah terbit", async () => {
    const posts = [
      buatPost(0),
      buatPost(1, { status: "draft" }),
      buatPost(2, { visibility: "private" })
    ];
    pasangFetchTiruan(posts);

    const artikel = await getArticles("panduan", "id");
    assert.equal(artikel.length, 1);
  });

  test("satu traversal, bukan satu permintaan per post", async () => {
    // Adapter ini pernah menyusuri daftar lalu mengambil ULANG setiap post
    // lewat /posts/{id} — N+1 permintaan ke endpoint admin pada setiap publish.
    // Sejak awcms punya `view=full`, permintaan per-id itu tidak boleh muncul
    // lagi; kalau ia kembali, ia kembali diam-diam.
    const posts = Array.from({ length: 5 }, (_, i) => buatPost(i));
    const jejak = pasangFetchTiruan(posts);

    await getArticles("panduan", "id");

    const perId = jejak.filter((j) => /\/api\/v1\/blog\/posts\/[^?]/.test(j));
    assert.deepEqual(perId, [], "tidak boleh ada permintaan per post");
    assert.equal(jejak.length, 1, "satu halaman = satu permintaan");
  });

  test("adapter meminta view=full atas urutan yang stabil", async () => {
    // Dua parameter ini yang membedakan "situs terbit" dari "situs kosong":
    // tanpa view=full daftar tidak memuat contentJson sama sekali, dan awcms
    // menolak view=full di atas urutan mutable.
    const jejak = pasangFetchTiruan([buatPost(0)]);

    await getArticles("panduan", "id");

    assert.match(jejak[0], /view=full/);
    assert.match(jejak[0], /order=created_at/);
    assert.match(jejak[0], /status=published/);
  });

  test("isi artikel benar-benar sampai ke kontrak komponen", async () => {
    // Regresi yang dibayar mahal: adapter ini pernah membaca `contentJson` dari
    // respons yang tidak pernah memuatnya. Hasilnya build hijau dengan seluruh
    // seksi kosong — `kategori` juga tinggal di dalam `contentJson`.
    const posts = [buatPost(7)];
    pasangFetchTiruan(posts);

    const [artikel] = await getArticles("panduan", "id");
    assert.equal(artikel.entry.data.kategori, "panduan");
    assert.equal(artikel.entry.data.description, "Meta 7");
  });

  test("awcms yang MENGABAIKAN view=full menggagalkan build", async () => {
    // awcms lama tidak menolak parameter yang tidak dikenalnya — ia
    // mengabaikannya dan menjawab ringkasan. Tanpa gerbang ini, situs terbit
    // dengan setiap badan artikel kosong dan setiap seksi kosong, hijau.
    const posts = [buatPost(0), buatPost(1)];
    globalThis.fetch = async () =>
      Response.json({
        success: true,
        data: { posts: posts.map(ringkas), nextCursor: null }
      });

    await assert.rejects(
      () => getArticles("panduan", "id"),
      (e) => /ignored \?view=full/.test(e.message)
    );
  });

  test("terjemahan yang tidak bisa dipasangkan menggagalkan build", async () => {
    const posts = [buatPost(0), buatPost(1, { locale: "en" })];
    pasangFetchTiruan(posts);

    await assert.rejects(
      () => getArticles("panduan", "id"),
      (e) => /translationGroupId/.test(e.message)
    );
  });

  test("terjemahan yang membawa grup dipasangkan, bukan ditolak", async () => {
    // Gerbang di atas adalah assertion atas DATA, bukan pemeriksaan versi
    // awcms: begitu field-nya benar-benar dikembalikan, jalur ini lewat tanpa
    // ada yang perlu diubah di sini.
    const posts = [
      buatPost(0, { grup: "grup-1" }),
      buatPost(1, { locale: "en", grup: "grup-1" })
    ];
    pasangFetchTiruan(posts);

    const artikel = await getArticles("panduan", "en");
    assert.equal(artikel.length, 1);
    assert.equal(artikel[0].isFallback, false);
    assert.equal(artikel[0].slug, "artikel-0");
  });
});
