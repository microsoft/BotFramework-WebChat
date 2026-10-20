import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { tmpdir } from 'os';
import { join } from 'path';
import { formatEntry, getPullRequest, toSlug, writeFragment } from './new.mjs';

const facility = { afterEach, beforeEach, describe, it };

scenario(
  'formatting an entry',
  bdd => {
    bdd
      .given('a fix with one issue', () => ({
        author: 'OEvgeny',
        description: 'animation cards showing an empty video player',
        issues: [5734],
        prNumber: 5930,
        section: 'Fixed'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should put the issue first', (_, entry) =>
        expect(entry).toBe(
          '- Fixed [#5734](https://github.com/microsoft/BotFramework-WebChat/issues/5734), animation cards showing an empty video player, in PR [#5930](https://github.com/microsoft/BotFramework-WebChat/pull/5930), by [@OEvgeny](https://github.com/OEvgeny)'
        )
      );

    bdd
      .given('a fix with two issues', () => ({
        author: 'OEvgeny',
        description: 'carousel flippers without focus indicator',
        issues: [5704, 5744],
        prNumber: 5876,
        section: 'Fixed'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should join the issues with "and"', (_, entry) =>
        expect(entry).toBe(
          '- Fixed [#5704](https://github.com/microsoft/BotFramework-WebChat/issues/5704) and [#5744](https://github.com/microsoft/BotFramework-WebChat/issues/5744), carousel flippers without focus indicator, in PR [#5876](https://github.com/microsoft/BotFramework-WebChat/pull/5876), by [@OEvgeny](https://github.com/OEvgeny)'
        )
      );

    bdd
      .given('a fix with three issues', () => ({
        author: 'OEvgeny',
        description: 'focus indicators',
        issues: [1, 2, 3],
        prNumber: 4,
        section: 'Fixed'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should join the issues with commas and "and"', (_, entry) =>
        expect(entry).toBe(
          '- Fixed [#1](https://github.com/microsoft/BotFramework-WebChat/issues/1), [#2](https://github.com/microsoft/BotFramework-WebChat/issues/2), and [#3](https://github.com/microsoft/BotFramework-WebChat/issues/3), focus indicators, in PR [#4](https://github.com/microsoft/BotFramework-WebChat/pull/4), by [@OEvgeny](https://github.com/OEvgeny)'
        )
      );

    bdd
      .given('a fix without issue', () => ({
        author: 'OEvgeny',
        description: 'timestamps always using the 12-hour clock',
        prNumber: 5920,
        section: 'Fixed'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should start with "Fixed"', (_, entry) =>
        expect(entry).toBe(
          '- Fixed timestamps always using the 12-hour clock, in PR [#5920](https://github.com/microsoft/BotFramework-WebChat/pull/5920), by [@OEvgeny](https://github.com/OEvgeny)'
        )
      );

    bdd
      .given('an addition with an issue', () => ({
        author: 'OEvgeny',
        description: 'carousel: <kbd>HOME</kbd>/<kbd>END</kbd> to move the focus between cards',
        issues: [5743],
        prNumber: 5904,
        section: 'Added'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should start with "Added" and the issue', (_, entry) =>
        expect(entry).toBe(
          '- Added [#5743](https://github.com/microsoft/BotFramework-WebChat/issues/5743), carousel: <kbd>HOME</kbd>/<kbd>END</kbd> to move the focus between cards, in PR [#5904](https://github.com/microsoft/BotFramework-WebChat/pull/5904), by [@OEvgeny](https://github.com/OEvgeny)'
        )
      );

    bdd
      .given('an addition without issue', () => ({
        author: 'compulim',
        description: '`hooks/useSendMessage`: added `replyToId`', // Scope style, as written
        prNumber: 5871,
        section: 'Added'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should keep the description as written', (_, entry) =>
        expect(entry).toBe(
          '- `hooks/useSendMessage`: added `replyToId`, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)'
        )
      );

    bdd
      .given('a breaking change', () => ({
        author: 'compulim',
        description: '`useSendMessage`: `init.attachments[].thumbnailURL` must be data URI',
        marker: '💥',
        prNumber: 5871,
        section: 'Changed'
      }))
      .when('formatted', init => formatEntry(init))
      .then('should start with the marker', (_, entry) =>
        expect(entry).toBe(
          '- 💥 `useSendMessage`: `init.attachments[].thumbnailURL` must be data URI, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)'
        )
      );
  },
  facility
);

scenario(
  'formatting an invalid entry',
  bdd => {
    const validInit = Object.freeze({
      author: 'OEvgeny',
      description: 'something',
      prNumber: 1,
      section: 'Fixed'
    });

    bdd
      .given('a description starting with "Fixed"', () => ({ ...validInit, description: 'Fixed something' }))
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) => expect(format).toThrow('must not start with "Fixed"'));

    bdd
      .given('a description with a newline', () => ({ ...validInit, description: 'line 1\nline 2' }))
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) => expect(format).toThrow('single line'));

    bdd
      .given('an unknown section', () => ({ ...validInit, section: 'Deprecated' })) // Keep a Changelog has it, we do not
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) =>
        expect(format).toThrow('Section must be one of: Added, Changed, Removed, Fixed')
      );

    bdd
      .given('an unknown marker', () => ({ ...validInit, marker: '🎉' }))
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) => expect(format).toThrow('Marker must be one of'));

    bdd
      .given('an issue repeated', () => ({ ...validInit, issues: [1, 1] }))
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) => expect(format).toThrow('Issues must not repeat'));

    bdd
      .given('an author with a space', () => ({ ...validInit, author: 'O Evgeny' }))
      .when('formatted', init => () => formatEntry(init))
      .then('should throw', (_, format) => expect(format).toThrow('Author must be a GitHub login'));
  },
  facility
);

scenario(
  'making a slug from a branch name',
  bdd => {
    bdd
      .given('a branch with a user prefix', () => 'OEvgeny/fix-animated-image-formats')
      .when('converted', branch => toSlug(branch))
      .then('should drop the prefix', (_, slug) => expect(slug).toBe('fix-animated-image-formats'));

    bdd
      .given('a branch with uppercase and symbols', () => 'feat/Add_Carousel--Keys!')
      .when('converted', branch => toSlug(branch))
      .then('should be lowercase with hyphens', (_, slug) => expect(slug).toBe('add-carousel-keys'));

    bdd
      .given('a very long branch name', () => `fix-${'a'.repeat(48)}-b`)
      .when('converted', branch => toSlug(branch))
      .then('should be cut at 50 characters', (_, slug) => expect(slug).toBe(`fix-${'a'.repeat(46)}`));
  },
  facility
);

scenario(
  'writing a fragment',
  bdd => {
    const entry =
      '- Fixed timestamps always using the 12-hour clock, in PR [#5920](https://github.com/microsoft/BotFramework-WebChat/pull/5920), by [@OEvgeny](https://github.com/OEvgeny)';

    bdd
      .given(
        'an empty .changelog directory',
        async () => {
          const directoryPath = join(await mkdtemp(join(tmpdir(), 'changelog-new-')), '.changelog');

          await mkdir(directoryPath);

          return directoryPath;
        },
        directoryPath => rm(join(directoryPath, '..'), { force: true, recursive: true })
      )
      .when('a fragment is written', directoryPath =>
        writeFragment(directoryPath, { entry, prNumber: 5920, section: 'Fixed', slug: 'fix-hour-cycle' })
      )
      .then('should be named after the pull request', async directoryPath =>
        expect(await readdir(directoryPath)).toEqual(['5920-fix-hour-cycle.md'])
      )
      .and('should have the section and the entry', async directoryPath =>
        expect(await readFile(join(directoryPath, '5920-fix-hour-cycle.md'), 'utf8')).toBe(`### Fixed\n\n${entry}\n`)
      )
      .when('another fragment is written for the same pull request', directoryPath =>
        writeFragment(directoryPath, { entry, prNumber: 5920, section: 'Fixed', slug: 'other-slug' }).catch(
          error => error
        )
      )
      .then('should refuse', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          '.changelog/5920-fix-hour-cycle.md already exists, edit it to add more entries'
        )
      )
      .and('should not write another file', async directoryPath =>
        expect(await readdir(directoryPath)).toEqual(['5920-fix-hour-cycle.md'])
      );

    bdd
      .given(
        'a .changelog directory with a fragment of #5920',
        async () => {
          const directoryPath = join(await mkdtemp(join(tmpdir(), 'changelog-new-')), '.changelog');

          await mkdir(directoryPath);
          await writeFile(join(directoryPath, '5920-fix-hour-cycle.md'), 'Hand-edited');

          return directoryPath;
        },
        directoryPath => rm(join(directoryPath, '..'), { force: true, recursive: true })
      )
      .when('the same fragment is written', directoryPath =>
        writeFragment(directoryPath, { entry, prNumber: 5920, section: 'Fixed', slug: 'fix-hour-cycle' }).catch(
          error => error
        )
      )
      .then('should refuse', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('already exists'))
      )
      .and('should keep the existing file', async directoryPath =>
        expect(await readFile(join(directoryPath, '5920-fix-hour-cycle.md'), 'utf8')).toBe('Hand-edited')
      );
  },
  facility
);

