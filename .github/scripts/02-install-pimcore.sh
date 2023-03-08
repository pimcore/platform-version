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

docker compose exec -T php bin/console cache:clear

cp ../repos/pimcore/platform-version/.github/files/bundles.php ./config


# todo remove that
docker compose exec -T php bin/console pimcore:bundle:enable -p15 ElementsProcessManagerBundle
docker compose exec -T php bin/console pimcore:bundle:install ElementsProcessManagerBundle


docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataImporterBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePerspectiveEditorBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreAssetMetadataClassDefinitionsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreStatisticsExplorerBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDirectEditBundle
docker compose exec -T php bin/console doctrine:schema:update --force
docker compose exec -T php bin/console pimcore:bundle:install PimcoreOpenIdConnectBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePortalEngineBundle
docker compose exec -T php bin/console pimcore:bundle:install AdvancedObjectSearchBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubFileExportBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubSimpleRestBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreTranslationsProviderInterfaceBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreWorkflowDesignerBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubCiHubBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubProductsupBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreHeadlessDocumentsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreCustomerManagementFrameworkBundle
docker compose exec -T php bin/console pimcore:bundle:install Web2PrintToolsBundle
docker compose exec -T php bin/console pimcore:bundle:install OutputDataConfigToolkitBundle

cp ../repos/pimcore/platform-version/.github/files/config.yaml ./config/local

docker compose exec -T php bin/console cache:clear

sudo chown -R www-data .