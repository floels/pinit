import { test as setup } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const BACKEND_URL = "http://localhost:8000";
const COMPOSE_FILE = path.resolve(__dirname, "docker-compose.e2e.yml");

async function waitForBackend(maxAttempts = 30, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/`);
      if (res.status >= 100) return;
    } catch {
      // server not reachable yet
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Backend did not become reachable at ${BACKEND_URL} within ${(maxAttempts * delayMs) / 1000}s`);
}

function compose(command: string) {
  execSync(`docker compose -f ${COMPOSE_FILE} ${command}`, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
}

setup("start E2E services and seed database", async () => {
  // Starting Docker services, running migrations and seeding takes longer
  // than the default per-test timeout.
  setup.setTimeout(120_000);

  compose("up -d --build");

  await waitForBackend();

  compose("exec -T backend_e2e python manage.py migrate");
  compose("exec -T backend_e2e python manage.py set_up_moto");
  compose("exec -T backend_e2e python manage.py index_all_pins");
  compose("exec -T backend_e2e python manage.py seed_database_e2e");
});
