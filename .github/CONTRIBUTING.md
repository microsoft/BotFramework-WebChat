# Contributing

This project welcomes contributions and suggestions. Most contributions require you to
agree to a Contributor License Agreement (CLA) declaring that you have the right to,
and actually do, grant us the rights to use your contribution. For details, visit
https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need
to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the
instructions provided by the bot. You will only need to do this once across all repositories using our CLA.

# Thank you

Thanks for your interest in improving Web Chat. We invest heavily in engineering excellence to reduce our workloads and enable us to move faster. To start the development, please familiarize yourself with the development process and these automation tools.

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

# Preparing the environment

There are 2 steps to prepare your environment: [install tools](#installing-tools) and [prepare the repository](#preparing-the-repository).

## Installing tools

Please install the follow in your development environment:

-  [Node.js](https://nodejs.org/) of LTS or latest version
-  [NPM] minimum required version v7.0.0-rc.3
-  [Docker](https://docs.docker.com/get-docker/)

These are development environments we tested:

-  Windows 10 Professional
   -  With WSL1 or [WSL2](https://aka.ms/wsl2) installed
-  [Ubuntu 18 running under WSL2](https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q)

## Preparing the repository

Web Chat is a monorepo and uses [`lerna`](https://lerna.js.org/). After the repository is [forked and cloned](https://github.com/microsoft/botframework-webchat/fork), run the following to install all dependencies.

```sh
npm ci
npm run bootstrap
```

# Building the project

> Default build flavor is development. Please read [BUILD_SCRIPTS.md](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/BUILD_SCRIPTS.md) about different build flavors.

There are two ways to build: one-off and continuous build.

-  For one-off building, run `npm run build`
-  For continuous building, run `npm start`

The bundle output will be located at:

-  http://localhost:5000/webchat.js (also `webchat-es5.js` and `webchat-minimal.js`)
-  `packages/bundle/dist/webchat*.js`

# Playing with the build

There are few ways you can play with the build:

-  Playing with playground
   -  `cd packages/playground`
   -  `npm start`
   -  Navigate to http://localhost:3000/, and click on "Official MockBot" on the upper right corner
-  Playing with `webchat-loader`
   -  Navigate to https://compulim.github.io/webchat-loader/
   -  In the version dropdown, select `http://localhost:5000/webchat-es5.js`
-  Write your own web app
   -  `<script src="http://localhost:5000/webchat.js"></script>`
   -  Or using tarballs

# Readying for publication

We care about software quality. Quality checking prevents regressions, reduces maintenance costs, minimizes chores, and enables us to move faster.

Before submitting the pull request, please check your build by running these checks:

-  [Running automated tests](#running-automated-tests)
-  [Performing static code analysis](#static-code-analysis)

## Running automated tests

Automated tests in Web Chat are designed to run inside a stable and isolated test environment. To run the test suite, you will need to [start the test environment](#starting-the-test-environment), then [run the test suite](#running-the-test-suite).

### Starting the test environment

For environment stability, Web Chat uses Docker for hosting the test environment.

-  Docker with [Windows Subsystem for Linux 2 (a.k.a. WSL2)](https://aka.ms/wsl2)
   -  To start, run `npm run start:docker`
   -  To stop/cleanup, run `npm run stop:docker`
-  Other Docker setup
   -  To start, run `docker-compose up --build`
   -  To stop/cleanup, run `docker-compose down`

> On Windows, set environment variable `COMPOSE_CONVERT_WINDOWS_PATHS=1`.

### Running the test suite

> Testing pages under `__tests__/html/` are served under http://localhost:5001/ (locally) and http://localhost:5081/ (from Docker). All Jest tests will run against Docker version of the page. To update the page, restart Docker.

There are 2 ways to run the test suite, either one-off or continuously:

> To run Web Driver test, locally, download [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and extract to project root. Then set environment variable `WEBCHAT_TEST_ENV=chrome-local` before running Jest.

-  For one-off testing, `node_modules/.bin/jest`
-  For continuous testing, `npm test`
   -  To speed up continuous testing, you can install [watchman](https://facebook.github.io/watchman/)

If your development box has less than 4 cores, you will need to reduce the number of simultaneous test agents:

-  For one-off testing: run `node_modules/.bin/jest --maxWorkers 1`
-  For continuous testing: run `npm test -- --maxWorkers 1`

Our CI pipeline run tests with 4 agents simultaneously. If new tests are added, please make sure they can run simultaneously.

### Troubleshooting the test suite

We run test suite on every commit and requires 100% test pass. If the test suite did not complete successfully, they are likely:

-  Intermittent services issue
-  Test reliability issue, please see [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
-  Polluted development environment, for example:
   -  Outdated `node_modules` content
   -  Outdated Node.js or NPM

When the test suite failed:

1. Re-run the test suite
   1. If it succeeded but a specific test fails intermittently, please comment to [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
1. If it continues to fail, please fresh clone the repository and run the test suite without your changes
   1. If you suspect your environment is polluted, please use [Windows Sandbox](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-sandbox/windows-sandbox-overview) and/or a new Linux distro on WSL to verify
1. If it still fails repeatedly, please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose) to us.

## Static code analysis

Run `npm run eslint` for static code analysis.

If you need to skip any ESLint errors, we recommend `eslint-disable-next-line`. Comments are required on why the rule is disabled.

# Final checks

There are checks that automation will not be able to capture. For example:

-  Hygiene

   -  Add a new log to `CHANGELOG.md`
   -  Fill out the pull request form for traceability
   -  Make sure imports, members, variables, etc, are sorted alphabetically
   -  Avoid one-off variables, prefer JavaScript shorthands, shorter and faster code
   -  No global pollution:
      -  no specific tab order,
      -  minimize `z-index` usage
         -  if z-index is ultimately required, use a [new stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context),
      -  all polyfills must comply with ECMAScript/W3C standards

-  Tests
   -  Tests are important to reduces our maintenence burden. Pull requests without needed tests will not be approved or merged into the project.
   -  When fixing a bug, the original bug repro must be included as a new test
   -  For feature work, please add as many tests as needed to future-proof the feature, including both happy and unhappy paths
   -  We prefer integration tests over unit tests
      -  Visual regression tests are preferred and we use [`pixelmatch`](https://npmjs.com/package/pixelmatch) via [`jest-image-snapshot`](https://npmjs.com/package/jest-image-snapshot)
   -  Avoid using timeout in tests. Instead, use [fake timer](https://www.npmjs.com/package/lolex) instead
-  [Secure by default](https://en.wikipedia.org/wiki/Secure_by_default)
-  Benchmark
   -  Performance should not drop significantly
   -  Bundle size should not increase significantly
   -  Code coverage should not decrease significantly
   -  Backward compatibility should be maintained for 2 years
-  Cross browser compatibility
   -  Windows 10
      -  Chrome
      -  Microsoft Edge Chromium
      -  Microsoft Edge UWP (Legacy)
      -  Firefox
      -  IE11 (except speech features)
   -  Safari on macOS
   -  Safari on iOS or iPadOS
   -  Chrome on Android
-  For accessibility, please refer to [`docs/ACCESSIBILITY.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/ACCESSIBILITY.md)
   -  Tab order, content readability, assistive technology-only text, color contrast, etc. must be maintained.
   -  Assistive technology and browser compatibility
      -  NVDA/JAWS: Chrome and Firefox
      -  Narrator: Microsoft Edge family and IE11
      -  VoiceOver: Safari
      -  TalkBack: Chrome on Android
-  For internationalization, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md)
-  Feature documentation, samples, live demo, operation of demo bots
   -  All samples must also come with a hosted live demo
   -  Please discuss with us if a specific bot is needed for the live demo

# Workflow

Here list how we generally work when [fixing a bug](#fixing-bug) or [implementing a new feature](#implement-new-feature).

## Fixing bug

Write the bug repro as a test, before fixing the bug.

1. Clone/prepare the repository or reset an existing repository
   -  To reset the repo, run `npm run tableflip`
1. Run continuous build, run `npm start`
1. Convert bug into a test case, under `__tests__/html/this-is-the-bug.html`
1. Run the test, `npm run start:docker`, then `npm test -- --testPathPattern html/this-is-the-bug.html`
   -  Make sure the test fail as described in the repro
1. Fix the bug
1. Re-run `npm run start:docker` to refresh the code inside Docker
1. Re-run the test, it should succeed
   -  Verify screenshots if any
1. Add a log entry to `CHANGELOG.md`
1. File a pull request

## Implementing new features

Write the user story while implementing the feature.

1. Clone/prepare the repository or reset an existing repository
   -  To reset the repo, run `npm run tableflip`
1. Run continuous build, run `npm start`
1. Clone `__tests__/html/simple.html` to `my-feature.html` and use it as a playground
1. Navigate to the new playground at http://localhost:5001/my-feature.html
1. Implement the feature while modifying the playground
1. After the feature is completed, write more tests to include cases that need more attention, and unhappy paths
1. Run the test, `npm run start:docker`, then `npm test -- --testPathPattern html/my-feature*.html`
   -  Verify screenshots
1. Write a new sample with `README.md`
   -  This is the user story and proof-of-record on how the feature will work
   -  Update [`samples/README.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/samples/README.md)
1. Add more design docs to [`/docs`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs) as needed
1. Add a few log entries to `CHANGELOG.md`
1. File a pull request

## Additional context

### Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md).