scenario(
  'getting the pull request',
  bdd => {
    const view = () => {
      const calls = [];

      return Object.freeze({
        calls,
        runGitHubCLI: args => {
          calls.push(args);

          return '{"author":{"is_bot":false,"login":"contributor"},"number":5930}';
        }
      });
    };

    bdd
      .given('no options', () => ({ options: {}, ...view() }))
      .when('got', ({ options, runGitHubCLI }) => getPullRequest(options, runGitHubCLI))
      .then('should call "gh pr view" once', ({ calls }) =>
        expect(calls).toEqual([['pr', 'view', '--json', 'author,number']])
      )
      .and('should use the number and the author of the pull request', (_, pullRequest) =>
        expect(pullRequest).toEqual({ author: 'contributor', prNumber: 5930 })
      );

    bdd
      .given('--author', () => ({ options: { author: 'OEvgeny' }, ...view() }))
      .when('got', ({ options, runGitHubCLI }) => getPullRequest(options, runGitHubCLI))
      .then('should use the author passed', (_, pullRequest) =>
        expect(pullRequest).toEqual({ author: 'OEvgeny', prNumber: 5930 })
      );

    bdd
      .given('--pr', () => ({ options: { pr: '5920' }, ...view() }))
      .when('got', ({ options, runGitHubCLI }) => getPullRequest(options, runGitHubCLI))
      .then('should view that pull request', ({ calls }) =>
        expect(calls).toEqual([['pr', 'view', '5920', '--json', 'author,number']])
      );

    bdd
      .given('--pr and --author', () => ({ options: { author: 'OEvgeny', pr: '5920' }, ...view() }))
      .when('got', ({ options, runGitHubCLI }) => getPullRequest(options, runGitHubCLI))
      .then('should not call "gh"', ({ calls }) => expect(calls).toEqual([]))
      .and('should use the options', (_, pullRequest) =>
        expect(pullRequest).toEqual({ author: 'OEvgeny', prNumber: 5920 })
      );
  },
  facility
);
