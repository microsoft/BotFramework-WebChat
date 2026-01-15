import { hooks } from 'botframework-webchat';
import { useMemo } from 'react';

const { useLocalizer, useSpeechToSpeech } = hooks;

export default function useSpeechPlaceholder(): string {
  const localize = useLocalizer();
  const [{ speechState }] = useSpeechToSpeech();
  return useMemo(() => {
    switch (speechState) {
      case 'idle':
        return localize('TEXT_INPUT_SPEECH_IDLE_PLACEHOLDER');

      case 'listening':
      case 'user_speaking':
        return localize('TEXT_INPUT_SPEECH_LISTENING_PLACEHOLDER');

      case 'processing':
        return localize('TEXT_INPUT_SPEECH_PROCESSING_PLACEHOLDER');

      case 'bot_speaking':
        return localize('TEXT_INPUT_SPEECH_BOT_SPEAKING_PLACEHOLDER');

      default:
        return localize('TEXT_INPUT_SPEECH_IDLE_PLACEHOLDER');
    }
  }, [speechState, localize]);
}
