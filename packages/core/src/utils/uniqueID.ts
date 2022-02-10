/* eslint no-magic-numbers: ["error", { "ignore": [2, 36] }] */

import random from 'math-random';

export default function uniqueID(): string {
  return Date.now() + random().toString(36).substr(2);
}
