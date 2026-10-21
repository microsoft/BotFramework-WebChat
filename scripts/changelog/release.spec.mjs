import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { consumeChangelog } from './consume.mjs';
import { parseFragment } from './fragment.mjs';
import { releaseChangelog } from './release.mjs';
import { changelog, fragment } from './testing.mjs';

const facility = { afterEach, beforeEach, describe, it };

const POINTER = 'Pointer to the changelog-unreleased branch.';

const ENTRY_1 =
  '- Fixed b, in PR [#1](https://github.com/microsoft/BotFramework-WebChat/pull/1), by [@a](https://github.com/a)\n   - Nested';

const RELEASED = `# Changelog

Legends:

- 💥 are breaking changes

## [Unreleased]

${POINTER}

## [4.19.3] - 2026-11-03

### Added

- Added something, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)

### Fixed

${ENTRY_1}

## [4.19.2] - 2026-10-08

### Fixed

- Fixed an error, in PR [#5848](https://github.com/microsoft/BotFramework-WebChat/pull/5848), by [@OEvgeny](https://github.com/OEvgeny)

[Unreleased]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.3...HEAD
[4.19.3]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.2...v4.19.3
[4.19.2]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.1...v4.19.2
`;

const release = ({ changelog, fragments }) =>
  releaseChangelog(consumeChangelog(changelog, fragments), { date: '2026-11-03', version: '4.19.3' });

scenario(
  'releasing',
  bdd => {
    bdd
      .given('entries merged back into "[Unreleased]" and a fragment not merged back yet', () => ({
        changelog: changelog(`${POINTER}\n\n### Fixed\n\n${ENTRY_1}`),
        fragments: [parseFragment(fragment(2, 'Added'), '2-b.md')]
      }))
      .when('released as 4.19.3', release)
      .then('should move all entries into 4.19.3, keep the pointer, and add the reference link', (_, result) =>
        expect(result).toBe(RELEASED)
      );

    bdd
      .given('entries merged back with the "Built from" line', () => ({
        changelog: changelog(
          `Built from [\`a002cbf\`](https://github.com/microsoft/BotFramework-WebChat/commit/${'a002cbfb1'.padEnd(40, '0')}).\n\n${POINTER}\n\n### Fixed\n\n${ENTRY_1}`
        ),
        fragments: [parseFragment(fragment(2, 'Added'), '2-b.md')]
      }))
      .when('released as 4.19.3', release)
      .then('should remove the "Built from" line', (_, result) => expect(result).toBe(RELEASED));

    bdd
      .given('only fragments, nothing merged back', () => ({
        changelog: changelog(),
        fragments: [parseFragment(fragment(2, 'Added'), '2-b.md'), parseFragment(`### Fixed\n\n${ENTRY_1}\n`, '1-a.md')]
      }))
      .when('released as 4.19.3', release)
      .then('should give the same result', (_, result) => expect(result).toBe(RELEASED));

    bdd
      .given('only entries merged back, no fragments', () => ({
        changelog: changelog(
          `${POINTER}\n\n### Added\n\n- Added something, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)\n\n### Fixed\n\n${ENTRY_1}`
        ),
        fragments: []
      }))
      .when('released as 4.19.3', release)
      .then('should give the same result', (_, result) => expect(result).toBe(RELEASED));

    bdd
      .given('no entries and no fragments', () => ({ changelog: changelog(), fragments: [] }))
      .when('released', init => () => release(init))
      .then('should refuse', (_, release) => expect(release).toThrow('No entries to release'));

    bdd
      .given('a version already released', () => changelog(`${POINTER}\n\n### Fixed\n\n${ENTRY_1}`))
      .when(
        'released as 4.19.2',
        changelog => () => releaseChangelog(changelog, { date: '2026-11-03', version: '4.19.2' })
      )
      .then('should refuse', (_, release) => expect(release).toThrow('CHANGELOG.md already has 4.19.2'));

    bdd
      .given('an invalid date', () => changelog(`${POINTER}\n\n### Fixed\n\n${ENTRY_1}`))
      .when(
        'released on 2026-02-30',
        changelog => () => releaseChangelog(changelog, { date: '2026-02-30', version: '4.19.3' })
      )
      .then('should refuse', (_, release) => expect(release).toThrow('Date must be like 2026-11-03, got "2026-02-30"'));
  },
  facility
);
