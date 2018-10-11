const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'botchat': './lib/index.js',
    'botchat-core': './lib/index-core.js',
    'botchat-es5': './lib/index-es5.js'
  },
  output: {
    filename: '[name].js',
    library: 'WebChat',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [new Visualizer()]
};
