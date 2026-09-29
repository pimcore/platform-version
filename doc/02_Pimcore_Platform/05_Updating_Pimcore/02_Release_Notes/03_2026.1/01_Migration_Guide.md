# Migration Guide: Pimcore 2026.1

This guide walks through the steps required to migrate an existing Pimcore installation to Platform Version
2026.1. It covers the 2026.1-specific tasks in the sequence they must be performed.

For the general major version upgrade process and background on each phase, see
[Major Version Upgrades](../../03_Major_Version_Upgrades.md).

## Migration Steps

### 1. Update to the Latest 2025.4 Release

Start from the latest available bugfix release of 2025.4. This ensures all deprecation notices and
preparatory changes from the 2025 cycle are in place.

```bash
composer require pimcore/platform-version:"^2025.4" --no-update
COMPOSER_MEMORY_LIMIT=-1 composer update
bin/console doctrine:migrations:migrate
```

### 2. Install Pimcore Studio (if not already done)

2026.1 removes Admin UI Classic entirely. Pimcore Studio must be installed and fully functional before you
upgrade. If Studio is already active in your installation, verify it works correctly and skip to Step 3.
See the [Studio UI installation guide](../../../../03_Getting_Started/01_Installation/03_Advanced_Installation_Topics/02_Pimcore_Studio_Setup.md)
for the full setup guide.

After installation, log into Pimcore Studio and verify it works correctly on 2025.4 before proceeding.

### 3. Resolve All Deprecations

Check for deprecation notices before upgrading:

- **Symfony deprecation log** - `var/log/dev.deprecations.log` or the profiler toolbar in dev mode
- **Code** - search for `@deprecated` usages in your codebase and custom bundles
- **Pimcore Studio** - some deprecations surface as warnings in the UI

Resolve everything you can. For deprecations that depend on third-party bundles, verify those bundles have a
compatible release for 2026.1 before proceeding.

### 4. Back Up

Create a full backup of your database and project files. If the upgrade fails, restore the backup, revert
`composer.lock`, and run `composer install` to return to the previous state.

### 5. Remove Deprecated Bundles from composer.json

The following bundles are removed in 2026.1. Remove them from `composer.json` and clean up any related
service configuration, event listeners, and references in your code. Do not run `composer update` yet -
that happens in Step 9.

Functionality now part of Pimcore Studio:
- `pimcore/advanced-object-search-bundle`
- `pimcore/perspective-editor`
- `pimcore/simple-backend-search-bundle`

Discontinued:
- `pimcore/file-explorer-bundle`
- `pimcore/glossary-bundle`
- `pimcore/google-marketing-bundle`
- `pimcore/newsletter-bundle`
- `pimcore/seo-bundle` (redirects, robots.txt, and sitemaps remain in the core)
- `pimcore/static-routes-bundle`
- `pimcore/system-info-bundle`
- `pimcore/word-export-bundle`
- `pimcore/output-data-config-toolkit`
- `pimcore/web2print-tools`

### 6. Update PHP and Symfony Version Constraints

PHP 8.3 and Symfony 6.x support have been removed.

- Ensure your server runs **PHP 8.4 or 8.5**
- Remove any explicit Symfony 6.x version constraints from `composer.json`

Do not run `composer update` yet. The update to Symfony 7.x happens as part of Step 9.

### 7. Migrate Email Log Folder Structure

The folder structure for email logs has changed to `YYYY/MM/DD/<filename>`. Run this migration against your
current 2025.4 installation before upgrading:

```bash
bin/console pimcore:migrate:mail-logs-folder-structure
```

Alternatively, move the existing log files manually into the new directory structure.

### 8. Fix Database Collation

2026.1 explicitly sets `utf8mb4_unicode_520_ci` on all `utf8mb4` tables and columns. Previous versions did
not specify a collation, so MySQL/MariaDB applied its own default (`utf8mb4_general_ci` on MySQL 5.7/MariaDB,
`utf8mb4_0900_ai_ci` on MySQL 8). The mismatch can cause foreign key constraint errors during the migrations
in Step 11.

This is **not** handled by the standard Doctrine migration - run it manually before upgrading.

**1. Generate ALTER TABLE statements.** Run the query below to produce the statements for all affected
tables. Copy the output.

```sql
SELECT CONCAT(
  'ALTER TABLE `', TABLE_NAME,
  '` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;'
)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'your_database_name'
  AND TABLE_TYPE = 'BASE TABLE'
  AND TABLE_COLLATION IN ('utf8mb4_general_ci', 'utf8mb4_0900_ai_ci')
ORDER BY TABLE_NAME;
```

**2. Safety check.** Before executing, verify that no `utf8mb4_bin` columns (used for case-sensitive
keys and JSON data) appear in the results. Those must not be changed.

```sql
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLLATION_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'your_database_name'
  AND COLLATION_NAME IN ('utf8mb4_general_ci', 'utf8mb4_0900_ai_ci')
