#!/usr/bin/env python3

import argparse
import json
import math
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone


GRID_REQUEST_TIMEOUT_SECONDS = float(os.environ.get('GRID_REQUEST_TIMEOUT_SECONDS', '5'))
GRID_SESSION_URL = os.environ.get('GRID_SESSION_URL', 'http://localhost:4444/wd/hub/session')
GRID_STATUS_URL = os.environ.get('GRID_STATUS_URL', 'http://localhost:4444/wd/hub/status')


def parse_arguments():
    parser = argparse.ArgumentParser(
        description='Delete busy Selenium Grid sessions. Without options, deletes every session on the grid.'
    )

    parser.add_argument('--dry-run', action='store_true', help='list sessions that would be deleted, delete nothing')
    parser.add_argument(
        '--min-age',
        metavar='SECONDS',
        type=float,
        help='delete only sessions started at least SECONDS ago, keep younger sessions (safe on a shared grid)'
    )

    arguments = parser.parse_args()

    # `float()` accepts "nan" and "inf", which break the age comparison, e.g. `age < nan` is always false.
    arguments.min_age is not None and not (
        math.isfinite(arguments.min_age) and arguments.min_age >= 0
    ) and parser.error('--min-age must be a finite number of seconds, zero or more')

    return arguments


def fetch_status():
    with urllib.request.urlopen(GRID_STATUS_URL, timeout=GRID_REQUEST_TIMEOUT_SECONDS) as response:
        return json.load(response)


def delete_session(session_id):
    request = urllib.request.Request(f'{GRID_SESSION_URL}/{session_id}', method='DELETE')

    with urllib.request.urlopen(request, timeout=GRID_REQUEST_TIMEOUT_SECONDS):
        return


def get_age_seconds(start, now):
    # Grid reports UTC with nanoseconds, e.g. "2026-01-01T00:00:00.123456789Z", seconds are precise enough.
    if not (isinstance(start, str) and start.endswith('Z')):
        return None

    try:
        started = datetime.strptime(start[:19], '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc)
    except ValueError:
        return None

    return (now - started).total_seconds()


def main() -> int:
    arguments = parse_arguments()

    try:
        payload = fetch_status()
    except (OSError, urllib.error.URLError) as error:
        print(f'Failed to fetch Selenium Grid status: {error}', file=sys.stderr)
        return 1

    now = datetime.now(timezone.utc)
    busy_sessions = []

    for node in payload.get('value', {}).get('nodes') or []:
        for slot in node.get('slots') or []:
            session = slot.get('session')
            session and busy_sessions.append((session.get('sessionId'), get_age_seconds(session.get('start'), now)))

    print(f'Busy sessions: {len(busy_sessions)}')

    for session_id, age in busy_sessions:
        age_text = 'unknown age' if age is None else f'started {age:.0f} s ago'

        if arguments.min_age is not None and (age is None or age < arguments.min_age):
            print(f'Kept {session_id} ({age_text}, --min-age {arguments.min_age:g})')
            continue

        if arguments.dry_run:
            print(f'Would delete {session_id} ({age_text})')
            continue

        try:
            delete_session(session_id)
        except (OSError, urllib.error.URLError) as error:
            print(f'Error deleting {session_id}: {error}', file=sys.stderr)
            continue

        print(f'Deleted {session_id}')

    return 0


if __name__ == '__main__':
    sys.exit(main())
