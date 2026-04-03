# Platform Version

The Pimcore Platform Version is a Composer meta-package (`pimcore/platform-version`)
that ensures all Pimcore modules in a project use compatible versions.
It does not install additional code.
Instead, it defines version constraints (via Composer `conflict` rules)
that prevent incompatible combinations of Pimcore packages.

Both the `pimcore/skeleton` and `pimcore/demo-enterprise` installation packages include
`pimcore/platform-version` as a default dependency. No additional setup is needed for new projects.

## Adding to an Existing Project

To add the platform version to an existing Pimcore project that does not yet use it:

```bash
docker compose exec php composer require pimcore/platform-version
```

Composer may require you to adjust versions of other Pimcore packages to satisfy the constraints
defined by the platform version.
Follow the instructions provided by Composer to resolve any conflicts.

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

For updating to new platform versions (including bugfix updates, major version upgrades, and migration steps),
see [Updating Pimcore](../../../02_Pimcore_Platform/05_Updating_Pimcore/README.md).
