#!/bin/bash
set -ex

cd ../../..

sudo rm -rf platform-version-working-dir || true
mkdir platform-version-working-dir || true

cd platform-version-working-dir
git clone git@github.com:pimcore/saas-k6.git

source ../platform-version/.github/scripts/01-setup-environment.sh
source ../../platform-version/.github/scripts/02-install-pimcore.sh
source ../../platform-version/.github/scripts/03-run-tests.sh

cd ..

source ../platform-version/.github/scripts/04-shutdown.sh
