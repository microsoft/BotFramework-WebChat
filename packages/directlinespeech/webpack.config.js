const { resolve } = require('path');
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
  ]
};

const { node_env } = process.env;

if (node_env === 'development' || node_env === 'test') {
  config = {
    ...config,
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
      ...config.output,
      filename: 'directlinespeech.development.js'
    }
  };
}

module.exports = config;
