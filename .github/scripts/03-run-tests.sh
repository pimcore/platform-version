#!/usr/bin/env bash
#
# 03-run-tests.sh — Run Playwright API tests against the local Pimcore instance
#
# Usage (local):
#   ./.github/scripts/03-run-tests.sh
#
# Expects studio-tests to be checked out at ../studio-tests (relative to repo root).
# Requires Node.js and npm to be installed.
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"

# Source config for port/credentials
source "${FILES_DIR}/.env"
[[ -f "${SCRIPTS_DIR}/.env.local" ]] && source "${SCRIPTS_DIR}/.env.local"

TESTS_DIR="${REPO_ROOT}/tests"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Step 3: Run Playwright API Tests                           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Tests:    ${TESTS_DIR}"
echo "║  Base URL: http://localhost:${NGINX_PORT:-8088}"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Install dependencies if needed ──────────────────────────────────────────
if [[ ! -d "${TESTS_DIR}/node_modules" ]]; then
    echo ">>> Installing npm dependencies..."
    (cd "$TESTS_DIR" && npm ci)
    echo ""
fi

# ─── Run tests ────────────────────────────────────────────────────────────────
echo ">>> Running Playwright tests..."

export PIMCORE_BASE_URL="http://localhost:${NGINX_PORT:-8088}"
export PIMCORE_USERNAME="${PIMCORE_ADMIN_USER:-admin}"
export PIMCORE_PASSWORD="${PIMCORE_ADMIN_PASSWORD:-admin}"

cd "$TESTS_DIR"
npx playwright test

echo ""
echo ">>> Tests complete."
echo "    Report: ${TESTS_DIR}/playwright-report/index.html"
