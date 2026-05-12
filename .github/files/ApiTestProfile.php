<?php

declare(strict_types=1);

namespace App\Installer;

use Pimcore\Bundle\ApplicationLoggerBundle\PimcoreApplicationLoggerBundle;
use Pimcore\Bundle\BackendPowerToolsBundle\PimcoreBackendPowerToolsBundle;
use Pimcore\Bundle\CopilotBundle\PimcoreCopilotBundle;
use Pimcore\Bundle\CopilotShowcaseBundle\PimcoreCopilotShowcaseBundle;
use Pimcore\Bundle\CustomReportsBundle\PimcoreCustomReportsBundle;
use Pimcore\Bundle\DataHubBundle\PimcoreDataHubBundle;
use Pimcore\Bundle\DataHubFileExportBundle\PimcoreDataHubFileExportBundle;
use Pimcore\Bundle\DataHubProductsupBundle\PimcoreDataHubProductsupBundle;
use Pimcore\Bundle\DataHubSimpleRestBundle\PimcoreDataHubSimpleRestBundle;
use Pimcore\Bundle\DataHubWebhooksBundle\PimcoreDataHubWebhooksBundle;
use Pimcore\Bundle\DataImporterBundle\PimcoreDataImporterBundle;
use Pimcore\Bundle\DataQualityManagementBundle\PimcoreDataQualityManagementBundle;
use Pimcore\Bundle\DirectEditBundle\PimcoreDirectEditBundle;
use Pimcore\Bundle\EcommerceFrameworkBundle\PimcoreEcommerceFrameworkBundle;
use Pimcore\Bundle\EcommerceFrameworkBundle\PimcorePaymentProviderPayPalSmartPaymentButtonBundle;
use Pimcore\Bundle\EnterpriseSubscriptionToolsBundle\PimcoreEnterpriseSubscriptionToolsBundle;
use Pimcore\Bundle\GenericDataIndexBundle\PimcoreGenericDataIndexBundle;
use Pimcore\Bundle\GenericExecutionEngineBundle\PimcoreGenericExecutionEngineBundle;
use Pimcore\Bundle\HeadlessDocumentsBundle\PimcoreHeadlessDocumentsBundle;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ConfigParameter;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\AmqpMessengerEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\DatabaseEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\GotenbergEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\MailerEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\MercureEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\OpenSearchEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\ProductRegistrationEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\RedisEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\SimpleEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ParameterType;
use Pimcore\Bundle\InstallBundle\Profile\DataSource\DataSourceInterface;
use Pimcore\Bundle\InstallBundle\Profile\InstallProfileInterface;
use Pimcore\Bundle\ObjectMergerBundle\ObjectMergerBundle;
use Pimcore\Bundle\OpenIdConnectBundle\PimcoreOpenIdConnectBundle;
use Pimcore\Bundle\OpenSearchClientBundle\PimcoreOpenSearchClientBundle;
use Pimcore\Bundle\PersonalizationBundle\PimcorePersonalizationBundle;
use Pimcore\Bundle\PortalEngineBundle\PimcorePortalEngineBundle;
use Pimcore\Bundle\QuillBundle\PimcoreQuillBundle;
use Pimcore\Bundle\StatisticsExplorerBundle\PimcoreStatisticsExplorerBundle;
use Pimcore\Bundle\StudioBackendBundle\PimcoreStudioBackendBundle;
use Pimcore\Bundle\StudioDashboardsBundle\PimcoreStudioDashboardsBundle;
use Pimcore\Bundle\StudioUiBundle\PimcoreStudioUiBundle;
use Pimcore\Bundle\TinymceBundle\PimcoreTinymceBundle;
use Pimcore\Bundle\WebToPrintBundle\PimcoreWebToPrintBundle;
use Pimcore\Bundle\WorkflowAutomationIntegrationBundle\PimcoreWorkflowAutomationIntegrationBundle;
use Pimcore\Bundle\WorkflowDesignerBundle\PimcoreWorkflowDesignerBundle;
use Pimcore\AssetMetadataClassDefinitionsBundle\PimcoreAssetMetadataClassDefinitionsBundle;
use Pimcore\TranslationsProviderInterfaceBundle\PimcoreTranslationsProviderInterfaceBundle;
use CustomerManagementFrameworkBundle\PimcoreCustomerManagementFrameworkBundle;

/**
 * API test install profile — installs ALL platform-version enterprise bundles
 * on a clean database (no demo data).
 */
