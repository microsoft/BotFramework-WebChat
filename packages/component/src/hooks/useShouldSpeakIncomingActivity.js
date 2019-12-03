import { useCallback } from 'react';

import { useSelector } from '../WebChatReduxContext';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useShouldSpeakIncomingActivity() {
  const { startSpeakingActivity, stopSpeakingActivity } = useWebChatUIContext();

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
