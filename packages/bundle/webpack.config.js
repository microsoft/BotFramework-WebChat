const { join } = require('path');
const { resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const TerserPlugin = require('terser-webpack-plugin');

let config = {
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
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig': resolve(__dirname, 'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig.js'),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk': resolve(__dirname, 'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk.js'),
      'microsoft-cognitiveservices-speech-sdk': resolve(__dirname, 'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk.js'),
      react: resolve(__dirname, 'node_modules/isomorphic-react/dist/react.js'),
      'react-dom': resolve(__dirname, 'node_modules/isomorphic-react-dom/dist/react-dom.js')
    },

    // Since Webpack is configured not to transpile, we cannot use package.json/module field to load a module.
    // The default Webpack module resolution order is: "module", then "browser", then "main".
    //
    // De facto entrypoint definitions:
    // - "module": ES.next: transpilation is required for this entrypoint. It should yield code with smallest footprint.
    // - "main": Plain old Node.js or browser: should be ES5 compatible. It may be configured to work only on either Node.js or browser.
    // - "browser": Plain old browsers (ES5, which is supported by IE9). This entrypoint will not work on Node.js.
    //
    // If both "main" and "browser" are present, "main" will be for Node.js and "browser" will be for browsers.
    mainFields: ['browser', 'main']
  }
};

// VSTS always emits uppercase environment variables.
const node_env = process.env.node_env || process.env.NODE_ENV;

// Source maps are only added to development bits because of being slow to load in the browser.
// - "eval-source-map" took 1.6s to load in browser, 1.5s to rebuild
// - "source-map" took 500ms to load, 5s to rebuild
// - No source map took 300ms to load
// "Cheap modules" does not have column information, thus, breakpoint does not work correctly.
if (node_env !== 'production' && node_env !== 'test') {
  config = {
    ...config,
    devtool: 'eval-source-map',
    mode: 'development',
    module: {
      ...config.module,
      rules: [
        ...((config.module || {}).rules || []),
        {
          enforce: 'pre',
          include: [
            join(__dirname, './lib'),
            join(__dirname, '../component/lib'),
            join(__dirname, '../core/lib'),
            join(__dirname, '../directlinespeech/lib')
          ],
          test: /\.js$/,
          use: ['source-map-loader']
        }
      ]
    },
    output: {
      ...config.output,
      devtoolNamespace: 'botframework-webchat'
    }
  };
}

module.exports = config;
