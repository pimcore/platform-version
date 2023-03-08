#!/bin/bash
set -ex

docker compose down -v --remove-orphans
docker network rm k6-test-network