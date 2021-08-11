const { resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.pug',
      title: 'Web Chat',
      xhtml: true
    }),
    new StatsWriterPlugin({
      filename: 'stats.json',
      transform: (_, opts) => JSON.stringify(opts.compiler.getStats().toJson({ chunkModules: true }), null, 2)
    })
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
