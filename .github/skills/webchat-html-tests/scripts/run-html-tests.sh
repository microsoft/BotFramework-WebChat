#!/usr/bin/env bash

set -euo pipefail

update_snapshots=false
test_pattern=''

for argument in "$@"; do
  if [[ "$argument" == '--update' ]]; then
    update_snapshots=true
  elif [[ -z "$test_pattern" ]]; then
    test_pattern="$argument"
  else
    printf 'Usage: %s [--update] [test-path-regex]\n' "$0" >&2
    exit 1
  fi
done

arguments=()

$update_snapshots && arguments+=('-u')
[[ -n "$test_pattern" ]] && arguments+=('--testPathPattern' "$test_pattern")

npm test -- "${arguments[@]}"