// Since some packages are not transpiled to ES5, we need to transpile them to ES5 to run under IE11.
// As the transpilation will take about 30 seconds to complete, we don't want to toll on our current build.
// Instead of adding to normal build, we are adding to `npm run postinstall`, emitting to /lib/external/**/*.js.

const { join } = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    'external/@babel/plugin-proposal-async-generator-functions/index': join(
      __dirname,
      './external/@babel/plugin-proposal-async-generator-functions/index.js'
    ),
    'external/event-iterator/index': join(__dirname, './external/event-iterator/index.js'),
    'external/microsoft-cognitiveservices-speech-sdk/index': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/index.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/AudioSourceEvents': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/AudioSourceEvents.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Events': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Events.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/EventSource': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/EventSource.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Guid': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Guid.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Promise': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Promise.js'
    ),
    'external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Stream': join(
      __dirname,
      './external/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Stream.js'
    )
  },
  mode: 'development',
  module: {
    rules: [
      {
        exclude: [],
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  forceAllTransforms: true,
                  modules: 'commonjs'
                }
              ]
            ]
          }
        }
      }
    ]
  },
  // @babel/plugin-proposal-async-generator-functions is causing a false error because @babel/core import "fs" without the need to use it.
  // We are emptying out "fs" to ignore the error.
  node: { fs: 'empty' },
  output: {
    libraryTarget: 'commonjs2',
    path: join(__dirname, '../lib')
  }
};
