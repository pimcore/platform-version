# Updating Pimcore

Pimcore modules are distributed as Composer packages. Updates are managed through Composer's dependency resolution, with the Platform Version providing a tested set of compatible module versions.

## Update Process

1. **Read the release notes** for the target Platform Version. Check for breaking changes, required migration steps, and deprecated features. See [Release Notes](./02_Release_Notes/README.md).

2. **Back up your database and files** before proceeding with the update.

3. **Update the Platform Version constraint** using one of the following approaches:

   **Option A** - Update to a specific version, then run a full update:
   ```bash
   composer require pimcore/platform-version:2026.1 --no-update
   COMPOSER_MEMORY_LIMIT=-1 composer update
   ```

   **Option B** - If your existing version constraint already allows the target version:
   ```bash
   COMPOSER_MEMORY_LIMIT=-1 composer update
   ```

   :::tip

   If Composer has trouble resolving Pimcore package versions, add `pimcore/*` to the update command:

   ```bash
   COMPOSER_MEMORY_LIMIT=-1 composer update pimcore/platform-version pimcore/*
   ```

   :::

4. **Clear caches**:
   ```bash
   bin/console pimcore:cache:clear
   ```

5. **Run database migrations**:
   ```bash
   bin/console doctrine:migrations:migrate
   ```
   Doctrine migrations are the only migration mechanism in Pimcore. They handle database schema changes, class definition updates, and structural changes. They do not modify custom application code.

## Bugfix Updates Within a Platform Version

Bugfix releases of individual modules can be installed without changing the Platform Version. Running `composer update` pulls the latest compatible bugfix versions for all installed Pimcore modules within the constraints of your current Platform Version.

## Updating Without Platform Version

If you manage module versions individually rather than through the Platform Version, update each package's version constraint in `composer.json` separately. Be aware that this approach requires manual compatibility verification between modules.

:::warning

In rare cases, you may need to update a specific Pimcore module to a version outside the range defined by the platform version. To do this, remove `pimcore/platform-version` from your `composer.json` and update the module individually. Be aware that this results in a potentially untested combination of Pimcore modules.

:::

:::caution

The `pimcore/platform-version` package uses `conflict` constraints rather than `require`. This allows you to install only the modules you need while still ensuring version compatibility. As a consequence, `composer require pimcore/platform-version --update-with-all-dependencies` will not pull in module updates. Always use `composer update` after changing the Platform Version constraint.

:::
