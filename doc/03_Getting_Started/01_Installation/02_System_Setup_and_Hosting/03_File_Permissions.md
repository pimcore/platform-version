# File Permissions

Pimcore requires write access to the following directories: `/var` and `/public/var`.

If you know which user executes PHP on your system (PHP-FPM user, Apache user, etc.), give write access to that user. Run the following commands in your installation directory, replacing `YOURUSER` and `YOURGROUP` with your configuration:

```bash
chown -R YOURUSER:YOURGROUP var public/var
```

For more information about Symfony file permissions, see the [Symfony documentation](https://symfony.com/doc/current/setup/file_permissions.html).

To execute CLI tools (the Pimcore or Symfony console, for instance), grant execute permissions:

```bash
chmod ug+x bin/*
```
