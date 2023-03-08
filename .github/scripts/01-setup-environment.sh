#!/bin/bash
set -ex

docker pull docker.io/pimcore/pimcore:php8.2-latest

rm -rf test-project/

docker run \
  -u `id -u`:`id -g` --rm \
  -v `pwd`:/var/www/html \
  pimcore/pimcore:php8.2-latest \
  composer create-project pimcore/skeleton test-project

cd test-project/

cp ../repos/pimcore/platform-version/.github/files/docker-compose.override.yaml .
cp ../repos/pimcore/platform-version/.github/files/.env.local .
cp ../repos/pimcore/platform-version/.github/files/parameters.yaml ./config/local
cp ../repos/pimcore/platform-version/.github/files/bundles.php ./config

MY_UID=`id -u`
MY_GID=`id -g`
sed -i "s/uid:gid/$MY_UID:$MY_GID/g" docker-compose.override.yaml

# overwrite port of nginx
sed -i "s/80:80/8088:80/g" docker-compose.yaml

cp -r ../repos .


# Start containers
docker compose down -v --remove-orphans
docker network rm k6-test-network || true

#docker compose pull --quiet
docker network create k6-test-network
docker compose up -d



# add platform version
docker compose exec -T -- php composer config repositories.dev path "./repos/*/*"
docker compose exec -T -- php composer config --global --auth http-basic.enterprise.repo.pimcore.com token ee0a08e880e1de5b71c7c0915d2fbb92909f05e333cfecbd13b5318451ed226e
docker compose exec -T -- php composer config repositories.pimcore_enterprise composer https://enterprise.repo.pimcore.com/

docker compose exec -T -- php composer require pimcore/platform-version:@dev
docker compose exec -T -- php composer require -W \
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
