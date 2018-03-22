const exec = require('gulp-exec');
const gulp = require('gulp');
const LastCommitLog = require('last-commit-log');
const { major, minor, patch } = require('semver');

const packageJSON = require('./package.json');

gulp.task('version-commit', async () => {
  // TRAVIS_BRANCH is the branch/tag we pushed, or the branch the pull requests targeting.
  // TRAVIS_TAG is the Git tag we pushed, empty if we are not pushing a Git tag, but a branch.
  const { TRAVIS_BRANCH, TRAVIS_TAG } = process.env;

  // TRAVIS_TAG appears when we push a tag (not a branch)
  // We should ignore `git push v1.0.0`, because we probably tag a Git tag by using `npm version`
  if (!TRAVIS_TAG) {
    const lastCommitLog = new LastCommitLog(__dirname);
    const log = await lastCommitLog.getLastCommit();
    const { version } = packageJSON;

    // Based on version from package.json, generate a pre-release version, for example,
    // "0.12.1-pre" would become "0.12.1-master.1a2b3c4"
    // "0.12.1" would also become "0.12.1-master.1a2b3c4"
    //
    // Currently, we only enabled `master` branch. To configure more, update .travis.yml.
    let nextVersion = `${ major(version) }.${ minor(version) }.${ patch(version) }-${ process.env.TRAVIS_BRANCH }.${ log.shortHash }`;

    console.log(`Version: ${ version } -> ${ nextVersion }`);

    // Run `npm version` to update the package.json and package-lock.json.
    // Since this command is run under Travis CI and only for pre-release build,
    // we don't need to `git push` back to GitHub to mark the history (we already have the commit hash in version)
    // So, we do it with `--no-git-tag-version`.
    //
    // After bumping the version, we will run the `deploy` script defined in .travis.yml.
    // Travis will not run `deploy` script for PR. It only run for pushes.
    return gulp
      .src('package.json')
      .pipe(exec(`npm --no-git-tag-version version ${ nextVersion }`));
  }
});
