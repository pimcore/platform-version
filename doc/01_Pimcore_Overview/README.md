# Pimcore Overview

Pimcore is an open-core platform for Product Experience Management (PXM), built on PHP and the Symfony framework. It combines data management and experience management in a single system — covering product information, master data, digital assets, customer data, content management, and digital commerce.

PXM is a category that extends beyond classic PIM. Where PIM focuses on collecting and maintaining product data, PXM adds the delivery, activation, and optimization of that data across all channels — websites, apps, marketplaces, print, and more. Pimcore integrates the required capabilities (PIM, DAM, CMS, Commerce, CDP) into one platform rather than requiring separate tools for each.

![Pimcore Domains — Data Management (PIM, MDM, DAM, CDP) and Experience Management (DXP, CMS, eCommerce)](img/pimcore-domains.png)


## The Six Domains

Pimcore's capabilities are organized into **Data Management** and **Experience Management**.

### Data Management

| Domain | What It Does |
|--------|-------------|
| **PIM** — Product Information Management | Central repository for structured product data. Manage attributes, descriptions, translations, and relationships across all channels. |
| **MDM** — Master Data Management | Manage non-product entities such as suppliers, locations, or organizational units — any business entity that needs a single source of truth. |
| **DAM** — Digital Asset Management | Store, organize, and distribute digital files — images, videos, PDFs, Office documents. Supports file type previews, automatic thumbnail generation, metadata, and version control. |
| **CDP** — Customer Data Platform | Collect and unify customer data from multiple sources into consolidated customer profiles. Enables segmentation, behavioral tracking, and personalized experiences. |

### Experience Management

| Domain | What It Does |
|--------|-------------|
| **DXP/CMS** — Digital Experience Platform | Create and manage websites, landing pages, and multi-site/multi-language setups using Twig templates with full frontend flexibility. |
| **Digital Commerce** | B2C and B2B online shops, product configurators, and integration with external sales channels — tightly integrated with PIM and DAM. |

All domains share the same data foundation, administration interface (Pimcore Studio), and permission system. You don't need to implement all domains at once — start with one (e.g., PIM) and extend into others as requirements grow.


## Core Data Elements

All six domains are built on three shared data types: **Data Objects** (structured data), **Assets** (digital files), and **Documents** (page-based content). Because they exist in the same system, they are natively connected and can reference each other across domains.

For a detailed look at each data type and their shared capabilities, see [Pimcore Data Elements](./03_Pimcore_Data_Elements.md). For an introduction to the administration interface, see [Pimcore Studio](02_Pimcore_UI.md).


## Any Channel

Pimcore stores data independently from its output channel. Once data is modeled and managed in Pimcore, it can be delivered to any target:

- **Websites and web applications** — rendered server-side via Pimcore's built-in CMS or delivered headlessly to decoupled frontends
- **Mobile apps** — via REST or GraphQL APIs
- **Commerce platforms** — through the integrated E-Commerce Framework or by feeding data to third-party systems
- **Marketplaces** — syndicate product data to channels like Amazon or other external platforms
- **Print and catalogs** — generate print-ready output using web-to-print capabilities
- **Digital signage, POS, and kiosks** — any system that can consume structured data via APIs
- **Internal systems** — ERP, CRM, or other enterprise systems via import/export or real-time integrations

This channel-independence is a direct consequence of the unified data model — the same product data, assets, and content serve all channels without channel-specific data copies.


## Any Process

Beyond delivering data to channels, Pimcore supports complex business processes within the same system:

- **Data enrichment workflows** — for example, a product manager fills in attributes, a translator localizes them, and a reviewer approves for publication — all tracked through configurable states, transitions, and notifications
- **Automated data pipelines** — scheduled imports, exports, and transformations between Pimcore and external systems
- **Event-driven automation** — trigger actions based on data changes, combined with external automation tools for cross-system orchestration

These channel- and process-agnostic capabilities are what make Pimcore a PXM platform rather than a standalone PIM.


## Open Core and Editions

Pimcore follows an open-core model. A substantial set of components — the core framework and numerous extensions — is freely available under the GPLv3 license. Enterprise editions add advanced modules (such as workflow designer, portal engine, or AI-powered features) under a commercial license.

For details on available modules and editions, see [Pimcore Platform](../02_Pimcore_Platform/README.md).


## Configurability and Extensibility

### Without Code

Pimcore provides substantial functionality that can be configured through Pimcore Studio — enough to build production-ready solutions for many use cases without writing custom code:

- Data model definition via the class editor
- Workflow management with configurable states, transitions, and actions
- User and role management with granular, element-level permissions
- Import/export configurations
- Perspectives and custom views for role-specific admin layouts

### With Code

For use cases beyond configuration, Pimcore is fully extensible:

- Custom Symfony bundles and Pimcore bundles
- Event listeners for hooking into any core process
- Custom API endpoints
- Custom data types and Pimcore Studio extensions (plugin architecture)
- Access to the full Symfony ecosystem and any PHP library via Composer


## What's Next

- **[Pimcore Platform](../02_Pimcore_Platform/README.md)** — Architecture, available modules, and commercial editions
- **[Getting Started](../03_Getting_Started/README.md)** — Installation, system requirements, and building your first project
