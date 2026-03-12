# Additional Tools Installation

Pimcore uses third-party applications for certain functionalities such as video transcoding (FFMPEG), image optimization, and PDF generation. For a full list, see [System Requirements](../01_System_Requirements.md).

The installation commands below work on Debian-based Linux distributions (Debian, Ubuntu, Mint, etc.). For other distributions, adapt the commands to your package manager.

> All tools (including `composer`) must be added to the `$PATH` environment variable so Pimcore can find the executables.
> If you cannot control `$PATH`, you can also [manually configure the paths for each application](https://github.com/pimcore/skeleton/blob/2026.x/config/services.yaml).


## Composer
See the official install guide: [https://getcomposer.org/](https://getcomposer.org/)

## FFMPEG

Many Linux distributions ship FFMPEG only with free codecs, so they may not support commonly used video codecs such as MPEG-4.

```bash
sudo apt-get install ffmpeg
```

## PDF Generation

You can either install LibreOffice/Chromium locally or use them via Gotenberg (a Docker-powered API).

### LibreOffice, pdftotext, Inkscape

```bash
sudo apt-get install libreoffice libreoffice-script-provider-python libreoffice-math xfonts-75dpi poppler-utils inkscape libxrender1 libfontconfig1 ghostscript
```

### Gotenberg

Add Gotenberg to your Docker Compose services stack as described in the [Gotenberg installation guide](https://gotenberg.dev/docs/getting-started/installation#docker-compose).

Configure the Docker services:

- `pimcore.gotenberg.base_url` (defaults to `http://gotenberg:3000`)
- `pimcore.documents.preview_url_prefix` (e.g. `http://nginx:80`)

Install the required PHP library:

```bash
composer require gotenberg/gotenberg-php ^2.0
```

## Image Optimizers

### JPEGOptim

```bash
sudo apt-get install jpegoptim
```

### PngQuant

```bash
sudo apt-get install pngquant
```

### OptiPng

```bash
sudo apt-get install optipng
```

## Exiftool

```bash
sudo apt-get install libimage-exiftool-perl
```

## WebP

```bash
sudo apt-get install webp
```

## Graphviz

Required for workflow visualization:

```bash
sudo apt-get install graphviz
```


## Checking Your Installation

You can check system requirements via Pimcore Studio under `Tools` / `System Info & Tools` / `System-Requirements Check`.

Or via the CLI:

```bash
bin/console pimcore:system:requirements:check
```
