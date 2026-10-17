# Failure Modes and Snapshot Workflow

## Common Failures

| Error pattern                                                         | Likely cause                                                                                   | Recovery                                                                                                                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Expected image to match or be a close match to snapshot`             | Real visual change or regression                                                               | Inspect the diff PNG, then decide whether to update snapshots or fix the code                                                            |
| Test still shows the old behavior after a source change               | `webchat2` serves built files, the change was not built                                        | Rebuild the changed package, then `packages/bundle`, see [Rebuild Before Testing](./architecture.md#rebuild-before-testing)              |
| Image or other test asset returns 404                                 | Wrong URL: `/assets/` only serves `__tests__/assets/`                                          | Use a file from `__tests__/assets/` or a path relative to the test, see [What `webchat2` Serves](./architecture.md#what-webchat2-serves) |
| Timeout or hanging Jest run                                           | Selenium sessions leaked, e.g. after a stopped Jest run                                        | See [Grid Sessions](#grid-sessions)                                                                                                      |
| `Failed to load resource: 404 (Not Found)` for dist files             | `webchat2` serves an empty folder: a served folder was deleted and re-created after it started | `docker compose -f docker-compose-wsl2.yml restart webchat2`                                                                             |
| `Cannot read properties of undefined (reading 'FluentThemeProvider')` | Fluent bundle returned 404                                                                     | Restart `webchat2` and confirm the local build completed                                                                                 |
| `Cannot read properties of undefined (reading 'ReactWebChat')`        | Main bundle returned 404                                                                       | Restart `webchat2` and confirm the local build completed                                                                                 |

## Grid Sessions

Tests get browsers through `jest-server`, which keeps a grid session for up to 5 minutes and reuses it for up to 5 tests (`packages/test/harness/src/host/jest-server/index.js`). Busy sessions on the grid may belong to another run that shares it.

- `cleanup-grid-sessions.py` without options deletes every busy session, including sessions that another run is using; that run then fails.
- `--min-age 400` deletes only sessions started at least 400 seconds ago. `jest-server` hands out sessions up to 270 seconds old, and a test and its `afterEach` each time out after 50 seconds (`__tests__/html2.setup/setupFiles/setupTimeout.js`), so no running test uses an older session.
- `--dry-run` lists busy sessions with their age and deletes nothing.
- Chrome nodes end sessions idle for 300 seconds (`SE_NODE_SESSION_TIMEOUT` in `docker-compose-wsl2.yml`), so leaked sessions free their slots within 5 minutes.

Run without `--min-age` only when every session on the grid is yours.

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
