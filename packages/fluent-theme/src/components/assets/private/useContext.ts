import { type ContextOf } from 'botframework-webchat-api';
import { useContext as useReactContext } from 'react';

import Context from './Context';

export default function useContext(): ContextOf<typeof Context> {
  return useReactContext(Context);
}
