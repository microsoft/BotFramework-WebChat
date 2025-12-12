import { useContext } from 'react';

import SpeechToSpeechContext from './Context';

import type { SpeechToSpeechContextType } from './Context';

export default function useSpeechToSpeechContext(thrownOnUndefined = true): SpeechToSpeechContextType {
  const contextValue = useContext(SpeechToSpeechContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <SpeechToSpeechContext>.');
  }

  return contextValue;
}
