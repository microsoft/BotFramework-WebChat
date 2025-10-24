#!/bin/bash

set -euo pipefail

cat package.json | jq -r '
  .localDependencies =
    (
      (
        .dependencies // {}
        | to_entries
        | map(select((.key | startswith("@msinternal/")) or .value == "0.0.0-0" or .value == "^0.0.0-0") | .value = "production")
        | from_entries
      )
      + (
        .devDependencies // {}
        | to_entries
        | map(select((.key | startswith("@msinternal/")) or .value == "0.0.0-0" or .value == "^0.0.0-0") | .value = "development")
        | from_entries
      )
      + (
        .peerDependencies // {}
        | to_entries
        | map(select((.key | startswith("@msinternal/")) or .value == "0.0.0-0" or .value == "^0.0.0-0") | .value = "peer")
        | from_entries
      )
      | to_entries
      | sort_by(.key)
      | from_entries
    )
  | .
' > package-temp.json && mv package-temp.json package.json
