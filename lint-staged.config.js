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
  'packages/{api,bundle,component,core,directlinespeech,playground}/src/**/*.{js,jsx,ts,tsx}': prettierCode,
  '*.{js,jsx,ts,tsx}': 'npm run eslint'
};
