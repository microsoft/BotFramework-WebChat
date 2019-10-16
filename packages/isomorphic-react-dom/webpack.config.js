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
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  }
};
