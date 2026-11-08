import { useCallback } from 'react';

import { useSpeechContext } from './internal/domains/SpeechContext';
import useSourceValue from './internal/domains/useSourceValue';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useShouldSpeakIncomingActivity(): [boolean, (value: boolean) => void] {
  const { startSpeakingActivity, stopSpeakingActivity } = useWebChatAPIContext();

  return [
    useSourceValue(useSpeechContext().shouldSpeakIncomingActivity),
    useCallback(
      value => {
        value ? startSpeakingActivity() : stopSpeakingActivity();
      },
      [startSpeakingActivity, stopSpeakingActivity]
    )
  ];
}
