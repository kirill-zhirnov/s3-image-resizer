#!/bin/sh
set -e

cd /home/node/app

crond -b -d 8

su node -c "yarn start"