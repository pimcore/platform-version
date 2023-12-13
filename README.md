---
title: Platform Version
---
# Pimcore Platform Version

The Pimcore platform consists of the **Pimcore Core Framework** and **Core Extensions** that can be added for your needs. 

Each module (Core Framework and the Core Extensions) has its own repository, its own version and is released indepedently.
The dependencies and compatibilities of the modules are defined in their `composer.json` file. Thus, it is possible to 
select specific and compatible module versions and update each of them separately. 

As all the modules add up to significant number, it might become a challenge to keep track of every module, their releases
and features, and to find the optimal combination of versions of all the needed modules. 

This is, where the Pimcore Platform Version comes in. It is an additional service provided by Pimcore and 
provides a set of specific versions of all Pimcore modules which work together as they are compatible and explicitly 
tested with each other and verified by Pimcore. 

The Pimcore Platform Version has its own version and is released every several months. Each release comes with combined 
release notes of all modules. 

Also, the Pimcore documentations and our demos are based on the Pimcore Platform Version. 

## Benefits in a nutshell
- Set of specific versions of all Pimcore modules which work together. 
- Explicitly tested and verifyed by Pimcore.
- Combined release notes of all modules for every Platform Version release.  
- Pimcore documentation is based on Platform Version. 


## Versioning Schema and Release Cycles
The versioning schema follows semantic versioning and is Major.Minor (e.g. 2023.1). 

#### Key rules:
- Update **major** versions of modules
  - Major module version updates are only allowed with a major Platform Version.
  - Major Platform Version will be released once per year (2023.1, 2024.1, 2025.1, ...). 
- Update **minor** versions of modules
  - Minor module versions will be updated with new minor Platform Versions.
- Update **bugfix** versions of modules
  - Bugfix versions can be updated implicitly within a Platform Minor Version via a `composer update`.
  - For example: within `2023.1` it can install `pimcore/pimcore:11.0.1` and `pimcore/pimcore:11.0.2` as soon as it is 
    released, but not `pimcore/pimcore:11.1.0`. 


## Further Reads

- [Setup and working with Platform Versions](./doc/01_Setup.md)
- [Release Notes](./doc/03_Release_Notes/README.md)
