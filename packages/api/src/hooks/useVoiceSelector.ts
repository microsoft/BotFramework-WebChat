import { useCallback } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useVoiceSelector(
  activity
): (voices: (typeof window.SpeechSynthesisVoice)[]) => typeof window.SpeechSynthesisVoice {
  const context = useWebChatAPIContext();

  return useCallback(voices => context.selectVoice(voices, activity), [activity, context]);
}
