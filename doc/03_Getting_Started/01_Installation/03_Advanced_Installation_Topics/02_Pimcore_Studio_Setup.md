# Pimcore Studio Setup

Pimcore Studio is the administration interface for managing assets, data objects, documents, and system settings.
It consists of four bundles that must be installed in order:

1. **GenericExecutionEngineBundle** - Background job execution framework (ships with Pimcore core)
2. **GenericDataIndexBundle** - Search indexing via OpenSearch or Elasticsearch
3. **StudioBackendBundle** - REST API powering the Studio interface
4. **StudioUiBundle** - The Studio frontend application

:::info

The demo enterprise package (`pimcore/demo-enterprise`) ships with all Studio bundles pre-installed
and pre-configured. This page applies only to skeleton-based installations.

:::

## Prerequisites

Before installing the Studio bundles, your Docker environment must include:

- **OpenSearch >= 2.7** (or Elasticsearch >= 8.0.0) for search indexing
- **Mercure** for real-time updates in the Studio interface

See the [Installation guide](../README.md) for Docker service configuration.

## Install the Bundles

Install the required packages via Composer.
The GenericExecutionEngineBundle ships with Pimcore core and does not need a separate `composer require`.

```bash
docker compose exec php composer require pimcore/generic-data-index-bundle pimcore/studio-backend-bundle pimcore/studio-ui-bundle
```

Make sure all bundles are enabled in `config/bundles.php`:

```php
use Pimcore\Bundle\GenericExecutionEngineBundle\PimcoreGenericExecutionEngineBundle;
use Pimcore\Bundle\GenericDataIndexBundle\PimcoreGenericDataIndexBundle;
use Pimcore\Bundle\StudioBackendBundle\PimcoreStudioBackendBundle;
use Pimcore\Bundle\StudioUiBundle\PimcoreStudioUiBundle;

return [
    // ... other bundles ...
    PimcoreGenericExecutionEngineBundle::class => ['all' => true],
    PimcoreGenericDataIndexBundle::class => ['all' => true],
    PimcoreStudioBackendBundle::class => ['all' => true],
    PimcoreStudioUiBundle::class => ['all' => true],
];
```

The GenericExecutionEngineBundle is included in the Pimcore core package
but still needs to be registered via `pimcore:bundle:install`. Register and install each bundle:

```bash
docker compose exec php bin/console pimcore:bundle:install PimcoreGenericExecutionEngineBundle
docker compose exec php bin/console pimcore:bundle:install PimcoreGenericDataIndexBundle
docker compose exec php bin/console pimcore:bundle:install PimcoreStudioBackendBundle
docker compose exec php bin/console pimcore:bundle:install PimcoreStudioUiBundle
```

## Configure OpenSearch

Add the OpenSearch client configuration to `config/config.yaml` (or a dedicated config file):

```yaml
pimcore_open_search_client:
    clients:
        default:
            hosts: ['http://opensearch:9200']

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

## Configure Mercure

Mercure enables real-time updates in Pimcore Studio (progress tracking, live notifications).
Configure it in your Symfony configuration (e.g. `config/config.yaml`):

```yaml
pimcore_studio_backend:
    mercure_settings:
        jwt_key: 'YourMercureJwtKeyMustBeAtLeast256BitsLong!'
        hub_url_client: 'http://localhost/hub'
        hub_url_server: 'http://mercure/.well-known/mercure'
```

| Setting | Description |
|---------|-------------|
| `jwt_key` | Must match the key configured in the Mercure Docker service. Minimum 256 bits (32 characters). Keep this key private. |
| `hub_url_client` | The URL the browser uses to connect to Mercure (through the Nginx reverse proxy). |
| `hub_url_server` | The internal Docker URL used by the PHP application to publish messages. |

If these settings are not provided, URLs are generated based on the current Pimcore host and default paths.

### Optional Mercure Settings

```yaml
pimcore_studio_backend:
    mercure_settings:
        jwt_key: 'YourMercureJwtKeyMustBeAtLeast256BitsLong!'
        hub_url_client: 'http://localhost/hub'
        hub_url_server: 'http://mercure/.well-known/mercure'
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

## Configure Messenger Transports

The Generic Execution Engine and Generic Data Index bundles each require a Symfony Messenger transport
for background processing.
The bundles auto-configure their message routing, but you need to define the transports.

Add these to your messenger configuration (e.g. `config/packages/messenger.yaml`):

```yaml
framework:
    messenger:
        transports:
            pimcore_generic_execution_engine:
                dsn: 'doctrine://default?queue_name=pimcore_generic_execution_engine'
                retry_strategy:
                    max_retries: 0
            pimcore_generic_data_index_queue:
                dsn: 'doctrine://default?queue_name=pimcore_generic_data_index_queue'
```

For production, consider using RabbitMQ instead of the Doctrine transport.
See [Symfony Messenger](./01_Symfony_Messenger.md) for details.

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

After installation, create the search indices and populate them with initial data:

```bash
docker compose exec php bin/console generic-data-index:update:index -r
```

The `-r` flag recreates the indices from scratch, which is required for initial setup.
This command must be run at least once after installation.
It creates the OpenSearch/Elasticsearch indices and queues all assets and data objects for indexing.

## Verify the Installation

Clear the cache and open Pimcore Studio:

```bash
docker compose exec php bin/console cache:clear
```

Navigate to [http://localhost/pimcore-studio](http://localhost/pimcore-studio).
You should see the Pimcore Studio login screen.

The Studio Backend also provides an OpenAPI documentation at `/pimcore-studio/api/docs` for exploring the REST API.
