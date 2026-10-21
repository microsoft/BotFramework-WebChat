import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { readFile, writeFile } from 'fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { join } from 'path';
import { consume, consumeChangelog, readFragments, setBuiltFrom } from './consume.mjs';
import { parseFragment } from './fragment.mjs';
import { changelog, createTestRepository, fragment } from './testing.mjs';

const facility = { afterEach, beforeEach, describe, it };

const POINTER = 'Pointer to the changelog-unreleased branch.';

scenario(
  'merging fragments into "[Unreleased]"',
  bdd => {
    bdd
      .given(
        'an empty "[Unreleased]" with the pointer, and fragments with sections, markers, and nested bullets',
        () => ({
          changelog: changelog(),
          fragments: [
            // Multi-section: added and changed in one pull request.
            parseFragment(
              `### Added

- Rich cards: added fill-in of \`replyToId\`, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)

### Changed

- 💥 \`useSendMessage\`: \`init.attachments[].thumbnailURL\` must be data URI, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)
`,
              '5871-reply-to-id.md'
            ),
            // Nested bullets, indented by 3 spaces.
            parseFragment(
              `### Removed

- 💥 Style set entries are being deprecated, in PR [#5881](https://github.com/microsoft/BotFramework-WebChat/pull/5881), by [@OEvgeny](https://github.com/OEvgeny)
   - \`activityButton\` and \`bubble\`
      - Customizing these entries has no effect
`,
              '5881-deprecate-style-set.md'
            ),
            parseFragment(fragment(5872), '5872-copy-confirmation.md')
          ]
        })
      )
      .when('merged', ({ changelog, fragments }) => consumeChangelog(changelog, fragments))
      .then('should keep the pointer and add the sections in the order of Keep a Changelog', (_, result) =>
        expect(result).toBe(
          changelog(`${POINTER}

### Added

- Rich cards: added fill-in of \`replyToId\`, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)

### Changed

- 💥 \`useSendMessage\`: \`init.attachments[].thumbnailURL\` must be data URI, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)

### Removed

- 💥 Style set entries are being deprecated, in PR [#5881](https://github.com/microsoft/BotFramework-WebChat/pull/5881), by [@OEvgeny](https://github.com/OEvgeny)
   - \`activityButton\` and \`bubble\`
      - Customizing these entries has no effect

### Fixed

- Fixed something, in PR [#5872](https://github.com/microsoft/BotFramework-WebChat/pull/5872), by [@OEvgeny](https://github.com/OEvgeny)`)
        )
      );

    bdd
      .given('"[Unreleased]" with entries from an earlier merge-back, and new fragments', () => ({
        changelog: changelog(`${POINTER}

### Changed

- Changed 1

### Fixed

- Fixed 1
   - Nested 1`),
        fragments: [
          parseFragment(fragment(3, 'Fixed', 'Fixed 3'), '3-c.md'),
          parseFragment(`${fragment(2, 'Added', 'Added 2')}\n${fragment(2, 'Fixed', 'Fixed 2')}`, '2-b.md')
        ]
      }))
      .when('merged', ({ changelog, fragments }) => consumeChangelog(changelog, fragments))
      .then('should keep existing entries, append new ones in fragment order, and add a missing section', (_, result) =>
        expect(result).toBe(
          changelog(`${POINTER}

### Added

- Added 2, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)

### Changed

- Changed 1

### Fixed

- Fixed 1
   - Nested 1
- Fixed 3, in PR [#3](https://github.com/microsoft/BotFramework-WebChat/pull/3), by [@OEvgeny](https://github.com/OEvgeny)
- Fixed 2, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)`)
        )
      );

    bdd
      .given('"[Unreleased]" with entries and no fragments', () => changelog(`${POINTER}\n\n### Fixed\n\n- Fixed 1`))
      .when('merged', changelog => consumeChangelog(changelog, []))
      .then('should not change anything', (changelog, result) => expect(result).toBe(changelog));

    bdd
      .given('a CHANGELOG.md without "[Unreleased]"', () => '# Changelog\n\n## [4.19.2] - 2026-10-08\n')
      .when('merged', changelog => () => consumeChangelog(changelog, []))
      .then('should fail', (_, merge) =>
        expect(merge).toThrow('CHANGELOG.md: cannot find "## [Unreleased]" followed by a release')
      );
  },
  facility
);

