# API Tests

End-to-end Docker-based install of the Pimcore 2026.x Platform Version with
Playwright API tests from [pimcore/studio-tests](https://github.com/pimcore/studio-tests).

## Prerequisites

- Docker & Docker Compose
- Node.js 22+ and npm
- A Pimcore enterprise repo token

## Run locally

### 1. Clone studio-tests

Clone the test suite as a sibling directory:

```bash
git clone git@github.com:pimcore/studio-tests.git ../studio-tests
cd ../studio-tests
npm install
```

Use the branch matching your platform version (e.g. `2026.1`, `2026.x`, or `main`).

### 2. Full setup + tests

```bash
.github/scripts/00-localsetup.sh --token=<enterprisetoken> --platform-version=2026.1
```

On the first run the script pauses and prints a registration URL. Register the
instance, then add the resulting `PIMCORE_PRODUCT_KEY` to
`.github/scripts/.env.local` and press ENTER.

The test project is created at `../test-project/` (sibling of `platform-version/`).

If `../studio-tests` is not found, tests are skipped with a message showing
clone instructions.

### 3. Run tests only (Pimcore already running)

```bash
.github/scripts/03-run-tests.sh
```

This will auto-detect `../studio-tests`, install npm dependencies if needed,
and run `npx playwright test` against `http://localhost:8088`.

## CI (GitHub Actions)

The `api-tests.yml` workflow:

1. Checks out `platform-version`
2. Checks out `pimcore/studio-tests` at the exact `platform_version` input (default: `2026.1`)
3. Sets up the Pimcore environment (Docker containers, composer install)
4. Installs Node.js 22 and Playwright
5. Runs `npx playwright test` against `http://localhost:8088`
6. Uploads `playwright-report/` and `test-results/` as artifacts (30-day retention)

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

## New Platform Version Release

When releasing a new platform version (e.g. `2026.2`), update the following:

1. **`.github/workflows/api-tests.yml`** — change the default fallback version
   `'2026.1'` to the new version in:
   - `inputs.platform_version.default` (line 8)
   - The `|| '2026.1'` fallbacks in the setup, install, and studio-tests checkout steps
2. **`pimcore/studio-tests`** — ensure a matching branch exists (e.g. `2026.2`)
