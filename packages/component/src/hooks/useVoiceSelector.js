import { useCallback } from 'react';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useVoiceSelector(activity) {
  const context = useWebChatUIContext();

  return useCallback(voices => context.selectVoice(voices, activity), [activity, context]);
}
