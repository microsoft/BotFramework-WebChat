import { randomFillSync } from 'crypto';

// When microsoft-cognitiveservices-speech-sdk is loaded, it call "uuid" package to create a new GUID.
// "uuid" package requires crypto.getRandomValues().
if (!global.crypto?.getRandomValues) {
  global.crypto = { ...global.crypto, getRandomValues: randomFillSync };
}
