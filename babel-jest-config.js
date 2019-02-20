const fs = require('fs');
const path = require('path');

const stringifiedBabelRc = fs.readFileSync(path.join(__dirname, '.babelrc')).toString();
const babelOptions = JSON.parse(stringifiedBabelRc);
const transformer = require('babel-jest');

const { createTransformer } = transformer;
const thisTransformer = createTransformer(babelOptions);

// Jest is supposed to use babel-jest to consume the .babelrc file in the root of the project,
// but for some reason it can't seem to locate the file, so we must manually load the .babelrc
// file in memory and create a transformer for it.
Object.assign(transformer, thisTransformer);
transformer.createTransformer = () => {
  return thisTransformer
};
module.exports = transformer;
