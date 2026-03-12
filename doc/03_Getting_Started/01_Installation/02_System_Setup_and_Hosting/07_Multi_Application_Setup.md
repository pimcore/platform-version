# Multi-Application Setup

## Sessions

When running multiple applications on the same domain, session cookie collisions can prevent you from logging in to both systems at the same time.

For example, if you run a web shop on `http://example.org` and Pimcore on `http://pim.example.org`, you may end up with two cookies named `PHPSESSID` (if `session.name` in `php.ini` is the same for both):

| Name | Value | Domain | Path |
|------|-------|--------|------|
| PHPSESSID | 5a9b08750387d9e11c738a2947d93e38 | .example.org | / |
| PHPSESSID | irqnjh5p96gp2i8iu743ulm32p | pim.example.org | / |

The first cookie comes from the web shop, the second from Pimcore. Trying to log in at `http://example.org/admin` will result in a 403 Forbidden error because the browser sends both cookies, and the web shop's cookie for `.example.org` takes precedence.

Prevent this by setting a unique session name in your `config.yaml`:

```yaml
framework:
    session:
        name: "PIMCORE_SESSION_ID"
```

This ensures the session cookies do not conflict, and you can log in to both applications at the same time.
