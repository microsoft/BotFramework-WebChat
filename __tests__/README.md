## How to run tests

Web Chat automated tests are:

- Travis CI for automatic testing
- Docker for containerization
- Test against [MockBot](https://github.com/compulim/BotFramework-MockBot)
- Visual regression test (a.k.a. compare screenshots)
   - Generated on [Chrome on Docker](https://github.com/SeleniumHQ/docker-selenium)
   - Compared using [`pixelmatch`](https://npmjs.com/package/pixelmatch)
- [`Jest`](https://jestjs.io/) as test runner
- [`Istanbul`](https://npmjs.com/package/istanbul) for code coverage
   - [`Coveralls`](https://coveralls.io/) for tracking

### Running tests under Docker

- Install Docker
- On Windows, set environment variable `COMPOSE_CONVERT_WINDOWS_PATHS=1`
- `docker-compose up --build`
- `npm test`

### Running tests under local box

- Install latest Chrome
- Download [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and extract to project root
- Set environment variable `WEBCHAT_TEST_ENV=chrome-locale`
- `npm test`
