# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

# Thank you

Thanks for your interest in improving Web Chat. We invest heavily in engineering excellence to reduce our workloads and enable us to move faster. To start the development, please familiar yourself with the development process and these automation tools.

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

# Preparing the environment

There are 2 steps to prepare your environment: [install tools](#installing-tools) and [prepare the repository](#preparing-the-repository).

## Installing tools

Please install the follow in your development environment:

- [Node.js and NPM](https://nodejs.org/) of LTS or latest version
- [Docker](https://docs.docker.com/get-docker/)

These are development environments we tested:

- Windows 10 Pro
   - With WSL1 or [WSL2](https://aka.ms/wsl2) installed
- Ubuntu 18 running under WSL2

## Preparing the repository

Web Chat is monorepo and use [`lerna`](https://lerna.js.org/) for management. After the repository is cloned, run the following to install all dependencies.

```sh
npm ci
npm run bootstrap
```

# Building the project

> Default build flavor is development. Please read [BUILD_SCRIPTS.md](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/BUILD_SCRIPTS.md) about different build flavors.

There are two ways to build: one-off and continuous build.

- For one-off, run `npm run build`
- For continuous build, run `npm start`

The bundle output will be located at:

- http://localhost:5000/webchat.js (also `webchat-es5.js` and `webchat-minimal.js`)
- `packages/bundle/dist/webchat*.js`

# Playing the build

There are few ways you can play the build:

- [Playing with playground](#playing-with-playground)
- [Playing with `webchat-loader`](#playing-with-webchat-loader)
- Write your own web app
   - `<script src="http://localhost:5000/webchat.js"></script>`
   - Or using tarballs

## Playing with playground

Web Chat repository contains a playground app for development testing.

```sh
cd packages/playground
npm start
```

Then navigate to http://localhost:3000/, and click on "Official MockBot" on the upper right corner to get started.

## Playing with `webchat-loader`

Navigate to https://compulim.github.io/webchat-loader/.

# Readying for publication

We care about software quality. It helps prevent regressions, reduce maintenance costs, minimize chores, and enable us to move faster.

Before submitting the pull request, please check your build by running these checks:

- [Running automated tests](#running-automated-tests)
- [Performing static code analysis](#static-code-analysis)

## Running automated tests

Automated tests in Web Chat are designed to run inside a stable and isolated test environment. To run the test suite, you will need to [start the test environment](#starting-the-test-environment), then [run the test suite](#running-the-test-suite).

### Starting the test environment

For stability, Web Chat use Docker for hosting the test environment.

- Docker with [Windows Subsystem for Linux 2 (a.k.a. WSL2)](https://aka.ms/wsl2)
   - To start, run `npm run start:docker`
   - To stop/cleanup, run `npm run stop:docker`
- Other Docker setup
   - To start, run `docker-compose up --build`
   - To stop/cleanup, run `docker-compose down`

### Running the test suite

There are 2 ways to run the test suite, either one-off or continuously:

- For one-off testing, `node_modules/.bin/jest`
- To run continuously, `npm test`
   - To speed up continuous testing, you can install [watchman](https://facebook.github.io/watchman/)

If your development box has less than 4 cores, you will need to reduce the number of simultaneous test agents:

- One-off: run `node_modules/.bin/jest --maxWorkers 1`
- Continuous testing: run `npm test -- --maxWorkers 1`

Our CI pipeline run with 4 test agents simultaneously. If new tests are added, please make sure they can be run simultaneously.

### Troubleshooting the test suite

We run test suite on every commit and requires 100% test pass. If the test suite did not complete successfully, they are likely:

- Intermittent services issue
- Test reliability issue, please see [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
- Polluted development environment, for example:
   - Outdated `node_modules` content

When the test suite failed:

1. Re-run the test suite
   1. If it succeeded but a specific test fail intermittently, please comment on [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
1. If it continue to fail, please fresh clone the repository and run the test suite without your changes
   1. If you suspect your environment is polluted, please use [Windows Sandbox](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-sandbox/windows-sandbox-overview) and/or a new Linux distro on WSL
1. If it still fail repeatedly, please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose) to us.

## Static code analysis

Run `npm run eslint` for static code analysis.

If you need to skip any ESLint errors, we prefer using `eslint-disable-next-line`. Comments are required on why the rule is disabled.

# Final checks

There are checks that automation will not be able to capture. For example:

- Hygiene
   - Add a new log to `CHANGELOG.md`
   - Fill out the pull request form for traceability
   - Make sure imports, members, variables, etc, are sorted alphabetically
   - Avoid one-off variables, prefer JavaScript shorthands, shorter and faster code are better
   - No global pollution: no specific tab order, minimize `z-index`, all polyfills must complies to standards
- Tests
   - Tests are important to reduce our burden. If new tests are needed but not included, we will not merge your pull request
   - For fixing bug, the original bug repro must be coded as a new test
   - For feature work, please add as much tests as needed to future-proof the feature, include both happy and unhappy paths
   - We prefer integration tests than unit tests
- [Secure by default](https://en.wikipedia.org/wiki/Secure_by_default)
- Benchmark
   - Performance should not drop significantly
   - Bundle size should not increase significantly
   - Code coverage should not decrease significantly
   - Backward compatibility should be maintained for 2 years
- Cross browser compatibility
   - Windows 10
      - Chrome
      - Edge Chromium
      - Edge UWP
      - Firefox
      - IE11 (except speech features)
   - Safari on macOS
   - Safari on iOS
   - Chrome on Android
- Accessibility, please refer to [`docs/ACCESSIBILITY.md`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/ACCESSIBILITY.md)
   - Tab order, content readability, assistive technology-only text, color contrast, etc.
- Internationalization, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/LOCALIZATION.md)
- Feature documentation, samples, live demo, operational
   - All samples must also comes with hosted live demo
   - Please discuss with us if a specific bot is needed for the live demo

## Additional context

### Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/LOCALIZATION.md).
