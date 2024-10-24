# Setup and working with Platform Versions

On technical level, the Platform Version comes as a composer dependency and can be added to the projects `composer.json`.

## Setup Platform Version

### Setup with existing project

Use following steps to set up Pimcore Platform Version in an existing project: 
- Install platform version via `composer require pimcore/platform-version` and follow steps described
  below to install further Pimcore modules. Eventually you need to adapt versions of other
  pimcore packages to apply to versions required by platform version. Please follow instructions of composer. 

### Setup with new project

Use following steps to set up Pimcore Platform Version for a new project: 
- Get skeleton via `composer create-project pimcore/skeleton my-project`.
- Install platform version via `composer require pimcore/platform-version`. Eventually you need to adapt versions of other
  pimcore packages to apply to versions required by platform version. Please follow instructions of composer. 
- Run `composer update` to install necessary additional requirements for Pimcore Platform Version and follow steps described 
  below to install further Pimcore modules. 


## Working with Platform Version

Once Pimcore Platform Version is set up, you can add included Pimcore modules with the matching version and update Pimcore
modules installed in the project. 

### Install tracked Pimcore modules

Use following command to install additional Pimcore modules to the project: `composer require pimcore/<MODULE>`.

> Eventually adding `:*` as version constraint helps if composer doesn't find a matching version of the module. 


### Update Pimcore modules

#### Update Pimcore modules to new bugfix versions 

Bugfix versions of Pimcore modules can be installed within a Platform Version via composer defaults. 
`composer update` will install most up-to-date bugfix versions of all tracked Pimcore modules. 

#### Update to new Platform Version

- Carefully read our [Release Notes](./03_Release_Notes/README.md) before any update.
- Update to a new Pimcore Platform version: 
  - if you want to update to a specific version, use the command `composer require pimcore/platform-version:2023.1 --no-update` to update your `composer.json`. Afterwards run `composer update`.
  - if you want to update to the latest version (and the constraint in your `composer.json` allows further updates), 
    use the command `composer update pimcore/platform-version`.

:::tip

Eventually adding `pimcore/*` is necessary for composer to resolve pimcore repository versions properly.

:::

:::caution

Keep in mind that the `pimcore/platform-version` repository does not specify required packages.  
It only specifies conflicting packages to ensure compatible versions are installed.
The command `composer require pimcore/platform-version --update-with-all-dependencies` will therefore not work.
The command `composer require` will check against your `composer.lock` and may result in an error.
You need to run `composer update` to update all packages to the latest version.

:::

:::warning

It might be necessary to update a specific Pimcore module to a version that is not included in the Platform Version.
In that case, you need to remove the `platform-version` dependency from your `composer.json` and update the module to
the desired version.
Be aware that this might lead to a theoretically compatible but untested combination of Pimcore modules.

:::
