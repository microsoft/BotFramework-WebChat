import { useCallback } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

const selectShouldSpeakIncomingActivity = ({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity;

export default function useShouldSpeakIncomingActivity(): [boolean, (value: boolean) => void] {
  const { startSpeakingActivity, stopSpeakingActivity } = useWebChatAPIContext();

  return [
    useSelector(selectShouldSpeakIncomingActivity),
    useCallback(
      value => {
        value ? startSpeakingActivity() : stopSpeakingActivity();
      },
      [startSpeakingActivity, stopSpeakingActivity]
    )
  ];
}
