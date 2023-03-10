# Test Execution

Platform Versions can be tested with the [Pimcore integration tests based on k6](https://github.com/pimcore/saas-k6). 
These tests have to run through before a new Platform Version is released. 

These tests install a Pimcore skeleton and all included Pimcore Extensions based on the version defined by the Platform 
Version, and then run the k6 tests against them. 

## Execution via Github Action
The github action can be executed on `workflow_dispatch` - that means directly in github UI in the actions area.

## Local Execution 
The Script [00-localsetup.sh](./.github/scripts/00-localsetup.sh) allows to execute the tests locally too. When running
the script locally, a Pimcore Enterprise Repository token is expected to be the first parameter. 