#!/usr/bin/env python3

import json
import os
import sys
import urllib.error
import urllib.request


GRID_STATUS_URL = os.environ.get('GRID_STATUS_URL', 'http://localhost:4444/status')
GRID_SESSION_URL = os.environ.get('GRID_SESSION_URL', 'http://localhost:4444/session')


def fetch_status():
    with urllib.request.urlopen(GRID_STATUS_URL) as response:
        return json.load(response)


def delete_session(session_id):
    request = urllib.request.Request(f'{GRID_SESSION_URL}/{session_id}', method='DELETE')

    with urllib.request.urlopen(request):
        return


try:
    payload = fetch_status()
except urllib.error.URLError as error:
    print(f'Failed to fetch Selenium Grid status: {error}', file=sys.stderr)
    sys.exit(1)

busy_sessions = []

for node in payload.get('value', {}).get('nodes') or []:
    for slot in node.get('slots') or []:
        session = slot.get('session')
        session and busy_sessions.append(session.get('sessionId'))

print(f'Busy sessions: {len(busy_sessions)}')

for session_id in busy_sessions:
    try:
        delete_session(session_id)
    except urllib.error.URLError as error:
        print(f'Error deleting {session_id}: {error}', file=sys.stderr)
        continue

    print(f'Deleted {session_id}')#!/usr/bin/env python3

import json
import sys
import urllib.request


STATUS_URL = 'http://localhost:4444/status'


def main() -> int:
    with urllib.request.urlopen(STATUS_URL) as response:
        status = json.load(response)

    nodes = (status.get('value') or {}).get('nodes') or []
    sessions = []

    for node in nodes:
        for slot in node.get('slots') or []:
            session = slot.get('session')
            session and sessions.append(session.get('sessionId'))

    print(f'Busy sessions: {len(sessions)}')

    for session_id in sessions:
        request = urllib.request.Request(f'http://localhost:4444/session/{session_id}', method='DELETE')

        with urllib.request.urlopen(request):
            print(f'Deleted {session_id}')

    return 0


if __name__ == '__main__':
    sys.exit(main())