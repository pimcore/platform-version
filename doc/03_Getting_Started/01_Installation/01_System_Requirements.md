# System Requirements

## Server Requirements

For production, a *nix based system is highly recommended.

> Have a look at the official [Docker images](https://hub.docker.com/r/pimcore/pimcore) and the
> docker-compose files in the [skeleton](https://github.com/pimcore/skeleton/blob/2026.x/docker-compose.yaml)
> and [demo enterprise](https://github.com/pimcore/demo-enterprise) packages.


### Web Server
- Apache >= 2.4
  - mod_rewrite
  - .htaccess support (`AllowOverride All`)
- Nginx (see the skeleton [nginx.conf](https://github.com/pimcore/skeleton/blob/2026.x/.docker/nginx.conf) for a working sample config)


### PHP 8.5+
Both **mod_php** and **FCGI (FPM)** are supported.

#### Required Settings, Modules, and Extensions
- `memory_limit` >= 128M
- `upload_max_filesize` and `post_max_size` >= 100M (depending on your data)
- [pdo_mysql](https://php.net/pdo-mysql)
- [iconv](https://php.net/iconv)
- [dom](https://php.net/dom)
- [simplexml](https://php.net/simplexml)
- [gd](https://php.net/gd)
- [exif](https://php.net/exif)
- [fileinfo](https://php.net/fileinfo)
- [mbstring](https://php.net/mbstring)
- [zlib](https://php.net/zlib)
- [zip](https://php.net/zip)
- [intl](https://www.php.net/intl)
- [opcache](https://php.net/opcache)
- [curl](https://php.net/curl)
- [ext-openssl](https://www.php.net/openssl)
- CLI SAPI (for cron jobs)
- [Composer 2](https://getcomposer.org/) (added to `$PATH`)

#### Recommended or Optional Modules and Extensions
- [imagick](https://php.net/imagick)
  (if not installed, *gd* is used instead, but with fewer supported image types)
  - LCMS delegate for ImageMagick to prevent negative colors for CMYK images
- [phpredis](https://github.com/phpredis/phpredis) (recommended cache backend adapter)
- [mysqli](https://php.net/mysqli) (PDO is still required for parameter mappings)

### Database Server
- MariaDB >= 10.11
- MySQL >= 8.4
- Percona Server for MySQL (supported versions: see MySQL)
- [AWS Aurora MySQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Versions.html)
  8.4 or later (Aurora MySQL 3 is MySQL 8.0 compatible and therefore not supported)

Pimcore is tested against the following long-term-support (LTS) series:

| Database | Tested versions |
|---|---|
| MariaDB | 10.11, 11.4, 11.8, 12.3 |
| MySQL | 8.4, 9.7 |

Only LTS series are supported. MySQL Innovation releases (e.g. 9.0 - 9.6 and the calendar-versioned 26.x releases)
and MariaDB rolling releases (e.g. 12.0 - 12.2 and 13.x) are neither tested nor supported.

> Version support follows the vendors' lifecycles: MySQL 8.0 and MariaDB 10.6 (and older) have reached end of life
> and are no longer supported. `bin/console pimcore:system:requirements:check` reports a warning if the database
> server is older than the minimum version above.

> If you configure `serverVersion` for the database connection (for example in `DATABASE_URL`), keep it in sync
> with your actual server: Doctrine DBAL uses it to select the SQL platform instead of asking the server
> (e.g. `serverVersion=8.4` or `serverVersion=mariadb-10.11.0`).

#### Features
- InnoDB / XtraDB storage engine
- Support for InnoDB fulltext indexes

#### Permissions
All permissions on database level, specifically:
- Select, Insert, Update, Delete table data
- Create tables
- Drop tables
- Alter tables
- Manage indexes
- Create temp-tables
- Lock tables
- Execute
- Create view
- Show view

> For installing the [demo enterprise](https://github.com/pimcore/demo-enterprise) package, `Create routine` and `Alter routine` are additionally needed.

#### System Variables
```
[mysqld]
innodb_file_per_table = 1

[mariadb]
plugin_load_add = ha_archive # optional but recommended, starting from MariaDB 10.1 archive format is no longer activated by default (check and adapt for MySQL or other database software)
```

### Search Engine (Required for Pimcore Studio)

Pimcore Studio uses the Generic Data Index bundle for search and indexing.
One of the following search engines is required:

- **OpenSearch >= 2.7** (recommended)
- **Elasticsearch >= 8.0.0**

See the [Installation guide](./README.md) for Docker setup and configuration.

### Mercure (Required for Pimcore Studio)

Pimcore Studio uses [Mercure](https://mercure.rocks/) for real-time updates
(progress tracking, live notifications).
A Mercure hub must be available and reachable by both the server and the browser.

The recommended setup uses the official Docker image (`dunglas/mercure:v1`) with an Nginx reverse proxy.
Pimcore Studio still speaks the Mercure 0.x protocol: on a Mercure 1.x hub (1.1.3 or later) add
`protocol_version_compatibility 8` to the hub's `MERCURE_EXTRA_DIRECTIVES` environment variable. A Mercure 0.x hub
(e.g. `dunglas/mercure:v0.24`) needs no such directive and refuses to start with it.
See the [Installation guide](./README.md) for configuration details.

### Redis (Optional but Recommended for Caching)
All versions > 3 are supported.

#### Configuration
```
# select an appropriate value for your data
maxmemory 768mb

# IMPORTANT! Other policies will cause random inconsistencies of your data!
maxmemory-policy volatile-lru
save ""
```

### RabbitMQ (Optional but Recommended for Messenger)
Pimcore uses the Symfony Messenger for background processing.
As the number of elements grows, a robust queue system becomes important.
RabbitMQ is recommended for its performance and scalability in managing high message volumes
and complex workflows.

See [Symfony Messenger](./03_Advanced_Installation_Topics/01_Symfony_Messenger.md) for messenger configuration.
For an example configuration, refer to the
[skeleton messenger config](https://github.com/pimcore/skeleton/blob/2026.x/.docker/messenger.yaml).

### Operating System
Ensure all required packages for proper locale support by PHP are installed.
On Debian-based systems, install the required locale packages:

```bash
apt-get install locales-all
```

A reboot may be required on some systems.

### Additional Server Software
- FFMPEG (>= 3)
- Ghostscript (>= 9.16)
- LibreOffice (>= 4.3)
- Chromium/Chrome
- xvfb
- timeout (GNU core utils)
- pdftotext (poppler utils)
- inkscape
- pngquant
- optipng
- jpegoptim
- exiftool
- [Graphviz](https://www.graphviz.org/)

All of these tools are pre-installed in the official [Pimcore Docker images](https://hub.docker.com/r/pimcore/pimcore).
For custom setups, install them with your distribution's package manager and make sure they are
added to `$PATH` so Pimcore can find the executables — alternatively, you can
[manually configure the path for each application](https://github.com/pimcore/skeleton/blob/2026.x/config/services.yaml).

## Browser Requirements
Pimcore Studio supports the latest two versions of all four major desktop browsers at the time of a release:

- **Google Chrome (Recommended)**
- Mozilla Firefox
- Microsoft Edge
- Apple Safari

### System Requirements Check

A built-in tool gives you an overview of required and optional system requirements.

You can check via the CLI:

```bash
bin/console pimcore:system:requirements:check
```