scenario(
  'reading fragments from Git',
  bdd => {
    bdd
      .given(
        'fragments committed on different days, an edit, a rename, and an uncommitted one',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('#5926', {
            '.changelog/README.md': '# Not a fragment\n',
            '.changelog/5926-a.md': fragment(5926)
          });
          await repository.commit('#5903 and #5905', {
            '.changelog/5903-b.md': fragment(5903),
            '.changelog/5905-c.md': fragment(5905)
          });
          await repository.commit('Edit #5926', { '.changelog/5926-a.md': fragment(5926, 'Fixed', 'Edited') });
          await repository.commit('#5920, renamed', { '.changelog/1-d.md': fragment(5920) });
          repository.git('mv', '.changelog/1-d.md', '.changelog/5920-d.md');
          await repository.commit('Rename', {});

          await repository.commit('Not a fragment', {});
          await writeFile(join(repository.path, '.changelog/5800-uncommitted.md'), fragment(5800));

          return repository;
        },
        ({ remove }) => remove()
      )
      .when('read', ({ path }) => readFragments(path))
      .then('should be ordered by the time added, then by pull request number, and skip README.md', (_, fragments) =>
        expect(fragments.map(({ filename }) => filename)).toEqual(['5926-a.md', '5903-b.md', '5905-c.md', '5920-d.md'])
      )
      .and('should read the committed content', (_, fragments) =>
        expect(fragments[0].sections.Fixed[0]).toMatch(/^- Edited, in PR/u)
      );

    bdd
      .given(
        'fragments of #9 and #10 added in one commit',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('#10 and #9', {
            '.changelog/10-a.md': fragment(10),
            '.changelog/9-b.md': fragment(9)
          });

          return repository;
        },
        ({ remove }) => remove()
      )
      .when('read', ({ path }) => readFragments(path))
      .then('should be ordered by pull request number, not by filename', (_, fragments) =>
        expect(fragments.map(({ filename }) => filename)).toEqual(['9-b.md', '10-a.md'])
      );

    bdd
      .given(
        'a fragment written before another one was merged, then merged with a merge commit',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('Initial', { 'CHANGELOG.md': changelog() });
          repository.git('checkout', '--quiet', '-b', 'pull-request');
          await repository.commit('#2', { '.changelog/2-a.md': fragment(2) });
          repository.git('checkout', '--quiet', 'main');
          await repository.commit('#3', { '.changelog/3-b.md': fragment(3) });
          repository.git('merge', '--no-commit', '--no-ff', '--quiet', 'pull-request');
          await repository.commit('Merge #2', {});

          return repository;
        },
        ({ remove }) => remove()
      )
      .when('read', ({ path }) => readFragments(path))
      .then('should be ordered by the time merged', (_, fragments) =>
        expect(fragments.map(({ filename }) => filename)).toEqual(['3-b.md', '2-a.md'])
      );

    bdd
      .given(
        'a fragment without pull request number',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('Bad', { '.changelog/fix-something.md': fragment(1) });

          return repository;
        },
        ({ remove }) => remove()
      )
      .when(
        'read',
        ({ path }) =>
          () =>
            readFragments(path)
      )
      .then('should fail', (_, read) =>
        expect(read).toThrow('.changelog/fix-something.md: fragment filename must be "<PR#>-<slug>.md"')
      );

    bdd
      .given(
        'no .changelog directory',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('Initial', { 'CHANGELOG.md': changelog() });

          return repository;
        },
        ({ remove }) => remove()
      )
      .when('read', ({ path }) => readFragments(path))
      .then('should have no fragments', (_, fragments) => expect(fragments).toEqual([]));
  },
  facility
);

scenario(
  'consuming fragments in a working tree',
  bdd => {
    bdd
      .given(
        'a repository with two fragments',
        async () => {
          const repository = await createTestRepository();

          await repository.commit('Initial', { '.changelog/README.md': '# Fragments\n', 'CHANGELOG.md': changelog() });
          await repository.commit('#2', { '.changelog/2-b.md': fragment(2) });
          await repository.commit('#1', { '.changelog/1-a.md': fragment(1) });

          return repository;
        },
        ({ remove }) => remove()
      )
      .when('consumed', ({ path }) => consume(path))
      .then('should add the entries to CHANGELOG.md in merge order, built from HEAD', async ({ git, path }) =>
        expect(await readFile(join(path, 'CHANGELOG.md'), 'utf8')).toBe(
          changelog(`Built from [\`${git('rev-parse', '--short=7', 'HEAD')}\`](https://github.com/microsoft/BotFramework-WebChat/commit/${git('rev-parse', 'HEAD')}).

${POINTER}

### Fixed

- Fixed something, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)
- Fixed something, in PR [#1](https://github.com/microsoft/BotFramework-WebChat/pull/1), by [@OEvgeny](https://github.com/OEvgeny)`)
        )
      )
      .and('should delete the fragments and keep README.md', ({ git }) =>
        expect(git('status', '--porcelain')).toBe(' D .changelog/1-a.md\n D .changelog/2-b.md\n M CHANGELOG.md')
      );
  },
  facility
);

