# Changelog fragments

Each pull request adds one file here, `<PR#>-<slug>.md`, with its changelog entries. Pull requests no longer edit `CHANGELOG.md`, so they do not conflict with each other.

On every push to `main`, the entries are published to [`UNRELEASED.md`](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/UNRELEASED.md) on the `changelog-unreleased` branch. When releasing, they are moved into [`CHANGELOG.md`](../CHANGELOG.md).

## Adding an entry

After `gh pr create`, run:

```sh
node ./scripts/changelog/new.mjs --issue 5734 "animation cards showing an empty video player for GIF URLs with a query"
```

It writes `.changelog/5930-fix-animated-image-formats.md`, using the number and the author of the pull request, and the branch name:

```md
### Fixed

- Fixed [#5734](https://github.com/microsoft/BotFramework-WebChat/issues/5734), animation cards showing an empty video player for GIF URLs with a query, in PR [#5930](https://github.com/microsoft/BotFramework-WebChat/pull/5930), by [@OEvgeny](https://github.com/OEvgeny)
```

| Option                                                      | Default                       |
| ----------------------------------------------------------- | ----------------------------- |
| `--section added\|changed\|removed\|fixed`                  | `fixed`                       |
| `--issue <issue#>`, repeatable                              | none                          |
| `--marker breaking\|known-issue\|experimental\|sample\|dev` | none                          |
| `--pr <PR#>`                                                | `gh pr view`                  |
| `--author <login>`                                          | `gh pr view`                  |
| `--slug <slug>`                                             | branch name without `<user>/` |

## Format

A fragment is a small changelog: `### Added`, `### Changed`, `### Removed`, or `### Fixed`, each with one or more entries. Nested bullets are indented by 3 spaces per level, the check fails on other indentation. Entries are published as written, so edit the file to add entries or sections.

- Fixed, with issues: `- Fixed [#1](…) and [#2](…), <what was wrong>, in PR [#3](…), by [@user](…)`
- Fixed, without issue: `- Fixed <what was wrong>, in PR [#3](…), by [@user](…)`
- Added, changed, or removed, with issues: `- Added [#1](…), <what>, in PR [#3](…), by [@user](…)`
- Added, changed, or removed, without issue: `- <Scope>: added <what>, in PR [#3](…), by [@user](…)`
- Markers go first: 💥 breaking changes, 🐛 known issues, 🧪 experimental changes, 🏫 samples, 👷🏻 development environment changes

Pull requests that only change the development environment can add a 👷🏻 entry, or be labeled `no-changelog` instead. The check fails if a pull request edits the `[Unreleased]` section of `CHANGELOG.md`, only `release.mjs` writes entries there.

## Scripts

| Command                                                 | What it does                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `node ./scripts/changelog/new.mjs`                      | Writes the fragment of a pull request                                         |
| `node ./scripts/changelog/build.mjs`                    | Prints `UNRELEASED.md`, entries ordered by the time their fragment was merged |
| `node ./scripts/changelog/build.mjs --pr <PR#>`         | Checks the pull request has exactly one fragment, prints its entries          |
| `node ./scripts/changelog/release.mjs <version> <date>` | Moves all entries into `CHANGELOG.md` as a new release, deletes the fragments |
| `node --test 'scripts/changelog/*.spec.mjs'`            | Runs the tests                                                                |

The scripts need Node.js 22.18, 24.2, or later. The `changelog-unreleased` branch is written by the "Publish UNRELEASED.md" workflow, which never force-pushes. Protect it with a ruleset that blocks deletion and force pushes.
