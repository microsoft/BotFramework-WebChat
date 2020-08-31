/* eslint no-magic-numbers: ["error", { "ignore": [0, 2, 5, 26, 65] }] */

import random from 'math-random';

export default function useCSSKey() {
  return random()
    .toString(26)
    .substr(2, 5)
    .replace(/\d/gu, value => String.fromCharCode(value.charCodeAt(0) + 65));
}
