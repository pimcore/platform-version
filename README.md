<p align="center">
  <a href="https://pimcore.com/"><img src="doc/img/logo-readme.svg" alt="Pimcore" width="350"></a>
</p>

<p align="center">
  <strong>Open Core Platform for Product Experience Management (PXM)</strong><br>
  One platform. Any data. Any channel. Any process.
</p>

<p align="center">
  <a href="https://packagist.org/packages/pimcore/pimcore"><img src="https://img.shields.io/packagist/v/pimcore/pimcore.svg" alt="Packagist Version"></a>
  <a href="https://github.com/pimcore/pimcore/blob/2026.x/LICENSE.md"><img src="https://img.shields.io/badge/license-POCL-brightgreen.svg" alt="License: POCL"></a>
  <a href="https://packagist.org/packages/pimcore/pimcore"><img src="https://img.shields.io/packagist/php-v/pimcore/pimcore.svg" alt="PHP Version"></a>
  <a href="https://github.com/pimcore/pimcore/stargazers"><img src="https://img.shields.io/github/stars/pimcore/pimcore.svg?style=social" alt="Stars"></a>
</p>

<p align="center">
  <a href="https://pimcore.com/">Website</a> ·
  <a href="https://docs.pimcore.com/platform/">Documentation</a> ·
  <a href="https://demo.pimcore.com/">Live Demo</a> ·
  <a href="https://www.youtube.com/watch?v=JC8q_6Mu7g0&list=PLrlLr70ddFwLjIkVO8k4vk2rHZ82LwhvF">Pimcore Inside</a> ·
  <a href="https://github.com/orgs/pimcore/discussions">Discussions</a> ·
  <a href="https://github.com/pimcore/platform-version/issues">Report an issue</a>
</p>

---

## What is Pimcore

