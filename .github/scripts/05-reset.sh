#!/usr/bin/env bash
#
# 05-reset.sh — Fast database reset & reinstall (~30-60 seconds)
#
# Drops the database, flushes Redis + OpenSearch, re-runs the Pimcore installer.
# No composer steps, no image pulls — containers must already be running.
#
# Usage:
#   ./.github/scripts/05-reset.sh
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"
PROJECT_PATH="${REPO_ROOT}/../test-project"
ENV_LOCAL="${SCRIPTS_DIR}/.env.local"

if [[ ! -d "$PROJECT_PATH" ]]; then
    echo "ERROR: Project directory does not exist at ${PROJECT_PATH}"
    echo "  Run 00-localsetup.sh first."
    exit 1
fi

source "${FILES_DIR}/.env"
[[ -f "$ENV_LOCAL" ]] && source "$ENV_LOCAL"

export NGINX_PORT OPENSEARCH_DASHBOARDS_PORT MAILPIT_PORT MERCURE_PORT DB_PORT
export PHP_IMAGE PHP_SUPERVISORD_IMAGE
export MYSQL_ROOT_PASSWORD MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD
export OPENSEARCH_INITIAL_ADMIN_PASSWORD
export DOCKER_UID="${DOCKER_UID:-$(id -u)}"
export DOCKER_GID="${DOCKER_GID:-$(id -g)}"

cd "$PROJECT_PATH"

echo ">>> Fast reset starting..."
START_TIME=$(date +%s)

# Ensure containers are running
if ! docker compose ps --status running php | grep -q php; then
    echo "    Containers not running, starting..."
    docker compose up -d
    sleep 5
fi

# 1. Drop and recreate database
echo "    [1/5] Dropping and recreating database..."
docker compose exec -T db mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
    DROP DATABASE IF EXISTS ${MYSQL_DATABASE};
    CREATE DATABASE ${MYSQL_DATABASE}
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_520_ci;
    GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
"

# 2. Flush Redis cache
echo "    [2/5] Flushing Redis cache..."
docker compose exec -T redis redis-cli FLUSHALL 2>/dev/null || true

# 3. Clear OpenSearch indexes
echo "    [3/5] Clearing OpenSearch indexes..."
docker compose exec -T php bash -c "
    curl -sk -X DELETE 'https://opensearch:9200/_all' \
        -u admin:${OPENSEARCH_INITIAL_ADMIN_PASSWORD} 2>/dev/null || true
"

# 4. Re-run pimcore-install
echo "    [4/5] Running Pimcore installer..."
docker compose exec -T \
    -e PIMCORE_ENCRYPTION_SECRET="${PIMCORE_ENCRYPTION_SECRET:-}" \
    -e PIMCORE_INSTANCE_IDENTIFIER="${PIMCORE_INSTANCE_IDENTIFIER:-}" \
    -e PIMCORE_PRODUCT_KEY="${PIMCORE_PRODUCT_KEY:-}" \
    -e PHP_MEMORY_LIMIT=512M \
    -- php vendor/bin/pimcore-install \
    --install-profile='App\Installer\ApiTestProfile' \
    -n

# 5. Post-install
echo "    [5/5] Post-install tasks..."
docker compose exec -T php bin/console cache:clear --no-warmup
docker compose exec -T php bin/console cache:warmup
docker compose exec -T php bin/console doctrine:migrations:migrate --no-interaction 2>/dev/null || true
docker compose exec -T php bin/console generic-data-index:update:index -r 2>/dev/null || true

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo ">>> Reset complete in ${ELAPSED} seconds."
echo "    Pimcore UI:  http://localhost:${NGINX_PORT}/pimcore-studio"
echo "    API docs:    http://localhost:${NGINX_PORT}/pimcore-studio/api/docs"
echo "    Credentials: ${PIMCORE_ADMIN_USER} / ${PIMCORE_ADMIN_PASSWORD}"
