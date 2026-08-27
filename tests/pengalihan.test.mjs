/**
 * Pengalihan yang dijawab origin ini sendiri — dan tiga aturan atas petanya.
 *
 * ## Kenapa berkas ini ada
 *
 * Sampai ADR-0047 repo ini tidak bisa menjawab satu pun pengalihan. Bukan
 * "belum dikonfigurasi": tidak ada kodenya. `awcms` mengukurnya alih-alih
 * menduganya — ADR-0114-nya memutar-ulang **67 aturan terhadap server hasil
 * build repo ini dan mendapat 404 pada setiap satunya, nol header `Location`**.
 *
 * ## Dua hal yang diuji, dan keduanya perlu
 *
 * Sebagian besar berkas ini menguji PETA, bukan server: rantai, putaran, dan
 * bentuk non-kanonik semuanya menghasilkan kegagalan yang tidak berbunyi di
 * mana pun. Sebuah peta yang salah tetap menjawab 301 dengan gembira.
 *
 * Sisanya menguji SERVER-nya, karena "petanya benar" dan "penyaji benar-benar
 * membacanya" adalah dua klaim berbeda — dan yang kedua persis yang selama ini
 * tidak benar.
 */
import { describe, expect, test } from "bun:test";

import {
  PENGALIHAN,
  kunciPengalihan,
  targetPengalihan
} from "../src/config/pengalihan.mjs";
import { buatServer, jawabPengalihan } from "../server/penyaji.mjs";

/** Respons tiruan yang cukup untuk `jawabPengalihan`. */
function resTiruan() {
  const header = new Map();

  return {
    statusCode: 200,
    selesai: false,
    setHeader(nama, nilai) {
      header.set(nama.toLowerCase(), nilai);
    },
    removeHeader(nama) {
      header.delete(nama.toLowerCase());
    },
    getHeader(nama) {
      return header.get(nama.toLowerCase());
    },
    end() {
      this.selesai = true;
    }
  };
}

/** Peta contoh — bentuk yang akan diisi sebuah SITUS, bukan template ini. */
const PETA_SITUS = Object.freeze({
  "/panduan/izin-lama/": "/layanan/izin-usaha/",
  "/en/panduan/old-permit/": "/en/layanan/business-permit/"
});

describe("peta template ini sendiri", () => {
  test("KOSONG, dan itu keputusan", () => {
    // Sebuah template tidak punya sejarah URL, jadi tidak punya apa pun untuk
    // dialihkan. Contoh yang ditinggalkan di sini akan tersalin ke setiap situs
    // turunan sebagai pengalihan HIDUP menuju halaman yang tidak pernah ada.
    expect(Object.keys(PENGALIHAN)).toHaveLength(0);
  });

  test("beku, sehingga tidak ada yang bisa menambah aturan saat runtime", () => {
    expect(Object.isFrozen(PENGALIHAN)).toBe(true);
  });
});

