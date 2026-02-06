import { hooks } from 'botframework-webchat';
import { useMemo } from 'react';

const { useLocalizer, useVoiceState } = hooks;

export default function useSpeechPlaceholder(): string {
  const [voiceState] = useVoiceState();
  const localize = useLocalizer();

  return useMemo(() => {
    switch (voiceState) {
      case 'bot_speaking':
        return localize('TEXT_INPUT_SPEECH_BOT_SPEAKING_PLACEHOLDER');

      case 'idle':
        return localize('TEXT_INPUT_SPEECH_IDLE_PLACEHOLDER');

      case 'listening':
      case 'user_speaking':
        return localize('TEXT_INPUT_SPEECH_LISTENING_PLACEHOLDER');

      case 'muted':
        return localize('TEXT_INPUT_SPEECH_MUTED_PLACEHOLDER');

      case 'processing':
        return localize('TEXT_INPUT_SPEECH_PROCESSING_PLACEHOLDER');

      default:
        return localize('TEXT_INPUT_SPEECH_IDLE_PLACEHOLDER');
    }
  }, [voiceState, localize]);
}
