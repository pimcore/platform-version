#!/bin/bash
set -ex

if [ -z "$1" ]
  then
    echo "No argument supplied. First and only argument is token for enterprise bundles."
    exit;
fi

docker pull ghcr.io/pimcore/pimcore:php8.4-latest

sudo rm -rf test-project/

docker run \
  -u `id -u`:`id -g` --rm \
  -v `pwd`:/var/www/html \
  pimcore/pimcore:php8.4-latest \
  composer create-project pimcore/skeleton:@dev test-project

cd test-project/

cp ../../platform-version/.github/files/docker-compose.yaml .
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
docker compose exec -T -- php composer config --global --auth http-basic.repo.pimcore.com token $1
docker compose exec -T -- php composer config repositories.private-packagist composer https://repo.pimcore.com/github-actions/
docker compose exec -T -- php composer config repositories.dev path "./platform-version"

docker compose exec -T -- php composer config minimum-stability dev
docker compose exec -T -- php composer config prefer-stable true

docker compose exec -T -- php composer require pimcore/platform-version:@dev pimcore/pimcore pimcore/quill-bundle pimcore/admin-ui-classic-bundle -W
docker compose exec -T -- php composer require -W \
    gotenberg/gotenberg-php:^2.2 \
    pimcore/admin-ui-classic-bundle \
    pimcore/asset-metadata-class-definitions \
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
    pimcore/system-info-bundle \
    pimcore/file-explorer-bundle \
    pimcore/personalization-bundle \
    pimcore/google-marketing-bundle \
    pimcore/web-to-print-bundle \
    pimcore/ecommerce-framework-bundle \
    pimcore/newsletter-bundle \
    pimcore/data-quality-management-bundle \
    pimcore/data-hub-webhooks \
    pimcore/backend-power-tools-bundle \
    pimcore/admin-ui-classic-light-theme-bundle \
    pimcore/copilot-bundle \
    pimcore/generic-data-index-bundle \
    pimcore/quill-bundle \
    pimcore/tinymce-bundle \
    pimcore/workflow-automation-integration-bundle

docker compose exec -T -- php composer update


# Install dockerize into the php container. We need it to block until
# database is ready to serve connections.
docker compose exec -u root -T -- php bash -c '\
  curl -sfL https://github.com/powerman/dockerize/releases/download/v0.11.5/dockerize-`uname -s`-`uname -m` \
  | install /dev/stdin /usr/local/bin/dockerize'

# Wait for the database to set up.
docker compose exec -T -- php dockerize -wait tcp://db:3306 -timeout 5m
docker compose exec -T -- php dockerize -wait tcp://opensearch:9200 -timeout 5m
