#!/bin/bash

PACKAGES_TO_BUMP=$(cat package.json | jq -r '
  (.pinDependencies // {}) as $P
  | (.localDependencies // {} | keys) as $L
  | (.peerDependencies // {})
  | to_entries
  | map(select(.key as $K | $L | contains([$K]) | not))
  | map(.key + "@" + ($P[.key] // ["latest"])[0])
  | join(" ")
')

[ ! -z "$PACKAGES_TO_BUMP" ] && npm install --save-exact --save-peer $PACKAGES_TO_BUMP || true
