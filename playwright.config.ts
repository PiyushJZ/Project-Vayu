import { defineConfig, devices } from "@playwright/test";

/** Separate ports and database from `pnpm dev`, so a test run never touches development data. */
const APP_PORT = 8787;
const MOCK_PORT = 8788;

export default defineConfig({
  testDir: "./e2e",
  // Every test uses the same Worker, database and stub model, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: [
    {
      name: "stub model",
      command: "node e2e/mock-openrouter.mjs",
      env: { MOCK_OPENROUTER_PORT: String(MOCK_PORT) },
      url: `http://127.0.0.1:${MOCK_PORT}/health`,
      reuseExistingServer: !process.env.CI,
    },
    {
      // The Worker exactly as deployed: it serves the built web app and the API from one origin.
      // Build the web app first (`pnpm test:e2e` does).
      name: "worker",
      cwd: "apps/server",
      command: `rm -rf .wrangler/e2e && pnpm exec wrangler dev --env e2e --port ${APP_PORT} --persist-to .wrangler/e2e --env-file ../../e2e/worker.env`,
      url: `http://localhost:${APP_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
