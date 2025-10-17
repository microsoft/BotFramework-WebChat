#!/bin/bash

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <directory_or_file1> [directory_or_file2 ...]"
  exit 1
fi

WATCH_DIRS=("$@")
EVENT_QUEUE="/tmp/inotify_event_queue_$$"

# Create or clear the event queue
> "$EVENT_QUEUE"

# Kill all background processes on exit
trap 'kill $(jobs -p)' EXIT

# Monitor all directories/files and write events to the queue
# "close_write" is for touch
inotifywait --event close_write,create,delete,modify,move --monitor --outfile "$EVENT_QUEUE" --recursive ../tsconfig/package.json "${WATCH_DIRS[@]}" &

while true; do
  if [ -s "$EVENT_QUEUE" ]; then
    # Clear the queue and execute the command

    echo "📫 Change detected: $(head -n 1 "$EVENT_QUEUE")"

    # VSCode fire MODIFY + CLOSE_WRITE on save.
    # Group all changes within 100 ms, so we don't trigger it twice.
    sleep 0.1s

    # Clear the event queue
    > "$EVENT_QUEUE"

    echo "🚥 Build started."

    START_TIME=$(date +%s.%N)

    # Ignore error, let it rebuild
    npm run build:run || true

    END_TIME=$(date +%s.%N)

    DURATION=$(awk "BEGIN {printf \"%.2f\", $END_TIME - $START_TIME}")

    # Display duration in light purple color
    echo -e "🏁 Build completed in \033[1;35m${DURATION}\033[0m seconds."
  else
    inotifywait --event modify --quiet "$EVENT_QUEUE" >/dev/null 2>&1
  fi
done
