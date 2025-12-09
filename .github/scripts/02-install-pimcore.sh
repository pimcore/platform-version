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
    -e PIMCORE_INSTALL_ENCRYPTION_SECRET=${PIMCORE_ENCRYPTION_SECRET} \
    -e PIMCORE_INSTALL_INSTANCE_IDENTIFIER=${PIMCORE_INSTANCE_IDENTIFIER} \
    -e PIMCORE_INSTALL_PRODUCT_KEY=${PIMCORE_PRODUCT_KEY} \
    -e PHP_MEMORY_LIMIT=512M \
    -- \
    php vendor/bin/pimcore-install -n

sudo chown -R `id -g` ./config # necessary to allow copying of config files during install of Pimcore
sudo chmod -R 777 ./config # necessary to allow copying of config files during install of Pimcore

cp ../../platform-version/.github/files/bundles.php ./config
cp ../../platform-version/.github/files/config-system.yaml ./config/local

sleep 2

docker compose exec -T php bin/console cache:clear

docker compose exec -T php bin/console pimcore:bundle:install PimcoreTranslationsProviderInterfaceBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePersonalizationBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreGlossaryBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreSeoBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreSimpleBackendSearchBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreCustomReportsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreGoogleMarketingBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreApplicationLoggerBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreWebToPrintBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreStaticRoutesBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreNewsletterBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreWordExportBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreXliffBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreFileExplorerBundle

docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataImporterBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubFileExportBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubSimpleRestBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubProductsupBundle
cp ../../platform-version/.github/files/config-datahub.yaml ./config/local

docker compose exec -T php bin/console pimcore:bundle:install PimcoreAssetMetadataClassDefinitionsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreStatisticsExplorerBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDirectEditBundle

docker compose exec -T php bin/console pimcore:bundle:install PimcoreOpenIdConnectBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreGenericDataIndexBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePortalEngineBundle
cp ../../platform-version/.github/files/config-portal-engine.yaml ./config/local

docker compose exec -T php bin/console pimcore:bundle:install PimcoreWorkflowDesignerBundle

docker compose exec -T php bin/console pimcore:bundle:install PimcoreHeadlessDocumentsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreCustomerManagementFrameworkBundle
docker compose exec -T php bin/console pimcore:bundle:install Web2PrintToolsBundle
docker compose exec -T php bin/console pimcore:bundle:install OutputDataConfigToolkitBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcorePerspectiveEditorBundle

docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataQualityManagementBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreDataHubWebhooksBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreBackendPowerToolsBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreWorkflowAutomationIntegrationBundle
docker compose exec -T php bin/console pimcore:bundle:install PimcoreCopilotBundle

cp ../../platform-version/.github/files/config-config.yaml ./config/local

#docker compose exec -T php bin/console doctrine:schema:update --force
docker compose exec -T php bin/console cache:clear
docker compose exec -T php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec -T php bin/console cache:clear
docker compose exec -T php bin/console generic-data-index:update:index -r


sudo chown -R www-data .
