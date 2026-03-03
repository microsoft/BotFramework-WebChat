# HUMAN.md for Bot Framework Web Chat

## Coding

### Package management

- When adding dependencies, use `npm install`
  - Do not add it to workspace root
  - If it is an existing package, must use consistent version: either use existing version for the package or consider bumping every dependents to latest
- Unless stated otherwise, avoid Node.js packages or polyfills
  - Use `ReadableStream`, `WritableStream`, `TransformStream`, instead of Node.js `buffer`
  - Use Web Cryptography instead of Node.js `crypto`
  - Do not use `fs`-like or `net`-like packages
  - Do not use any Browserify-like packages
- Unless stated otherwise, verify newly added packages and transient packages must be either platform-neutral, browser-specific, or React-specific
- Do not add external/publishing packages unless explicitly requested
- Always prefix internal/non-publishing packages with `@msinternal/` to prevent package squatting

### Platform level

This table list expect platform level supported in the running environment.

| Package family           | Level              | Platform-neutral | React Native | Full Browser | React | Node.js |
| ------------------------ | ------------------ | ---------------- | ------------ | ------------ | ----- | ------- |
| `base`                   | 100 - Neutral      | Yes              | No           | No           | No    | No      |
| `core`                   | 100 - Neutral      | Yes              | No           | No           | No    | No      |
| `api`                    | 200 - React Native | Yes              | Yes          | No           | No    | No      |
| `react-*`                | 200 - React Native | Yes              | Yes          | No           | No    | No      |
| `redux-*`                | 200 - React Native | Yes              | Yes          | No           | No    | No      |
| `component`              | 300 - React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `bundle`                 | 300 - React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `fluent-theme`/`*-theme` | 300 - React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `support`                | 100 - Neutral      | Yes              | No           | Yes          | No    | No      |

In the order of platform support:

- 100 - Neutral: JavaScript engine only, logic only, UI-agnostic, minimal
- 200 - React Native: browser-like but not full browser, mobile app or web app
- 300 - React (HTML): full browser, web app
