---
title: Primary/Replica Database
description: Configure Pimcore to use a primary/replica database connection for clustered environments.
---

# Primary/Replica Database Connection

Configure Pimcore to use a Doctrine primary/replica database connection for
clustered MariaDB/MySQL environments.

:::warning

This setup only works with **clustered** (synchronous replication) MariaDB/MySQL
environments, **not** with asynchronous primary/replica setups. Pimcore's
multi-layered caching requires access to the latest data at all times.
Asynchronous replication does not guarantee this.

:::

## Create a Connection Class

Create a project-specific database connection class at `src/Db/Connection.php`:

```php
<?php

namespace App\Db;

use Doctrine\DBAL\Connections\PrimaryReadReplicaConnection;

class Connection extends PrimaryReadReplicaConnection
{
    public function connect($connectionName = null): bool
    {
        $returnValue = parent::connect($connectionName);

        if ($returnValue) {
            $this->_conn->query('SET default_storage_engine=InnoDB;');
            $this->_conn->query("SET sql_mode = '';");
        }

        return $returnValue;
    }
}
```

## Configure the Connection

The main database connection configured for Pimcore serves as the primary.
Add replica hosts in your Doctrine configuration. This example adds one replica
where only the host differs - all other options are reused from the primary:

```yaml
doctrine:
    dbal:
        connections:
            default:
                wrapper_class: '\App\Db\Connection'
                replicas:
                    replica1:
                        host: 'replica1'
                        port: 3306
                        dbname: dbname
                        user: username
                        password: password
                        charset: UTF8MB4
```

Add as many replica entries as needed. Doctrine distributes read queries across
all configured replicas while routing write queries to the primary.
