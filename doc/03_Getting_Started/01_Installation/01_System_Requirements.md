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
- Nginx (see [Nginx Configuration](./02_System_Setup_and_Hosting/02_Nginx_Configuration.md) for a sample config)


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
- [Composer 2](https://getcomposer.org/) (added to `$PATH` - see also
  [Additional Tools Installation](./02_System_Setup_and_Hosting/06_Additional_Tools_Installation.md))

#### Recommended or Optional Modules and Extensions
- [imagick](https://php.net/imagick)
  (if not installed, *gd* is used instead, but with fewer supported image types)
  - LCMS delegate for ImageMagick to prevent negative colors for CMYK images
- [phpredis](https://github.com/phpredis/phpredis) (recommended cache backend adapter)
- [mysqli](https://php.net/mysqli) (PDO is still required for parameter mappings)

### Database Server
- MariaDB >= 10.3
- MySQL >= 8.0
- Percona Server (supported versions: see MySQL)
- [AWS Aurora](https://aws.amazon.com/about-aws/whats-new/2021/11/amazon-aurora-mysql-8-0/)
  (supported versions: see MySQL)

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

The recommended setup uses the official Docker image (`dunglas/mercure:latest`) with an Nginx reverse proxy.
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

See [Additional Tools Installation](./02_System_Setup_and_Hosting/06_Additional_Tools_Installation.md) for installation instructions.

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
