import { type ComponentMiddleware } from 'react-chain-of-responsibility';

import { type InputModalityRequest } from '../types/InputModalityRequest';
import TextInput from './TextInput';

export default function createMiddleware(): ComponentMiddleware<InputModalityRequest> {
  return () => () => () => TextInput;
}
