const { resolve } = require('path');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: './lib/index.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'BotChat-es5.js'
  },
  plugins: [new Visualizer()]
};
