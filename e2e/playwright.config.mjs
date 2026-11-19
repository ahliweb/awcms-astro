import { defineConfig, devices } from "@playwright/test";

/**
 * Named `*.axe.mjs`, not `*.test.mjs` or `*.spec.mjs`: `bun test` picks up both
 * of those recursively and would try to run Playwright specs under its own
 * runner. `e2e/jalankan.mjs` starts everything this config needs.
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.axe.mjs",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  outputDir: "../.playwright-hasil",
  use: {
    baseURL: process.env.E2E_BASE_URL,
    headless: true,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
