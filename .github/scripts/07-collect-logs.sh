#!/usr/bin/env bash
#
# 07-collect-logs.sh — Save container and Pimcore logs before shutdown
#
# Used by CI (on failure, before 04-shutdown.sh) and local.
# Writes everything to <repo>/container-logs/.
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
FILES_DIR="${SCRIPTS_DIR}/../files"
PROJECT_PATH="${REPO_ROOT}/../test-project"
LOGS_DIR="${REPO_ROOT}/container-logs"

if [[ ! -d "$PROJECT_PATH" ]]; then
    echo ">>> No project directory found at ${PROJECT_PATH}, no logs to collect."
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

mkdir -p "$LOGS_DIR"
cd "$PROJECT_PATH"

echo ">>> Collecting container logs into ${LOGS_DIR}..."
docker compose ps --all > "${LOGS_DIR}/compose-ps.txt" 2>&1 || true
for service in $(docker compose config --services); do
    docker compose logs --no-color --timestamps "$service" > "${LOGS_DIR}/${service}.log" 2>&1 || true
done

echo ">>> Collecting Pimcore var/log..."
if [[ -d var/log ]]; then
    cp -r var/log "${LOGS_DIR}/var-log" || true
fi

# The artifact is downloadable from a public repository, so scrub the secret values the job
# exports before it is uploaded — GitHub only masks them in the step log, not in artifacts.
echo ">>> Redacting secrets..."
for secret_var in PIMCORE_PRODUCT_KEY PIMCORE_ENCRYPTION_SECRET PIMCORE_INSTANCE_IDENTIFIER COMPOSER_TOKEN; do
    secret="${!secret_var:-}"
    [[ -z "$secret" ]] && continue
    SECRET="$secret" find "$LOGS_DIR" -type f -exec \
        perl -pi -e 's/\Q$ENV{SECRET}\E/[REDACTED]/g' {} +
    # perl -i only warns and still exits 0 when it cannot open a file, so verify the result
    # instead: grep exits 1 only if every file was read and none still holds the secret.
    grep_status=0
    grep -rqF -- "$secret" "$LOGS_DIR" || grep_status=$?
    if [[ "$grep_status" -ne 1 ]]; then
        echo ">>> ${secret_var} could not be redacted from every file, refusing to keep the logs." >&2
        rm -rf "$LOGS_DIR"
        exit 1
    fi
done

echo ">>> Log collection complete."
