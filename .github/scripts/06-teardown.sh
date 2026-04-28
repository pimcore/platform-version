#!/usr/bin/env bash
#
# 06-teardown.sh — Clean shutdown of the API test environment
#
# Usage:
#   ./.github/scripts/06-teardown.sh           # Stop containers, remove volumes
#   ./.github/scripts/06-teardown.sh --clean   # Also delete the test-project directory
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"
PROJECT_PATH="${REPO_ROOT}/../test-project"

CLEAN=false
for arg in "$@"; do
    [[ "$arg" == "--clean" ]] && CLEAN=true
done

if [[ ! -d "$PROJECT_PATH" ]]; then
    echo ">>> No project directory found at ${PROJECT_PATH}, nothing to do."
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

if [[ "$CLEAN" == true ]]; then
    echo ">>> [sudo] Removing project directory..."
    cd "$REPO_ROOT"
    sudo rm -rf "$PROJECT_PATH"
fi

echo ">>> Teardown complete."
