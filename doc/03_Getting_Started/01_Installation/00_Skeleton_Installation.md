# Skeleton Installation

The skeleton is a minimal Pimcore project for building from scratch. It already includes Pimcore
Studio and ships a ready-to-run Docker environment, so you can get a working instance in four steps.

## Installation

### 1. Create the project

```bash
docker run -u `id -u`:`id -g` --rm -v `pwd`:/var/www/html pimcore/pimcore:php8.5-latest composer create-project pimcore/skeleton --no-scripts my-project
cd my-project/
```

### 2. Start the services

Match the container user to your local user, then start everything:

```bash
sed -i "s|user: '1000:1000'|user: '$(id -u):$(id -g)'|g" docker-compose.yaml
docker compose up -d
```

### 3. Run the installer

```bash
docker compose exec php vendor/bin/pimcore-install --install-profile='App\Installer\SkeletonProfile'
```

The skeleton's `.env` already holds every connection and credential, so the installer only prompts
for a **product key** (product registration is mandatory — it prints a registration link). Everything
else, including building the search index, runs automatically.

### 4. Open Pimcore

- Frontend: [http://localhost](http://localhost)
- Pimcore Studio: [http://localhost/pimcore-studio](http://localhost/pimcore-studio) — log in with `admin` / `admin`

:::caution

The shipped credentials and secrets are insecure development placeholders. Change them before any
shared or production deployment — see [Production hardening](#production-hardening) below.

:::

## Additional Information

### What's pre-configured

The committed `docker-compose.yaml` defines every service Pimcore needs — PHP, Nginx, MariaDB,
Redis, RabbitMQ, OpenSearch (plus OpenSearch Dashboards), Mercure, and a Supervisord service that
runs the messenger workers. The matching configuration ships too (`.env`, the `.docker/` files, and
the YAML under `config/`), so the OpenSearch client, security firewall, Mercure, and messenger
transports are already wired up. You do not need to add or configure these yourself.

:::caution

Do not replace the bundled `opensearch` and `mercure` containers with definitions from other
guides — `.env` and `config/` are wired to the bundled ones. In particular, the bundled OpenSearch
runs with the security plugin enabled over HTTPS
(`PIMCORE_OPENSEARCH_DSN=opensearch://admin:...@opensearch:9200?ssl=true&ssl_verify=false`).
Swapping in a plain-HTTP OpenSearch breaks installation and indexing.

:::

### What the installer does

Because `.env` already provides the database, OpenSearch, RabbitMQ, Mercure, admin, and
application-secret values, the installer validates them (connecting to the database, pinging
OpenSearch) instead of prompting, then:

- Writes the resolved configuration to `.env.local`
- Installs and registers the profile's bundles and their assets
- Creates the database schema and the `admin` user
- Runs all post-install commands, including building the search index

For non-interactive (CI) installs, provide the product-registration values as environment variables
and add `--no-interaction`. See [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md)
for the full list of environment variables, and
[Pimcore Studio Setup](./03_Advanced_Installation_Topics/02_Pimcore_Studio_Setup.md) to understand
or customize the Studio configuration.

### Default credentials and product registration

The default login is `admin` / `admin` (from `PIMCORE_ADMIN_USER` / `PIMCORE_ADMIN_PASSWORD` in
`.env`). Because they are pre-set, the installer does not ask you to choose them; to be prompted
instead, remove those two lines before installing.

Product registration is mandatory. The installer auto-generates the instance identifier and
encryption secret and prompts only for the product key.
See [Product Registration](../02_Product_Registration.md).

### Rebuilding the search index

The index is built during installation. To rebuild it later (for example after changing the index
configuration):

```bash
docker compose exec php bin/console generic-data-index:update:index -r
```

The `-r` flag recreates the indices from scratch; the Supervisord service keeps them up to date as
you create and edit elements.

### Production hardening

The skeleton is configured for local development. Before deploying anywhere shared or public,
replace all placeholder secrets with strong, private values — the admin login (`admin` / `admin`),
the database and OpenSearch passwords, the Mercure JWT key (`CHANGE_ME_...`), and the
`APPLICATION_SECRET`. Once you use a trusted certificate, also drop `ssl_verify=false` from the
OpenSearch DSN.

### First steps in Studio

A fresh skeleton has no homepage document, so [http://localhost](http://localhost) shows the
built-in example page. Create your first document in Studio to replace it — see
[Create a First Project](../03_Create_a_First_Project/README.md).
