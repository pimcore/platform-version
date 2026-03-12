# Symfony Messenger

Pimcore uses the Symfony Messenger for background processing of maintenance tasks, search indexing, and other asynchronous operations.

## Handle Failed Jobs

If jobs fail during processing, they are discarded from their transport after a defined number of retries. You can redirect failed jobs to a dedicated transport instead of discarding them:

```yaml
framework:
    messenger:
        transports:
            pimcore_failed_jobs:
                dsn: "doctrine://default?queue_name=pimcore_failed_jobs&table_name=messenger_messages_pimcore_failed"

            pimcore_core:
                dsn: "doctrine://default?queue_name=pimcore_core"
                # For RabbitMQ (recommended) use this as example:
                # dsn: "amqp://rabbitmq:5672/%2f/pimcore_core"
                failure_transport: pimcore_failed_jobs
```

Failed jobs can be re-processed later after fixing the underlying issue:

```bash
bin/console messenger:consume pimcore_failed_jobs
```

See the [Symfony documentation](https://symfony.com/doc/current/messenger.html#saving-retrying-failed-messages) for more options on failed job processing.

[RabbitMQ](https://www.rabbitmq.com/#getstarted) is the recommended message queue for production use.

**Resources:**
- [RabbitMQ PHP tutorial](https://www.rabbitmq.com/tutorials/tutorial-one-php.html)
- [Skeleton messenger config example](https://github.com/pimcore/skeleton/blob/2026.x/.docker/messenger.yaml)
- [Symfony Messenger deployment guide](https://symfony.com/doc/current/messenger.html#deploying-to-production) (covers supervisor and systemd setup for running consumers as daemons)
