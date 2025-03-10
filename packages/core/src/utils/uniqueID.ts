/* eslint no-magic-numbers: ["error", { "ignore": [2, 36] }] */

import random from 'math-random';

export default function uniqueID(): string {
  return random().toString(36).substring(2);
}
