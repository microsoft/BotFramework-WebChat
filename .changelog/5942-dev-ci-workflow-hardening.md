### Changed

- 👷🏻 Pull request validation now cancels superseded runs, retries `npm clean-install` and `docker compose build`, bounds the Selenium Grid wait and HTML test jobs, keeps build artifacts for 3 days for re-runs, and no longer fails merging test results on re-run, in PR [#5942](https://github.com/microsoft/BotFramework-WebChat/pull/5942), by [@OEvgeny](https://github.com/OEvgeny)
