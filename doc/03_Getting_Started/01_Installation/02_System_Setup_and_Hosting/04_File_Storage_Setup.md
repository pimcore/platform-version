# File Storage Setup

Pimcore uses [Flysystem](https://github.com/thephpleague/flysystem), a flexible file storage library,
for storing assets, thumbnails, versioning data, and more.

To configure a custom file storage, override any of the default definitions with a specific adapter:

```yaml
flysystem:
    storages:
        pimcore.asset.storage:
            # Storage for asset source files, directory structure mirrors the asset tree
            adapter: 'local'
            visibility: private
            directory_visibility: public
            options:
                directory: '%kernel.project_dir%/public/var/assets'
        pimcore.asset_cache.storage:
            # Storage for cached asset files, e.g. PDF and image files generated from Office files or videos
            # which are then used by the thumbnail engine as source files
            adapter: 'local'
            visibility: private
            options:
                directory: '%kernel.project_dir%/public/var/tmp/asset-cache'
        pimcore.thumbnail.storage:
            # Storage for image and video thumbnails, directory structure mirrors the source asset tree
            adapter: 'local'
            visibility: private
            directory_visibility: public
            options:
                directory: '%kernel.project_dir%/public/var/tmp/thumbnails'
        pimcore.version.storage:
            # Storage for serialized versioning data of documents/assets/data objects
            adapter: 'local'
            visibility: private
            options:
                directory: '%kernel.project_dir%/var/versions'
        pimcore.recycle_bin.storage:
            # Storage for serialized recycle bin data of documents/assets/data objects
            adapter: 'local'
            visibility: private
            options:
                directory: '%kernel.project_dir%/var/recyclebin'
        pimcore.admin.storage:
            # Storage for shared admin resources, such as user avatars, custom logos, etc.
            adapter: 'local'
            visibility: private
            options:
                directory: '%kernel.project_dir%/var/admin'
```

You can explore all [official adapters](https://flysystem.thephpleague.com/docs/adapter/local/) and
[third-party adapters](https://packagist.org/?query=flysystem%20adapter) to use custom file storage.

All storages need to be shared between all computing nodes in a clustered environment.
The default `local` adapter only works on single-server setups.

## Frontend Prefixes

If using a remote storage (e.g. S3) or a CDN, prefix the frontend path of assets and thumbnails:

```yaml
pimcore:
    assets:
        frontend_prefixes:
            # Prefix for original asset files
            source: https://oreo-12345678990.cloudfront.net/asset
            # Prefix for all generated image and video thumbnails
            thumbnail: https://tavi-12345678990.cloudfront.net/thumbnail
            # Prefix for deferred thumbnail placeholders. Thumbnails are usually
            # generated on demand. This prefix is used for thumbnails not yet generated
            # and therefore not on the thumbnail storage yet. A possible use case:
            # point to a dedicated host that handles thumbnail generation to offload
            # the main application server(s).
            # thumbnail_deferred: https://thumbnail-generator-node.example.com
```

This adds the configured prefix to asset and thumbnail paths in the frontend context (e.g. your templates).
For example, `/Sample/Tavi.jpg` becomes `https://tavi-12345678990.cloudfront.net/asset/Sample/Tavi.jpg`.

## Example: AWS S3 Adapter for Assets

Install the AWS S3 adapter:

```bash
composer require league/flysystem-aws-s3-v3
```

Configure the AWS S3 client service:

| Name | Description |
|------|-------------|
| `endpoint` | AWS S3 endpoint URL |
| `region` | AWS region to access the bucket |
| `version` | `latest` or a specific version |
| `credentials` | IAM access keys: access key ID and secret access key |

```yaml
# config/packages/prod/flysystem.yaml
services:
    assets_s3:
        class: 'Aws\S3\S3Client'
        arguments:
            -  endpoint: 'https://s3.eu-central-1.amazonaws.com'
               region: 'eu-central-1'
               version: 'latest'
               credentials:
                   key: '%env(S3_STORAGE_KEY)%'
                   secret: '%env(S3_STORAGE_SECRET)%'
```

For required IAM permissions, see the [Flysystem documentation](https://flysystem.thephpleague.com/docs/adapter/aws-s3-v3/).

Then override the core Flysystem configuration to use the remote storage:

```yaml
# config/packages/prod/flysystem.yaml
flysystem:
    storages:
        pimcore.asset.storage:
            adapter: 'aws'
            visibility: public
            options:
                client: 'assets_s3'
                bucket: 'bucket-name'
                prefix: assets
```

## Handling Non-Publicly Accessible Storages

If your storage is not publicly accessible, configure a frontend prefix and create a streaming controller:

```yaml
pimcore:
    assets:
        frontend_prefixes:
            source: https://your.domain/asset-stream
```

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Pimcore\Model\Asset;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;

class AssetStreamController
{
    #[Route('/asset-stream{uri}', requirements: ['uri' => '.+'])]
    public function stream(string $uri): Response
    {
        if (!empty($asset = Asset::getByPath($uri)) && $stream = $asset->getStream()) {
            return new StreamedResponse(function () use ($stream) {
                fpassthru($stream);
            }, 200, [
                'Content-Type' => $asset->getMimeType(),
                'Access-Control-Allow-Origin' => '*',
            ]);
        }

        return new Response('', Response::HTTP_NOT_FOUND);
    }
}
```

## Storage Migration

When switching to a different storage type,
use Pimcore's built-in migration command to copy contents from the old storage to the new one.

1. Create Flysystem configuration for source and target storages.
   The naming convention is: `pimcore.{storagetype}.storage.source` and `pimcore.{storagetype}.storage.target`:

| Migration Task | Source Node | Target Node |
|----------------|-------------|-------------|
| `asset` | pimcore.asset.storage.source | pimcore.asset.storage.target |
| `thumbnail` | pimcore.thumbnail.storage.source | pimcore.thumbnail.storage.target |
| `version` | pimcore.version.storage.source | pimcore.version.storage.target |

```yaml
flysystem:
    storages:
        pimcore.asset.storage.source:
            adapter: 'local'
            visibility: public
            options:
                directory: '%kernel.project_dir%/public/var/assets'

        pimcore.asset.storage.target:
            adapter: 'aws'
            visibility: public
            options:
                client: 'assets_s3'
                bucket: 'bucket-name'
                prefix: asset

        pimcore.thumbnail.storage.source:
            adapter: 'local'
            visibility: private
            directory_visibility: public
            options:
                directory: '%kernel.project_dir%/public/var/tmp/thumbnails'

        pimcore.thumbnail.storage.target:
            adapter: 'aws'
            visibility: public
            options:
                client: 'assets_s3'
                bucket: 'bucket-name'
                prefix: thumbnail
```

2. Run the migration command with the storage type as argument:

```bash
bin/console pimcore:migrate:storage asset
```

You can pass multiple arguments to migrate different storage types in one go.
