#!/bin/bash
cat package.json | jq '
  .version as $V
  | (
    .localDependencies // {}
    | with_entries(select(.value == "production")
    | { key: .key, value: $V })
  ) as $L1
  | (
    .localDependencies // {}
    | with_entries(select(.value == "development")
    | { key: .key, value: $V })
  ) as $L2
  | (
    .localDependencies // {}
    | with_entries(select(.value == "peer")
    | { key: .key, value: $V })
  ) as $L3
  | (
    (.dependencies // {}) + $L1
    | to_entries
    | sort_by(.key)
    | from_entries
  ) as $D1
  | (
    (.devDependencies // {}) + $L2
    | to_entries
    | sort_by(.key)
    | from_entries
  ) as $D2
  | (
    (.peerDependencies // {}) + $L3
    | to_entries
    | sort_by(.key)
    | from_entries
  ) as $D3
  | . + {
    dependencies: $D1,
    devDependencies: $D2,
    peerDependencies: $D3
  }
' > package-temp.json && mv package-temp.json package.json
