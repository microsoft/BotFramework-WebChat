# Open a Pull Request

Create a pull request for the current branch against the upstream `microsoft/BotFramework-WebChat` repository.

## Instructions

### 1. Pre-flight checks

- Run `npm run precommit` to ensure linting passes. Fix any issues before proceeding.
- Verify all changes are committed: `git status` should show a clean working tree.
- Confirm you are on a feature branch, not `main`.

### 2. Ensure E2E tests pass locally

This repo uses visual regression E2E tests, not unit tests. Tests are HTML files under `__tests__/html2/`.

**Build the project (requires Node 22 and Docker):**

If on Windows, the build must run inside a Linux Docker container due to shell script and CSS plugin compatibility:

```
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "<repo-path>:/app" -w "/app" node:22 \
  bash -c "apt-get update -qq && apt-get install -y -qq jq dos2unix > /dev/null 2>&1 && \
  find scripts -name '*.sh' -exec dos2unix {} \; 2>/dev/null && \
  find packages -name '*.sh' -exec dos2unix {} \; 2>/dev/null && \
  npm ci && npm run build:production"
```

**Start the Docker test environment:**

```
MSYS_NO_PATHCONV=1 COMPOSE_CONVERT_WINDOWS_PATHS=1 \
  docker compose -f docker-compose-wsl2.yml up -d --build
```

**Run your tests:**

The jest-server container proxies Selenium and sets the viewport to 360x640. You must route through it (port 4445), not directly to the Selenium hub (port 4444), otherwise snapshots will have the wrong dimensions.

```
MSYS_NO_PATHCONV=1 docker run --rm \
  --network botframework-webchat_default \
  -v "<repo-path>:/app" -w "/app" \
  -e "SELENIUM_REMOTE_URL=http://jest-server:4445/wd/hub" \
  -e "WEBCHAT2_URL=http://webchat2:80" \
  node:22 bash -c "npx jest --testPathPattern='<your-test-pattern>' --updateSnapshot"
```

- On first run with new test files, use `--updateSnapshot` to generate baseline `.snap-*.png` files.
- Run again **without** `--updateSnapshot` to confirm snapshots match.
- Commit the `.snap-*.png` files alongside the test HTML files.
- Snapshot images must be 360x640 pixels to match CI.

**Stop Docker when done:**

```
MSYS_NO_PATHCONV=1 COMPOSE_CONVERT_WINDOWS_PATHS=1 \
  docker compose -f docker-compose-wsl2.yml down
```

### 3. Push the branch

If working on a fork, ensure your fork is added as a remote:

```
git remote add fork https://github.com/<your-username>/BotFramework-WebChat.git
git push -u fork <branch-name>
```

If working directly on the repo, push the branch:

```
git push -u origin <branch-name>
```

### 4. Create the PR

Use `gh` CLI to create the PR. If working from a fork, use `--head <your-username>:<branch-name>`. If working directly on the repo, use `--head <branch-name>`.

```
GH_HOST=github.com gh pr create \
  --repo microsoft/BotFramework-WebChat \
  --head <branch-name-or-user:branch-name> \
  --base main \
  --title "<title>" \
  --body "<body>"
```

The PR body **must** follow the repo's PR template format:

```markdown
> Fixes #<issue-number-if-any>

## Changelog Entry

<Paste new entry from CHANGELOG.md. Not required for dev-only changes.>

## Description

<What do the changes do? Why is this PR needed?>

## Design

<Additional clarifications for complicated features.>

## Specific Changes

- <List changes concisely>

- [ ] I have added tests and executed them locally
- [ ] I have updated `CHANGELOG.md`
- [ ] I have updated documentation

## Review Checklist

> This section is for contributors to review your work.

- [ ] Accessibility reviewed (tab order, content readability, alt text, color contrast)
- [ ] Browser and platform compatibilities reviewed
- [ ] CSS styles reviewed (minimal rules, no `z-index`)
- [ ] Documents reviewed (docs, samples, live demo)
- [ ] Internationalization reviewed (strings, unit formatting)
- [ ] `package.json` and `package-lock.json` reviewed
- [ ] Security reviewed (no data URIs, check for nonce leak)
- [ ] Tests reviewed (coverage, legitimacy)
```

## Key things to remember

- Write **E2E tests** (HTML files in `__tests__/html2/`), never unit tests for UI behavior.
- Follow existing test patterns in the same folder. Use `host.snapshot('local')` for visual assertions.
- Snapshot baselines must be generated through the jest-server (port 4445) to get the correct 360x640 viewport.
- The repo uses `renderWebChat()` helper which auto-detects basic vs fluent theme via `?theme=fluent` URL param.
- Test helpers: `testHelpers.createDirectLineEmulator()`, `pageConditions`, `pageElements`, `pageObjects`.
- Respect `AGENTS.md` coding conventions (immutability, valibot, emotion CSS-in-JS for basic theme, CSS modules for fluent theme).
- Add a changelog entry to `CHANGELOG.md`.
