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

| Package family           | Level        | Platform-neutral | React Native | Full Browser | React | Node.js |
| ------------------------ | ------------ | ---------------- | ------------ | ------------ | ----- | ------- |
| `base`                   | Neutral      | Yes              | No           | No           | No    | No      |
| `core`                   | Neutral      | Yes              | No           | No           | No    | No      |
| `api`                    | React Native | Yes              | Yes          | No           | No    | No      |
| `react-*`                | React Native | Yes              | Yes          | No           | No    | No      |
| `redux-*`                | React Native | Yes              | Yes          | No           | No    | No      |
| `component`              | React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `bundle`                 | React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `fluent-theme`/`*-theme` | React (HTML) | Yes              | Yes          | Yes          | Yes   | No      |
| `support`                | Neutral      | Yes              | No           | Yes          | No    | No      |

In the order of platform support:

1. Neutral: JavaScript engine only, logic only, UI-agnostic, minimal
2. React Native: browser-like but not full browser, mobile app or web app
3. React (HTML): full browser, web app
