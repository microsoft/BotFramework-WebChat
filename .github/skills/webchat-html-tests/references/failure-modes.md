# Failure Modes and Snapshot Workflow

## Common Failures

| Error pattern                                                         | Likely cause                              | Recovery                                                                                            |
| --------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Expected image to match or be a close match to snapshot`             | Real visual change or regression          | Inspect the diff PNG, then decide whether to update snapshots or fix the code                       |
| Timeout or hanging Jest run                                           | Selenium sessions leaked                  | Run `python3 ./.github/skills/webchat-html-tests/scripts/cleanup-grid-sessions.py` before rerunning |
| `Failed to load resource: 404 (Not Found)` for dist files             | `webchat2` serving stale or empty content | `docker compose -f docker-compose-wsl2.yml restart webchat2`                                        |
| `Cannot read properties of undefined (reading 'FluentThemeProvider')` | Fluent bundle returned 404                | Restart `webchat2` and confirm the local build completed                                            |
| `Cannot read properties of undefined (reading 'ReactWebChat')`        | Main bundle returned 404                  | Restart `webchat2` and confirm the local build completed                                            |

## Snapshot Update Flow

1. Reproduce the failure without `--update`.
2. Inspect the generated `.snap-N-diff.png` file next to the HTML test.
3. Only if the change is intentional, rerun with `--update`.
4. Rerun the same test again without `--update` to confirm the snapshot is now stable.
5. Clean leaked Selenium sessions between runs.

## HTML Test Anatomy

Most HTML tests follow this structure:

- Load `/test-harness.js` and `/test-page-object.js`
- Create a Direct Line emulator with `testHelpers.createDirectLineEmulator()`
- Drive activities with `emulateIncomingActivity()` or `emulateOutgoingActivity()`
- Assert through `pageConditions` and `pageElements`
- Capture snapshots with `await host.snapshot('local')`
- Use `expect`, not `assert`
