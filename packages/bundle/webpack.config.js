const { resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    webchat: './lib/index.js',
    'webchat-es5': './lib/index-es5.js',
    'webchat-minimal': './lib/index-minimal.js'
  },
  mode: 'production',
  optimization: {
    minimizer: [
      // Webpack use terser for minification
      // https://webpack.js.org/configuration/mode#usage
      // https://webpack.js.org/plugins/terser-webpack-plugin/#terseroptions
      new TerserPlugin({
        terserOptions: {
          // https://github.com/terser-js/terser#minify-options
          output: {
            ascii_only: true
          }
        }
      })
    ]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  },
  plugins: [
    new StatsWriterPlugin({
      filename: 'stats.json',
      transform: (_, opts) => JSON.stringify(opts.compiler.getStats().toJson({ chunkModules: true }), null, 2)
    })
  ],
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/isomorphic-react/dist/react.js'),
      'react-dom': resolve(__dirname, 'node_modules/isomorphic-react-dom/dist/react-dom.js')
    }
  }
};
