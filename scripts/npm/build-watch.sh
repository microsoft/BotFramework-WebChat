#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

WATCH_SCRIPT=$(node "$SCRIPT_DIR/../buildWatch.mjs")

cat package.json | jq --arg W "$WATCH_SCRIPT" -r '
  .scripts.start = $W
  | .
' > package-temp.json && mv package-temp.json package.json
