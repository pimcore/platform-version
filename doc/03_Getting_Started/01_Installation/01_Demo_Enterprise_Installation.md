# Demo Enterprise Installation

The demo enterprise package includes all enterprise extensions, Pimcore Studio, and pre-built
blueprints showcasing advanced features.
All Docker services (OpenSearch, Mercure, Redis, Gotenberg, Supervisord) are pre-configured.
It requires credentials for the Pimcore enterprise repository.

## Step 1: Create the Project

Configure enterprise repository credentials and create the project.
Replace `<YOUR_USERNAME>` and `<YOUR_TOKEN>` with your Pimcore enterprise credentials:

```bash
docker run --rm -v `pwd`:/var/www/html -it pimcore/pimcore:php8.5-latest sh -c \
  'composer --global config repositories.pimcore composer https://repo.pimcore.com/<YOUR_USERNAME>/ ; \
   composer create-project --no-scripts pimcore/demo-enterprise my-project \
   --repository="{\"url\": \"https://token:<YOUR_TOKEN>@repo.pimcore.com/<YOUR_USERNAME>/\", \"type\": \"composer\"}" \
   -n --ignore-platform-req=php --no-scripts'
```

Switch to the project directory:

```bash
cd my-project/
```

## Step 2: Configure and Start Docker Services

1. Run `` echo `id -u`:`id -g` `` to retrieve your local user and group ID.
2. Open `docker-compose.yaml`, uncomment all `user: '1000:1000'` lines,
   and update the IDs if they differ from your local user.
3. Start the services:

```bash
docker compose up -d
```

The demo enterprise `docker-compose.yaml` already includes all required services
(MariaDB, Redis, OpenSearch, Mercure, Gotenberg, Supervisord for messenger workers).

## Step 3: Run the Installer

Run the Pimcore installer with the demo enterprise profile:

```bash
docker compose exec php vendor/bin/pimcore-install \
  --install-profile='App\Installer\DemoEnterpriseProfile'
```

The installer will interactively prompt for all required configuration values.
Product registration is mandatory and the installer requires a valid product key
before installation can complete.
See [Product Registration](../02_Product_Registration.md) for details.

The installer automatically:
- Writes all configuration to `.env.local`
- Imports the demo enterprise database (pre-built content and blueprints)
- Installs and registers all bundles
- Creates the database schema and admin user
- Installs assets, builds search indices, and runs all post-install commands

This can take up to 20 minutes for the demo enterprise package.

For non-interactive (CI) installations, set env vars in `.env` or `docker-compose.yaml`
before running the installer with `--no-interaction`.
See [Advanced Installation Topics](./03_Advanced_Installation_Topics/README.md)
for the full list of supported environment variables.

## Step 4: Done

Visit your Pimcore instance:

- Frontend: [http://localhost](http://localhost)
- Pimcore Studio: [http://localhost/pimcore-studio](http://localhost/pimcore-studio)
