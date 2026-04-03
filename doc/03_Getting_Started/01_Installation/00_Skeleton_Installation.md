# Skeleton Installation

The skeleton package provides a minimal Pimcore setup.
The install profile includes Pimcore Studio and its dependencies (GenericExecutionEngine,
GenericDataIndex, StudioBackend, StudioUI, DataHub), so you do not need to install them separately.

## Step 1: Create the Project

Create the project using the Pimcore Docker image:

```bash
docker run -u `id -u`:`id -g` --rm -v `pwd`:/var/www/html pimcore/pimcore:php8.5-latest composer create-project pimcore/skeleton my-project
```

Switch to the project directory:

```bash
cd my-project/
```

## Step 2: Configure Docker Services

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

## Step 3: Run the Installer

Run the Pimcore installer with the skeleton profile:

```bash
docker compose exec php vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile'
```

The installer will interactively prompt for all required configuration values:
database connection, messenger transport, admin credentials,
and product registration.

During installation, you will be prompted to register your Pimcore instance.
Product registration is mandatory, and installation cannot proceed without a valid product key.
The installer provides a link to the registration form.
See [Product Registration](../02_Product_Registration.md) for details.

The installer automatically:
- Writes all configuration to `.env.local`
- Installs and registers all bundles defined in the profile
- Creates the database schema and admin user
- Installs assets, builds search indices, and runs all post-install commands

For non-interactive (CI) installations, set env vars in `.env` or `docker-compose.yaml`
before running the installer with `--no-interaction`.
See [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md)
for the full list of supported environment variables.

## Step 4: Configure Pimcore Studio

The installer handles bundle installation and environment variable configuration,
but some YAML configuration files must be set up manually.

Follow the [Pimcore Studio Setup](./03_Advanced_Installation_Topics/02_Pimcore_Studio_Setup.md)
guide to learn more about configuring OpenSearch, the security firewall, Mercure, and messenger transports.

## Step 5: Done

Visit your Pimcore instance:

- Frontend: [http://localhost](http://localhost)
- Pimcore Studio: [http://localhost/pimcore-studio](http://localhost/pimcore-studio)
