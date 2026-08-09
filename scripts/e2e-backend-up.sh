#!/usr/bin/env bash
#
# Starts the E2E backend stack, then migrates and seeds the database.
# Both E2E suites use this script: e2e-tests-web (Playwright) and mobile (Detox).
#
# Usage: scripts/e2e-backend-up.sh
#
# Docker must run on the host before you call this script.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.e2e.yml"
BACKEND_URL="http://localhost:8000"
MAX_ATTEMPTS=30
DELAY_SECONDS=2

compose() {
  docker compose -f "${COMPOSE_FILE}" "$@"
}

# Fails early with a clear message when another stack already holds port 8000.
# docker-compose.local.yml binds the same port.
check_port_free() {
  if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1; then
    if compose ps --status running --services 2>/dev/null | grep -q backend_e2e; then
      return 0
    fi
    echo "Error: port 8000 is already in use by another process." >&2
    echo "Stop the local stack first: docker compose -f docker-compose.local.yml down" >&2
    exit 1
  fi
}

wait_for_backend() {
  local attempt=1
  while [ "${attempt}" -le "${MAX_ATTEMPTS}" ]; do
    if curl -sf -o /dev/null "${BACKEND_URL}/admin/" 2>/dev/null; then
      return 0
    fi
    sleep "${DELAY_SECONDS}"
    attempt=$((attempt + 1))
  done
  echo "Error: the backend did not answer at ${BACKEND_URL} within $((MAX_ATTEMPTS * DELAY_SECONDS))s." >&2
  compose logs --tail 50 backend_e2e >&2 || true
  exit 1
}

check_port_free

echo "Starting E2E services..."
compose up -d --build

echo "Waiting for the backend..."
wait_for_backend

echo "Migrating and seeding..."
compose exec -T backend_e2e python manage.py migrate
compose exec -T backend_e2e python manage.py set_up_moto
compose exec -T backend_e2e python manage.py index_all_pins
compose exec -T backend_e2e python manage.py seed_database_e2e

echo "E2E backend ready at ${BACKEND_URL}."
