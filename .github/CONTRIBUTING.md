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

Please install the following in the development environment:

- [Node.js](https://nodejs.org/) of LTS or latest version
- [NPM] with minimum version of 7.0.0
- [Docker](https://docs.docker.com/get-docker/)
- On Windows 10, install [Windows Subsystem for Linux 2](https://aka.ms/wsl2)
  - [Ubuntu 20.04](https://www.microsoft.com/en-us/p/ubuntu-2004-lts/9n6svws3rx71)

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

- For one-off building, run `npm run build`
- For continuous building, run `npm start`

The bundle output will be located at:

- [http://localhost:5000/webchat.js](http://localhost:5000/webchat.js) (also `webchat-es5.js` and `webchat-minimal.js`)
- `/packages/bundle/dist/webchat*.js`

# Trying out the build

There are multiple ways to try out the build:

- Using our prebuilt environments
  - Our prebuilt environments are great ways to test out the latest from Web Chat
  - Using the Web Chat playground
    - `cd packages/playground`
    - `npm start`
    - Navigate to [http://localhost:3000/](http://localhost:3000/), and click on "Official MockBot" on the upper right corner
  - Using `webchat-loader`
    - Navigate to [https://compulim.github.io/webchat-loader/](https://compulim.github.io/webchat-loader/)
    - In the version dropdown, select [`http://localhost:5000/webchat-es5.js`](`http://localhost:5000/webchat-es5.js`)
      - If you do not see this options, make sure you have run `npm start` and can access the URL
    - Selecting a bot to use
      - If you do not own a bot or prefer to use our bots, select "[Public] MockBot" or other bots from the presets
      - If you have your own Direct Line or Direct Line App Service Extension bot:
        - Check "Direct Line via Web Socket" or "Direct Line App Service Extension" in the "Protocol" section
          - For "Direct Line App Service Extension", set the host name to your bot
        - If you have the Direct Line secret of your bot, type it in the "Secret" box
        - Otherwise, type the token in the "Token" box
      - If you have a Direct Line Speech bot:
        - Select the region of your resource in the "Speech region" box
        - Type the subscription key in the "Speech key" box, or the authorization token in the "Speech token" box
    - Selecting speech options for non-Direct Line Speech bot:
      - If you do not need to use speech, clear "Speech key" and "Speech token"
      - If you own a Cognitive Services Speech Services resource:
        - Select the region of your resource in the "Speech region" box
        - Type the subscription key in the "Speech key" box, or the authorization token in the "Speech token" box
      - If you do not own Cognitive Services Speech Services resource, click "MockBot" below the "Speech key" box
- Write your own HTML page to load Web Chat
  - Using a HTML page is recommended over using the playground or loader for development, for faster loading and quick reproduce ability
  - `<script src="http://localhost:5000/webchat.js"></script>`
- Create a new React app and symlink or load tarballs from these packages, in the following order:
  1. `/packages/core`
  1. `/packages/api`
  1. `/packages/component`
  1. `/packages/directlinespeech`
  1. `/packages/bundle`

# How to contribute to our code

1. [Use test driven development](#test-driven-development)
1. Fix the issue or implement the new feature
1. [Run static code analysis](#static-code-analysis)
1. [Final checks](#final-checks)

## Test driven development

We care about software quality. Quality checking prevents regressions, reduces maintenance costs, minimizes chores, and enables us to move faster.

For bugs, write test page(s) to reproduce the bug, then fix it. This will prevent future regressions.

For features, write test page(s) to try out the feature. Write new test pages to verify different sub-features, e.g. rendering in carousel layout vs. rendering in stacked layout. Also write tests for both happy and unhappy paths. This will future-proof the work and protect the investment.

### Writing a test

Start by copying the test page template from [`/__tests__/html/simple.html`](https://github.com/microsoft/BotFramework-WebChat/blob/main/__tests__/html/simple.html) and [`simple.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/__tests__/html/simple.js). Additionally, follow [other test pages](https://github.com/microsoft/BotFramework-WebChat/tree/main/__tests__/html) to learn about our [page object model](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/test/page-object/src/globals).

We prefer using end-to-end visual regression tests (VRT) for pixel-perfect and whole feature verification. Unit tests should be written for utility functions. For VRT, we use [`pixelmatch`](https://npmjs.com/package/pixelmatch) via [`jest-image-snapshot`](https://npmjs.com/package/jest-image-snapshot).

### Running tests manually

Download [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and extract to the project root.

Run `npm run browser`. It will open a new browser window to http://localhost:5001/**tests**/html/. Then, navigate to the test file.

When tests have completed successfully, the page should display a green check.

![Transcript with a green check showing test succeeded](https://github.com/microsoft/BotFramework-WebChat/raw/main/docs/media/running-test.png)

> If the test pages take any screenshots, run them in Jest to save the screenshots to `/__tests__/__image_snapshots__/html/`.

### Running tests automatically

For test environment convergence and stability, Web Chat uses Docker for hosting the test environment. Please install the following components:

1. On Windows, install [Windows Subsystem for Linux 2 (a.k.a. WSL 2)](https://aka.ms/wsl2)
1. [Docker Desktop](https://www.docker.com/get-started)
1. (Optional) Install [watchman](https://facebook.github.io/watchman/) to improve Jest performance
1. Run `npm run docker`. It will start a Docker Compose with Selenium Grid and 4 nodes of Chrome
1. In a new terminal, run `npm test` to start Jest. When Jest runs the test pages, it will take screenshots of new tests and save it under [`/__tests__/__image_snapshots__/html`](https://github.com/microsoft/BotFramework-WebChat/tree/main/__tests__/__image_snapshots__/html)

### Troubleshooting test suites

We run test suites on every PR and require 100% pass rate. If test suites do not complete successfully, the cause may be:

- New changes are causing failure(s) in existing tests
- Intermittent services issues
- Test reliability issue, please see [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938)
- Polluted development environment, for example:
  - Outdated `node_modules` content
  - Outdated Node.js or NPM

When the test suites fail:

- Identify whether the tests fail WITHOUT any code changes
  - Make a fresh clone of BotFramework-WebChat and run the test suites without any changes. If the fresh clone tests pass, this means the latest code changes are causing failures.
- Identify whether the failure is intermittent
  - Run the (failing) test suites again, potentially using Jest filters (<kbd>F</kbd> for failed tests)

If existing test suites fail without any code changes, please determine the following:

- Test suites always fail, even after repeated runs
  - The service may have been updated, causing the test suite failures. Please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose) on the Web Chat repository.
- Test suites fail intermittently
  - Service reliability problems (e.g. for DirectLine, or Mockbot) may be the cause. Please [file an issue](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose) on the Web Chat repository.
  - Test reliability problems may be the cause. If so, please comment on [#2938](https://github.com/microsoft/BotFramework-WebChat/issues/2938) and include:
    - Failing test names/files
    - Failing screencaps, if available. These images can be retrieved from `__diff_output__`
    - Error messages

To debug race conditions:

1. Append `location.reload()` to the test code to continually reload the test page until it fails
1. Navigate to the test page on `http://localhost:5001/tests/<testname>` and wait until the test fails, after which the automatic reloading will stop

General tips on race conditions or intermittent test failures:

- After sending a message, wait for responses from the bot, using `await pageConditions.minNumActivitiesShown(2)`
- After a long message is shown, wait for scroll to complete, using `await pageConditions.scrollToBottomCompleted()`
- Remove or speed up animations and media progress bars
  - If your screenshot is taken with a GIF animation, such as the spinner next to "Connecting..." prompt, you will want to replace it using `styleOptions`:
    - `styleOptions: { spinnerAnimationBackgroundImage: 'url(/assets/staticspinner.png)' }`

## Static code analysis

Run `npm run precommit` for static code analysis.

To ignore any ESLint errors, please use `eslint-disable-next-line` instead of disabling a specific rule for the whole file. Comments are required on why the rule is disabled.

## Final checks

There are checks that automation will not be able to capture. For example:

- Transparency
  - Summarize test updates or changes as a part of the pull request
  - If there are ONLY test changes, summarize those changes in `CHANGELOG.md` as well
  - Fill out the pull request form with details
- Hygiene
  - Make sure imports, members, variables, etc, are sorted alphabetically
  - Avoid one-off variables, prefer JavaScript shorthands, shorter and faster code
  - CSS
    - Remove unneeded CSS styles
    - Use CSS BEM and always namespace with `webchat__`, for example, `webchat__block__element--modifier`
    - [Articles on CSS BEM](#articles-related-to-css-block-element-modifier-methodology)
  - Only use local assets
    - All assets must be self-contained and not loaded from any external URLs. This includes both Web Chat assets and test assets
  - No logging to console. Only exceptions:
    - Deprecation notes
    - Warnings
    - Errors
  - No global pollution, for example:
    - No `taborder` with numbers other than `0` or `-1`
    - Minimize `z-index` usage
      - If `z-index` is an absolute must, it must be used in a [new stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
    - Be mindful when using CSS styles in a component with content from end-developers. CSS styles may leak into the content, for example:
      - Set CSS as high in the DOM tree as possible, for example:
        - ```html
          <section>
            <header>Header</header>
            <p>First</p>
            <p>Second</p>
            <footer>Footer</p>
          </section>
          ```
        - Setting `font-family` in `<section>` produces fewer lines of code than setting `font-family` in `<header>`, `<p>`, and `<footer>`, due to the cascade effect
- Inclusivity
  - All features must be accessible. Please refer to [`docs/ACCESSIBILITY.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/ACCESSIBILITY.md)
    - Tab order, content readability, assistive technology-only text, color contrast, etc. must be maintained
    - Assistive technology and browser compatibility
      - NVDA/JAWS: Chrome and Firefox
      - Narrator: Microsoft Edge and Internet Explorer 11
      - VoiceOver: Safari on macOS and iOS/iPadOS
      - TalkBack: Chrome on Android
  - All strings must be localized and all formats internationalized
    - Please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md)
- Tests
  - Tests are important to reduce maintenence burden
  - Pull requests without tests will not be approved or merged into the project
  - When fixing a bug, a new test must be added to reproduce the bug to protect regressions
  - For feature work, please add as many tests as needed to future-proof the feature and protect the investment
  - Avoid using sleeps. Instead, use [fake timer](https://www.npmjs.com/package/lolex)
  - Prioritize short, numerous tests to maximize test parallelism
    - Avoid single, monolithic tests as much as possible
- Ensure that changes are [secure by default](https://en.wikipedia.org/wiki/Secure_by_default)
- Benchmark
  - Performance should not drop significantly
  - Bundle size should not increase significantly
  - Code coverage should not decrease significantly
  - Backward compatibility should be maintained for 2 years
- Cross browser compatibility
  - Windows 10
    - Chrome
    - Microsoft Edge Chromium
    - Firefox
    - Internet Explorer 11 (except speech features)
  - Safari on macOS
  - Safari on iOS or iPadOS
  - Chrome on Android
- Include feature documentation, samples, live demo, published demos bots, etc.
  - All samples must also come with a hosted live demo
  - Please discuss with us if a specific bot is needed for the live demo

## Summary

The following is a quick summary on how to approach when [fixing a bug](#fixing-bug) or [implementing a new feature](#implement-new-feature).

### Fixing bugs

Write the bug repro as a test before fixing the bug.

1. Clone and prepare the repository or reset an existing one
   - To reset, run `npm run tableflip`
1. Run continuous build by running `npm start`
1. Reproduce the bug on a test page under `__tests__/html/this.is.the.bug.html`
1. Run `npm run browser` and navigate to the test page
   - Make sure the test(s) fail as described in the repro
1. Fix the bug
1. Tests should succeed after bug fixes are compiled and reloaded in the browser
1. Run all test suites:
   - Run `npm run docker`, followed by `npm test` in a new terminal
1. Do [final checks](#final-checks)
1. [Submit a pull request](https://github.com/microsoft/BotFramework-WebChat/compare)

### Implementing new features

Write the user story while implementing the feature.

1. Clone and prepare the repository or reset an existing one
   - To reset, run `npm run tableflip`
1. Run continuous build by running `npm start`
1. Clone the test page `__tests__/html/simple.html` to `feature.subfeature.scenario.html` and use it as a playground
1. Run `npm run browser` and navigate to the test page
1. Implement the feature and update/add test pages as needed
   - Test pages should include cases that need more attention, and unhappy paths
1. Run all test suites:
   - Run `npm run docker`, followed by `npm test` in a new terminal
1. For prominent features
   - Write a new sample with a `README.md`, following our samples format
     - This is the user story and proof-of-record on how the feature will work
     - Update [`samples/README.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/samples/README.md) to include the new sample in the list
   - Add design docs to [`/docs`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs)
1. Do [final checks](#final-checks)
1. [Submit a pull request](https://github.com/microsoft/BotFramework-WebChat/compare)

## Additional context

### Articles related to CSS Block Element Modifier methodology

- https://en.bem.info/methodology/css/
- https://en.bem.info/methodology/quick-start/
- http://getbem.com/naming/
- https://www.smashingmagazine.com/2018/06/bem-for-beginners/

### Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md).
