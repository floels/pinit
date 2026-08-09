import { test as setup } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const SCRIPT = path.resolve(REPO_ROOT, "scripts/e2e-backend-up.sh");

setup("start E2E services and seed database", async () => {
  // Starting Docker services, running migrations and seeding takes longer
  // than the default per-test timeout.
  setup.setTimeout(120_000);

  // The same script backs the mobile Detox suite, so both suites share
  // one definition of the stack and the seed data.
  execSync(SCRIPT, { cwd: REPO_ROOT, stdio: "inherit" });
});
