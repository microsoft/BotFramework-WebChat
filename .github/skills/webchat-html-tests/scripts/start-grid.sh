#!/usr/bin/env bash

set -euo pipefail

readonly registry="${REGISTRY:-mcr.microsoft.com}"
readonly chrome_scale="${CHROME_SCALE:-2}"

docker compose -f docker-compose-wsl2.yml build --build-arg "REGISTRY=${registry}"
docker compose -f docker-compose-wsl2.yml up --detach --scale "chrome=${chrome_scale}"
docker compose -f docker-compose-wsl2.yml restart webchat2