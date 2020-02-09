import random from 'math-random';

export default function randomId(maxLength = 5) {
  return random()
    .toString(36)
    .substr(2, maxLength);
}
