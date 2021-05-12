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
> Forking Web Chat to make your own customizations means you will lose access to our latest features and security updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

# Preparing the environment

There are 2 steps to prepare the environment: [install tools](#installing-tools) and [prepare the repository](#preparing-the-repository).

## Installing tools

Please install the follow in the development environment:

-  [Node.js](https://nodejs.org/) of LTS or latest version
-  [NPM] with minimum version of 7.0.0
-  [Docker](https://docs.docker.com/get-docker/)
-  On Windows 10, install [Windows Subsystem for Linux 2](https://aka.ms/wsl2)
   -  [Ubuntu 20.04](https://www.microsoft.com/en-us/p/ubuntu-2004-lts/9n6svws3rx71)

## Preparing the repository

To keep our main repository clean and easy to maintain, all changes must done in a [fork](https://github.com/microsoft/botframework-webchat/fork).

Web Chat is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) and uses [`lerna`](https://lerna.js.org/). After the repository is cloned locally, run the following to install all dependencies.

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

# Trying out the build

There are multiple ways to try out the build:

-  Playing with playground
   -  `cd packages/playground`
   -  `npm start`
   -  Navigate to http://localhost:3000/, and click on "Official MockBot" on the upper right corner
-  Playing with `webchat-loader`
   -  Navigate to https://compulim.github.io/webchat-loader/
   -  In the version dropdown, select `http://localhost:5000/webchat-es5.js`
-  Write your own HTML page to load Web Chat
   -  `<script src="http://localhost:5000/webchat.js"></script>`
-  Create a new React app and symlink or load tarballs from these packages, in this specific order
   1. `/packages/core`
   1. `/packages/api`
   1. `/packages/component`
   1. `/packages/directlinespeech`
   1. `/packages/bundle`

# How to contribute to our code

1. [Write test pages first](#test-driven-development)
1. Fix the issue or implement the new feature
1. [Run static code analysis](#static-code-analysis)
1. [Final checks](#final-checks)

## Test driven development

We care about software quality. Quality checking prevents regressions, reduces maintenance costs, minimizes chores, and enables us to move faster.

For bugs, write test page to reproduce the bug, then fix it. This will prevent future regression.

For features, use test page as a playground. Write new tests to verify different sub-features, e.g. rendering in carousel layout vs. rendering in stacked layout. Also write tests for both happy and unhappy paths. This will future-proof the work and protect the investment.

### Writing first test

Start by copying the test page template from [`/__tests__/html/simple.html`](https://github.com/microsoft/BotFramework-WebChat/blob/main/__tests__/html/simple.html) and [`simple.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/__tests__/html/simple.js). Additionally, follow [other test pages](https://github.com/microsoft/BotFramework-WebChat/tree/main/__tests__/html) to learn about our [page object model](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/test/page-object/src/globals).

We prefer using end-to-end visual regression tests (VRT) for pixel-perfect and whole feature verification. And unit tests for utility functions. For VRT, we use [`pixelmatch`](https://npmjs.com/package/pixelmatch) via [`jest-image-snapshot`](https://npmjs.com/package/jest-image-snapshot).

### Running tests manually

Download [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and extract to the project root.

Run `npm run browser`. It will open a new browser window to http://localhost:5001/**tests**/html/. Then, navigate to the test file.

When tests have completed successfully, it should show a green check.

![Transcript with a green check showing test succeeded](https://github.com/microsoft/BotFramework-WebChat/raw/main/docs/media/running-test.png)

> If the test pages take any screenshots, run them in an automated manner to save the screenshots.

### Running tests automatically

For test environment convergence and stability, Web Chat uses Docker for hosting the test environment. Please install the following components:

-  On Windows, install [Windows Subsystem for Linux 2 (a.k.a. WSL 2)](https://aka.ms/wsl2)
-  [Docker Desktop](https://www.docker.com/get-started)
-  (Optional) Install [watchman](https://facebook.github.io/watchman/) to improve Jest performance

Run `npm run docker`. It will start a Docker Compose with Selenium Grid and 4 nodes of Chrome.

Then, run `npm test` to start Jest. When Jest run the test pages, it will take screenshots and save it under [`/__tests__/__image_snapshots__/html`](https://github.com/microsoft/BotFramework-WebChat/tree/main/__tests__/__image_snapshots__/html).

### Troubleshooting test suites

We run test suites on every commit and requires 100% test pass. If test suites did not complete successfully, they are likely:

-  New changes causing fail in existing tests
-  Intermittent services issue
-  Test reliability issue, please see [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
-  Polluted development environment, for example:
   -  Outdated `node_modules` content
   -  Outdated Node.js or NPM

When the test suites failed:

-  Identify if it is related to new changes or not
   -  Clone a clean repository and run the test suites without any changes
-  Identify if it is intermittent issue or not
   -  Run the test suites again

If existing test suites failed without any changes:

-  Test suites always fail
   1. Service could be updated and causing a break in our test suites, please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose)
-  Test suites fail intermittently
   1. If related to service issue, such as the MockBot is down, please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose)
   1. If related to test reliability, please comment to [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)

To debug race conditions:

1. Append `location.reload()` to the test page so it will keep reloading the test page until it fail
1. Navigate to the test page manually and wait until it failed and stop reloading

General tips on race conditions or intermittent test failures:

-  After sending a message, wait for responses from bot
-  After a long message is shown, wait for scroll to complete
-  Remove or speed up animations and media progress bars

## Static code analysis

Run `npm run precommit` for static code analysis.

To skip any ESLint errors, we prefer `eslint-disable-next-line` instead of disabling a specific rule for the whole file. Comments are required on why the rule is disabled.

## Final checks

There are checks that automation will not be able to capture. For example:

-  Transparency
   -  Add a new log to `CHANGELOG.md`
   -  Fill out the pull request form with details
-  Hygiene
   -  Make sure imports, members, variables, etc, are sorted alphabetically
   -  Avoid one-off variables, prefer JavaScript shorthands, shorter and faster code
   -  CSS
      -  Remove unneeded CSS styles
      -  Use CSS BEM and always namespace with `webchat__`, for example, `webchat__block__element--modifier`
   -  Assume offline
      -  All assets must be self-contained, and not loaded from any external URLs
   -  No log to console unless it is a deprecation notes, warning, or error
   -  No global pollution, for example:
      -  No `taborder` with numbers other than `0` or `-1`
      -  Minimize `z-index` usage
         -  If `z-index` is a must, it must be in a [new stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
      -  Be mindful when using CSS styles in a component with content from end-developers, CSS style may leak into the content, for example:
         -  Set `font-family` as early as possible
-  Inclusivity
   -  All features must be accessible, please refer to [`docs/ACCESSIBILITY.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/ACCESSIBILITY.md)
      -  Tab order, content readability, assistive technology-only text, color contrast, etc. must be maintained
      -  Assistive technology and browser compatibility
         -  NVDA/JAWS: Chrome and Firefox
         -  Narrator: Microsoft Edge and Internet Explorer 11
         -  VoiceOver: Safari
         -  TalkBack: Chrome on Android
   -  All strings must be localized, all formats must be internationalized
      -  Please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md)
-  Tests
   -  Tests are important to reduces our maintenence burden
   -  Pull requests without tests will not be approved or merged into the project
   -  When fixing a bug, a new test must be added to reproduce the bug to protect regressions
   -  For feature work, please add as many tests as needed to future-proof the feature and protect the investment
   -  Avoid using sleeps, use [fake timer](https://www.npmjs.com/package/lolex) instead
   -  Writes shorter test code and more test pages, to maximize test parallelism
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
      -  Firefox
      -  Internet Explorer 11 (except speech features)
   -  Safari on macOS
   -  Safari on iOS or iPadOS
   -  Chrome on Android
-  Feature documentation, samples, live demo, operation of demo bots
   -  All samples must also come with a hosted live demo
   -  Please discuss with us if a specific bot is needed for the live demo

## Our workflows

Here list how we generally work when [fixing a bug](#fixing-bug) or [implementing a new feature](#implement-new-feature).

### Fixing bugs

Write the bug repro as a test, before fixing the bug.

1. Clone and prepare the repository or reset an existing one
   -  To reset, run `npm run tableflip`
1. Run continuous build by running `npm start`
1. Reproduce the bug on a test page, under `__tests__/html/this-is-the-bug.html`
1. Run `npm run browser` and navigate to the test page
   -  Make sure the test fail as described in the repro
1. Fix the bug
1. Reload the test page, it should succeed
1. Run all test suites in an automated manner
   -  Run `npm run docker`, followed by `npm test` in a new terminal
1. Do [final checks](#final-checks)
1. Submit a pull request

### Implementing new features

Write the user story while implementing the feature.

1. Clone and prepare the repository or reset an existing one
   -  To reset, run `npm run tableflip`
1. Run continuous build by running `npm start`
1. Clone the test page `__tests__/html/simple.html` to `my-feature.html` and use it as a playground
1. Run `npm run browser` and navigate to the test page
1. Implement the feature and update/add test pages as needed
   -  Test pages should include cases that need more attention, and unhappy paths
1. Run all test suites in an automated manner
   -  Run `npm run docker`, followed by `npm test` in a new terminal
1. For prominent features
   -  Write a new sample with `README.md`
      -  This is the user story and proof-of-record on how the feature will work
      -  Update [`samples/README.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/samples/README.md)
   -  Add design docs to [`/docs`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs)
1. Do [final checks](#final-checks)
1. Submit a pull request

## Additional context

### Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md).
