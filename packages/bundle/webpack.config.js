const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'webchat': './lib/index.js',
    'webchat-es5': './lib/index-es5.js',
    'webchat-minimal': './lib/index-minimal.js'
  },
  mode: 'production',
  module: {
    rules: [{
      // TODO: [P2] We prefer bundler-independent, that means, we could easily move around Webpack or Rollup.js for better bundling.
      //       And non-JS resources should not be loaded in bundler because this will assume our project to always run in a browser.
      //       But Adaptive Cards 1.1.2 load CSS using import/require, so we are whitelisting it here, until they get it fixed.
      //       Track at https://github.com/Microsoft/AdaptiveCards/issues/2279.
      test: /adaptivecards-default\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [new Visualizer()]
};
