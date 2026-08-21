/**
 * Gerbang identitas situs (`awcms` #596, ADR-0102).
 *
 * ## Apa yang dipertaruhkan
 *
 * Sebelum ini, siapa sebuah situs — nama, logo, favicon, tagline, baris hak
 * cipta, alamat redaksi, kontak, profil sosial, simpul `Organization` — hanya
 * bisa diubah dengan menyunting `src/config/site.ts` atau `.env` deployment.
 * Redaksi yang memiliki identitas itu tidak bisa menyentuhnya, dan tenant kedua
 * mustahil tanpa fork. Itu cacat yang ditutup issue tersebut.
 *
 * Yang dijaga di sini adalah tiga keputusan yang semuanya GAGAL DALAM DIAM bila
 * salah:
 *
 *   1. **403/404 jatuh ke cadangan; sisanya MENGGAGALKAN build.** Keduanya
 *      terlihat sama di log dan menuntut jawaban berlawanan: "kredensial build
 *      belum diberi izin" adalah keadaan yang wajar dan situsnya tetap benar,
 *      sedangkan "CMS-nya mati" yang diterbitkan sebagai cadangan berarti situs
 *      yang diam-diam berganti nama menjadi nama template.
 *   2. **URL sosial ditolak, bukan disanitasi.** Ia dirender sebagai `<a href>`
 *      di setiap halaman, dan `javascript:` adalah satu-satunya tempat "server
 *      sudah memvalidasinya" bukan alasan yang cukup untuk berhenti bertanya.
 *   3. **Urutan jatuh ada di SATU tempat.** Ditulis inline, `BaseLayout` dan
 *      `schema.ts` akan menerbitkan masthead dan structured data yang berbeda
 *      pendapat tentang nama situsnya sendiri. Perayap membaca yang kedua,
 *      pembaca membaca yang pertama, dan tidak ada yang gagal.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe, beforeEach, afterEach } from "bun:test";
import assert from "node:assert/strict";

import {
  bacaTautanSosial,
  profilSitus,
  resetProfilCacheForTests
} from "../src/lib/awcms/profil.ts";
import {
  adaKontak,
  barisCopyright,
  namaPenerbit,
  namaSitus,
  taglineSitus,
  tautanTelepon,
  tautanWhatsapp
} from "../src/lib/identitas.ts";

const TENANT_HEX = "3f2b1c0d4e5f60718293a4b5c6d7e8f9";
const TOKEN = `awcmsm_${TENANT_HEX}_cPI7PnFNbwACjb7UhqEhl8huKM7Lw9FY40yuj4AQYa4`;
const LOGO_ID = "11111111-1111-4111-8111-111111111111";
const FAVICON_ID = "22222222-2222-4222-8222-222222222222";

const fetchAsli = globalThis.fetch;

/** Profil kosong — keadaan yang didukung, bukan kegagalan. */
const KOSONG = {
  tersedia: true,
  tagline: null,
  copyrightNotice: null,
  logo: null,
  favicon: null,
  editorialAddress: null,
  contactEmail: null,
  contactPhone: null,
  whatsappNumber: null,
  socialLinks: [],
  siteName: null,
  organizationName: null,
  organizationLogo: null
};

function muatan(tambahan = {}) {
  return {
    tagline: null,
    copyrightNotice: null,
    logoMediaId: null,
    faviconMediaId: null,
    editorialAddress: null,
    contactEmail: null,
    contactPhone: null,
    whatsappNumber: null,
    socialLinks: [],
    siteName: null,
    organizationName: null,
    organizationLogoMediaId: null,
    defaultSocialMediaId: null,
    ...tambahan
  };
}

/**
 * `fetch` tiruan. `media` meniru kontrak awcms: id yang tidak resolve
 * DILAPORKAN di `unresolved`, tidak dibuang diam-diam.
 */
function pasangFetchTiruan({ profil, status = 200, media = new Map(), jejak = [] }) {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    jejak.push(url.pathname + url.search);

    if (url.pathname === "/api/v1/media/objects") {
      const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
      return Response.json({
        success: true,
        data: {
          items: ids.filter((id) => media.has(id)).map((id) => ({ id, ...media.get(id) })),
          unresolved: ids.filter((id) => !media.has(id))
        }
      });
    }

    if (status !== 200) {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "ditolak" } },
        { status }
      );
    }

    return Response.json({ success: true, data: profil });
  };

  return jejak;
}

