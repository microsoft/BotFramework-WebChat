#!/usr/bin/env python3

import json
import os
import sys
import time
import urllib.error
import urllib.request


GRID_URL = os.environ.get('GRID_URL', 'http://localhost:4444/wd/hub/status')
POLL_INTERVAL_SECONDS = float(os.environ.get('GRID_POLL_INTERVAL_SECONDS', '2'))
TIMEOUT_SECONDS = float(os.environ.get('GRID_TIMEOUT_SECONDS', '60'))


def fetch_status():
    with urllib.request.urlopen(GRID_URL) as response:
        return json.load(response)


def print_summary(payload):
    value = payload.get('value') or {}
    message = value.get('message', 'No message returned')
    ready = value.get('ready', False)
    print(f'{message} [ready={ready}]')

    for node in value.get('nodes') or []:
        node_id = node.get('id', '<unknown>')
        availability = node.get('availability', '<unknown>')
        print(f'node {node_id} {availability}')


deadline = time.monotonic() + TIMEOUT_SECONDS
last_payload = None

while time.monotonic() < deadline:
    try:
        payload = fetch_status()
    except (OSError, urllib.error.URLError) as error:
        print(f'Waiting for Selenium Grid: {error}', file=sys.stderr)
        time.sleep(POLL_INTERVAL_SECONDS)
        continue

    last_payload = payload
    value = payload.get('value') or {}

    if value.get('ready'):
        print_summary(payload)
        sys.exit(0)

    print_summary(payload)
    time.sleep(POLL_INTERVAL_SECONDS)

print('Timed out waiting for Selenium Grid readiness.', file=sys.stderr)
last_payload and print_summary(last_payload)
sys.exit(1)