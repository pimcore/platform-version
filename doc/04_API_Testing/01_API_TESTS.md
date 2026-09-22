# API Tests

End-to-end Docker-based install of the Pimcore 2026.x Platform Version with
Playwright API tests from [pimcore/studio-tests](https://github.com/pimcore/studio-tests).

## Prerequisites

- Docker & Docker Compose
- Node.js 22+ and npm
- A Pimcore enterprise repo token

## Run locally

### 1. Install Playwright dependencies

```bash
cd tests
npm install
```

### 2. Full setup + tests

```bash
.github/scripts/00-localsetup.sh --token=<enterprisetoken> --platform-version=2026.3
```

On the first run the script pauses and prints a registration URL. Register the
instance, then add the resulting `PIMCORE_PRODUCT_KEY` to
`.github/scripts/.env.local` and press ENTER.

The test project is created at `../test-project/` (sibling of `platform-version/`).


### 3. Run tests only (Pimcore already running)

```bash
.github/scripts/03-run-tests.sh
```

This will auto-detect `/tests`, install npm dependencies if needed,
and run `npx playwright test` against `http://localhost:8088`.

### 4. Run tests in PHPStorm
See [PHPStorm Setup Guide](02_PHPSTORM_SETUP.md) for more details.YX

## CI (GitHub Actions)

The `api-tests.yml` workflow:

1. Checks out `platform-version`
2. Sets up the Pimcore environment (Docker containers, composer install)
3. Installs Node.js 22 and Playwright
4. Runs `npx playwright test` against `http://localhost:8088`
5. Uploads `playwright-report/` and `test-results/` as artifacts (30-day retention)

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

When releasing a new platform version (e.g. `2026.3`), update the following:

1. **`.github/workflows/api-tests.yml`** — the scheduled run tests the newest
   stable line plus the dev line, so the old stable version is *replaced*, not
   appended:
   - `inputs.branch.options` — replace the previous stable entry (e.g. `'2026.2'`)
     with the new one (`'2026.3'`); `'2026.x'` stays
   - `inputs.platform_version.description` — update the examples
   - `strategy.matrix.include` — the three scheduled legs are
     `{ref: <new>, platform: <new>}` (installs `^2026.3`),
     `{ref: <new>, platform: <new>.x}` (installs `2026.3.x-dev` from the release
     branch) and `{ref: 2026.x, platform: 2026.x}` (installs `2026.x-dev`).
     Replace both `<new>` legs; update the comment above them as well.
   - The release branch (e.g. `2026.3`) must exist, otherwise the checkout of the
     stable legs fails. Note that `schedule:` only ever fires on the default
     branch, so this edit is only effective once it reaches `2026.x`.
2. **`.github/scripts/00-localsetup.sh`, `01-setup-environment.sh`,
   `02-install-pimcore.sh`** — bump the `PLATFORM_VERSION` defaults and the
   usage examples. CI always passes the version explicitly, so these defaults
   only affect local runs.
3. **`.github/workflows/osv-checks.yaml`** — add a leg for the new release tag
   (e.g. `v2026.3.0`). Add it only *after* the tag exists, otherwise the version
   cannot be resolved and the scan fails. Drop legs of lines that reached
   end-of-life; keep the LTS lines.
4. **`.github/ISSUE_TEMPLATE/Bug-Report.yaml`** — prepend the new version to the
   *Affected Version* dropdown (the list accumulates). The same option must also
   be added to the repository-level issue field referenced by
   `ISSUE_FIELD_ID_PLATFORM_VERSION`, otherwise `issue-fields-sync-bug.yml`
   fails on every new bug report. Issue templates are read from the default
   branch only.
