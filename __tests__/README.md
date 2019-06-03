## How to run tests

Automated testing in Web Chat is using multiple open-source technologies.

-  [Travis CI](https://travis-ci.org/) for automatic testing
-  Test against [MockBot](https://github.com/compulim/BotFramework-MockBot)
   -  Try it out with this [live demo](https://microsoft.github.io/BotFramework-WebChat/01.a.getting-started-full-bundle)
-  Visual regression test (a.k.a. compare screenshots)
   -  Generated on [Chrome on Docker](https://github.com/SeleniumHQ/docker-selenium)
   -  Compared using [`pixelmatch`](https://npmjs.com/package/pixelmatch) via [`jest-image-snapshot`](https://npmjs.com/package/jest-image-snapshot)
-  Run under [`Jest`](https://jestjs.io/)
-  [`Istanbul`](https://npmjs.com/package/istanbul) for code coverage
   -  [`Coveralls`](https://coveralls.io/) for test statistics

### Running tests under Docker

-  Install Docker
-  On Windows, set environment variable `COMPOSE_CONVERT_WINDOWS_PATHS=1`
-  `docker-compose up --build`
-  `npm test`

### Running tests under local box

-  Install latest Chrome
-  Download [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and extract to project root
-  Set environment variable `WEBCHAT_TEST_ENV=chrome-local`
-  `npm test`
