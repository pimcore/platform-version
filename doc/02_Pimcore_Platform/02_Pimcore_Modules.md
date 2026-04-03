# Pimcore Modules

Pimcore's functionality is organized into modules, each distributed as a separate Composer package.
All Pimcore source code is licensed under the Pimcore Open Core License (POCL).
For details on which modules are included in each edition, see [Pimcore Editions](./03_Pimcore_Editions.md).

## Pimcore Core

| Module | Description |
|--------|-------------|
| [Pimcore Core Framework](https://github.com/pimcore/pimcore/blob/2026.x/doc/README.md) | Core framework providing Documents, Data Objects, Assets, and all foundational services |
| [Studio Backend](https://github.com/pimcore/studio-backend-bundle/blob/1.x/doc/README.md) | Central hub for API endpoints, providing a unified interface based on OpenAPI for all backend operations |
| [Studio UI](https://github.com/pimcore/studio-ui-bundle/blob/1.x/doc/README.md) | Administration interface for Pimcore, built on React and relying on the Studio Backend API |
| [Generic Data Index](https://github.com/pimcore/generic-data-index-bundle/blob/2026.x/doc/README.md) | Centralized indexing and search for Assets, Data Objects, and Documents via OpenSearch or Elasticsearch |
| [Quill Editor](https://github.com/pimcore/quill-bundle/blob/2026.x/doc/README.md) | Quill 2.x WYSIWYG editor integration for Documents, Data Objects, and Shared Translations |
| [TinyMCE Editor](https://github.com/pimcore/ee-tinymce-bundle/blob/2026.x/doc/README.md) | TinyMCE WYSIWYG editor integration for Documents, Data Objects, and Shared Translations |

## Data Onboarding & Distribution

| Module | Description |
|--------|-------------|
| [Datahub](https://github.com/pimcore/data-hub/blob/2026.x/doc/README.md) | Data delivery and consumption platform integrating different input and output channel technologies into a configurable system |
| [Data Importer](https://github.com/pimcore/data-importer/blob/2026.x/doc/README.md) | No-code data import from CSV, XLSX, JSON, and XML sources into Pimcore Data Objects via configurable mappings |
| [Datahub File Export](https://github.com/pimcore/data-hub-file-export/blob/2026.x/doc/README.md) | Automated publishing of Pimcore data to CSV, XML, or JSON files via Datahub configurations |
| [Datahub Simple REST](https://github.com/pimcore/data-hub-simple-rest/blob/2026.x/doc/README.md) | Read-only REST API for Assets and Data Objects, indexed in OpenSearch/Elasticsearch for query performance and scalability |
| [Datahub Webhooks](https://github.com/pimcore/data-hub-webhooks/blob/2026.x/doc/README.md) | Webhook notifications for events on Assets, Documents, Data Objects, and workflows, allowing external systems to subscribe to Pimcore events |

## Productivity

| Module | Description |
|--------|-------------|
| [Backend Power Tools](https://github.com/pimcore/backend-power-tools-bundle/blob/2026.x/doc/README.md) | Bulk editing, batch operations, and productivity tools for managing large datasets in Pimcore Studio |
| [Direct Edit](https://github.com/pimcore/direct-edit/blob/2026.x/doc/README.md) | Edit Pimcore Assets locally in a preferred editor and upload changes directly back to Pimcore |
| [Workflow Designer](https://github.com/pimcore/workflow-designer/blob/2026.x/doc/README.md) | Visual designer for the Pimcore workflow engine |

## Automation

| Module | Description |
|--------|-------------|
| [Copilot](https://github.com/pimcore/copilot-bundle/blob/2026.x/doc/README.md) | LLM-based assistant for executing actions within Pimcore, automating tasks like content generation, translation, and data enrichment |
| [Copilot Showcases](https://github.com/pimcore/copilot-showcase-bundle/blob/2026.x/doc/README.md) | Collection of action steps and examples demonstrating Pimcore Copilot capabilities |
| [Workflow Automation](https://github.com/pimcore/workflow-automation-integration-bundle/blob/2026.x/doc/README.md) | Export Datahub configuration blueprints to workflow automation engines like n8n |

## Portals & Dashboards

| Module | Description |
|--------|-------------|
| [Studio Dashboards](https://github.com/pimcore/studio-dashboards-bundle/blob/1.x/doc/README.md) | Configurable dashboards with widgets for data visualization and KPIs |
| [Portal Engine](https://github.com/pimcore/portal-engine/blob/2026.x/doc/README.md) | Configurable Asset and Product Experience Portals for external sharing and collaboration |
| [Statistics Explorer](https://github.com/pimcore/statistics-explorer/blob/2026.x/doc/README.md) | Statistics tool for data exploration and report creation, integrated into Pimcore |

## Advanced Data Management

| Module | Description |
|--------|-------------|
| [Headless Documents](https://github.com/pimcore/headless-documents/blob/2026.x/doc/README.md) | Headless document management with content accessible via Datahub endpoints for frontend applications |
| [Asset Metadata Class Definitions](https://github.com/pimcore/asset-metadata-class-definitions/blob/2026.x/doc/README.md) | Class-based metadata schemas for Assets, configured similarly to Data Object class definitions |
| [Data Quality Management](https://github.com/pimcore/data-quality-management-bundle/blob/2026.x/doc/README.md) | Data quality tracking and visualization with configurable rules |
| [Web-to-Print](https://github.com/pimcore/ee-web-to-print-bundle/blob/2026.x/doc/README.md) | Web-to-print document creation and PDF conversion |
| [Customer Management Framework](https://github.com/pimcore/ee-customer-data-framework/blob/2026.x/doc/README.md) | Customer data management with segmentation, activity tracking, and marketing automation |

## Marketing & Personalization

| Module | Description |
|--------|-------------|
| [Personalization](https://github.com/pimcore/ee-personalization-bundle/blob/2026.x/doc/README.md) | Behavioral targeting and personalization engine for visitor profiling and targeted content delivery |

## Integrations

| Module | Description |
|--------|-------------|
| [OpenID Connect](https://github.com/pimcore/openid-connect/blob/2026.x/doc/README.md) | SSO for Pimcore backend login via OpenID Connect providers |
| [Translation Provider Interfaces](https://github.com/pimcore/translations-provider-interfaces/blob/2026.x/doc/README.md) | Translation jobs sent to external translation APIs for processing |
| [Datahub Productsup](https://github.com/pimcore/data-hub-productsup/blob/2026.x/doc/README.md) | Integration with Productsup for product data syndication to marketplaces and marketing channels |

## E-Commerce

| Module | Description |
|--------|-------------|
| [E-Commerce Framework](https://github.com/pimcore/ee-ecommerce-framework-bundle/blob/2026.x/doc/README.md) | E-commerce framework handling product structures, pricing, availability, and customer groups |
