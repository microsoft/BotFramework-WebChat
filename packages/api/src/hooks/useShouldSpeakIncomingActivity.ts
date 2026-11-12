import { useCallback } from 'react';

import { useShouldSpeakIncomingActivitySlice } from './internal/domains/SpeechSlices';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useShouldSpeakIncomingActivity(): [boolean, (value: boolean) => void] {
  const { startSpeakingActivity, stopSpeakingActivity } = useWebChatAPIContext();

  return [
    useShouldSpeakIncomingActivitySlice(),
    useCallback(
      value => {
        value ? startSpeakingActivity() : stopSpeakingActivity();
      },
      [startSpeakingActivity, stopSpeakingActivity]
    )
  ];
}