final readonly class ApiTestProfile implements InstallProfileInterface
{
    private const string SECTION_NAME = 'pimcore/api-tests';

    public function getName(): string
    {
        return 'api-test';
    }

    public function getDescription(): string
    {
        return 'Pimcore API Test — all enterprise bundles, no demo data';
    }

    public function getBundles(): array
    {
        return [
            // Core / Studio
            PimcoreGenericExecutionEngineBundle::class,
            PimcoreGenericDataIndexBundle::class,
            PimcoreStudioBackendBundle::class,
            PimcoreStudioUiBundle::class,
            PimcoreStudioDashboardsBundle::class,
            PimcoreQuillBundle::class,
            PimcoreTinymceBundle::class,

            // Standard bundles
            PimcoreApplicationLoggerBundle::class,
            PimcoreCustomReportsBundle::class,
            PimcoreWebToPrintBundle::class,
            PimcoreEcommerceFrameworkBundle::class,
            PimcorePersonalizationBundle::class,

            // Data Hub ecosystem
            PimcoreDataHubBundle::class,
            PimcoreDataImporterBundle::class,
            PimcoreDataHubFileExportBundle::class,
            PimcoreDataHubSimpleRestBundle::class,
            PimcoreDataHubProductsupBundle::class,
            PimcoreDataHubWebhooksBundle::class,

            // Enterprise bundles
            PimcoreAssetMetadataClassDefinitionsBundle::class,
            PimcoreBackendPowerToolsBundle::class,
            PimcoreCopilotBundle::class,
            PimcoreCopilotShowcaseBundle::class,
            PimcoreCustomerManagementFrameworkBundle::class,
            PimcoreDataQualityManagementBundle::class,
            PimcoreDirectEditBundle::class,
            PimcoreHeadlessDocumentsBundle::class,
            PimcoreOpenIdConnectBundle::class,
            PimcorePaymentProviderPayPalSmartPaymentButtonBundle::class,
            PimcorePortalEngineBundle::class,
            PimcoreStatisticsExplorerBundle::class,
            PimcoreTranslationsProviderInterfaceBundle::class,
            PimcoreWorkflowAutomationIntegrationBundle::class,
            PimcoreWorkflowDesignerBundle::class,
            ObjectMergerBundle::class,
            PimcoreOpenSearchClientBundle::class,
            PimcoreEnterpriseSubscriptionToolsBundle::class,
        ];
    }

    public function getEnvVarDefinitions(): array
    {
        return [
            new DatabaseEnvVarDefinition(),
            new OpenSearchEnvVarDefinition(),
            new AmqpMessengerEnvVarDefinition(),
            new MercureEnvVarDefinition(),
            new RedisEnvVarDefinition(),
            new GotenbergEnvVarDefinition(),
            new MailerEnvVarDefinition(),
            new ProductRegistrationEnvVarDefinition(),
            new SimpleEnvVarDefinition(
                key: 'application-secrets',
                label: 'Application Secrets',
                sectionName: self::SECTION_NAME,
                parameters: [
                    new ConfigParameter(
                        envVarName: 'APPLICATION_SECRET',
                        label: 'Application Secret',
                        type: ParameterType::Secret,
                        description: 'Symfony framework secret',
                    ),
                    new ConfigParameter(
                        envVarName: 'APPLICATION_ENCRYPTION_SECRET',
                        label: 'Application Encryption Secret',
                        type: ParameterType::Secret,
                        description: 'CMF encryption key',
                    ),
                ],
            ),
            new SimpleEnvVarDefinition(
                key: 'simple-rest-index-prefix',
                label: 'SimpleREST Index Prefix',
                sectionName: 'pimcore/data-hub-simple-rest',
                parameters: [
                    new ConfigParameter(
                        envVarName: 'ES_PREFIX_SIMPLE_REST',
                        label: 'SimpleREST Index Prefix',
                        type: ParameterType::String,
                        defaultValue: 'it_simple_rest_',
                    ),
                ],
            ),
            // Optional bundles — provide dummy defaults so install doesn't prompt
            new SimpleEnvVarDefinition(
                key: 'copilot-tokens',
                label: 'Copilot AI Tokens',
                sectionName: 'pimcore/copilot-bundle',
                parameters: [
                    new ConfigParameter(
                        envVarName: 'OPEN_AI_AUTH_TOKEN',
                        label: 'OpenAI API Key',
                        type: ParameterType::Secret,
                        description: 'OpenAI API key (dummy for tests)',
                    ),
                    new ConfigParameter(
                        envVarName: 'HUGGING_FACE_AUTH_TOKEN',
                        label: 'HuggingFace API Token',
                        type: ParameterType::Secret,
                        description: 'HuggingFace API token (dummy for tests)',
                    ),
                ],
                required: false,
            ),
        ];
    }

    public function getDataSource(): ?DataSourceInterface
    {
        return null;
    }

    public function getPostInstallCommands(): array
    {
        return [];
    }
}
