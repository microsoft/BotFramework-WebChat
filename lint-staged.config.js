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
  'packages/acs-chat-adapter/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:acs-chat-adapter'],
  'packages/api/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:api'],
  'packages/bundle/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:bundle'],
  'packages/component/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:component'],
  'packages/core/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:core'],
  'packages/directlinespeech/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:directlinespeech'],
  'packages/isomorphic-react/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:isomorphic-react'],
  'packages/isomorphic-react-dom/src/**/*.{js,ts,tsx}': ['npm run precommit:eslint:isomorphic-react-dom'],
  'packages/*/src/**/*.{ts,tsx}': [() => 'npm run precommit:typecheck']
};
