# Bundler tests

Each folder is a Web Chat app, set up the way the getting-started docs of its bundler do it: `esbuild/`, `vite/`, `webpack4/` (with the workarounds from [`docs/HOSTING.md`](../../docs/HOSTING.md#bundling-with-webpack-4)) and `webpack5/`. `src/` is the same in every folder: CI checks it.

CI builds every app with React 16, 18 and 19 and the tarballs of the pull request, then `run.mjs` opens it in Chrome: the app must show the bot message, without errors in the console, uncaught errors or failed loads.

## Debugging an app

Build the tarballs first (`npm run build`, then `npm exec --workspaces -- npm pack` in the repository root), then:

```sh
cd __tests__/bundlers/vite
npm install
npm run react16 -- ../../../packages/{api,bundle,component,core,directlinespeech,fluent-theme}/*.tgz # Or react18, react19
npm run build
```

Then open `dist/index.html` in a browser (Vite: `npm run preview`), or run the check like CI does:

```sh
(cd .. && npm install)
node ../run.mjs vite
```

`run.mjs` starts the Chrome that [chrome-launcher](https://www.npmjs.com/package/chrome-launcher) finds, or the one in `CHROME_PATH`. On WSL, chrome-launcher looks for Chrome on Windows and fails if it is not installed there: set `CHROME_PATH` to a Linux Chrome, then chrome-launcher leaves a `C:\Users\…\lighthouse.*` folder in the current folder.

The React scripts install the tarballs in the same `npm install`: a separate `npm install` would put back the React and Web Chat versions from `package.json`.
