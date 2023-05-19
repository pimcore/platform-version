#!/bin/bash
set -ex

if [ -z "$1" ]
  then
    echo "No argument supplied. First and only argument is token for enterprise bundles."
    exit;
fi

cd ../../..

sudo rm -rf platform-version-working-dir || true
mkdir platform-version-working-dir || true

cd platform-version-working-dir
git clone git@github.com:pimcore/saas-k6.git
cd saas-k6
cd ../

source ../platform-version/.github/scripts/01-setup-environment.sh $1
source ../../platform-version/.github/scripts/02-install-pimcore.sh

cd ../
source ../platform-version/.github/scripts/03-run-tests.sh

cd ./test-project
source ../platform-version/.github/scripts/04-shutdown.sh
