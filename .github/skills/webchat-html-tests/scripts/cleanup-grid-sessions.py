#!/usr/bin/env python3

import json
import os
import sys
import urllib.error
import urllib.request


GRID_REQUEST_TIMEOUT_SECONDS = float(os.environ.get('GRID_REQUEST_TIMEOUT_SECONDS', '5'))
GRID_SESSION_URL = os.environ.get('GRID_SESSION_URL', 'http://localhost:4444/wd/hub/session')
GRID_STATUS_URL = os.environ.get('GRID_STATUS_URL', 'http://localhost:4444/wd/hub/status')


def fetch_status():
    with urllib.request.urlopen(GRID_STATUS_URL, timeout=GRID_REQUEST_TIMEOUT_SECONDS) as response:
        return json.load(response)


def delete_session(session_id):
    request = urllib.request.Request(f'{GRID_SESSION_URL}/{session_id}', method='DELETE')

    with urllib.request.urlopen(request, timeout=GRID_REQUEST_TIMEOUT_SECONDS):
        return


def main() -> int:
    try:
        payload = fetch_status()
    except (OSError, urllib.error.URLError) as error:
        print(f'Failed to fetch Selenium Grid status: {error}', file=sys.stderr)
        return 1

    busy_sessions = []

    for node in payload.get('value', {}).get('nodes') or []:
        for slot in node.get('slots') or []:
            session = slot.get('session')
            session and busy_sessions.append(session.get('sessionId'))

    print(f'Busy sessions: {len(busy_sessions)}')

    for session_id in busy_sessions:
        try:
            delete_session(session_id)
        except (OSError, urllib.error.URLError) as error:
            print(f'Error deleting {session_id}: {error}', file=sys.stderr)
            continue

        print(f'Deleted {session_id}')

    return 0


if __name__ == '__main__':
    sys.exit(main())