# Advanced Installation Topics

This section covers automating the Pimcore installation, pre-configuring environment variables,
and customizing the installer for project-specific needs.

## Automated Installation

To fully automate the installation process, set all required values as environment variables
and pass the `--no-interaction` flag:

```bash
DATABASE_URL='mysql://pimcore:pimcore@db:3306/pimcore' \
PIMCORE_ADMIN_USER=admin \
PIMCORE_ADMIN_PASSWORD='secure-password' \
docker compose exec php vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile' \
  --no-interaction
```

The `--no-interaction` flag suppresses all interactive prompts.
All required values must be provided via environment variables or CLI options.

## Environment Variables

The installer reads environment variables for all configuration values.
Set these in your `.env`, `docker-compose.yaml`, or CI pipeline to avoid interactive prompts.

### Core Variables (Always Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Doctrine DBAL connection URL | `mysql://user:pass@host:3306/dbname` |
| `PIMCORE_ADMIN_USER` | Admin username | `admin` |
| `PIMCORE_ADMIN_PASSWORD` | Admin password | `secure-password` |

Product registration values are collected during installation.
See [Product Registration](../../02_Product_Registration.md) for details on
`PIMCORE_PRODUCT_KEY`, `PIMCORE_INSTANCE_IDENTIFIER`, and `PIMCORE_ENCRYPTION_SECRET`.

### Optional Variables (Depending on Install Profile)

The install profile determines which optional variables are available.
If a variable is not set for an optional service, the installer skips that service.

| Variable | Description | Example |
|----------|-------------|---------|
| `PIMCORE_OPENSEARCH_DSN` | OpenSearch connection URL | `http://opensearch:9200` |
| `PIMCORE_ELASTICSEARCH_DSN` | Elasticsearch connection URL | `http://elasticsearch:9200` |
| `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` | Messenger transport DSN with trailing separator | `doctrine://default?queue_name=` |
| `REDIS_URL` | Redis connection URL for cache | `redis://redis:6379` |
| `MAILER_DSN` | Symfony Mailer DSN | `smtp://mail:1025` |
| `GOTENBERG_BASE_URL` | Gotenberg service URL for document conversion | `http://gotenberg:3000` |
| `MERCURE_URL` | Mercure hub URL (browser-side, public) | `http://localhost/hub` |
| `MERCURE_SERVER_URL` | Mercure hub URL (server-side, internal) | `http://mercure/.well-known/mercure` |
| `MERCURE_JWT_KEY` | Mercure JWT signing key (min 32 characters) | `YourMercureJwtKey...` |

### Messenger Transport DSN

`PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` uses a trailing separator approach.
The installer appends the queue name directly to the prefix to form the full DSN:

| Transport | Prefix Value | Resulting DSN (for queue `pimcore_core`) |
|-----------|-------------|------------------------------------------|
| Doctrine  | `doctrine://default?queue_name=` | `doctrine://default?queue_name=pimcore_core` |
| AMQP (RabbitMQ) | `amqp://guest:guest@rabbit:5672/%2f/` | `amqp://guest:guest@rabbit:5672/%2f/pimcore_core` |
| Redis | `redis://redis:6379/` | `redis://redis:6379/pimcore_core` |

See [Symfony Messenger](./01_Symfony_Messenger.md) for transport configuration details.

## CLI Options Reference

| Option | Description |
|--------|-------------|
| `--install-profile=FQCN` | **Required.** Fully qualified class name of the install profile. |
| `--admin-username=NAME` | Admin username (alternative to `PIMCORE_ADMIN_USER` env var). |
| `--admin-password=PASS` | Admin password (alternative to `PIMCORE_ADMIN_PASSWORD` env var). |
| `--env-definition=FQCN` | Additional `EnvVarDefinitionInterface` implementations (repeatable). |
| `--post-install-commands=FQCN` | Additional `PostInstallCommandsProviderInterface` implementations (repeatable). |
| `--skip-validation` | Skip all connection/format validation checks. |
| `--skip-validation=KEY` | Skip validation for a specific definition by key, class name, or FQCN (repeatable). |
| `--no-interaction` | Suppress all interactive prompts (requires all values via env vars or options). |

:::caution

Using `--admin-username` and `--admin-password` on the command line exposes credentials in shell history
and process listings. Prefer `PIMCORE_ADMIN_USER` and `PIMCORE_ADMIN_PASSWORD` environment variables instead.

:::

## Install Profiles and Extension Points

For details on what install profiles are, how to create custom profiles,
and the available extension points for developers:

- [Install Profiles](./04_Install_Profiles.md) -- overview, creating profiles, data sources, marker interfaces.
- [Env Var Definitions](./05_Env_Var_Definitions.md) -- built-in definitions, creating custom definitions, `ConfigParameter`.
- [Post-Install Commands](./06_Post_Install_Commands.md) -- automatic post-install commands, CLI injection, `PostInstallHookInterface`.
- [Install Step Filtering](./07_Install_Step_Filtering.md) -- skipping install steps for PaaS environments.

## Skipping Validation

By default, the installer validates all collected values (e.g., testing the database connection,
pinging OpenSearch). To skip validation during development:

```bash
# Skip all validation
vendor/bin/pimcore-install --install-profile='App\Installer\MyProfile' --skip-validation

# Skip validation for specific definitions only
vendor/bin/pimcore-install --install-profile='App\Installer\MyProfile' \
  --skip-validation=database \
  --skip-validation=opensearch
```

The `--skip-validation` option accepts definition keys (e.g., `database`, `opensearch`),
short class names (e.g., `DatabaseEnvVarDefinition`), or fully qualified class names.

## Set a Time Zone

Set the time zone in your configuration. It is used for displaying date/time values in Pimcore Studio.

```yaml
pimcore:
    general:
        timezone: Europe/Berlin
```

## Office Document Preview

The document preview feature is optional. To use it, install either
[Gotenberg](../02_System_Setup_and_Hosting/07_Additional_Tools_Installation.md#gotenberg) or
[LibreOffice](../02_System_Setup_and_Hosting/07_Additional_Tools_Installation.md#libreoffice-pdftotext-inkscape).
