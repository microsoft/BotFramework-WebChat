### Changed

- 👷🏻 Pull request validation now cancels superseded runs, retries `npm clean-install` and `docker compose build`, bounds the Selenium Grid wait and HTML test jobs, keeps build artifacts for 3 days for re-runs, and no longer fails merging test results on re-run, in PR [#XXXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXXX), by [@OEvgeny](https://github.com/OEvgeny)
