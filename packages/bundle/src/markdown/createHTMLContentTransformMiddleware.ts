import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import createCodeBlockMiddleware from './middleware/createCodeBlockMiddleware';
import createRegistrationMiddleware from './middleware/registrationMiddleware';
import createSanitizeMiddleware from './middleware/createSanitizeMiddleware';

export default function createHTMLContentTransformMiddleware(): readonly HTMLContentTransformMiddleware[] {
  return Object.freeze([createCodeBlockMiddleware(), createRegistrationMiddleware(), createSanitizeMiddleware()]);
}
