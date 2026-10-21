/// <reference types="node" />

// A fragment is a mini changelog of one pull request, saved as `.changelog/<PR#>-<slug>.md`:
//
//    ### Fixed
//
//    - Fixed [#1](https://github.com/microsoft/BotFramework-WebChat/issues/1), ..., in PR [#2](...), by [@user](...)
//       - Nested bullets are indented by 3 spaces
//
// Entries are published verbatim, the builder only sorts them into sections.

const FRAGMENT_FILENAME_PATTERN = /^([1-9]\d*)-([a-z\d]+(?:-[a-z\d]+)*)\.md$/u;

// A pull request or issue number not known yet, e.g. "#XXXX", "/pull/XXXX", or a filename starting with "XXXX-".
const PLACEHOLDER_PATTERN = /(?:^|#|\/(?:issues|pull)\/)X{4,}\b/iu;

const README_FILENAME = 'README.md';
const REPOSITORY_URL = 'https://github.com/microsoft/BotFramework-WebChat';

// Same order as in CHANGELOG.md, other Keep a Changelog sections are not used.
const SECTIONS = Object.freeze(['Added', 'Changed', 'Removed', 'Fixed']);

const CREATE_PULL_REQUEST_FIRST = `create the pull request first ("gh pr create"), then write the fragment with its number, e.g.:

   node ./scripts/changelog/new.mjs --issue 5734 "animation cards showing an empty video player for GIF URLs with a query"`;

/**
 * Parses the filename of a fragment.
 *
 * @param {string} filename Filename without directory, e.g. `5930-fix-animated-image-formats.md`.
 * @returns {Readonly<{ prNumber: number, slug: string }> | undefined} `undefined` if it is not a fragment filename.
 */
function parseFragmentFilename(filename) {
  const match = FRAGMENT_FILENAME_PATTERN.exec(filename);

  return match ? Object.freeze({ prNumber: +match[1], slug: match[2] }) : undefined;
}

/**
 * Parses a fragment into its sections.
 *
 * @param {string} markdown Content of the fragment.
 * @param {string} filename Filename of the fragment, used for the pull request number and in error messages.
 * @returns {Readonly<{ filename: string, prNumber: number, sections: Readonly<Record<string, readonly string[]>> }>}
 */
function parseFragment(markdown, filename) {
  const parsedFilename = parseFragmentFilename(filename);

  if (!parsedFilename) {
    throw new Error(
      `${filename}: fragment filename must be "<PR#>-<slug>.md", e.g. "5930-fix-animated-image-formats.md"`
    );
  }

  /** @type {Map<string, string[]>} */
  const sections = new Map();

  /** @type {string[] | undefined} */
  let entries;

  for (const [index, line] of markdown.split(/\r?\n/u).entries()) {
    const failAt = message => fail(`${filename}:${index + 1}: ${message}`);

    const text = line.trimEnd();
    const heading = /^### (.*)$/u.exec(text);

    if (!text) {
      continue;
    } else if (heading) {
      const [, section] = heading;

      SECTIONS.includes(section) || failAt(`unknown section "${section}", use one of: ${SECTIONS.join(', ')}`);
      sections.has(section) && failAt(`section "${section}" appears more than once`);

      entries = [];
      sections.set(section, entries);
    } else if (text.startsWith('- ')) {
      entries || failAt('entry must be under a "### <section>" heading');

      entries.push(text);
    } else if (/^\s+\S/u.test(text)) {
      entries?.length || failAt('indented line must follow an entry');
      /^(?: {3})+\S/u.test(text) || failAt('indent nested lines by 3 spaces per level, without tabs');

      entries[entries.length - 1] += `\n${text}`;
    } else {
      failAt(`expected "### <section>", "- <entry>", or an indented line, got "${text}"`);
    }
  }

  sections.size || fail(`${filename}: fragment has no entries`);

  for (const [section, sectionEntries] of sections) {
    sectionEntries.length || fail(`${filename}: section "${section}" has no entries`);
  }

  return Object.freeze({
    filename,
    prNumber: parsedFilename.prNumber,
    sections: Object.freeze(
      Object.fromEntries(Array.from(sections, ([section, sectionEntries]) => [section, Object.freeze(sectionEntries)]))
    )
  });
}

/**
 * Renders entries of fragments into Keep a Changelog sections, in the order of `SECTIONS`, then in the order of fragments.
 *
 * @param {readonly { sections: Readonly<Record<string, readonly string[]>> }[]} fragments Sorted fragments.
 * @returns {string} Sections without trailing newline, or empty string if there are no entries.
 */
function renderSections(fragments) {
  return SECTIONS.map(section => [section, fragments.flatMap(({ sections }) => sections[section] || [])])
    .filter(([, entries]) => entries.length)
    .map(([section, entries]) => `### ${section}\n\n${entries.join('\n')}`)
    .join('\n\n');
}

function fail(message) {
  throw new Error(message);
}

/**
 * Returns `import.meta.main`, or throws on Node.js versions without it, where the scripts would silently do nothing.
 *
 * @param {ImportMeta} importMeta `import.meta` of the script.
 * @returns {boolean} `true` if the script is run directly, `false` if it is imported.
 */
function isMain(importMeta) {
  if (typeof importMeta.main !== 'boolean') {
    throw new Error(`scripts/changelog needs Node.js 22.18, 24.2, or later, this is Node.js ${process.version}`);
  }

  return importMeta.main;
}

export {
  CREATE_PULL_REQUEST_FIRST,
  isMain,
  parseFragment,
  parseFragmentFilename,
  PLACEHOLDER_PATTERN,
  README_FILENAME,
  renderSections,
  REPOSITORY_URL,
  SECTIONS
};
