#!/usr/bin/env bash
#
# 02-install-pimcore.sh — composer require enterprise bundles + run installer
#
# Usage:
#   ./02-install-pimcore.sh <TOKEN> <PLATFORM_VERSION> [--ci]
#
#   TOKEN            Enterprise packagist token
#   PLATFORM_VERSION e.g. 2026.1 (stable) or 2026.x (dev branch)
#   --ci             CI mode: use github-actions repo URL
#
set -euo pipefail

TOKEN="${1:-}"
PLATFORM_VERSION="${2:-2026.1}"
CI_MODE=false
for arg in "$@"; do [[ "$arg" == "--ci" ]] && CI_MODE=true; done

if [[ -z "$TOKEN" ]]; then
    echo "ERROR: TOKEN is required as first argument."
    exit 1
fi

# ─── Paths ───────────────────────────────────────────────────────────────────
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"
PROJECT_PATH="${REPO_ROOT}/../test-project"
ENV_LOCAL="${SCRIPTS_DIR}/.env.local"

source "${FILES_DIR}/.env"
[[ -f "$ENV_LOCAL" ]] && source "$ENV_LOCAL"

# ─── Version constraints ─────────────────────────────────────────────────────
if [[ "$PLATFORM_VERSION" == *.x ]]; then
    PLATFORM_CONSTRAINT="${PLATFORM_VERSION}-dev"
else
    PLATFORM_CONSTRAINT="^${PLATFORM_VERSION}"
fi

if [[ "$CI_MODE" == true ]]; then
    EFFECTIVE_REPO_URL="${PIMCORE_REPO_URL_CI}"
else
    EFFECTIVE_REPO_URL="${PIMCORE_REPO_URL}"
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Step 2: Install Pimcore                                    ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Platform constraint: ${PLATFORM_CONSTRAINT}"
echo "║  Repo URL:            ${EFFECTIVE_REPO_URL}"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_PATH"

export NGINX_PORT OPENSEARCH_DASHBOARDS_PORT MAILPIT_PORT MERCURE_PORT DB_PORT
export PHP_IMAGE PHP_SUPERVISORD_IMAGE
export MYSQL_ROOT_PASSWORD MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD
export OPENSEARCH_INITIAL_ADMIN_PASSWORD
export DOCKER_UID="${DOCKER_UID:-$(id -u)}"
export DOCKER_GID="${DOCKER_GID:-$(id -g)}"

# ─── Configure composer ───────────────────────────────────────────────────────
echo ">>> Configuring composer..."
docker compose exec -T -- php composer config --auth http-basic.repo.pimcore.com token "$TOKEN"
docker compose exec -T -- php composer config repositories.enterprise composer "$EFFECTIVE_REPO_URL"
docker compose exec -T -- php composer config minimum-stability dev
docker compose exec -T -- php composer config prefer-stable true

# ─── Require enterprise bundles ───────────────────────────────────────────────
echo ">>> Installing enterprise bundles via composer..."
docker compose exec -T -- php composer require -W --no-interaction \
    pimcore/platform-version:${PLATFORM_CONSTRAINT} \
    pimcore/pimcore:${PLATFORM_CONSTRAINT} \
    pimcore/quill-bundle \
    pimcore/tinymce-bundle \
    pimcore/studio-backend-bundle:${PLATFORM_CONSTRAINT} \
    pimcore/studio-ui-bundle:${PLATFORM_CONSTRAINT} \
    pimcore/studio-dashboards-bundle:${PLATFORM_CONSTRAINT} \
    pimcore/asset-metadata-class-definitions \
    pimcore/backend-power-tools-bundle \
    pimcore/copilot-bundle \
    pimcore/copilot-showcase-bundle \
    pimcore/customer-management-framework-bundle \
    pimcore/data-hub \
    pimcore/data-hub-file-export \
    pimcore/data-hub-productsup \
    pimcore/data-hub-simple-rest \
    pimcore/data-hub-webhooks \
    pimcore/data-importer \
    pimcore/data-quality-management-bundle:${PLATFORM_CONSTRAINT} \
    pimcore/direct-edit \
    pimcore/ecommerce-framework-bundle \
    pimcore/generic-data-index-bundle \
    pimcore/headless-documents \
    pimcore/object-merger \
    pimcore/openid-connect \
    pimcore/payment-provider-paypal-smart-payment-button \
    pimcore/personalization-bundle \
    pimcore/portal-engine \
    pimcore/statistics-explorer \
    pimcore/translations-provider-interfaces \
    pimcore/web-to-print-bundle \
    pimcore/workflow-automation-integration-bundle \
    pimcore/workflow-designer \
    gotenberg/gotenberg-php:^2.2 \
    php-http/guzzle7-adapter:^0.1.1 \
    php-http/httplug-bundle:^1 \
    phpseclib/phpseclib:^3.0

echo ">>> Running deferred composer scripts..."
docker compose exec -T -- php composer run-script post-install-cmd --no-interaction 2>/dev/null || true

# ─── Run pimcore-install ──────────────────────────────────────────────────────
echo ">>> Running Pimcore installer..."
docker compose exec -T \
    -e PIMCORE_ENCRYPTION_SECRET="${PIMCORE_ENCRYPTION_SECRET:-}" \
    -e PIMCORE_INSTANCE_IDENTIFIER="${PIMCORE_INSTANCE_IDENTIFIER:-}" \
    -e PIMCORE_PRODUCT_KEY="${PIMCORE_PRODUCT_KEY:-}" \
    -e PHP_MEMORY_LIMIT=512M \
    -- php vendor/bin/pimcore-install \
    --install-profile='App\Installer\ApiTestProfile' \
    -n

# ─── Post-install ─────────────────────────────────────────────────────────────
echo ">>> Post-install tasks..."
docker compose exec -T php bin/console cache:clear
docker compose exec -T php bin/console doctrine:migrations:migrate --no-interaction 2>/dev/null || true
docker compose exec -T php bin/console generic-data-index:update:index -r 2>/dev/null || true

echo "    [sudo] Setting ownership to www-data so the PHP container can write files"
sudo chown -R www-data .

echo ""
echo ">>> Installation complete."
echo "    Pimcore UI:  http://localhost:${NGINX_PORT}/pimcore-studio"
echo "    API docs:    http://localhost:${NGINX_PORT}/pimcore-studio/api/docs"
echo "    Credentials: ${PIMCORE_ADMIN_USER} / ${PIMCORE_ADMIN_PASSWORD}"
