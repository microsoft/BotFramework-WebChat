const productionConfig = require('./webpack.config');

module.exports = {
  ...productionConfig,
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    ...productionConfig.output,
    filename: 'directlinespeech.development.js'
  }
};
