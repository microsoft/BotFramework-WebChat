# Architecture and Test Layout

HTML tests live under `__tests__/html2/`.

Jest picks them up through the `html2` project declared in `jest.config.js`, then runs them in a WebDriver-backed environment against Selenium Grid.

## Key Pieces

- `docker-compose-wsl2.yml`: Selenium hub, Chrome nodes, `webchat2`, and `jest-server`
- `jest.config.js`: top-level worker count and project wiring
- `packages/test/harness/`: WebDriver environment, host bridge, and snapshot support
- `packages/test/page-object/src/globals`: `host`, `pageConditions`, and `pageElements`

## What `webchat2` Serves

Jest opens each test at `https://webchat2/__tests__/html2/<path>`. `webchat2` serves the test pages and built output of the checkout where `docker compose` was started, through the bind mounts in `docker-compose-wsl2.yml` and the rewrites in `serve-test.json`. It does not serve `src` folders, `node_modules`, or other worktrees.

| URL in a test page                                                                        | Served from                             |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| `/test-harness.js`, `/test-harness.mjs`                                                   | `packages/test/harness/dist/`           |
| `/test-page-object.js`, `/test-page-object.mjs`                                           | `packages/test/page-object/dist/`       |
| `/__dist__/webchat.js`, `/__dist__/webchat-es5.js`, `/__dist__/webchat-minimal.js`        | `packages/bundle/dist/`                 |
| `/__dist__/packages/bundle/static/...`, e.g. `botframework-webchat.js`, `react.js`        | `packages/bundle/static/`               |
| `/__dist__/botframework-webchat-fluent-theme.production.min.js`                           | `packages/fluent-theme/dist/`           |
| `/__dist__/packages/fluent-theme/static/botframework-webchat-fluent-theme.js`             | `packages/fluent-theme/static/`         |
| `/__dist__/packages/test/test-assets/out/...`, e.g. `@fluentui/tokens.js`                 | `packages/test/test-assets/out/`        |
| `/assets/...`, up to two folders deep, e.g. `/assets/index.css`, `/assets/bot-avatar.jpg` | `__tests__/assets/`                     |
| Relative URLs, e.g. `./assets/surface1.jpg` from `__tests__/html2/basic/`                 | Next to the test, in `__tests__/html2/` |

`/assets/` is only `__tests__/assets/`: `/assets/surface1.jpg` returns 404 because that image is in `__tests__/html2/basic/assets/`.

### Rebuild Before Testing

Tests see a source change only after it is built. Rebuild the package you changed, then `packages/bundle`, which bundles the other Web Chat packages from their `dist`:

```sh
npm run build --workspace ./packages/component
npm run build --workspace ./packages/bundle
```

Rebuild `./packages/fluent-theme` after changing the Fluent theme, and `./packages/test/page-object` or `./packages/test/harness` after changing test helpers.

Builds write into the served folders in place, so `webchat2` picks them up without a restart. If a served folder is deleted and re-created after `webchat2` started (e.g. `rm -rf packages/bundle/static`), its bind mount still points to the deleted folder and every file in it returns 404 until `webchat2` is restarted.

## Theme Variants (Redirect Test Pattern)

Many tests have a base file plus small redirect files for theme or variant coverage, e.g. `message-status.html` with `message-status.fluent.html` and `message-status.copilot.html`.

A redirect file only sets `location` in its `<head>` to the base test, without the `.html` extension, plus query parameters, e.g. `<script>location = './message-status?variant=fluent';</script>`.

The base test reads the parameters and applies the theme itself, so check which parameters it reads:

- ES module tests read `variant` (some also `fluent-theme=dark`) from `new URLSearchParams(location.search)` and wrap `ReactWebChat` in `FluentThemeProvider` from `botframework-webchat-fluent-theme`, mapped in the import map to `/__dist__/packages/fluent-theme/static/botframework-webchat-fluent-theme.js`. Example: `carousel/flipperButton.focusVisible.html` and `carousel/flipperButton.focusVisible.fluent.html`.
- Tests that render with the global `renderWebChat(props, element)` from `/test-page-object.js` get the Fluent theme from `?theme=fluent`, and Copilot from `?theme=fluent&variant=copilot`. They load React and ReactDOM UMD scripts and `/__dist__/botframework-webchat-fluent-theme.production.min.js`. Example: `typing/typingIndicator.html` and `typing/typingIndicator.fluent.html`.

Each redirect file is a separate Jest test with its own snapshots, e.g. `message-status.fluent.html.snap-1.png`.

When debugging a redirect failure, inspect the redirect target first because the real test logic usually lives there.

## Regex Targeting Reminder

`--testPathPattern` is a regex.

- Use `message-status\.html$` when you want only the base file
- Use `message-status\.` when you want the base file plus its redirect variants
