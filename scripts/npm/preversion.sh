#!/bin/bash
# TODO: [P1] Instead of simply stripping out "localDependencies", it should:
#       1. Look at what has version "0.0.0-0", save them to "localDependencies" and mark it as "production"/"development"/"peer"
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
