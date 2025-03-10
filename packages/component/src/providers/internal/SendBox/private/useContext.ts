import { useContext } from 'react';

import Context from './Context';

import type { ContextType } from './types';

export default function useSendBoxContext(): ContextType {
  const context = useContext(Context);

  if (!context) {
    throw new Error('botframework-webchat internal: This hook can only be used under <SendBoxComposer>.');
  }

  return context;
}
