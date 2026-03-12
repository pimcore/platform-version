# Backward Compatibility Promise

Pimcore follows semantic versioning. Within a major version, backward compatibility is maintained for public APIs. Pimcore adopts the same backward compatibility promise as Symfony. For full details, see the [Symfony Backward Compatibility Promise](https://symfony.com/doc/current/contributing/code/bc.html).

## Versioning Rules

Both individual module versions and Platform Versions follow semantic versioning:

| Version Change | What to Expect |
|---------------|---------------|
| Bugfix (x.y.**Z**) | Bug fixes only. No API changes, no new features. Safe to update at any time. |
| Minor (x.**Y**.0) | New features, deprecations of existing features. No breaking changes to public API. |
| Major (**X**.0.0) | Breaking changes permitted. Previously deprecated features may be removed. Deprecated features are kept for at least one major version before removal. |

## Platform Version and Breaking Changes

Within a Platform Version's minor releases (e.g., 2025.1 to 2025.4), only minor and bugfix module versions change. Major module version changes are reserved for major Platform Version releases (e.g., 2025.x to 2026.x).
