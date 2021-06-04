import { useCallback } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useShouldSpeakIncomingActivity(): [boolean, (value: boolean) => void] {
  const { startSpeakingActivity, stopSpeakingActivity } = useWebChatAPIContext();

  return [
    useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity),
    useCallback(
      value => {
        value ? startSpeakingActivity() : stopSpeakingActivity();
      },
      [startSpeakingActivity, stopSpeakingActivity]
    )
  ];
}
