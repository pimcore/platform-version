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

docker compose exec -T -- php composer require pimcore/workflow-designer --no-update
docker compose exec -T -- php composer require pimcore/asset-metadata-class-definitions --no-update
docker compose exec -T -- php composer require pimcore/data-hub-ci-hub --no-update
docker compose exec -T -- php composer require pimcore/data-hub-file-export --no-update
docker compose exec -T -- php composer require pimcore/data-hub-productsup --no-update
docker compose exec -T -- php composer require pimcore/data-hub-simple-rest --no-update
docker compose exec -T -- php composer require pimcore/direct-edit --no-update
docker compose exec -T -- php composer require pimcore/headless-documents --no-update
docker compose exec -T -- php composer require pimcore/openid-connect --no-update
docker compose exec -T -- php composer require pimcore/portal-engine --no-update
docker compose exec -T -- php composer require pimcore/statistics-explorer --no-update
docker compose exec -T -- php composer require pimcore/translations-provider-interfaces --no-update
docker compose exec -T -- php composer require pimcore/workflow-designer --no-update
docker compose exec -T -- php composer require pimcore/data-importer --no-update
docker compose exec -T -- php composer require pimcore/data-hub --no-update
docker compose exec -T -- php composer require pimcore/customer-management-framework-bundle --no-update
docker compose exec -T -- php composer require pimcore/web2print-tools-bundle --no-update
docker compose exec -T -- php composer require pimcore/perspective-editor --no-update
docker compose exec -T -- php composer require pimcore/output-data-config-toolkit-bundle --no-update
docker compose exec -T -- php composer require pimcore/object-merger --no-update
docker compose exec -T -- php composer require pimcore/frontend-permission-toolkit-bundle --no-update
docker compose exec -T -- php composer require pimcore/advanced-object-search --no-update

docker compose exec -T -- php composer update


# Install dockerize into the php container. We need it to block until
# database is ready to serve connections.
docker compose exec -u root -T -- php bash -c '\
  curl -sfL https://github.com/powerman/dockerize/releases/download/v0.11.5/dockerize-`uname -s`-`uname -m` \
  | install /dev/stdin /usr/local/bin/dockerize'

# Wait for the database to set up.
docker compose exec -T -- php dockerize -wait tcp://db:3306 -timeout 5m
