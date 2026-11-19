/**
 * Runs the browser accessibility gate end to end (ADR-0056):
 * stand-in awcms -> production build -> the real server -> Playwright + axe.
 *
 * Every port is taken from the OS, and only the processes started HERE are
 * stopped: the host is shared, so a pattern kill would be someone else's run.
 */
import { spawn } from "node:child_process";
import { mulaiAwcmsTiruan, TOKEN_UJI } from "./awcms-tiruan.mjs";

const awcms = mulaiAwcmsTiruan(0);
const asal = `http://127.0.0.1:${awcms.port}`;

// A free port for the site, found by binding and releasing.
const probe = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response("") });
const portSitus = probe.port;
probe.stop(true);
const urlSitus = `http://127.0.0.1:${portSitus}`;

const env = {
  ...process.env,
  SITE_URL: urlSitus,
  SITE_NAME: "Situs Uji",
  SITE_NEWSLETTER: "true",
  AWCMS_API_URL: asal,
  AWCMS_API_TOKEN: TOKEN_UJI,
  NODE_ENV: "production"
};

function jalankan(perintah, argumen, tambahan = {}) {
  return new Promise((selesai) => {
    const anak = spawn(perintah, argumen, { env: { ...env, ...tambahan }, stdio: "inherit" });
    anak.on("exit", (kode) => selesai(kode ?? 1));
  });
}

let situs;
let kode = 1;

try {
  kode = await jalankan("bun", ["run", "build"]);
  if (kode !== 0) throw new Error(`build gagal (kode ${kode})`);

  situs = spawn("bun", ["dist/server/penyaji.mjs"], {
    env: { ...env, PORT: String(portSitus), HOST: "127.0.0.1" },
    stdio: "inherit"
  });

  // Wait for the server rather than sleep a fixed time.
  const batas = Date.now() + 30_000;
  for (;;) {
    try {
      const jawab = await fetch(urlSitus);
      if (jawab.ok) break;
    } catch {
      /* not listening yet */
    }
    if (Date.now() > batas) throw new Error("penyaji tidak siap dalam 30 detik");
    await Bun.sleep(250);
  }

  kode = await jalankan("bunx", ["--bun", "playwright", "test", "--config", "e2e/playwright.config.mjs"], {
    E2E_BASE_URL: urlSitus
  });
} catch (galat) {
  console.error(galat instanceof Error ? galat.message : galat);
  kode = kode || 1;
} finally {
  situs?.kill();
  awcms.stop(true);
}

process.exit(kode);
