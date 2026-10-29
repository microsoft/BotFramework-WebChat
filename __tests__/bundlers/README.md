# Bundler tests

Each folder is a Web Chat app, set up the way the getting-started docs of its bundler do it: `esbuild/`, `vite/`, `webpack4/` (with the workarounds from [`docs/HOSTING.md`](../../docs/HOSTING.md#bundling-with-webpack-4)) and `webpack5/`. `src/` is the same in every folder: CI checks it.

CI builds every app with React 16, 18 and 19 and the tarballs of the pull request, then `run.mjs` opens it in Chrome 141 in Docker: the app must show the bot message, without errors in the console, uncaught errors or failed loads.

`run.mjs` builds the [`Dockerfile`](Dockerfile) for the app (the [Selenium standalone Chrome image](https://github.com/SeleniumHQ/docker-selenium) with the app's `dist/` served on port 8000 and [`report.js`](report.js) injected), runs it, and talks WebDriver to it: opens `http://localhost:8000/` in the container, reads the result that `report.js` stores in `window.bundlerTestResult`, then removes the container.

## Debugging an app

Build the tarballs first (`npm run build`, then `npm exec --workspaces -- npm pack` in the repository root), then:

```sh
cd __tests__/bundlers/vite
npm install
npm run react16 -- ../../../packages/{api,bundle,component,core,directlinespeech,fluent-theme}/*.tgz # Or react18, react19
npm run build
```

Then open `dist/index.html` in a browser (Vite: `npm run preview`), or run the check like CI does (needs Docker):

```sh
node ../run.mjs vite
```

To look at the app as served to that Chrome, run the image yourself and browse `http://localhost:8000/`:

```sh
docker build --build-arg APP=vite --tag webchat-bundler-vite ..
docker run --rm --publish 8000:8000 webchat-bundler-vite
```

The image has a copy of `dist/`: build it again after `npm run build`.

The React scripts install the tarballs in the same `npm install`: a separate `npm install` would remove React and Web Chat, which are not in `package.json`.
