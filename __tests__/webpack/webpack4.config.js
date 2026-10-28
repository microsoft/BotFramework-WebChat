// The webpack 4 workarounds from docs/HOSTING.md ("Bundling with webpack 4"), keep both the same: CI checks the documented ones.

const { sep } = require('path');

// Packages that ship syntax newer than ES2019 (e.g. `?.`, `#private`, `1_000`), which webpack 4 cannot parse.
const transpilePackages = [
  'botframework-webchat',
  'botframework-webchat-api',
  'botframework-webchat-component',
  'botframework-webchat-core',
  'botframework-webchat-fluent-theme',
  'event-as-promise',
  'htmlparser2',
  'iter-fest',
  'katex',
  'micromark-util-decode-numeric-character-reference',
  'micromark-util-sanitize-uri',
  'microsoft-cognitiveservices-speech-sdk',
  'mime',
  'react-dictate-button',
  'react-film',
  'swiper',
  'valibot',
  'web-speech-cognitive-services'
];

module.exports = {
  module: {
    rules: [
      // Lets .mjs import named exports from CommonJS, like create-react-app@4.
      { include: /node_modules/u, test: /\.mjs$/u, type: 'javascript/auto' },
      {
        // The innermost package in the path: "node_modules/react-film/node_modules/mime/…" is "mime".
        include: path => transpilePackages.includes(path.split(`${sep}node_modules${sep}`).pop().split(sep)[0]),
        test: /\.m?js$/u,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [['@babel/preset-env', { modules: false, targets: 'chrome 70' }]], // ES2018, which webpack 4 parses.
            sourceType: 'unambiguous'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      // Both resolve only through "exports" in package.json, which webpack 4 does not support.
      '@redux-devtools/extension$': '@redux-devtools/extension/lib/index.js',
      'botframework-webchat/schema.js$': 'botframework-webchat/dist/botframework-webchat.schema.js'
    }
  }
};
