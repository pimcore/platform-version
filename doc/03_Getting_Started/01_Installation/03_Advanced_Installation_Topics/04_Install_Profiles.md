# Install Profiles

Install profiles are the central configuration mechanism for the Pimcore installer.
A profile defines everything the installer needs to set up a Pimcore instance:
which environment variables to collect, which bundles to install, optional data sources
for pre-built content, and post-install commands to run after setup.

## What is an Install Profile?

An install profile is a PHP class implementing `InstallProfileInterface`.
The installer takes the profile's FQCN via `--install-profile` and uses it as the single source of truth.

```php
<?php
declare(strict_types=1);

namespace App\Installer;

use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\DatabaseEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\OpenSearchEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\EnvVarDefinitionInterface;
use Pimcore\Bundle\InstallBundle\Profile\DataSource\DataSourceInterface;
use Pimcore\Bundle\InstallBundle\Profile\InstallProfileInterface;
use Pimcore\Bundle\InstallBundle\Profile\PostInstallCommand;

final class MyProjectProfile implements InstallProfileInterface
{
    public function getName(): string
    {
        return 'My Project';
    }

    public function getDescription(): string
    {
        return 'Standard installation for the My Project application.';
    }

    public function getBundles(): array
    {
        return [
            \Pimcore\Bundle\ApplicationLoggerBundle\PimcoreApplicationLoggerBundle::class,
            \Pimcore\Bundle\CustomReportsBundle\PimcoreCustomReportsBundle::class,
        ];
    }

    public function getEnvVarDefinitions(): array
    {
        return [
            new DatabaseEnvVarDefinition(),
            new OpenSearchEnvVarDefinition(),
        ];
    }

    public function getDataSource(): ?DataSourceInterface
    {
        return null; // no pre-built content
    }

    public function getPostInstallCommands(): array
    {
        return [
            new PostInstallCommand(
                command: 'cache:clear',
                label: 'Clearing cache',
                priority: 100,
            ),
        ];
    }
}
```

## InstallProfileInterface

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getName()` | `string` | Human-readable name displayed during installation. |
| `getDescription()` | `string` | Description shown after the title in CLI output. |
| `getBundles()` | `list<class-string>` | Bundle FQCNs to register in `config/bundles.php` and install. |
| `getEnvVarDefinitions()` | `list<EnvVarDefinitionInterface>` | Environment variable definitions the installer collects and writes to `.env.local`. See [Env Var Definitions](./05_Env_Var_Definitions.md). |
| `getDataSource()` | `?DataSourceInterface` | Optional data source for importing pre-built content (database dumps, fixtures). Return `null` for empty installs. |
| `getPostInstallCommands()` | `list<PostInstallCommand>` | Symfony console commands to run after installation completes. See [Post-Install Commands](./06_Post_Install_Commands.md). |

## Data Sources

The `DataSourceInterface` allows profiles to import pre-built content (database dumps, fixtures)
during installation. The data source runs before admin user creation.

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getLabel()` | `string` | Human-readable label for CLI output. |
| `apply(Connection, OutputInterface)` | `void` | Applies the data source. Must be idempotent. |
| `isApplied(Connection)` | `bool` | Returns whether the data source was already applied (prevents re-import). |

Data sources are defined by the profile's `getDataSource()` method.
Return `null` for installations without pre-built content.

## Marker Interfaces

Some env var definitions implement marker interfaces for discoverability by bundle installers:

| Interface | Purpose |
|-----------|---------|
| `SearchEngineDefinitionInterface` | Marks OpenSearch/Elasticsearch definitions. Bundles that need search can check if a search engine was configured. |
| `MessengerTransportDefinitionInterface` | Marks messenger transport definitions. Bundles that register messenger transports can detect the configured backend. |

## Install Step Filtering

Profiles can optionally control which installation steps execute by implementing
`InstallStepFilterInterface`. This is useful for PaaS environments where certain
steps (writing `.env.local`, installing assets) are handled by the deployment pipeline.

See [Install Step Filtering](./07_Install_Step_Filtering.md) for details.
