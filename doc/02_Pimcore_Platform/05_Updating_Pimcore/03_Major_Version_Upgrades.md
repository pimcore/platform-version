# Major Version Upgrades

Upgrading between major Platform Versions (e.g., 2025.x to 2026.x) requires more care than regular updates.
Major versions may remove previously deprecated features and introduce breaking changes to public APIs.

Follow these steps to minimize risk and downtime.
Perform the upgrade on a staging or development environment first and verify before applying to production.

## 1. Update to the Latest Release of Your Current Major Version

Before upgrading to a new major version,
make sure you are running the latest available release in your current major version.
Check the [Release Notes](./02_Release_Notes/README.md) or Composer to find the highest available minor version.

For example, when upgrading from 2025.x to 2026.1:
- First update to the latest bugfix release of 2025.4 (the last minor in the 2025 cycle).
- This ensures you have all the latest deprecation notices and preparatory changes in place.

```bash
composer require pimcore/platform-version:2025.4 --no-update
COMPOSER_MEMORY_LIMIT=-1 composer update
bin/console doctrine:migrations:migrate
```

## 2. Resolve Deprecations

Check for deprecation notices in all available channels:

- **Logs** - Review your Symfony deprecation log (`var/log/dev.deprecations.log` or the profiler toolbar in dev mode).
- **Code** - Search your codebase for usages of methods, classes, or configuration options marked as `@deprecated`.
- **Pimcore Studio** - Some deprecations surface as warnings in the administration interface.

Resolve all deprecations before upgrading.
If a deprecation cannot be resolved immediately (e.g., because it depends on a third-party bundle),
document it and keep it in mind for later.

Also verify that all third-party bundles you depend on support the target major version.

## 3. Back Up Database and Files

Create a full backup of your database and project files before proceeding.
If the upgrade fails, restore the backup, revert `composer.lock`, and run `composer install` to return to your previous state.

## 4. Read the Upgrade Notes

Review the [Release Notes](./02_Release_Notes/README.md) for the target major version.
Upgrade notes may contain required manual steps. Some must be completed before updating, others after.
Watch for:

- Configuration changes
- Required data migrations
- Removed or replaced features
- Changes to system requirements (PHP version, database version, etc.)

## 5. Update to the New Major Version via Composer

```bash
composer require pimcore/platform-version:2026.1 --no-update
COMPOSER_MEMORY_LIMIT=-1 composer update
```

Do not run migrations yet - complete Steps 6 and 7 first.

## 6. Apply Required Changes from Upgrade Notes

Work through the post-upgrade steps described in the release notes:

- Fix backward compatibility breaks in your application code.
- Rebuild the Symfony container to pick up changed service definitions and configurations:
  ```bash
  bin/console cache:clear
  ```

## 7. Clear Data Caches

Clear Pimcore's application-level data caches (output cache, thumbnails, etc.).
These are separate from the Symfony container cache cleared in the previous step.

```bash
bin/console pimcore:cache:clear
```

## 8. Run Migrations

Execute all pending database migrations:

```bash
bin/console doctrine:migrations:migrate
```

## 9. Test Your System

Verify that your application works correctly after the upgrade:

- Log into Pimcore Studio and confirm that data objects, assets, and documents load and save correctly.
- Run your automated test suite if available.
- Verify custom bundles and integrations.
- Test functionality that was related to resolved deprecations.
