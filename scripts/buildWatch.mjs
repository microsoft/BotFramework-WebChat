import { relative, resolve } from 'path';
import { readPackageUp } from 'read-package-up';
import { readPackage } from 'read-pkg';

const cwd = process.cwd();
const currentPackageJSON = await readPackage();

const {
  packageJson: { workspaces },
  path: rootPackageJSONPath
} = await readPackageUp({ cwd: resolve(cwd, '../') });

const root = resolve(rootPackageJSONPath, '../');

const watchPaths = new Set(['./src/']);

for (const [packageName] of Object.entries(currentPackageJSON.localDependencies || {})) {
  for (const workspace of workspaces) {
    const packageJSON = await readPackage({ cwd: resolve(root, workspace) });

    if (packageJSON.name === packageName) {
      watchPaths.add(resolve(root, workspace, 'package.json'));
    }
  }
}

// "nodemon" will pick up every file change, trigger build too many times.
// console.log(
//   `node --watch ${watchPaths.map(path => `--watch-path "${path}"`).join(' ')} --watch-preserve-output $(which npm) run build:run`
// );

// "inotifywait without --monitor" will not pick up changes while it is building
// console.log(
//   `while true; do inotifywait ${['close_write', 'create', 'delete', 'modify', 'move'].map(event => `--event ${event}`).join(' ')} --recursive ${watchPaths.map(path => `"${path}"`).join(' ')}; $(which npm) run build:run; done`
// );

// "inotifywait with --monitor" will pick up every file change, trigger build too many times.
// console.log(
//   `inotifywait ${['close_write', 'create', 'delete', 'modify', 'move'].map(event => `--event ${event}`).join(' ')} --monitor --recursive ${watchPaths.map(path => `"${path}"`).join(' ')} | while read changed; do $(which npm) run build:run; done`
// );

console.log(
  `${relative(cwd, resolve(root, './scripts/npm/notify-build.sh'))} ${Array.from(watchPaths)
    .map(path => `"${relative(cwd, path)}"`)
    .join(' ')}`
);
