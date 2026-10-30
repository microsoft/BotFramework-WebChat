// webpack's getting-started config, plus the webpack 4 workarounds from docs/HOSTING.md ("Bundling with webpack 4") from
// `const { sep }` on: keep them the same, CI tests them.
// Web Chat itself ships ES2019 and is deliberately not transpiled, so these legs fail if it starts shipping newer syntax.

const path = require('path');

const { version: reactDOMVersion } = require('react-dom/package.json');

const { sep } = require('path');

// Dependencies of Web Chat that ship syntax newer than ES2019 (e.g. `?.`, `#private`, `1_000`), which webpack 4 cannot parse.
const transpilePackages = [
  'event-as-promise',
  'htmlparser2',
  'iter-fest',
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
  // Without src/element.js: webpack 4 ignores "exports" in package.json, so it cannot import the ESM-only
  // "botframework-webchat/custom-element.js".
  entry: reactDOMVersion.startsWith('16.') ? './src/index.react16.js' : './src/index.js',
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
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
  }
};
