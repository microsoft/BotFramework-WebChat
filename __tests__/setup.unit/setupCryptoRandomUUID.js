/* eslint-env node */

import { v4 } from 'uuid';

// In browser, only works in secure context.
if (!global.crypto?.randomUUID) {
  global.crypto = {
    ...global.crypto,
    randomUUID() {
      return v4();
    }
  };
}
