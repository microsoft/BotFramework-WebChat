#!/usr/bin/env bash
# Bundles Web Chat in a consumer app, like apps install it from npm, with the given webpack and React versions.
#
# Usage: test.sh <webpack version> <react version> <tarball>...
# The app is created under $APP_DIR (default: a new temporary directory) so it does not see the monorepo node_modules.

set -euo pipefail

webpack_version=$1
react_version=$2
shift 2

app_dir=${APP_DIR:-$(mktemp -d)}
mapfile -t tarballs < <(realpath "$@")

cp -R "$(dirname "$0")/." "$app_dir"
cd "$app_dir"

npm install --no-audit --no-fund \
  "react@$react_version" \
  "react-dom@$react_version" \
  "webpack@$webpack_version" \
  "${tarballs[@]}"

node build.js
node load.js
