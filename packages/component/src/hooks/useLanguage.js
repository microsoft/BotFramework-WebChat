import useLocalizedStrings from './internal/useLocalizedStrings';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useLanguage(options) {
  const { language } = useWebChatUIContext();
  const localizedStrings = useLocalizedStrings();

  if (options === 'speech') {
    return [localizedStrings.SPEECH_LANGUAGE || language];
  }

  return [language];
}