scenario(
  'the "Built from" line',
  bdd => {
    const COMMIT_1 = 'a002cbfb1'.padEnd(40, '0');
    const COMMIT_2 = '1ca95e18e'.padEnd(40, '0');
    const FRAGMENTS = [parseFragment(fragment(1), '1-a.md')];

    bdd
      .given('an empty "[Unreleased]" with the pointer', () => changelog())
      .when('merged with a fragment, built from a commit', changelog =>
        consumeChangelog(changelog, FRAGMENTS, { commit: COMMIT_1 })
      )
      .then('should add the line right under "## [Unreleased]", linked to the commit', (_, result) =>
        expect(result).toContain(
          `## [Unreleased]\n\nBuilt from [\`a002cbf\`](https://github.com/microsoft/BotFramework-WebChat/commit/${COMMIT_1}).\n\n${POINTER}\n\n### Fixed\n`
        )
      )
      .when('merged again, built from another commit', (_, result) =>
        consumeChangelog(result, [parseFragment(fragment(2), '2-b.md')], { commit: COMMIT_2 })
      )
      .then('should replace the line, not add another one', (_, result) => {
        expect(result).toContain(
          `## [Unreleased]\n\nBuilt from [\`1ca95e1\`](https://github.com/microsoft/BotFramework-WebChat/commit/${COMMIT_2}).\n\n${POINTER}\n\n### Fixed\n`
        );
        expect(result.match(/^Built from /gmu)).toHaveLength(1);
      })
      .when('the line is removed', (_, result) => setBuiltFrom(result))
      .then('should only remove the line', (_, result) =>
        expect(result).toBe(consumeChangelog(changelog(), [...FRAGMENTS, parseFragment(fragment(2), '2-b.md')]))
      );

    bdd
      .given('an empty "[Unreleased]" with the pointer', () => changelog())
      .when('merged without fragments, built from a commit', changelog =>
        consumeChangelog(changelog, [], { commit: COMMIT_1 })
      )
      .then('should not change anything', (changelog, result) => expect(result).toBe(changelog));

    bdd
      .given('an abbreviated commit hash', () => 'a002cbf')
      .when('merged', commit => () => consumeChangelog(changelog(), FRAGMENTS, { commit }))
      .then('should fail', (_, merge) => expect(merge).toThrow('Commit must be a full hash, got "a002cbf"'));
  },
  facility
);

scenario(
  'reading invalid fragments',
  bdd => {
    const read = markdown => {
      try {
        return parseFragment(markdown, '1-a.md');
      } catch (error) {
        return error;
      }
    };

    bdd
      .given('a section not used in CHANGELOG.md', () => '### Deprecated\n\n- Deprecated something\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          '1-a.md:1: unknown section "Deprecated", use one of: Added, Changed, Removed, Fixed'
        )
      );

    bdd
      .given('a section twice', () => '### Fixed\n\n- Fixed a\n\n### Fixed\n\n- Fixed b\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '1-a.md:5: section "Fixed" appears more than once')
      );

    bdd
      .given('an entry without section', () => '- Fixed a\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '1-a.md:1: entry must be under a "### <section>" heading')
      );

    bdd
      .given('a paragraph', () => '### Fixed\n\nFixed a\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          '1-a.md:3: expected "### <section>", "- <entry>", or an indented line, got "Fixed a"'
        )
      );

    bdd
      .given('a nested line indented by 2 spaces', () => '### Fixed\n\n- Fixed a\n  - b\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '1-a.md:4: indent nested lines by 3 spaces per level, without tabs')
      );

    bdd
      .given('a nested line indented by a tab', () => '### Fixed\n\n- Fixed a\n\t- b\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '1-a.md:4: indent nested lines by 3 spaces per level, without tabs')
      );

    bdd
      .given('an empty section', () => '### Fixed\n')
      .when('read', read)
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '1-a.md: section "Fixed" has no entries')
      );

    bdd
      .given('an empty file', () => '')
      .when('read', read)
      .then('should fail', (_, error) => expect(error).toHaveProperty('message', '1-a.md: fragment has no entries'));
  },
  facility
);
