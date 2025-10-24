#!/bin/bash

set -euo pipefail

cat package.json | jq '
  (
    .localDependencies // {}
    | to_entries
    | map([
        if .value == "production" then
          "dependencies"
        elif .value == "development" then
          "devDependencies"
        else
          "peerDependencies"
        end,
        .key
      ])
  ) as $P
  | delpaths($P)
' > package-temp.json && mv package-temp.json package.json
