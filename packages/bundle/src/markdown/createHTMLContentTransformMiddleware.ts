import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';
import createCodeBlockMiddleware from './middleware/createCodeBlockMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([createCodeBlockMiddleware(), createSanitizeMiddleware()]);
}
