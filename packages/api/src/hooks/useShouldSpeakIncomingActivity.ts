import { useSelector } from '@msinternal/botframework-webchat-redux-store';
import { useCallback } from 'react';

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
