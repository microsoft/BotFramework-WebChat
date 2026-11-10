// Redux mode runs the machines of botframework-webchat-core: nothing of redux-saga is shipped, in core or in the bundles.

const { readdirSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

// What every build output takes, per esbuild metafile (tsup `metafile: true`) of the dist folder of a package: the inputs
// it bundles, and the modules it imports (a dependency left external, as core's dependencies are).
function inputsOf(packageName) {
  const distPath = dirname(require.resolve(packageName));

  return Object.fromEntries(
    // Paths come from require.resolve() and the dist folder listing, not from user input.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readdirSync(distPath)
      .filter(name => /^metafile-\w+\.json$/u.test(name))
      .map(name => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const { inputs, outputs } = JSON.parse(readFileSync(join(distPath, name), 'utf8'));

        return [
          name,
          [...Object.keys(inputs), ...Object.values(outputs).flatMap(({ imports }) => imports.map(({ path }) => path))]
        ];
      })
  );
}

const isReduxSaga = input => /(?:^|\/)(?:@redux-saga|redux-saga)(?:\/|$)/u.test(input);

test.each([
  ['botframework-webchat-core', ['metafile-cjs.json', 'metafile-esm.json']],
  ['botframework-webchat', ['metafile-cjs.json', 'metafile-esm.json', 'metafile-iife.json']]
])('%s should not bundle or import redux-saga', (packageName, metafiles) => {
  const inputs = inputsOf(packageName);

  // The check reads the metafiles of every format, and they list what was bundled.
  expect(Object.keys(inputs).sort()).toEqual(metafiles);
  Object.values(inputs).forEach(list => expect(list.length).toBeGreaterThan(0));

  expect(Object.fromEntries(Object.entries(inputs).map(([name, list]) => [name, list.filter(isReduxSaga)]))).toEqual(
    Object.fromEntries(metafiles.map(name => [name, []]))
  );
});
