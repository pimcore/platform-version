# Release 2026.1
Here you will find all the important breaking changes, removals, new features and release notes of 
the Platform Version 2026.1 release.
Please also make sure to run all migrations after update as always.

## Unified Platform Versioning

:::info Informational - no action required
Starting with Platform Version 2026.1, all Pimcore repositories follow a unified branch and release naming scheme
aligned with the platform version. Individual per-repository versioning is no longer used. All bundles are now
tagged and maintained under the common `2026.1.*` platform version.

The switch to 2026.1.x is the next logical major release step. For example, the last data-hub release was `2.4.0`;
the next is `2026.1.0`. There will be no `2.*` or `3.*` releases in between.

Subsequent releases follow semantic versioning: `2026.1.1` for the next bug fix, `2026.2.0` for the next minor
release, `2027.1.0` for the next yearly major.
:::

## Most Important Changes

### Pimcore Studio Replaces Admin UI Classic

Admin UI Classic support has been fully removed across all bundles. Pimcore Studio is now the only supported
administration interface. Specifically:

- All ExtJS JavaScript and CSS files have been removed
- All classic admin controllers have been removed
- `PimcoreBundleAdminClassicInterface` implementations and `BundleAdminClassicTrait` have been removed
- Legacy admin event listeners, `AdminSubscriber`, and ACL integrations have been removed
- All bundle configuration and management is now exclusively handled through Pimcore Studio

### Removal of Deprecated Bundles

The following bundles deprecated in Platform Version 2025.4 have been removed.
Remove them from your `composer.json` and clean up any related service configuration.

Functionality now part of Pimcore Studio:
- Advanced Object Search Bundle
- Perspective Editor Bundle
- Simple Backend Search Bundle

Discontinued and completely removed:
- File Explorer Bundle
- Glossary Bundle
- Google Marketing Bundle
- Newsletter Bundle
- SEO Bundle (redirects, robots.txt, and sitemaps remain in the core)
- Static Routes Bundle
- System Info Bundle
- Word Export Bundle
- Output Data Config Toolkit Bundle
- Web2Print Tools Bundle

### PHP and Symfony Version Requirements

- PHP 8.3 support has been removed; PHP 8.4 or 8.5 is now required
- Symfony 6.x support has been removed; Symfony 7.x is now required

### Installer Profile Architecture

