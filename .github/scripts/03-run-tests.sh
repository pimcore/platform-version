#!/bin/bash
set -ex

docker run --network=k6-test-network --rm -i \
  -v `pwd`/saas-k6/tests:/tests \
  grafana/k6 run /tests/testTenant.js \
  -e HOST=http://nginx:80 \
  -e USER=admin -e PASSWORD=pimcore -e SKIP_BOOTSTRAP=0 -e SKIP_CLEANUP=0 -e SKIP_WRONG_LOGIN=0 \
  -q