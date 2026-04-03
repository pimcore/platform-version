# Pimcore Studio Setup

Pimcore Studio is the administration interface for managing assets, data objects, documents, and system settings.
It consists of four bundles:

1. **GenericExecutionEngineBundle** - Background job execution framework (ships with Pimcore core)
2. **GenericDataIndexBundle** - Search indexing via OpenSearch or Elasticsearch
3. **StudioBackendBundle** - REST API powering the Studio interface
4. **StudioUiBundle** - The Studio frontend application

:::info

The demo enterprise package (`pimcore/demo-enterprise`) ships with all Studio bundles pre-installed
and pre-configured. This page applies only to skeleton-based installations.

:::

## Prerequisites

Before running the installer, your Docker environment must include:

- **OpenSearch >= 2.7** (or Elasticsearch >= 8.0.0) for search indexing
- **Mercure** for real-time updates in the Studio interface

See the [Skeleton Installation](../00_Skeleton_Installation.md) guide for Docker service configuration.

## Bundle Installation

The Skeleton install profile includes all four Studio bundles. When you run the installer
with `--install-profile='App\Installer\SkeletonProfile'`, it automatically:

- Installs the required Composer packages
- Registers all bundles in `config/bundles.php`
- Runs `pimcore:bundle:install` for each bundle
- Writes connection details (OpenSearch, Mercure, messenger transport) to `.env.local`
- Builds the search index

No manual `composer require`, `bundles.php` editing, or `pimcore:bundle:install` commands are needed.

## OpenSearch Configuration

The OpenSearch client bundle ships with a default configuration that reads the connection
URL from the `PIMCORE_OPENSEARCH_DSN` environment variable (written by the installer).
The GenericDataIndex bundle defaults to using the `default` client with OpenSearch.

**In most cases, no manual YAML configuration is needed.**

If you need to customize the OpenSearch connection (e.g., multiple clients, authentication,
or a different client name), override the defaults in `config/config.yaml`:

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

If you use Elasticsearch instead of OpenSearch, see the
[Generic Data Index configuration documentation](https://github.com/pimcore/generic-data-index-bundle/blob/2026.x/doc/02_Configuration/05_Elasticsearch.md)
for the equivalent setup.

:::

## Configure Security Firewall

Add the Studio Backend firewall settings to `config/packages/security.yaml`.
Place the `pimcore_studio` firewall before the `main` firewall,
since Symfony evaluates firewalls in order:

```yaml
security:
    firewalls:
        pimcore_studio: '%pimcore_studio_backend.firewall_settings%'
    access_control:
        - { path: ^/pimcore-studio/api/(docs|docs/json|translations|user/reset-password)$, roles: PUBLIC_ACCESS }
        - { path: ^/pimcore-studio/api, roles: ROLE_PIMCORE_USER }
```

## Mercure Configuration

Mercure enables real-time updates in Pimcore Studio (progress tracking, live notifications).
The installer writes `MERCURE_JWT_KEY`, `MERCURE_URL`, and `MERCURE_SERVER_URL` to `.env.local`.

Wire these environment variables to the Studio Backend configuration
in `config/config.yaml`:

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
| `hub_url_client` | `MERCURE_URL` | The URL the browser uses to connect to Mercure (through the Nginx reverse proxy). |
| `hub_url_server` | `MERCURE_SERVER_URL` | The internal Docker URL used by the PHP application to publish messages. |

If `hub_url_client` and `hub_url_server` are not configured, URLs are generated based
on the current Pimcore host and default paths.

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

Pimcore core and the Studio bundles auto-configure all required messenger transports using the
`PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` environment variable (written by the installer).

**No manual transport YAML configuration is needed.** The following transports are
registered automatically by the bundles:

| Transport | Registered By |
|-----------|---------------|
| `pimcore_core` | Pimcore Core |
| `pimcore_maintenance` | Pimcore Core |
| `pimcore_scheduled_tasks` | Pimcore Core |
| `pimcore_image_optimize` | Pimcore Core |
| `pimcore_asset_update` | Pimcore Core |
| `pimcore_generic_execution_engine` | GenericExecutionEngineBundle |
| `pimcore_generic_data_index_queue` | GenericDataIndexBundle |

All transports use `%pimcore.messenger.transport_dsn_prefix%` which resolves from the
`PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` env var. For example, with the default Doctrine
transport, the prefix `doctrine://default?queue_name=` produces DSNs like
`doctrine://default?queue_name=pimcore_core`.

See [Symfony Messenger](./01_Symfony_Messenger.md) for details on switching transport
backends (Doctrine, AMQP, Redis).

## Start Messenger Workers

The messenger transports require active workers to process background jobs (search indexing, execution engine tasks).

For development, start workers manually:

```bash
docker compose exec php bin/console messenger:consume pimcore_generic_execution_engine pimcore_generic_data_index_queue
```

The Generic Data Index bundle also registers a `scheduler_generic_data_index` scheduler for periodic tasks.
To include it:

```bash
docker compose exec php bin/console messenger:consume pimcore_generic_execution_engine pimcore_generic_data_index_queue scheduler_generic_data_index
```

For production, use Supervisord to run messenger workers as daemons. Example supervisor configuration:

```ini
[program:pimcore-messenger]
command=php /var/www/html/bin/console messenger:consume pimcore_generic_execution_engine pimcore_generic_data_index_queue scheduler_generic_data_index --memory-limit=250M --time-limit=3600
numprocs=1
startsecs=0
autostart=true
autorestart=true
process_name=%(program_name)s_%(process_num)02d
```

See the [Symfony Messenger deployment documentation](https://symfony.com/doc/current/messenger.html#deploying-to-production) for more options.

## Build the Search Index

The installer automatically builds the search index during installation via
the `generic-data-index:update:index -r` post-install command.

If you need to rebuild the index later (e.g. after configuration changes), run:

```bash
docker compose exec php bin/console generic-data-index:update:index -r
```

The `-r` flag recreates the indices from scratch.
This command creates the OpenSearch/Elasticsearch indices and queues all assets and data objects for indexing.

## Verify the Installation

Navigate to [http://localhost/pimcore-studio](http://localhost/pimcore-studio).
You should see the Pimcore Studio login screen.

The Studio Backend also provides an OpenAPI documentation at `/pimcore-studio/api/docs` for exploring the REST API.
