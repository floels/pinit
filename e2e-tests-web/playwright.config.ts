import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 15000,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    // retries stay 0 — retain traces on the failed attempt itself (not only on retry).
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "pnpm dev",
    cwd: path.resolve(__dirname, "../web"),
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
