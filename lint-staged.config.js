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
  'packages/api-middleware/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:api-middleware'],
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
  'packages/repack/adaptivecards/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-adaptivecards'],
  'packages/repack/base64-js/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-base64-js'],
  'packages/repack/botframework-directlinejs/src/**/*.{mjs,js,ts,tsx}': [
    'npm run precommit:eslint:repack-botframework-directlinejs'
  ],
  'packages/repack/html-react-parser/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-html-react-parser'],
  'packages/repack/microsoft-cognitiveservices-speech-sdk/src/**/*.{mjs,js,ts,tsx}': [
    'npm run precommit:eslint:repack-microsoft-cognitiveservices-speech-sdk'
  ],
  'packages/repack/object-assign/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-object-assign'],
  'packages/repack/react/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react'],
  'packages/repack/react@baseline/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-baseline'],
  'packages/repack/react@umd/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-umd'],
  'packages/repack/react-dom/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-dom'],
  'packages/repack/react-dom@baseline/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-dom-baseline'],
  'packages/repack/react-dom@umd/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-dom-umd'],
  'packages/repack/react-is/src/**/*.{mjs,js,ts,tsx}': ['npm run precommit:eslint:repack-react-is'],
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
