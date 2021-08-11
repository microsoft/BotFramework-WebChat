const { resolve } = require('path');

module.exports = {
  entry: {
    'react-dom': './lib/ReactDOM.js'
  },
  externals: [
    {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React'
      }
    }
  ],
  mode: 'production',
  output: {
    libraryTarget: 'umd'
  },
  target: ['web', 'es5']
};
