const { resolve } = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

module.exports = {
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