describe("profil dibaca dari awcms", () => {
  beforeEach(() => {
    process.env.AWCMS_API_URL = "http://awcms.uji";
    process.env.AWCMS_API_TOKEN = TOKEN;
    resetProfilCacheForTests();
  });

  afterEach(() => {
    globalThis.fetch = fetchAsli;
    resetProfilCacheForTests();
  });

  test("setiap bidang sampai, dan id media diresolusi jadi objek", async () => {
    const jejak = pasangFetchTiruan({
      profil: muatan({
        tagline: "Kabar dari Kalimantan Tengah",
        copyrightNotice: "© 2019–2026 PT Lentera Kalteng",
        logoMediaId: LOGO_ID,
        faviconMediaId: FAVICON_ID,
        editorialAddress: "Jalan Yos Sudarso 1, Palangka Raya",
        contactEmail: "redaksi@contoh.test",
        contactPhone: "+62 536 123456",
        whatsappNumber: "+62 812-3456-7890",
        socialLinks: [{ platform: "Facebook", url: "https://facebook.com/contoh" }],
        siteName: "Lentera Kalteng",
        organizationName: "PT Lentera Kalteng"
      }),
      media: new Map([
        [LOGO_ID, { publicUrl: "https://media.test/logo.png", altText: null, mimeType: "image/png", width: 400, height: 120 }],
        [FAVICON_ID, { publicUrl: "https://media.test/ikon.png", altText: null, mimeType: "image/png", width: 64, height: 64 }]
      ])
    });

    const profil = await profilSitus();

    assert.equal(profil.tersedia, true);
    assert.equal(profil.siteName, "Lentera Kalteng");
    assert.equal(profil.logo?.publicUrl, "https://media.test/logo.png");
    assert.equal(profil.favicon?.mimeType, "image/png");
    assert.equal(profil.socialLinks.length, 1);

    // SATU permintaan media untuk seluruh id, bukan satu per id.
    assert.equal(jejak.filter((j) => j.startsWith("/api/v1/media/objects")).length, 1);
  });

  test("id logo yang tidak resolve merender NIHIL, bukan img rusak, dan tidak menggagalkan", async () => {
    // Berbeda dari feed artikel — di sana nol-dari-N MELEMPAR, karena artinya
    // kredensial tidak punya `media.read` dan setiap artikel kehilangan
    // gambarnya sekaligus. Sebuah situs punya paling banyak tiga berkas ini,
    // dan "operator menghapus logonya" adalah hal yang wajar terjadi.
    pasangFetchTiruan({
      profil: muatan({ logoMediaId: LOGO_ID, siteName: "Lentera" }),
      media: new Map()
    });

    const profil = await profilSitus();

    assert.equal(profil.tersedia, true);
    assert.equal(profil.logo, null);
    assert.equal(profil.siteName, "Lentera");
  });

  test("permintaan media TIDAK dikirim bila tidak ada satu pun id", async () => {
    const jejak = pasangFetchTiruan({ profil: muatan({ siteName: "Lentera" }) });

    await profilSitus();

    assert.equal(jejak.filter((j) => j.startsWith("/api/v1/media/objects")).length, 0);
  });

  test("dipanggil sekali per build meski dimintai berkali-kali", async () => {
    // Setiap halaman di setiap locale merender masthead dan footer.
    const jejak = pasangFetchTiruan({ profil: muatan() });

    await profilSitus();
    await profilSitus();
    await profilSitus();

    assert.equal(jejak.filter((j) => j.startsWith("/api/v1/site-profile")).length, 1);
  });

  for (const status of [403, 404]) {
    test(`${status} jatuh ke cadangan alih-alih menggagalkan build`, async () => {
      // 403 = kredensial build belum punya `site_profile.profile.read` — nyata
      // dan diharapkan, karena awcms menyemai izin per tenant saat tenant itu
      // dibuat. 404 = awcms-nya lebih tua dari endpoint-nya. Keduanya "awcms
      // bilang tidak", dan situsnya tetap benar dengan nilai cadangan.
      pasangFetchTiruan({ profil: muatan(), status });

      const profil = await profilSitus();

      assert.equal(profil.tersedia, false);
      assert.equal(profil.siteName, null);
      assert.deepEqual(profil.socialLinks, []);
    });
  }

  for (const status of [500, 502]) {
    test(`${status} MENGGAGALKAN build`, async () => {
      // awcms rusak, bukan awcms menolak. Membangun terus akan menerbitkan
      // situs yang diam-diam kembali ke nilai bawaan template — dan itu
      // terlihat persis seperti deploy yang berhasil.
      pasangFetchTiruan({ profil: muatan(), status });

      await assert.rejects(() => profilSitus());
    });
  }
});