describe("aturan atas peta — semuanya gagal tanpa berbunyi", () => {
  /**
   * Ketiga pemeriksaan ini dijalankan atas peta MANA PUN, dan dipanggil di
   * bawah baik untuk peta template (kosong) maupun untuk peta contoh. Sebuah
   * situs turunan menjalankan berkas tes yang sama atas petanya sendiri.
   */
  function periksaPeta(peta) {
    const kunci = Object.keys(peta);
    const pelanggaran = [];

    for (const [dari, ke] of Object.entries(peta)) {
      // 1. Rantai — target yang juga menjadi kunci berarti dua lompatan.
      if (kunci.includes(kunciPengalihan(ke))) {
        pelanggaran.push(`rantai: ${dari} -> ${ke}, dan ${ke} juga dialihkan`);
      }

      // 2. Putaran langsung.
      if (kunciPengalihan(ke) === kunciPengalihan(dari)) {
        pelanggaran.push(`putaran: ${dari} menunjuk dirinya sendiri`);
      }

      // 3. Bentuk kanonik — build ini memancarkan `{tab}/{slug}/index.html`.
      if (!ke.startsWith("/") || !ke.endsWith("/")) {
        if (!/^https?:\/\//.test(ke)) {
          pelanggaran.push(`bentuk non-kanonik: ${dari} -> ${ke}`);
        }
      }

      // 4. Kunci harus sudah dalam bentuk kanoniknya, atau ia tidak akan
      //    pernah cocok dengan apa yang dihitung `kunciPengalihan`.
      if (kunciPengalihan(dari) !== dari) {
        pelanggaran.push(
          `kunci non-kanonik: "${dari}" tidak akan pernah cocok; tulis "${kunciPengalihan(dari)}"`
        );
      }
    }

    return pelanggaran;
  }

  test("peta template ini lolos", () => {
    expect(periksaPeta(PENGALIHAN)).toEqual([]);
  });

  test("peta contoh yang benar lolos", () => {
    expect(periksaPeta(PETA_SITUS)).toEqual([]);
  });

  test("rantai TERTANGKAP — PRD §9.2 melarang lebih dari satu lompatan", () => {
    // Bukan estetika: mesin pencari membagi ekuitas tiap lompatan, dan sebagian
    // berhenti mengikuti setelah beberapa.
    const rantai = { "/a/": "/b/", "/b/": "/c/" };
    expect(periksaPeta(rantai).join(" ")).toMatch(/rantai/);
  });

  test("putaran TERTANGKAP — tab browser yang menggantung", () => {
    expect(periksaPeta({ "/a/": "/a/" }).join(" ")).toMatch(/putaran/);
  });

  test("target tanpa garis miring penutup TERTANGKAP", () => {
    // Menukar satu 404 dengan satu halaman yang canonical-nya menyangkal URL
    // tempat pembaca mendarat.
    expect(periksaPeta({ "/a/": "/layanan/izin" }).join(" ")).toMatch(/non-kanonik/);
  });

  test("kunci non-kanonik TERTANGKAP sebelum ia gagal diam-diam", () => {
    // Aturan yang tidak akan pernah cocok adalah aturan yang penulisnya kira
    // bekerja.
    expect(periksaPeta({ "/a": "/b/" }).join(" ")).toMatch(/kunci non-kanonik/);
  });
});

describe("kunciPengalihan", () => {
  test("query dan fragmen tidak ikut dicocokkan", () => {
    expect(kunciPengalihan("/a/b/?utm_source=x#bagian")).toBe("/a/b/");
  });

  test("garis miring penutup dipaksakan di kedua arah", () => {
    expect(kunciPengalihan("/a/b")).toBe("/a/b/");
    expect(kunciPengalihan("/a/b/")).toBe("/a/b/");
  });

  test("`..` dinormalkan SEBELUM pencocokan", () => {
    // Tanpa ini, `/panduan/../panduan/izin-lama/` melewati peta sepenuhnya —
    // sebuah pengalihan yang bisa dilewati siapa pun yang mengetahui bentuknya.
    expect(kunciPengalihan("/panduan/../panduan/izin-lama/")).toBe(
      "/panduan/izin-lama/"
    );
  });

  test("garis miring berulang diruntuhkan", () => {
    expect(kunciPengalihan("//a///b//")).toBe("/a/b/");
  });

  test("akar tetap akar", () => {
    for (const jalur of ["/", "", "//", "/./"]) {
      expect(kunciPengalihan(jalur)).toBe("/");
    }
  });

  test("jalur yang tidak bisa di-decode tidak melempar", () => {
    expect(() => kunciPengalihan("/%E0%A4%A")).not.toThrow();
  });
});

describe("targetPengalihan", () => {
  test("cocok pada bentuk kanonik maupun tanpa garis miring", () => {
    expect(targetPengalihan("/panduan/izin-lama/", PETA_SITUS)).toBe(
      "/layanan/izin-usaha/"
    );
    expect(targetPengalihan("/panduan/izin-lama", PETA_SITUS)).toBe(
      "/layanan/izin-usaha/"
    );
  });

  test("jalur yang tidak dipetakan mengembalikan undefined, bukan akar", () => {
    // Mengembalikan `/` akan mengalihkan setiap 404 ke beranda, yang menghapus
    // sinyal 404 dan membuat setiap tautan mati terlihat seperti tautan hidup.
    expect(targetPengalihan("/tidak-ada/", PETA_SITUS)).toBeUndefined();
  });
});