ORDER BY TABLE_NAME, COLUMN_NAME;
```

**3. Execute.** Run the `ALTER TABLE` statements generated above against your database.

### 9. Update to 2026.1

```bash
composer require pimcore/platform-version:"^2026.1" --no-update
COMPOSER_MEMORY_LIMIT=-1 composer update
```

Do not run migrations yet.

### 10. Apply Code Changes

Apply the following breaking changes to your codebase:

- Remove any remaining references to removed bundles or Admin Classic interfaces
  (`PimcoreBundleAdminClassicInterface`, `BundleAdminClassicTrait`, `AdminSubscriber`, etc.)
- Update the Messenger transport DSN: rename `PIMCORE_MESSENGER_TRANSPORT_DSN` to
  `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` and add a trailing separator
  (e.g. `doctrine://default` becomes `doctrine://default?queue_name=`).
  This affects both your `.env` files and any deployment configuration (secrets managers, Kubernetes, etc.)
  where this variable is set.
- Update OpenSearch/Elasticsearch configuration from the `hosts` array YAML format to the DSN env var format
  (`PIMCORE_OPENSEARCH_DSN` or `PIMCORE_ELASTICSEARCH_DSN`)
- If you use the Pimcore installer in CI/CD pipelines, update from `bin/console pimcore:install` to
  `vendor/bin/pimcore-install --install-profile=<YourProfileClass>`

Review the [Core Framework upgrade notes](https://github.com/pimcore/pimcore/blob/2026.1/doc/13_Upgrade_Notes/README.md#pimcore-202610)
and the upgrade notes of each bundle you use (see [All Bundle Upgrade Notes](README.md#upgrade-notes)).

Clear the Symfony container cache after applying changes:

```bash
bin/console cache:clear
```

### 11. Run Migrations

```bash
bin/console doctrine:migrations:migrate
```

### 12. Rebuild Class Definitions

After migrations, rebuild the object class definitions to ensure all generated PHP classes reflect the
current state:

```bash
bin/console pimcore:deployment:classes-rebuild
```

### 13. Clear Application Caches

```bash
bin/console pimcore:cache:clear
```

### 14. Test

- Log into Pimcore Studio and verify data objects, assets, and documents load and save correctly
- Run your automated test suite
- Verify custom bundles, integrations, and event listeners
- Check functionality related to resolved deprecations

## Post-Upgrade Manual Work

The following cannot be handled by Composer or migrations. Plan time for these after the upgrade is complete.

### Perspectives and Custom Views

From a functional standpoint, perspectives and custom views serve the same purpose in Pimcore Studio as in
the Classic UI. The technical implementation is entirely different, however. Existing perspectives and custom
views cannot be imported or automatically converted - they must be recreated in Pimcore Studio.

### Dashboards

Dashboards created in the Classic UI are not compatible with Pimcore Studio and must be recreated. Reports
used within dashboards are unaffected and continue to work without migration.

### Custom Grid Configurations

The technical implementation of grid configurations has changed completely. All existing custom grid
configurations must be rebuilt in Pimcore Studio - including globally defined configurations and user-level
configurations. Custom grid operators must also be reviewed and updated for compatibility with the new
grid architecture.

### Datahub Configuration Schema Migration

Datahub File Export, Datahub Productsup, Datahub Simple REST, and Datahub Webhooks have moved from a
tree-based schema definition to a pipeline-based architecture. Existing configurations continue to execute
without changes. However, a configuration must be fully migrated to the new format before it can be edited
in Pimcore Studio. Migration is done through the Pimcore Studio UI.

Read-only support for the legacy tree-based schema definition will be removed in 2027.1.0.
See the [Release Notes](README.md#datahub-configuration-schema-changes) and the upgrade notes of the
affected bundles for details.

### Custom Bundles and Backend Extensions

Custom bundles, event listeners, service definitions, and integrations must all be reviewed. Pay particular
attention to:

- Admin Classic UI extensions, plugins, and custom controllers - removed, must be reimplemented for
  Pimcore Studio if still needed
- Custom grid operators - review for compatibility with the new pipeline-based grid architecture
- Event listeners referencing removed classes (`AdminSubscriber`,
  `PimcoreBundleAdminClassicInterface`, etc.)
- Any code that depends on the removed bundles listed in Step 5

Test all custom functionality in a staging environment before going live.

## Further Resources

- [Release Notes for 2026.1](README.md)
- [Major Version Upgrades](../../03_Major_Version_Upgrades.md)
- [Core Framework Upgrade Notes](https://github.com/pimcore/pimcore/blob/2026.1/doc/13_Upgrade_Notes/README.md#pimcore-202610)
- [All Bundle Upgrade Notes](README.md#upgrade-notes)
