# Platform Versions

The Pimcore platform consists of the core framework and a growing number of extensions, each with its own repository, version, and release cycle. As the number of modules grows, tracking compatible versions across all packages becomes increasingly complex.

The Platform Version solves this by providing a curated set of specific module versions that are tested together and verified by Pimcore. It ships as a single Composer metapackage (`pimcore/platform-version`) that constrains all Pimcore module versions to a compatible combination.

## Benefits

- A tested, compatible set of all Pimcore module versions in one dependency
- Combined release notes covering all modules per Platform Version release
- Documentation aligned to Platform Version releases
- Simplified updates through a single version constraint

## Versioning Schema

Platform Versions follow a **Major.Minor** schema (e.g. 2025.4, 2026.1).

| Version Change | Rules |
|---------------|-------|
| **Major** (year boundary, e.g. 2025.x to 2026.x) | May include major module version updates. Released once per year. |
| **Minor** (e.g. 2025.1 to 2025.2) | Minor module version updates only. Released approximately quarterly. |
| **Bugfix** (within a minor) | Bugfix module versions install automatically via `composer update` without changing the Platform Version. |

Starting with Platform Version 2026.1, all module versions are synchronized with the platform version number. This means every module included in 2026.1 carries the version number 2026.1.

## Support Policy

Community support for a Platform Version ends with the release of the next Platform Version.

### Long-Term Support (LTS)

Selected Platform Versions are designated as LTS releases. LTS provides **3 years** of extended support beyond the regular release cycle, covering:

- **Security fixes** for CVE-rated vulnerabilities with critical severity
- **Critical bug fixes** limited to issues causing potential data loss or infrastructure destruction

LTS is included in the Enterprise and Enterprise PaaS editions only. For details, see [Long Term Support](https://pimcore.com/en/products/services/long-term-support). For pricing, see [pimcore.com/en/pricing](https://pimcore.com/en/pricing).

### Support Timeline

import VersionTimeline from '@site/src/components/VersionTimeline';

<VersionTimeline />

## Platform Version Releases

| Version | Release Notes | Module Details | LTS | LTS Support Until |
|---------|--------------|----------------|:---:|-------------------|
| 2026.2  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/01_2026.2.md) | [Details](01_2026.2.md) | | |
| 2026.1  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/02_2026.1/README.md) | [Details](02_2026.1.md) | | |
| 2025.4  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/03_2025.4.md) | [Details](03_2025.4.md) | ✅ | December 2028 |
| 2025.3  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/04_2025.3.md) | [Details](04_2025.3.md) | | |
| 2025.2  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/05_2025.2.md) | [Details](05_2025.2.md) | | |
| 2025.1  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/06_2025.1.md) | [Details](06_2025.1.md) | | |
| 2024.4  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/07_2024.4.md) | [Details](07_2024.4.md) | ✅ | December 2026 |
| 2024.3  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/08_2024.3.md) | [Details](08_2024.3.md) | | |
| 2024.2  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/09_2024.2.md) | [Details](09_2024.2.md) | | |
| 2024.1  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/10_2024.1.md) | [Details](10_2024.1.md) | | |
| 2023.3  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/11_2023.3.md) | [Details](11_2023.3.md) | ✅ | December 2025 |
| 2023.2  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/12_2023.2.md) | [Details](12_2023.2.md) | | |
| 2023.1  | [Release Notes](../05_Updating_Pimcore/02_Release_Notes/13_2023.1.md) | [Details](13_2023.1.md) | | |
| 2022.0  | - | [Details](14_2022.0.md) | ✅ | August 2025 |
