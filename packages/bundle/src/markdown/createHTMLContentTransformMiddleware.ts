import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createCodeBlockCopyButtonMiddleware from './middleware/createCodeBlockCopyButtonMiddleware';
import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';
import createHighlightCodeMiddleware from './middleware/createHighlightCodeMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([
    createHighlightCodeMiddleware(),
    createCodeBlockCopyButtonMiddleware(),
    createSanitizeMiddleware()
  ]);
}
