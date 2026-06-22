# Pimcore Studio Setup

Pimcore Studio is the administration interface for managing assets, data objects, documents, and system settings.
It consists of four bundles:

1. **GenericExecutionEngineBundle** - Background job execution framework (ships with Pimcore core)
2. **GenericDataIndexBundle** - Search indexing via OpenSearch or Elasticsearch
3. **StudioBackendBundle** - REST API powering the Studio interface
4. **StudioUiBundle** - The Studio frontend application

:::info

The `pimcore/skeleton` and `pimcore/demo-enterprise` packages already ship Pimcore Studio
**pre-configured** — the bundles are registered, the OpenSearch client, security firewall,
Mercure wiring, and messenger transports are all set up in the committed `config/` and `.docker/`
files, and the Docker environment includes every required service. For a standard skeleton
install you do not need to change any of the configuration on this page.

This page documents what the skeleton ships and where, so you can understand or customize it.
It is also a reference for adding Studio to a project that was **not** based on the skeleton.

:::

## Prerequisites

Pimcore Studio needs the following services. The skeleton's `docker-compose.yaml` already provides them:

- **OpenSearch >= 2.7** (or Elasticsearch >= 8.0.0) for search indexing
- **Mercure** for real-time updates in the Studio interface

See the [Skeleton Installation](../00_Skeleton_Installation.md) guide for the Docker setup.

## Bundle Installation

The Skeleton install profile (`App\Installer\SkeletonProfile`) lists all Studio bundles. When you run
the installer, it automatically:

- Registers the bundles in `config/bundles.php`
- Runs `pimcore:bundle:install` for each bundle
- Installs bundle assets

The connection details (OpenSearch, Mercure, messenger transport) come from environment variables
that are already set in the skeleton's committed `.env` and validated by the installer. No manual
`composer require`, `bundles.php` editing, or `pimcore:bundle:install` commands are needed.

## OpenSearch Configuration

The GenericDataIndex bundle reads the OpenSearch connection from the `PIMCORE_OPENSEARCH_DSN`
environment variable and defaults to the `default` client with OpenSearch. The skeleton sets this
in `.env`, pointing at the bundled OpenSearch service:

```dotenv
PIMCORE_OPENSEARCH_DSN=opensearch://admin:gBsVe!Dut723@opensearch:9200?ssl=true&ssl_verify=false
```

The bundled OpenSearch runs with the security plugin enabled, so the DSN uses the `opensearch://`
scheme, includes the admin credentials, and enables TLS (`ssl=true`). `ssl_verify=false` accepts the
service's self-signed certificate in local development.

**No manual YAML configuration is needed for the skeleton.**

If you need to customize the OpenSearch connection (for example multiple clients, different
credentials, or a different client name), override the defaults in `config/config.yaml`:

```yaml
pimcore_open_search_client:
    clients:
        default:
            dsn: '%env(PIMCORE_OPENSEARCH_DSN)%'

pimcore_generic_data_index:
    index_service:
        client_params:
            client_name: default
```

:::tip

If you use Elasticsearch instead of OpenSearch, set `PIMCORE_ELASTICSEARCH_DSN`
(scheme `elasticsearch://`) and see the
[Generic Data Index configuration documentation](https://github.com/pimcore/generic-data-index-bundle/blob/2026.x/doc/02_Configuration/05_Elasticsearch.md)
for the equivalent setup.

:::

## Security Firewall

The skeleton already ships the Studio Backend firewall in `config/packages/security.yaml`.
The `pimcore_studio` firewall is placed before the `main` firewall, since Symfony evaluates
firewalls in order. The committed configuration looks like this:

```yaml
security:
    firewalls:
        pimcore_studio: "%pimcore_studio_backend.firewall_settings%"

    access_control:
        - {
            path: ^/pimcore-studio/api/(docs|docs/json|translations|user/reset-password|setting/admin/thumbnail)$,
            roles: PUBLIC_ACCESS,
        }
        - { path: ^/pimcore-studio/api, roles: ROLE_PIMCORE_USER }
```

If you are adding Studio to a non-skeleton project, add the same firewall and access-control rules.

## Mercure Configuration

Mercure enables real-time updates in Pimcore Studio (progress tracking, live notifications).
The skeleton sets `MERCURE_JWT_KEY`, `MERCURE_URL`, and `MERCURE_SERVER_URL` in `.env`, and
already wires them to the Studio Backend in `config/config.yaml`:

```yaml
pimcore_studio_backend:
    mercure_settings:
        jwt_key: '%env(MERCURE_JWT_KEY)%'
        hub_url_client: '%env(MERCURE_URL)%'
        hub_url_server: '%env(MERCURE_SERVER_URL)%'
```

| Setting | Env Var | Description |
|---------|---------|-------------|
| `jwt_key` | `MERCURE_JWT_KEY` | Must match the key configured in the Mercure Docker service. Minimum 256 bits (32 characters). |
| `hub_url_client` | `MERCURE_URL` | The URL the browser uses to connect to Mercure (through the Nginx reverse proxy, e.g. `http://localhost/hub`). |
| `hub_url_server` | `MERCURE_SERVER_URL` | The internal Docker URL the PHP application uses to publish messages (e.g. `http://mercure/.well-known/mercure`). |

:::info

The Mercure JWT key must be at least 256 bits (32 characters) long. The same key must be used in
both the Mercure Docker service and `MERCURE_JWT_KEY`. The skeleton ships a placeholder key
(`CHANGE_ME_...`); replace it with your own private key before any non-local deployment.

:::

The skeleton's `.docker/nginx.conf` already exposes the Mercure hub under `/hub` (same-origin,
no CORS needed):

