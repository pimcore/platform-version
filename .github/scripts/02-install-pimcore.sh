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

sudo chown -R `id -g` ./config # necessary to allow copying of config files during install of Pimcore
sudo chmod -R 777 ./config # necessary to allow copying of config files during install of Pimcore

cp ../../platform-version/.github/files/bundles.php ./config
cp ../../platform-version/.github/files/config-system.yaml ./config/local
docker compose exec -T php bin/console cache:clear


# todo remove that
#docker compose exec -T php bin/console pimcore:bundle:enable -p15 ElementsProcessManagerBundle
#docker compose exec -T php bin/console pimcore:bundle:install ElementsProcessManagerBundle


docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataImporterBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubFileExportBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubSimpleRestBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubCiHubBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubProductsupBundle
cp ../../platform-version/.github/files/config-datahub.yaml ./config/local

docker compose exec -T php bin/console pimcore:bundle:install AdvancedObjectSearchBundle
cp ../../platform-version/.github/files/config-advanced-object-search.yaml ./config/local

docker compose exec -T php bin/console pimcore:bundle:install PimcoreAssetMetadataClassDefinitionsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreStatisticsExplorerBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDirectEditBundle
docker compose exec -T php bin/console doctrine:schema:update --force
docker compose exec -T php bin/console pimcore:bundle:install PimcoreOpenIdConnectBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePortalEngineBundle
cp ../../platform-version/.github/files/config-portal-engine.yaml ./config/local

docker compose exec -T php bin/console pimcore:bundle:install PimcoreTranslationsProviderInterfaceBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreWorkflowDesignerBundle

docker compose exec -T php bin/console pimcore:bundle:install PimcoreHeadlessDocumentsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreCustomerManagementFrameworkBundle
docker compose exec -T php bin/console pimcore:bundle:install Web2PrintToolsBundle
cp ../../platform-version/.github/files/config-web-to-print.yaml ./config/local
docker compose exec -T php bin/console pimcore:bundle:install OutputDataConfigToolkitBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePerspectiveEditorBundle

docker compose exec -T php bin/console cache:clear

sudo chown -R www-data .