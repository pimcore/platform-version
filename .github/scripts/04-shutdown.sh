#!/bin/bash
set -ex

docker-compose down -v
docker network rm k6-test-network