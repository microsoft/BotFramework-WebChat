const fs = require("fs");
const path = require("path");
const { createTransformer } = require("babel-jest");

const stringifiedBabelOptions = fs.readFileSync(
  path.join(__dirname, ".babelrc"),
  "utf8"
);
const babelOptions = JSON.parse(stringifiedBabelOptions);
const transformer = createTransformer(babelOptions);

// Jest is supposed to use babel-jest to consume the .babelrc file in the root of the project,
// but for some reason it can't seem to locate the file, so we must manually load the .babelrc
// file in memory and create a transformer for it.

module.exports = transformer;
