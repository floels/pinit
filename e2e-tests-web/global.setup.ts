import { test as setup } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const SCRIPT = path.resolve(REPO_ROOT, "scripts/e2e-backend-up.sh");

setup("start E2E services and seed database", async () => {
  // Cold image pulls (Elasticsearch especially) plus migrate/seed exceed the
  // default per-test timeout; CI runners need more headroom than a warm laptop.
  setup.setTimeout(900_000);

  // The same script backs the mobile Detox suite, so both suites share
  // one definition of the stack and the seed data.
  execSync(SCRIPT, { cwd: REPO_ROOT, stdio: "inherit" });
});
