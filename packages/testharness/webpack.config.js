const { join } = require('path');

module.exports = {
  entry: './lib/index',
  mode: 'production',
  output: {
    filename: 'testharness.js',
    library: 'WebChatTest',
    libraryTarget: 'window',
    path: join(__dirname, 'dist')
  }
};
