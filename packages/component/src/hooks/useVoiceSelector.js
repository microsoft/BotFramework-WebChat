import { useCallback, useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useVoiceSelector(activity) {
  const context = useContext(WebChatUIContext);

  return useCallback(voices => context.selectVoice(voices, activity), [activity, context]);
}
