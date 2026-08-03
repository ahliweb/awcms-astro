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
function pasangFetchTiruan(posts, { ukuranHalaman = 100, jejak = [], media = new Map() } = {}) {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    jejak.push(url.pathname + url.search);

    if (url.pathname === "/api/v1/media/objects") {
      const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);

      // Kontrak awcms: id yang tidak resolve DILAPORKAN di `unresolved`, tidak
      // dibuang diam-diam — itu yang membuat pemanggil bisa membedakan "tidak
      // punya gambar" dari "gambarnya hilang".
      return Response.json({
        success: true,
        data: {
          items: ids.filter((id) => media.has(id)).map((id) => ({ id, ...media.get(id) })),
          unresolved: ids.filter((id) => !media.has(id))
        }
      });
    }

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

  test("awcms yang menerima koneksi lalu DIAM menggagalkan build", async () => {
    // Kelas cacat yang berbeda dari setiap gerbang lain di berkas ini, dan
    // satu-satunya yang tidak menghasilkan keluaran salah: ia tidak
    // menghasilkan keluaran sama sekali.
    //
    // Sebuah awcms yang menerima koneksi lalu tidak pernah menjawab bukan
    // keadaan hipotetis — ia bentuk kegagalan paling umum dari basis data yang
    // kehabisan koneksi, dan `fetch` tidak punya batas waktu bawaan. Tanpa
    // deadline, build menggantung sampai batas job CI membunuhnya (15 menit,
    // dengan pesan yang menyebut nama job alih-alih awcms) atau, di mesin
    // lokal, selamanya.
    process.env.AWCMS_API_TIMEOUT_MS = "80";

    // Tiruan yang meniru `fetch` sungguhan: ia menghormati sinyal dan menolak
    // dengan `TimeoutError`. Tiruan yang langsung menolak akan menghijaukan
    // kode yang tidak pernah memasang sinyalnya sama sekali.
    globalThis.fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal.reason ?? new Error("aborted"))
        );
      });

    try {
      await assert.rejects(
        () => getArticles("panduan", "id"),
        (e) => e.code === "TIMEOUT" && /within 80 ms/.test(e.message)
      );
    } finally {
      delete process.env.AWCMS_API_TIMEOUT_MS;
    }
  });

  test("batas waktu yang tidak bisa dibaca DITOLAK, bukan diabaikan", async () => {
    // Nilai yang terbaca seperti konfigurasi dan tidak memutuskan apa pun
    // adalah kelas cacat yang repo ini paling sering menulis aturan
    // terhadapnya. `0` disebut khusus karena ia terlihat seperti "tanpa batas"
    // dan justru mengembalikan keadaan yang gerbang di atas ada untuk mencegah.
    for (const nilai of ["nanti", "0", "-1"]) {
      process.env.AWCMS_API_TIMEOUT_MS = nilai;
      resetContentCacheForTests();
      globalThis.fetch = async () => {
        throw new Error("tidak boleh sampai ke jaringan");
      };

      try {
        await assert.rejects(
          () => getArticles("panduan", "id"),
          (e) => e.code === "CONFIG_INVALID",
          nilai
        );
      } finally {
        delete process.env.AWCMS_API_TIMEOUT_MS;
      }
    }
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

// ---------------------------------------------------------------------------
// Gambar artikel dari media awcms.
//
// Kelas cacat yang dijaga di sini sama dengan yang membuat berkas ini ada:
// keluaran yang SALAH tanpa satu pun kegagalan. Sebuah build yang kehilangan
// seluruh gambarnya — token tanpa `media.read`, awcms yang lebih tua, media
// yang tidak dikonfigurasi — menerbitkan situs yang tampak sengaja tanpa
// ilustrasi, dan tidak ada yang bisa membedakannya dari situs yang memang
// begitu.
// ---------------------------------------------------------------------------

const MEDIA_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function buatObjek({ altText = "Foto loket layanan", width = 1600, height = 900 } = {}) {
  return {
    publicUrl: "https://media.contoh.test/news/foto.webp",
    altText,
    mimeType: "image/webp",
    width,
    height
  };
}

describe("gambar artikel dari media awcms", () => {
  let getArticles;
  let resetContentCacheForTests;

  beforeEach(async () => {
    process.env.AWCMS_API_URL = "http://awcms.uji";
    process.env.AWCMS_API_TOKEN = TOKEN;
    ({ getArticles, resetContentCacheForTests } = await import("../src/lib/content.ts"));
    resetContentCacheForTests();
  });

  afterEach(() => {
    globalThis.fetch = fetchAsli;
  });

  test("featuredMediaId menjadi gambar artikel, dengan altText dari awcms", async () => {
    const posts = [{ ...buatPost(0), featuredMediaId: MEDIA_ID }];
    pasangFetchTiruan(posts, { media: new Map([[MEDIA_ID, buatObjek()]]) });

    const [artikel] = await getArticles("panduan", "id");

    assert.equal(artikel.gambar.src, "https://media.contoh.test/news/foto.webp");
    assert.equal(artikel.gambar.alt, "Foto loket layanan");
    assert.equal(artikel.gambar.width, 1600);
    assert.equal(artikel.gambar.height, 900);
  });

  test("altText kosong jatuh ke judul artikel, bukan ke alt kosong", async () => {
    // `alt=""` memberi tahu pembaca layar bahwa gambarnya dekoratif. Gambar
    // kepala artikel bukan dekorasi, jadi kosong adalah jawaban yang salah —
    // judulnya setidaknya dalam bahasa yang sedang dibaca.
    const posts = [{ ...buatPost(0), featuredMediaId: MEDIA_ID }];
    pasangFetchTiruan(posts, {
      media: new Map([[MEDIA_ID, buatObjek({ altText: "   " })]])
    });

    const [artikel] = await getArticles("panduan", "id");
    assert.equal(artikel.gambar.alt, "Artikel 0");
  });

  test("artikel tanpa featuredMediaId TIDAK memicu satu permintaan media pun", async () => {
    const jejak = [];
    pasangFetchTiruan([buatPost(0)], { jejak });

    await getArticles("panduan", "id");

    assert.equal(jejak.filter((j) => j.startsWith("/api/v1/media/")).length, 0);
  });

  test("satu id yang hilang menjadi placeholder, sisanya tetap terbit", async () => {
    // awcms mengizinkan objek di-purge dan memutuskan rujukan yang menggantung
    // menjadi inert, bukan penghalang (ADR-0056 §B). Menggagalkan build di sini
    // berarti situs tidak bisa terbit karena satu gambar dihapus.
    const hilang = "ffffffff-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const posts = [
      { ...buatPost(0), featuredMediaId: MEDIA_ID },
      { ...buatPost(1), featuredMediaId: hilang }
    ];
    pasangFetchTiruan(posts, { media: new Map([[MEDIA_ID, buatObjek()]]) });

    const artikel = await getArticles("panduan", "id");

    assert.equal(artikel.length, 2);
    assert.ok(artikel[0].gambar);
    assert.equal(artikel[1].gambar, undefined);
  });

  test("SELURUH id yang hilang MENGGAGALKAN build", async () => {
    // Bentuk yang sama dengan cacat ADR-0018: build hijau, situs terbit, dan
    // setiap artikel kehilangan gambarnya sekaligus tanpa ada yang menyebutnya.
    const posts = [
      { ...buatPost(0), featuredMediaId: MEDIA_ID },
      { ...buatPost(1), featuredMediaId: "ffffffff-bbbb-4ccc-8ddd-eeeeeeeeeeee" }
    ];
    pasangFetchTiruan(posts, { media: new Map() });

    await assert.rejects(
      () => getArticles("panduan", "id"),
      (e) => /resolved NONE/.test(e.message)
    );
  });

  test("lebih dari 100 id dipecah menjadi beberapa permintaan, tanpa kehilangan satu pun", async () => {
    // `ids` dibatasi 100 di awcms dan kelebihannya dijawab 400 — bukan
    // dipotong. Tanpa pemecahan, situs dengan 150 artikel bergambar gagal
    // build; dengan pemecahan yang salah, sebagian gambar hilang diam-diam.
    const jejak = [];
    const media = new Map();
    const posts = Array.from({ length: 150 }, (_, i) => {
      const id = `aaaaaaaa-bbbb-4ccc-8ddd-${String(i).padStart(12, "0")}`;
      media.set(id, buatObjek());
      return { ...buatPost(i), featuredMediaId: id };
    });
    pasangFetchTiruan(posts, { media, jejak });

    const artikel = await getArticles("panduan", "id");

    assert.equal(artikel.length, 150);
    assert.equal(artikel.filter((a) => a.gambar).length, 150);

    const permintaanMedia = jejak.filter((j) => j.startsWith("/api/v1/media/objects"));
    assert.equal(permintaanMedia.length, 2);
    for (const permintaan of permintaanMedia) {
      const ids = new URL(`http://x${permintaan}`).searchParams.get("ids").split(",");
      assert.ok(ids.length <= 100, `satu permintaan membawa ${ids.length} id`);
    }
  });

  test("media di-resolve SEKALI per build, bukan sekali per tab atau per locale", async () => {
    const jejak = [];
    const posts = [
      { ...buatPost(0), featuredMediaId: MEDIA_ID, grup: "grup-1" },
      { ...buatPost(1, { locale: "en", grup: "grup-1" }), featuredMediaId: MEDIA_ID }
    ];
    pasangFetchTiruan(posts, { media: new Map([[MEDIA_ID, buatObjek()]]), jejak });

    await getArticles("panduan", "id");
    await getArticles("panduan", "en");

    assert.equal(jejak.filter((j) => j.startsWith("/api/v1/media/objects")).length, 1);
  });
});

// ---------------------------------------------------------------------------
// Kartu share per artikel.
//
// awcms menyatakan `seoImageMediaId` MENGALAHKAN `featuredMediaId` untuk
// pratinjau sosial, dan `seo-facts-port-adapter.ts` miliknya menyelesaikan
// persis `seo_image_media_id ?? featured_media_id`. Urutan itu dicerminkan di
// sini, bukan ditemukan ulang: situs yang kartunya berbeda dari permukaan SEO
// CMS-nya sendiri adalah dua jawaban untuk satu pertanyaan, dan hanya satu yang
// terlihat editor.
// ---------------------------------------------------------------------------

const KARTU_ID = "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff";

describe("kartu share per artikel", () => {
  let getArticles;
  let resetContentCacheForTests;

  beforeEach(async () => {
    process.env.AWCMS_API_URL = "http://awcms.uji";
    process.env.AWCMS_API_TOKEN = TOKEN;
    ({ getArticles, resetContentCacheForTests } = await import("../src/lib/content.ts"));
    resetContentCacheForTests();
  });

  afterEach(() => {
    globalThis.fetch = fetchAsli;
  });

  test("seoImageMediaId mengalahkan featuredMediaId — urutan milik awcms", async () => {
    const posts = [{ ...buatPost(0), featuredMediaId: MEDIA_ID, seoImageMediaId: KARTU_ID }];
    pasangFetchTiruan(posts, {
      media: new Map([
        [MEDIA_ID, buatObjek()],
        [
          KARTU_ID,
          {
            publicUrl: "https://media.contoh.test/news/kartu.png",
            altText: "Kartu berbagi",
            mimeType: "image/png",
            width: 1200,
            height: 630
          }
        ]
      ])
    });

    const [artikel] = await getArticles("panduan", "id");

    assert.equal(artikel.kartuShare.src, "https://media.contoh.test/news/kartu.png");
    // Gambar HALAMAN tetap featuredMediaId: yang diprioritaskan awcms hanya
    // permukaan pratinjau, bukan ilustrasi di badan artikel.
    assert.equal(artikel.gambar.src, "https://media.contoh.test/news/foto.webp");
  });

  test("tanpa seoImageMediaId, featuredMediaId menjadi kartunya", async () => {
    const posts = [{ ...buatPost(0), featuredMediaId: MEDIA_ID }];
    pasangFetchTiruan(posts, { media: new Map([[MEDIA_ID, buatObjek()]]) });

    const [artikel] = await getArticles("panduan", "id");
    assert.equal(artikel.kartuShare.src, artikel.gambar.src);
  });

  test("kartu membawa MIME dan ukurannya sendiri, bukan konstanta kartu situs", async () => {
    // Inilah cacat yang menunggu bila keduanya tidak ikut: setiap halaman
    // artikel memasang `image/png` 1200×630 untuk berkas WebP 1600×900, dan
    // pengunduh pratinjau yang memercayainya melebarkan ke kotak yang salah
    // atau menolak kartunya — tanpa satu pun kegagalan di build.
    const posts = [{ ...buatPost(0), featuredMediaId: MEDIA_ID }];
    pasangFetchTiruan(posts, { media: new Map([[MEDIA_ID, buatObjek()]]) });

    const [artikel] = await getArticles("panduan", "id");

    assert.equal(artikel.kartuShare.type, "image/webp");
    assert.equal(artikel.kartuShare.width, 1600);
    assert.equal(artikel.kartuShare.height, 900);
  });

  test("artikel tanpa gambar apa pun tidak punya kartu — dan itu didukung", async () => {
    pasangFetchTiruan([buatPost(0)]);

    const [artikel] = await getArticles("panduan", "id");
    assert.equal(artikel.kartuShare, undefined);
  });

  test("kedua id diminta dalam SATU batch, dan yang sama tidak diminta dua kali", async () => {
    const jejak = [];
    const posts = [
      { ...buatPost(0), featuredMediaId: MEDIA_ID, seoImageMediaId: KARTU_ID },
      { ...buatPost(1), featuredMediaId: MEDIA_ID }
    ];
    pasangFetchTiruan(posts, {
      media: new Map([
        [MEDIA_ID, buatObjek()],
        [KARTU_ID, { ...buatObjek(), publicUrl: "https://media.contoh.test/news/kartu.png" }]
      ]),
      jejak
    });

    await getArticles("panduan", "id");

    const permintaan = jejak.filter((j) => j.startsWith("/api/v1/media/objects"));
    assert.equal(permintaan.length, 1);
    const ids = new URL(`http://x${permintaan[0]}`).searchParams.get("ids").split(",");
    assert.deepEqual([...new Set(ids)].sort(), ids.sort());
    assert.equal(ids.length, 2);
  });
});

// ---------------------------------------------------------------------------
// Kartu situs sebagai objek utuh.
//
// Yang dijaga di sini bukan nilainya melainkan BENTUKNYA: selama `src` dan
// `alt` adalah dua nilai terpisah, keduanya bisa datang dari dua gambar
// berbeda — dan itu yang terjadi sebelum ini, di halaman seksi maupun halaman
// artikel. Tipe `KartuShare` yang membuatnya berhenti bisa ditulis; tes ini
// menjaga bawaannya tetap benar.
// ---------------------------------------------------------------------------

describe("kartu situs", () => {
  test("membawa MIME dan ukuran yang dikontrakkan .env.example", async () => {
    const { kartuSitus, SOCIAL_IMAGE_WIDTH, SOCIAL_IMAGE_HEIGHT } = await import(
      "../src/lib/social-image.ts"
    );
    const kartu = kartuSitus("Kartu berbagi situs");

    // Template ini tidak mengisi SITE_SOCIAL_IMAGE, jadi bawaannya `undefined`
    // — dan itu keadaan yang DIDUKUNG: halaman tidak memasang tag gambar sama
    // sekali dan pratinjau jatuh ke kartu teks.
    if (kartu === undefined) {
      assert.equal(SOCIAL_IMAGE_WIDTH, 1200);
      assert.equal(SOCIAL_IMAGE_HEIGHT, 630);
      return;
    }

    assert.equal(kartu.type, "image/png");
    assert.equal(kartu.width, SOCIAL_IMAGE_WIDTH);
    assert.equal(kartu.height, SOCIAL_IMAGE_HEIGHT);
    assert.equal(kartu.alt, "Kartu berbagi situs");
  });
});
