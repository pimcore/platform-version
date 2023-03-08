#!/bin/bash
set -ex



# Run pimcore installation.
docker compose exec -T \
-e PIMCORE_INSTALL_ADMIN_USERNAME=admin \
-e PIMCORE_INSTALL_ADMIN_PASSWORD=pimcore \
-e PIMCORE_INSTALL_MYSQL_USERNAME=pimcore \
-e PIMCORE_INSTALL_MYSQL_PASSWORD=pimcore \
-e PIMCORE_INSTALL_MYSQL_PORT=3306 \
-e PIMCORE_INSTALL_MYSQL_HOST_SOCKET=db \
-e PIMCORE_INSTALL_MYSQL_DATABASE=pimcore \
-- \
php vendor/bin/pimcore-install -n


