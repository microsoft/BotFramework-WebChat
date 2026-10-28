// Bundles ./src/index.js with the installed webpack (4 or 5) like a consumer app would: fails on errors, lists warnings.

const { resolve } = require('path');
const webpack = require('webpack');

// Multi-line messages need "%0A" in GitHub Actions annotations.
const annotate = (command, message) => console.log(`::${command}::${message.replace(/\n/gu, '%0A')}`);

console.log(`Bundling with webpack@${webpack.version} and react@${require('react/package.json').version}.`);

webpack(
  {
    entry: resolve(__dirname, 'src/index.js'),
    mode: 'production',
    module: {
      rules: webpack.version.startsWith('4.')
        ? [
            // Like create-react-app@4: webpack 4 cannot parse ES2020 (e.g. `?.`), so apps transpile node_modules too.
            {
              test: /\.m?js$/u,
              type: 'javascript/auto', // Lets .mjs import named exports from CommonJS.
              use: {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  configFile: false,
                  presets: [['@babel/preset-env', { modules: false, targets: 'chrome 70' }]],
                  sourceType: 'unambiguous'
                }
              }
            }
          ]
        : []
    },
    // "auto" (webpack 5 default) needs `document.currentScript` to load chunks, which jsdom does not set in load.js.
    output: { filename: 'main.js', path: resolve(__dirname, 'dist'), publicPath: '/' },
    performance: { hints: false }
  },
  (error, stats) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    // webpack 4 reports strings, webpack 5 reports objects.
    const { errors, warnings } = stats.toJson({ all: false, errors: true, warnings: true });
    const toString = entry => (typeof entry === 'string' ? entry : `${entry.moduleName || ''}\n${entry.message}`);

    warnings.forEach(warning => annotate('warning', toString(warning)));
    errors.forEach(error => annotate('error', toString(error)));

    console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);

    process.exit(errors.length ? 1 : 0);
  }
);
