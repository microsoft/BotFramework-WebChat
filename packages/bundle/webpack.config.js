/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */
/* global __dirname, module, process */

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
  module: {
    rules: [
      {
        // To speed up bundling, we are limiting Babel to a number of packages which does not publish ES5 bits.
        test: /\/node_modules\/(botframework-streaming|buffer|nanoid|postcss|punycode|sanitize-html)\//iu,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: 'commonjs'
                }
              ]
            ]
          }
        }
      }
    ]
  },
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
    libraryTarget: 'umd'
  },
  plugins: [
    new StatsWriterPlugin({
      filename: 'stats.json',
      transform: (_, opts) => JSON.stringify(opts.compiler.getStats().toJson({ chunkModules: true }), null, 2)
    })
  ],
  resolve: {
    alias: {
      // TODO: [P1] #3914 It is smaller to use /lib/ instead of /es2015/ with Webpack.
      //       Verifies if /es2015/ is better when moving to esbuild.
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/Exports': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/Exports.js'
      ),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports.js'
      ),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Exports': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Exports.js'
      ),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioStreamFormat': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioStreamFormat.js'
      ),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports.js'
      ),
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk.js'
      ),

      // This line must be placed after other specific imports.
      'microsoft-cognitiveservices-speech-sdk': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/microsoft.cognitiveservices.speech.sdk.js'
      ),
      react: resolve(__dirname, 'node_modules/isomorphic-react/dist/react.js'),
      'react-dom': resolve(__dirname, 'node_modules/isomorphic-react-dom/dist/react-dom.js')
    }
  },
  target: ['web', 'es5']
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
          test: /\.js$/iu,
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
