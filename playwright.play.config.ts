import { defineConfig, devices } from "@playwright/test";

/**
 * Classroom quiz browser tests: a teacher's screen and students' phones
 * playing through the relay in Cloudflare's local runtime. Separate from the
 * main suite because it needs the relay's dependencies:
 *
 *   npm --prefix relay ci && npm run build && npm run e2e:play
 */
const executablePath = process.env.CHROMIUM_PATH;

export default defineConfig({
  testDir: "./e2e-play",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...(executablePath ? { launchOptions: { executablePath } } : {}) } }],
  webServer: [
    {
      command: "npm run serve:static",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm --prefix relay run dev",
      url: "http://127.0.0.1:8787/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { WRANGLER_SEND_METRICS: "false" },
    },
  ],
});
