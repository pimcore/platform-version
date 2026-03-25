# Post-Install Commands

Post-install commands are Symfony console commands that run automatically after the
installer finishes setting up the database, bundles, and assets. They handle tasks like
rebuilding search indexes, initializing data structures, or importing fixtures.

## Sources of Post-Install Commands

Post-install commands can come from three sources, all merged and sorted by priority
(higher priority runs first):

1. **Install profile** -- the profile's `getPostInstallCommands()` method returns commands
   specific to the project setup.
2. **Bundle installers** -- bundles that implement `PostInstallCommandsProviderInterface`
   in their installer class contribute commands automatically when the bundle is installed.
3. **CLI injection** -- the `--post-install-commands` option injects additional
   `PostInstallCommandsProviderInterface` implementations at runtime.

## PostInstallCommand

Each command is represented by a `PostInstallCommand` value object:

| Property | Type | Description |
|----------|------|-------------|
| `command` | `string` | Symfony console command name (e.g., `cache:clear`). |
| `label` | `string` | Human-readable description shown during installation. |
| `priority` | `int` | Execution order: higher values run first (default `0`). |
| `arguments` | `list<string>` | Additional arguments passed to the command (default `[]`). |

Example:

```php
use Pimcore\Bundle\InstallBundle\Profile\PostInstallCommand;

new PostInstallCommand(
    command: 'app:import-fixtures',
    label: 'Importing project fixtures',
    priority: 50,
    arguments: ['--env=prod'],
);
```

## PostInstallCommandsProviderInterface

Bundle installers can implement this interface to register commands that run automatically
whenever the bundle is installed as part of a profile. This is the preferred approach for
bundles that need post-install setup, because the commands are always included regardless
of which profile is used.

```php
<?php
declare(strict_types=1);

namespace App\Installer;

use Pimcore\Bundle\InstallBundle\Profile\PostInstallCommand;
use Pimcore\Bundle\InstallBundle\Profile\PostInstallCommandsProviderInterface;

final class ProjectSetupCommands implements PostInstallCommandsProviderInterface
{
    public function getPostInstallCommands(): array
    {
        return [
            new PostInstallCommand(
                command: 'app:import-fixtures',
                label: 'Importing project fixtures',
                priority: 50,
            ),
            new PostInstallCommand(
                command: 'messenger:setup-transports',
                label: 'Creating messenger transport tables',
                priority: 40,
            ),
        ];
    }
}
```

## PostInstallHookInterface

For post-install logic that requires direct database access rather than running a console
command, implement `PostInstallHookInterface`. Hooks receive the Doctrine `Connection`
and Symfony `OutputInterface` and run after all post-install commands have completed.

| Method | Return Type | Description |
|--------|-------------|-------------|
| `postInstall(Connection, OutputInterface)` | `void` | Runs custom setup logic with direct database access. |

```php
<?php
declare(strict_types=1);

namespace App\Installer;

use Doctrine\DBAL\Connection;
use Pimcore\Bundle\InstallBundle\Profile\PostInstallHookInterface;
use Symfony\Component\Console\Output\OutputInterface;

final class CustomDataMigration implements PostInstallHookInterface
{
    public function postInstall(Connection $connection, OutputInterface $output): void
    {
        $output->writeln('Running custom data migration...');
        $connection->executeStatement('INSERT INTO ...');
    }
}
```

## Adding Commands via CLI

Use `--post-install-commands` to inject additional `PostInstallCommandsProviderInterface`
implementations without modifying the profile:

```bash
vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile' \
  --post-install-commands='App\Installer\ProjectSetupCommands'
```

Multiple providers can be specified by repeating the option:

```bash
vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile' \
  --post-install-commands='App\Installer\ProjectSetupCommands' \
  --post-install-commands='App\Installer\SearchIndexCommands'
```

These commands are merged with all other sources and sorted by priority before execution.
