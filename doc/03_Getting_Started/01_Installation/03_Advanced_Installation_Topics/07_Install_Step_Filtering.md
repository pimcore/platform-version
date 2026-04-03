# Install Step Filtering

Install step filtering is an opt-in mechanism that allows install profiles to skip
certain installation steps. This is useful for PaaS environments (Platform.sh,
AWS Elastic Beanstalk, etc.) where environment variables are set via the platform
dashboard, assets are installed by a build pipeline, or config files are shipped
with the deployment artifact.

The approach uses a skip list: profiles declare which steps to **exclude**, not which
to include. Profiles that do not implement the interface run all steps as before --
existing profiles are unaffected.

## InstallStepFilterInterface

Profiles opt into step filtering by implementing `InstallStepFilterInterface`.
This is a separate opt-in interface (like `PostInstallHookInterface`), not part of
`InstallProfileInterface`.

The interface has a single method:

```php
<?php
declare(strict_types=1);

namespace Pimcore\Bundle\InstallBundle\Profile;

interface InstallStepFilterInterface
{
    /**
     * @return list<InstallStep>
     */
    public function getSkippedInstallSteps(): array;
}
```

The method returns an array of `InstallStep` enum cases. Any step included in the
returned array is skipped during installation.

## InstallStep Enum

`InstallStep` is a backed string enum with 17 cases across two phases.
Phase 1 handles environment setup, Phase 2 handles application setup.

| Case | Value | Phase | Description |
|------|-------|-------|-------------|
| `CollectAndValidate` | `collect_validate` | 1 | Collects and validates environment variable values. |
| `WriteEnv` | `write_env` | 1 | Writes collected env vars to `.env.local`. |
| `WriteDoctrineConfig` | `write_doctrine_config` | 1 | Writes `doctrine_mapping_types.yaml` config. |
| `BootKernel` | `boot_kernel` | 2 | Boots the real application kernel. |
| `SetupDatabase` | `setup_database` | 2 | Creates database schema and seed data. |
| `ImportData` | `import_data` | 2 | Imports data from the profile's data source. |
| `CreateAdmin` | `create_admin` | 2 | Creates or replaces the admin user. |
| `RegisterBundles` | `register_bundles` | 2 | Writes bundle FQCNs to `config/bundles.php`. |
| `RebootKernel` | `reboot_kernel` | 2 | Clears cache and reboots kernel with new bundles. |
| `InstallBundles` | `install_bundles` | 2 | Runs `pimcore:bundle:install` for each bundle. |
| `InstallAssets` | `install_assets` | 2 | Runs `assets:install`. |
| `RebuildClasses` | `rebuild_classes` | 2 | Runs `pimcore:deployment:classes-rebuild`. |
| `MarkMigrations` | `mark_migrations` | 2 | Marks all migrations as executed. |
| `PostInstallCommands` | `post_install_commands` | 2 | Executes post-install commands. |
| `RunMaintenance` | `run_maintenance` | 2 | Runs `pimcore:maintenance`. |
| `ProfilePostInstall` | `profile_post_install` | 2 | Runs profile's `postInstall()` hook. |
| `Finalize` | `finalize` | 2 | Clears cache and removes install lock. |

## Example -- PaaS Profile

The following profile skips steps that are handled by the Platform.sh deployment
pipeline: environment variables are set in the platform dashboard, Doctrine config
is shipped with the deployment artifact, and assets are built during CI.

```php
<?php
declare(strict_types=1);

namespace App\Installer;

use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\DatabaseEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\OpenSearchEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\RedisEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\Profile\DataSource\DataSourceInterface;
use Pimcore\Bundle\InstallBundle\Profile\InstallProfileInterface;
use Pimcore\Bundle\InstallBundle\Profile\InstallStep;
use Pimcore\Bundle\InstallBundle\Profile\InstallStepFilterInterface;
use Pimcore\Bundle\InstallBundle\Profile\PostInstallCommand;

final readonly class PlatformShProfile implements InstallProfileInterface, InstallStepFilterInterface
{
    public function getName(): string
    {
        return 'Platform.sh';
    }

    public function getDescription(): string
    {
        return 'Pimcore installation for Platform.sh deployments.';
    }

    public function getBundles(): array
    {
        return [
            \Pimcore\Bundle\ApplicationLoggerBundle\PimcoreApplicationLoggerBundle::class,
            \Pimcore\Bundle\CustomReportsBundle\PimcoreCustomReportsBundle::class,
            \Pimcore\Bundle\GlossaryBundle\PimcoreGlossaryBundle::class,
        ];
    }

    public function getEnvVarDefinitions(): array
    {
        return [
            new DatabaseEnvVarDefinition(),
            new OpenSearchEnvVarDefinition(),
            new RedisEnvVarDefinition(),
        ];
    }

    public function getDataSource(): ?DataSourceInterface
    {
        return null;
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

    public function getSkippedInstallSteps(): array
    {
        return [
            // Env vars are set via the Platform.sh dashboard, not .env.local
            InstallStep::WriteEnv,

            // doctrine_mapping_types.yaml is committed to the repository
            InstallStep::WriteDoctrineConfig,

            // Assets are built by the Platform.sh build hook
            InstallStep::InstallAssets,
        ];
    }
}
```

## Step Dependencies

:::caution

The installer does **not** enforce step dependencies -- it trusts the developer to
understand which steps depend on others. Skipping a step that is a prerequisite for
a later step will cause that later step to fail at runtime.

:::

The following table lists the dependencies between Phase 2 steps. Phase 1 steps
(`CollectAndValidate`, `WriteEnv`, `WriteDoctrineConfig`) and `BootKernel` are not
listed as dependencies because they are prerequisites for Phase 2 as a whole.

| Step | Depends On | Notes |
|------|-----------|-------|
| `ImportData` | `SetupDatabase` | Imports into tables created by setup. |
| `CreateAdmin` | `SetupDatabase` | Inserts into `users` table. |
| `RebootKernel` | `RegisterBundles` | Reboots to load newly registered bundles. |
| `InstallBundles` | `RegisterBundles`, `RebootKernel` | Kernel must know about bundles. |
| `InstallAssets` | `InstallBundles` | Installs assets from installed bundles. |
| `RebuildClasses` | `SetupDatabase`, `InstallBundles` | Needs schema and class definitions. |
| `MarkMigrations` | `SetupDatabase` | Writes to migration tracking table. |
| `PostInstallCommands` | `InstallBundles` | Commands may come from bundle installers. |
| `RunMaintenance` | `SetupDatabase` | Maintenance tasks need the database. |
| `ProfilePostInstall` | `SetupDatabase` | Receives DB connection in context. |
| `Finalize` | None | Always safe to run. |

## Common PaaS Patterns

### Environment Managed Externally

Skip `CollectAndValidate` and `WriteEnv` when environment variables are set via the
platform dashboard or injected by the orchestration layer.

### Config Shipped with Artifact

Skip `WriteDoctrineConfig` when `doctrine_mapping_types.yaml` is committed to the
repository or generated during the build step.

### Assets Built in CI

Skip `InstallAssets` when frontend assets are compiled and installed by the CI/CD
pipeline before deployment.

### Bundles Pre-Registered

Skip `RegisterBundles` and `RebootKernel` when `config/bundles.php` is committed to
the repository with all bundles already registered.