describe("penyaji benar-benar menjawabnya", () => {
  test("jawabPengalihan menulis 301, Location, dan membuang Content-Type", () => {
    const res = resTiruan();
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const ditangani = jawabPengalihan(
      { url: "/panduan/izin-lama/" },
      res,
      PETA_SITUS
    );

    expect(ditangani).toBe(true);
    expect(res.statusCode).toBe(301);
    expect(res.getHeader("Location")).toBe("/layanan/izin-usaha/");
    // Sebuah 301 tanpa badan yang mengaku `text/html` menjanjikan sesuatu yang
    // tidak ada.
    expect(res.getHeader("Content-Type")).toBeUndefined();
    expect(res.selesai).toBe(true);
  });

  test("301 mendahului handler aplikasi — handler TIDAK pernah dipanggil", async () => {
    // Inti seluruh isu ini. Yang selama ini salah bukan logikanya melainkan
    // bahwa tidak ada yang memanggilnya: `awcms` ADR-0114 memutar-ulang 67
    // aturan terhadap server ini dan mendapat 404 pada setiap satunya.
    let handlerDipanggil = false;

    const server = buatServer(
      (req, res) => {
        handlerDipanggil = true;
        res.statusCode = 404;
        res.end("tidak ditemukan");
      },
      { peta: PETA_SITUS }
    );

    await new Promise((selesai) => server.listen(0, "127.0.0.1", selesai));
    const port = server.address().port;

    try {
      const respons = await fetch(`http://127.0.0.1:${port}/panduan/izin-lama/`, {
        redirect: "manual"
      });

      expect(respons.status).toBe(301);
      expect(respons.headers.get("location")).toBe("/layanan/izin-usaha/");
      expect(handlerDipanggil).toBe(false);
    } finally {
      server.close();
    }
  });

  test("jalur tanpa aturan tetap sampai ke handler aplikasi", async () => {
    // Arah kedua, dan ia menahan biaya yang pertama: penyaji yang mengalihkan
    // tanpa aturan adalah penyaji yang mengalihkan segalanya.
    let handlerDipanggil = false;

    const server = buatServer(
      (req, res) => {
        handlerDipanggil = true;
        res.statusCode = 200;
        res.end("dari handler");
      },
      { peta: PETA_SITUS }
    );

    await new Promise((selesai) => server.listen(0, "127.0.0.1", selesai));
    const port = server.address().port;

    try {
      const respons = await fetch(`http://127.0.0.1:${port}/masih-hidup/`, {
        redirect: "manual"
      });

      expect(respons.status).toBe(200);
      expect(handlerDipanggil).toBe(true);
    } finally {
      server.close();
    }
  });

  test("query dibawa serta ke Location", async () => {
    // Pembaca yang tiba dari kampanye tidak boleh kehilangan atribusinya karena
    // halamannya pindah, dan tautan berparameter yang kehilangan parameternya
    // mendarat di halaman yang benar dengan keadaan yang salah.
    const server = buatServer((req, res) => res.end(), { peta: PETA_SITUS });

    await new Promise((selesai) => server.listen(0, "127.0.0.1", selesai));
    const port = server.address().port;

    try {
      const respons = await fetch(
        `http://127.0.0.1:${port}/panduan/izin-lama/?utm_source=buletin`,
        { redirect: "manual" }
      );

      expect(respons.headers.get("location")).toBe(
        "/layanan/izin-usaha/?utm_source=buletin"
      );
    } finally {
      server.close();
    }
  });

  test("header keamanan tetap terpasang pada 301", async () => {
    // Sebuah pengalihan tetap respons, dan respons tanpa header keamanan adalah
    // lubang yang hanya terlihat pada jalur yang jarang diuji orang.
    const server = buatServer((req, res) => res.end(), { peta: PETA_SITUS });

    await new Promise((selesai) => server.listen(0, "127.0.0.1", selesai));
    const port = server.address().port;

    try {
      const respons = await fetch(`http://127.0.0.1:${port}/panduan/izin-lama/`, {
        redirect: "manual"
      });

      expect(respons.headers.get("x-content-type-options")).toBe("nosniff");
      expect(respons.headers.get("content-security-policy")).toBeTruthy();
    } finally {
      server.close();
    }
  });
});
