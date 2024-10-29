import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createCodeBlockCopyButtonMiddleware from './middleware/createCodeBlockCopyButtonMiddleware';
import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([createCodeBlockCopyButtonMiddleware(), createSanitizeMiddleware()]);
}
