const path = require('path');

const { version: reactDOMVersion } = require('react-dom/package.json');

module.exports = {
  entry: reactDOMVersion.startsWith('16.') ? './src/index.react16.js' : './src/index.js',
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
