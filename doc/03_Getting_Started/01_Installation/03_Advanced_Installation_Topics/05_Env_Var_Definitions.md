# Env Var Definitions

Env var definitions tell the installer which configuration values to collect from the user,
how to validate them, and how to write them as environment variables to `.env.local`.

Each definition implements `EnvVarDefinitionInterface` and is registered via the
install profile's `getEnvVarDefinitions()` method or injected at runtime with the
`--env-definition` CLI option.

## Built-in Definitions

Pimcore ships with definitions for common infrastructure services.
The "Required" column indicates whether `isRequired()` returns `true`.
Required definitions cannot be skipped during interactive installation --
the user must provide values. Optional definitions (`isRequired(): false`)
can be skipped by pressing Enter without input.

| Definition | Key | Env Var(s) | Required |
|-----------|-----|------------|----------|
| `DatabaseEnvVarDefinition` | `database` | `DATABASE_URL` | Yes |
| `ProductRegistrationEnvVarDefinition` | `product-registration` | `PIMCORE_PRODUCT_KEY`, `PIMCORE_INSTANCE_IDENTIFIER`, `PIMCORE_ENCRYPTION_SECRET` | Yes |
| `OpenSearchEnvVarDefinition` | `opensearch` | `PIMCORE_OPENSEARCH_DSN` | Yes |
| `ElasticsearchEnvVarDefinition` | `elasticsearch` | `PIMCORE_ELASTICSEARCH_DSN` | Yes |
| `DoctrineMessengerEnvVarDefinition` | `messenger-doctrine` | `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` | Yes |
| `AmqpMessengerEnvVarDefinition` | `messenger-amqp` | `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` | Yes |
| `RedisEnvVarDefinition` | `redis` | `REDIS_URL` | No |
| `MailerEnvVarDefinition` | `mailer` | `MAILER_DSN` | No |
| `GotenbergEnvVarDefinition` | `gotenberg` | `GOTENBERG_BASE_URL` | No |
| `MercureEnvVarDefinition` | `mercure` | `MERCURE_URL`, `MERCURE_SERVER_URL`, `MERCURE_JWT_KEY` | Yes |

## EnvVarDefinitionInterface

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getKey()` | `string` | Unique key identifying this definition (e.g., `database`, `redis`). Used with `--skip-validation`. |
| `getLabel()` | `string` | Human-readable label for CLI prompts. |
| `isRequired()` | `bool` | Whether this definition is mandatory. Optional definitions can be skipped in interactive mode. |
| `getSectionName()` | `string` | Section name for `.env.local` markers (uses Composer package name, e.g., `pimcore/pimcore`). |
| `getParameters()` | `list<ConfigParameter>` | Parameter definitions to collect from the user. |
| `resolveEnvVars(array $collectedValues)` | `array<string, string>` | Transforms collected values into final env var name/value pairs. |
| `validate(array $collectedValues)` | `list<string>` | Validates collected values (e.g., test DB connection). Returns error messages or empty array. |

## ConfigParameter

Each `ConfigParameter` represents a single value to collect:

| Property | Type | Description |
|----------|------|-------------|
| `envVarName` | `string` | The environment variable name this maps to (e.g., `DATABASE_URL`). |
| `label` | `string` | Human-readable label for the CLI prompt. |
| `type` | `ParameterType` | Value type: `String`, `Secret`, `Url`, `Integer`, `Boolean`, `Choice`. |
| `required` | `bool` | Whether a value is mandatory (default `true`). |
| `defaultValue` | `?string` | Default value shown in the prompt (default `null`). |
| `description` | `?string` | Help text shown below the prompt (default `null`). |
| `choices` | `list<string>` | Available choices when type is `Choice`. |

## ParameterHintProviderInterface

Definitions can implement `ParameterHintProviderInterface` to provide dynamic hints
based on previously collected values. This is useful when a default value depends on
another parameter (e.g., deriving a Redis session URL from the base Redis URL).

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getParameterHint(string $envVarName, array $collectedSoFar)` | `?string` | Returns a hint/default value for the given parameter based on values collected so far. Return `null` for no hint. |

## Creating Custom Definitions

### Using SimpleEnvVarDefinition

For simple env vars that only need basic validation (non-empty, URL format),
use `SimpleEnvVarDefinition`:

```php
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ConfigParameter;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\Definitions\SimpleEnvVarDefinition;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ParameterType;

new SimpleEnvVarDefinition(
    key: 'my-api',
    label: 'My API Service',
    sectionName: 'my-project/api',
    parameters: [
        new ConfigParameter(
            envVarName: 'MY_API_URL',
            label: 'API URL',
            type: ParameterType::Url,
            defaultValue: 'https://api.example.com',
        ),
        new ConfigParameter(
            envVarName: 'MY_API_KEY',
            label: 'API Key',
            type: ParameterType::Secret,
        ),
    ],
);
```

### Implementing EnvVarDefinitionInterface

For definitions that require custom validation (e.g., testing a connection),
implement `EnvVarDefinitionInterface` directly:

```php
<?php
declare(strict_types=1);

namespace App\Installer;

use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ConfigParameter;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\EnvVarDefinitionInterface;
use Pimcore\Bundle\InstallBundle\EnvVarDefinition\ParameterType;

final readonly class SolrEnvVarDefinition implements EnvVarDefinitionInterface
{
    public function getKey(): string
    {
        return 'solr';
    }

    public function getLabel(): string
    {
        return 'Apache Solr';
    }

    public function isRequired(): bool
    {
        return false; // optional service
    }

    public function getSectionName(): string
    {
        return 'my-project/solr';
    }

    public function getParameters(): array
    {
        return [
            new ConfigParameter(
                envVarName: 'SOLR_DSN',
                label: 'Solr URL',
                type: ParameterType::Url,
                defaultValue: 'http://solr:8983/solr/pimcore',
            ),
        ];
    }

    public function resolveEnvVars(array $collectedValues): array
    {
        return ['SOLR_DSN' => $collectedValues['SOLR_DSN'] ?? ''];
    }

    public function validate(array $collectedValues): array
    {
        $url = $collectedValues['SOLR_DSN'] ?? '';

        if ($url === '') {
            return ['Solr URL must not be empty.'];
        }

        // Test connection
        $ch = curl_init($url . '/admin/ping');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return [sprintf('Could not reach Solr at %s (HTTP %d).', $url, $httpCode)];
        }

        return [];
    }
}
```

## Adding Definitions via CLI

Use `--env-definition` to inject additional definitions alongside those defined in the profile,
without modifying the profile itself:

> When running via Docker, prepend `docker compose exec php` to the command below.

```bash
vendor/bin/pimcore-install \
  --install-profile='App\Installer\SkeletonProfile' \
  --env-definition='App\Installer\SolrEnvVarDefinition' \
  --env-definition='App\Installer\RedisSessionDefinition'
```

These definitions are collected and validated in addition to the profile's definitions.
This is useful for project-specific infrastructure that only some deployments need.
