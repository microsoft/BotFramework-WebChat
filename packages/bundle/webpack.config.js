const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'webchat': './lib/index.js',
    'webchat-es5': './lib/index-es5.js',
    'webchat-minimal': './lib/index-minimal.js'
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [new Visualizer()]
};
