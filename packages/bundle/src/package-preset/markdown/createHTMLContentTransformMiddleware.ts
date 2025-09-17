import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createCodeBlockMiddleware from './middleware/createCodeBlockMiddleware';
import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([createCodeBlockMiddleware(), createSanitizeMiddleware()]);
}
