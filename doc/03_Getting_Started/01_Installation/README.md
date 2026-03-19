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

| Package | Description |
|---------|-------------|
| **`pimcore/skeleton`** | Empty project for building from scratch. Requires manual installation of Pimcore Studio and its dependencies. Best for experienced developers starting a new implementation. |
| **`pimcore/demo-enterprise`** | Pre-built project with enterprise blueprints showcasing advanced features. Pimcore Studio and all dependencies are pre-installed. Requires Pimcore enterprise repository credentials. |

## Skeleton Installation

The skeleton package provides a minimal Pimcore setup.
You install the core framework first, then add Pimcore Studio (the administration interface) and its dependencies.

### Step 1: Create the Project

Create the project using the Pimcore Docker image:

```bash
docker run -u `id -u`:`id -g` --rm -v `pwd`:/var/www/html pimcore/pimcore:php8.5-latest composer create-project pimcore/skeleton my-project
```

Switch to the project directory:

```bash
cd my-project/
```

### Step 2: Configure Docker Services

The skeleton includes a `docker-compose.yaml` with the base services (PHP, Nginx, MariaDB, Redis).
Pimcore Studio requires two additional services:
OpenSearch (or Elasticsearch) for search indexing, and Mercure for real-time updates.

1. Run `` echo `id -u`:`id -g` `` to retrieve your local user and group ID.
2. Open `docker-compose.yaml`, uncomment all `user: '1000:1000'` lines,
   and update the IDs if they differ from your local user.
3. Add the OpenSearch and Mercure services to your `docker-compose.yaml`:

```yaml
services:
  # ... existing services (php, nginx, db, redis) ...

  opensearch:
    image: opensearchproject/opensearch:2.19.2
    environment:
      - cluster.name=opensearch-cluster
      - node.name=opensearch
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m
      - DISABLE_INSTALL_DEMO_CONFIG=true
      - DISABLE_SECURITY_PLUGIN=true
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - opensearch-data:/usr/share/opensearch/data

  mercure:
    image: dunglas/mercure:latest
    restart: unless-stopped
    environment:
      SERVER_NAME: ':80'
      MERCURE_PUBLISHER_JWT_KEY: 'YourMercureJwtKeyMustBeAtLeast256BitsLong!'
      MERCURE_SUBSCRIBER_JWT_KEY: 'YourMercureJwtKeyMustBeAtLeast256BitsLong!'
    expose:
      - "80"
    volumes:
      - mercure-data:/data
      - mercure-config:/config

volumes:
  # ... existing volumes ...
  opensearch-data:
  mercure-data:
  mercure-config:
```

:::info

The Mercure JWT key must be at least 256 bits (32 characters) long.
Use the same key in both the Docker configuration and the Pimcore application configuration.
Keep this key private.

:::

4. Add a reverse proxy rule for Mercure in your Nginx configuration
   (e.g. `.docker/nginx.conf` in the skeleton) so the browser can reach the Mercure hub:

```conf
location /hub {
    proxy_pass http://mercure/.well-known/mercure;
}
```

5. Start all services:

```bash
docker compose up -d
```

### Step 3: Install Pimcore Core

Install Pimcore and initialize the database:

```bash
docker compose exec php vendor/bin/pimcore-install \
  --mysql-host-socket=db \
  --mysql-username=pimcore \
  --mysql-password=pimcore \
  --mysql-database=pimcore
```

During installation, you will be prompted to register your Pimcore instance.
Product registration is mandatory, and installation cannot proceed without a valid product key.
The installer provides a link to the registration form.
See [Product Registration](../02_Product_Registration.md) for details.

### Step 4: Install and Configure Pimcore Studio

This step is required before you can continue with the tutorial chapters that use Pimcore Studio.

Install the Studio bundles and their dependencies
(GenericExecutionEngine, GenericDataIndex, StudioBackend, StudioUI),
configure OpenSearch, Mercure, the security firewall, and messenger transports,
then build the search index.

