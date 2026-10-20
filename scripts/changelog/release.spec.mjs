import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { renderSections } from './fragment.mjs';
import { releaseChangelog } from './release.mjs';

const facility = { afterEach, beforeEach, describe, it };

const CHANGELOG = `# Changelog

Legends:

- 💥 are breaking changes

## [Unreleased]

Entries for the next release are in [\`UNRELEASED.md\`](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/UNRELEASED.md).

## [4.19.2] - 2026-10-08

### Fixed

- Fixed an error, in PR [#5848](https://github.com/microsoft/BotFramework-WebChat/pull/5848), by [@OEvgeny](https://github.com/OEvgeny)

[Unreleased]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.2...HEAD
[4.19.2]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.1...v4.19.2
`;

const SECTIONS = renderSections([
  {
    sections: {
      Added: [
        '- Added a, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@a](https://github.com/a)'
      ],
      Fixed: [
        '- Fixed b, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@a](https://github.com/a)\n   - Nested'
      ]
    }
  }
]);

scenario(
  'releasing',
  bdd => {
    bdd
      .given('a CHANGELOG.md and the sections of the fragments', () => ({ changelog: CHANGELOG, sections: SECTIONS }))
      .when('released as 4.19.3', ({ changelog, sections }) =>
        releaseChangelog(changelog, { date: '2026-11-03', sections, version: '4.19.3' })
      )
      .then('should add the release below "[Unreleased]", keep its link, and add the reference link', (_, changelog) =>
        expect(changelog).toBe(`# Changelog

Legends:

- 💥 are breaking changes

## [Unreleased]

Entries for the next release are in [\`UNRELEASED.md\`](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/UNRELEASED.md).

## [4.19.3] - 2026-11-03

### Added

- Added a, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@a](https://github.com/a)

### Fixed

- Fixed b, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@a](https://github.com/a)
   - Nested

## [4.19.2] - 2026-10-08

### Fixed

- Fixed an error, in PR [#5848](https://github.com/microsoft/BotFramework-WebChat/pull/5848), by [@OEvgeny](https://github.com/OEvgeny)

[Unreleased]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.3...HEAD
[4.19.3]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.2...v4.19.3
[4.19.2]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.1...v4.19.2
`)
      );

    bdd
      .given('no fragments', () => ({ changelog: CHANGELOG, sections: renderSections([]) }))
      .when(
        'released',
        ({ changelog, sections }) =>
          () =>
            releaseChangelog(changelog, { date: '2026-11-03', sections, version: '4.19.3' })
      )
      .then('should refuse', (_, release) => expect(release).toThrow('No entries to release'));

    bdd
      .given('a version already released', () => ({ changelog: CHANGELOG, sections: SECTIONS }))
      .when(
        'released as 4.19.2',
        ({ changelog, sections }) =>
          () =>
            releaseChangelog(changelog, { date: '2026-11-03', sections, version: '4.19.2' })
      )
      .then('should refuse', (_, release) => expect(release).toThrow('CHANGELOG.md already has 4.19.2'));

    bdd
      .given('an invalid date', () => ({ changelog: CHANGELOG, sections: SECTIONS }))
      .when(
        'released on 2026-02-30',
        ({ changelog, sections }) =>
          () =>
            releaseChangelog(changelog, { date: '2026-02-30', sections, version: '4.19.3' })
      )
      .then('should refuse', (_, release) => expect(release).toThrow('Date must be like 2026-11-03, got "2026-02-30"'));
  },
  facility
);
