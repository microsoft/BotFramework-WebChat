import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createCodeBlockMiddleware from './middleware/createCodeBlockMiddleware';
import createHeadingLevelMiddleware from './middleware/createHeadingLevelMiddleware';
import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([createHeadingLevelMiddleware(), createCodeBlockMiddleware(), createSanitizeMiddleware()]);
}
