import { type ComponentMiddleware } from 'react-chain-of-responsibility';

import { type InputModalityRequest } from '../types/InputModalityRequest';
import SpeechInput from './SpeechInput';

export default function createMiddleware(): ComponentMiddleware<InputModalityRequest> {
  return () =>
    next =>
    ({ type }) =>
      type === 'speech' ? SpeechInput : next({ type });
}
