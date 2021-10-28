/* eslint no-magic-numbers: ["error", { "ignore": [2, 5, 36] }] */

import random from 'math-random';

export default function randomId(maxLength = 5): string {
  return random().toString(36).substr(2, maxLength);
}
