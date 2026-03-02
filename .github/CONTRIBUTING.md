# Contributing

This project welcomes contributions and suggestions. Most contributions require you to
agree to a Contributor License Agreement (CLA) declaring that you have the right to,
and actually do, grant us the rights to use your contribution. For details, visit
https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need
to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the
instructions provided by the bot. You will only need to do this once across all repositories using our CLA.

## Thank you

Thanks for your interest in improving Web Chat. We invest heavily in engineering excellence to reduce our workloads and enable us to move faster. To start the development, please familiarize yourself with the development process and these automation tools.

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest features and security updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

## Instructions

### Machine setup

- GitHub Codespaces (for code changes)
   1. [Start a new Codespace](https://github.com/codespaces/new)
      - Preferably with 8-core and running inside VSCode (simpler port forwarding)
   2. Wait until Codespace is ready, it will launch a terminal when it is ready to use
   3. Run `npm clean-install`
   4. Run `npm run build`
   5. Run `npm start`
   6. Verify the setup: navigate to http://localhost:5000/webchat.js
      - It should emit JavaScript code of Web Chat
- Local machine (for running a test browser)
   1. Install pre-requisites
      - Install Node.js
         - We support [all versions that are active in service](https://nodejs.org/en/about/previous-releases)
      - Install Google Chrome
   2. Clone locally: `git clone https://github.com/microsoft/BotFramework-WebChat.git`
   3. [Download ChromeDriver](https://googlechromelabs.github.io/chrome-for-testing/) and extract the binary to the repo root
   <!-- Verify if we need this
      - macOS: add execute permission by `chmod +x ./chromedriver` and remove quarantine flag `xattr -d com.apple.quarantine ./chromedriver`
   -->
   4. Run `npm clean-install`
   5. Run `npm run build-browser`
   6. Run `npm run browser`
      - This will start a new Chrome session with banner saying the browser is controlled by automation
      - This browser is solely for development purpose, do not use it for personal browsing
   7. Verify the setup: use the new Chrome session and navigate to http://localhost:5001/__tests__/html2/simple/contentSecurityPolicy.html
      - It should show a green checkmark

### Start coding

> All the changes you made should be done inside your Codespace.

1. Inside your Codespace, add a new test by copying existing one, such as `/__tests__/html2/simple/simple.emulator.html`
2. In the test browser, navigate to your new test, `http://localhost:5001/__tests__/html2/.../your-test-file-html`
3. Verify the setup: it should show a green checkmark
4. Develop using test-driven development approach
   1. Add your test scenario to the HTML file
      - You can look at other tests to see how to interact with the test framework, such as `/__tests__/html2/simple/contentSecurityPolicy.html`
      - Page conditions/elements/objects can be found at `/packages/test/page-object/src/globals`
   2. Browse to your new test HTML file, it should show the test is *failing* with a red cross mark
   3. Modify the production code under `/packages/(api|bundle|component|core|fluent-theme)/`
   4. Refresh the test browser, it should show the test is *passing* with a green checkmark
   5. If you are using snapshot testing, take the snapshot by running `npm test -- --testPathPattern your-test-file.html`

When you are ready, you can submit a pull request to us. Please make sure you follow the instructions inside the pull request template.

## Behaviors

### Why I need 2 setups? Can I just go with one?

For development hygiene reason, we recommend hosting the development work inside GitHub Codespaces.

Our scripts are designed to run on Linux only. Some scripts may need Docker. If your host is Linux with Docker installed, you can combine both setups. If you are on Windows, you can use Windows Subsystem for Linux (WSL2).

### How is my local machine being used?

The local machine is dedicated for test/development browser. The browser is controlled by the test suite. It enables JavaScript code inside HTML file to control the browser itself. Oftentimes, you do not need to update the repository on your local machine, including when making your own changes.

In a traditional setup, WebDriver tests are usually executed in a separate process under Node.js or Java. In our setup, the test code live inside the HTML file and inside browser. The setup enables simpler tests and shorter development time as both test code and system-under-test (SUT) is living inside the same file and same process.

### Why `npm start` is not picking up my new files?

To save CPU, `npm start` will not rebuild on start.

`npm start` will only look at new changes. If you modified your code while `npm start` is not running, run `npm run build` to rebuild all your changes.

### After running `npm run browser` on my box, the Chrome browser launched and closed quickly

On your local box, make sure http://localhost:5001/ is accessible. The Chrome browser is being closed because it cannot reach the development server.

### How to emit screenshots for visual regression tests (VRT)?

We love VRTs. Majority of our tests prioritize snapshot testing over assertion/expectation.

To create VRTs, inside your Codespace:

- Keep the `npm start` running
- Start Docker Compose/Selenium Grid with hosted Chrome
   1. Start a new terminal
   2. `npm run docker`
   3. Verify the setup: browse to http://localhost:4444/wd/hub/status
      - In the JSON output `.value.message`, it should say "Selenium Grid ready."
- Run the tests
   1. Start another terminal while `npm run docker` is running
   2. `npm test`, or a scoped run, e.g. `npm test -- --testPathPattern your-test-file.html`
   3. Verify the setup: run `npm test -- --testPathPattern simple/contentSecurityPolicy.html`
      - The test should pass

### Why run Chrome inside Docker?

We drive for pixel-perfection. Every single pixel in the screenshot matters.

Chrome render slightly different. The changing factors include versions of the host OS. We need to control the stack to guarantee snapshots are generated exactly the same across machines. This includes running a specific version of Chrome and supporting software inside Docker.

### Why my pull request is failing?

Our CI pipeline uses the very same build/test script. When you run `npm test` in your Codespace, you should be able to figure out which tests are failing.

There are a few reasons:

- Failing static code analysis
   - Run `npm run precommit` and check for errors
- Flaky tests
- Test infrastructure is down
   - All of us share the same test infrastructure, it will be rebuilt every weekend or on-demand

Before filing a ticket for us to investigate CI issues, please check out the `main` branch without your change. If the tests are passing in `main` but failing in yours, then it is very likely a problem in the new code.

### How long does it take to run all tests?

> At the time of writing, we have about 1,700 screenshots and 1,200 integration tests.

With a Codespace of 16-core, it usually takes about 10 minutes. On GitHub Actions, it usually takes 10-15 minutes.

### Can I substitute end-to-end tests with unit tests?

No. Our customers are using our product with keyboard and mouse. Unit tests cannot accurately reflect how our customers are using our product.

Our philosophy:

- Integration tests are primary and first-class
- Unit tests are auxiliary: it is for fail-fast/fail-early and simplify debugging

### Can I submit a pull request without tests?

No, unless you are working solely on refactoring the code, bumping versions, documentation, or other non-feature-related activities.

Our philosophy:

- Features need to stand on its own without maintainers actively looking out for them
- With increasing number of features, maintainers will never have enough resources to maintain features while bringing the product forward
- Contributors must write tests that fortify the feature for the *next 5 years*
- If the feature fail, maintainers will have to remove the feature to maintain healthiness of the whole product

This is for the best interest of everyone.

### Can I add a feature that is only available to a certain demographic of customers?

No, please create your own private fork and distribution channel.

We are open-source software. Our interests are for broader audience and we believe transparency is key to our success.

## Additional context

### Articles related to CSS Block Element Modifier methodology

-  https://en.bem.info/methodology/css/
-  https://en.bem.info/methodology/quick-start/
-  http://getbem.com/naming/
-  https://www.smashingmagazine.com/2018/06/bem-for-beginners/

### Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md).
