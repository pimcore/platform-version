# API Tests

End-to-end Docker-based install of the Pimcore 2026.x Platform Version.

## Run locally

```bash
.github/scripts/00-localsetup.sh --token=<enterprisetoken> --platform-version=2026.1
```

On the first run the script pauses and prints a registration URL. Register the
instance, then add the resulting `PIMCORE_PRODUCT_KEY` to
`.github/scripts/.env.local` and press ENTER.

The test project is created at `../test-project/` (sibling of `platform-version/`).

## Services

| Service               | URL                                           |
|-----------------------|-----------------------------------------------|
| Pimcore UI            | http://localhost:8088/pimcore-studio          |
| Pimcore API docs      | http://localhost:8088/pimcore-studio/api/docs |
| OpenSearch Dashboards | http://localhost:5601                         |
| Mailpit               | http://localhost:8025                         |
| Mercure               | http://localhost:8080                         |

Admin credentials: `admin` / `admin`

## Reset / shutdown

```bash
.github/scripts/05-reset.sh      # fast DB reset, keeps containers
.github/scripts/06-teardown.sh   # full shutdown
```
