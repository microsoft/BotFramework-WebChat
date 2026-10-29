#!/usr/bin/env bash
# Bundles Web Chat in a consumer app, like apps install it from npm, with the given bundler and React versions,
# then renders it in Chrome.
#
# Usage: test.sh <esbuild | vite | webpack>@<version> <react version> <tarball>...
# The app is created under $APP_DIR (default: a new temporary directory) so it does not see the monorepo node_modules.

set -euo pipefail

bundler_package=$1
react_version=$2
shift 2

app_dir=${APP_DIR:-$(mktemp -d)}
mapfile -t tarballs < <(realpath "$@")

cp -R "$(dirname "$0")/." "$app_dir"
cd "$app_dir"

# The devDependencies in package.json are for webpack4.config.js only (explicit: NODE_ENV=production omits them by default).
dev=--omit=dev
[[ $bundler_package == webpack@4.* ]] && dev=--include=dev

npm install --no-audit --no-fund "$dev" \
  "$bundler_package" \
  "react@$react_version" \
  "react-dom@$react_version" \
  "${tarballs[@]}"

node build.mjs "${bundler_package%@*}"
node browser.mjs
