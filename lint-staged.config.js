function prettierCode(filenames) {
  return filenames.map(filename => `prettier --write ${filename}`);
}

function prettierMarkdown(filenames) {
  return filenames.map(filename => `prettier --write ${filename} --tab-width 3 --single-quote true`);
}

// eslint-disable-next-line no-undef
module.exports = {
  '{docs,samples}/**/*.{html,js,jsx,ts,tsx}': prettierCode,
  '**/*.md': prettierMarkdown,
  'packages/**/*.css': ['npm run precommit:biome'],
  'packages/api/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:api'],
  'packages/base/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:base'],
  'packages/bundle/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:bundle'],
  'packages/component/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:component'],
  'packages/core/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:core'],
  'packages/debug-theme/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:debug-theme'],
  'packages/directlinespeech/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:directlinespeech'],
  'packages/fluent-theme/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:fluent-theme'],
  'packages/isomorphic-react/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:isomorphic-react'],
  'packages/isomorphic-react-dom/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:isomorphic-react-dom'],
  'packages/react-hooks/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:react-hooks'],
  'packages/react-valibot/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:react-valibot'],
  'packages/redux-store/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:redux-store'],
  'packages/styles/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:styles'],
  'packages/support/cldr-data/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:support-cldr-data'],
  'packages/support/cldr-data-downloader/src/**/*.{mjs,js,ts,tsx}': [
    'npm run precommit:eslint:support-cldr-data-downloader'
  ],
  'packages/test/harness/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:test-harness'],
  'packages/test/page-object/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:test-page-object'],
  'packages/test/web-server/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:test-web-server'],
  'packages/*/src/**/*.{ts,tsx}': [() => 'npm run precommit:typecheck']
};
