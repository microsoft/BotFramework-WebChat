const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'botchat': './lib/index.js',
    'botchat-es5': './lib/index-es5.js',
    'botchat-minimal': './lib/index-minimal.js'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [new Visualizer()]
};
