import createSendStatusMiddleware from './createSendStatusMiddleware';
import createTimestampMiddleware from './createTimestampMiddleware';

export default function createCoreMiddleware() {
  return [createSendStatusMiddleware(), createTimestampMiddleware()];
}
