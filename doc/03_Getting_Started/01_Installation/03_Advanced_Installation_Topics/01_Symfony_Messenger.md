# Symfony Messenger

Pimcore uses the Symfony Messenger for background processing of maintenance tasks,
search indexing, and other asynchronous operations.

## Transport Configuration

The messenger transport DSN is configured via the `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX`
environment variable. The installer sets this automatically based on the chosen transport backend.
Each transport's DSN is formed by appending the queue name to the prefix:

| Transport | `PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` | Example Queue DSN |
|-----------|------------------------------------------|-------------------|
| Doctrine (default) | `doctrine://default?queue_name=` | `doctrine://default?queue_name=pimcore_core` |
| AMQP (RabbitMQ) | `amqp://guest:guest@rabbit:5672/%2f/` | `amqp://guest:guest@rabbit:5672/%2f/pimcore_core` |
| Redis | `redis://redis:6379/` | `redis://redis:6379/pimcore_core` |

To switch transports, change only the env var and restart workers. No YAML editing is needed.

## Handle Failed Jobs

If jobs fail during processing, they are discarded from their transport after a defined number of retries.
You can redirect failed jobs to a dedicated transport instead of discarding them:

```yaml
framework:
    messenger:
        transports:
            pimcore_failed_jobs:
                dsn: '%pimcore.messenger.transport_dsn_prefix%pimcore_failed_jobs'

            pimcore_core:
                dsn: '%pimcore.messenger.transport_dsn_prefix%pimcore_core'
                failure_transport: pimcore_failed_jobs
```

The `pimcore.messenger.transport_dsn_prefix` parameter resolves from the
`PIMCORE_MESSENGER_TRANSPORT_DSN_PREFIX` environment variable, so the failed jobs
transport automatically uses the same backend (Doctrine, AMQP, or Redis) as all
other transports.

Failed jobs can be re-processed later after fixing the underlying issue:

```bash
bin/console messenger:consume pimcore_failed_jobs
```

See the [Symfony documentation](https://symfony.com/doc/current/messenger.html#saving-retrying-failed-messages)
for more options on failed job processing.

[RabbitMQ](https://www.rabbitmq.com/#getstarted) is the recommended message queue for production use.

**Resources:**
- [RabbitMQ PHP tutorial](https://www.rabbitmq.com/tutorials/tutorial-one-php.html)
- [Skeleton messenger config example](https://github.com/pimcore/skeleton/blob/2026.x/.docker/messenger.yaml)
- [Symfony Messenger deployment guide](https://symfony.com/doc/current/messenger.html#deploying-to-production) (covers supervisor and systemd setup for running consumers as daemons)
