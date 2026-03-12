# Directory Structure

After installing a Pimcore package, you will see the folder structure described below. The directory layout follows the [Symfony best practices](https://github.com/symfony/symfony-demo). During this tutorial, you will work primarily with `/src/` (controllers), `/templates/` (Twig templates), and `/public/` (web root).

| Directory | Description |
|-----------|-------------|
| `/bin/` | Executable files (e.g. `bin/console`). |
| `/config/` | Application configuration files. |
| `/public/` | The **document root** for your project. Point your virtual host to this directory. |
| `/src/` | The project's PHP code (services, controllers, event listeners, etc.). |
| `/templates/` | Twig templates for the application. |
| `/var/` | Private generated files, not accessible via the web (cache, logs, etc.). |
| `/vendor/` | Third-party libraries installed by [Composer](https://getcomposer.org/) / [Packagist](https://packagist.org/). |


### The `public/` Directory

The web root directory is the home of all public and static files like images, stylesheets, and JavaScript files. It also contains the front controller (`index.php`), which handles all requests to your application. See the [skeleton front controller](https://github.com/pimcore/skeleton/blob/2026.x/public/index.php) for reference.


### The `src/` Directory

The Kernel class is the main entry point of the Symfony application configuration and is stored in the `src/` directory. Your controllers, services, and event listeners live here as well.


For more information about the folder structure and architecture, see the [Symfony documentation](https://symfony.com/doc/current/best_practices.html#use-the-default-directory-structure).

In the next step, you will [upload assets](./02_Assets.md) that your product page will use.
