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

# ─── Locate studio-tests directory ───────────────────────────────────────────
STUDIO_TESTS_DIR="${REPO_ROOT}/../studio-tests"

if [[ ! -d "$STUDIO_TESTS_DIR" ]]; then
    echo "ERROR: studio-tests directory not found at ${STUDIO_TESTS_DIR}"
    echo ""
    echo "  Clone it with:"
    echo "    git clone git@github.com:pimcore/studio-tests.git ${STUDIO_TESTS_DIR}"
    echo ""
    echo "  Then install dependencies:"
    echo "    cd ${STUDIO_TESTS_DIR} && npm ci && npx playwright install chromium"
    exit 1
fi

STUDIO_TESTS_DIR="$(cd "$STUDIO_TESTS_DIR" && pwd)"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Step 3: Run Playwright API Tests                           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Tests:    ${STUDIO_TESTS_DIR}"
echo "║  Base URL: http://localhost:${NGINX_PORT:-8088}"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Check branch alignment ──────────────────────────────────────────────────
PLATFORM_VERSION="${PLATFORM_VERSION:-2026.1}"
TESTS_BRANCH=$(git -C "$STUDIO_TESTS_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo ">>> studio-tests branch: ${TESTS_BRANCH}"
echo "    platform version:    ${PLATFORM_VERSION}"

if [[ "$TESTS_BRANCH" != "$PLATFORM_VERSION" && "$TESTS_BRANCH" != "${PLATFORM_VERSION%.*}.x" && "$TESTS_BRANCH" != "main" ]]; then
    echo "    WARNING: Branch mismatch — consider switching studio-tests to branch '${PLATFORM_VERSION}' or 'main'"
fi
echo ""

# ─── Install dependencies if needed ──────────────────────────────────────────
if [[ ! -d "${STUDIO_TESTS_DIR}/node_modules" ]]; then
    echo ">>> Installing npm dependencies..."
    (cd "$STUDIO_TESTS_DIR" && npm ci)
    echo ""
fi

# ─── Run tests ────────────────────────────────────────────────────────────────
echo ">>> Running Playwright tests..."

export PIMCORE_BASE_URL="http://localhost:${NGINX_PORT:-8088}"
export PIMCORE_USERNAME="${PIMCORE_ADMIN_USER:-admin}"
export PIMCORE_PASSWORD="${PIMCORE_ADMIN_PASSWORD:-admin}"

cd "$STUDIO_TESTS_DIR"
npx playwright test

echo ""
echo ">>> Tests complete."
echo "    Report: ${STUDIO_TESTS_DIR}/playwright-report/index.html"
