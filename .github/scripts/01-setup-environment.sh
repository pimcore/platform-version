#!/bin/bash
set -ex

if [ -z "$1" ]
  then
    echo "No argument supplied. First and only argument is token for enterprise bundles."
    exit;
fi

docker pull docker.io/pimcore/pimcore:php8.2-latest

sudo rm -rf test-project/

docker run \
  -u `id -u`:`id -g` --rm \
  -v `pwd`:/var/www/html \
  pimcore/pimcore:php8.2-latest \
  composer create-project --prefer-dist --stability=dev pimcore/skeleton:11.x test-project

cd test-project/

cp ../../platform-version/.github/files/docker-compose.override.yaml .
cp ../../platform-version/.github/files/supervisord.conf .docker/
cp ../../platform-version/.github/files/.env.local .
cp ../../platform-version/.github/files/parameters.yaml ./config/local


# overwrite port of nginx
sed -i "s/80:80/8088:80/g" docker-compose.yaml

cp -r ../../platform-version .


# Start containers
docker compose down -v --remove-orphans
docker network rm k6-test-network || true

sudo chown -R www-data .
#docker compose pull --quiet
docker network create k6-test-network
docker compose up -d



# add platform version
docker compose exec -T -- php composer config repositories.dev path "./platform-version"
docker compose exec -T -- php composer config --global --auth http-basic.enterprise.repo.pimcore.com token $1
docker compose exec -T -- php composer config repositories.pimcore_enterprise composer https://enterprise.repo.pimcore.com/

docker compose exec -T -- php composer require pimcore/platform-version:@dev
docker compose exec -T -- php composer clearcache
docker compose exec -T -- php composer require -W \
    pimcore/admin-ui-classic-bundle \
    pimcore/asset-metadata-class-definitions \
    pimcore/data-hub-ci-hub \
    pimcore/data-hub-file-export \
    pimcore/data-hub-productsup \
    pimcore/data-hub-simple-rest \
    pimcore/direct-edit \
    pimcore/headless-documents \
    pimcore/openid-connect \
    pimcore/portal-engine \
    pimcore/statistics-explorer \
    pimcore/translations-provider-interfaces \
    pimcore/workflow-designer \
    pimcore/data-importer \
    pimcore/data-hub \
    pimcore/customer-management-framework-bundle \
    pimcore/web2print-tools-bundle \
    pimcore/web-to-print-bundle \
    pimcore/perspective-editor \
    pimcore/output-data-config-toolkit-bundle \
    pimcore/object-merger \
    pimcore/frontend-permission-toolkit-bundle \
    pimcore/advanced-object-search

docker compose exec -T -- php composer update


# Install dockerize into the php container. We need it to block until
# database is ready to serve connections.
docker compose exec -u root -T -- php bash -c '\
  curl -sfL https://github.com/powerman/dockerize/releases/download/v0.11.5/dockerize-`uname -s`-`uname -m` \
  | install /dev/stdin /usr/local/bin/dockerize'

# Wait for the database to set up.
docker compose exec -T -- php dockerize -wait tcp://db:3306 -timeout 5m
docker compose exec -T -- php dockerize -wait tcp://elastic:9200 -timeout 5m
