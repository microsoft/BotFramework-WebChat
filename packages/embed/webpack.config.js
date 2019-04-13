const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    'webchat-embed': './lib/index.js'
  },
  mode: 'production',
  module: {
    rules: [
      { loader: 'pug-loader', test: /\.pug$/ }
    ]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.pug',
      title: 'Web Chat',
      xhtml: true
    }),
    new Visualizer()
  ]
};