Follow the complete setup instructions in the
[Pimcore Studio Setup](./03_Advanced_Installation_Topics/02_Pimcore_Studio_Setup.md) guide.

### Step 5: Done

After completing the Studio setup, visit your Pimcore instance:

- Frontend: [http://localhost](http://localhost)
- Pimcore Studio: [http://localhost/pimcore-studio](http://localhost/pimcore-studio)

## Demo Enterprise Installation

The demo enterprise package includes all enterprise extensions, Pimcore Studio, and pre-built blueprints.
All Studio dependencies (OpenSearch, Mercure, messenger transports) are pre-configured.
It requires credentials for the Pimcore enterprise repository.

1. Configure enterprise repository credentials and create the project.
   Replace `<YOUR_USERNAME>` and `<YOUR_TOKEN>` with your Pimcore enterprise credentials:

```bash
docker run --rm -v `pwd`:/var/www/html -it pimcore/pimcore:php8.5-latest sh -c \
  'composer --global config repositories.pimcore composer https://repo.pimcore.com/<YOUR_USERNAME>/ ; \
   composer create-project --no-scripts pimcore/demo-enterprise my-project \
   --repository="{\"url\": \"https://token:<YOUR_TOKEN>@repo.pimcore.com/<YOUR_USERNAME>/\", \"type\": \"composer\"}" \
   -n --ignore-platform-req=php --no-scripts'
```

2. Switch to the project directory:

```bash
cd my-project/
```

3. Configure and start Docker services:
   - Run `` echo `id -u`:`id -g` `` to retrieve your local user and group ID.
   - Open `docker-compose.yaml`, uncomment all `user: '1000:1000'` lines,
     and update the IDs if they differ from your local user.
   - Start the services:

```bash
docker compose up -d
```

4. Install frontend assets:

```bash
docker compose exec php bin/console assets:install --symlink --relative
```

5. Install Pimcore and initialize the database:

```bash
docker compose exec php vendor/bin/pimcore-install \
  --mysql-host-socket=db \
  --mysql-username=pimcore \
  --mysql-password=pimcore \
  --mysql-database=pimcore
```

Product registration is mandatory here as well.
The installer requires a valid product key before installation can complete.

This can take up to 20 minutes for the demo enterprise package.

6. Clear caches and rebuild indexes:

```bash
docker compose exec php bin/console cache:clear
docker compose exec php bin/console datahub:simple-rest:create-or-update-mapping
docker compose exec php bin/console datahub:simple-rest:init-index
docker compose exec php bin/console advanced-object-search:update-mapping
docker compose exec php bin/console advanced-object-search:re-index
docker compose exec php bin/console generic-data-index:update:index
docker compose exec php bin/console bpt:aet:rebuild-tree -a
docker compose exec php bin/console pimcore:maintenance
```

7. Done. Visit your Pimcore instance:
   - Frontend: [http://localhost](http://localhost)
   - Pimcore Studio: [http://localhost/pimcore-studio](http://localhost/pimcore-studio)

## Installing Additional Bundles

After setting up your Pimcore instance, you can extend it with additional bundles.
Each bundle has its own installation documentation. Some commonly used bundles include:

- **[Data Hub](https://github.com/pimcore/data-hub/blob/2026.x/doc/01_Installation_and_Upgrade/README.md)** -
  GraphQL and REST API endpoints for external data access
- **[Portal Engine](https://github.com/pimcore/portal-engine/blob/2026.x/doc/01_Installation/README.md)** -
  Web portals for sharing data with external stakeholders
- **[Workflow Designer](https://github.com/pimcore/workflow-designer/blob/2026.x/doc/01_Installation_and_Configuration.md)** -
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
- [System Setup and Hosting](./02_System_Setup_and_Hosting/README.md) - Web server configuration, file storage, and database setup.
- [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md) - Automated installation and bundle management.
- [Platform Version](./03_Advanced_Installation_Topics/03_Platform_Version.md) - Version compatibility and installing additional modules.
