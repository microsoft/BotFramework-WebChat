import { forRenderer } from '../../../api/src/hooks/middleware/applyMiddleware';

import createTextInputMiddleware from './TextInput/createMiddleware';
import createSpeechInputMiddleware from './SpeechInput/createMiddleware';

const middleware = forRenderer(
  'input modality',
  { strict: true },
  createTextInputMiddleware,
  createSpeechInputMiddleware
);

export default middleware;
