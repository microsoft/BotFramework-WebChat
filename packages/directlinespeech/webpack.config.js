const { join, resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

let config = {
  entry: './lib/index',
  mode: 'production',
  output: {
    filename: 'directlinespeech.production.min.js',
    library: 'DirectLineSpeech',
    libraryTarget: 'window',
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
      // TODO: [P1] #3575 Remove the following line when bumping to Speech SDK 1.14.0 or higher
      'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/MicAudioSource': resolve(
        __dirname,
        'node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/MicAudioSource.js'
      )
    }
  }
};

// VSTS always emits uppercase environment variables.
const node_env = process.env.node_env || process.env.NODE_ENV;

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
          include: [join(__dirname, './lib')],
          test: /\.js$/,
          use: ['source-map-loader']
        }
      ]
    },
    output: {
      ...config.output,
      devtoolNamespace: 'botframework-directlinespeech-sdk',
      filename: 'directlinespeech.development.js'
    }
  };
}

module.exports = config;
