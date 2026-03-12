# Pimcore Modules

Pimcore's functionality is organized into modules, each distributed as a separate Composer package. All Pimcore source code is licensed under the Pimcore Open Core License (POCL). For details on which modules are included in each edition, see [Pimcore Editions](./03_Pimcore_Editions.md).

## Pimcore Core

| Module | Description |
|--------|-------------|
| [Pimcore Core Framework](../../Pimcore/) | Core framework providing Documents, Data Objects, Assets, and all foundational services |
| [Studio Backend](../../Studio_Backend/) | Central hub for API endpoints, providing a unified interface based on OpenAPI for all backend operations |
| [Studio UI](../../Studio_UI/) | Backend UI for Pimcore, built on React and relying on the Studio Backend API |
| [Generic Data Index](../../Generic_Data_Index/) | Centralized indexing and search for Assets, Data Objects, and Documents via OpenSearch or Elasticsearch |
| [Quill Editor](../../Quill_WYSWIYG_Editor/) | Quill 2.x WYSIWYG editor integration for Documents, Data Objects, and Shared Translations |
| [TinyMCE Editor](../../TinyMCE_WYSWIYG_Editor/) | TinyMCE WYSIWYG editor integration for Documents, Data Objects, and Shared Translations |

## Data Onboarding & Distribution

| Module | Description |
|--------|-------------|
| [Datahub](../../Datahub/) | Data delivery and consumption platform integrating different input and output channel technologies into a configurable system |
| [Data Importer](../../Data_Importer/) | No-code data import from CSV, XLSX, JSON, and XML sources into Pimcore Data Objects via configurable mappings |
| [Datahub File Export](../../Datahub_File_Export/) | Automated publishing of Pimcore data to CSV, XML, or JSON files via Datahub configurations |
| [Datahub Simple REST](../../Datahub_Simple_Rest/) | Read-only REST API for Assets and Data Objects, indexed in OpenSearch/Elasticsearch for query performance and scalability |
| [Datahub Webhooks](../../Datahub_Webhooks/) | Webhook notifications for events on Assets, Documents, Data Objects, and workflows, allowing external systems to subscribe to Pimcore events |

## Productivity

| Module | Description |
|--------|-------------|
| [Backend Power Tools](../../Backend_Power_Tools/) | Bulk editing, batch operations, and productivity tools for managing large datasets in Pimcore Studio |
| [Direct Edit](../../Direct_Edit/) | Edit Pimcore Assets locally in a preferred editor and upload changes directly back to Pimcore |
| [Workflow Designer](../../Worfklow_Designer/) | Visual designer for the Pimcore workflow engine |

## Automation

| Module | Description |
|--------|-------------|
| [Copilot](../../Copilot/) | LLM-based assistant for executing actions within Pimcore, automating tasks like content generation, translation, and data enrichment |
| [Copilot Showcases](../../Copilot_Showcases/) | Collection of action steps and examples demonstrating Pimcore Copilot capabilities |
| [Workflow Automation](../../Workflow_Automation/) | Export Datahub configuration blueprints to workflow automation engines like n8n |

## Portals & Dashboards

| Module | Description |
|--------|-------------|
| [Studio Dashboards](../../Studio_Dashboards/) | Configurable dashboards with widgets for data visualization and KPIs |
| [Portal Engine](../../Portal_Engine/) | Configurable Asset and Product Experience Portals for external sharing and collaboration |
| [Statistics Explorer](../../Statistics_Explorer/) | Statistics tool for data exploration and report creation, integrated into Pimcore |

## Advanced Data Management

| Module | Description |
|--------|-------------|
| [Headless Documents](../../Headless_Documents/) | Headless document management with content accessible via Datahub endpoints for frontend applications |
| [Asset Metadata Class Definitions](../../Enterprise_Metadata/) | Class-based metadata schemas for Assets, configured similarly to Data Object class definitions |
| [Data Quality Management](../../Data_Quality_Management/) | Data quality tracking and visualization with configurable rules |
| [Web-to-Print](../../Web_To_Print/) | Web-to-print document creation and PDF conversion |
| [Customer Management Framework](../../Customer_Management_Framework/) | Customer data management with segmentation, activity tracking, and marketing automation |

## Marketing & Personalization

| Module | Description |
|--------|-------------|
| [Personalization](../../Targeting/) | Behavioral targeting and personalization engine for visitor profiling and targeted content delivery |

## Integrations

| Module | Description |
|--------|-------------|
| [OpenID Connect](../../OpenID_Connect/) | SSO for Pimcore backend login via OpenID Connect providers |
| [Translation Provider Interfaces](../../Translation_Provider_Interfaces/) | Translation jobs sent to external translation APIs for processing |
| [Datahub Productsup](../../Datahub_Productsup/) | Integration with Productsup for product data syndication to marketplaces and marketing channels |

## E-Commerce

| Module | Description |
|--------|-------------|
| [E-Commerce Framework](../../Ecommerce_Framework/) | E-commerce framework handling product structures, pricing, availability, and customer groups |
