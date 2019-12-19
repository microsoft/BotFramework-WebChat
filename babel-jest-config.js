const { createTransformer } = require('babel-jest');
const { join, relative } = require('path');

const babelOptions = require(`./${relative(process.cwd(), join(__dirname || '', '.babelrc.js'))}`);

// Jest is supposed to use babel-jest to consume the .babelrc.js file in the root of the project,
// but for some reason it can't seem to locate the file, so we must manually load the .babelrc.js
// file in memory and create a transformer for it.

module.exports = createTransformer(babelOptions);
