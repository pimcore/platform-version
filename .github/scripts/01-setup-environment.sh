#!/usr/bin/env bash
#
# 01-setup-environment.sh — Create project, copy files, start containers
#
# Usage:
#   ./01-setup-environment.sh <TOKEN> <PLATFORM_VERSION> [--ci]
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

# Source base config
source "${FILES_DIR}/.env"
[[ -f "$ENV_LOCAL" ]] && source "$ENV_LOCAL"

# ─── Version constraints ─────────────────────────────────────────────────────
if [[ "$PLATFORM_VERSION" == *.x ]]; then
    SKELETON_CONSTRAINT="dev-${PLATFORM_VERSION}"
else
    SKELETON_CONSTRAINT="^${PLATFORM_VERSION}"
fi

if [[ "$CI_MODE" == true ]]; then
    EFFECTIVE_REPO_URL="${PIMCORE_REPO_URL_CI}"
else
    EFFECTIVE_REPO_URL="${PIMCORE_REPO_URL}"
fi

export DOCKER_UID="${DOCKER_UID:-$(id -u)}"
export DOCKER_GID="${DOCKER_GID:-$(id -g)}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Step 1: Setup Environment                                  ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Platform:   ${PLATFORM_VERSION} (skeleton: ${SKELETON_CONSTRAINT})"
echo "║  Project:    ${PROJECT_PATH}"
echo "║  Repo URL:   ${EFFECTIVE_REPO_URL}"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Create project ───────────────────────────────────────────────────────────
echo ">>> Creating Pimcore skeleton project..."

if [[ -d "$PROJECT_PATH" ]]; then
    echo "    Removing existing project at ${PROJECT_PATH}..."
    (cd "$PROJECT_PATH" && docker compose down -v --remove-orphans 2>/dev/null) || true
    echo "    [sudo] Removing old project dir..."
    sudo rm -rf "$PROJECT_PATH"
fi

PROJECT_PARENT="$(dirname "$PROJECT_PATH")"
PROJECT_NAME="$(basename "$PROJECT_PATH")"

docker run \
    -u "$(id -u):$(id -g)" --rm \
    -v "${PROJECT_PARENT}:/var/www/html" \
    -e COMPOSER_HOME=/tmp/composer \
    "${PHP_IMAGE}" \
    composer create-project "pimcore/skeleton:${SKELETON_CONSTRAINT}" "$PROJECT_NAME" \
        --no-scripts --no-interaction

# ─── Copy config files ────────────────────────────────────────────────────────
echo ">>> Copying configuration files..."

mkdir -p "${PROJECT_PATH}/src/Installer"
cp "${FILES_DIR}/ApiTestProfile.php" "${PROJECT_PATH}/src/Installer/"

cp "${FILES_DIR}/docker-compose.yaml" "${PROJECT_PATH}/docker-compose.yaml"
if [[ "$CI_MODE" == true ]]; then
    cp "${FILES_DIR}/docker-compose.ci.yaml" "${PROJECT_PATH}/docker-compose.override.yaml"
fi

mkdir -p "${PROJECT_PATH}/.docker"
cp "${FILES_DIR}/nginx.conf"      "${PROJECT_PATH}/.docker/nginx.conf"
cp "${FILES_DIR}/supervisord.conf" "${PROJECT_PATH}/.docker/supervisord.conf"
cp "${FILES_DIR}/messenger.yaml"   "${PROJECT_PATH}/config/packages/messenger.yaml"

# Write project .env.local
cat > "${PROJECT_PATH}/.env.local" <<ENVEOF
APP_ENV=${APP_ENV:-dev}
APP_DEBUG=${APP_DEBUG:-true}
APPLICATION_SECRET=${APPLICATION_SECRET}
APPLICATION_ENCRYPTION_SECRET=${APPLICATION_ENCRYPTION_SECRET}
DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@db:3306/${MYSQL_DATABASE}
PIMCORE_ADMIN_USER=${PIMCORE_ADMIN_USER}
PIMCORE_ADMIN_PASSWORD=${PIMCORE_ADMIN_PASSWORD}
PIMCORE_OPENSEARCH_DSN=opensearch://admin:${OPENSEARCH_INITIAL_ADMIN_PASSWORD}@opensearch:9200?ssl=true&ssl_verify=false
PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX=amqp://guest:guest@rabbitmq:5672/%2f/
MERCURE_JWT_KEY=CHANGE_ME_THIS_IS_MY_SECRET_KEY_THAT_IS_LONG_ENOUGH_FOR_VALIDATION
MERCURE_URL=http://localhost:${NGINX_PORT}/hub
MERCURE_SERVER_URL=http://mercure/.well-known/mercure
REDIS_DSN=redis://redis:6379
GOTENBERG_DSN=http://gotenberg:3000
MAILER_DSN=smtp://mailpit:1025
ES_PREFIX_SIMPLE_REST=it_simple_rest_
OPEN_AI_AUTH_TOKEN=dummy-not-used
HUGGING_FACE_AUTH_TOKEN=dummy-not-used

### pimcore/pimcore ###
PIMCORE_ENCRYPTION_SECRET="${PIMCORE_ENCRYPTION_SECRET:-}"
PIMCORE_INSTANCE_IDENTIFIER="${PIMCORE_INSTANCE_IDENTIFIER:-}"
PIMCORE_PRODUCT_KEY="${PIMCORE_PRODUCT_KEY:-}"
ENVEOF

# ─── Start containers ─────────────────────────────────────────────────────────
echo ">>> Starting containers..."

cd "$PROJECT_PATH"

export NGINX_PORT OPENSEARCH_DASHBOARDS_PORT MAILPIT_PORT MERCURE_PORT DB_PORT
export PHP_IMAGE PHP_SUPERVISORD_IMAGE
export MYSQL_ROOT_PASSWORD MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD
export OPENSEARCH_INITIAL_ADMIN_PASSWORD

echo "    [sudo] Setting ownership to www-data so the PHP container can write files"
sudo chown -R www-data "$PROJECT_PATH"

docker compose down -v --remove-orphans 2>/dev/null || true
docker compose up -d

echo "    Waiting for DB to be healthy..."
for i in $(seq 1 60); do
    docker compose exec -T php php -r "
        new PDO('mysql:host=db;dbname=${MYSQL_DATABASE}', '${MYSQL_USER}', '${MYSQL_PASSWORD}');
        echo 'ok';
    " 2>/dev/null | grep -q ok && break
    [[ $i -eq 60 ]] && { echo "ERROR: DB not ready after 120s"; exit 1; }
    sleep 2
done
echo "    DB is ready."

echo "    Waiting for OpenSearch to be healthy..."
for i in $(seq 1 60); do
    docker compose exec -T php curl -sk https://opensearch:9200 \
        -u "admin:${OPENSEARCH_INITIAL_ADMIN_PASSWORD}" 2>/dev/null | grep -q cluster_name && break
    [[ $i -eq 60 ]] && { echo "ERROR: OpenSearch not ready after 120s"; exit 1; }
    sleep 2
done
echo "    OpenSearch is ready."
