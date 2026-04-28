#!/usr/bin/env bash
#
# 04-shutdown.sh — Stop containers and remove volumes
#
# Used by CI (always step) and local.
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"
PROJECT_PATH="${REPO_ROOT}/../test-project"

if [[ ! -d "$PROJECT_PATH" ]]; then
    echo ">>> No project directory found at ${PROJECT_PATH}, nothing to shut down."
    exit 0
fi

source "${FILES_DIR}/.env"
[[ -f "${SCRIPTS_DIR}/.env.local" ]] && source "${SCRIPTS_DIR}/.env.local"

export NGINX_PORT OPENSEARCH_DASHBOARDS_PORT MAILPIT_PORT MERCURE_PORT DB_PORT
export PHP_IMAGE PHP_SUPERVISORD_IMAGE
export MYSQL_ROOT_PASSWORD MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD
export OPENSEARCH_INITIAL_ADMIN_PASSWORD
export DOCKER_UID="${DOCKER_UID:-$(id -u)}"
export DOCKER_GID="${DOCKER_GID:-$(id -g)}"

cd "$PROJECT_PATH"

echo ">>> Stopping containers and removing volumes..."
docker compose down -v --remove-orphans

echo ">>> Shutdown complete."
