const path = require('path');

const { version: reactDOMVersion } = require('react-dom/package.json');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    // React 16 has no "react-dom/client".
    alias: reactDOMVersion.startsWith('16.')
      ? { 'react-dom/client$': path.resolve(__dirname, 'src/react-dom-client.react16.js') }
      : {}
  }
};