Pimcore is an open core platform for Product Experience Management (PXM). It provides a solid, API-driven foundation for
managing digital data and customer experience, combining a Core Framework with a modular set of Core Extensions covering
PIM, MDM, DAM, CDP, DXP/CMS, and Digital Commerce — all licensed under the Pimcore Open Core License (POCL). Data is
stored independently of the channel and delivered to any output: websites, commerce systems, mobile apps, print,
digital signage, or headless consumers via REST and GraphQL. [Pimcore Studio](#pimcore-studio) provides the unified
administration interface for the entire platform.

Pimcore ships with rich out-of-the-box functionality and is designed to be fully customizable and extensible. You define
your own data models, build your own templates or consume the APIs, integrate with any IT infrastructure, and tailor
the platform to exact project requirements — from a single standalone implementation to a complex multi-system architecture.

## Features

All data in Pimcore is organized into three core element types that can be linked and related to each other:

- **Data Objects** — manage any structured data based on a class-editor-defined model, either manually or via API.
  Covers products (PIM/MDM), categories, customers (CDP), orders (Digital Commerce), and articles (DXP/CMS).
  Delivers consistent data to multiple output channels from a single source. 
  [Docs](https://docs.pimcore.com/platform/Pimcore/Objects)
- **Assets (DAM)** — store and manage any file type. Preview 200+ formats directly in Pimcore, auto-generate
  channel-specific output formats, and enrich files with metadata and versioning.
  [Docs](https://docs.pimcore.com/platform/Pimcore/Assets)
- **Documents (DXP/CMS)** — build pages with Twig templates and inline editables, with full multilingual and multi-site 
  support, plus emails, newsletters, and web-to-print. [Docs](https://docs.pimcore.com/platform/Pimcore/Documents)

### The Pimcore Platform

Pimcore is modular. Its modules ship as separate Composer packages (Core Modules & Extensions), all licensed under POCL:

- **[Data Onboarding & Distribution](https://docs.pimcore.com/platform/Datahub/)** — Datahub (GraphQL/REST), 
  Data Importer, File Export, Simple REST, Webhooks
- **[Productivity](https://docs.pimcore.com/platform/Backend_Power_Tools/)** — Backend Power Tools, Direct Edit, 
  Workflow Designer
- **[Automation](https://docs.pimcore.com/platform/Copilot/)** — Copilot, Copilot Showcases, Workflow Automation
- **[Portals & Dashboards](https://docs.pimcore.com/platform/Studio_Dashboards/)** — Studio Dashboards, Portal Engine, 
  Statistics Explorer
- **[Advanced Data Management](https://docs.pimcore.com/platform/Headless_Documents/)** — Headless Documents,
  Asset Metadata Class Definitions, Data Quality Management, Web-to-Print, Customer Management Framework
- **[Marketing & Personalization](https://docs.pimcore.com/platform/Targeting/)** — Personalization
- **[Integrations](https://docs.pimcore.com/platform/OpenID_Connect/)** — OpenID Connect, Translation Provider
  Interfaces, Datahub Productsup
- **[E-Commerce Framework](https://docs.pimcore.com/platform/Ecommerce_Framework/)** — catalog, pricing, cart,
  checkout, and order management

See [Pimcore Modules](https://docs.pimcore.com/platform/Pimcore_Platform/Pimcore_Modules/) for the full list and 
[Pimcore Editions](https://docs.pimcore.com/platform/Pimcore_Platform/Pimcore_Editions/) for module availability per 
edition (Community, Professional, Enterprise, PaaS).

## Pimcore Studio

Pimcore Studio is the unified administration interface for the entire platform, available at 
`{your-domain}/pimcore-studio`. It consists of the **Studio Backend** (a fully OpenAPI-documented Symfony REST API for 
all Pimcore operations) and the **Studio UI** (a React SPA built with TypeScript, Ant Design, Redux, RTK Query, and 
Rsbuild). Anything Studio can do is equally accessible via API from custom applications or agents.

For developers, Studio provides a formal plugin architecture and SDK: TypeScript definitions, a Rsbuild plugin for 
structured UI extensions, and a Storybook component library. The 
[Studio Example Bundle](https://github.com/pimcore/studio-example-bundle) provides working reference implementations.

[Studio UI Docs](https://docs.pimcore.com/platform/Studio_UI/) · [Studio Backend Docs](https://docs.pimcore.com/platform/Studio_Backend/)

## Architecture

Pimcore follows a layered architecture where multiple interfaces — the Studio administration UI, 
server-rendered websites, and headless API consumers — all operate on the same core data layer.

**Technology stack:**

- **Backend** — PHP 8.5+, Symfony (MVC, DI, Messenger, Routing, Security)
- **Admin UI** — React, TypeScript, Ant Design, Redux, RTK Query, Mercure, Rsbuild
- **Persistence** — MySQL/MariaDB via Doctrine DBAL for structured data; Flysystem for file storage
  (local, S3, and other adapters)
- **Search & indexing** — OpenSearch or Elasticsearch via the Generic Data Index
- **Cache** — Redis or Symfony Cache
- **Background processing** — Symfony Messenger with a configurable message queue backend
- **Real-time** — Mercure for server-sent events

**Two delivery patterns:**

- **Server-rendered** — Symfony controllers with Twig templates and Pimcore editables for inline content editing; pages 
  are built and rendered by the Pimcore application itself.
- **Headless** — REST and GraphQL APIs via Datahub; Pimcore acts as a pure data and content backend for any frontend or
  external system.

Both patterns can be used alongside each other in the same project.

See the [Architecture documentation](https://docs.pimcore.com/platform/Pimcore_Platform/Pimcore_Architecture/) for full 
details including application layers and the data flow between them.

### Platform Versions

Each module has its own repository and is released independently. The [pimcore/platform-version](https://github.com/pimcore/platform-version) 
package bundles a set of specific module versions that are tested and verified to work together, released as a single 
version such as `2026.1`. Major Platform Versions ship once per year; the documentation and demos are based on Platform 
Versions. Starting with 2026.1, every module carries the same version number as the platform. New projects depend 
on `pimcore/platform-version` by default.

## Quick start

Pimcore 2026.x uses Docker for local development. No local PHP or Composer installation is required.

**Prerequisites:** Docker and Docker Compose installed, and your user must be allowed to run Docker commands and change
file permissions.

### Skeleton (empty project for experienced developers)

```bash
# 1. Create the project
docker run -u `id -u`:`id -g` --rm -v `pwd`:/var/www/html \
  pimcore/pimcore:php8.5-latest \
  composer create-project pimcore/skeleton --no-scripts my-project

# 2. Switch to the project directory
cd my-project/

# 3. Set your user ID in docker-compose.yaml, then start services
#    The skeleton includes PHP, Nginx, MariaDB, and Redis.
#    Add OpenSearch and Mercure manually (required by Pimcore Studio).
docker compose up -d

# 4. Run the installer
docker compose exec php vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile'
```

Open Pimcore Studio at `http://localhost/pimcore-studio`.

### Demo Enterprise (all extensions, pre-built blueprints, requires enterprise credentials)

```bash
# 1. Create the project (replace <YOUR_USERNAME> and <YOUR_TOKEN>)
docker run --rm -v `pwd`:/var/www/html -it pimcore/pimcore:php8.5-latest sh -c \
  'composer --global config repositories.pimcore composer https://repo.pimcore.com/<YOUR_USERNAME>/ ; \
   composer create-project --no-scripts pimcore/demo-enterprise my-project \
   --repository="{\"url\": \"https://token:<YOUR_TOKEN>@repo.pimcore.com/<YOUR_USERNAME>/\", \"type\": \"composer\"}" \
   -n --ignore-platform-req=php --no-scripts'

# 2. Switch to the project directory
cd my-project/

# 3. Start services (all required services are pre-configured in docker-compose.yaml)
docker compose up -d

# 4. Run the installer (requires a valid product key — see Product Registration)
docker compose exec php vendor/bin/pimcore-install \
  --install-profile='App\Installer\DemoEnterpriseProfile'
```

Open the frontend at `http://localhost` and Pimcore Studio at `http://localhost/pimcore-studio`.

See the full [Installation guide](https://docs.pimcore.com/platform/Getting_Started/Installation/) for service
configuration details, non-interactive installs, and production setup.

### Try the live demo

A hosted Enterprise Edition demo is available without any local setup:

- URL: https://demo.pimcore.com/
- Username: `superuser`
- Password: `enterprisedemo`

## Contributing

Code lives in this and the other Pimcore repositories, and pull requests work as they always have.

- **Bug fixes** — open a pull request including step-by-step instructions to reproduce the problem.
- **New features** — open a discussion with the core team before you start developing.
- **Security vulnerabilities** — see our [security policy](https://github.com/pimcore/pimcore/security/policy).

Read the [contributing guide](https://github.com/pimcore/pimcore/blob/2026.x/CONTRIBUTING.md) before submitting a pull
request. Contributions require accepting the [CLA](https://github.com/pimcore/pimcore/blob/2026.x/CLA.md).

### Reporting issues

Issue reporting for all Pimcore repositories is centralized.

- **Public issues** — open them in [pimcore/platform-version/issues](https://github.com/pimcore/platform-version/issues),
  not in individual repositories. This gives the community and maintainers one place to track, prioritize, and resolve
  them.
- **Private / customer-specific issues** — Pimcore partners and customers can use the
  [Enterprise Portal](https://get.support.pimcore.com) for non-public information.

Both paths are handled with the same priority; only the visibility differs.

## Community & support

- [GitHub Discussions](https://github.com/orgs/pimcore/discussions) — questions, ideas, and announcements
- [Documentation](https://docs.pimcore.com/platform/) — guides and API reference
- [Pimcore Academy](https://pimcore.com/en/resources/learning-hub) — tutorials and certification
- [Pimcore Inside](https://www.youtube.com/watch?v=JC8q_6Mu7g0&list=PLrlLr70ddFwLjIkVO8k4vk2rHZ82LwhvF) — weekly 5-9 min
  episodes covering new features and product insights straight from the team

## License

Pimcore is licensed under the [Pimcore Open Core License (POCL)](https://github.com/pimcore/pimcore/blob/2026.x/LICENSE.md).

Copyright Pimcore GmbH.
