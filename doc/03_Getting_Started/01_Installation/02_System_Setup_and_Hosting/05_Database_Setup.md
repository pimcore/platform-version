# Database Setup

Pimcore requires a MySQL or MariaDB database with `utf8mb4` as the character set.

> You must create the database manually before running the Pimcore installer,
> which automatically creates the underlying schema.

## Create a New Database

```bash
mysql -u root -p -e "CREATE DATABASE project_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;"
```

## Database Permissions

Pimcore requires all permissions on the database level. Create a user with the necessary rights:

```sql
CREATE USER 'project_user'@'localhost' IDENTIFIED BY 'PASSWORD';
GRANT ALL ON `project_database`.* TO 'project_user'@'localhost';
```

## Database Server Configuration (Optional)

You can enforce required settings by placing a `pimcore.cnf` file in the config directory
(e.g. `/etc/mysql/conf.d/`). Refer to your server configuration manual for the exact location.

```ini
# MySQL Server configuration for Pimcore.

# Applies to any client connecting to this server
[client]
default-character-set=utf8mb4

# Applies to mysql cli client application
[mysql]
default-character-set=utf8mb4

# Applies to mysql server
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_520_ci
init-connect='SET NAMES utf8mb4'
#lower_case_table_names=1 # activate when working on different operating system platforms, like macOS + Windows and/or Linux
# this is not required when consistently working on Linux or Docker
```

Setting `lower_case_table_names=1` ensures that tables for Pimcore classes are created in lower case
even though their class names contain capital letters.

Starting with MySQL 8, you can no longer change the `lower_case_table_names` option
after the data directory has been initialized.
If the directory was already initialized with a different setting, MySQL will fail to start.

:::warning

To fix this, you must remove and reinitialize the MySQL data directory,
which **deletes all databases**. Back up all existing databases with `mysqldump` before proceeding.

:::

```bash
rm -rf /var/lib/mysql
mkdir /var/lib/mysql
chown mysql:mysql /var/lib/mysql
mysqld --initialize
```
