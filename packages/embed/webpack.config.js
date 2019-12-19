const { resolve } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

let config = {
  entry: {
    'webchat-embed': './lib/index.js'
  },
  mode: 'production',
  module: {
    rules: [{ loader: 'pug-loader', test: /\.pug$/ }]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'public', to: '.' }]),
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.pug',
      title: 'Web Chat',
      xhtml: true
    }),
    new Visualizer()
  ]
};

const { node_env } = process.env;

if (node_env === 'development' || node_env === 'test') {
  config = {
    ...config,
    devtool: 'inline-source-map',
    mode: 'development'
  };
}

module.exports = config;
