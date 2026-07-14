# Installation

Pimcore 2026.x uses Docker for local development and installation.
You do not need PHP or Composer installed on your host machine.

## Prerequisites

- PHP 8.5+ (provided by the Pimcore Docker image, no local PHP installation required).
- Your user must be allowed to run Docker commands (directly or via sudo).
- Docker Compose must be installed.
- Your user must be allowed to change file permissions (directly or via sudo).

## Choose an Installation Package

Pimcore offers two installation packages:

| Package | Description | Guide |
|---------|-------------|-------|
| **`pimcore/skeleton`** | Empty project for building from scratch. Best for starting a new implementation. | [Skeleton Installation](./00_Skeleton_Installation.md) |
| **`pimcore/demo-enterprise`** | Pre-built project with enterprise blueprints showcasing advanced features. Requires Pimcore enterprise repository credentials. | [Demo Enterprise Installation](./01_Demo_Enterprise_Installation.md) |

Both packages use the same profile-based installer and ship a pre-configured Docker environment
together with a pre-filled `.env`. The installer reads those values, prompts only for what is not
yet provided (typically product registration), writes the resolved configuration to `.env.local`,
installs and registers bundles, and runs post-install commands (including building the search
index), so the instance is usable right away.

For automated (CI) installations, see [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md).

## Installing Additional Bundles

After setting up your Pimcore instance, you can extend it with additional bundles.
Each bundle has its own installation documentation. Some commonly used bundles include:

- **[Data Hub](https://github.com/pimcore/data-hub/blob/2026.x/doc/01_Installation_and_Upgrade/README.md)** -
  GraphQL and REST API endpoints for external data access
- **[Portal Engine](https://github.com/pimcore/portal-engine/blob/2026.x/doc/01_Installation/README.md)** -
  Web portals for sharing data with external stakeholders
- **[Workflow Designer](https://github.com/pimcore/workflow-designer/blob/2026.x/doc/01_Installation_and_Configuration/README.md)** -
  Visual workflow configuration for approval processes

See [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md) for automating bundle installation
during the Pimcore setup process.

## Caching

For any installation, configure a caching backend to improve performance.
Redis is the recommended cache adapter.
See the [Performance Guide](./02_System_Setup_and_Hosting/09_Performance_Guide.md) for configuration details.

## Next Steps

- [Product Registration](../02_Product_Registration.md) - Register your instance and obtain a product key.
- [System Requirements](./01_System_Requirements.md) - Detailed requirements for PHP, database, and additional software.
- [System Setup and Hosting](./02_System_Setup_and_Hosting/README.md) - File storage, database replication, and performance optimization.
- [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md) - Automated installation, environment variables, and install profiles.
- [Platform Version](./03_Advanced_Installation_Topics/03_Platform_Version.md) - Version compatibility and installing additional modules.
