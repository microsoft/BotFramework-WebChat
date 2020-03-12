const { join } = require('path');

module.exports = {
  entry: './lib/index',
  mode: 'development',
  output: {
    filename: 'testharness.js',
    library: 'WebChatTest',
    libraryTarget: 'window',
    path: join(__dirname, 'dist')
  }
};
