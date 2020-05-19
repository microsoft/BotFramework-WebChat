const { join } = require('path');

let config = {
  entry: './lib/index',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/iu,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    filename: 'testharness.js',
    library: 'WebChatTest',
    libraryTarget: 'window',
    path: join(__dirname, 'dist')
  }
};

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
          exclude: [/external\//],
          include: [join(__dirname, './lib')],
          test: /\.js$/,
          use: ['source-map-loader']
        }
      ]
    },
    output: {
      ...config.output,
      devtoolNamespace: 'testharness'
    }
  };
}

module.exports = config;
