# Setup and working with Platform Versions

On technical level, the Platform Version comes as a composer dependency and can be added to the projects `composer.json`.

## Setup Platform Version

### Setup with existing project

Use following steps to setup Pimcore Platform Version in an existing project: 
- Add Pimcore enterprise repository to project and setup authentication token (if not already done).
- Install platform version via `composer require pimcore/platform-version`  and follow steps described
  below to install further Pimcore modules.

### Setup with new project

Use following steps to setup Pimcore Platform Version for a new project: 
- Get skeleton via `composer create-project pimcore/skeleton my-project`.
- Rename `composer.enterprise.json` to `composer.json` (overwrite existing).
- Add your enterprise token to composer with `composer config --global --auth http-basic.enterprise.repo.pimcore.com token <YOUR_TOKEN>`
  (if not already done).
- Run `composer update` to install necessary additional requirements for Pimcore Platform Version and follow steps described 
  below to install further Pimcore modules. 


## Working with Platform Version

Once Pimcore Platform Version is set up, you can add included Pimcore modules with the matching version and update Pimcore
modules installed in the project. 

### Install tracked Pimcore modules

Use following command to install additional Pimcore modules to the project: `composer require pimcore/<MODULE>`.

> `:*` is important that composer finds the matching version of the module. 


### Update Pimcore modules

#### Update Pimcore modules to new bugfix versions 

Bugfix versions of Pimcore modules can be installed within a Platform Version via composer defaults. 
`composer update` will install most up-to-date bugfix versions of all tracked Pimcore modules. 

#### Update to new Platform Version

To update to a new Pimcore Platform version, use the command `composer update pimcore/platform-version:2023.1 pimcore/*`. 
> `pimcore/*` necessary for composer, otherwise versions cannot be resolved properly. 

