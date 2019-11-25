import { useContext } from 'react';

import { useSelector } from '../WebChatReduxContext';
import WebChatUIContext from '../WebChatUIContext';

export default function useShouldSpeakIncomingActivity() {
  const { startSpeakingActivity, stopSpeakingActivity } = useContext(WebChatUIContext);

  return [
    useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity),
    value => {
      value ? startSpeakingActivity() : stopSpeakingActivity();
    }
  ];
}
