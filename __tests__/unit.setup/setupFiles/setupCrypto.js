/* eslint-env node */

import { randomFillSync } from 'crypto';
import { v4 } from 'uuid';

// When microsoft-cognitiveservices-speech-sdk is loaded, it call "uuid" package to create a new GUID.
// "uuid" package requires crypto.getRandomValues().
if (!global.crypto?.getRandomValues) {
  global.crypto = {
    ...global.crypto,
    getRandomValues: randomFillSync
  };
}

// In browser, only works in secure context.
if (!global.crypto?.randomUUID) {
  global.crypto = {
    ...global.crypto,
    randomUUID() {
      return v4();
    }
  };
}
