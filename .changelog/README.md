# Changelog fragments

Each pull request adds one file here, `<PR#>-<slug>.md`, with its changelog entries. Pull requests no longer edit `CHANGELOG.md`, so they do not conflict with each other.

On every push to `main`, a workflow recreates the `changelog-unreleased` branch from `main`, plus one commit that merges all fragments into the `[Unreleased]` section of [`CHANGELOG.md`](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/CHANGELOG.md#unreleased) and deletes them. When there are no fragments, the branch is the same as `main`, and its "Built from" line, if any, is left as it was. The workflow always pushes, so it also recreates the branch after it was deleted.

## Merging back

From time to time, a maintainer moves the entries into `CHANGELOG.md` on `main` by merging back a copy of the branch:

```sh
git fetch origin
git push origin origin/changelog-unreleased:refs/heads/<user>/changelog-merge-back
```

Then open a pull request from `<user>/changelog-merge-back` and squash-merge it. Do not open it from `changelog-unreleased` itself: the workflow pushes it with `GITHUB_TOKEN`, which does not run the required checks, and rebuilds it on every push to `main`, which resets approvals. If a pull request from `changelog-unreleased` is merged anyway, GitHub deletes the branch, and the resulting push to `main` recreates it right away, so the "Show most recent changelog" link keeps working.

The copy may fall behind `main`: the check still passes, and fragments merged since then stay for the next merge-back.

## Adding an entry

Create the pull request first, the fragment needs its number: the check rejects placeholders such as `#XXXX`, and `new.mjs` stops when the branch has no pull request. After `gh pr create`, run:

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

Pull requests that only change the development environment can add a 👷🏻 entry, or be labeled `no-changelog` instead.

## Checks

The "Changelog" check of a pull request passes for:

- A change: it adds `.changelog/<PR#>-<slug>.md` with its own number, or is labeled `no-changelog`. It must not edit the `[Unreleased]` section of `CHANGELOG.md` or delete fragments.
- A merge-back of `changelog-unreleased`: it deletes fragments, adds none, changes no other files, and its `CHANGELOG.md` is exactly the one of `main` with the deleted fragments merged in, except for the "Built from" line.
- A hand edit by a maintainer, labeled `changelog-edit`: it may edit `CHANGELOG.md` and delete fragments, for example a release or a typo fix in merged-back entries. Fragments are still validated.

Every entry of a fragment that the pull request adds or edits must link the pull request of its filename, `[#<PR#>](…/pull/<PR#>)`, without placeholders such as `#XXXX`. Merged fragments are not checked again, so a mistake there does not fail other pull requests or the publish workflow: fix it in a pull request, which is then checked.

A pull request may also edit the fragment of another pull request, for example to fix a typo before it is merged back.

## Scripts

| Command                                                 | What it does                                                                                  |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `node ./scripts/changelog/new.mjs`                      | Writes the fragment of a pull request                                                         |
| `node ./scripts/changelog/check.mjs --pr <PR#>`         | Checks a pull request against `origin/main`, prints its entries                               |
| `node ./scripts/changelog/publish.mjs`                  | Recreates and force-pushes `changelog-unreleased`, used by the workflow                       |
| `node ./scripts/changelog/release.mjs <version> <date>` | Merges the fragments, then moves `[Unreleased]` into a new release, label it `changelog-edit` |
| `node --test 'scripts/changelog/*.spec.mjs'`            | Runs the tests                                                                                |

Except for `new.mjs`, the scripts read fragments from Git commits, not from the working tree. They need Node.js 22.18, 24.2, or later.

Only the "Publish changelog-unreleased" workflow writes the `changelog-unreleased` branch, and it always force-pushes: do not protect the branch against force pushes.