describe("tautan sosial ditolak, bukan disanitasi", () => {
  test("hanya http(s) absolut yang selamat", () => {
    const hasil = bacaTautanSosial([
      { platform: "Facebook", url: "https://facebook.com/contoh" },
      { platform: "Situs", url: "http://contoh.test" },
      { platform: "Jahat", url: "javascript:alert(1)" },
      { platform: "Data", url: "data:text/html,<script>alert(1)</script>" },
      { platform: "Relatif", url: "/tentang" },
      { platform: "", url: "https://contoh.test" },
      { platform: "Tanpa url", url: null },
      "bukan objek",
      null
    ]);

    assert.deepEqual(
      hasil.map((t) => t.platform),
      ["Facebook", "Situs"]
    );
  });

  test("bukan larik menjadi larik kosong", () => {
    assert.deepEqual(bacaTautanSosial(undefined), []);
    assert.deepEqual(bacaTautanSosial({ platform: "X", url: "https://x.test" }), []);
    assert.deepEqual(bacaTautanSosial("https://x.test"), []);
  });
});

describe("urutan jatuh, di satu tempat", () => {
  test("nama situs: profil menang, konfigurasi mencadangi", () => {
    assert.equal(namaSitus({ ...KOSONG, siteName: "Lentera" }), "Lentera");
    // Tanpa profil ia jatuh ke `siteConfig.name`, yang di repo ini datang dari
    // `SITE_NAME` dengan bawaan template.
    assert.equal(typeof namaSitus(KOSONG), "string");
    assert.ok(namaSitus(KOSONG).length > 0);
  });

  test("penerbit jatuh ke nama situs, bukan ke null", () => {
    // Penerbit bernama `null` adalah structured data yang lebih buruk daripada
    // penerbit yang bernama sama dengan situsnya.
    assert.equal(namaPenerbit({ ...KOSONG, siteName: "Lentera" }), "Lentera");
    assert.equal(
      namaPenerbit({ ...KOSONG, siteName: "Lentera", organizationName: "PT Lentera" }),
      "PT Lentera"
    );
  });

  test("tagline jatuh ke katalog PO, bukan ke string kosong", () => {
    assert.equal(taglineSitus({ ...KOSONG, tagline: "Kabar Kalteng" }, "id"), "Kabar Kalteng");
    assert.ok(taglineSitus(KOSONG, "id").length > 0);
  });

  test("baris hak cipta MENGGANTI baris rakitan, tidak menggabunginya", () => {
    // Redaksi yang menulis "© 2019–2026 PT Lentera Kalteng" memaksudkan kata
    // itu; sebuah gabungan akan mencetak tahunnya dua kali dan namanya dua kali,
    // dan tidak ada cara menulis notice yang menghindarinya.
    assert.equal(
      barisCopyright({ ...KOSONG, copyrightNotice: "© 2019–2026 PT Lentera" }, "id", 2026),
      "© 2019–2026 PT Lentera"
    );

    const rakitan = barisCopyright({ ...KOSONG, siteName: "Lentera" }, "id", 2026);
    assert.ok(rakitan.includes("2026"));
    assert.ok(rakitan.includes("Lentera"));
  });

  test("blok kontak hanya ada bila ada isinya", () => {
    assert.equal(adaKontak(KOSONG), false);
    assert.equal(adaKontak({ ...KOSONG, contactEmail: "a@b.test" }), true);
    assert.equal(adaKontak({ ...KOSONG, editorialAddress: "Jalan 1" }), true);
    assert.equal(adaKontak({ ...KOSONG, whatsappNumber: "+62 812" }), true);
  });
});

describe("nomor telepon menjadi tautan", () => {
  test("wa.me hanya menerima digit", () => {
    // Editor menulis "+62 812-3456-7890" karena begitulah bentuk nomor telepon;
    // yang menyesuaikan adalah kode, bukan labelnya di layar admin.
    assert.equal(tautanWhatsapp("+62 812-3456-7890"), "https://wa.me/6281234567890");
    assert.equal(tautanWhatsapp("0812 3456 7890"), "https://wa.me/081234567890");
  });

  test("nomor tanpa satu pun digit tidak menghasilkan tautan", () => {
    // `https://wa.me/` membuka halaman depan WhatsApp — kontak yang RUSAK,
    // bukan kontak yang tidak ada.
    assert.equal(tautanWhatsapp("-"), null);
    assert.equal(tautanWhatsapp(""), null);
    assert.equal(tautanWhatsapp(null), null);
  });

  test("tel: mempertahankan awalan + tetapi membuang spasi", () => {
    assert.equal(tautanTelepon("+62 536 123456"), "tel:+62536123456");
    assert.equal(tautanTelepon("(0536) 123-456"), "tel:0536123456");
    assert.equal(tautanTelepon(null), null);
  });
});
