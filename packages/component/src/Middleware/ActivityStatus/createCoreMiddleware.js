import concatMiddleware from '../concatMiddleware';
import createSendStatusMiddleware from './createSendStatusMiddleware';
import createTimestampMiddleware from './createTimestampMiddleware';

export default function createCoreMiddleware() {
  return concatMiddleware(createSendStatusMiddleware(), createTimestampMiddleware());
}
