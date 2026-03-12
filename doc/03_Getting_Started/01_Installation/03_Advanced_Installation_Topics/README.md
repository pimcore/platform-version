# Advanced Installation Topics

To fully automate the installation process, pass options as CLI parameters instead of entering them interactively.

```bash
docker compose exec php vendor/bin/pimcore-install --admin-username=admin --admin-password=admin \
  --mysql-username=username --mysql-password=password --mysql-database=pimcore \
  --mysql-host-socket=127.0.0.1 --mysql-port=3306 \
  --no-interaction
```

:::info

The `--no-interaction` flag prevents any interactive prompts.

:::

To avoid passing sensitive data (e.g. database password) as a command line option, you can set each parameter as an environment variable. See `./vendor/bin/pimcore-install` for details:

```bash
PIMCORE_INSTALL_MYSQL_USERNAME=username PIMCORE_INSTALL_MYSQL_PASSWORD=password ./vendor/bin/pimcore-install \
  --admin-username=admin --admin-password=admin \
  --mysql-database=pimcore \
  --no-interaction
```

## Installing Bundles

### Bundle Lists Overview

During installation, you interact with two lists of bundles: **Recommended Bundles** and **Required Bundles**.

- **Recommended Bundles**: Displayed to users during interactive mode. These are the bundles users can specify with the `--install-bundles=commaSeparatedBundleList` option.

- **Required Bundles**: Automatically installed in interactive mode if the user chooses to install bundles. They are also installed whenever the `--install-bundles` option is set.

### Default Recommended Bundles

- PimcoreApplicationLoggerBundle
- PimcoreCustomReportsBundle
- PimcoreSeoBundle (Robots.txt, Sitemaps, Redirects)
- PimcoreQuillBundle (default WYSIWYG editor)
- PimcoreUuidBundle

### Automating Bundle Installation

To install specific bundles automatically, use the `--install-bundles[=bundleList]` flag. This installs and activates all required bundles and any specified bundles from the recommended list.

The bundles are automatically added to `config/bundles.php`.

```bash
./vendor/bin/pimcore-install --admin-username=admin --admin-password=admin \
  --mysql-username=username --mysql-password=password --mysql-database=pimcore \
  --mysql-host-socket=127.0.0.1 --mysql-port=3306 \
  --install-bundles=PimcoreApplicationLoggerBundle,PimcoreCustomReportsBundle \
  --no-interaction
```

### Modifying Required Bundles and Bundle Recommendations

The `BundleSetupEvent` is triggered during installation to configure which bundles are installable (recommended) and which are automatically installed (required).

By subscribing to this event, you can add or remove bundles from either list. For a practical example, see the [Pimcore Skeleton](https://github.com/pimcore/skeleton), which shows how the Admin UI Classic Bundle is integrated.

```php
<?php

namespace App\EventSubscriber;

use Pimcore\Bundle\AdminBundle\PimcoreAdminBundle;
use Pimcore\Bundle\InstallBundle\Event\BundleSetupEvent;
use Pimcore\Bundle\InstallBundle\Event\InstallEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class BundleSetupSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            InstallEvents::EVENT_BUNDLE_SETUP => [
                ['bundleSetup'],
            ],
        ];
    }

    public function bundleSetup(BundleSetupEvent $event): void
    {
        // make bundle installable (using --install-bundles) and recommend it in interactive installation
        $event->addInstallableBundle('PimcoreAdminBundle', PimcoreAdminBundle::class, true);

        // add required bundle
        $event->addRequiredBundle('PimcoreAdminBundle', PimcoreAdminBundle::class);
    }
}
```

Register the subscriber in `config/installer.yaml` as described in [Preconfiguring the Installer](#preconfiguring-the-installer).

```yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
        public: false

    App\EventSubscriber\BundleSetupSubscriber: ~
```

## Preconfiguring the Installer

You can preconfigure installer values by adding a config file that sets database credentials. This is useful when installing Pimcore on platforms where credentials are available via environment variables. Add a config file at `config/installer.yaml` (any Symfony-supported format works):

```yaml
# config/installer.yaml

pimcore_install:
    parameters:
        database_credentials:
            user:                 username
            password:             password
            dbname:               pimcore

            # env variables can be read with the %env() syntax
            host:                 "%env(DB_HOST)%"
            port:                 "%env(DB_PORT)%"
```

## Set a Time Zone

Set the time zone in your configuration. It is used for displaying date/time values in Pimcore Studio.

```yaml
pimcore:
    general:
        timezone: Europe/Berlin
```

## Office Document Preview

The document preview feature is optional. To use it, install either [Gotenberg](../02_System_Setup_and_Hosting/06_Additional_Tools_Installation.md#gotenberg) or [LibreOffice](../02_System_Setup_and_Hosting/06_Additional_Tools_Installation.md#libreoffice-pdftotext-inkscape).
