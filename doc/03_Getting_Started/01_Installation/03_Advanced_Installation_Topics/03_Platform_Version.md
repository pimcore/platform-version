# Platform Version

The Pimcore Platform Version is a Composer meta-package (`pimcore/platform-version`) that ensures all Pimcore modules in a project use compatible versions. It does not install additional code. Instead, it defines version constraints (via Composer `conflict` rules) that prevent incompatible combinations of Pimcore packages.

## Setup

Both the `pimcore/skeleton` and `pimcore/demo-enterprise` installation packages include `pimcore/platform-version` as a default dependency. No additional setup is needed for new projects.

### Adding to an Existing Project

To add the platform version to an existing Pimcore project that does not yet use it:

```bash
docker compose exec php composer require pimcore/platform-version
```

Composer may require you to adjust versions of other Pimcore packages to satisfy the constraints defined by the platform version. Follow the instructions provided by Composer to resolve any conflicts.

## Installing Additional Pimcore Modules

With the platform version in place, install additional Pimcore modules using `composer require`:

```bash
docker compose exec php composer require pimcore/<module-name>
```

Composer automatically resolves a version that is compatible with your platform version.

:::tip

If Composer cannot find a matching version, try adding `:*` as the version constraint:

```bash
docker compose exec php composer require pimcore/<module-name>:*
```

:::

## Updating

### Bugfix Updates

Bugfix versions of Pimcore modules are released within a platform version. A standard `composer update` installs the latest compatible bugfix versions of all Pimcore packages:

```bash
docker compose exec php composer update
```

### Updating to a New Platform Version

Before updating, read the [Release Notes](../../README.md) for the target version.

To update to a specific platform version:

```bash
docker compose exec php composer require pimcore/platform-version:2026.2 --no-update
docker compose exec php composer update
```

To update to the latest platform version (if the version constraint in `composer.json` allows it):

```bash
docker compose exec php composer update pimcore/platform-version
```

:::tip

If Composer has trouble resolving Pimcore package versions, add `pimcore/*` to the update command:

```bash
docker compose exec php composer update pimcore/platform-version pimcore/*
```

:::

:::caution

The `pimcore/platform-version` package does not specify required packages, only conflicting ones. This means `composer require pimcore/platform-version --update-with-all-dependencies` will not work as expected. Always use `composer update` as a separate step to apply the new version constraints.

:::

:::warning

In rare cases, you may need to update a specific Pimcore module to a version outside the range defined by the platform version. To do this, remove `pimcore/platform-version` from your `composer.json` and update the module individually. Be aware that this results in a potentially untested combination of Pimcore modules.

:::
