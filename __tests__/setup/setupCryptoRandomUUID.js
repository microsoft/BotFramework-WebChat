import { v4 } from 'uuid';

if (!global.crypto?.randomUUID) {
  global.crypto = { ...global.crypto, randomUUID: v4 };
}