```conf
location /hub {
    proxy_pass http://mercure/.well-known/mercure;
}
```

### Optional Mercure Settings

```yaml
pimcore_studio_backend:
    mercure_settings:
        jwt_key: '%env(MERCURE_JWT_KEY)%'
        hub_url_client: '%env(MERCURE_URL)%'
        hub_url_server: '%env(MERCURE_SERVER_URL)%'
        cookie_lifetime: 3600        # JWT token lifetime in seconds (default: 3600)
        cookie_same_site: 'strict'   # SameSite attribute: lax, strict, or none (default: strict)
```

### Verify Mercure is Running

To check if Mercure is available, open the `hub_url_client` URL in a browser (e.g. `http://localhost/hub`).
You should see either `Missing "topic" parameter.` or `Unauthorized`.
Both confirm that Mercure is reachable.

Also verify server-side connectivity:

```bash
docker compose exec php curl http://mercure/.well-known/mercure
```

For advanced Mercure configuration (external URLs, CORS, Apache reverse proxy, development UI), see the
[Studio Backend Mercure documentation](https://github.com/pimcore/studio-backend-bundle/blob/1.x/doc/02_Installation_and_Configuration/01_Mercure_Setup.md).

## Messenger Transports

Pimcore core and the Studio bundles auto-configure the required messenger transports. The
following transports are registered automatically by the bundles:

| Transport | Registered By |
|-----------|---------------|
| `pimcore_core` | Pimcore Core |
| `pimcore_maintenance` | Pimcore Core |
| `pimcore_scheduled_tasks` | Pimcore Core |
| `pimcore_image_optimize` | Pimcore Core |
| `pimcore_asset_update` | Pimcore Core |
| `pimcore_generic_execution_engine` | GenericExecutionEngineBundle |
| `pimcore_generic_data_index_queue` | GenericDataIndexBundle |

The skeleton uses **RabbitMQ (AMQP)** as the transport backend. The DSN prefix is set in `.env`:

```dotenv
PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX=amqp://guest:guest@rabbitmq:5672/%2f/
```

Each transport's full DSN is formed by appending the queue name to this prefix, for example
`amqp://guest:guest@rabbitmq:5672/%2f/pimcore_core`. The skeleton additionally pins the core
transports to RabbitMQ in `.docker/messenger.yaml` (mounted over `config/packages/messenger.yaml`).

See [Symfony Messenger](./01_Symfony_Messenger.md) for details on switching transport
backends (Doctrine, AMQP, Redis).

## Messenger Workers

The messenger transports require active workers to process background jobs (search indexing,
execution engine tasks).

**In the skeleton, workers run automatically.** The `supervisord` service in `docker-compose.yaml`
starts the consumers for you (see `.docker/supervisord.conf`), consuming all queues:

```
pimcore_generic_data_index_queue scheduler_generic_data_index pimcore_core pimcore_maintenance
pimcore_scheduled_tasks pimcore_image_optimize pimcore_asset_update pimcore_generic_execution_engine
```

If you run Pimcore **without** the bundled Supervisord service, start the workers manually instead:

```bash
docker compose exec php bin/console messenger:consume \
  pimcore_generic_execution_engine pimcore_generic_data_index_queue scheduler_generic_data_index \
  pimcore_core pimcore_maintenance pimcore_scheduled_tasks pimcore_image_optimize pimcore_asset_update
```

For production, run the workers as daemons under Supervisord. Example program definition:

```ini
[program:pimcore-messenger]
command=php /var/www/html/bin/console messenger:consume pimcore_generic_execution_engine pimcore_generic_data_index_queue scheduler_generic_data_index pimcore_core pimcore_maintenance pimcore_scheduled_tasks pimcore_image_optimize pimcore_asset_update --memory-limit=250M --time-limit=3600
numprocs=1
startsecs=0
autostart=true
autorestart=true
process_name=%(program_name)s_%(process_num)02d
```

:::caution

Only consume queues that actually exist. Passing an unregistered queue name (for example the
removed `pimcore_index_queues`) makes `messenger:consume` fail with
*"The receiver ... does not exist"* and the worker restarts in a loop. The valid queue names are
the ones listed in the table above plus the `scheduler_generic_data_index` scheduler.

:::

See the [Symfony Messenger deployment documentation](https://symfony.com/doc/current/messenger.html#deploying-to-production) for more options.

## Build the Search Index

The GenericDataIndex bundle registers `generic-data-index:update:index -r` as a post-install
command, so the installer builds the search index automatically during installation. No manual
step is needed for a fresh install.

To rebuild the index later (for example after changing the index configuration), run:

```bash
docker compose exec php bin/console generic-data-index:update:index -r
```

The `-r` flag recreates the indices from scratch. This command creates the OpenSearch/Elasticsearch
indices and queues all assets and data objects for indexing; the messenger workers then process the
queue. Until the indices exist, Studio may show empty trees or return errors.

## Verify the Installation

Navigate to [http://localhost/pimcore-studio](http://localhost/pimcore-studio).
You should see the Pimcore Studio login screen, and you can log in with the admin credentials from
`.env` (default `admin` / `admin`).

The Studio Backend also provides OpenAPI documentation at `/pimcore-studio/api/docs` for exploring the REST API.
