# Setup and working with Platform Versions

On technical level, the Platform Version comes as a composer dependency and can be added to the projects `composer.json`.

## Setup Platform Version

### Setup with existing project

Use following steps to setup Pimcore Platform Version in an existing project: 
- Install platform version via `composer require pimcore/platform-version` and follow steps described
  below to install further Pimcore modules.

### Setup with new project

Use following steps to setup Pimcore Platform Version for a new project: 
- Get skeleton via `composer create-project pimcore/skeleton my-project`. Platform version is already a composer dependency there. 


## Working with Platform Version

Once Pimcore Platform Version is set up, you can add included Pimcore modules with the matching version and update Pimcore
modules installed in the project. 

### Install tracked Pimcore modules

Use following command to install additional Pimcore modules to the project: `composer require pimcore/<MODULE>`.

> Eventually adding `:*` as version contraint helps if composer doesn't find a matching version of the module. 


### Update Pimcore modules

#### Update Pimcore modules to new bugfix versions 

Bugfix versions of Pimcore modules can be installed within a Platform Version via composer defaults. 
`composer update` will install most up-to-date bugfix versions of all tracked Pimcore modules. 

#### Update to new Platform Version

To update to a new Pimcore Platform version, use the command `composer update pimcore/platform-version:2023.1`. 
> Eventually adding `pimcore/*` is necessary for composer to resolve pimcore repository versions properly. 

