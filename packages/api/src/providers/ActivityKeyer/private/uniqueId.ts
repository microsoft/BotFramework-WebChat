import random from 'math-random';

// This format ID must be compatible with HTML "className" and "id" attribute.
// It will be suffixed as "webchat__activity--{id}".
export default function uniqueId(): string {
  // eslint-disable-next-line no-magic-numbers
  return random().toString(36).substring(2, 7);
}
