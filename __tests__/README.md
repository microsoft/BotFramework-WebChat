## How to run tests

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
