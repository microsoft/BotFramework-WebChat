import { useContext } from 'react';

import TranscriptFocusContext from './Context';

export default function useTranscriptFocusContext(throwOnUndefined = true) {
  const contextValue = useContext(TranscriptFocusContext);

  if (throwOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <TranscriptFocusComposer>.');
  }

  return contextValue;
}
