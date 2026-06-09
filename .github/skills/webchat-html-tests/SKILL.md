---
name: webchat-html-tests
description: 'Run Bot Framework Web Chat HTML tests in Docker/Selenium Grid. Use when: running __tests__/html2, debugging failing HTML tests, updating snapshots, checking grid health, or cleaning leaked Selenium sessions.'
argument-hint: 'Optional HTML test regex'
---

# Web Chat HTML Tests

Run the HTML test harness, keep Selenium Grid healthy, and debug failures without keeping all of the operational detail in the skill body.

## When to Use

- Running `__tests__/html2` for a branch or PR
- Debugging a failing HTML or snapshot test
- Updating snapshots after an intentional visual change
- Checking whether Selenium Grid is ready or leaking sessions

## Procedure

### 1. Start Selenium Grid

Use the bundled script instead of pasting long Docker commands.

For a focused test run, keep the default scale of 2 Chrome nodes:

```sh
./.github/skills/webchat-html-tests/scripts/start-grid.sh
```

For a full run, match Jest's 4 workers:

```sh
CHROME_SCALE=4 ./.github/skills/webchat-html-tests/scripts/start-grid.sh
```

### 2. Wait for Grid Readiness

```sh
python3 ./.github/skills/webchat-html-tests/scripts/wait-for-grid.py
```

Stop if the script times out or if the node summary does not show ready nodes.

### 3. Run Tests

Run the full suite:

```sh
./.github/skills/webchat-html-tests/scripts/run-html-tests.sh
```

Run a focused HTML test with a regex anchored to the exact file:

```sh
./.github/skills/webchat-html-tests/scripts/run-html-tests.sh "__tests__/html2/activity/message-status\.html$"
```

Update snapshots for an expected visual change:

```sh
./.github/skills/webchat-html-tests/scripts/run-html-tests.sh --update "__tests__/html2/activity/message-status\.html$"
```

### 4. Clean Grid Sessions After Every Run

```sh
python3 ./.github/skills/webchat-html-tests/scripts/cleanup-grid-sessions.py
```

If leaked sessions remain, clean them before the next Jest run or the grid can stall.

### 5. Recover Common Infra Problems

If dist files return 404s after a local build, restart `webchat2`:

```sh
docker compose -f docker-compose-wsl2.yml restart webchat2
```

If a failure is not obvious, load the reference docs before changing code:

- [Architecture and test layout](./references/architecture.md)
- [Failure modes and snapshot workflow](./references/failure-modes.md)

### 6. Tear Down

```sh
docker compose -f docker-compose-wsl2.yml down
```

## Checklist

- [ ] Grid is ready before running Jest
- [ ] Focused tests use an anchored regex when targeting one HTML file
- [ ] Sessions are cleaned after every run
- [ ] Snapshot updates are rerun without `--update`
- [ ] `npm run precommit` passes before opening the PR