The Pimcore installer has been redesigned with a profile-based architecture. The install command format has
changed and now requires the `--install-profile` option. This is a breaking change for any automated
deployment pipelines that invoke the installer directly. See the
[Core Framework upgrade notes](https://github.com/pimcore/pimcore/blob/2026.1/doc/13_Upgrade_Notes/README.md#pimcore-202610)
for the updated command format.

### Database Collation Change

All `utf8mb4` tables and columns now explicitly use `utf8mb4_unicode_520_ci` as their collation. Previously,
no collation was specified, which caused MySQL/MariaDB to apply its own defaults (`utf8mb4_general_ci` on
MySQL 5.7/MariaDB, `utf8mb4_0900_ai_ci` on MySQL 8). This mismatch can cause issues with foreign key
constraints and unexpected sort behavior.
See [01_Migration_Guide.md](01_Migration_Guide.md) for details. 

### Messenger Transport DSN Standardization

The Messenger transport DSN configuration has been standardized across all bundles. The parameter is now
consistently named `%pimcore.messenger.transport_dsn_prefix%` with a trailing separator format. Check the
upgrade notes of each bundle you use for the specific parameter name changes.

## Additional Changes

### Datahub Configuration Schema Changes

**Affected adapters:** Datahub File Export, Datahub Productsup, Datahub Simple REST, Datahub Webhooks.

With the Pimcore Studio integration, we introduced a new architecture for schema definitions of the mentioned Datahub 
adapters. We are moving from the tree-based schema definition (also used in the grid configuration of the Admin Classic UI)
to a pipeline-based approach (also used in Studio UI grids).
This change is driven by technical and maintenance considerations, as the tree-based implementation has limitations in
terms of consistency, flexibility, and extensibility.
The new architecture aligns with how Pimcore Studio UI grids work internally, streamlining the implementation across
adapters and improving consistency, stability, and extensibility.

Existing configurations created in the Classic UI remain functional and continue to execute without changes.
However, a configuration must be fully migrated to the new pipeline-based format before it can be edited in
Pimcore Studio.
Migration must be done manually by following the steps provided in the Pimcore Studio UI.

Read-only support for the legacy tree-based schema definitions will be removed in version 2027.1.0.

All other Datahub configurations (not listed above) are unaffected and can be modified without migration.

### E-Commerce Framework

- **GA4 migration (breaking):** The GoogleTagManager tracker has been updated from Universal Analytics Enhanced 
  Ecommerce to the GA4 ecommerce schema. Event names, data structure, and item field names have all changed. 
  See the upgrade notes for the full mapping.
- Legacy Universal Analytics (`analytics.js`) tracker classes have been removed following Google's sunset of 
  UA in July 2023.
- New `Gtag` tracker added for direct `gtag.js` integration.
- Four new GA4 tracking interfaces added: `ProductSelectInterface`, `CartViewInterface`, `CheckoutShippingInfoInterface`, `CheckoutPaymentInfoInterface`.
- `TrackingManagerInterface` now extends the four new GA4 interfaces - custom implementations must add the new methods.
- `formatPrice()` now returns `?float` instead of `string`; `getCartValue()` now returns `?float` instead of `string`.

### Personalization Bundle

- **Breaking:** The GeoIP2 library has been updated from 2.x to 3.x. The response data structure has changed.
  Update any code that reads GeoIP2 response objects directly to use the v3 API. See the
  [Personalization Bundle upgrade notes](https://github.com/pimcore/ee-personalization-bundle/blob/2026.1/doc/00_Installation/01_Upgrade.md#upgrade-to-202610)
  for migration details.


## Upgrade Notes

Before updating, review the upgrade notes for each component you use:

- [Core Framework](https://github.com/pimcore/pimcore/blob/2026.1/doc/13_Upgrade_Notes/README.md#pimcore-202610)
- [Asset Metadata Class Definitions](https://github.com/pimcore/asset-metadata-class-definitions/blob/2026.1/doc/01_Installation/01_Update.md#upgrade-to-202610)
- [Backend Power Tools](https://github.com/pimcore/backend-power-tools-bundle/blob/2026.1/doc/00_Installation/01_Upgrade.md#upgrade-to-202610)
- [Copilot Bundle](https://github.com/pimcore/copilot-bundle/blob/2026.1/doc/02_Upgrade_Notes/README.md#upgrade-to-202610)
- [Customer Data Framework](https://github.com/pimcore/ee-customer-data-framework/blob/2026.1/doc/02_Installation/01_Update.md#upgrade-to-202610)
- [Datahub](https://github.com/pimcore/data-hub/blob/2026.1/doc/01_Installation_and_Upgrade/01_Upgrade_Notes.md#upgrade-to-202610)
- [Datahub File Export](https://github.com/pimcore/data-hub-file-export/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Datahub Productsup](https://github.com/pimcore/data-hub-productsup/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Datahub Simple REST](https://github.com/pimcore/data-hub-simple-rest/blob/2026.1/doc/01_Installation/01_Upgrade_Notes.md#upgrade-to-202610)
- [Datahub Webhooks](https://github.com/pimcore/data-hub-webhooks/blob/2026.1/doc/01_Installation/02_Upgrade_notes.md#upgrade-to-202610)
- [Data Importer](https://github.com/pimcore/data-importer/blob/2026.1/doc/03_Upgrade.md#upgrade-to-202610)
- [Data Quality Management](https://github.com/pimcore/data-quality-management-bundle/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Direct Edit](https://github.com/pimcore/direct-edit/blob/2026.1/doc/01_Installation/05_Upgrade_notes.md#upgrade-to-202610)
- [E-Commerce Framework](https://github.com/pimcore/ee-ecommerce-framework-bundle/blob/2026.1/doc/19_Upgrade_Notes/README.md#version-202610)
- [Generic Data Index](https://github.com/pimcore/generic-data-index-bundle/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Headless Documents](https://github.com/pimcore/headless-documents/blob/2026.1/doc/01_Installation/01_Upgrade.md#update-to-202610)
- [OpenID Connect](https://github.com/pimcore/openid-connect/blob/2026.1/doc/07_Upgrade_Notes.md#202610)
- [Personalization Bundle](https://github.com/pimcore/ee-personalization-bundle/blob/2026.1/doc/00_Installation/01_Upgrade.md#upgrade-to-202610)
- [Portal Engine](https://github.com/pimcore/portal-engine/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Quill Bundle](https://github.com/pimcore/quill-bundle/blob/2026.1/doc/00_Installation/01_Upgrade.md#upgrade-to-202610)
- [Statistics Explorer](https://github.com/pimcore/statistics-explorer/blob/2026.1/doc/01_Installation_and_Configuration/10_Upgrade.md#upgrade-to-202610)
- [TinyMCE Bundle](https://github.com/pimcore/ee-tinymce-bundle/blob/2026.1/doc/01_Installation/01_Upgrade.md#upgrade-to-202610)
- [Translation Provider Interfaces](https://github.com/pimcore/translations-provider-interfaces/blob/2026.1/doc/01_Installation_and_Configuration/03_Upgrade.md#update-to-202610)
- [Web-to-Print Bundle](https://github.com/pimcore/ee-web-to-print-bundle/blob/2026.1/doc/01_Installation/02_Upgrade.md#upgrade-to-202610)
- [Workflow Automation Integration](https://github.com/pimcore/workflow-automation-integration-bundle/blob/2026.1/doc/03_Upgrade.md#upgrade-to-202610)
- [Workflow Designer](https://github.com/pimcore/workflow-designer/blob/2026.1/doc/03_Upgrade.md#upgrade-to-202610)
