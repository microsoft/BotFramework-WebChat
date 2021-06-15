import { ActivityStatusMiddleware } from 'botframework-webchat-api';

import createSendStatusMiddleware from './createSendStatusMiddleware';
import createTimestampMiddleware from './createTimestampMiddleware';

export default function createCoreMiddleware(): ActivityStatusMiddleware[] {
  return [createSendStatusMiddleware(), createTimestampMiddleware()];
}
