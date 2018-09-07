const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'BotChat': './lib/index-full.js',
    'BotChat-core': './lib/index.js',
    'BotChat-es5': './lib/index-es5.js'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [new Visualizer()]
};
