# Architecture and Test Layout

HTML tests live under `__tests__/html2/`.

Jest picks them up through the `html2` project declared in `jest.config.js`, then runs them in a WebDriver-backed environment against Selenium Grid.

## Key Pieces

- `docker-compose-wsl2.yml`: Selenium hub, Chrome nodes, `webchat2`, and `jest-server`
- `jest.config.js`: top-level worker count and project wiring
- `packages/test/harness/`: WebDriver environment, host bridge, and snapshot support
- `packages/test/page-object/src/globals`: `host`, `pageConditions`, and `pageElements`

## Redirect Test Pattern

Many tests have a base file plus small redirect files for theme or variant coverage.

- Base file example: `message-status.html`
- Redirect file example: `message-status.copilot.html`

Redirect files usually change `location` to the base test with query parameters such as:

- `?variant=fluent`
- `?variant=copilot`
- `?fluent-theme=dark`
- `?variant=copilot&fluent-theme=dark`

When debugging a redirect failure, inspect the redirect target first because the real test logic usually lives there.

## Regex Targeting Reminder

`--testPathPattern` is a regex.

- Use `message-status\.html$` when you want only the base file
- Use `message-status\.` when you want the base file plus its redirect variants
