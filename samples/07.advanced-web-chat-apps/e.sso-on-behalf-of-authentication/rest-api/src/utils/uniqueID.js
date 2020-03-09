/* eslint no-magic-numbers: ["error", { "ignore": [2, 36] }] */

const random = require('math-random');

module.exports = function uniqueID() {
  return (
    Date.now() +
    random()
      .toString(36)
      .substr(2)
  );
};
