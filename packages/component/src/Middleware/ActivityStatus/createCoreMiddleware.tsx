import createSendStatusMiddleware from './createSendStatusMiddleware';
import createTimestampMiddleware from './createTimestampMiddleware';

import type { ActivityStatusMiddleware } from 'botframework-webchat-api';

export default function createCoreMiddleware(): ActivityStatusMiddleware[] {
  return [createSendStatusMiddleware(), createTimestampMiddleware()];
}
